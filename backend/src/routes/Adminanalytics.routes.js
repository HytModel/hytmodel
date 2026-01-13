const router = require("express").Router();
const adminAnalyticsService = require("../services/adminAnalytics.service");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");

// Middleware commun
const staffAuth = [requireAuth, requireRole("STAFF", "ADMIN")];

// Filtres disponibles
router.get("/filters", ...staffAuth, async (req, res, next) => {
    try {
        const filters = await adminAnalyticsService.getAvailableFilters();
        res.json(filters);
    } catch (error) {
        next(error);
    }
});

// Analytics globales avec filtres
router.get("/", ...staffAuth, async (req, res, next) => {
    try {
        const { days, gameId, categoryId, tagIds, versionIds } = req.query;
        const analytics = await adminAnalyticsService.getAnalytics({
            days: days || 30,
            gameId,
            categoryId,
            tagIds,
            versionIds
        });
        res.json(analytics);
    } catch (error) {
        next(error);
    }
});

// Analytics vendeurs
router.get("/sellers", ...staffAuth, async (req, res, next) => {
    try {
        const { days, gameId, categoryId, tagIds, versionIds } = req.query;
        const sellersAnalytics = await adminAnalyticsService.getSellersAnalytics({
            days: days || 30,
            gameId,
            categoryId,
            tagIds,
            versionIds
        });
        res.json(sellersAnalytics);
    } catch (error) {
        next(error);
    }
});

// Détails par jeu
router.get("/game/:gameId", ...staffAuth, async (req, res, next) => {
    try {
        const { gameId } = req.params;
        const { days, categoryId, tagIds, versionIds } = req.query;
        const gameDetails = await adminAnalyticsService.getGameDetails(gameId, {
            days: days || 30,
            categoryId,
            tagIds,
            versionIds
        });
        res.json(gameDetails);
    } catch (error) {
        next(error);
    }
});

module.exports = router;