const pool = require("../db/pool");

class GamesService {
    // Créer un jeu
    async createGame(data) {
        const { name, slug, description, icon_url } = data;

        const { rows } = await pool.query(
            `INSERT INTO games (name, slug, description, icon_url)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, slug, description, icon_url]
        );

        return rows[0];
    }

    // Lister tous les jeux
    async getAllGames(includeInactive = false) {
        const query = includeInactive
            ? "SELECT * FROM games ORDER BY name"
            : "SELECT * FROM games WHERE is_active = TRUE ORDER BY name";

        const { rows } = await pool.query(query);
        return rows;
    }

    // Récupérer un jeu par ID
    async getGameById(id) {
        const { rows } = await pool.query(
            "SELECT * FROM games WHERE id = $1",
            [id]
        );
        return rows[0] || null;
    }

    // Récupérer un jeu par slug
    async getGameBySlug(slug) {
        const { rows } = await pool.query(
            "SELECT * FROM games WHERE slug = $1",
            [slug]
        );
        return rows[0] || null;
    }

    // Mettre à jour un jeu
    async updateGame(id, data) {
        const { name, slug, description, icon_url, is_active } = data;

        const { rows } = await pool.query(
            `UPDATE games 
             SET name = COALESCE($1, name),
                 slug = COALESCE($2, slug),
                 description = COALESCE($3, description),
                 icon_url = COALESCE($4, icon_url),
                 is_active = COALESCE($5, is_active)
             WHERE id = $6
             RETURNING *`,
            [name, slug, description, icon_url, is_active, id]
        );

        return rows[0];
    }

    // Supprimer un jeu (hard delete)
    async deleteGame(id) {
        await pool.query("DELETE FROM games WHERE id = $1", [id]);
    }

    // Toggle active/inactive
    async toggleActive(id) {
        const { rows } = await pool.query(
            `UPDATE games 
             SET is_active = NOT is_active
             WHERE id = $1
             RETURNING *`,
            [id]
        );
        return rows[0];
    }

    // Récupérer les stats d'un jeu
    async getGameStats(gameId) {
        const { rows } = await pool.query(
            `SELECT 
                (SELECT COUNT(*) FROM categories WHERE game_id = $1) AS categories_count,
                (SELECT COUNT(*) FROM tags WHERE game_id = $1) AS tags_count,
                (SELECT COUNT(*) FROM game_versions WHERE game_id = $1) AS versions_count,
                (SELECT COUNT(*) FROM models WHERE game_id = $1) AS models_count
             FROM games WHERE id = $1`,
            [gameId]
        );
        return rows[0];
    }
}

module.exports = new GamesService();