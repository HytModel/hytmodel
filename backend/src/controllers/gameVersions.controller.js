const gameVersionsService = require("../services/gameVersions.service");

class GameVersionsController {
    // Créer une version (ADMIN/STAFF)
    async createVersion(req, res, next) {
        try {
            const { game_id, category_id, version, is_active } = req.body;

            if (!game_id || !version) {
                return res.status(400).json({ error: "game_id and version are required" });
            }

            const newVersion = await gameVersionsService.createVersion({
                game_id, category_id, version, is_active
            });

            res.status(201).json({ version: newVersion });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: "Version already exists for this game/category" });
            }
            if (error.code === '23503') {
                return res.status(404).json({ error: "Game or category not found" });
            }
            next(error);
        }
    }

    // Lister toutes les versions
    async getAllVersions(req, res, next) {
        try {
            const versions = await gameVersionsService.getAllVersions();
            res.json({ versions });
        } catch (error) {
            next(error);
        }
    }

    // Lister les versions d'un jeu
    async getVersionsByGame(req, res, next) {
        try {
            const includeInactive = req.query.includeInactive === 'true';
            const versions = await gameVersionsService.getVersionsByGame(
                req.params.gameId,
                includeInactive
            );
            res.json({ versions });
        } catch (error) {
            next(error);
        }
    }

    // Lister les versions d'une catégorie
    async getVersionsByCategory(req, res, next) {
        try {
            const includeInactive = req.query.includeInactive === 'true';
            const versions = await gameVersionsService.getVersionsByCategory(
                req.params.categoryId,
                includeInactive
            );
            res.json({ versions });
        } catch (error) {
            next(error);
        }
    }

    // Récupérer une version par ID
    async getVersionById(req, res, next) {
        try {
            const version = await gameVersionsService.getVersionById(req.params.id);

            if (!version) {
                return res.status(404).json({ error: "Version not found" });
            }

            res.json({ version });
        } catch (error) {
            next(error);
        }
    }

    // Mettre à jour une version (ADMIN/STAFF)
    async updateVersion(req, res, next) {
        try {
            const { version, is_active } = req.body;

            const updated = await gameVersionsService.updateVersion(req.params.id, {
                version, is_active
            });

            if (!updated) {
                return res.status(404).json({ error: "Version not found" });
            }

            res.json({ version: updated });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: "Version already exists" });
            }
            next(error);
        }
    }

    // Toggle active/inactive (ADMIN/STAFF)
    async toggleActive(req, res, next) {
        try {
            const version = await gameVersionsService.toggleActive(req.params.id);

            if (!version) {
                return res.status(404).json({ error: "Version not found" });
            }

            res.json({ version });
        } catch (error) {
            next(error);
        }
    }

    // Supprimer une version (ADMIN)
    async deleteVersion(req, res, next) {
        try {
            await gameVersionsService.deleteVersion(req.params.id);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    // Stats d'une version
    async getVersionStats(req, res, next) {
        try {
            const stats = await gameVersionsService.getVersionStats(req.params.id);
            res.json({ stats });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new GameVersionsController();