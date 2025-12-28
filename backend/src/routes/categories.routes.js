const router = require("express").Router();
const categoriesController = require("../controllers/categories.controller");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");

// Lister toutes les catégories (public)
router.get("/", categoriesController.getAllCategories);

// Lister les catégories d'un jeu (public)
router.get("/game/:gameId", categoriesController.getCategoriesByGame);

// Récupérer une catégorie par ID (public)
router.get("/:id", categoriesController.getCategoryById);

// Stats d'une catégorie (public)
router.get("/:id/stats", categoriesController.getCategoryStats);

// Créer une catégorie (ADMIN)
router.post(
    "/",
    requireAuth,
    requireRole("ADMIN", "STAFF"),
    categoriesController.createCategory
);

// Mettre à jour une catégorie (ADMIN)
router.put(
    "/:id",
    requireAuth,
    requireRole("ADMIN", "STAFF"),
    categoriesController.updateCategory
);

// Supprimer une catégorie (ADMIN)
router.delete(
    "/:id",
    requireAuth,
    requireRole("ADMIN"),
    categoriesController.deleteCategory
);

module.exports = router;