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

    // Modèles en attente d'approbation (avec raison de modification et anciennes valeurs)
    async getPendingModels() {
        const { rows } = await pool.query(
            `SELECT m.id, m.title, m.description, m.price, m.created_at, m.thumbnail_url,
                    m.game_id, m.category_id, m.youtube_url,
                    m.modification_reason, m.previous_hidden_reason, m.previous_values,
                    u.username AS creator_username,
                    g.name AS game_name,
                    c.name AS category_name
             FROM models m
                      JOIN users u ON u.id = m.creator_id
                      LEFT JOIN games g ON g.id = m.game_id
                      LEFT JOIN categories c ON c.id = m.category_id
             WHERE m.status = 'PENDING' AND m.deleted_at IS NULL
             ORDER BY m.created_at ASC`
        );

        // Récupérer les tags et versions pour chaque modèle
        for (const model of rows) {
            const { rows: tags } = await pool.query(
                `SELECT t.id, t.name FROM tags t
                                              JOIN model_tags mt ON mt.tag_id = t.id
                 WHERE mt.model_id = $1`,
                [model.id]
            );
            model.tags = tags;

            const { rows: versions } = await pool.query(
                `SELECT v.id, v.version FROM game_versions v
                                                 JOIN model_versions mv ON mv.version_id = v.id
                 WHERE mv.model_id = $1`,
                [model.id]
            );
            model.versions = versions;
        }

        return rows;
    }

    // Supprimer un utilisateur définitivement
    async deleteUser(userId) {
        await pool.query("DELETE FROM users WHERE id = $1", [userId]);
    }
}

module.exports = new AdminService();