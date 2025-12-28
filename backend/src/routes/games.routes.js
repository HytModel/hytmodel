const router = require("express").Router();
const gamesController = require("../controllers/games.controller");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");

// Lister tous les jeux (public)
router.get("/", gamesController.getAllGames);

// Récupérer un jeu par ID (public)
router.get("/:id", gamesController.getGameById);

// Récupérer un jeu par slug (public)
router.get("/slug/:slug", gamesController.getGameBySlug);

// Stats d'un jeu (public)
router.get("/:id/stats", gamesController.getGameStats);

// Créer un jeu (ADMIN)
router.post(
    "/",
    requireAuth,
    requireRole("ADMIN"),
    gamesController.createGame
);

// Mettre à jour un jeu (ADMIN)
router.put(
    "/:id",
    requireAuth,
    requireRole("ADMIN"),
    gamesController.updateGame
);

// Toggle active/inactive (ADMIN)
router.post(
    "/:id/toggle",
    requireAuth,
    requireRole("ADMIN"),
    gamesController.toggleActive
);

// Supprimer un jeu (ADMIN)
router.delete(
    "/:id",
    requireAuth,
    requireRole("ADMIN"),
    gamesController.deleteGame
);

module.exports = router;