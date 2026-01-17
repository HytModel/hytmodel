const router = require("express").Router();
const Stripe = require("stripe");
const pool = require("../db/pool");
const { requireAuth } = require("../middlewares/requireAuth");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * 🔗 Création compte Stripe vendeur (Express)
 */
router.post("/connect/create", requireAuth, async (req, res) => {
    try {
        const { email, id: userId } = req.user;

        // Vérifier si l'utilisateur a déjà un compte Stripe
        const { rows: existingUser } = await pool.query(
            "SELECT stripe_account_id FROM users WHERE id = $1",
            [userId]
        );

        let accountId = existingUser[0]?.stripe_account_id;

        // Si pas de compte, en créer un
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: "express",
                country: "FR",
                email,
                capabilities: {
                    transfers: { requested: true }
                }
            });

            accountId = account.id;

            await pool.query(
                "UPDATE users SET stripe_account_id = $1 WHERE id = $2",
                [accountId, userId]
            );
        }

        // Créer le lien d'onboarding (fonctionne même si compte existe déjà)
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.FRONTEND_URL}/stripe/refresh`,
            return_url: `${process.env.FRONTEND_URL}/stripe/success`,
            type: "account_onboarding"
        });

        res.json({ url: accountLink.url });
    } catch (error) {
        console.error("Stripe connect create error:", error);
        res.status(500).json({ error: "Failed to create Stripe account" });
    }
});

/**
 * 🔄 Sync le statut Stripe Connect (vérifie si onboarding terminé)
 */
router.get("/connect/status", requireAuth, async (req, res) => {
    try {
        const { rows } = await pool.query(
            "SELECT stripe_account_id FROM users WHERE id = $1",
            [req.user.id]
        );

        const stripeAccountId = rows[0]?.stripe_account_id;

        if (!stripeAccountId) {
            return res.json({
                connected: false,
                onboarded: false,
                charges_enabled: false,
                payouts_enabled: false
            });
        }

        // Récupérer le statut depuis Stripe
        const account = await stripe.accounts.retrieve(stripeAccountId);

        const isOnboarded = account.details_submitted &&
            account.charges_enabled &&
            account.payouts_enabled;

        // Mettre à jour la DB
        await pool.query(
            `UPDATE users 
             SET stripe_charges_enabled = $1,
                 stripe_payouts_enabled = $2,
                 stripe_onboarded = $3,
                 stripe_onboarded_at = CASE 
                     WHEN $3 = TRUE AND (stripe_onboarded = FALSE OR stripe_onboarded IS NULL) THEN NOW() 
                     ELSE stripe_onboarded_at 
                 END
             WHERE id = $4`,
            [account.charges_enabled, account.payouts_enabled, isOnboarded, req.user.id]
        );

        console.log(`📋 Stripe status synced for user ${req.user.id}:`, {
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            onboarded: isOnboarded
        });

        res.json({
            connected: true,
            onboarded: isOnboarded,
            details_submitted: account.details_submitted,
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled
        });
    } catch (error) {
        console.error("Stripe status error:", error);
        res.status(500).json({ error: "Failed to get Stripe status" });
    }
});

/**
 * 🔗 Obtenir le lien vers le dashboard Stripe Express
 */
router.get("/connect/dashboard", requireAuth, async (req, res) => {
    try {
        const { rows } = await pool.query(
            "SELECT stripe_account_id FROM users WHERE id = $1",
            [req.user.id]
        );

        const stripeAccountId = rows[0]?.stripe_account_id;

        if (!stripeAccountId) {
            return res.status(400).json({ error: "No Stripe account connected" });
        }

        const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);

        res.json({ url: loginLink.url });
    } catch (error) {
        console.error("Stripe dashboard link error:", error);
        res.status(500).json({ error: "Failed to create dashboard link" });
    }
});

module.exports = router;