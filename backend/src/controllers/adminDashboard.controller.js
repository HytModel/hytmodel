const adminDashboardService = require("../services/adminDashboard.service");

class AdminDashboardController {
    // KPIs globaux
    async getGlobalStats(req, res, next) {
        try {
            const stats = await adminDashboardService.getGlobalStats();
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }

    // Courbe de revenus
    async getRevenueChart(req, res, next) {
        try {
            const days = parseInt(req.query.days || "30", 10);
            const data = await adminDashboardService.getRevenueChart(days);
            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    // Stats par vendeur
    async getSellerStats(req, res, next) {
        try {
            const days = parseInt(req.query.days || "30", 10);
            const sellers = await adminDashboardService.getSellerStats(days);
            res.json(sellers);
        } catch (error) {
            next(error);
        }
    }

    // Top modèles
    async getTopModels(req, res, next) {
        try {
            const days = parseInt(req.query.days || "30", 10);
            const models = await adminDashboardService.getTopModels(days);
            res.json(models);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminDashboardController();