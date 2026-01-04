const router = require("express").Router();
const { requireAuth } = require("../middlewares/requireAuth");
const pool = require("../db/pool");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

// Configuration multer pour les avatars
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = "uploads/avatars";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `avatar-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error("Only images are allowed"));
    }
});

// ==================== PROFIL ====================

// GET /api/profile - Récupérer son profil
router.get("/", requireAuth, async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT 
                u.id, u.username, u.email, u.role, u.creator_type,
                u.avatar_url, u.display_name, u.bio, u.website_url,
                u.social_discord, u.social_twitter, u.social_youtube,
                u.two_factor_enabled, u.created_at
             FROM users u
             WHERE u.id = $1`,
            [req.user.id]
        );

        if (!rows[0]) {
            return res.status(404).json({ error: "User not found" });
        }

        // Récupérer les comptes OAuth liés
        const { rows: oauthAccounts } = await pool.query(
            `SELECT provider, provider_username, provider_email, provider_avatar_url, created_at
             FROM user_oauth_accounts
             WHERE user_id = $1`,
            [req.user.id]
        );

        res.json({
            ...rows[0],
            oauth_accounts: oauthAccounts
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/profile - Mettre à jour son profil
router.put("/", requireAuth, uploadAvatar.single("avatar"), async (req, res, next) => {
    try {
        const { display_name, bio, website_url, social_discord, social_twitter, social_youtube } = req.body;

        let avatarUrl = null;
        if (req.file) {
            avatarUrl = `/uploads/avatars/${req.file.filename}`;

            // Supprimer l'ancien avatar si existant
            const { rows: oldUser } = await pool.query(
                "SELECT avatar_url FROM users WHERE id = $1",
                [req.user.id]
            );
            if (oldUser[0]?.avatar_url) {
                const oldPath = path.join(__dirname, "..", oldUser[0].avatar_url);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        }

        const updateFields = [];
        const values = [];
        let paramCount = 1;

        if (display_name !== undefined) {
            updateFields.push(`display_name = $${paramCount++}`);
            values.push(display_name || null);
        }
        if (bio !== undefined) {
            updateFields.push(`bio = $${paramCount++}`);
            values.push(bio || null);
        }
        if (website_url !== undefined) {
            updateFields.push(`website_url = $${paramCount++}`);
            values.push(website_url || null);
        }
        if (social_discord !== undefined) {
            updateFields.push(`social_discord = $${paramCount++}`);
            values.push(social_discord || null);
        }
        if (social_twitter !== undefined) {
            updateFields.push(`social_twitter = $${paramCount++}`);
            values.push(social_twitter || null);
        }
        if (social_youtube !== undefined) {
            updateFields.push(`social_youtube = $${paramCount++}`);
            values.push(social_youtube || null);
        }
        if (avatarUrl) {
            updateFields.push(`avatar_url = $${paramCount++}`);
            values.push(avatarUrl);
        }

        if (updateFields.length === 0) {
            return res.json({ message: "Nothing to update" });
        }

        values.push(req.user.id);

        await pool.query(
            `UPDATE users SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = $${paramCount}`,
            values
        );

        res.json({ success: true, avatar_url: avatarUrl });
    } catch (error) {
        next(error);
    }
});

// ==================== MOT DE PASSE ====================

// POST /api/profile/change-password
router.post("/change-password", requireAuth, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: "Current and new password required" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters" });
        }

        // Vérifier le mot de passe actuel
        const { rows } = await pool.query(
            "SELECT password FROM users WHERE id = $1",
            [req.user.id]
        );

        const validPassword = await bcrypt.compare(currentPassword, rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ error: "Current password is incorrect" });
        }

        // Hasher et mettre à jour
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2",
            [hashedPassword, req.user.id]
        );

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// ==================== 2FA ====================

