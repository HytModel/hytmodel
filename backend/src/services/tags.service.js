const pool = require("../db/pool");

class TagsService {
    // Créer un tag (global ou lié à un jeu)
    async createTag(name, gameId = null) {
        const { rows } = await pool.query(
            "INSERT INTO tags (name, game_id) VALUES ($1, $2) RETURNING *",
            [name.toLowerCase(), gameId]
        );
        return rows[0];
    }

    // Lister tous les tags
    async getAllTags() {
        const { rows } = await pool.query(
            `SELECT t.*, g.name AS game_name, g.slug AS game_slug
             FROM tags t
             LEFT JOIN games g ON g.id = t.game_id
             ORDER BY g.name NULLS FIRST, t.name`
        );
        return rows;
    }

    // Lister les tags d'un jeu spécifique
    async getTagsByGame(gameId) {
        const { rows } = await pool.query(
            "SELECT * FROM tags WHERE game_id = $1 ORDER BY name",
            [gameId]
        );
        return rows;
    }

    // Lister les tags globaux (sans jeu)
    async getGlobalTags() {
        const { rows } = await pool.query(
            "SELECT * FROM tags WHERE game_id IS NULL ORDER BY name"
        );
        return rows;
    }

    // Récupérer un tag par ID
    async getTagById(id) {
        const { rows } = await pool.query(
            `SELECT t.*, g.name AS game_name
             FROM tags t
             LEFT JOIN games g ON g.id = t.game_id
             WHERE t.id = $1`,
            [id]
        );
        return rows[0] || null;
    }

    // Mettre à jour un tag
    async updateTag(id, name) {
        const { rows } = await pool.query(
            "UPDATE tags SET name = $1 WHERE id = $2 RETURNING *",
            [name.toLowerCase(), id]
        );
        return rows[0];
    }

    // Supprimer un tag
    async deleteTag(id) {
        await pool.query("DELETE FROM tags WHERE id = $1", [id]);
    }

    // Lier un tag à un modèle
    async addTagToModel(modelId, tagId) {
        await pool.query(
            `INSERT INTO model_tags (model_id, tag_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [modelId, tagId]
        );
    }

    // Retirer un tag d'un modèle
    async removeTagFromModel(modelId, tagId) {
        await pool.query(
            "DELETE FROM model_tags WHERE model_id = $1 AND tag_id = $2",
            [modelId, tagId]
        );
    }

    // Récupérer les tags d'un modèle
    async getModelTags(modelId) {
        const { rows } = await pool.query(
            `SELECT t.id, t.name, t.game_id
             FROM tags t
             JOIN model_tags mt ON mt.tag_id = t.id
             WHERE mt.model_id = $1
             ORDER BY t.name`,
            [modelId]
        );
        return rows;
    }

    // Stats d'un tag
    async getTagStats(tagId) {
        const { rows } = await pool.query(
            `SELECT COUNT(*) AS models_count
             FROM model_tags
             WHERE tag_id = $1`,
            [tagId]
        );
        return rows[0];
    }
}

module.exports = new TagsService();