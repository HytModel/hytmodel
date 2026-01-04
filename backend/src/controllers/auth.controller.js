const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const pool = require("../db/pool");

function signToken(user) {
    return jwt.sign(
        { id: user.id, role: user.role, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

async function register(req, res) {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
        return res.status(400).json({ error: "Missing fields" });

    const password_hash = await bcrypt.hash(password, 12);

    try {
        const { rows } = await pool.query(
            `INSERT INTO users (username, email, password_hash)
             VALUES ($1,$2,$3)
                 RETURNING id, username, email, role, avatar_url, display_name`,
            [username, email, password_hash]
        );

        const user = rows[0];
        const token = signToken(user);
        res.status(201).json({ user, token });
    } catch (e) {
        res.status(409).json({ error: "User already exists" });
    }
}

async function login(req, res) {
    const { email, password, totpCode } = req.body;

    console.log('=== LOGIN ATTEMPT ===')
    console.log('Email:', email)
    console.log('TOTP Code provided:', !!totpCode)

    const { rows } = await pool.query(
        `SELECT id, username, email, role, password_hash,
                avatar_url, display_name, bio,
                two_factor_enabled, two_factor_secret, two_factor_backup_codes,
                creator_type
         FROM users WHERE email = $1`,
        [email]
    );

    const user = rows[0];
    console.log('User found:', !!user)
    console.log('2FA enabled:', user?.two_factor_enabled)
    console.log('2FA secret exists:', !!user?.two_factor_secret)

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    // ========== VÉRIFICATION 2FA ==========
    if (user.two_factor_enabled) {
        console.log('2FA is enabled, checking code...')

        // Si pas de code TOTP fourni, demander le code
        if (!totpCode) {
            console.log('No TOTP code provided, requesting 2FA')
            return res.json({
                requires2FA: true,
                message: "Veuillez entrer votre code d'authentification"
            });
        }

        console.log('TOTP code provided, verifying...')

        // Vérifier le code TOTP
        const validTotp = speakeasy.totp.verify({
            secret: user.two_factor_secret,
            encoding: 'base32',
            token: totpCode,
            window: 1
        });

        console.log('TOTP valid:', validTotp)

        // Si le code TOTP n'est pas valide, vérifier les codes de secours
        if (!validTotp) {
            let validBackupCode = false;

            if (user.two_factor_backup_codes && user.two_factor_backup_codes.length > 0) {
                for (let i = 0; i < user.two_factor_backup_codes.length; i++) {
                    const isMatch = await bcrypt.compare(totpCode.toUpperCase(), user.two_factor_backup_codes[i]);
                    if (isMatch) {
                        validBackupCode = true;
                        // Supprimer le code de secours utilisé
                        const newBackupCodes = [...user.two_factor_backup_codes];
                        newBackupCodes.splice(i, 1);
                        await pool.query(
                            "UPDATE users SET two_factor_backup_codes = $1 WHERE id = $2",
                            [newBackupCodes, user.id]
                        );
                        console.log('Backup code used and removed')
                        break;
                    }
                }
            }

            if (!validBackupCode) {
                console.log('Invalid 2FA code')
                return res.status(401).json({ error: "Code 2FA invalide" });
            }
        }

        console.log('2FA verification successful')
    }
    // ========== FIN VÉRIFICATION 2FA ==========

    const token = signToken(user);
    res.json({
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar_url: user.avatar_url,
            display_name: user.display_name,
            bio: user.bio,
            creator_type: user.creator_type,
            two_factor_enabled: user.two_factor_enabled
        },
        token
    });
}

async function me(req, res) {
    try {
        const { rows } = await pool.query(
            `SELECT id, username, email, role, avatar_url, display_name, bio,
                    creator_type, two_factor_enabled
             FROM users WHERE id = $1`,
            [req.user.id]
        );

        if (!rows[0]) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ user: rows[0] });
    } catch (error) {
        console.error('Error in /me:', error);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = { register, login, me };