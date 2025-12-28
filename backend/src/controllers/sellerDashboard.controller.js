const sellerDashboardService = require("../services/sellerDashboard.service");

class SellerDashboardController {
    // KPIs vendeur
    async getStats(req, res, next) {
        try {
            const sellerId = req.user.id;
            const stats = await sellerDashboardService.getSellerStats(sellerId);
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }

    // Courbe de ventes
    async getChart(req, res, next) {
        try {
            const sellerId = req.user.id;
            const days = parseInt(req.query.days || "30", 10);

            const data = await sellerDashboardService.getSalesChart(sellerId, days);
            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    // Dernières ventes
    async getRecentSales(req, res, next) {
        try {
            const sellerId = req.user.id;
            const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || "20", 10)));

            const sales = await sellerDashboardService.getRecentSales(sellerId, limit);
            res.json(sales);
        } catch (error) {
            next(error);
        }
    }

    // Top modèles
    async getTopModels(req, res, next) {
        try {
            const sellerId = req.user.id;
            const days = parseInt(req.query.days || "30", 10);

            const models = await sellerDashboardService.getTopModels(sellerId, days);
            res.json(models);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SellerDashboardController();