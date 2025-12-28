const router = require("express").Router();
const checkoutController = require("../controllers/checkout.controller");
const { requireAuth } = require("../middlewares/requireAuth");
const { checkoutLimiter } = require("../middlewares/rateLimiter");

// Créer une session de paiement Stripe (avec rate limiter)
router.post("/checkout", requireAuth, checkoutLimiter, checkoutController.createCheckout);

// Récupérer les achats de l'utilisateur
router.get("/purchases", requireAuth, checkoutController.getUserPurchases);

module.exports = router;
