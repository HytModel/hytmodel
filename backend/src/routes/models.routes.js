const router = require("express").Router();
const modelsController = require("../controllers/models.controller");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");
const { uploadModel } = require("../utils/uploadModel");
const { uploadLimiter } = require("../middlewares/rateLimiter");

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

module.exports = router;