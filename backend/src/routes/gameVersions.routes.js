const router = require("express").Router();
const pool = require("../db/pool");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");

// Récupérer toutes les versions
router.get("/", async (req, res, next) => {
    try {
        const { rows } = await pool.query(`
            SELECT gv.*, g.name AS game_name
            FROM game_versions gv
                     LEFT JOIN games g ON g.id = gv.game_id
            ORDER BY g.name, gv.version DESC
        `);
        res.json({ versions: rows });
    } catch (error) {
        next(error);
    }
});

// Récupérer les versions d'un jeu spécifique
router.get("/game/:gameId", async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const { rows } = await pool.query(`
            SELECT * FROM game_versions
            WHERE game_id = $1
            ORDER BY version DESC
        `, [gameId]);
        res.json({ versions: rows });
    } catch (error) {
        next(error);
    }
});

// Créer une version (admin/staff)
router.post("/", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { gameId, version } = req.body;

        if (!gameId || !version) {
            return res.status(400).json({ error: "gameId et version sont requis" });
        }

        const { rows } = await pool.query(
            `INSERT INTO game_versions (game_id, version) VALUES ($1, $2) RETURNING *`,
            [gameId, version]
        );
        res.status(201).json({ version: rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: "Cette version existe déjà pour ce jeu" });
        }
        next(error);
    }
});

// Modifier une version (admin/staff)
router.put("/:id", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { version, gameId } = req.body;

        if (!version) {
            return res.status(400).json({ error: "La version est requise" });
        }

        const { rows } = await pool.query(
            `UPDATE game_versions SET version = $1, game_id = $2 WHERE id = $3 RETURNING *`,
            [version, gameId, id]
        );

        if (!rows[0]) {
            return res.status(404).json({ error: "Version non trouvée" });
        }

        res.json({ version: rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: "Cette version existe déjà pour ce jeu" });
        }
        next(error);
    }
});

// Supprimer une version (admin/staff)
router.delete("/:id", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        await pool.query("DELETE FROM game_versions WHERE id = $1", [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

module.exports = router;