// POST /api/profile/2fa/setup - Démarrer la config 2FA
router.post("/2fa/setup", requireAuth, async (req, res, next) => {
    try {
        // Générer un secret
        const secret = speakeasy.generateSecret({
            name: `HytMarket:${req.user.email}`,
            length: 20
        });

        // Générer le QR code
        const qrCode = await QRCode.toDataURL(secret.otpauth_url);

        // Stocker temporairement le secret (pas encore activé)
        await pool.query(
            "UPDATE users SET two_factor_secret = $1 WHERE id = $2",
            [secret.base32, req.user.id]
        );

        res.json({
            qrCode,
            secret: secret.base32
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/profile/2fa/verify - Vérifier et activer la 2FA
router.post("/2fa/verify", requireAuth, async (req, res, next) => {
    try {
        const { code } = req.body;

        // Récupérer le secret
        const { rows } = await pool.query(
            "SELECT two_factor_secret FROM users WHERE id = $1",
            [req.user.id]
        );

        if (!rows[0]?.two_factor_secret) {
            return res.status(400).json({ error: "2FA not set up" });
        }

        // Vérifier le code
        const verified = speakeasy.totp.verify({
            secret: rows[0].two_factor_secret,
            encoding: "base32",
            token: code,
            window: 1
        });

        if (!verified) {
            return res.status(400).json({ error: "Invalid code" });
        }

        // Générer des codes de secours
        const backupCodes = [];
        for (let i = 0; i < 10; i++) {
            backupCodes.push(crypto.randomBytes(4).toString("hex").toUpperCase());
        }

        // Hasher les codes de secours
        const hashedCodes = await Promise.all(
            backupCodes.map(code => bcrypt.hash(code, 10))
        );

        // Activer la 2FA
        await pool.query(
            `UPDATE users 
             SET two_factor_enabled = TRUE, two_factor_backup_codes = $1 
             WHERE id = $2`,
            [hashedCodes, req.user.id]
        );

        res.json({
            success: true,
            backupCodes // Retourner les codes non hashés (une seule fois)
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/profile/2fa/disable - Désactiver la 2FA
router.post("/2fa/disable", requireAuth, async (req, res, next) => {
    try {
        await pool.query(
            `UPDATE users 
             SET two_factor_enabled = FALSE, two_factor_secret = NULL, two_factor_backup_codes = NULL 
             WHERE id = $1`,
            [req.user.id]
        );

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// ==================== OAUTH ====================

// DELETE /api/profile/oauth/:provider - Déconnecter un compte OAuth
router.delete("/oauth/:provider", requireAuth, async (req, res, next) => {
    try {
        const { provider } = req.params;

        // Vérifier qu'il reste au moins un moyen de connexion
        const { rows: user } = await pool.query(
            "SELECT password FROM users WHERE id = $1",
            [req.user.id]
        );

        const { rows: oauthAccounts } = await pool.query(
            "SELECT COUNT(*) FROM user_oauth_accounts WHERE user_id = $1",
            [req.user.id]
        );

        const hasPassword = !!user[0]?.password;
        const oauthCount = parseInt(oauthAccounts[0].count);

        if (!hasPassword && oauthCount <= 1) {
            return res.status(400).json({
                error: "Vous devez avoir au moins un mot de passe ou un compte lié"
            });
        }

        await pool.query(
            "DELETE FROM user_oauth_accounts WHERE user_id = $1 AND provider = $2",
            [req.user.id, provider]
        );

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// ==================== SESSIONS ====================

// GET /api/profile/sessions - Lister les sessions actives
router.get("/sessions", requireAuth, async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT id, device_info, ip_address, last_active, created_at,
                    CASE WHEN token_hash = $2 THEN TRUE ELSE FALSE END as is_current
             FROM user_sessions 
             WHERE user_id = $1 AND expires_at > NOW()
             ORDER BY last_active DESC`,
            [req.user.id, req.sessionHash || '']
        );

        res.json({ sessions: rows });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/profile/sessions/:id - Révoquer une session
router.delete("/sessions/:id", requireAuth, async (req, res, next) => {
    try {
        await pool.query(
            "DELETE FROM user_sessions WHERE id = $1 AND user_id = $2",
            [req.params.id, req.user.id]
        );

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/profile/sessions - Révoquer toutes les autres sessions
router.delete("/sessions", requireAuth, async (req, res, next) => {
    try {
        await pool.query(
            "DELETE FROM user_sessions WHERE user_id = $1 AND token_hash != $2",
            [req.user.id, req.sessionHash || '']
        );

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

module.exports = router;