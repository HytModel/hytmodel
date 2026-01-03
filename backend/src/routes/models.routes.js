const router = require("express").Router();
const modelsController = require("../controllers/models.controller");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");
const { uploadModel } = require("../utils/uploadModel");
const { uploadLimiter } = require("../middlewares/rateLimiter");
const pool = require("../db/pool");

// Upload d'un modèle SIMPLE (ancienne méthode)
router.post(
    "/upload",
    requireAuth,
    requireRole("CREATOR", "STAFF", "ADMIN"),
    uploadLimiter,
    uploadModel.single("file"),
    modelsController.uploadModel
);

// NOUVEAU : Upload avec game, category, tags, versions
router.post(
    "/upload-detailed",
    requireAuth,
    requireRole("CREATOR", "STAFF", "ADMIN"),
    uploadLimiter,
    uploadModel.single("file"),
    modelsController.uploadModelWithDetails
);

// Mettre à jour un modèle
router.put(
    "/:id",
    requireAuth,
    modelsController.updateModel
);

// Lister tous les modèles approuvés
router.get("/", modelsController.listModels);

// NOUVEAU : Récupérer un modèle avec détails complets
router.get("/:id/details", modelsController.getModelWithDetails);

// Rechercher des modèles (ancienne méthode)
router.get("/search", modelsController.searchModels);

// NOUVEAU : Recherche avancée avec game, category, tags, versions
router.get("/search-advanced", modelsController.searchModelsAdvanced);

// Stats d'un modèle
router.get(
    "/:id/stats",
    requireAuth,
    requireRole("CREATOR", "STAFF", "ADMIN"),
    modelsController.getStats
);

// Télécharger un modèle
router.get(
    "/:id/download",
    requireAuth,
    modelsController.downloadModel
);

// Noter un modèle
router.post(
    "/:id/rate",
    requireAuth,
    modelsController.rateModel
);

// Approuver un modèle (STAFF/ADMIN)
router.post(
    "/:id/approve",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    modelsController.approveModel
);

// Rejeter un modèle (STAFF/ADMIN)
router.post(
    "/:id/reject",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    modelsController.rejectModel
);

// Cacher un modèle (STAFF/ADMIN)
router.post(
    "/:id/hide",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    modelsController.hideModel
);

// Réafficher un modèle (STAFF/ADMIN)
router.post(
    "/:id/unhide",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    modelsController.unhideModel
);

// Supprimer un modèle (soft delete)
router.delete(
    "/:id",
    requireAuth,
    modelsController.deleteModel
);

// Restaurer un modèle supprimé
router.post(
    "/:id/restore",
    requireAuth,
    modelsController.restoreModel
);

// Supprimer définitivement (STAFF/ADMIN)
router.delete(
    "/:id/hard",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    modelsController.hardDeleteModel
);
// Mes produits (pour le créateur connecté - tous statuts)
router.get('/my-products', requireAuth, async (req, res, next) => {
    try {
        const { rows } = await pool.query(`
            SELECT m.*,
                   g.name AS game_name,
                   c.name AS category_name,
                   u.username AS creator_username
            FROM models m
                     LEFT JOIN games g ON g.id = m.game_id
                     LEFT JOIN categories c ON c.id = m.category_id
                     LEFT JOIN users u ON u.id = m.creator_id
            WHERE m.creator_id = $1 AND m.deleted_at IS NULL
            ORDER BY m.created_at DESC
        `, [req.user.id]);

        res.json({ models: rows });
    } catch (error) {
        next(error);
    }
});
router.get("/:id/check-purchase", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        // Vérifier si l'utilisateur a acheté ce modèle
        const { rows } = await pool.query(
            `SELECT id FROM purchases
             WHERE model_id = $1 AND user_id = $2
                 LIMIT 1`,
            [id, req.user.id]
        );

        res.json({ hasPurchased: rows.length > 0 });
    } catch (error) {
        next(error);
    }
});
module.exports = router;