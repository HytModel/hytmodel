const router = require("express").Router();
const adminController = require("../controllers/admin.controller");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");
const pool = require("../db/pool");

// Changer le rôle d'un utilisateur
router.post(
    "/set-role",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    adminController.setUserRole
);

// Lister tous les utilisateurs
router.get(
    "/users",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    adminController.getAllUsers
);

// Récupérer un utilisateur
router.get(
    "/users/:id",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    adminController.getUserById
);

// Bannir un utilisateur
router.post(
    "/users/:id/ban",
    requireAuth,
    requireRole("ADMIN"),
    adminController.banUser
);

// Débannir un utilisateur
router.post(
    "/users/:id/unban",
    requireAuth,
    requireRole("ADMIN"),
    adminController.unbanUser
);

// Supprimer un utilisateur
router.delete(
    "/users/:id",
    requireAuth,
    requireRole("ADMIN"),
    adminController.deleteUser
);

// Statistiques globales
router.get(
    "/stats",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    adminController.getGlobalStats
);

// Modèles en attente d'approbation
router.get(
    "/models/pending",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    adminController.getPendingModels
);

// Tous les modèles (pour admin)
router.get('/models/all', requireAuth, requireRole('STAFF', 'ADMIN'), async (req, res, next) => {
    try {
        const { rows } = await pool.query(`
            SELECT m.*, u.username AS creator_username
            FROM models m
                     LEFT JOIN users u ON u.id = m.creator_id
            WHERE m.deleted_at IS NULL
            ORDER BY m.created_at DESC
        `);
        res.json({ models: rows });
    } catch (error) {
        next(error);
    }
});

// ============ DEMANDES CRÉATEUR ============

// Liste des demandes en attente
router.get('/creator-requests', requireAuth, requireRole('STAFF', 'ADMIN'), async (req, res, next) => {
    try {
        const { rows } = await pool.query(`
            SELECT cr.*, u.username, u.email
            FROM creator_requests cr
                     JOIN users u ON u.id = cr.user_id
            WHERE cr.status = 'PENDING'
            ORDER BY cr.created_at ASC
        `);
        res.json({ requests: rows });
    } catch (error) {
        next(error);
    }
});

// Approuver une demande
router.post('/creator-requests/:id/approve', requireAuth, requireRole('STAFF', 'ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;

        // Récupérer la demande
        const { rows } = await pool.query('SELECT user_id FROM creator_requests WHERE id = $1', [id]);
        if (!rows[0]) return res.status(404).json({ error: 'Request not found' });

        // Mettre à jour le rôle de l'utilisateur
        await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['CREATOR', rows[0].user_id]);

        // Mettre à jour la demande
        await pool.query(`
            UPDATE creator_requests
            SET status = 'APPROVED', reviewed_at = NOW(), reviewed_by = $1
            WHERE id = $2
        `, [req.user.id, id]);

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// Rejeter une demande
router.post('/creator-requests/:id/reject', requireAuth, requireRole('STAFF', 'ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        await pool.query(`
            UPDATE creator_requests
            SET status = 'REJECTED', rejection_reason = $1, reviewed_at = NOW(), reviewed_by = $2
            WHERE id = $3
        `, [reason, req.user.id, id]);

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// ============ VENDEURS ============

// Liste des vendeurs avec stats
router.get('/sellers', requireAuth, requireRole('STAFF', 'ADMIN'), async (req, res, next) => {
    try {
        const { rows } = await pool.query(`
            SELECT u.id, u.username, u.email, u.created_at,
                   COUNT(DISTINCT m.id) AS products_count,
                   COUNT(DISTINCT p.id) AS sales_count,
                   COALESCE(SUM(m.price), 0) AS total_revenue,
                   COALESCE(SUM(m.price * 0.10), 0) AS total_commission
            FROM users u
                     LEFT JOIN models m ON m.creator_id = u.id AND m.deleted_at IS NULL
                     LEFT JOIN purchases p ON p.model_id = m.id
            WHERE u.role = 'CREATOR'
            GROUP BY u.id
            ORDER BY total_revenue DESC
        `);
        res.json({ sellers: rows });
    } catch (error) {
        next(error);
    }
});

// Stats globales vendeurs
router.get('/sellers/stats', requireAuth, requireRole('STAFF', 'ADMIN'), async (req, res, next) => {
    try {
        const { rows } = await pool.query(`
            SELECT
                    (SELECT COUNT(*) FROM users WHERE role = 'CREATOR') AS "totalSellers",
                    (SELECT COALESCE(SUM(m.price), 0) FROM purchases p JOIN models m ON m.id = p.model_id) AS "totalRevenue",
                    (SELECT COALESCE(SUM(m.price * 0.10), 0) FROM purchases p JOIN models m ON m.id = p.model_id) AS "totalCommissions",
                    (SELECT COUNT(*) FROM purchases) AS "totalSales"
        `);
        res.json({ stats: rows[0] });
    } catch (error) {
        next(error);
    }
});

module.exports = router;