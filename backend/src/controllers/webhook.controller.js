const stripeService = require("../services/stripe.service");
const checkoutService = require("../services/checkout.service");
const sellerService = require("../services/seller.service");
const generateInvoiceNumber = require("../utils/generateInvoiceNumber");
const generateInvoicePdf = require("../utils/generateInvoicePdf");
const isUuid = require("../utils/isUuid");

class WebhookController {
    async handleStripeWebhook(req, res) {
        const sig = req.headers["stripe-signature"];
        let event;

        try {
            event = stripeService.constructWebhookEvent(req.body, sig);
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

        // Fallback: récupérer le dernier panier actif
        if (!cartId || !isUuid(cartId)) {
            console.warn("⚠️ cart_id missing or invalid, trying fallback");
            const cart = await checkoutService.getLastActiveCart(userId);

            if (!cart) {
                console.error("❌ No active cart found for webhook");
                return res.json({ received: true });
            }

            cartId = cart.id;
        }

        // Anti-double paiement
        const alreadyPaid = await checkoutService.isPaymentProcessed(session.id);
        if (alreadyPaid) {
            console.log("⚠️ Payment already processed");
            return res.json({ received: true });
        }

        // Récupérer les items du panier
        const items = await checkoutService.getCartItemsForWebhook(cartId);
        if (!items.length) {
            console.warn("⚠️ Cart empty at checkout");
            return res.json({ received: true });
        }

        try {
            // Créer le paiement
            const paymentId = await checkoutService.createPayment(
                session.id,
                userId,
                session.amount_total
            );

            // Créer la facture client
            const invoiceNumber = await generateInvoiceNumber();
            const invoiceId = await checkoutService.createInvoice(
                userId,
                paymentId,
                invoiceNumber,
                session.amount_total
            );

            // Récupérer l'acheteur
            const buyer = await checkoutService.getUser(userId);

            // Traiter chaque item
            for (const item of items) {
                // Créer l'achat
                await checkoutService.createPurchases(userId, [{
                    model_id: item.model_id,
                    price: Math.round(item.price * 100)
                }], session.id);

                // Ajouter à la facture client
                await checkoutService.addInvoiceItem(
                    invoiceId,
                    item.model_id,
                    item.title,
                    Math.round(item.price * 100)
                );

                // Traiter le vendeur (facture + paiement)
                await sellerService.processSeller(item, paymentId, session.payment_intent);
            }

            // Générer le PDF client
            const pdfPath = await generateInvoicePdf({
                invoiceNumber,
                user: buyer,
                items: items.map(i => ({
                    title: i.title,
                    price: Math.round(i.price)
                })),
                totalAmount: session.amount_total,
                createdAt: new Date()
            });

            await checkoutService.updateInvoicePdf(invoiceId, pdfPath);

            // Vider le panier
            await checkoutService.clearCartAfterPurchase(cartId);

            console.log("✅ Client + vendeurs payés + factures générées");
            res.json({ received: true });

        } catch (error) {
            console.error("❌ Webhook processing error:", error);
            res.status(500).json({ error: "Internal error" });
        }
    }
}

module.exports = new WebhookController();