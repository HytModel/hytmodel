const creatorAnalyticsService = require('../services/creatorAnalytics.service')

class CreatorAnalyticsController {
    async getAll(req, res, next) {
        try {
            const creatorId = req.user.id
            const days = parseInt(req.query.days) || 30

            // Récupérer les filtres depuis les query params
            const filters = {
                gameId: req.query.gameId || null,
                categoryId: req.query.categoryId || null,
                tagIds: req.query.tagIds ? req.query.tagIds.split(',') : [],
                versionIds: req.query.versionIds ? req.query.versionIds.split(',') : []
            }

            const analytics = await creatorAnalyticsService.getAll(creatorId, days, filters)
            res.json(analytics)
        } catch (error) {
            next(error)
        }
    }

    async getFilters(req, res, next) {
        try {
            const creatorId = req.user.id
            const filters = await creatorAnalyticsService.getAvailableFilters(creatorId)
            res.json(filters)
        } catch (error) {
            next(error)
        }
    }

    async getOverview(req, res, next) {
        try {
            const creatorId = req.user.id
            const days = parseInt(req.query.days) || 30
            const filters = {
                gameId: req.query.gameId || null,
                categoryId: req.query.categoryId || null,
                tagIds: req.query.tagIds ? req.query.tagIds.split(',') : [],
                versionIds: req.query.versionIds ? req.query.versionIds.split(',') : []
            }
            const overview = await creatorAnalyticsService.getOverview(creatorId, days, filters)
            res.json(overview)
        } catch (error) {
            next(error)
        }
    }

    async getTrends(req, res, next) {
        try {
            const creatorId = req.user.id
            const days = parseInt(req.query.days) || 30
            const trends = await creatorAnalyticsService.getTrends(creatorId, days)
            res.json(trends)
        } catch (error) {
            next(error)
        }
    }

    async getModelsPerformance(req, res, next) {
        try {
            const creatorId = req.user.id
            const days = parseInt(req.query.days) || 30
            const filters = {
                gameId: req.query.gameId || null,
                categoryId: req.query.categoryId || null,
                tagIds: req.query.tagIds ? req.query.tagIds.split(',') : [],
                versionIds: req.query.versionIds ? req.query.versionIds.split(',') : []
            }
            const models = await creatorAnalyticsService.getModelsPerformance(creatorId, days, filters)
            res.json(models)
        } catch (error) {
            next(error)
        }
    }

    async getBestHours(req, res, next) {
        try {
            const creatorId = req.user.id
            const days = parseInt(req.query.days) || 30
            const bestHours = await creatorAnalyticsService.getBestHours(creatorId, days)
            res.json(bestHours)
        } catch (error) {
            next(error)
        }
    }

    async getBestDays(req, res, next) {
        try {
            const creatorId = req.user.id
            const days = parseInt(req.query.days) || 30
            const bestDays = await creatorAnalyticsService.getBestDays(creatorId, days)
            res.json(bestDays)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new CreatorAnalyticsController()