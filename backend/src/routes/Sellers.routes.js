const router = require("express").Router();
const pool = require("../db/pool");

// GET /api/sellers/:username - Profil public d'un vendeur
router.get("/:username", async (req, res, next) => {
    try {
        const { username } = req.params;

        // Récupérer le profil du vendeur
        const { rows: sellerRows } = await pool.query(
            `SELECT 
                u.id,
                u.username,
                u.display_name,
                u.avatar_url,
                u.bio,
                u.website_url,
                u.social_discord,
                u.social_twitter,
                u.social_youtube,
                u.creator_type,
                u.created_at AS member_since
             FROM users u
             WHERE u.username = $1 
             AND u.role IN ('CREATOR', 'STAFF', 'ADMIN')`,
            [username]
        );

        if (!sellerRows[0]) {
            return res.status(404).json({ error: "Seller not found" });
        }

        const seller = sellerRows[0];

        // Récupérer les stats
        const { rows: statsRows } = await pool.query(
            `SELECT 
                COUNT(DISTINCT m.id) AS total_products,
                COUNT(DISTINCT p.id) AS total_sales,
                COALESCE(AVG(m.rating_avg), 0) AS average_rating,
                COALESCE(SUM(m.view_count), 0) AS total_views
             FROM users u
             LEFT JOIN models m ON m.creator_id = u.id 
                AND m.status = 'APPROVED' 
                AND m.deleted_at IS NULL 
                AND m.is_hidden = FALSE
             LEFT JOIN purchases p ON p.model_id = m.id
             WHERE u.id = $1`,
            [seller.id]
        );

        // Récupérer les produits du vendeur
        const { rows: products } = await pool.query(
            `SELECT 
                m.id, m.title, m.description, m.price, m.thumbnail_url,
                m.view_count, m.rating_avg, m.rating_count, m.created_at,
                g.name AS game_name,
                c.name AS category_name
             FROM models m
             LEFT JOIN games g ON g.id = m.game_id
             LEFT JOIN categories c ON c.id = m.category_id
             WHERE m.creator_id = $1 
             AND m.status = 'APPROVED' 
             AND m.deleted_at IS NULL 
             AND m.is_hidden = FALSE
             ORDER BY m.created_at DESC`,
            [seller.id]
        );

        res.json({
            seller: {
                ...seller,
                ...statsRows[0]
            },
            products
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/sellers - Liste des vendeurs (optionnel, pour une page "Nos créateurs")
router.get("/", async (req, res, next) => {
    try {
        const { limit = 20, offset = 0, sort = 'popular' } = req.query;

        let orderBy = 'total_sales DESC';
        if (sort === 'newest') orderBy = 'member_since DESC';
        if (sort === 'rating') orderBy = 'average_rating DESC';
        if (sort === 'products') orderBy = 'total_products DESC';

        const { rows } = await pool.query(
            `SELECT 
                u.id,
                u.username,
                u.display_name,
                u.avatar_url,
                u.bio,
                u.creator_type,
                u.created_at AS member_since,
                COUNT(DISTINCT m.id) AS total_products,
                COUNT(DISTINCT p.id) AS total_sales,
                COALESCE(AVG(m.rating_avg), 0) AS average_rating,
                COALESCE(SUM(m.view_count), 0) AS total_views
             FROM users u
             LEFT JOIN models m ON m.creator_id = u.id 
                AND m.status = 'APPROVED' 
                AND m.deleted_at IS NULL 
                AND m.is_hidden = FALSE
             LEFT JOIN purchases p ON p.model_id = m.id
             WHERE u.role IN ('CREATOR', 'STAFF', 'ADMIN')
             GROUP BY u.id
             HAVING COUNT(DISTINCT m.id) > 0
             ORDER BY ${orderBy}
             LIMIT $1 OFFSET $2`,
            [parseInt(limit), parseInt(offset)]
        );

        // Compter le total
        const { rows: countRows } = await pool.query(
            `SELECT COUNT(DISTINCT u.id) AS total
             FROM users u
             JOIN models m ON m.creator_id = u.id 
                AND m.status = 'APPROVED' 
                AND m.deleted_at IS NULL
             WHERE u.role IN ('CREATOR', 'STAFF', 'ADMIN')`
        );

        res.json({
            sellers: rows,
            total: parseInt(countRows[0].total),
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;