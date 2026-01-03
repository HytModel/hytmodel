const rateLimit = require("express-rate-limit");

// Rate limiter général (toutes les routes) - augmenté pour le dev
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requêtes max (augmenté pour le développement)
    message: { error: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter strict pour l'authentification
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 tentatives max
    message: { error: "Too many login attempts, please try again in 15 minutes" },
    skipSuccessfulRequests: true, // Ne compte pas les tentatives réussies
});

// Rate limiter pour le checkout (éviter les paiements en masse)
const checkoutLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 20, // 20 paiements max par heure
    message: { error: "Too many checkout requests, please wait" },
});

// Rate limiter pour l'upload de modèles
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 50, // 50 uploads max par heure
    message: { error: "Too many uploads, please try again later" },
});

// Rate limiter pour les routes admin (moins strict)
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requêtes max (plus pour les admins)
    message: { error: "Too many admin requests" },
});

module.exports = {
    generalLimiter,
    authLimiter,
    checkoutLimiter,
    uploadLimiter,
    adminLimiter
};