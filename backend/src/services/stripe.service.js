const Stripe = require("stripe");

class StripeService {
    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }

    // Créer une session de paiement
    async createCheckoutSession(data) {
        const { userId, cartId, items, successUrl, cancelUrl } = data;

        // Préparer les line_items pour Stripe
        const line_items = items.map(item => ({
            price_data: {
                currency: "eur",
                product_data: { name: item.title },
                unit_amount: Math.round(Number(item.price) * 100)
            },
            quantity: 1
        }));

        // Extraire les model_ids pour le webhook
        const modelIds = items.map(i => i.id);

        const session = await this.stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items,
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                type: "cart", // IMPORTANT: type pour le webhook
                user_id: userId,
                cart_id: cartId,
                model_ids: JSON.stringify(modelIds) // Liste des IDs pour le webhook
            }
        });

        return session;
    }

    // Récupérer une session
    async getSession(sessionId) {
        return await this.stripe.checkout.sessions.retrieve(sessionId);
    }

    // Vérifier la signature du webhook
    constructWebhookEvent(payload, signature) {
        return this.stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    }

    // Créer un remboursement
    async createRefund(paymentIntentId, amount) {
        return await this.stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount // en centimes
        });
    }
}

module.exports = new StripeService();