const router = require("express").Router();
const pool = require("../db/pool");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");

// Créer un tag (STAFF)
router.post(
    "/",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    async (req, res) => {
        const { name } = req.body;

        if (!name || name.length < 2) {
            return res.status(400).json({ error: "Invalid tag name" });
        }

        const { rows } = await pool.query(
            "INSERT INTO tags (name) VALUES ($1) ON CONFLICT DO NOTHING RETURNING *",
            [name.toLowerCase()]
        );

        res.status(201).json({ tag: rows[0] });
    }
);

// Liste des tags (public)
router.get("/", async (req, res) => {
    const { rows } = await pool.query(
        "SELECT id, name FROM tags ORDER BY name"
    );

    res.json({ tags: rows });
});

// Supprimer un tag (STAFF)
router.delete(
    "/:id",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    async (req, res) => {
        const { id } = req.params;

        await pool.query("DELETE FROM tags WHERE id = $1", [id]);
        res.json({ success: true });
    }
);

module.exports = router;
