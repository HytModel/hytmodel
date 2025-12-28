const tagsService = require("../services/tags.service");

class TagsController {
    // Créer un tag (STAFF/ADMIN)
    async createTag(req, res, next) {
        try {
            const { name, game_id } = req.body;

            if (!name || name.length < 2) {
                return res.status(400).json({ error: "Invalid tag name" });
            }

            const tag = await tagsService.createTag(name, game_id || null);

            if (!tag) {
                return res.status(409).json({ error: "Tag already exists" });
            }

            res.status(201).json({ tag });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: "Tag already exists for this game" });
            }
            if (error.code === '23503') {
                return res.status(404).json({ error: "Game not found" });
            }
            next(error);
        }
    }

    // Lister tous les tags (public)
    async getAllTags(req, res, next) {
        try {
            const tags = await tagsService.getAllTags();
            res.json({ tags });
        } catch (error) {
            next(error);
        }
    }

    // Lister les tags d'un jeu (public)
    async getTagsByGame(req, res, next) {
        try {
            const tags = await tagsService.getTagsByGame(req.params.gameId);
            res.json({ tags });
        } catch (error) {
            next(error);
        }
    }

    // Lister les tags globaux (public)
    async getGlobalTags(req, res, next) {
        try {
            const tags = await tagsService.getGlobalTags();
            res.json({ tags });
        } catch (error) {
            next(error);
        }
    }

    // Récupérer un tag par ID
    async getTagById(req, res, next) {
        try {
            const tag = await tagsService.getTagById(req.params.id);

            if (!tag) {
                return res.status(404).json({ error: "Tag not found" });
            }

            res.json({ tag });
        } catch (error) {
            next(error);
        }
    }

    // Mettre à jour un tag (STAFF/ADMIN)
    async updateTag(req, res, next) {
        try {
            const { name } = req.body;

            if (!name || name.length < 2) {
                return res.status(400).json({ error: "Invalid tag name" });
            }

            const tag = await tagsService.updateTag(req.params.id, name);

            if (!tag) {
                return res.status(404).json({ error: "Tag not found" });
            }

            res.json({ tag });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: "Tag already exists" });
            }
            next(error);
        }
    }

    // Supprimer un tag (STAFF/ADMIN)
    async deleteTag(req, res, next) {
        try {
            await tagsService.deleteTag(req.params.id);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    // Récupérer les tags d'un modèle
    async getModelTags(req, res, next) {
        try {
            const { modelId } = req.params;
            const tags = await tagsService.getModelTags(modelId);
            res.json({ tags });
        } catch (error) {
            next(error);
        }
    }

    // Ajouter un tag à un modèle (STAFF/ADMIN)
    async addTagToModel(req, res, next) {
        try {
            const { modelId, tagId } = req.params;
            await tagsService.addTagToModel(modelId, tagId);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    // Retirer un tag d'un modèle (STAFF/ADMIN)
    async removeTagFromModel(req, res, next) {
        try {
            const { modelId, tagId } = req.params;
            await tagsService.removeTagFromModel(modelId, tagId);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    // Stats d'un tag
    async getTagStats(req, res, next) {
        try {
            const stats = await tagsService.getTagStats(req.params.id);
            res.json({ stats });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TagsController();