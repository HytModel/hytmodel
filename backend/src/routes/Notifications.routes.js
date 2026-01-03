const router = require("express").Router();
const pool = require("../db/pool");
const { requireAuth } = require("../middlewares/requireAuth");

// Récupérer mes notifications
router.get("/", requireAuth, async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT * FROM notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [req.user.id]
        );

        // Compter les non lues
        const { rows: countRows } = await pool.query(
            `SELECT COUNT(*) as count FROM notifications 
             WHERE user_id = $1 AND is_read = FALSE`,
            [req.user.id]
        );

        res.json({
            notifications: rows,
            unreadCount: Number(countRows[0].count)
        });
    } catch (error) {
        next(error);
    }
});

// Marquer une notification comme lue
router.put("/:id/read", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        await pool.query(
            `UPDATE notifications 
             SET is_read = TRUE 
             WHERE id = $1 AND user_id = $2`,
            [id, req.user.id]
        );

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// Marquer toutes les notifications comme lues
router.put("/read-all", requireAuth, async (req, res, next) => {
    try {
        await pool.query(
            `UPDATE notifications 
             SET is_read = TRUE 
             WHERE user_id = $1 AND is_read = FALSE`,
            [req.user.id]
        );

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// Supprimer une notification
router.delete("/:id", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        await pool.query(
            `DELETE FROM notifications 
             WHERE id = $1 AND user_id = $2`,
            [id, req.user.id]
        );

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// Supprimer toutes les notifications lues
router.delete("/", requireAuth, async (req, res, next) => {
    try {
        await pool.query(
            `DELETE FROM notifications 
             WHERE user_id = $1 AND is_read = TRUE`,
            [req.user.id]
        );

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

module.exports = router;