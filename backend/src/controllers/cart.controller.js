const cartService = require("../services/cart.service");
const isUuid = require("../utils/isUuid");

class CartController {
    // Ajouter au panier
    async addToCart(req, res, next) {
        try {
            const userId = req.user.id;
            const modelId = req.params.modelId;

            // Validation UUID
            if (!isUuid(userId)) {
                return res.status(400).json({ error: "Invalid user id" });
            }

            if (!isUuid(modelId)) {
                return res.status(400).json({ error: "Invalid model id" });
            }

            // Récupérer ou créer le panier
            const cartId = await cartService.getOrCreateCart(userId);

            // Vérifier que le modèle existe et est disponible
            const model = await cartService.getAvailableModel(modelId);
            if (!model) {
                return res.status(404).json({ error: "Model not available" });
            }

            // Interdire d'acheter son propre modèle
            if (model.creator_id === userId) {
                return res.status(400).json({ error: "You cannot buy your own model" });
            }

            // Vérifier si déjà acheté
            const alreadyOwned = await cartService.userOwnsModel(userId, modelId);
            if (alreadyOwned) {
                return res.status(400).json({ error: "You already own this model" });
            }

            // Ajouter au panier
            await cartService.addToCart(cartId, modelId);

            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    // Voir le panier
    async getCart(req, res, next) {
        try {
            const userId = req.user.id;
            const cartId = await cartService.getOrCreateCart(userId);

            const items = await cartService.getCartItems(cartId);
            const total = cartService.calculateTotal(items);

            res.json({
                items,
                total: total.toFixed(2)
            });
        } catch (error) {
            next(error);
        }
    }

    // Retirer un item
    async removeFromCart(req, res, next) {
        try {
            const userId = req.user.id;
            const modelId = req.params.modelId;

            if (!isUuid(modelId)) {
                return res.status(400).json({ error: "Invalid model id" });
            }

            const cartId = await cartService.getOrCreateCart(userId);
            await cartService.removeFromCart(cartId, modelId);

            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    // Vider le panier
    async clearCart(req, res, next) {
        try {
            const userId = req.user.id;
            const cartId = await cartService.getOrCreateCart(userId);

            await cartService.clearCart(cartId);

            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CartController();