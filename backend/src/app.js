const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session");
const passport = require("passport");
const { generalLimiter } = require("./middlewares/rateLimiter");
const path = require('path');

const app = express();

// Sécurité
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

// Logging
app.use(morgan("dev"));

// Servir les fichiers statiques (uploads d'images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Webhook Stripe (AVANT express.json) - Supporte les deux URLs
app.use(
    "/api/webhook/stripe",
    bodyParser.raw({ type: "application/json" }),
    require("./routes/webhook.routes")
);
app.use(
    "/api/webhooks",
    bodyParser.raw({ type: "application/json" }),
    require("./routes/webhook.routes")
);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session pour OAuth
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 heures
    }
}));

// Passport OAuth
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting général
app.use("/api", generalLimiter);

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/auth", require("./routes/oauth.routes")); // OAuth Discord/Google
app.use("/api/profile", require("./routes/profile.routes"));
app.use("/api/sellers", require("./routes/sellers.routes"));
app.use("/api/models", require("./routes/models.routes"));
app.use('/api/model-images', require('./routes/model-images.routes'));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/checkout", require("./routes/checkout.routes"));
app.use("/api/invoices", require("./routes/invoices.routes"));
app.use("/api/stripe", require("./routes/stripe.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api", require("./routes/sellerDashboard.routes"));
app.use("/api", require("./routes/adminDashboard.routes"));
app.use("/api/tags", require("./routes/tags.routes"));
app.use("/api/games", require("./routes/games.routes"));
app.use("/api/categories", require("./routes/categories.routes"));
app.use("/api/versions", require("./routes/gameVersions.routes"));
app.use("/api/creator-request", require("./routes/creator-request.routes"));
app.use("/api/feedback", require("./routes/feedback.routes"));
app.use("/api/notifications", require("./routes/notifications.routes"));
app.use("/api/proposals", require("./routes/proposals.routes"));
app.use("/api/bundles", require("./routes/bundles.routes"));
app.use("/api/dependencies", require("./routes/dependencies.routes"));
app.use("/api/model-versions", require("./routes/modelVersions.routes"));
app.use("/api/custom-orders", require("./routes/customOrders.routes"));

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// 404
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Middleware d'erreurs (EN DERNIER)
app.use((err, req, res, next) => {
    console.error("❌ Error:", err);

    if (err.code === '23505') {
        return res.status(409).json({ error: "Resource already exists" });
    }

    if (err.code === '23503') {
        return res.status(400).json({ error: "Invalid reference" });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: "Invalid token" });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: "Token expired" });
    }

    res.status(err.statusCode || 500).json({
        error: err.message || "Internal server error",
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;