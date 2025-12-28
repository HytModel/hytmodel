const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const { generalLimiter } = require("./middlewares/rateLimiter");

const app = express();

// Sécurité
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

// Logging
app.use(morgan("dev"));

// Webhook Stripe (AVANT express.json)
app.use(
    "/api/webhooks",
    bodyParser.raw({ type: "application/json" }),
    require("./routes/webhook.routes")
);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/models", require("./routes/models.routes"));
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

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting général (NOUVEAU)
app.use("/api", generalLimiter);

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
// ... reste des routes

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// 404
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// NOUVEAU: Middleware d'erreurs (EN DERNIER)
// Tu vas créer ce fichier en Phase 2
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
/*
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

/**
 * 🔥 WEBHOOK STRIPE
 * ⚠️ DOIT ÊTRE AVANT express.json()
 */
/*
app.use(
    "/api/webhooks",
    bodyParser.raw({ type: "application/json" }),
    require("./routes/webhook.routes")
);

/**
 * ✅ PARSERS NORMAUX (APRÈS WEBHOOK)
 */
/*
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * 🔐 ROUTES API
 */
/*
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/models", require("./controllers/models.controller"));
app.use("/api/tags", require("./routes/tags.routes"));
app.use("/api/cart", require("./controllers/cart.controller"));
app.use("/api/checkout", require("./controllers/checkout.controller"));
app.use("/api/invoices", require("./routes/invoices.routes"));
app.use("/api/invoices", require("./routes/invoices.routes"));
app.use("/api/stripe", require("./routes/stripe.routes"));
app.use("/api", require("./routes/sellerDashboard.routes"));
app.use("/api", require("./routes/adminDashboard.routes"));

/**
 * 🧪 ROUTES TEST
 */
/*
app.get("/", (req, res) => {
    res.send("HytModel API is running ✅");
});

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

module.exports = app;


 */