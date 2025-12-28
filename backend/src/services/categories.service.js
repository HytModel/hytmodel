const pool = require("../db/pool");

class CategoriesService {
    // Créer une catégorie
    async createCategory(data) {
        const { game_id, name, slug, description } = data;

        const { rows } = await pool.query(
            `INSERT INTO categories (game_id, name, slug, description)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [game_id, name, slug, description]
        );

        return rows[0];
    }

    // Lister toutes les catégories
    async getAllCategories() {
        const { rows } = await pool.query(
            `SELECT c.*, g.name AS game_name, g.slug AS game_slug
             FROM categories c
             JOIN games g ON g.id = c.game_id
             ORDER BY g.name, c.name`
        );
        return rows;
    }

    // Lister les catégories d'un jeu
    async getCategoriesByGame(gameId) {
        const { rows } = await pool.query(
            `SELECT * FROM categories 
             WHERE game_id = $1 
             ORDER BY name`,
            [gameId]
        );
        return rows;
    }

    // Récupérer une catégorie par ID
    async getCategoryById(id) {
        const { rows } = await pool.query(
            `SELECT c.*, g.name AS game_name
             FROM categories c
             JOIN games g ON g.id = c.game_id
             WHERE c.id = $1`,
            [id]
        );
        return rows[0] || null;
    }

    // Mettre à jour une catégorie
    async updateCategory(id, data) {
        const { name, slug, description } = data;

        const { rows } = await pool.query(
            `UPDATE categories 
             SET name = COALESCE($1, name),
                 slug = COALESCE($2, slug),
                 description = COALESCE($3, description)
             WHERE id = $4
             RETURNING *`,
            [name, slug, description, id]
        );

        return rows[0];
    }

    // Supprimer une catégorie
    async deleteCategory(id) {
        await pool.query("DELETE FROM categories WHERE id = $1", [id]);
    }

    // Compter les modèles d'une catégorie
    async getCategoryStats(categoryId) {
        const { rows } = await pool.query(
            `SELECT COUNT(*) AS models_count
             FROM models
             WHERE category_id = $1`,
            [categoryId]
        );
        return rows[0];
    }
}

module.exports = new CategoriesService();