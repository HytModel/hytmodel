const router = require('express').Router()
const creatorAnalyticsController = require('../controllers/creatorAnalytics.controller')
const { requireAuth } = require('../middlewares/requireAuth')
const { requireRole } = require('../middlewares/requireRole')

// Toutes les analytics
router.get(
    '/all',
    requireAuth,
    requireRole('CREATOR', 'STAFF', 'ADMIN'),
    creatorAnalyticsController.getAll
)

// Filtres disponibles pour le créateur
router.get(
    '/filters',
    requireAuth,
    requireRole('CREATOR', 'STAFF', 'ADMIN'),
    creatorAnalyticsController.getFilters
)

// Vue d'ensemble
router.get(
    '/overview',
    requireAuth,
    requireRole('CREATOR', 'STAFF', 'ADMIN'),
    creatorAnalyticsController.getOverview
)

// Tendances
router.get(
    '/trends',
    requireAuth,
    requireRole('CREATOR', 'STAFF', 'ADMIN'),
    creatorAnalyticsController.getTrends
)

// Performance des modèles
router.get(
    '/models',
    requireAuth,
    requireRole('CREATOR', 'STAFF', 'ADMIN'),
    creatorAnalyticsController.getModelsPerformance
)

// Meilleures heures
router.get(
    '/best-hours',
    requireAuth,
    requireRole('CREATOR', 'STAFF', 'ADMIN'),
    creatorAnalyticsController.getBestHours
)

// Meilleurs jours
router.get(
    '/best-days',
    requireAuth,
    requireRole('CREATOR', 'STAFF', 'ADMIN'),
    creatorAnalyticsController.getBestDays
)

module.exports = router