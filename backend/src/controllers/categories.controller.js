const categoriesService = require("../services/categories.service");

class CategoriesController {
    // Créer une catégorie (ADMIN)
    async createCategory(req, res, next) {
        try {
            const { game_id, name, slug, description } = req.body;

            if (!game_id || !name || !slug) {
                return res.status(400).json({ error: "game_id, name and slug are required" });
            }

            const category = await categoriesService.createCategory({
                game_id, name, slug, description
            });

            res.status(201).json({ category });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: "Category already exists for this game" });
            }
            if (error.code === '23503') {
                return res.status(404).json({ error: "Game not found" });
            }
            next(error);
        }
    }

    // Lister toutes les catégories
    async getAllCategories(req, res, next) {
        try {
            const categories = await categoriesService.getAllCategories();
            res.json({ categories });
        } catch (error) {
            next(error);
        }
    }

    // Lister les catégories d'un jeu
    async getCategoriesByGame(req, res, next) {
        try {
            const categories = await categoriesService.getCategoriesByGame(req.params.gameId);
            res.json({ categories });
        } catch (error) {
            next(error);
        }
    }

    // Récupérer une catégorie par ID
    async getCategoryById(req, res, next) {
        try {
            const category = await categoriesService.getCategoryById(req.params.id);

            if (!category) {
                return res.status(404).json({ error: "Category not found" });
            }

            res.json({ category });
        } catch (error) {
            next(error);
        }
    }

    // Mettre à jour une catégorie (ADMIN)
    async updateCategory(req, res, next) {
        try {
            const { name, slug, description } = req.body;

            const category = await categoriesService.updateCategory(req.params.id, {
                name, slug, description
            });

            if (!category) {
                return res.status(404).json({ error: "Category not found" });
            }

            res.json({ category });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: "Category slug already exists for this game" });
            }
            next(error);
        }
    }

    // Supprimer une catégorie (ADMIN)
    async deleteCategory(req, res, next) {
        try {
            await categoriesService.deleteCategory(req.params.id);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    // Stats d'une catégorie
    async getCategoryStats(req, res, next) {
        try {
            const stats = await categoriesService.getCategoryStats(req.params.id);
            res.json({ stats });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CategoriesController();