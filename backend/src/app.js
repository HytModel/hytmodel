const express = require("express");
const bodyParser = require("body-parser");

const app = express();

/**
 * 🔥 WEBHOOK STRIPE
 * ⚠️ DOIT ÊTRE AVANT express.json()
 */
app.use(
    "/api/webhooks",
    bodyParser.raw({ type: "application/json" }),
    require("./routes/webhook.routes")
);

/**
 * ✅ PARSERS NORMAUX (APRÈS WEBHOOK)
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * 🔐 ROUTES API
 */
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/models", require("./routes/models.routes"));
app.use("/api/tags", require("./routes/tags.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/checkout", require("./routes/checkout.routes"));
app.use("/api/invoices", require("./routes/invoices.routes"));
app.use("/api/invoices", require("./routes/invoices.routes"));
app.use("/api/stripe", require("./routes/stripe.routes"));
app.use("/api", require("./routes/sellerDashboard.routes"));
app.use("/api", require("./routes/adminDashboard.routes"));

/**
 * 🧪 ROUTES TEST
 */
app.get("/", (req, res) => {
    res.send("HytModel API is running ✅");
});

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

module.exports = app;
