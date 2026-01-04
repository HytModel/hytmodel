const router = require("express").Router();
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("../db/pool");
const jwt = require("jsonwebtoken");

// ==================== CONFIGURATION ====================

// Configuration Discord
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    passport.use(new DiscordStrategy({
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: process.env.DISCORD_CALLBACK_URL || "http://localhost:3001/api/auth/discord/callback",
        scope: ["identify", "email"]
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            done(null, {
                provider: "discord",
                id: profile.id,
                username: profile.username,
                email: profile.email,
                avatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
                accessToken,
                refreshToken
            });
        } catch (error) {
            done(error, null);
        }
    }));
}

// Configuration Google
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3001/api/auth/google/callback",
        scope: ["profile", "email"]
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            done(null, {
                provider: "google",
                id: profile.id,
                username: profile.displayName,
                email: profile.emails?.[0]?.value,
                avatar: profile.photos?.[0]?.value,
                accessToken,
                refreshToken
            });
        } catch (error) {
            done(error, null);
        }
    }));
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ==================== HELPER FUNCTIONS ====================

async function findOrCreateUserFromOAuth(oauthData, existingUserId = null) {
    const { provider, id, username, email, avatar, accessToken, refreshToken } = oauthData;

    // Si on lie à un compte existant
    if (existingUserId) {
        // Vérifier que ce compte OAuth n'est pas déjà lié à un autre utilisateur
        const { rows: existingLink } = await pool.query(
            "SELECT user_id FROM user_oauth_accounts WHERE provider = $1 AND provider_user_id = $2",
            [provider, id]
        );

        if (existingLink[0] && existingLink[0].user_id !== existingUserId) {
            throw new Error("Ce compte est déjà lié à un autre utilisateur");
        }

        // Lier ou mettre à jour
        await pool.query(
            `INSERT INTO user_oauth_accounts 
             (user_id, provider, provider_user_id, provider_username, provider_email, provider_avatar_url, access_token, refresh_token, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
             ON CONFLICT (user_id, provider) DO UPDATE SET
                provider_user_id = $3,
                provider_username = $4,
                provider_email = $5,
                provider_avatar_url = $6,
                access_token = $7,
                refresh_token = $8,
                updated_at = NOW()`,
            [existingUserId, provider, id, username, email, avatar, accessToken, refreshToken]
        );

        const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [existingUserId]);
        return rows[0];
    }

    // Connexion/Inscription via OAuth
    // 1. Vérifier si ce compte OAuth est déjà lié
    const { rows: oauthAccount } = await pool.query(
        "SELECT user_id FROM user_oauth_accounts WHERE provider = $1 AND provider_user_id = $2",
        [provider, id]
    );

    if (oauthAccount[0]) {
        // Mettre à jour les tokens
        await pool.query(
            `UPDATE user_oauth_accounts 
             SET access_token = $1, refresh_token = $2, updated_at = NOW()
             WHERE provider = $3 AND provider_user_id = $4`,
            [accessToken, refreshToken, provider, id]
        );

        const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [oauthAccount[0].user_id]);
        return rows[0];
    }

    // 2. Vérifier si un utilisateur existe avec cet email
    if (email) {
        const { rows: existingUser } = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser[0]) {
            // Lier le compte OAuth à l'utilisateur existant
            await pool.query(
                `INSERT INTO user_oauth_accounts 
                 (user_id, provider, provider_user_id, provider_username, provider_email, provider_avatar_url, access_token, refresh_token)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [existingUser[0].id, provider, id, username, email, avatar, accessToken, refreshToken]
            );

            return existingUser[0];
        }
    }

    // 3. Créer un nouvel utilisateur
    // Générer un username unique
    let uniqueUsername = username.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20);
    let suffix = 1;
    while (true) {
        const { rows: check } = await pool.query(
            "SELECT id FROM users WHERE username = $1",
            [uniqueUsername]
        );
        if (!check[0]) break;
        uniqueUsername = `${username.substring(0, 16)}_${suffix++}`;
    }

    const { rows: newUser } = await pool.query(
        `INSERT INTO users (username, email, avatar_url, role)
         VALUES ($1, $2, $3, 'USER')
         RETURNING *`,
        [uniqueUsername, email, avatar]
    );

    // Lier le compte OAuth
    await pool.query(
        `INSERT INTO user_oauth_accounts 
         (user_id, provider, provider_user_id, provider_username, provider_email, provider_avatar_url, access_token, refresh_token)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [newUser[0].id, provider, id, username, email, avatar, accessToken, refreshToken]
    );

    return newUser[0];
}

function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

// ==================== DISCORD ROUTES ====================

// Démarrer l'auth Discord
router.get("/discord", (req, res, next) => {
    // Stocker l'ID utilisateur si c'est pour lier un compte
    if (req.query.link && req.query.token) {
        try {
            const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET);
            req.session = req.session || {};
            req.session.linkUserId = decoded.id;
        } catch (e) {
            // Token invalide, ignorer
        }
    }
    next();
}, passport.authenticate("discord"));

// Callback Discord
router.get("/discord/callback",
    passport.authenticate("discord", { failureRedirect: "/login?error=discord_failed" }),
    async (req, res) => {
        try {
            const oauthData = req.user;
            const linkUserId = req.session?.linkUserId;

            const user = await findOrCreateUserFromOAuth(oauthData, linkUserId);

            if (linkUserId) {
                // Rediriger vers le profil après liaison
                res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?linked=discord`);
            } else {
                // Générer un token et rediriger
                const token = generateToken(user);
                res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-callback?token=${token}`);
            }
        } catch (error) {
            console.error("Discord OAuth error:", error);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(error.message)}`);
        }
    }
);

// ==================== GOOGLE ROUTES ====================

// Démarrer l'auth Google
router.get("/google", (req, res, next) => {
    if (req.query.link && req.query.token) {
        try {
            const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET);
            req.session = req.session || {};
            req.session.linkUserId = decoded.id;
        } catch (e) {
            // Token invalide, ignorer
        }
    }
    next();
}, passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback Google
router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/login?error=google_failed" }),
    async (req, res) => {
        try {
            const oauthData = req.user;
            const linkUserId = req.session?.linkUserId;

            const user = await findOrCreateUserFromOAuth(oauthData, linkUserId);

            if (linkUserId) {
                res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile?linked=google`);
            } else {
                const token = generateToken(user);
                res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-callback?token=${token}`);
            }
        } catch (error) {
            console.error("Google OAuth error:", error);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=${encodeURIComponent(error.message)}`);
        }
    }
);

module.exports = router;