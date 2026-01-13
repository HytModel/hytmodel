const router = require("express").Router();
const checkoutController = require("../controllers/checkout.controller");
const { requireAuth } = require("../middlewares/requireAuth");
const { checkoutLimiter } = require("../middlewares/rateLimiter");

// Créer une session de paiement Stripe (avec rate limiter)
// Route: POST /api/checkout
router.post("/", requireAuth, checkoutLimiter, checkoutController.createCheckout);

// Récupérer les achats de l'utilisateur
// Route: GET /api/checkout/purchases
router.get("/purchases", requireAuth, checkoutController.getUserPurchases);
// Route: POST /api/checkout/claim-free/:productId
router.post("/claim-free/:productId", requireAuth, checkoutController.claimFreeProduct);
module.exports = router;
