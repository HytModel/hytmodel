const router = require("express").Router();
const { requireAuth } = require("../middlewares/requireAuth");
const pool = require("../db/pool");

// Soumettre une demande créateur
router.post("/", requireAuth, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { message, portfolioUrl, portfolioDescription, experience, socialLinks } = req.body;

        // Vérifier si l'utilisateur est déjà créateur
        if (["CREATOR", "STAFF", "ADMIN"].includes(req.user.role)) {
            return res.status(400).json({ error: "Vous êtes déjà créateur" });
        }

        // Vérifier s'il y a déjà une demande en attente
        const { rows: existingRequest } = await pool.query(
            "SELECT id, status FROM creator_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
            [userId]
        );

        if (existingRequest[0] && existingRequest[0].status === 'PENDING') {
            return res.status(400).json({ error: "Vous avez déjà une demande en attente" });
        }

        // Si la dernière demande a été rejetée OU approuvée (mais l'utilisateur a été rétrogradé),
        // supprimer l'ancienne pour permettre une nouvelle demande
        if (existingRequest[0] && (existingRequest[0].status === 'REJECTED' || existingRequest[0].status === 'APPROVED')) {
            await pool.query("DELETE FROM creator_requests WHERE id = $1", [existingRequest[0].id]);
        }

        // Créer une nouvelle demande
        const { rows } = await pool.query(
            `INSERT INTO creator_requests (user_id, message, portfolio_url, portfolio_description, experience, social_links)
             VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
            [userId, message, portfolioUrl, portfolioDescription, experience, JSON.stringify(socialLinks || {})]
        );

        res.status(201).json({ request: rows[0] });
    } catch (error) {
        // Si erreur de contrainte unique (demande déjà existante)
        if (error.code === '23505') {
            return res.status(400).json({ error: "Vous avez déjà une demande en cours" });
        }
        next(error);
    }
});

// Voir le statut de ma demande
router.get("/me", requireAuth, async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT * FROM creator_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
            [req.user.id]
        );

        res.json({ request: rows[0] || null });
    } catch (error) {
        next(error);
    }
});

module.exports = router;