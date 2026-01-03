const router = require("express").Router();
const adminController = require("../controllers/admin.controller");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");
const pool = require("../db/pool");

// Changer le rôle d'un utilisateur
router.post("/set-role", requireAuth, requireRole("STAFF", "ADMIN"), adminController.setUserRole);

// Lister tous les utilisateurs
router.get("/users", requireAuth, requireRole("STAFF", "ADMIN"), adminController.getAllUsers);

// Récupérer un utilisateur
router.get("/users/:id", requireAuth, requireRole("STAFF", "ADMIN"), adminController.getUserById);

// Bannir un utilisateur
router.post("/users/:id/ban", requireAuth, requireRole("ADMIN"), adminController.banUser);

// Débannir un utilisateur
router.post("/users/:id/unban", requireAuth, requireRole("ADMIN"), adminController.unbanUser);

// Supprimer un utilisateur
router.delete("/users/:id", requireAuth, requireRole("ADMIN"), adminController.deleteUser);

// Statistiques globales
router.get("/stats", requireAuth, requireRole("STAFF", "ADMIN"), adminController.getGlobalStats);

// Modèles en attente d'approbation
router.get("/models/pending", requireAuth, requireRole("STAFF", "ADMIN"), adminController.getPendingModels);

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

router.post('/creator-requests/:id/approve', requireAuth, requireRole('STAFF', 'ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { creatorType } = req.body;
        const validTypes = ['NON_AFFILIATED', 'AFFILIATED', 'HYTSTUDIO'];
        const type = validTypes.includes(creatorType) ? creatorType : 'NON_AFFILIATED';
        const { rows } = await pool.query('SELECT user_id FROM creator_requests WHERE id = $1', [id]);
        if (!rows[0]) return res.status(404).json({ error: 'Request not found' });
        await pool.query('UPDATE users SET role = $1, creator_type = $2 WHERE id = $3', ['CREATOR', type, rows[0].user_id]);
        await pool.query(`UPDATE creator_requests SET status = 'APPROVED', reviewed_at = NOW(), reviewed_by = $1 WHERE id = $2`, [req.user.id, id]);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.post('/creator-requests/:id/reject', requireAuth, requireRole('STAFF', 'ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        await pool.query(`UPDATE creator_requests SET status = 'REJECTED', rejection_reason = $1, reviewed_at = NOW(), reviewed_by = $2 WHERE id = $3`, [reason, req.user.id, id]);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// ============ VENDEURS ============

function getCommissionRate(creatorType) {
    switch (creatorType) {
        case 'HYTSTUDIO': return 1.0;
        case 'AFFILIATED': return 0.10;
        default: return 0.15;
    }
}

router.get('/sellers', requireAuth, requireRole('STAFF', 'ADMIN'), async (req, res, next) => {
    try {
        const { rows } = await pool.query(`
            SELECT u.id, u.username, u.email, u.created_at, u.creator_type,
                   COUNT(DISTINCT m.id) AS products_count,
                   COUNT(DISTINCT p.id) AS sales_count,
                   COALESCE(SUM(m.price), 0) AS total_revenue
            FROM users u
            LEFT JOIN models m ON m.creator_id = u.id AND m.deleted_at IS NULL
            LEFT JOIN purchases p ON p.model_id = m.id
            WHERE u.role = 'CREATOR'
            GROUP BY u.id
            ORDER BY total_revenue DESC
        `);
        const sellersWithCommissions = rows.map(seller => {
            const revenue = Number(seller.total_revenue) || 0;
            const commissionRate = getCommissionRate(seller.creator_type);
            return { ...seller, total_revenue: revenue, total_commission: revenue * commissionRate, commission_rate: commissionRate * 100 };
        });
        res.json({ sellers: sellersWithCommissions });
    } catch (error) {
        next(error);
    }
});

router.put('/sellers/:id/type', requireAuth, requireRole('STAFF', 'ADMIN'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { creatorType } = req.body;
        const validTypes = ['NON_AFFILIATED', 'AFFILIATED', 'HYTSTUDIO'];
        if (!validTypes.includes(creatorType)) return res.status(400).json({ error: 'Invalid creator type' });
        await pool.query('UPDATE users SET creator_type = $1 WHERE id = $2 AND role = $3', [creatorType, id, 'CREATOR']);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.get('/sellers/stats', requireAuth, requireRole('STAFF', 'ADMIN'), async (req, res, next) => {
    try {
        const sellersResult = await pool.query(`SELECT COUNT(*) as count FROM users WHERE role = 'CREATOR'`);
        const totalSellers = Number(sellersResult.rows[0].count);
        const salesResult = await pool.query(`SELECT m.price, u.creator_type FROM purchases p JOIN models m ON m.id = p.model_id JOIN users u ON u.id = m.creator_id`);
        let totalRevenue = 0, totalCommissions = 0;
        salesResult.rows.forEach(row => {
            const price = Number(row.price) || 0;
            totalRevenue += price;
            totalCommissions += price * getCommissionRate(row.creator_type);
        });
        const salesCountResult = await pool.query(`SELECT COUNT(*) as count FROM purchases`);
        res.json({ stats: { totalSellers, totalRevenue: totalRevenue.toFixed(2), totalCommissions: totalCommissions.toFixed(2), totalSales: Number(salesCountResult.rows[0].count) } });
    } catch (error) {
        next(error);
    }
});

router.get('/sellers/eligible-affiliate', requireAuth, requireRole('STAFF', 'ADMIN'), async (req, res, next) => {
    try {
        const { rows } = await pool.query(`
            SELECT u.id, u.username, u.email, u.creator_type, u.created_at, COUNT(p.id) AS total_sales, COALESCE(SUM(m.price), 0) AS total_revenue
            FROM users u JOIN models m ON m.creator_id = u.id JOIN purchases p ON p.model_id = m.id
            WHERE u.role = 'CREATOR' AND (u.creator_type = 'NON_AFFILIATED' OR u.creator_type IS NULL)
            GROUP BY u.id HAVING COUNT(p.id) >= 1000 ORDER BY COUNT(p.id) DESC
        `);
        res.json({ sellers: rows });
    } catch (error) {
        next(error);
    }
});

// ============ NOTIFICATIONS STAFF ============

router.get('/notifications', requireAuth, requireRole('STAFF', 'ADMIN'), async (req, res, next) => {
    try {
        const { rows } = await pool.query(`SELECT n.*, u.username, u.email FROM staff_notifications n JOIN users u ON u.id = n.user_id WHERE n.is_read = FALSE ORDER BY n.created_at DESC`);
        res.json({ notifications: rows });
    } catch (error) {
        next(error);
    }
});

router.put('/notifications/:id/read', requireAuth, requireRole('STAFF', 'ADMIN'), async (req, res, next) => {
    try {
        await pool.query('UPDATE staff_notifications SET is_read = TRUE, read_by = $1, read_at = NOW() WHERE id = $2', [req.user.id, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.delete('/notifications/:id', requireAuth, requireRole('STAFF', 'ADMIN'), async (req, res, next) => {
    try {
        await pool.query('DELETE FROM staff_notifications WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// ============ SITE STATS ============

router.get("/site-stats", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { rows: downloadRows } = await pool.query(`SELECT COUNT(*) as total_downloads FROM purchases`);
        let totalVisits = 0, avgTimeFormatted = '0:00';
        try {
            const { rows: visitRows } = await pool.query(`SELECT COUNT(*) as total_visits FROM site_visits`);
            totalVisits = parseInt(visitRows[0]?.total_visits || 0);
            const { rows: avgTimeRows } = await pool.query(`SELECT AVG(duration_seconds) as avg_duration FROM site_visits WHERE duration_seconds IS NOT NULL AND duration_seconds > 0`);
            const avgSeconds = parseInt(avgTimeRows[0]?.avg_duration || 0);
            avgTimeFormatted = `${Math.floor(avgSeconds / 60)}:${(avgSeconds % 60).toString().padStart(2, '0')}`;
        } catch (e) {}
        res.json({ totalVisits, totalDownloads: parseInt(downloadRows[0]?.total_downloads || 0), avgTimeOnSite: avgTimeFormatted });
    } catch (error) {
        next(error);
    }
});

// ============ ANALYTICS ============

router.get("/analytics", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { period = '30', gameId } = req.query;
        const days = parseInt(period) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const gameFilter = gameId ? 'AND m.game_id = $2' : '';
        const params = gameId ? [startDate, gameId] : [startDate];

        // Total des revenus et ventes
        let salesData = { total_sales: 0, total_revenue: 0, avg_order_value: 0 };
        try {
            const q = gameId
                ? `SELECT COUNT(*) as total_sales, COALESCE(SUM(p.amount), 0) as total_revenue, COALESCE(AVG(p.amount), 0) as avg_order_value FROM purchases p JOIN models m ON m.id = p.model_id WHERE p.created_at >= $1 ${gameFilter}`
                : `SELECT COUNT(*) as total_sales, COALESCE(SUM(amount), 0) as total_revenue, COALESCE(AVG(amount), 0) as avg_order_value FROM purchases WHERE created_at >= $1`;
            const { rows } = await pool.query(q, params);
            salesData = rows[0] || salesData;
        } catch (e) { console.error('Sales error:', e.message); }

        // Ventes par jeu
        let salesByGame = [{ name: 'Aucune donnée', value: 100, revenue: 0 }];
        try {
            const { rows } = await pool.query(`
                SELECT g.name, COUNT(p.id) as count, COALESCE(SUM(p.amount), 0) as revenue
                FROM purchases p JOIN models m ON m.id = p.model_id LEFT JOIN games g ON g.id = m.game_id
                WHERE p.created_at >= $1 GROUP BY g.id, g.name ORDER BY count DESC LIMIT 10
            `, [startDate]);
            if (rows.length > 0) {
                const total = rows.reduce((a, r) => a + parseInt(r.count || 0), 0) || 1;
                salesByGame = rows.map(r => ({ name: r.name || 'Autre', value: Math.round((parseInt(r.count || 0) / total) * 100), revenue: parseInt(r.revenue || 0) }));
            }
        } catch (e) { console.error('Games error:', e.message); }

        // Ventes par catégorie
        let salesByCategory = [{ name: 'Aucune donnée', value: 100, count: 0 }];
        try {
            const { rows } = await pool.query(`
                SELECT c.name, COUNT(p.id) as count FROM purchases p JOIN models m ON m.id = p.model_id LEFT JOIN categories c ON c.id = m.category_id
                WHERE p.created_at >= $1 ${gameFilter} GROUP BY c.id, c.name ORDER BY count DESC LIMIT 10
            `, params);
            if (rows.length > 0) {
                const total = rows.reduce((a, r) => a + parseInt(r.count || 0), 0) || 1;
                salesByCategory = rows.map(r => ({ name: r.name || 'Autre', value: Math.round((parseInt(r.count || 0) / total) * 100), count: parseInt(r.count || 0) }));
            }
        } catch (e) { console.error('Categories error:', e.message); }

        // Distribution des prix
        let priceDistribution = [{ range: '5-10€', count: 0, revenue: 0 }];
        try {
            const { rows } = await pool.query(`
                SELECT CASE WHEN m.price < 1000 THEN '5-10€' WHEN m.price < 2000 THEN '10-20€' WHEN m.price < 5000 THEN '20-50€' WHEN m.price < 10000 THEN '50-100€' ELSE '100€+' END as price_range,
                COUNT(*) as count, COALESCE(SUM(p.amount), 0) as revenue
                FROM purchases p JOIN models m ON m.id = p.model_id WHERE p.created_at >= $1 ${gameFilter} GROUP BY price_range
            `, params);
            if (rows.length > 0) priceDistribution = rows.map(r => ({ range: r.price_range, count: parseInt(r.count || 0), revenue: parseInt(r.revenue || 0) / 100 }));
        } catch (e) { console.error('Price error:', e.message); }

        // Ventes par jour
        const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        let salesOverTime = dayNames.map(d => ({ date: d, ventes: 0, revenus: 0 }));
        try {
            const q = gameId
                ? `SELECT EXTRACT(DOW FROM p.created_at) as dow, COUNT(*) as ventes, COALESCE(SUM(p.amount), 0) / 100 as revenus FROM purchases p JOIN models m ON m.id = p.model_id WHERE p.created_at >= $1 ${gameFilter} GROUP BY dow`
                : `SELECT EXTRACT(DOW FROM created_at) as dow, COUNT(*) as ventes, COALESCE(SUM(amount), 0) / 100 as revenus FROM purchases WHERE created_at >= $1 GROUP BY dow`;
            const { rows } = await pool.query(q, params);
            const dayMap = {};
            rows.forEach(r => { dayMap[dayNames[parseInt(r.dow)]] = { date: dayNames[parseInt(r.dow)], ventes: parseInt(r.ventes || 0), revenus: parseFloat(r.revenus || 0) }; });
            salesOverTime = salesOverTime.map(d => dayMap[d.date] || d);
        } catch (e) { console.error('Time error:', e.message); }

        // Tags populaires
        let topTags = [{ name: 'Aucun', views: 0, sales: 0 }];
        try {
            const { rows } = await pool.query(`
                SELECT t.name, COUNT(DISTINCT p.id) as sales FROM tags t
                JOIN model_tags mt ON mt.tag_id = t.id JOIN models m ON m.id = mt.model_id
                JOIN purchases p ON p.model_id = m.id AND p.created_at >= $1
                WHERE 1=1 ${gameFilter} GROUP BY t.id, t.name ORDER BY sales DESC LIMIT 10
            `, params);
            if (rows.length > 0) topTags = rows.map(r => ({ name: r.name, views: parseInt(r.sales || 0) * 15, sales: parseInt(r.sales || 0) }));
        } catch (e) { console.error('Tags error:', e.message); }

        // Produits les plus vendus
        let mostViewedProducts = [{ name: 'Aucun', views: 0, sales: 0, conversion: 0 }];
        try {
            const { rows } = await pool.query(`
                SELECT m.title as name, COUNT(p.id) as sales FROM models m
                JOIN purchases p ON p.model_id = m.id WHERE p.created_at >= $1 AND m.deleted_at IS NULL ${gameFilter}
                GROUP BY m.id, m.title ORDER BY sales DESC LIMIT 5
            `, params);
            if (rows.length > 0) mostViewedProducts = rows.map(r => ({ name: r.name, views: parseInt(r.sales || 0) * 20, sales: parseInt(r.sales || 0), conversion: 5.0 }));
        } catch (e) { console.error('Products error:', e.message); }

        const totalSales = parseInt(salesData.total_sales || 0);

        res.json({
            overview: {
                totalRevenue: parseInt(salesData.total_revenue || 0),
                totalSales,
                avgOrderValue: parseInt(salesData.avg_order_value || 0),
                avgTimeBetweenPurchases: 2.5,
                conversionRate: 3.2,
                totalViews: totalSales * 30 || 100,
                uniqueVisitors: totalSales * 20 || 50
            },
            trends: { revenue: 0, sales: 0, views: 0 },
            salesByGame,
            salesByCategory,
            priceDistribution,
            salesOverTime,
            topTags,
            mostViewedProducts,
            hourlyActivity: Array.from({ length: 12 }, (_, i) => ({ hour: `${(i * 2).toString().padStart(2, '0')}h`, views: Math.floor(Math.random() * 100) + 10, purchases: Math.floor(Math.random() * 10) + 1 })),
            conversionFunnel: [
                { step: 'Visiteurs', value: totalSales * 50 || 100 },
                { step: 'Vues produit', value: totalSales * 30 || 60 },
                { step: 'Ajout panier', value: totalSales * 5 || 10 },
                { step: 'Checkout', value: Math.round(totalSales * 1.5) || 3 },
                { step: 'Achat', value: totalSales || 1 }
            ]
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.json({ overview: { totalRevenue: 0, totalSales: 0, avgOrderValue: 0, avgTimeBetweenPurchases: 0, conversionRate: 0, totalViews: 0, uniqueVisitors: 0 }, trends: { revenue: 0, sales: 0, views: 0 }, salesByGame: [], salesByCategory: [], priceDistribution: [], salesOverTime: [], topTags: [], mostViewedProducts: [], hourlyActivity: [], conversionFunnel: [] });
    }
});

// GET /api/admin/game-analytics/:gameId - Stats détaillées pour un jeu spécifique
router.get("/game-analytics/:gameId", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const { period = '30' } = req.query;
        const days = parseInt(period) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Top catégories pour ce jeu
        let topCategories = [];
        try {
            const { rows } = await pool.query(`
                SELECT c.name, COUNT(p.id) as sales, COALESCE(SUM(p.amount), 0) as revenue
                FROM purchases p JOIN models m ON m.id = p.model_id LEFT JOIN categories c ON c.id = m.category_id
                WHERE p.created_at >= $1 AND m.game_id = $2 GROUP BY c.id, c.name ORDER BY sales DESC LIMIT 10
            `, [startDate, gameId]);
            const maxSales = parseInt(rows[0]?.sales) || 1;
            topCategories = rows.map(r => ({ name: r.name || 'Sans catégorie', sales: parseInt(r.sales || 0), revenue: parseInt(r.revenue || 0), percentage: Math.round((parseInt(r.sales || 0) / maxSales) * 100) }));
        } catch (e) { console.error('Top categories error:', e.message); }

        // Top tags pour ce jeu
        let topTags = [];
        try {
            const { rows } = await pool.query(`
                SELECT t.name, COUNT(DISTINCT m.id) as products, COUNT(DISTINCT p.id) as sales
                FROM tags t JOIN model_tags mt ON mt.tag_id = t.id JOIN models m ON m.id = mt.model_id AND m.game_id = $2
                            LEFT JOIN purchases p ON p.model_id = m.id AND p.created_at >= $1
                GROUP BY t.id, t.name ORDER BY sales DESC LIMIT 10
            `, [startDate, gameId]);
            topTags = rows.map(r => ({ name: r.name, products: parseInt(r.products || 0), sales: parseInt(r.sales || 0) }));
        } catch (e) { console.error('Top tags error:', e.message); }

        // Top versions pour ce jeu
        let topVersions = [];
        try {
            const { rows } = await pool.query(`
                SELECT v.name, COUNT(DISTINCT m.id) as products, COUNT(DISTINCT p.id) as sales
                FROM versions v JOIN model_versions mv ON mv.version_id = v.id JOIN models m ON m.id = mv.model_id AND m.game_id = $2
                                LEFT JOIN purchases p ON p.model_id = m.id AND p.created_at >= $1
                GROUP BY v.id, v.name ORDER BY sales DESC LIMIT 10
            `, [startDate, gameId]);
            const totalSales = rows.reduce((a, r) => a + parseInt(r.sales || 0), 0) || 1;
            topVersions = rows.map(r => ({ name: r.name, products: parseInt(r.products || 0), sales: parseInt(r.sales || 0), percentage: Math.round((parseInt(r.sales || 0) / totalSales) * 100) }));
        } catch (e) { console.error('Top versions error:', e.message); }

        // Best sellers pour ce jeu
        let bestSellers = [];
        try {
            const { rows } = await pool.query(`
                SELECT m.title as name, c.name as category, COUNT(p.id) as sales, COALESCE(SUM(p.amount), 0) as revenue
                FROM models m JOIN purchases p ON p.model_id = m.id LEFT JOIN categories c ON c.id = m.category_id
                WHERE p.created_at >= $1 AND m.game_id = $2 AND m.deleted_at IS NULL
                GROUP BY m.id, m.title, c.name ORDER BY sales DESC LIMIT 10
            `, [startDate, gameId]);
            bestSellers = rows.map(r => ({ name: r.name, category: r.category || 'Sans catégorie', sales: parseInt(r.sales || 0), revenue: parseInt(r.revenue || 0) }));
        } catch (e) { console.error('Best sellers error:', e.message); }

        res.json({ topCategories, topTags, topVersions, bestSellers });
    } catch (error) {
        console.error('Game analytics error:', error);
        res.json({ topCategories: [], topTags: [], topVersions: [], bestSellers: [] });
    }
});

module.exports = router;