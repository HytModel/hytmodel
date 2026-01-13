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
            } else if (metadata.type === "custom_order_first") {
                await this.handleCustomOrderFirstPayment(client, metadata, session);
            } else if (metadata.type === "custom_order_final") {
                await this.handleCustomOrderFinalPayment(client, metadata, session);
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

            const { rows: invoiceRows } = await client.query(
                `INSERT INTO invoices (user_id, invoice_number, total_amount, stripe_session_id)
                 VALUES ($1, $2, $3, $4)
                     RETURNING id`,
                [user_id, invoiceNumber, bundle.final_price, session.id]
            );

            const invoiceId = invoiceRows[0].id;

            const pdfPath = await generateInvoicePdf({
                invoiceNumber,
                user: {
                    username: user.username,
                    email: user.email
                },
                items: [{
                    title: `Bundle: ${bundle.title}`,
                    price: parseFloat(bundle.final_price)
                }],
                totalAmount: Math.round(parseFloat(bundle.final_price) * 100),
                createdAt: new Date()
            });

            await client.query(
                `UPDATE invoices SET pdf_path = $1 WHERE id = $2`,
                [pdfPath, invoiceId]
            );

            console.log(`📄 Invoice generated: ${invoiceNumber}`);
        } catch (pdfError) {
            console.error("Error generating invoice PDF:", pdfError);
        }

        // Générer la note de paiement pour le vendeur
        try {
            const { rows: creatorRows } = await client.query(
                `SELECT username, email, creator_type FROM users WHERE id = $1`,
                [bundle.creator_id]
            );
            const creator = creatorRows[0];

            // Déterminer le taux de commission selon le type de créateur
            // HytStudio: 0%, Affilié: 10%, Non-affilié: 15%
            let commissionRate;
            if (creator.creator_type === 'HYTSTUDIO') {
                commissionRate = 0;
            } else if (creator.creator_type === 'AFFILIATED') {
                commissionRate = 0.10;
            } else {
                commissionRate = 0.15;
            }

            const paymentNoteNumber = `PAY-B-${Date.now()}`;
            const grossAmountCents = Math.round(parseFloat(bundle.final_price) * 100);
            const commissionAmountCents = Math.round(grossAmountCents * commissionRate);
            const netAmountCents = grossAmountCents - commissionAmountCents;

            const { rows: paymentRows } = await client.query(
                `INSERT INTO seller_payments (seller_id, payment_number, gross_amount, commission_rate, commission_amount, net_amount, stripe_session_id, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
                     RETURNING id`,
                [bundle.creator_id, paymentNoteNumber, grossAmountCents / 100, commissionRate, commissionAmountCents / 100, netAmountCents / 100, session.id]
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
                commissionRate: commissionRate,
                creatorType: creator.creator_type,
                stripeTransferId: session.payment_intent,
                createdAt: new Date(),
                isBundle: true,
                bundleTitle: bundle.title,
                itemCount: items.length
            });

            await client.query(
                `UPDATE seller_payments SET pdf_path = $1 WHERE id = $2`,
                [pdfPath, paymentRows[0].id]
            );

            console.log(`💰 Seller payment note generated: ${paymentNoteNumber}`);

            // Mettre à jour les revenus du créateur (en euros)
            await client.query(
                `UPDATE users SET
                                  total_earnings = COALESCE(total_earnings, 0) + $1,
                                  total_commission = COALESCE(total_commission, 0) + $2,
                                  available_balance = COALESCE(available_balance, 0) + $3
                 WHERE id = $4`,
                [grossAmountCents / 100, commissionAmountCents / 100, netAmountCents / 100, bundle.creator_id]
            );
        } catch (paymentError) {
            console.error("Error generating seller payment PDF:", paymentError);
        }

        // Supprimer les produits du bundle du panier
        try {
            const itemIds = items.map(i => i.model_id);
            await client.query(
                `DELETE FROM cart_items
                 WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)
                   AND model_id = ANY($2)`,
                [user_id, itemIds]
            );
            console.log(`🛒 Removed ${itemIds.length} bundle items from cart`);
        } catch (cartError) {
            console.error("Error removing bundle items from cart:", cartError);
        }

        console.log(`✅ Bundle ${bundle_id} purchased successfully`);
    }

    // Achat d'un panier
    async handleCartPurchase(client, metadata, session) {
        const { user_id, model_ids } = metadata;
        const modelIds = JSON.parse(model_ids);

        console.log(`🛒 Processing cart purchase for user ${user_id}:`, modelIds);

        const purchasedItems = [];
        // Grouper les achats par vendeur pour générer une note par vendeur
        const sellerPayments = {}; // { seller_id: { seller, items: [], total: 0 } }

        for (const modelId of modelIds) {
            const { rows: modelRows } = await client.query(
                `SELECT m.id, m.title, m.price, m.creator_id,
                        u.username as creator_username, u.email as creator_email,
                        u.creator_type, u.stripe_account_id as creator_stripe_id
                 FROM models m
                          JOIN users u ON u.id = m.creator_id
                 WHERE m.id = $1`,
                [modelId]
            );

            if (!modelRows[0]) continue;

            const model = modelRows[0];

            await client.query(
                `INSERT INTO purchases (user_id, model_id, price_paid)
                 VALUES ($1, $2, $3)
                     ON CONFLICT (user_id, model_id) DO NOTHING`,
                [user_id, modelId, model.price]
            );

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

            // Grouper par vendeur
            if (!sellerPayments[model.creator_id]) {
                sellerPayments[model.creator_id] = {
                    seller: {
                        id: model.creator_id,
                        username: model.creator_username,
                        email: model.creator_email,
                        creator_type: model.creator_type,
                        stripe_account_id: model.creator_stripe_id
                    },
                    items: [],
                    total: 0
                };
            }
            sellerPayments[model.creator_id].items.push(model.title);
            sellerPayments[model.creator_id].total += parseFloat(model.price);
        }

        // Vider le panier
        await client.query(
            `DELETE FROM cart_items WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)`,
            [user_id]
        );

        // Générer la facture pour l'acheteur
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

            const pdfPath = await generateInvoicePdf({
                invoiceNumber,
                user: { username: user.username, email: user.email },
                items: purchasedItems,
                totalAmount: Math.round(totalAmountEuros * 100),
                createdAt: new Date()
            });

            await client.query(
                `UPDATE invoices SET pdf_path = $1 WHERE id = $2`,
                [pdfPath, invoiceRows[0].id]
            );

            console.log(`📄 Invoice generated: ${invoiceNumber}`);
        } catch (pdfError) {
            console.error("Error generating invoice PDF:", pdfError);
        }

        // Générer les notes de paiement pour chaque vendeur
        for (const sellerId of Object.keys(sellerPayments)) {
            const sellerData = sellerPayments[sellerId];

            try {
                // Déterminer le taux de commission selon le type de créateur
                let commissionRate;
                if (sellerData.seller.creator_type === 'HYTSTUDIO') {
                    commissionRate = 0;
                } else if (sellerData.seller.creator_type === 'AFFILIATED') {
                    commissionRate = 0.10;
                } else {
                    commissionRate = 0.15;
                }

                const paymentNoteNumber = `PAY-C-${Date.now()}`;
                const grossAmountCents = Math.round(sellerData.total * 100);
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
                        username: sellerData.seller.username,
                        email: sellerData.seller.email
                    },
                    grossAmount: grossAmountCents,
                    commissionAmount: commissionAmountCents,
                    netAmount: netAmountCents,
                    commissionRate: commissionRate,
                    creatorType: sellerData.seller.creator_type,
                    stripeTransferId: session.payment_intent,
                    createdAt: new Date()
                });

                await client.query(
                    `UPDATE seller_payments SET pdf_path = $1 WHERE id = $2`,
                    [pdfPath, paymentRows[0].id]
                );

                console.log(`💰 Seller payment note generated for ${sellerData.seller.username}: ${paymentNoteNumber} (${sellerData.items.length} items, ${(commissionRate * 100)}% commission)`);

                // Mettre à jour les revenus du créateur (en euros)
                await client.query(
                    `UPDATE users SET
                                      total_earnings = COALESCE(total_earnings, 0) + $1,
                                      total_commission = COALESCE(total_commission, 0) + $2,
                                      available_balance = COALESCE(available_balance, 0) + $3
                     WHERE id = $4`,
                    [grossAmountCents / 100, commissionAmountCents / 100, netAmountCents / 100, sellerId]
                );

                // Transfert Stripe Connect si configuré
                if (sellerData.seller.stripe_account_id && netAmountCents > 0) {
                    try {
                        await stripe.transfers.create({
                            amount: netAmountCents,
                            currency: "eur",
                            destination: sellerData.seller.stripe_account_id,
                            transfer_group: `cart_${session.id}_${sellerId}`
                        });
                        console.log(`✅ Transfer to ${sellerData.seller.username} completed: ${(netAmountCents / 100).toFixed(2)}€`);
                    } catch (transferError) {
                        console.error(`Stripe transfer error for seller ${sellerId}:`, transferError);
                    }
                }
            } catch (paymentError) {
                console.error(`Error generating seller payment for ${sellerId}:`, paymentError);
            }
        }

        console.log(`✅ Cart purchase completed for user ${user_id}`);
    }

    // Achat simple d'un modèle
    async handleModelPurchase(client, metadata, session) {
        const { user_id, model_id } = metadata;

        if (!model_id) return;

        console.log(`🎁 Processing model purchase: ${model_id} for user ${user_id}`);

        const { rows: modelRows } = await client.query(
            `SELECT m.id, m.title, m.price, m.creator_id,
                    u.username as creator_username, u.email as creator_email,
                    u.creator_type, u.stripe_account_id as creator_stripe_id
             FROM models m
                      JOIN users u ON u.id = m.creator_id
             WHERE m.id = $1`,
            [model_id]
        );

        if (!modelRows[0]) {
            console.error("Model not found:", model_id);
            return;
        }

        const model = modelRows[0];

        await client.query(
            `INSERT INTO purchases (user_id, model_id, price_paid)
             VALUES ($1, $2, $3)
                 ON CONFLICT (user_id, model_id) DO NOTHING`,
            [user_id, model_id, model.price]
        );

        // Générer la facture pour l'acheteur
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

            const pdfPath = await generateInvoicePdf({
                invoiceNumber,
                user: { username: user.username, email: user.email },
                items: [{ title: model.title, price: parseFloat(model.price) }],
                totalAmount: Math.round(parseFloat(model.price) * 100),
                createdAt: new Date()
            });

            await client.query(
                `UPDATE invoices SET pdf_path = $1 WHERE id = $2`,
                [pdfPath, invoiceRows[0].id]
            );

            console.log(`📄 Invoice generated: ${invoiceNumber}`);
        } catch (pdfError) {
            console.error("Error generating invoice PDF:", pdfError);
        }

        // Générer la note de paiement pour le vendeur
        try {
            // Déterminer le taux de commission selon le type de créateur
            // HytStudio: 0%, Affilié: 10%, Non-affilié: 15%
            let commissionRate;
            if (model.creator_type === 'HYTSTUDIO') {
                commissionRate = 0;
            } else if (model.creator_type === 'AFFILIATED') {
                commissionRate = 0.10;
            } else {
                commissionRate = 0.15;
            }

            const paymentNoteNumber = `PAY-${Date.now()}`;
            const grossAmountCents = Math.round(parseFloat(model.price) * 100);
            const commissionAmountCents = Math.round(grossAmountCents * commissionRate);
            const netAmountCents = grossAmountCents - commissionAmountCents;

            const { rows: paymentRows } = await client.query(
                `INSERT INTO seller_payments (seller_id, payment_number, gross_amount, commission_rate, commission_amount, net_amount, stripe_session_id, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')
                     RETURNING id`,
                [model.creator_id, paymentNoteNumber, grossAmountCents / 100, commissionRate, commissionAmountCents / 100, netAmountCents / 100, session.id]
            );

            const pdfPath = await generateSellerNotePdf({
                invoiceNumber: paymentNoteNumber,
                seller: {
                    username: model.creator_username,
                    email: model.creator_email
                },
                grossAmount: grossAmountCents,
                commissionAmount: commissionAmountCents,
                netAmount: netAmountCents,
                commissionRate: commissionRate,
                creatorType: model.creator_type,
                stripeTransferId: session.payment_intent,
                createdAt: new Date()
            });

            await client.query(
                `UPDATE seller_payments SET pdf_path = $1 WHERE id = $2`,
                [pdfPath, paymentRows[0].id]
            );

            console.log(`💰 Seller payment note generated: ${paymentNoteNumber} (${(commissionRate * 100)}% commission)`);

            // Mettre à jour les revenus du créateur (en euros)
            await client.query(
                `UPDATE users SET
                                  total_earnings = COALESCE(total_earnings, 0) + $1,
                                  total_commission = COALESCE(total_commission, 0) + $2,
                                  available_balance = COALESCE(available_balance, 0) + $3
                 WHERE id = $4`,
                [grossAmountCents / 100, commissionAmountCents / 100, netAmountCents / 100, model.creator_id]
            );

            // Transfert Stripe Connect si configuré
            if (model.creator_stripe_id && netAmountCents > 0) {
                try {
                    await stripe.transfers.create({
                        amount: netAmountCents,
                        currency: "eur",
                        destination: model.creator_stripe_id,
                        transfer_group: `model_${model_id}`
                    });
                    console.log(`✅ Transfer to creator completed: ${(netAmountCents / 100).toFixed(2)}€`);
                } catch (transferError) {
                    console.error("Stripe transfer error:", transferError);
                }
            }
        } catch (paymentError) {
            console.error("Error generating seller payment:", paymentError);
        }

        console.log(`✅ Model ${model_id} purchased successfully`);
    }

    // Premier paiement commande sur mesure (50%)
    async handleCustomOrderFirstPayment(client, metadata, session) {
        const { order_id, user_id } = metadata;

        console.log(`🎨 Processing custom order first payment: ${order_id}`);

        const { rows } = await client.query(
            `SELECT co.*, cr.title as request_title,
                    creator.username as creator_username, creator.id as creator_id
             FROM custom_orders co
                      JOIN custom_requests cr ON cr.id = co.request_id
                      JOIN users creator ON creator.id = co.creator_id
             WHERE co.id = $1 AND co.client_id = $2 AND co.status = 'AWAITING_PAYMENT'`,
            [order_id, user_id]
        );

        if (!rows[0]) {
            console.error("Custom order not found or already paid:", order_id);
            return;
        }

        const order = rows[0];

        // Mettre à jour la commande
        await client.query(
            `UPDATE custom_orders
             SET first_payment_paid = TRUE,
                 first_payment_date = NOW(),
                 first_payment_stripe_id = $2,
                 status = 'IN_PROGRESS'
             WHERE id = $1`,
            [order_id, session.payment_intent]
        );

        // Mettre à jour la demande
        await client.query(
            `UPDATE custom_requests SET status = 'IN_PROGRESS'
             WHERE id = (SELECT request_id FROM custom_orders WHERE id = $1)`,
            [order_id]
        );

        // Message système - CORRIGÉ: diviser par 100 pour afficher en euros
        const amountInEuros = (Number(order.first_payment_amount) / 100).toFixed(2);
        await client.query(
            `INSERT INTO custom_order_messages (order_id, sender_id, message_type, content, attachments)
             VALUES ($1, $2, 'SYSTEM', $3, '[]')`,
            [order_id, user_id, `💳 Acompte de ${amountInEuros}€ reçu ! Le créateur peut commencer le travail.`]
        );

        // Notification au créateur
        await client.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                order.creator_id,
                'CUSTOM_ORDER_PAID',
                'Paiement reçu ! 💰',
                `L'acompte pour "${order.request_title}" a été payé. Vous pouvez commencer le travail !`,
                JSON.stringify({ order_id: order_id, link: `/custom-orders/orders/${order_id}` })
            ]
        );

        // Générer la facture - CORRIGÉ: diviser par 100 pour les euros
        try {
            const { rows: userRows } = await client.query(
                `SELECT username, email FROM users WHERE id = $1`,
                [user_id]
            );
            const user = userRows[0];

            const invoiceNumber = `INV-CO-${Date.now()}`;
            const amountPaidCentimes = parseFloat(order.first_payment_amount);
            const amountPaidEuros = amountPaidCentimes / 100;

            const { rows: invoiceRows } = await client.query(
                `INSERT INTO invoices (user_id, invoice_number, total_amount, stripe_session_id)
                 VALUES ($1, $2, $3, $4)
                     RETURNING id`,
                [user_id, invoiceNumber, amountPaidEuros, session.id]
            );

            const pdfPath = await generateInvoicePdf({
                invoiceNumber,
                user: { username: user.username, email: user.email },
                items: [{
                    title: `Commande sur mesure: ${order.request_title} (Acompte 50%)`,
                    price: amountPaidEuros
                }],
                totalAmount: Math.round(amountPaidCentimes), // Centimes pour le PDF
                createdAt: new Date()
            });

            await client.query(
                `UPDATE invoices SET pdf_path = $1 WHERE id = $2`,
                [pdfPath, invoiceRows[0].id]
            );

            console.log(`📄 Invoice generated for first payment: ${invoiceNumber}`);
        } catch (pdfError) {
            console.error("Error generating invoice PDF:", pdfError);
        }

        console.log(`✅ Custom order ${order_id} first payment completed - Work can begin!`);
    }

    // Paiement final commande sur mesure (50%)
    async handleCustomOrderFinalPayment(client, metadata, session) {
        const { order_id, user_id } = metadata;

        console.log(`🎨 Processing custom order final payment: ${order_id}`);

        const { rows } = await client.query(
            `SELECT co.*, cr.title as request_title,
                    creator.username as creator_username, creator.email as creator_email,
                    creator.stripe_account_id as creator_stripe_id,
                    creator.creator_type as creator_type
             FROM custom_orders co
                      JOIN custom_requests cr ON cr.id = co.request_id
                      JOIN users creator ON creator.id = co.creator_id
             WHERE co.id = $1 AND co.client_id = $2 AND co.status = 'AWAITING_FINAL_PAYMENT'`,
            [order_id, user_id]
        );

        if (!rows[0]) {
            console.error("Custom order not found or not ready for final payment:", order_id);
            return;
        }

        const order = rows[0];

        // Mettre à jour la commande
        await client.query(
            `UPDATE custom_orders
             SET second_payment_paid = TRUE,
                 second_payment_date = NOW(),
                 second_payment_stripe_id = $2,
                 status = 'COMPLETED',
                 completed_at = NOW()
             WHERE id = $1`,
            [order_id, session.payment_intent]
        );

        // Mettre à jour la demande
        await client.query(
            `UPDATE custom_requests SET status = 'COMPLETED' WHERE id = $1`,
            [order.request_id]
        );

        // Incrémenter les commandes du créateur
        await client.query(
            `UPDATE affiliated_creators
             SET completed_orders = completed_orders + 1
             WHERE user_id = $1`,
            [order.creator_id]
        );

        // Message système - CORRIGÉ: diviser par 100 pour afficher en euros
        const amountInEuros = (Number(order.second_payment_amount) / 100).toFixed(2);
        await client.query(
            `INSERT INTO custom_order_messages (order_id, sender_id, message_type, content, attachments)
             VALUES ($1, $2, 'SYSTEM', $3, '[]')`,
            [order_id, user_id, `💳 Paiement final de ${amountInEuros}€ reçu ! Commande terminée. 🎉`]
        );

        // Notification au créateur
        await client.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                order.creator_id,
                'CUSTOM_ORDER_COMPLETED',
                'Commande terminée ! 🎉',
                `La commande "${order.request_title}" est terminée. Le paiement a été traité.`,
                JSON.stringify({ order_id: order_id, link: `/custom-orders/orders/${order_id}` })
            ]
        );

        // Calculer le montant créateur - CORRIGÉ: tout est en centimes dans la DB
        const totalPaidCentimes = parseFloat(order.first_payment_amount) + parseFloat(order.second_payment_amount);
        const commissionAmountCentimes = parseFloat(order.commission_amount);
        const creatorAmountCentimes = totalPaidCentimes - commissionAmountCentimes;

        // Convertir en euros pour les logs et Stripe
        const totalPaidEuros = totalPaidCentimes / 100;
        const commissionAmountEuros = commissionAmountCentimes / 100;
        const creatorAmountEuros = creatorAmountCentimes / 100;

        console.log(`💰 Creator payment: ${creatorAmountEuros.toFixed(2)}€ (commission: ${commissionAmountEuros.toFixed(2)}€)`);

        // Transfert Stripe Connect si configuré - Stripe attend des centimes
        if (order.creator_stripe_id) {
            try {
                await stripe.transfers.create({
                    amount: Math.round(creatorAmountCentimes), // Déjà en centimes
                    currency: "eur",
                    destination: order.creator_stripe_id,
                    transfer_group: `custom_order_${order_id}`
                });
                console.log(`✅ Transfer to creator completed: ${creatorAmountEuros.toFixed(2)}€`);
            } catch (transferError) {
                console.error("Stripe transfer error:", transferError);
            }
        }

        // Enregistrer le paiement vendeur - Stocker en euros dans seller_payments
        try {
            const paymentNoteNumber = `PAY-CO-${Date.now()}`;

            const { rows: paymentRows } = await client.query(
                `INSERT INTO seller_payments
                 (seller_id, payment_number, gross_amount, commission_rate, commission_amount, net_amount, stripe_session_id, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'PAID')
                     RETURNING id`,
                [order.creator_id, paymentNoteNumber, totalPaidEuros, order.commission_rate, commissionAmountEuros, creatorAmountEuros, session.id]
            );

            const pdfPath = await generateSellerNotePdf({
                invoiceNumber: paymentNoteNumber,
                seller: { username: order.creator_username, email: order.creator_email },
                grossAmount: Math.round(totalPaidCentimes), // Centimes pour le PDF
                commissionAmount: Math.round(commissionAmountCentimes),
                netAmount: Math.round(creatorAmountCentimes),
                commissionRate: parseFloat(order.commission_rate), // 0 pour HYTSTUDIO, 0.05 pour AFFILIATED
                creatorType: order.creator_type, // 'HYTSTUDIO' ou 'AFFILIATED'
                stripeTransferId: session.payment_intent,
                createdAt: new Date(),
                isCustomOrder: true,
                orderTitle: order.request_title
            });

            await client.query(
                `UPDATE seller_payments SET pdf_path = $1 WHERE id = $2`,
                [pdfPath, paymentRows[0].id]
            );

            console.log(`💰 Seller payment recorded: ${paymentNoteNumber}`);

            // Mettre à jour les revenus du créateur (en euros)
            await client.query(
                `UPDATE users SET
                                  total_earnings = COALESCE(total_earnings, 0) + $1,
                                  total_commission = COALESCE(total_commission, 0) + $2,
                                  available_balance = COALESCE(available_balance, 0) + $3
                 WHERE id = $4`,
                [totalPaidCentimes / 100, commissionAmountCentimes / 100, creatorAmountCentimes / 100, order.creator_id]
            );
        } catch (paymentError) {
            console.error("Error recording seller payment:", paymentError);
        }

        // Générer la facture finale - CORRIGÉ: diviser par 100 pour les euros
        try {
            const { rows: userRows } = await client.query(
                `SELECT username, email FROM users WHERE id = $1`,
                [user_id]
            );
            const user = userRows[0];

            const invoiceNumber = `INV-CO-FINAL-${Date.now()}`;
            const amountPaidCentimes = parseFloat(order.second_payment_amount);
            const amountPaidEuros = amountPaidCentimes / 100;

            const { rows: invoiceRows } = await client.query(
                `INSERT INTO invoices (user_id, invoice_number, total_amount, stripe_session_id)
                 VALUES ($1, $2, $3, $4)
                     RETURNING id`,
                [user_id, invoiceNumber, amountPaidEuros, session.id]
            );

            const pdfPath = await generateInvoicePdf({
                invoiceNumber,
                user: { username: user.username, email: user.email },
                items: [{
                    title: `Commande sur mesure: ${order.request_title} (Solde 50%)`,
                    price: amountPaidEuros
                }],
                totalAmount: Math.round(amountPaidCentimes), // Centimes pour le PDF
                createdAt: new Date()
            });

            await client.query(
                `UPDATE invoices SET pdf_path = $1 WHERE id = $2`,
                [pdfPath, invoiceRows[0].id]
            );

            console.log(`📄 Invoice generated for final payment: ${invoiceNumber}`);
        } catch (pdfError) {
            console.error("Error generating final invoice PDF:", pdfError);
        }

        console.log(`✅ Custom order ${order_id} completed!`);
    }
}

module.exports = new WebhookController();