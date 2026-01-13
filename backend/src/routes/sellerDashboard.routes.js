const router = require("express").Router();
const sellerDashboardController = require("../controllers/sellerDashboard.controller");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");

// KPIs vendeur
router.get(
    "/seller/dashboard/stats",
    requireAuth,
    requireRole("CREATOR", "STAFF", "ADMIN"),
    sellerDashboardController.getStats
);

// Courbe de ventes par jour
router.get(
    "/seller/dashboard/chart",
    requireAuth,
    requireRole("CREATOR", "STAFF", "ADMIN"),
    sellerDashboardController.getChart
);

// Dernières ventes
router.get(
    "/seller/dashboard/sales",
    requireAuth,
    requireRole("CREATOR", "STAFF", "ADMIN"),
    sellerDashboardController.getRecentSales
);

// Top modèles
router.get(
    "/seller/dashboard/top-models",
    requireAuth,
    requireRole("CREATOR", "STAFF", "ADMIN"),
    sellerDashboardController.getTopModels
);

// Analytics vendeur
router.get(
    "/seller/analytics",
    requireAuth,
    requireRole("CREATOR", "STAFF", "ADMIN"),
    sellerDashboardController.getAnalytics
);

module.exports = router;