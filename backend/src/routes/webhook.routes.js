const router = require("express").Router();
const Stripe = require("stripe");
const pool = require("../db/pool");

const generateInvoiceNumber = require("../utils/generateInvoiceNumber");
const generateInvoicePdf = require("../utils/generateInvoicePdf");
const generateSellerInvoicePdf = require("../utils/generateSellerInvoicePdf");
const isUuid = require("../utils/isUuid");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// =======================================
// 🔔 STRIPE WEBHOOK
// =======================================
router.post("/stripe", async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("❌ Webhook signature error:", err.message);
        return res.status(400).send("Webhook Error");
    }

    if (event.type !== "checkout.session.completed") {
        return res.json({ received: true });
    }

    const session = event.data.object;
    const userId = session.metadata.user_id;
    let cartId = session.metadata.cart_id;

    if (!isUuid(userId)) {
        console.error("❌ Invalid user_id in metadata");
        return res.json({ received: true });
    }

// cart_id peut être absent dans certains cas Stripe
    if (!cartId || !isUuid(cartId)) {
        console.warn("⚠️ cart_id missing or invalid, trying fallback");

        // 🔁 FALLBACK : récupérer le dernier panier non checkout
        const { rows } = await pool.query(
            `
        SELECT id
        FROM carts
        WHERE user_id = $1
          AND checked_out = FALSE
        ORDER BY created_at DESC
        LIMIT 1
        `,
            [userId]
        );

        if (!rows.length) {
            console.error("❌ No active cart found for webhook");
            return res.json({ received: true });
        }

        cartId = rows[0].id;
    }


    // =======================================
    // 🔁 ANTI DOUBLE PAIEMENT
    // =======================================
    const alreadyPaid = await pool.query(
        "SELECT 1 FROM payments WHERE stripe_session_id = $1",
        [session.id]
    );

    if (alreadyPaid.rowCount > 0) {
        return res.json({ received: true });
    }

    // =======================================
    // 🛒 ITEMS DU PANIER (SOURCE UNIQUE)
    // =======================================
    const { rows: items } = await pool.query(
        `
        SELECT
            m.id AS model_id,
            m.title,
            m.price,
            m.creator_id
        FROM cart_items ci
        JOIN models m ON m.id = ci.model_id
        WHERE ci.cart_id = $1
        `,
        [cartId]
    );

    if (!items.length) {
        console.warn("⚠️ Cart empty at checkout");
        return res.json({ received: true });
    }

    // =======================================
    // 💳 PAIEMENT CLIENT
    // =======================================
    const { rows: paymentRows } = await pool.query(
        `
            INSERT INTO payments (stripe_session_id, user_id, amount)
            VALUES ($1, $2, $3)
                RETURNING id
        `,
        [session.id, userId, session.amount_total]
    );

    const paymentId = paymentRows[0].id;

    // =======================================
    // 📄 FACTURE CLIENT
    // =======================================
    const invoiceNumber = await generateInvoiceNumber();

    const { rows: invoiceRows } = await pool.query(
        `
            INSERT INTO invoices (user_id, payment_id, invoice_number, total_amount)
            VALUES ($1, $2, $3, $4)
                RETURNING id
        `,
        [userId, paymentId, invoiceNumber, session.amount_total]
    );

    const invoiceId = invoiceRows[0].id;

    // 👤 CLIENT
    const { rows: buyerRows } = await pool.query(
        "SELECT username, email FROM users WHERE id = $1",
        [userId]
    );
    const buyer = buyerRows[0];

    // =======================================
    // 🔄 PAR ITEM (VENDEUR PAR VENDEUR)
    // =======================================
    for (const item of items) {

        // 🛒 Achat
        await pool.query(
            `
                INSERT INTO purchases (user_id, model_id)
                VALUES ($1, $2)
                    ON CONFLICT DO NOTHING
            `,
            [userId, item.model_id]
        );

        // 📄 Ligne facture client
        await pool.query(
            `
                INSERT INTO invoice_items (invoice_id, model_id, title, price)
                VALUES ($1, $2, $3, $4)
            `,
            [invoiceId, item.model_id, item.title, Math.round(item.price * 100)]
        );

        // ===================================
        // 💸 VENDEUR
        // ===================================
        const { rows: sellerRows } = await pool.query(
            `
                SELECT
                    u.id,
                    u.username,
                    u.email,
                    u.stripe_account_id,
                    COALESCE(u.is_affiliated, FALSE) AS is_affiliated
                FROM users u
                WHERE u.id = $1
            `,
            [item.creator_id]
        );


        if (!sellerRows.length) continue;

        const seller = sellerRows[0];

        const priceCents = Math.round(item.price * 100);
        const commissionRate = seller.is_affiliated ? 0.10 : 0.15;
        const commission = Math.round(priceCents * commissionRate);
        const sellerAmount = priceCents - commission;

        if (!seller.stripe_account_id) {
            console.warn("⚠️ Seller has no Stripe account:", seller.id);
        }


        // 🧾 FACTURE VENDEUR
        const sellerInvoiceNumber = `HMT-PAY-${new Date().getFullYear()}-${Date.now()}`;

        const sellerPdfPath = await generateSellerInvoicePdf({
            invoiceNumber: sellerInvoiceNumber,
            seller,
            grossAmount: priceCents,
            commissionAmount: commission,
            netAmount: sellerAmount,
            stripeTransferId: null,
            createdAt: new Date()
        });

        await pool.query(
            `
                INSERT INTO seller_invoices
                (seller_id, invoice_number, gross_amount, commission_amount, net_amount, pdf_path)
                VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [
                seller.id,
                sellerInvoiceNumber,
                priceCents,
                commission,
                sellerAmount,
                sellerPdfPath
            ]
        );

        // 💸 STRIPE CONNECT
        if (seller.stripe_account_id) {
            const transfer = await stripe.transfers.create({
                amount: sellerAmount,
                currency: "eur",
                destination: seller.stripe_account_id,
                source_transaction: session.payment_intent
            });

            await pool.query(
                `
                    INSERT INTO seller_payouts
                    (seller_id, payment_id, model_id, amount, commission, stripe_transfer_id)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `,
                [
                    seller.id,
                    paymentId,
                    item.model_id,
                    sellerAmount,
                    commission,
                    transfer.id
                ]
            );
        }
    }

    // =======================================
    // 📄 PDF CLIENT
    // =======================================
    const pdfPath = await generateInvoicePdf({
        invoiceNumber,
        user: buyer,
        items: items.map(i => ({
            title: i.title,
            price: Math.round(i.price * 100)
        })),
        totalAmount: session.amount_total,
        createdAt: new Date()
    });

    await pool.query(
        "UPDATE invoices SET pdf_path = $1 WHERE id = $2",
        [pdfPath, invoiceId]
    );

    console.log("✅ Client + vendeurs payés + factures générées");
    res.json({ received: true });
});

module.exports = router;
