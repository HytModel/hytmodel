const router = require("express").Router();
const pool = require("../db/pool");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");
const { uploadModel } = require("../utils/uploadModel");
const { MIN_MODEL_PRICE } = require("../config/businessRules");

router.post(
    "/upload",
    requireAuth,
    requireRole("CREATOR", "STAFF", "ADMIN"),
    uploadModel.single("file"),
    async (req, res) => {

        console.log("FILE:", req.file);
        console.log("BODY:", req.body);

        if (!req.file) {
            return res.status(400).json({ error: "File required" });
        }

        const { title, description, price } = req.body;

        const priceNumber = Number(price);

        if (isNaN(priceNumber) || priceNumber < MIN_MODEL_PRICE) {
            return res.status(400).json({
                error: `Minimum price to sell a model is ${MIN_MODEL_PRICE}€`
            });
        }

        // 🔑 CHEMIN DU FICHIER (ESSENTIEL)
        const filePath = req.file.path; // ex: uploads/models/xxxx.zip

        const { rows } = await pool.query(
            `
      INSERT INTO models (title, description, price, creator_id, file_path)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
            [
                title,
                description || "",
                priceNumber,
                req.user.id,
                filePath
            ]
        );

        res.status(201).json({ model: rows[0] });
    }
);


// ✏️ Modifier un modèle (titre / description / prix)
router.put(
    "/:id",
    requireAuth,
    async (req, res) => {
        const modelId = req.params.id;
        const { title, description, price } = req.body;

        if (!title || title.length < 3) {
            return res.status(400).json({ error: "Invalid title" });
        }

        const priceNumber = Number(price);

        if (isNaN(priceNumber) || priceNumber < MIN_MODEL_PRICE) {
            return res.status(400).json({
                error: `Minimum price to sell a model is ${MIN_MODEL_PRICE}€`
            });
        }

        // Vérifier modèle + propriétaire
        const { rows } = await pool.query(
            "SELECT creator_id FROM models WHERE id = $1",
            [modelId]
        );

        if (!rows.length) {
            return res.status(404).json({ error: "Model not found" });
        }

        if (
            rows[0].creator_id !== req.user.id &&
            !["STAFF", "ADMIN"].includes(req.user.role)
        ) {
            return res.status(403).json({ error: "Forbidden" });
        }

        // Mise à jour
        const { rows: updated } = await pool.query(
            `
      UPDATE models
      SET title = $1,
          description = $2,
          price = $3
      WHERE id = $4
      RETURNING id, title, description, price
      `,
            [
                title,
                description || "",
                priceNumber,
                modelId
            ]
        );

        res.json({ model: updated[0] });
    }
);

router.post(
    "/:id/hide",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    async (req, res) => {
        const modelId = req.params.id;
        const { reason } = req.body;

        await pool.query(
            `
      UPDATE models
      SET is_hidden = TRUE,
          hidden_reason = $2
      WHERE id = $1
      `,
            [modelId, reason || null]
        );

        res.json({ success: true });
    }
);

// 👁️ Réafficher un modèle
router.post(
    "/:id/unhide",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    async (req, res) => {
        const modelId = req.params.id;

        await pool.query(
            `
      UPDATE models
      SET is_hidden = FALSE,
          hidden_reason = NULL
      WHERE id = $1
      `,
            [modelId]
        );

        res.json({ success: true });
    }
);

// APPROUVER un modèle (STAFF)
router.post(
    "/:id/approve",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    async (req, res) => {
        const { id } = req.params;

        const { rowCount } = await pool.query(
            "UPDATE models SET status = 'APPROVED' WHERE id = $1",
            [id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ error: "Model not found" });
        }

        res.json({ success: true });
    }
);

// REJETER un modèle (STAFF)
router.post(
    "/:id/reject",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    async (req, res) => {
        const { id } = req.params;

        const { rowCount } = await pool.query(
            "UPDATE models SET status = 'REJECTED' WHERE id = $1",
            [id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ error: "Model not found" });
        }

        res.json({ success: true });
    }
);

router.get(
    "/",
    async (req, res) => {
        const { rows } = await pool.query(
            "SELECT id, title, description, price, created_at FROM models WHERE status = 'APPROVED' ORDER BY created_at DESC"
        );

        res.json({ models: rows });
    }
);

router.get("/search", async (req, res) => {
    const { query, tags, minPrice, maxPrice } = req.query;

    const values = [];
    let where = "WHERE m.status = 'APPROVED'";
    let join = "";

    // Recherche texte
    if (query) {
        values.push(`%${query.toLowerCase()}%`);
        where += ` AND LOWER(m.title) LIKE $${values.length}`;
    }

    // Filtre prix
    if (minPrice) {
        values.push(minPrice);
        where += ` AND m.price >= $${values.length}`;
    }

    if (maxPrice) {
        values.push(maxPrice);
        where += ` AND m.price <= $${values.length}`;
    }

    // Filtre tags
    if (tags) {
        const tagList = tags.split(",");
        join += `
      JOIN model_tags mt ON mt.model_id = m.id
      JOIN tags t ON t.id = mt.tag_id
    `;
        values.push(tagList);
        where += ` AND t.name = ANY($${values.length})`;
    }

    const { rows } = await pool.query(
        `
    SELECT
      m.id,
      m.title,
      m.price,
      array_remove(array_agg(DISTINCT t.name), NULL) AS tags
    FROM models m
    LEFT JOIN model_tags mt ON mt.model_id = m.id
    LEFT JOIN tags t ON t.id = mt.tag_id
    ${where}
    GROUP BY m.id
    ORDER BY m.created_at DESC
    `,
        values
    );

    res.json({ models: rows });
});
// Stats d’un modèle (CREATOR / STAFF uniquement)
router.get(
    "/:id/stats",
    requireAuth,
    requireRole("CREATOR", "STAFF", "ADMIN"),
    async (req, res) => {

        // Vérifier propriété
        const { rows } = await pool.query(
            "SELECT creator_id FROM models WHERE id = $1",
            [req.params.id]
        );

        if (!rows.length) {
            return res.status(404).json({ error: "Model not found" });
        }

        if (rows[0].creator_id !== req.user.id && req.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Forbidden" });
        }

        const { rows: stats } = await pool.query(
            "SELECT views, downloads FROM model_stats WHERE model_id = $1",
            [req.params.id]
        );

        res.json({
            stats: stats[0] || { views: 0, downloads: 0 }
        });
    }
);



router.post(
    "/:id/rate",
    requireAuth,
    async (req, res) => {
        const modelId = req.params.id;
        const { rating } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }

        // Récupérer le modèle
        const { rows: models } = await pool.query(
            "SELECT creator_id FROM models WHERE id = $1 AND status = 'APPROVED'",
            [modelId]
        );

        if (!models.length) {
            return res.status(404).json({ error: "Model not found" });
        }

        // Interdire de noter son propre modèle
        if (models[0].creator_id === req.user.id) {
            return res.status(403).json({ error: "You cannot rate your own model" });
        }

        // TODO plus tard : vérifier que l'utilisateur a acheté le modèle

        // Insérer la note
        await pool.query(
            `
      INSERT INTO model_reviews (model_id, user_id, rating)
      VALUES ($1, $2, $3)
      ON CONFLICT (model_id, user_id)
      DO UPDATE SET rating = EXCLUDED.rating
      `,
            [modelId, req.user.id, rating]
        );

        // Recalculer la moyenne
        const { rows: stats } = await pool.query(
            `
      SELECT AVG(rating)::numeric(3,2) AS avg, COUNT(*) AS count
      FROM model_reviews
      WHERE model_id = $1
      `,
            [modelId]
        );

        await pool.query(
            `
      UPDATE models
      SET rating_avg = $1, rating_count = $2
      WHERE id = $3
      `,
            [stats[0].avg, stats[0].count, modelId]
        );

        res.json({
            success: true,
            rating_avg: stats[0].avg,
            rating_count: stats[0].count
        });
    }
);

const path = require("path");
const fs = require("fs");

// Télécharger un modèle (sécurisé)
router.get(
    "/:id/download",
    requireAuth,
    async (req, res) => {
        const modelId = req.params.id;
        const userId = req.user.id;

        // 1️⃣ Vérifier achat
        const { rowCount } = await pool.query(
            "SELECT 1 FROM purchases WHERE user_id = $1 AND model_id = $2",
            [userId, modelId]
        );

        if (!rowCount) {
            return res.status(403).json({ error: "You must purchase this model first" });
        }

        // 2️⃣ Récupérer le fichier
        const { rows } = await pool.query(
            "SELECT file_path FROM models WHERE id = $1",
            [modelId]
        );

        if (!rows.length) {
            return res.status(404).json({ error: "Model not found" });
        }

        const filePath = rows[0].file_path;

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "File not found on server" });
        }

        // 3️⃣ Incrémenter downloads
        await pool.query(
            `
      INSERT INTO model_stats (model_id, downloads)
      VALUES ($1, 1)
      ON CONFLICT (model_id)
      DO UPDATE SET downloads = model_stats.downloads + 1
      `,
            [modelId]
        );

        // 4️⃣ Envoyer le fichier
        res.download(path.resolve(filePath));
    }
);


router.delete(
    "/:id",
    requireAuth,
    async (req, res) => {
        const modelId = req.params.id;

        const { rows } = await pool.query(
            "SELECT creator_id FROM models WHERE id = $1 AND deleted_at IS NULL",
            [modelId]
        );

        if (!rows.length) {
            return res.status(404).json({ error: "Model not found" });
        }

        if (
            rows[0].creator_id !== req.user.id &&
            !["STAFF", "ADMIN"].includes(req.user.role)
        ) {
            return res.status(403).json({ error: "Forbidden" });
        }

        await pool.query(
            "UPDATE models SET deleted_at = now() WHERE id = $1",
            [modelId]
        );

        res.json({ success: true });
    }
);

// 🗑️ Supprimer définitivement un modèle
router.delete(
    "/:id/hard",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    async (req, res) => {
        const modelId = req.params.id;

        const { rows } = await pool.query(
            "SELECT file_path FROM models WHERE id = $1",
            [modelId]
        );

        if (!rows.length) {
            return res.status(404).json({ error: "Model not found" });
        }

        const filePath = rows[0].file_path;

        if (filePath) {
            const absolutePath = path.resolve(filePath);
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        }

        await pool.query(
            "DELETE FROM models WHERE id = $1",
            [modelId]
        );

        res.json({ success: true });
    }
);


// 🔄 Restaurer un modèle (soft delete)
router.post(
    "/:id/restore",
    requireAuth,
    async (req, res) => {
        const modelId = req.params.id;

        // 1️⃣ Récupérer le modèle supprimé
        const { rows } = await pool.query(
            "SELECT creator_id FROM models WHERE id = $1 AND deleted_at IS NOT NULL",
            [modelId]
        );

        if (!rows.length) {
            return res.status(404).json({ error: "Model not found or not deleted" });
        }

        // 2️⃣ Vérifier les droits
        if (
            rows[0].creator_id !== req.user.id &&
            !["STAFF", "ADMIN"].includes(req.user.role)
        ) {
            return res.status(403).json({ error: "Forbidden" });
        }

        // 3️⃣ Restaurer
        await pool.query(
            "UPDATE models SET deleted_at = NULL WHERE id = $1",
            [modelId]
        );

        res.json({ success: true });
    }
);

module.exports = router;