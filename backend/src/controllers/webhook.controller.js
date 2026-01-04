const pool = require("../db/pool");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const generateInvoicePdf = require("../utils/generateInvoicePdf");
const generateSellerNotePdf = require("../utils/generateSellerInvoicePdf");

class WebhookController {
    async handleStripeWebhook(req, res) {
        const sig = req.headers["stripe-signature"];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err) {
            console.error("⚠️ Webhook signature verification failed:", err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Gérer les différents types d'événements
        switch (event.type) {
            case "checkout.session.completed":
                await this.handleCheckoutComplete(event.data.object);
                break;
            case "payment_intent.succeeded":
                console.log("💰 Payment succeeded:", event.data.object.id);
                break;
            case "payment_intent.payment_failed":
                console.log("❌ Payment failed:", event.data.object.id);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    }

    async handleCheckoutComplete(session) {
        console.log("✅ Checkout completed:", session.id);

        const metadata = session.metadata;

        if (!metadata) {
            console.error("No metadata in session");
            return;
        }

        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            // Vérifier le type d'achat
            if (metadata.type === "bundle") {
                await this.handleBundlePurchase(client, metadata, session);
            } else if (metadata.type === "cart") {
                await this.handleCartPurchase(client, metadata, session);
            } else {
                // Achat simple d'un modèle
                await this.handleModelPurchase(client, metadata, session);
            }

            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            console.error("Error processing checkout:", error);
            throw error;
        } finally {
            client.release();
        }
    }

    // Achat d'un bundle
    async handleBundlePurchase(client, metadata, session) {
        const { bundle_id, user_id } = metadata;

        console.log(`📦 Processing bundle purchase: ${bundle_id} for user ${user_id}`);

        // Vérifier que l'achat n'existe pas déjà
        const { rows: existing } = await client.query(
            `SELECT id FROM bundle_purchases WHERE bundle_id = $1 AND user_id = $2`,
            [bundle_id, user_id]
        );

        if (existing.length > 0) {
            console.log("Bundle already purchased");
            return;
        }

        // Récupérer le bundle avec les infos
        const { rows: bundleRows } = await client.query(
            `SELECT b.*, u.username as creator_username
             FROM bundles b
                      JOIN users u ON u.id = b.creator_id
             WHERE b.id = $1`,
            [bundle_id]
        );

        if (!bundleRows[0]) {
            console.error("Bundle not found:", bundle_id);
            return;
        }

        const bundle = bundleRows[0];

        // Enregistrer l'achat du bundle
        const { rows: purchaseRows } = await client.query(
            `INSERT INTO bundle_purchases (bundle_id, user_id, price_paid, stripe_session_id)
             VALUES ($1, $2, $3, $4)
                 RETURNING id, purchased_at`,
            [bundle_id, user_id, bundle.final_price, session.id]
        );

        const bundlePurchase = purchaseRows[0];

        // Récupérer les produits du bundle
        const { rows: items } = await client.query(
            `SELECT bi.model_id, m.title, m.price
             FROM bundle_items bi
                      JOIN models m ON m.id = bi.model_id
             WHERE bi.bundle_id = $1`,
            [bundle_id]
        );

        // Vérifier quels produits l'utilisateur possède déjà
        const { rows: ownedProducts } = await client.query(
            `SELECT model_id FROM purchases WHERE user_id = $1 AND model_id = ANY($2)`,
            [user_id, items.map(i => i.model_id)]
        );

        const ownedIds = ownedProducts.map(p => p.model_id);

        // Ajouter les produits non possédés aux achats
        for (const item of items) {
            if (!ownedIds.includes(item.model_id)) {
                await client.query(
                    `INSERT INTO purchases (user_id, model_id, price_paid)
                     VALUES ($1, $2, 0)
                         ON CONFLICT (user_id, model_id) DO NOTHING`,
                    [user_id, item.model_id]
                );
            }
        }

        // Récupérer les infos utilisateur pour la facture
        const { rows: userRows } = await client.query(
            `SELECT username, email FROM users WHERE id = $1`,
            [user_id]
        );
        const user = userRows[0];

        // Générer la facture PDF pour l'acheteur
        try {
            const invoiceNumber = `INV-B-${Date.now()}`;

            // Créer l'entrée facture
            const { rows: invoiceRows } = await client.query(
                `INSERT INTO invoices (user_id, invoice_number, total_amount, stripe_session_id)
                 VALUES ($1, $2, $3, $4)
                     RETURNING id`,
                [user_id, invoiceNumber, bundle.final_price, session.id]
            );

            const invoiceId = invoiceRows[0].id;

            // Générer le PDF avec le bon format
            const pdfPath = await generateInvoicePdf({
                invoiceNumber,
                user: {
                    username: user.username,
                    email: user.email
                },
                items: [{
                    title: `Bundle: ${bundle.title}`,
                    price: parseFloat(bundle.final_price) // en euros
                }],
                totalAmount: Math.round(parseFloat(bundle.final_price) * 100), // en centimes
                createdAt: new Date()
            });

            // Mettre à jour la facture avec le chemin du PDF
            await client.query(
                `UPDATE invoices SET pdf_path = $1 WHERE id = $2`,
                [pdfPath, invoiceId]
            );

            console.log(`📄 Invoice generated: ${invoiceNumber}`);
        } catch (pdfError) {
            console.error("Error generating invoice PDF:", pdfError);
            // Ne pas faire échouer la transaction si le PDF échoue
        }

        // Générer la note de paiement pour le vendeur
        try {
            const { rows: creatorRows } = await client.query(
                `SELECT username, email FROM users WHERE id = $1`,
                [bundle.creator_id]
            );
            const creator = creatorRows[0];

            const paymentNoteNumber = `PAY-B-${Date.now()}`;
            const commissionRate = 0.15; // 15% de commission
            const grossAmountCents = Math.round(parseFloat(bundle.final_price) * 100);
            const commissionAmountCents = Math.round(grossAmountCents * commissionRate);
            const netAmountCents = grossAmountCents - commissionAmountCents;

            // Créer l'entrée note de paiement vendeur
            const { rows: paymentRows } = await client.query(
                `INSERT INTO seller_payments (seller_id, payment_number, gross_amount, commission_rate, commission_amount, net_amount, stripe_session_id, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
                     RETURNING id`,
                [bundle.creator_id, paymentNoteNumber, grossAmountCents / 100, commissionRate, commissionAmountCents / 100, netAmountCents / 100, session.id]
            );

            // Générer le PDF vendeur avec ton format
            const pdfPath = await generateSellerNotePdf({
                invoiceNumber: paymentNoteNumber,
                seller: {
                    username: creator.username,
                    email: creator.email
                },
                grossAmount: grossAmountCents,
                commissionAmount: commissionAmountCents,
                netAmount: netAmountCents,
                stripeTransferId: session.payment_intent,
                createdAt: new Date(),
                // Infos bundle
                isBundle: true,
                bundleTitle: bundle.title,
                itemCount: items.length
            });

            // Mettre à jour avec le chemin du PDF
            await client.query(
                `UPDATE seller_payments SET pdf_path = $1 WHERE id = $2`,
                [pdfPath, paymentRows[0].id]
            );

            console.log(`💰 Seller payment note generated: ${paymentNoteNumber}`);
        } catch (paymentError) {
            console.error("Error generating seller payment PDF:", paymentError);
        }

        console.log(`✅ Bundle ${bundle_id} purchased successfully`);
    }

    // Achat d'un panier (plusieurs modèles)
    async handleCartPurchase(client, metadata, session) {
        const { user_id, model_ids } = metadata;
        const modelIds = JSON.parse(model_ids);

        console.log(`🛒 Processing cart purchase for user ${user_id}:`, modelIds);

        const purchasedItems = [];

        for (const modelId of modelIds) {
            // Récupérer le prix du modèle
            const { rows: modelRows } = await client.query(
                `SELECT id, title, price, creator_id FROM models WHERE id = $1`,
                [modelId]
            );

            if (!modelRows[0]) continue;

            const model = modelRows[0];

            // Enregistrer l'achat
            await client.query(
                `INSERT INTO purchases (user_id, model_id, price_paid)
                 VALUES ($1, $2, $3)
                     ON CONFLICT (user_id, model_id) DO NOTHING`,
                [user_id, modelId, model.price]
            );

            // Mettre à jour les stats du modèle
            await client.query(
                `INSERT INTO model_stats (model_id, downloads)
                 VALUES ($1, 0)
                     ON CONFLICT (model_id) DO NOTHING`,
                [modelId]
            );

            purchasedItems.push({
                title: model.title,
                price: parseFloat(model.price)
            });
        }

        // Vider le panier
        await client.query(
            `DELETE FROM cart_items WHERE user_id = $1`,
            [user_id]
        );

        // Générer la facture
        try {
            const { rows: userRows } = await client.query(
                `SELECT username, email FROM users WHERE id = $1`,
                [user_id]
            );
            const user = userRows[0];

            const invoiceNumber = `INV-${Date.now()}`;
            const totalAmountEuros = purchasedItems.reduce((sum, item) => sum + item.price, 0);

            const { rows: invoiceRows } = await client.query(
                `INSERT INTO invoices (user_id, invoice_number, total_amount, stripe_session_id)
                 VALUES ($1, $2, $3, $4)
                     RETURNING id`,
                [user_id, invoiceNumber, totalAmountEuros, session.id]
            );

            const invoiceId = invoiceRows[0].id;

            const pdfPath = await generateInvoicePdf({
                invoiceNumber,
                user: {
                    username: user.username,
                    email: user.email
                },
                items: purchasedItems,
                totalAmount: Math.round(totalAmountEuros * 100), // en centimes
                createdAt: new Date()
            });

            await client.query(
                `UPDATE invoices SET pdf_path = $1 WHERE id = $2`,
                [pdfPath, invoiceId]
            );

            console.log(`📄 Invoice generated: ${invoiceNumber}`);

            // Générer les notes de paiement pour chaque vendeur
            const sellerPayments = {};

            for (const modelId of modelIds) {
                const { rows: modelInfo } = await client.query(
                    `SELECT m.title, m.price, m.creator_id, u.username, u.email
                     FROM models m
                              JOIN users u ON u.id = m.creator_id
                     WHERE m.id = $1`,
                    [modelId]
                );

                if (modelInfo[0]) {
                    const info = modelInfo[0];
                    if (!sellerPayments[info.creator_id]) {
                        sellerPayments[info.creator_id] = {
                            seller: { name: info.username, email: info.email },
                            items: [],
                            grossAmount: 0
                        };
                    }
                    sellerPayments[info.creator_id].items.push({
                        title: info.title,
                        description: `Vendu à ${user.username}`,
                        price: parseFloat(info.price)
                    });
                    sellerPayments[info.creator_id].grossAmount += parseFloat(info.price);
                }
            }

            // Créer une note de paiement par vendeur
            for (const [sellerId, payment] of Object.entries(sellerPayments)) {
                const paymentNoteNumber = `PAY-${Date.now()}-${sellerId.slice(0, 8)}`;
                const commissionRate = 0.15;
                const grossAmountCents = Math.round(payment.grossAmount * 100);
                const commissionAmountCents = Math.round(grossAmountCents * commissionRate);
                const netAmountCents = grossAmountCents - commissionAmountCents;

                const { rows: paymentRows } = await client.query(
                    `INSERT INTO seller_payments (seller_id, payment_number, gross_amount, commission_rate, commission_amount, net_amount, stripe_session_id, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
                         RETURNING id`,
                    [sellerId, paymentNoteNumber, grossAmountCents / 100, commissionRate, commissionAmountCents / 100, netAmountCents / 100, session.id]
                );

                const pdfPath = await generateSellerNotePdf({
                    invoiceNumber: paymentNoteNumber,
                    seller: {
                        username: payment.seller.name,
                        email: payment.seller.email
                    },
                    grossAmount: grossAmountCents,
                    commissionAmount: commissionAmountCents,
                    netAmount: netAmountCents,
                    stripeTransferId: session.payment_intent,
                    createdAt: new Date()
                });

                await client.query(
                    `UPDATE seller_payments SET pdf_path = $1 WHERE id = $2`,
                    [pdfPath, paymentRows[0].id]
                );

                console.log(`💰 Seller payment note generated: ${paymentNoteNumber}`);
            }
        } catch (pdfError) {
            console.error("Error generating invoice PDF:", pdfError);
        }

        console.log(`✅ Cart purchase completed for user ${user_id}`);
    }

    // Achat simple d'un modèle
    async handleModelPurchase(client, metadata, session) {
        const { user_id, model_id } = metadata;

        if (!model_id) return;

        console.log(`🎁 Processing model purchase: ${model_id} for user ${user_id}`);

        // Récupérer le prix du modèle
        const { rows: modelRows } = await client.query(
            `SELECT title, price FROM models WHERE id = $1`,
            [model_id]
        );

        if (!modelRows[0]) {
            console.error("Model not found:", model_id);
            return;
        }

        const model = modelRows[0];

        // Enregistrer l'achat
        await client.query(
            `INSERT INTO purchases (user_id, model_id, price_paid)
             VALUES ($1, $2, $3)
                 ON CONFLICT (user_id, model_id) DO NOTHING`,
            [user_id, model_id, model.price]
        );

        // Générer la facture
        try {
            const { rows: userRows } = await client.query(
                `SELECT username, email FROM users WHERE id = $1`,
                [user_id]
            );
            const user = userRows[0];

            const invoiceNumber = `INV-${Date.now()}`;

            const { rows: invoiceRows } = await client.query(
                `INSERT INTO invoices (user_id, invoice_number, total_amount, stripe_session_id)
                 VALUES ($1, $2, $3, $4)
                     RETURNING id`,
                [user_id, invoiceNumber, model.price, session.id]
            );

            const invoiceId = invoiceRows[0].id;

            const pdfPath = await generateInvoicePdf({
                invoiceNumber,
                user: {
                    username: user.username,
                    email: user.email
                },
                items: [{
                    title: model.title,
                    price: parseFloat(model.price)
                }],
                totalAmount: Math.round(parseFloat(model.price) * 100), // en centimes
                createdAt: new Date()
            });

            await client.query(
                `UPDATE invoices SET pdf_path = $1 WHERE id = $2`,
                [pdfPath, invoiceId]
            );

            console.log(`📄 Invoice generated: ${invoiceNumber}`);

            // Générer la note de paiement pour le vendeur
            const { rows: creatorRows } = await client.query(
                `SELECT m.creator_id, u.username, u.email
                 FROM models m
                          JOIN users u ON u.id = m.creator_id
                 WHERE m.id = $1`,
                [model_id]
            );

            if (creatorRows[0]) {
                const creator = creatorRows[0];
                const paymentNoteNumber = `PAY-${Date.now()}`;
                const commissionRate = 0.15;
                const grossAmountCents = Math.round(parseFloat(model.price) * 100);
                const commissionAmountCents = Math.round(grossAmountCents * commissionRate);
                const netAmountCents = grossAmountCents - commissionAmountCents;

                const { rows: paymentRows } = await client.query(
                    `INSERT INTO seller_payments (seller_id, payment_number, gross_amount, commission_rate, commission_amount, net_amount, stripe_session_id, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
                         RETURNING id`,
                    [creator.creator_id, paymentNoteNumber, grossAmountCents / 100, commissionRate, commissionAmountCents / 100, netAmountCents / 100, session.id]
                );

                const pdfPath = await generateSellerNotePdf({
                    invoiceNumber: paymentNoteNumber,
                    seller: {
                        username: creator.username,
                        email: creator.email
                    },
                    grossAmount: grossAmountCents,
                    commissionAmount: commissionAmountCents,
                    netAmount: netAmountCents,
                    stripeTransferId: session.payment_intent,
                    createdAt: new Date()
                });

                await client.query(
                    `UPDATE seller_payments SET pdf_path = $1 WHERE id = $2`,
                    [pdfPath, paymentRows[0].id]
                );

                console.log(`💰 Seller payment note generated: ${paymentNoteNumber}`);
            }
        } catch (pdfError) {
            console.error("Error generating invoice PDF:", pdfError);
        }

        console.log(`✅ Model ${model_id} purchased successfully`);
    }
}

module.exports = new WebhookController();