const router = require("express").Router();
const adminController = require("../controllers/admin.controller");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");

// Changer le rôle d'un utilisateur
router.post(
    "/set-role",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    adminController.setUserRole
);

// Lister tous les utilisateurs
router.get(
    "/users",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    adminController.getAllUsers
);

// Récupérer un utilisateur
router.get(
    "/users/:id",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    adminController.getUserById
);

// Bannir un utilisateur
router.post(
    "/users/:id/ban",
    requireAuth,
    requireRole("ADMIN"),
    adminController.banUser
);

// Débannir un utilisateur
router.post(
    "/users/:id/unban",
    requireAuth,
    requireRole("ADMIN"),
    adminController.unbanUser
);

// Supprimer un utilisateur
router.delete(
    "/users/:id",
    requireAuth,
    requireRole("ADMIN"),
    adminController.deleteUser
);

// Statistiques globales
router.get(
    "/stats",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    adminController.getGlobalStats
);

// Modèles en attente d'approbation
router.get(
    "/models/pending",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    adminController.getPendingModels
);

module.exports = router;