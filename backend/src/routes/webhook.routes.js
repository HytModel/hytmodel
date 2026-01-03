const router = require("express").Router();
const webhookController = require("../controllers/webhook.controller");

// Webhook Stripe (le body est déjà en raw grâce à app.js)
router.post("/", webhookController.handleStripeWebhook.bind(webhookController));

module.exports = router;