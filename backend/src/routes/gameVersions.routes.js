const router = require("express").Router();
const gameVersionsController = require("../controllers/gameVersions.controller");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");

// Lister toutes les versions (public)
router.get("/", gameVersionsController.getAllVersions);

// Lister les versions d'un jeu (public)
router.get("/game/:gameId", gameVersionsController.getVersionsByGame);

// Lister les versions d'une catégorie (public)
router.get("/category/:categoryId", gameVersionsController.getVersionsByCategory);

// Récupérer une version par ID (public)
router.get("/:id", gameVersionsController.getVersionById);

// Stats d'une version (public)
router.get("/:id/stats", gameVersionsController.getVersionStats);

// Créer une version (ADMIN/STAFF)
router.post(
    "/",
    requireAuth,
    requireRole("ADMIN", "STAFF"),
    gameVersionsController.createVersion
);

// Mettre à jour une version (ADMIN/STAFF)
router.put(
    "/:id",
    requireAuth,
    requireRole("ADMIN", "STAFF"),
    gameVersionsController.updateVersion
);

// Toggle active/inactive (ADMIN/STAFF)
router.post(
    "/:id/toggle",
    requireAuth,
    requireRole("ADMIN", "STAFF"),
    gameVersionsController.toggleActive
);

// Supprimer une version (ADMIN)
router.delete(
    "/:id",
    requireAuth,
    requireRole("ADMIN"),
    gameVersionsController.deleteVersion
);

module.exports = router;