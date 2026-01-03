const cartService = require("../services/cart.service");
const checkoutService = require("../services/checkout.service");
const stripeService = require("../services/stripe.service");
const isUuid = require("../utils/isUuid");

class CheckoutController {
    // Créer une session de paiement
    async createCheckout(req, res, next) {
        try {
            const userId = req.user.id;

            if (!isUuid(userId)) {
                return res.status(400).json({ error: "Invalid user id" });
            }

            console.log("🚀 Checkout started for user:", userId);

            // Récupérer le panier
            const cartId = await cartService.getOrCreateCart(userId);
            const items = await checkoutService.getCheckoutItems(cartId);

            if (!items.length) {
                return res.status(400).json({ error: "Cart is empty" });
            }

            console.log("🛒 Cart ID:", cartId, "Items:", items.length);

            // Créer la session Stripe avec cart_id
            const session = await stripeService.createCheckoutSession({
                userId,
                cartId, // AJOUTÉ: passer le cartId
                items,
                successUrl: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${process.env.FRONTEND_URL}/cart`
            });

            res.json({ url: session.url });
        } catch (error) {
            console.error("Checkout error:", error);
            next(error);
        }
    }

    // Récupérer les achats de l'utilisateur
    async getUserPurchases(req, res, next) {
        try {
            const userId = req.user.id;
            const purchases = await checkoutService.getUserPurchases(userId);

            res.json({ purchases });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CheckoutController();