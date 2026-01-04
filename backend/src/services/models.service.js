const pool = require("../db/pool");
const fs = require("fs");
const path = require("path");

class ModelsService {
    // Créer un modèle SIMPLE (ancienne méthode - gardée pour compatibilité)
    async createModel(data) {
        const { title, description, price, creatorId, filePath } = data;

        const { rows } = await pool.query(
            `INSERT INTO models (title, description, price, creator_id, file_path)
             VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
            [title, description || "", price, creatorId, filePath]
        );

        return rows[0];
    }

    // NOUVEAU : Créer un modèle avec game, category, tags et versions
    async createModelWithDetails(data) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const { title, description, price, creatorId, filePath, gameId, categoryId, tagIds, versionIds, youtubeUrl } = data;

            // Récupérer le type de créateur pour déterminer le statut initial
            const { rows: userRows } = await client.query(
                "SELECT creator_type FROM users WHERE id = $1",
                [creatorId]
            );
            const creatorType = userRows[0]?.creator_type || 'NON_AFFILIATED';

            // Déterminer le statut initial selon le type de créateur
            let initialStatus = 'PENDING'; // Par défaut en attente

            if (creatorType === 'HYTSTUDIO') {
                // HytStudio : toujours auto-approuvé
                initialStatus = 'APPROVED';
            } else if (creatorType === 'AFFILIATED' && parseFloat(price) <= 20) {
                // Affilié : auto-approuvé si prix <= 20€
                initialStatus = 'APPROVED';
            }

            // Créer le modèle
            const { rows } = await client.query(
                `INSERT INTO models (title, description, price, creator_id, file_path, game_id, category_id, youtube_url, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                     RETURNING *`,
                [title, description || "", price, creatorId, filePath, gameId, categoryId, youtubeUrl || null, initialStatus]
            );

            const model = rows[0];

            // Ajouter les tags
            if (tagIds && tagIds.length > 0) {
                for (const tagId of tagIds) {
                    await client.query(
                        `INSERT INTO model_tags (model_id, tag_id)
                         VALUES ($1, $2)
                             ON CONFLICT DO NOTHING`,
                        [model.id, tagId]
                    );
                }
            }

            // Ajouter les versions
            if (versionIds && versionIds.length > 0) {
                for (const versionId of versionIds) {
                    await client.query(
                        `INSERT INTO model_versions (model_id, version_id)
                         VALUES ($1, $2)
                             ON CONFLICT DO NOTHING`,
                        [model.id, versionId]
                    );
                }
            }

            await client.query('COMMIT');
            return model;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Récupérer un modèle
    async getModelById(id) {
        const { rows } = await pool.query(
            "SELECT * FROM models WHERE id = $1 AND deleted_at IS NULL",
            [id]
        );
        return rows[0] || null;
    }

    // NOUVEAU : Récupérer un modèle avec tous ses détails
    async getModelWithDetails(id, visitorIp = null, userId = null) {
        // 1. Enregistrer la vue (unique par IP/user par jour PAR MODÈLE)
        try {
            let shouldInsert = true;

            // Vérifier par user_id si connecté
            if (userId) {
                const { rows: userView } = await pool.query(
                    `SELECT id FROM model_views 
                     WHERE model_id = $1 
                     AND user_id = $2
                     AND viewed_at > NOW() - INTERVAL '24 hours'
                     LIMIT 1`,
                    [id, userId]
                );
                if (userView.length > 0) {
                    shouldInsert = false;
                }
            }

            // Sinon vérifier par IP
            if (shouldInsert && visitorIp) {
                const { rows: ipView } = await pool.query(
                    `SELECT id FROM model_views 
                     WHERE model_id = $1 
                     AND visitor_ip = $2
                     AND user_id IS NULL
                     AND viewed_at > NOW() - INTERVAL '24 hours'
                     LIMIT 1`,
                    [id, visitorIp]
                );
                if (ipView.length > 0) {
                    shouldInsert = false;
                }
            }

            // Insérer la vue si nécessaire
            if (shouldInsert && (visitorIp || userId)) {
                await pool.query(
                    `INSERT INTO model_views (model_id, visitor_ip, user_id)
                     VALUES ($1, $2, $3)`,
                    [id, visitorIp || null, userId || null]
                );

                // Mettre à jour le compteur dans models
                await pool.query(
                    `UPDATE models SET view_count = (
                        SELECT COUNT(*) FROM model_views WHERE model_id = $1
                    ) WHERE id = $1`,
                    [id]
                );
            }
        } catch (err) {
            console.error('Error tracking view:', err);
        }

        // 2. Récupérer le modèle avec les stats
        const { rows } = await pool.query(
            `SELECT m.*,
                    g.name AS game_name, g.slug AS game_slug,
                    c.name AS category_name, c.slug AS category_slug,
                    u.username AS creator_username,
                    u.display_name AS creator_display_name,
                    u.avatar_url AS creator_avatar_url,
                    COALESCE(ms.downloads, 0) AS download_count
             FROM models m
                      LEFT JOIN games g ON g.id = m.game_id
                      LEFT JOIN categories c ON c.id = m.category_id
                      LEFT JOIN users u ON u.id = m.creator_id
                      LEFT JOIN model_stats ms ON ms.model_id = m.id
             WHERE m.id = $1 AND m.deleted_at IS NULL`,
            [id]
        );

        if (!rows[0]) return null;

        const model = rows[0];

        // Récupérer les tags
        const { rows: tags } = await pool.query(
            `SELECT t.id, t.name
             FROM tags t
                      JOIN model_tags mt ON mt.tag_id = t.id
             WHERE mt.model_id = $1`,
            [id]
        );

        // Récupérer les versions
        const { rows: versions } = await pool.query(
            `SELECT gv.id, gv.version
             FROM game_versions gv
                      JOIN model_versions mv ON mv.version_id = gv.id
             WHERE mv.model_id = $1`,
            [id]
        );

        return {
            ...model,
            tags,
            versions
        };
    }

    // Vérifier propriétaire
    async isOwner(modelId, userId) {
        const model = await this.getModelById(modelId);
        return model && model.creator_id === userId;
    }

    // Mettre à jour un modèle (avec revalidation)
    async updateModel(id, data, userId) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const { title, description, price, gameId, categoryId, tagIds, versionIds, youtubeUrl } = data;

            // Récupérer le modèle actuel pour vérifier s'il était masqué ET sauvegarder les anciennes valeurs
            const { rows: currentModel } = await client.query(
                `SELECT id, title, description, price, game_id, category_id, youtube_url,
                        is_hidden, hidden_reason, status
                 FROM models WHERE id = $1`,
                [id]
            );

            if (!currentModel[0]) {
                throw new Error("Model not found");
            }

            const oldModel = currentModel[0];
            const wasHidden = oldModel.is_hidden;
            const previousReason = oldModel.hidden_reason;

            // Récupérer les anciens tags
            const { rows: oldTags } = await client.query(
                `SELECT tag_id FROM model_tags WHERE model_id = $1`,
                [id]
            );
            const oldTagIds = oldTags.map(t => t.tag_id);

            // Récupérer les anciennes versions
            const { rows: oldVersions } = await client.query(
                `SELECT version_id FROM model_versions WHERE model_id = $1`,
                [id]
            );
            const oldVersionIds = oldVersions.map(v => v.version_id);

            // Sauvegarder les anciennes valeurs pour comparaison par le staff
            const previousValues = {
                title: oldModel.title,
                description: oldModel.description,
                price: parseFloat(oldModel.price),
                game_id: oldModel.game_id,
                category_id: oldModel.category_id,
                youtube_url: oldModel.youtube_url,
                tag_ids: oldTagIds,
                version_ids: oldVersionIds
            };

            // Déterminer la raison de modification
            let modificationReason = 'CREATOR_UPDATE'; // Modification normale par le créateur
            if (wasHidden) {
                modificationReason = 'HIDDEN_CORRECTION'; // Correction suite à un masquage
            }

            // Récupérer le type de créateur pour déterminer le statut
            const { rows: userRows } = await client.query(
                "SELECT creator_type FROM users WHERE id = $1",
                [userId]
            );
            const creatorType = userRows[0]?.creator_type || 'NON_AFFILIATED';

            // Déterminer le statut selon le type de créateur
            // Si c'était masqué, toujours PENDING (correction requise)
            let newStatus = 'PENDING';

            if (!wasHidden) {
                if (creatorType === 'HYTSTUDIO') {
                    // HytStudio : toujours auto-approuvé
                    newStatus = 'APPROVED';
                } else if (creatorType === 'AFFILIATED' && parseFloat(price) <= 20) {
                    // Affilié : auto-approuvé si prix <= 20€
                    newStatus = 'APPROVED';
                }
            }

            // Mettre à jour le modèle
            const { rows } = await client.query(
                `UPDATE models
                 SET title = $1,
                     description = $2,
                     price = $3,
                     game_id = $4,
                     category_id = $5,
                     status = $6,
                     is_hidden = FALSE,
                     hidden_reason = NULL,
                     modification_reason = $7,
                     previous_hidden_reason = $8,
                     youtube_url = $9,
                     previous_values = $10,
                     updated_at = NOW()
                 WHERE id = $11 AND deleted_at IS NULL
                     RETURNING *`,
                [title, description, price, gameId, categoryId || null, newStatus, modificationReason, previousReason, youtubeUrl || null, JSON.stringify(previousValues), id]
            );

            if (!rows[0]) {
                throw new Error("Model not found");
            }

            // Mettre à jour les tags
            if (tagIds !== undefined) {
                // Supprimer les anciens tags
                await client.query("DELETE FROM model_tags WHERE model_id = $1", [id]);

                // Ajouter les nouveaux tags
                if (tagIds && tagIds.length > 0) {
                    for (const tagId of tagIds) {
                        await client.query(
                            `INSERT INTO model_tags (model_id, tag_id)
                             VALUES ($1, $2)
                                 ON CONFLICT DO NOTHING`,
                            [id, tagId]
                        );
                    }
                }
            }

            // Mettre à jour les versions
            if (versionIds !== undefined) {
                // Supprimer les anciennes versions
                await client.query("DELETE FROM model_versions WHERE model_id = $1", [id]);

                // Ajouter les nouvelles versions
                if (versionIds && versionIds.length > 0) {
                    for (const versionId of versionIds) {
                        await client.query(
                            `INSERT INTO model_versions (model_id, version_id)
                             VALUES ($1, $2)
                                 ON CONFLICT DO NOTHING`,
                            [id, versionId]
                        );
                    }
                }
            }

            await client.query('COMMIT');

            return {
                ...rows[0],
                was_hidden: wasHidden,
                modification_reason: modificationReason
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Lister les modèles approuvés (et non masqués)
    async listApprovedModels() {
        const { rows } = await pool.query(
            `SELECT m.id, m.title, m.description, m.price, m.created_at,
                    m.thumbnail_url, m.creator_id,
                    g.name AS game_name, c.name AS category_name,
                    u.username AS creator_username
             FROM models m
                      LEFT JOIN games g ON g.id = m.game_id
                      LEFT JOIN categories c ON c.id = m.category_id
                      LEFT JOIN users u ON u.id = m.creator_id
             WHERE m.status = 'APPROVED'
               AND m.is_hidden = FALSE
               AND m.deleted_at IS NULL
             ORDER BY m.created_at DESC`
        );
        return rows;
    }

    // Soft delete
    async softDeleteModel(id) {
        await pool.query(
            "UPDATE models SET deleted_at = now() WHERE id = $1",
            [id]
        );
    }

    // Vérifier achat
    async hasPurchased(userId, modelId) {
        const { rowCount } = await pool.query(
            "SELECT 1 FROM purchases WHERE user_id = $1 AND model_id = $2",
            [userId, modelId]
        );
        return rowCount > 0;
    }

    // Approuver un modèle
    async approveModel(id) {
        const { rowCount } = await pool.query(
            `UPDATE models
             SET status = 'APPROVED',
                 modification_reason = NULL,
                 previous_hidden_reason = NULL
             WHERE id = $1`,
            [id]
        );
        return rowCount > 0;
    }

    // Rejeter un modèle
    async rejectModel(id) {
        const { rowCount } = await pool.query(
            "UPDATE models SET status = 'REJECTED' WHERE id = $1",
            [id]
        );
        return rowCount > 0;
    }

    // Cacher un modèle
    async hideModel(id, reason) {
        await pool.query(
            "UPDATE models SET is_hidden = TRUE, hidden_reason = $2 WHERE id = $1",
            [id, reason || null]
        );
    }

    // Réafficher un modèle
    async unhideModel(id) {
        await pool.query(
            "UPDATE models SET is_hidden = FALSE, hidden_reason = NULL WHERE id = $1",
            [id]
        );
    }

    // ANCIEN : Recherche simple
    async searchModels(filters) {
        const { query, tags, minPrice, maxPrice } = filters;
        const values = [];
        let where = "WHERE m.status = 'APPROVED' AND m.is_hidden = FALSE AND m.deleted_at IS NULL";

        if (query) {
            values.push(`%${query.toLowerCase()}%`);
            where += ` AND LOWER(m.title) LIKE $${values.length}`;
        }

        if (minPrice) {
            values.push(minPrice);
            where += ` AND m.price >= $${values.length}`;
        }

        if (maxPrice) {
            values.push(maxPrice);
            where += ` AND m.price <= $${values.length}`;
        }

        if (tags) {
            const tagList = tags.split(",");
            values.push(tagList);
            where += ` AND EXISTS (
                SELECT 1 FROM model_tags mt 
                JOIN tags t ON t.id = mt.tag_id 
                WHERE mt.model_id = m.id AND t.name = ANY($${values.length})
            )`;
        }

        const { rows } = await pool.query(
            `SELECT m.id, m.title, m.price,
                    array_remove(array_agg(DISTINCT t.name), NULL) AS tags
             FROM models m
                      LEFT JOIN model_tags mt ON mt.model_id = m.id
                      LEFT JOIN tags t ON t.id = mt.tag_id
                 ${where}
             GROUP BY m.id
             ORDER BY m.created_at DESC`,
            values
        );

        return rows;
    }

    // NOUVEAU : Recherche avancée avec game, category, versions
    async searchModelsAdvanced(filters) {
        const { query, gameId, categoryId, tagIds, versionIds, minPrice, maxPrice } = filters;

        const values = [];
        let where = "WHERE m.status = 'APPROVED' AND m.is_hidden = FALSE AND m.deleted_at IS NULL";

        if (gameId) {
            values.push(gameId);
            where += ` AND m.game_id = $${values.length}`;
        }

        if (categoryId) {
            values.push(categoryId);
            where += ` AND m.category_id = $${values.length}`;
        }

        if (query) {
            values.push(`%${query.toLowerCase()}%`);
            where += ` AND LOWER(m.title) LIKE $${values.length}`;
        }

        if (minPrice) {
            values.push(minPrice);
            where += ` AND m.price >= $${values.length}`;
        }

        if (maxPrice) {
            values.push(maxPrice);
            where += ` AND m.price <= $${values.length}`;
        }

        let tagFilter = "";
        if (tagIds && tagIds.length > 0) {
            values.push(tagIds);
            tagFilter = `
                AND EXISTS (
                    SELECT 1 FROM model_tags mt
                    WHERE mt.model_id = m.id
                    AND mt.tag_id = ANY($${values.length})
                )
            `;
        }

        let versionFilter = "";
        if (versionIds && versionIds.length > 0) {
            values.push(versionIds);
            versionFilter = `
                AND EXISTS (
                    SELECT 1 FROM model_versions mv
                    WHERE mv.model_id = m.id
                    AND mv.version_id = ANY($${values.length})
                )
            `;
        }

        const { rows } = await pool.query(
            `SELECT m.*,
                    g.name AS game_name,
                    c.name AS category_name,
                    u.username AS creator_username,
                    u.display_name AS creator_display_name,
                    u.avatar_url AS creator_avatar_url,
                    array_remove(array_agg(DISTINCT t.name), NULL) AS tags
             FROM models m
                      LEFT JOIN games g ON g.id = m.game_id
                      LEFT JOIN categories c ON c.id = m.category_id
                      LEFT JOIN users u ON u.id = m.creator_id
                      LEFT JOIN model_tags mt ON mt.model_id = m.id
                      LEFT JOIN tags t ON t.id = mt.tag_id
                 ${where} ${tagFilter} ${versionFilter}
             GROUP BY m.id, g.name, c.name, u.username, u.display_name, u.avatar_url
             ORDER BY m.created_at DESC`,
            values
        );

        return rows;
    }

    // Stats d'un modèle
    async getModelStats(id) {
        const { rows } = await pool.query(
            "SELECT views, downloads FROM model_stats WHERE model_id = $1",
            [id]
        );
        return rows[0] || { views: 0, downloads: 0 };
    }

    // Noter un modèle (uniquement si acheté)
    async rateModel(modelId, userId, rating) {
        const model = await this.getModelById(modelId);
        if (!model || model.status !== 'APPROVED') {
            throw new Error("Model not found");
        }

        // Interdire de noter son propre modèle
        if (model.creator_id === userId) {
            throw new Error("You cannot rate your own model");
        }

        // NOUVEAU : Vérifier que l'utilisateur a acheté le modèle
        const hasPurchased = await this.hasPurchased(userId, modelId);
        if (!hasPurchased) {
            throw new Error("You must purchase this model before rating it");
        }

        // Insérer/mettre à jour la note
        await pool.query(
            `INSERT INTO model_reviews (model_id, user_id, rating)
             VALUES ($1, $2, $3)
                 ON CONFLICT (model_id, user_id)
             DO UPDATE SET rating = EXCLUDED.rating`,
            [modelId, userId, rating]
        );

        // Recalculer la moyenne
        const { rows } = await pool.query(
            `SELECT AVG(rating)::numeric(3,2) AS avg, COUNT(*) AS count
             FROM model_reviews
             WHERE model_id = $1`,
            [modelId]
        );

        await pool.query(
            "UPDATE models SET rating_avg = $1, rating_count = $2 WHERE id = $3",
            [rows[0].avg, rows[0].count, modelId]
        );

        return { rating_avg: rows[0].avg, rating_count: rows[0].count };
    }

    // Télécharger un modèle
    async downloadModel(modelId, userId) {
        const hasPurchased = await this.hasPurchased(userId, modelId);
        if (!hasPurchased) {
            throw new Error("You must purchase this model first");
        }

        const model = await this.getModelById(modelId);
        if (!model) {
            throw new Error("Model not found");
        }

        const filePath = model.file_path;
        if (!fs.existsSync(filePath)) {
            throw new Error("File not found on server");
        }

        await pool.query(
            `INSERT INTO model_stats (model_id, downloads)
             VALUES ($1, 1)
                 ON CONFLICT (model_id)
             DO UPDATE SET downloads = model_stats.downloads + 1`,
            [modelId]
        );

        return path.resolve(filePath);
    }

    // Restaurer un modèle
    async restoreModel(id) {
        await pool.query(
            "UPDATE models SET deleted_at = NULL WHERE id = $1",
            [id]
        );
    }

    // Supprimer définitivement
    async hardDeleteModel(id) {
        const model = await pool.query(
            "SELECT file_path FROM models WHERE id = $1",
            [id]
        );

        if (model.rows.length && model.rows[0].file_path) {
            const filePath = path.resolve(model.rows[0].file_path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await pool.query("DELETE FROM models WHERE id = $1", [id]);
    }
}

module.exports = new ModelsService();