const router = require("express").Router();
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");
const pool = require("../db/pool");

// ============================================
// GET /api/model-dependencies/:modelId - Obtenir les dépendances d'un produit
// ============================================
router.get("/:modelId", async (req, res, next) => {
    try {
        const { modelId } = req.params;

        const { rows } = await pool.query(`
            SELECT 
                d.id,
                d.dependency_id,
                d.is_required,
                d.note,
                d.created_at,
                m.title as dependency_title,
                m.price as dependency_price,
                m.thumbnail_url as dependency_thumbnail,
                m.status as dependency_status,
                u.username as dependency_creator
            FROM model_dependencies d
            JOIN models m ON m.id = d.dependency_id
            LEFT JOIN users u ON u.id = m.creator_id
            WHERE d.model_id = $1
            ORDER BY d.is_required DESC, m.title ASC
        `, [modelId]);

        res.json({ dependencies: rows });
    } catch (error) {
        next(error);
    }
});

// ============================================
// GET /api/model-dependencies/:modelId/dependents - Produits qui dépendent de celui-ci
// ============================================
router.get("/:modelId/dependents", async (req, res, next) => {
    try {
        const { modelId } = req.params;

        const { rows } = await pool.query(`
            SELECT 
                d.id,
                d.model_id,
                d.is_required,
                d.note,
                m.title as dependent_title,
                m.thumbnail_url as dependent_thumbnail,
                u.username as dependent_creator
            FROM model_dependencies d
            JOIN models m ON m.id = d.model_id
            LEFT JOIN users u ON u.id = m.creator_id
            WHERE d.dependency_id = $1 AND m.status = 'APPROVED'
            ORDER BY m.title ASC
        `, [modelId]);

        res.json({ dependents: rows });
    } catch (error) {
        next(error);
    }
});

// ============================================
// GET /api/model-dependencies/search - Rechercher des produits pour ajouter comme dépendance
// ============================================
router.get("/search/products", requireAuth, async (req, res, next) => {
    try {
        const { q, gameId, excludeModelId } = req.query;

        let query = `
            SELECT 
                m.id,
                m.title,
                m.price,
                m.thumbnail_url,
                m.game_id,
                g.name as game_name,
                u.username as creator_username
            FROM models m
            LEFT JOIN games g ON g.id = m.game_id
            LEFT JOIN users u ON u.id = m.creator_id
            WHERE m.status = 'APPROVED' 
            AND m.deleted_at IS NULL
            AND m.is_hidden = false
        `;

        const params = [];
        let paramCount = 0;

        // Exclure le produit lui-même
        if (excludeModelId) {
            paramCount++;
            query += ` AND m.id != $${paramCount}`;
            params.push(excludeModelId);
        }

        // Filtrer par jeu
        if (gameId) {
            paramCount++;
            query += ` AND m.game_id = $${paramCount}`;
            params.push(gameId);
        }

        // Recherche par titre
        if (q) {
            paramCount++;
            query += ` AND m.title ILIKE $${paramCount}`;
            params.push(`%${q}%`);
        }

        query += ` ORDER BY m.title ASC LIMIT 20`;

        const { rows } = await pool.query(query, params);

        res.json({ products: rows });
    } catch (error) {
        next(error);
    }
});

// ============================================
// POST /api/model-dependencies/:modelId - Ajouter une dépendance
// ============================================
router.post("/:modelId", requireAuth, requireRole("CREATOR", "STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { modelId } = req.params;
        const { dependencyId, isRequired, note } = req.body;
        const userId = req.user.id;

        // Vérifier ownership
        const { rows: models } = await pool.query(`
            SELECT creator_id FROM models WHERE id = $1
        `, [modelId]);

        if (models.length === 0) {
            return res.status(404).json({ error: "Produit non trouvé" });
        }

        if (models[0].creator_id !== userId && !["STAFF", "ADMIN"].includes(req.user.role)) {
            return res.status(403).json({ error: "Non autorisé" });
        }

        // Vérifier que la dépendance existe
        const { rows: depCheck } = await pool.query(`
            SELECT id, title FROM models WHERE id = $1 AND status = 'APPROVED'
        `, [dependencyId]);

        if (depCheck.length === 0) {
            return res.status(400).json({ error: "Le produit de dépendance n'existe pas ou n'est pas approuvé" });
        }

        // Vérifier qu'on ne crée pas une dépendance circulaire
        const { rows: circularCheck } = await pool.query(`
            SELECT id FROM model_dependencies 
            WHERE model_id = $1 AND dependency_id = $2
        `, [dependencyId, modelId]);

        if (circularCheck.length > 0) {
            return res.status(400).json({ error: "Dépendance circulaire détectée" });
        }

        // Ajouter la dépendance
        const { rows } = await pool.query(`
            INSERT INTO model_dependencies (model_id, dependency_id, is_required, note)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (model_id, dependency_id) DO UPDATE SET
                is_required = EXCLUDED.is_required,
                note = EXCLUDED.note
            RETURNING *
        `, [modelId, dependencyId, isRequired !== false, note || null]);

        res.status(201).json({
            dependency: {
                ...rows[0],
                dependency_title: depCheck[0].title
            }
        });
    } catch (error) {
        next(error);
    }
});

// ============================================
// PUT /api/model-dependencies/:modelId/:dependencyId - Modifier une dépendance
// ============================================
router.put("/:modelId/:dependencyId", requireAuth, requireRole("CREATOR", "STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { modelId, dependencyId } = req.params;
        const { isRequired, note } = req.body;
        const userId = req.user.id;

        // Vérifier ownership
        const { rows: models } = await pool.query(`
            SELECT creator_id FROM models WHERE id = $1
        `, [modelId]);

        if (models.length === 0) {
            return res.status(404).json({ error: "Produit non trouvé" });
        }

        if (models[0].creator_id !== userId && !["STAFF", "ADMIN"].includes(req.user.role)) {
            return res.status(403).json({ error: "Non autorisé" });
        }

        const { rows } = await pool.query(`
            UPDATE model_dependencies 
            SET is_required = $1, note = $2
            WHERE model_id = $3 AND dependency_id = $4
            RETURNING *
        `, [isRequired !== false, note || null, modelId, dependencyId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Dépendance non trouvée" });
        }

        res.json({ dependency: rows[0] });
    } catch (error) {
        next(error);
    }
});

// ============================================
// DELETE /api/model-dependencies/:modelId/:dependencyId - Supprimer une dépendance
// ============================================
router.delete("/:modelId/:dependencyId", requireAuth, requireRole("CREATOR", "STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { modelId, dependencyId } = req.params;
        const userId = req.user.id;

        // Vérifier ownership
        const { rows: models } = await pool.query(`
            SELECT creator_id FROM models WHERE id = $1
        `, [modelId]);

        if (models.length === 0) {
            return res.status(404).json({ error: "Produit non trouvé" });
        }

        if (models[0].creator_id !== userId && !["STAFF", "ADMIN"].includes(req.user.role)) {
            return res.status(403).json({ error: "Non autorisé" });
        }

        await pool.query(`
            DELETE FROM model_dependencies 
            WHERE model_id = $1 AND dependency_id = $2
        `, [modelId, dependencyId]);

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

module.exports = router;