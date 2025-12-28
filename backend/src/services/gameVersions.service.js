const pool = require("../db/pool");

class GameVersionsService {
    // Créer une version
    async createVersion(data) {
        const { game_id, category_id, version, is_active } = data;

        const { rows } = await pool.query(
            `INSERT INTO game_versions (game_id, category_id, version, is_active)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [game_id, category_id || null, version, is_active ?? true]
        );

        return rows[0];
    }

    // Lister toutes les versions
    async getAllVersions() {
        const { rows } = await pool.query(
            `SELECT gv.*, 
                    g.name AS game_name, 
                    g.slug AS game_slug,
                    c.name AS category_name
             FROM game_versions gv
             JOIN games g ON g.id = gv.game_id
             LEFT JOIN categories c ON c.id = gv.category_id
             ORDER BY g.name, c.name, gv.version DESC`
        );
        return rows;
    }

    // Lister les versions d'un jeu
    async getVersionsByGame(gameId, includeInactive = false) {
        const query = includeInactive
            ? `SELECT gv.*, c.name AS category_name
               FROM game_versions gv
               LEFT JOIN categories c ON c.id = gv.category_id
               WHERE gv.game_id = $1
               ORDER BY gv.version DESC`
            : `SELECT gv.*, c.name AS category_name
               FROM game_versions gv
               LEFT JOIN categories c ON c.id = gv.category_id
               WHERE gv.game_id = $1 AND gv.is_active = TRUE
               ORDER BY gv.version DESC`;

        const { rows } = await pool.query(query, [gameId]);
        return rows;
    }

    // Lister les versions d'une catégorie
    async getVersionsByCategory(categoryId, includeInactive = false) {
        const query = includeInactive
            ? `SELECT * FROM game_versions WHERE category_id = $1 ORDER BY version DESC`
            : `SELECT * FROM game_versions WHERE category_id = $1 AND is_active = TRUE ORDER BY version DESC`;

        const { rows } = await pool.query(query, [categoryId]);
        return rows;
    }

    // Récupérer une version par ID
    async getVersionById(id) {
        const { rows } = await pool.query(
            `SELECT gv.*,
                    g.name AS game_name,
                    c.name AS category_name
             FROM game_versions gv
             JOIN games g ON g.id = gv.game_id
             LEFT JOIN categories c ON c.id = gv.category_id
             WHERE gv.id = $1`,
            [id]
        );
        return rows[0] || null;
    }

    // Mettre à jour une version
    async updateVersion(id, data) {
        const { version, is_active } = data;

        const { rows } = await pool.query(
            `UPDATE game_versions 
             SET version = COALESCE($1, version),
                 is_active = COALESCE($2, is_active)
             WHERE id = $3
             RETURNING *`,
            [version, is_active, id]
        );

        return rows[0];
    }

    // Supprimer une version
    async deleteVersion(id) {
        await pool.query("DELETE FROM game_versions WHERE id = $1", [id]);
    }

    // Toggle active/inactive
    async toggleActive(id) {
        const { rows } = await pool.query(
            `UPDATE game_versions 
             SET is_active = NOT is_active
             WHERE id = $1
             RETURNING *`,
            [id]
        );
        return rows[0];
    }

    // Compter les modèles utilisant cette version
    async getVersionStats(versionId) {
        const { rows } = await pool.query(
            `SELECT COUNT(*) AS models_count
             FROM model_versions
             WHERE version_id = $1`,
            [versionId]
        );
        return rows[0];
    }
}

module.exports = new GameVersionsService();