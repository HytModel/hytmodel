const router = require("express").Router();
const Stripe = require("stripe");
const pool = require("../db/pool");
const generateInvoiceNumber = require("../utils/generateInvoiceNumber");
const generateInvoicePdf = require("../utils/generateInvoicePdf");
const isUuid = require("../utils/isUuid");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/stripe", async (req, res) => {
    console.log("🔔 WEBHOOK HIT");

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
        return res.status(400).send(`Webhook Error`);
    }

    console.log("📦 Event:", event.type);

    if (event.type !== "checkout.session.completed") {
        return res.json({ received: true });
    }

    const session = event.data.object;

    const userId = session.metadata.user_id;
    const items = JSON.parse(session.metadata.items || "[]");

    if (!isUuid(userId) || !items.length) {
        console.error("❌ Invalid metadata");
        return res.json({ received: true });
    }

    // 🔁 Anti double paiement
    const alreadyPaid = await pool.query(
        "SELECT 1 FROM payments WHERE stripe_session_id = $1",
        [session.id]
    );

    if (alreadyPaid.rowCount > 0) {
        console.log("⚠️ Already processed");
        return res.json({ received: true });
    }

    // 💳 Paiement
    const { rows: paymentRows } = await pool.query(
        `
    INSERT INTO payments (stripe_session_id, user_id, amount)
    VALUES ($1, $2, $3)
    RETURNING id
    `,
        [session.id, userId, session.amount_total]
    );

    const paymentId = paymentRows[0].id;

    // 📄 Facture
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

    // 📦 Lignes + achats
    for (const item of items) {
        await pool.query(
            `INSERT INTO purchases (user_id, model_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [userId, item.model_id]
        );

        await pool.query(
            `
      INSERT INTO invoice_items (invoice_id, model_id, title, price)
      VALUES ($1, $2, $3, $4)
      `,
            [invoiceId, item.model_id, item.title, item.price]
        );
    }

    // 🔍 Récupérer le user (OBLIGATOIRE POUR FACTURE)
    const { rows: userRows } = await pool.query(
        `
  SELECT username, email
  FROM users
  WHERE id = $1
  `,
        [userId]
    );

    if (!userRows.length) {
        console.error("❌ User not found for invoice");
        return res.json({ received: true });
    }

    const user = userRows[0];

    // 🧾 PDF
    const pdfPath = await generateInvoicePdf({
        invoiceNumber,
        user: {
            username: user.username,
            email: user.email
        },
        items: items.map(i => ({
            title: i.title,
            price: Math.round(Number(i.price) * 100)
        })),
        totalAmount: session.amount_total,
        createdAt: new Date()
    });

    await pool.query(
        "UPDATE invoices SET pdf_path = $1 WHERE id = $2",
        [pdfPath, invoiceId]
    );

    console.log("✅ Invoice fully created:", invoiceNumber);

    res.json({ received: true });
});

module.exports = router;
