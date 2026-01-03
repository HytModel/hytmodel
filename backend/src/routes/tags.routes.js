const router = require("express").Router();
const pool = require("../db/pool");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");

// Récupérer tous les tags
router.get("/", async (req, res, next) => {
    try {
        const { rows } = await pool.query(`
            SELECT t.*, g.name AS game_name 
            FROM tags t
            LEFT JOIN games g ON g.id = t.game_id
            ORDER BY g.name, t.name ASC
        `);
        res.json({ tags: rows });
    } catch (error) {
        next(error);
    }
});

// Récupérer les tags d'un jeu
router.get("/game/:gameId", async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const { rows } = await pool.query(
            "SELECT * FROM tags WHERE game_id = $1 ORDER BY name ASC",
            [gameId]
        );
        res.json({ tags: rows });
    } catch (error) {
        next(error);
    }
});

// Créer un tag (admin/staff)
router.post("/", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { name, gameId } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Le nom est requis" });
        }

        if (!gameId) {
            return res.status(400).json({ error: "Le jeu est requis" });
        }

        const { rows } = await pool.query(
            "INSERT INTO tags (name, game_id) VALUES ($1, $2) RETURNING *",
            [name.trim(), gameId]
        );

        res.status(201).json({ tag: rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: "Ce tag existe déjà pour ce jeu" });
        }
        next(error);
    }
});

// Modifier un tag (admin/staff)
router.put("/:id", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, gameId } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Le nom est requis" });
        }

        const { rows } = await pool.query(
            "UPDATE tags SET name = $1, game_id = $2 WHERE id = $3 RETURNING *",
            [name.trim(), gameId, id]
        );

        if (!rows[0]) {
            return res.status(404).json({ error: "Tag non trouvé" });
        }

        res.json({ tag: rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: "Ce tag existe déjà pour ce jeu" });
        }
        next(error);
    }
});

// Supprimer un tag (admin/staff)
router.delete("/:id", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { id } = req.params;

        // Supprimer les associations model_tags d'abord
        await pool.query("DELETE FROM model_tags WHERE tag_id = $1", [id]);

        // Supprimer le tag
        await pool.query("DELETE FROM tags WHERE id = $1", [id]);

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

module.exports = router;