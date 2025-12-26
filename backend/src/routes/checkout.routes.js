const router = require("express").Router();
const Stripe = require("stripe");
const pool = require("../db/pool");
const { requireAuth } = require("../middlewares/requireAuth");
const { getOrCreateCart } = require("../utils/getCart");

function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        .test(value);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ================================
// 🚀 CHECKOUT STRIPE (FINAL)
// ================================
router.post("/checkout", requireAuth, async (req, res) => {
    const userId = req.user.id;

    if (!isUuid(userId)) {
        return res.status(400).json({ error: "Invalid user id" });
    }

    console.log("🚀 Checkout started for user:", userId);

    const cartId = await getOrCreateCart(userId);

    const { rows: items } = await pool.query(
        `
            SELECT m.id, m.title, m.price
            FROM cart_items ci
                     JOIN models m ON m.id = ci.model_id
            WHERE ci.cart_id = $1
              AND m.status = 'APPROVED'
              AND m.deleted_at IS NULL
              AND m.is_hidden = FALSE
        `,
        [cartId]
    );

    if (!items.length) {
        return res.status(400).json({ error: "Cart is empty" });
    }

    const line_items = items.map(item => ({
        price_data: {
            currency: "eur",
            product_data: { name: item.title },
            unit_amount: Math.round(Number(item.price) * 100)
        },
        quantity: 1
    }));

    // 🔑 SOURCE DE VÉRITÉ POUR LA FACTURE
    const metadataItems = items.map(i => ({
        model_id: i.id,
        title: i.title,
        price: Math.round(Number(i.price) * 100)
    }));

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items,
        success_url: `${process.env.FRONTEND_URL}/success`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        metadata: {
            user_id: userId,
            items: JSON.stringify(metadataItems)
        }
    });

    res.json({ url: session.url });
});

module.exports = router;
