const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
    console.log("Authorization header:", req.headers.authorization);

    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "Unauthorized" });

    const token = header.replace("Bearer ", "");

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        console.error("JWT ERROR:", err.message);
        return res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = { requireAuth };