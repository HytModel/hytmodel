const router = require("express").Router();
const Stripe = require("stripe");
const pool = require("../db/pool");
const { requireAuth } = require("../middlewares/requireAuth");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * 🔗 Création compte Stripe vendeur (Express)
 */
router.post("/connect/create", requireAuth, async (req, res) => {
    const { email, id: userId } = req.user;

    const account = await stripe.accounts.create({
        type: "express",
        country: "FR",
        email,
        capabilities: {
            transfers: { requested: true }
        }
    });

    await pool.query(
        "UPDATE users SET stripe_account_id = $1 WHERE id = $2",
        [account.id, userId]
    );

    const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.FRONTEND_URL}/stripe/refresh`,
        return_url: `${process.env.FRONTEND_URL}/stripe/success`,
        type: "account_onboarding"
    });

    res.json({ url: accountLink.url });
});

module.exports = router;
