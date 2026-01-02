const pool = require("../db/pool");

class AdminService {


    // Changer le rôle d'un utilisateur
    async setUserRole(userId, role) {
        const allowed = ["USER", "CREATOR", "STAFF", "ADMIN"];
        if (!allowed.includes(role)) {
            throw new Error("Invalid role");
        }

        await pool.query(
            "UPDATE users SET role = $1 WHERE id = $2",
            [role, userId]
        );
    }

    // Lister tous les utilisateurs
    async getAllUsers(filters = {}) {
        const { role, search, limit = 50, offset = 0 } = filters;

        let query = "SELECT id, username, email, role, is_banned, created_at FROM users WHERE 1=1";
        const values = [];

        if (role) {
            values.push(role);
            query += ` AND role = $${values.length}`;
        }

        if (search) {
            values.push(`%${search}%`);
            query += ` AND (username ILIKE $${values.length} OR email ILIKE $${values.length})`;
        }

        query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
        values.push(limit, offset);

        const { rows } = await pool.query(query, values);
        return rows;
    }

    // Récupérer un utilisateur par ID
    async getUserById(userId) {
        const { rows } = await pool.query(
            `SELECT id, username, email, role, stripe_account_id,
                    is_affiliated, created_at
             FROM users
             WHERE id = $1`,
            [userId]
        );
        return rows[0] || null;
    }

    // Bannir/Débannir un utilisateur
    async toggleUserBan(userId, banned) {
        await pool.query(
            "UPDATE users SET is_banned = $1 WHERE id = $2",
            [banned, userId]
        );
    }

    // Statistiques globales
    async getGlobalStats() {
        const stats = await pool.query(`
            SELECT
                    (SELECT COUNT(*) FROM users) AS total_users,
                    (SELECT COUNT(*) FROM users WHERE role = 'CREATOR') AS total_creators,
                    (SELECT COUNT(*) FROM models WHERE status = 'APPROVED') AS total_models,
                    (SELECT COUNT(*) FROM purchases) AS total_purchases,
                    (SELECT COALESCE(SUM(amount), 0) FROM payments) AS total_revenue
        `);

        return stats.rows[0];
    }

    // Modèles en attente d'approbation (avec raison de modification)
    async getPendingModels() {
        const {rows} = await pool.query(
            `SELECT m.id,
                    m.title,
                    m.price,
                    m.created_at,
                    m.modification_reason,
                    m.previous_hidden_reason,
                    u.username AS creator_username
             FROM models m
                      JOIN users u ON u.id = m.creator_id
             WHERE m.status = 'PENDING'
               AND m.deleted_at IS NULL
             ORDER BY m.created_at ASC`
        );
        return rows;
    }
    // Supprimer un utilisateur définitivement
    async deleteUser(userId) {
        await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    }
}

module.exports = new AdminService();