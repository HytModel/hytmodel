const pool = require("../db/pool");

class CartService {
    // Récupérer ou créer un panier
    async getOrCreateCart(userId) {
        const { rows } = await pool.query(
            `INSERT INTO carts (user_id)
             VALUES ($1)
             ON CONFLICT (user_id) DO UPDATE SET user_id = $1
             RETURNING id`,
            [userId]
        );
        return rows[0].id;
    }

    // Vérifier si un modèle est disponible à l'achat
    async getAvailableModel(modelId) {
        const { rows } = await pool.query(
            `SELECT id, creator_id, price, title
             FROM models
             WHERE id = $1
               AND status = 'APPROVED'
               AND deleted_at IS NULL
               AND is_hidden = FALSE`,
            [modelId]
        );
        return rows[0] || null;
    }

    // Vérifier si l'utilisateur possède déjà ce modèle
    async userOwnsModel(userId, modelId) {
        const { rowCount } = await pool.query(
            "SELECT 1 FROM purchases WHERE user_id = $1 AND model_id = $2",
            [userId, modelId]
        );
        return rowCount > 0;
    }

    // Ajouter un item au panier
    async addToCart(cartId, modelId) {
        await pool.query(
            `INSERT INTO cart_items (cart_id, model_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [cartId, modelId]
        );
    }

    // Récupérer les items du panier
    async getCartItems(cartId) {
        const { rows } = await pool.query(
            `SELECT m.id, m.title, m.price
             FROM cart_items ci
             JOIN models m ON m.id = ci.model_id
             WHERE ci.cart_id = $1`,
            [cartId]
        );
        return rows;
    }

    // Calculer le total
    calculateTotal(items) {
        return items.reduce((sum, item) => sum + Number(item.price), 0);
    }

    // Retirer un item du panier
    async removeFromCart(cartId, modelId) {
        await pool.query(
            "DELETE FROM cart_items WHERE cart_id = $1 AND model_id = $2",
            [cartId, modelId]
        );
    }

    // Vider le panier
    async clearCart(cartId) {
        await pool.query(
            "DELETE FROM cart_items WHERE cart_id = $1",
            [cartId]
        );
    }

    // Vérifier si un item est dans le panier
    async isInCart(cartId, modelId) {
        const { rowCount } = await pool.query(
            "SELECT 1 FROM cart_items WHERE cart_id = $1 AND model_id = $2",
            [cartId, modelId]
        );
        return rowCount > 0;
    }
}

module.exports = new CartService();