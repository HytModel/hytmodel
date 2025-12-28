const router = require("express").Router();
const tagsController = require("../controllers/tags.controller");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");

// Lister tous les tags (public)
router.get("/", tagsController.getAllTags);

// Lister les tags d'un jeu (public)
router.get("/game/:gameId", tagsController.getTagsByGame);

// Lister les tags globaux (public)
router.get("/global", tagsController.getGlobalTags);

// Récupérer un tag par ID (public)
router.get("/:id", tagsController.getTagById);

// Stats d'un tag (public)
router.get("/:id/stats", tagsController.getTagStats);

// Créer un tag (STAFF/ADMIN)
router.post(
    "/",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    tagsController.createTag
);

// Mettre à jour un tag (STAFF/ADMIN)
router.put(
    "/:id",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    tagsController.updateTag
);

// Supprimer un tag (STAFF/ADMIN)
router.delete(
    "/:id",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    tagsController.deleteTag
);

// Récupérer les tags d'un modèle
router.get("/models/:modelId", tagsController.getModelTags);

// Ajouter un tag à un modèle (STAFF/ADMIN)
router.post(
    "/models/:modelId/:tagId",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    tagsController.addTagToModel
);

// Retirer un tag d'un modèle (STAFF/ADMIN)
router.delete(
    "/models/:modelId/:tagId",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    tagsController.removeTagFromModel
);

module.exports = router;