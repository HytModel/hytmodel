const router = require("express").Router();
const pool = require("../db/pool");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");

// Changer le rôle d’un utilisateur (STAFF / CREATOR)
router.post(
    "/set-role",
    requireAuth,
    requireRole("STAFF", "ADMIN"),
    async (req, res) => {
        const { userId, role } = req.body;

        const allowed = ["USER", "CREATOR", "STAFF", "ADMIN"];
        if (!allowed.includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        await pool.query(
            "UPDATE users SET role = $1 WHERE id = $2",
            [role, userId]
        );

        res.json({ success: true });
    }
);

module.exports = router;
