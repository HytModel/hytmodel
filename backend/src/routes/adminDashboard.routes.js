const router = require("express").Router();
const adminDashboardController = require("../controllers/adminDashboard.controller");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");

// KPIs globaux
router.get(
    "/admin/dashboard/stats",
    requireAuth,
    requireRole("ADMIN", "STAFF"),
    adminDashboardController.getGlobalStats
);

// Courbe de revenus
router.get(
    "/admin/dashboard/chart",
    requireAuth,
    requireRole("ADMIN", "STAFF"),
    adminDashboardController.getRevenueChart
);

// Stats par vendeur
router.get(
    "/admin/dashboard/sellers",
    requireAuth,
    requireRole("ADMIN", "STAFF"),
    adminDashboardController.getSellerStats
);

// Top modèles vendus (global)
router.get(
    "/admin/dashboard/top-models",
    requireAuth,
    requireRole("ADMIN", "STAFF"),
    adminDashboardController.getTopModels
);

module.exports = router;