const router = require("express").Router();
const pool = require("../db/pool");
const { requireAuth } = require("../middlewares/requireAuth");
const { getOrCreateCart } = require("../utils/getCart");
const isUuid = require("../utils/isUuid");
/**
 * ➕ Ajouter au panier
 */
router.post("/add/:modelId", requireAuth, async (req, res) => {
    // 🔒 SÉCURITÉ UUID (ICI)
    if (!isUuid(req.user.id)) {
        return res.status(400).json({ error: "Invalid user id" });
    }

    if (!isUuid(req.params.modelId)) {
        return res.status(400).json({ error: "Invalid model id" });
    }

    const userId = req.user.id;
    const modelId = req.params.modelId;

    const cartId = await getOrCreateCart(userId);

    // Vérifier modèle valide
    const { rows } = await pool.query(
        `
            SELECT id, creator_id, price
            FROM models
            WHERE id = $1
              AND status = 'APPROVED'
              AND deleted_at IS NULL
              AND is_hidden = FALSE
        `,
        [modelId]
    );
    if (!rows.length) {
        return res.status(404).json({ error: "Model not available" });
    }

    if (rows[0].creator_id === userId) {
        return res.status(400).json({ error: "You cannot buy your own model" });
    }

    // Ajouter au panier
    await pool.query(
        `
    INSERT INTO cart_items (cart_id, model_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    `,
        [cartId, modelId]
    );

    res.json({ success: true });
});

/**
 * 📋 Voir le panier
 */
router.get("/", requireAuth, async (req, res) => {
    const userId = req.user.id;
    const cartId = await getOrCreateCart(userId);

    const { rows } = await pool.query(
        `
    SELECT
      m.id,
      m.title,
      m.price
    FROM cart_items ci
    JOIN models m ON m.id = ci.model_id
    WHERE ci.cart_id = $1
    `,
        [cartId]
    );

    const total = rows.reduce(
        (sum, item) => sum + Number(item.price),
        0
    );

    res.json({
        items: rows,
        total: total.toFixed(2)
    });
});

/**
 * ❌ Retirer un modèle du panier
 */
router.delete("/remove/:modelId", requireAuth, async (req, res) => {
    const userId = req.user.id;
    const modelId = req.params.modelId;
    const cartId = await getOrCreateCart(userId);

    await pool.query(
        "DELETE FROM cart_items WHERE cart_id = $1 AND model_id = $2",
        [cartId, modelId]
    );

    res.json({ success: true });
});

/**
 * 🧹 Vider le panier
 */
router.delete("/clear", requireAuth, async (req, res) => {
    const cartId = await getOrCreateCart(req.user.id);

    await pool.query(
        "DELETE FROM cart_items WHERE cart_id = $1",
        [cartId]
    );

    res.json({ success: true });
});

module.exports = router;