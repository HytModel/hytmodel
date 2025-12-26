const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
                 RETURNING id, username, email, role`,
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
    const { email, password } = req.body;
    const { rows } = await pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email]
    );

    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user);
    res.json({
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
        token
    });
}

async function me(req, res) {
    res.json({
        user: {
            id: req.user.id,
            username: req.user.username,
            role: req.user.role
        }
    });
}

module.exports = { register, login, me };