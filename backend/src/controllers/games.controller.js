const gamesService = require("../services/games.service");

class GamesController {
    // Créer un jeu (ADMIN)
    async createGame(req, res, next) {
        try {
            const { name, slug, description, icon_url } = req.body;

            if (!name || !slug) {
                return res.status(400).json({ error: "Name and slug are required" });
            }

            const game = await gamesService.createGame({ name, slug, description, icon_url });
            res.status(201).json({ game });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: "Game already exists" });
            }
            next(error);
        }
    }

    // Lister tous les jeux
    async getAllGames(req, res, next) {
        try {
            const includeInactive = req.query.includeInactive === 'true';
            const games = await gamesService.getAllGames(includeInactive);
            res.json({ games });
        } catch (error) {
            next(error);
        }
    }

    // Récupérer un jeu par ID
    async getGameById(req, res, next) {
        try {
            const game = await gamesService.getGameById(req.params.id);

            if (!game) {
                return res.status(404).json({ error: "Game not found" });
            }

            res.json({ game });
        } catch (error) {
            next(error);
        }
    }

    // Récupérer un jeu par slug
    async getGameBySlug(req, res, next) {
        try {
            const game = await gamesService.getGameBySlug(req.params.slug);

            if (!game) {
                return res.status(404).json({ error: "Game not found" });
            }

            res.json({ game });
        } catch (error) {
            next(error);
        }
    }

    // Mettre à jour un jeu (ADMIN)
    async updateGame(req, res, next) {
        try {
            const { name, slug, description, icon_url, is_active } = req.body;

            const game = await gamesService.updateGame(req.params.id, {
                name, slug, description, icon_url, is_active
            });

            if (!game) {
                return res.status(404).json({ error: "Game not found" });
            }

            res.json({ game });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: "Game name or slug already exists" });
            }
            next(error);
        }
    }

    // Supprimer un jeu (ADMIN)
    async deleteGame(req, res, next) {
        try {
            await gamesService.deleteGame(req.params.id);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    // Toggle active/inactive (ADMIN)
    async toggleActive(req, res, next) {
        try {
            const game = await gamesService.toggleActive(req.params.id);

            if (!game) {
                return res.status(404).json({ error: "Game not found" });
            }

            res.json({ game });
        } catch (error) {
            next(error);
        }
    }

    // Stats d'un jeu
    async getGameStats(req, res, next) {
        try {
            const stats = await gamesService.getGameStats(req.params.id);
            res.json({ stats });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new GamesController();