const router = require("express").Router();
const pool = require("../db/pool");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");

// Récupérer toutes les catégories
router.get("/", async (req, res, next) => {
    try {
        const { rows } = await pool.query(`
            SELECT c.*, g.name AS game_name 
            FROM categories c
            LEFT JOIN games g ON g.id = c.game_id
            ORDER BY g.name, c.name ASC
        `);
        res.json({ categories: rows });
    } catch (error) {
        next(error);
    }
});

// Récupérer les catégories d'un jeu
router.get("/game/:gameId", async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const { rows } = await pool.query(
            "SELECT * FROM categories WHERE game_id = $1 ORDER BY name ASC",
            [gameId]
        );
        res.json({ categories: rows });
    } catch (error) {
        next(error);
    }
});

// Récupérer une catégorie par slug
router.get("/:slug", async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { rows } = await pool.query(
            "SELECT * FROM categories WHERE slug = $1",
            [slug]
        );

        if (!rows[0]) {
            return res.status(404).json({ error: "Catégorie non trouvée" });
        }

        res.json({ category: rows[0] });
    } catch (error) {
        next(error);
    }
});

// Créer une catégorie (admin/staff)
router.post("/", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { name, slug, gameId } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Le nom est requis" });
        }

        if (!gameId) {
            return res.status(400).json({ error: "Le jeu est requis" });
        }

        const finalSlug = slug?.trim() || name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const { rows } = await pool.query(
            "INSERT INTO categories (name, slug, game_id) VALUES ($1, $2, $3) RETURNING *",
            [name.trim(), finalSlug, gameId]
        );

        res.status(201).json({ category: rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: "Cette catégorie existe déjà" });
        }
        next(error);
    }
});

// Modifier une catégorie (admin/staff)
router.put("/:id", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, slug, gameId } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Le nom est requis" });
        }

        const finalSlug = slug?.trim() || name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const { rows } = await pool.query(
            "UPDATE categories SET name = $1, slug = $2, game_id = $3 WHERE id = $4 RETURNING *",
            [name.trim(), finalSlug, gameId, id]
        );

        if (!rows[0]) {
            return res.status(404).json({ error: "Catégorie non trouvée" });
        }

        res.json({ category: rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: "Cette catégorie existe déjà" });
        }
        next(error);
    }
});

// Supprimer une catégorie (admin/staff)
router.delete("/:id", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { id } = req.params;

        // Mettre à NULL la category_id des modèles associés
        await pool.query("UPDATE models SET category_id = NULL WHERE category_id = $1", [id]);

        // Supprimer la catégorie
        await pool.query("DELETE FROM categories WHERE id = $1", [id]);

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

module.exports = router;