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
                cartId,
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

    // Récupérer un produit gratuit
// Récupérer un produit gratuit
    async claimFreeProduct(req, res, next) {
        try {
            const { productId } = req.params;
            const userId = req.user.id;

            await checkoutService.claimFreeProduct(userId, productId);

            res.json({ success: true, message: 'Produit ajouté à vos achats' });
        } catch (error) {
            if (error.message === 'Produit non trouvé') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'Ce produit n\'est pas gratuit' ||
                error.message === 'Vous possédez déjà ce produit') {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }
}

module.exports = new CheckoutController();