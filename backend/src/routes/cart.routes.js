const router = require("express").Router();
const cartController = require("../controllers/cart.controller");
const { requireAuth } = require("../middlewares/requireAuth");

// Ajouter au panier
router.post("/add/:modelId", requireAuth, cartController.addToCart);

// Voir le panier
router.get("/", requireAuth, cartController.getCart);

// Retirer un item
router.delete("/remove/:modelId", requireAuth, cartController.removeFromCart);

// Vider le panier
router.delete("/clear", requireAuth, cartController.clearCart);

module.exports = router;
