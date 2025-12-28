const router = require("express").Router();
const { register, login, me } = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/requireAuth");
const { authLimiter } = require("../middlewares/rateLimiter");

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", requireAuth, me);

module.exports = router;