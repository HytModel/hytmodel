const pool = require("../db/pool");

class CheckoutService {
    // Récupérer les items du panier pour le checkout
    async getCheckoutItems(cartId) {
        const { rows } = await pool.query(
            `SELECT m.id, m.title, m.price
             FROM cart_items ci
             JOIN models m ON m.id = ci.model_id
             WHERE ci.cart_id = $1
               AND m.status = 'APPROVED'
               AND m.deleted_at IS NULL
               AND m.is_hidden = FALSE`,
            [cartId]
        );
        return rows;
    }

    // Créer les achats après paiement réussi
    async createPurchases(userId, items, stripeSessionId) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Créer les purchases
            for (const item of items) {
                await client.query(
                    `INSERT INTO purchases (user_id, model_id, stripe_session_id)
                     VALUES ($1, $2, $3)
                         ON CONFLICT (user_id, model_id) DO NOTHING`,
                    [userId, item.model_id, stripeSessionId]
                );
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Vider le panier après achat
    async clearCartAfterPurchase(cartId) {
        await pool.query(
            "DELETE FROM cart_items WHERE cart_id = $1",
            [cartId]
        );
    }

    // Vérifier si une session a déjà été traitée
    async isSessionProcessed(stripeSessionId) {
        const { rowCount } = await pool.query(
            "SELECT 1 FROM purchases WHERE stripe_session_id = $1 LIMIT 1",
            [stripeSessionId]
        );
        return rowCount > 0;
    }

    // Récupérer les achats d'un utilisateur
    async getUserPurchases(userId) {
        const { rows } = await pool.query(
            `SELECT p.id, p.model_id, p.created_at,
                    m.title, m.price, m.file_path
             FROM purchases p
                      JOIN models m ON m.id = p.model_id
             WHERE p.user_id = $1
             ORDER BY p.created_at DESC`,
            [userId]
        );
        return rows;
    }
    // Vérifier si le paiement a déjà été traité
    async isPaymentProcessed(stripeSessionId) {
        const { rowCount } = await pool.query(
            "SELECT 1 FROM payments WHERE stripe_session_id = $1",
            [stripeSessionId]
        );
        return rowCount > 0;
    }

    // Récupérer les items du panier pour le webhook
    async getCartItemsForWebhook(cartId) {
        const { rows } = await pool.query(
            `SELECT m.id AS model_id, m.title, m.price, m.creator_id
             FROM cart_items ci
             JOIN models m ON m.id = ci.model_id
             WHERE ci.cart_id = $1`,
            [cartId]
        );
        return rows;
    }

    // Créer un paiement
    async createPayment(stripeSessionId, userId, amount) {
        const { rows } = await pool.query(
            `INSERT INTO payments (stripe_session_id, user_id, amount)
             VALUES ($1, $2, $3)
             RETURNING id`,
            [stripeSessionId, userId, amount]
        );
        return rows[0].id;
    }

    // Créer une facture
    async createInvoice(userId, paymentId, invoiceNumber, totalAmount) {
        const { rows } = await pool.query(
            `INSERT INTO invoices (user_id, payment_id, invoice_number, total_amount)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [userId, paymentId, invoiceNumber, totalAmount]
        );
        return rows[0].id;
    }

    // Ajouter un item à la facture
    async addInvoiceItem(invoiceId, modelId, title, price) {
        await pool.query(
            `INSERT INTO invoice_items (invoice_id, model_id, title, price)
             VALUES ($1, $2, $3, $4)`,
            [invoiceId, modelId, title, price]
        );
    }

    // Mettre à jour le PDF de la facture
    async updateInvoicePdf(invoiceId, pdfPath) {
        await pool.query(
            "UPDATE invoices SET pdf_path = $1 WHERE id = $2",
            [pdfPath, invoiceId]
        );
    }

    // Récupérer un utilisateur
    async getUser(userId) {
        const { rows } = await pool.query(
            "SELECT username, email FROM users WHERE id = $1",
            [userId]
        );
        return rows[0];
    }

    // Récupérer le dernier panier actif (fallback)
    async getLastActiveCart(userId) {
        const { rows } = await pool.query(
            `SELECT id FROM carts
             WHERE user_id = $1 AND checked_out = FALSE
             ORDER BY created_at DESC
             LIMIT 1`,
            [userId]
        );
        return rows[0] || null;
    }
}

module.exports = new CheckoutService();