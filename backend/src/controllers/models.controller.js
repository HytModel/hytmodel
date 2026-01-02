const modelsService = require("../services/models.service");

const MIN_MODEL_PRICE = 5;

class ModelsController {
    // Upload d'un modèle SIMPLE (ancienne méthode - gardée)
    async uploadModel(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "File required" });
            }

            const { title, description, price } = req.body;

            const model = await modelsService.createModel({
                title,
                description,
                price: Number(price),
                creatorId: req.user.id,
                filePath: req.file.path
            });

            res.status(201).json({ model });
        } catch (error) {
            next(error);
        }
    }

    // NOUVEAU : Upload avec game, category, tags, versions
    async uploadModelWithDetails(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "File required" });
            }

            const { title, description, price, gameId, categoryId, tagIds, versionIds } = req.body;

            // Validation
            if (!gameId) {
                return res.status(400).json({ error: "Game is required" });
            }

            if (!categoryId) {
                return res.status(400).json({ error: "Category is required" });
            }

            // Parser les tableaux depuis JSON strings
            const parsedTagIds = typeof tagIds === 'string' ? JSON.parse(tagIds || '[]') : (tagIds || []);
            const parsedVersionIds = typeof versionIds === 'string' ? JSON.parse(versionIds || '[]') : (versionIds || []);

            const model = await modelsService.createModelWithDetails({
                title,
                description,
                price: Number(price),
                creatorId: req.user.id,
                filePath: req.file.path,
                gameId,
                categoryId,
                tagIds: parsedTagIds,
                versionIds: parsedVersionIds
            });

            res.status(201).json({ model });
        } catch (error) {
            next(error);
        }
    }

    // Mettre à jour un modèle (avec revalidation obligatoire)
    async updateModel(req, res, next) {
        try {
            const modelId = req.params.id;
            const { title, description, price, gameId, categoryId, tagIds, versionIds } = req.body;

            const isOwner = await modelsService.isOwner(modelId, req.user.id);
            const isStaff = ["STAFF", "ADMIN"].includes(req.user.role);

            if (!isOwner && !isStaff) {
                return res.status(403).json({ error: "Forbidden" });
            }

            // Parser les tableaux si nécessaire
            const parsedTagIds = typeof tagIds === 'string' ? JSON.parse(tagIds || '[]') : tagIds;
            const parsedVersionIds = typeof versionIds === 'string' ? JSON.parse(versionIds || '[]') : versionIds;

            const updated = await modelsService.updateModel(modelId, {
                title,
                description,
                price: Number(price),
                gameId,
                categoryId,
                tagIds: parsedTagIds,
                versionIds: parsedVersionIds
            }, req.user.id);

            if (!updated) {
                return res.status(404).json({ error: "Model not found" });
            }

            // Retourner les infos sur la modification
            res.json({
                model: updated,
                message: updated.was_hidden
                    ? "Produit modifié suite au masquage. En attente de revalidation."
                    : "Produit modifié. En attente de revalidation.",
                modification_reason: updated.modification_reason,
                requires_validation: true
            });
        } catch (error) {
            next(error);
        }
    }

    // Lister les modèles
    async listModels(req, res, next) {
        try {
            const models = await modelsService.listApprovedModels();
            res.json({ models });
        } catch (error) {
            next(error);
        }
    }

    // NOUVEAU : Récupérer un modèle avec détails
    async getModelWithDetails(req, res, next) {
        try {
            const model = await modelsService.getModelWithDetails(req.params.id);

            if (!model) {
                return res.status(404).json({ error: "Model not found" });
            }

            res.json({ model });
        } catch (error) {
            next(error);
        }
    }

    // Supprimer un modèle
    async deleteModel(req, res, next) {
        try {
            const modelId = req.params.id;

            const isOwner = await modelsService.isOwner(modelId, req.user.id);
            const isStaff = ["STAFF", "ADMIN"].includes(req.user.role);

            if (!isOwner && !isStaff) {
                return res.status(403).json({ error: "Forbidden" });
            }

            await modelsService.softDeleteModel(modelId);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    // Approuver un modèle
    async approveModel(req, res, next) {
        try {
            const success = await modelsService.approveModel(req.params.id);
            if (!success) {
                return res.status(404).json({ error: "Model not found" });
            }
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    // Rejeter un modèle
    async rejectModel(req, res, next) {
        try {
            const success = await modelsService.rejectModel(req.params.id);
            if (!success) {
                return res.status(404).json({ error: "Model not found" });
            }
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    // Cacher un modèle
    async hideModel(req, res, next) {
        try {
            const { reason } = req.body;
            await modelsService.hideModel(req.params.id, reason);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    // Réafficher un modèle
    async unhideModel(req, res, next) {
        try {
            await modelsService.unhideModel(req.params.id);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    // Rechercher des modèles (ancienne méthode)
    async searchModels(req, res, next) {
        try {
            const models = await modelsService.searchModels(req.query);
            res.json({ models });
        } catch (error) {
            next(error);
        }
    }

    // NOUVEAU : Recherche avancée
    async searchModelsAdvanced(req, res, next) {
        try {
            const { query, gameId, categoryId, tagIds, versionIds, minPrice, maxPrice } = req.query;

            // Parser les IDs
            const parsedTagIds = tagIds ? tagIds.split(',') : null;
            const parsedVersionIds = versionIds ? versionIds.split(',') : null;

            const models = await modelsService.searchModelsAdvanced({
                query,
                gameId,
                categoryId,
                tagIds: parsedTagIds,
                versionIds: parsedVersionIds,
                minPrice,
                maxPrice
            });

            res.json({ models });
        } catch (error) {
            next(error);
        }
    }

    // Stats d'un modèle
    async getStats(req, res, next) {
        try {
            const modelId = req.params.id;

            if (req.user.role !== "ADMIN") {
                const isOwner = await modelsService.isOwner(modelId, req.user.id);
                if (!isOwner) {
                    return res.status(403).json({ error: "Forbidden" });
                }
            }

            const stats = await modelsService.getModelStats(modelId);
            res.json({ stats });
        } catch (error) {
            next(error);
        }
    }

    // Noter un modèle
    async rateModel(req, res, next) {
        try {
            const { rating } = req.body;

            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({ error: "Rating must be between 1 and 5" });
            }

            const result = await modelsService.rateModel(
                req.params.id,
                req.user.id,
                rating
            );

            res.json({ success: true, ...result });
        } catch (error) {
            if (error.message === "Model not found") {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === "You cannot rate your own model") {
                return res.status(403).json({ error: error.message });
            }
            if (error.message === "You must purchase this model before rating it") {
                return res.status(403).json({ error: error.message });
            }
            next(error);
        }
    }

    // Télécharger un modèle
    async downloadModel(req, res, next) {
        try {
            const filePath = await modelsService.downloadModel(
                req.params.id,
                req.user.id
            );

            res.download(filePath);
        } catch (error) {
            if (error.message === "You must purchase this model first") {
                return res.status(403).json({ error: error.message });
            }
            if (error.message === "Model not found") {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === "File not found on server") {
                return res.status(404).json({ error: error.message });
            }
            next(error);
        }
    }

    // Restaurer un modèle
    async restoreModel(req, res, next) {
        try {
            const modelId = req.params.id;

            const isOwner = await modelsService.isOwner(modelId, req.user.id);
            const isStaff = ["STAFF", "ADMIN"].includes(req.user.role);

            if (!isOwner && !isStaff) {
                return res.status(403).json({ error: "Forbidden" });
            }

            await modelsService.restoreModel(modelId);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    // Supprimer définitivement
    async hardDeleteModel(req, res, next) {
        try {
            await modelsService.hardDeleteModel(req.params.id);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ModelsController();