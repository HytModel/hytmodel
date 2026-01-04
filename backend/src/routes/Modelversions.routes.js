const router = require("express").Router();
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");
const pool = require("../db/pool");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuration multer pour upload des fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../../uploads/models");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = [".zip", ".rar", ".7z", ".tar", ".gz"];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Type de fichier non autorisé. Utilisez: zip, rar, 7z, tar, gz"));
        }
    },
});

// ============================================
// ROUTES PUBLIQUES (pour les acheteurs)
// ============================================

// GET /api/model-versions/:modelId - Obtenir toutes les versions d'un produit
router.get("/:modelId", async (req, res, next) => {
    try {
        const { modelId } = req.params;
        const { gameVersionId } = req.query;

        let query = `
            SELECT
                mfv.*,
                COALESCE(
                        json_agg(
                                json_build_object(
                                        'id', gv.id,
                                        'version', gv.version
                                )
                        ) FILTER (WHERE gv.id IS NOT NULL),
                        '[]'
                ) as compatible_versions
            FROM model_file_versions mfv
                     LEFT JOIN model_file_version_compatibilities mfvc ON mfvc.file_version_id = mfv.id
                     LEFT JOIN game_versions gv ON gv.id = mfvc.game_version_id
            WHERE mfv.model_id = $1 AND mfv.is_active = true
        `;

        const params = [modelId];

        if (gameVersionId) {
            query += ` AND EXISTS (
                SELECT 1 FROM model_file_version_compatibilities 
                WHERE file_version_id = mfv.id AND game_version_id = $2
            )`;
            params.push(gameVersionId);
        }

        query += ` GROUP BY mfv.id ORDER BY mfv.created_at DESC`;

        const { rows } = await pool.query(query, params);

        res.json({ versions: rows });
    } catch (error) {
        next(error);
    }
});

// GET /api/model-versions/:modelId/latest - Obtenir la dernière version
router.get("/:modelId/latest", async (req, res, next) => {
    try {
        const { modelId } = req.params;
        const { gameVersionId } = req.query;

        let query = `
            SELECT
                mfv.*,
                COALESCE(
                        json_agg(
                                json_build_object(
                                        'id', gv.id,
                                        'version', gv.version
                                )
                        ) FILTER (WHERE gv.id IS NOT NULL),
                        '[]'
                ) as compatible_versions
            FROM model_file_versions mfv
                     LEFT JOIN model_file_version_compatibilities mfvc ON mfvc.file_version_id = mfv.id
                     LEFT JOIN game_versions gv ON gv.id = mfvc.game_version_id
            WHERE mfv.model_id = $1 AND mfv.is_active = true
        `;

        const params = [modelId];

        if (gameVersionId) {
            query += ` AND EXISTS (
                SELECT 1 FROM model_file_version_compatibilities 
                WHERE file_version_id = mfv.id AND game_version_id = $2
            )`;
            params.push(gameVersionId);
        } else {
            query += ` AND mfv.is_latest = true`;
        }

        query += ` GROUP BY mfv.id ORDER BY mfv.created_at DESC LIMIT 1`;

        const { rows } = await pool.query(query, params);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Aucune version trouvée" });
        }

        res.json({ version: rows[0] });
    } catch (error) {
        next(error);
    }
});

// GET /api/model-versions/:modelId/download/:versionId - Télécharger une version spécifique
router.get("/:modelId/download/:versionId", requireAuth, async (req, res, next) => {
    try {
        const { modelId, versionId } = req.params;
        const userId = req.user.id;

        // Vérifier que l'utilisateur a acheté le produit
        const { rows: purchases } = await pool.query(`
            SELECT id FROM purchases WHERE user_id = $1 AND model_id = $2
        `, [userId, modelId]);

        // Vérifier si c'est le propriétaire du produit
        const { rows: ownership } = await pool.query(`
            SELECT id FROM models WHERE id = $1 AND creator_id = $2
        `, [modelId, userId]);

        if (purchases.length === 0 && ownership.length === 0) {
            return res.status(403).json({ error: "Vous devez acheter ce produit pour le télécharger" });
        }

        // Récupérer la version
        const { rows } = await pool.query(`
            SELECT * FROM model_file_versions
            WHERE id = $1 AND model_id = $2 AND is_active = true
        `, [versionId, modelId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Version non trouvée" });
        }

        const version = rows[0];

        // Incrémenter le compteur de téléchargements
        await pool.query(`
            UPDATE model_file_versions
            SET download_count = download_count + 1
            WHERE id = $1
        `, [versionId]);

        // Construire le chemin du fichier (gérer les backslashes Windows)
        const fileUrl = version.file_url.replace(/\\/g, '/');
        const filePath = path.join(__dirname, "../../", fileUrl);

        if (fs.existsSync(filePath)) {
            res.download(filePath, version.file_name || "download.zip");
        } else {
            res.json({ downloadUrl: version.file_url });
        }
    } catch (error) {
        next(error);
    }
});

// ============================================
// ROUTES VENDEUR (CREATOR)
// ============================================

// POST /api/model-versions/:modelId - Ajouter une nouvelle version
router.post("/:modelId", requireAuth, requireRole("CREATOR", "STAFF", "ADMIN"), upload.single("file"), async (req, res, next) => {
    try {
        const { modelId } = req.params;
        const { versionNumber, changelog, compatibleVersions, isLatest } = req.body;
        const userId = req.user.id;

        // Vérifier que le produit appartient au vendeur
        const { rows: models } = await pool.query(`
            SELECT id, creator_id FROM models WHERE id = $1
        `, [modelId]);

        if (models.length === 0) {
            return res.status(404).json({ error: "Produit non trouvé" });
        }

        // Vérifier ownership (sauf admin/staff)
        if (models[0].creator_id !== userId && !["STAFF", "ADMIN"].includes(req.user.role)) {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à modifier ce produit" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "Fichier requis" });
        }

        if (!versionNumber) {
            return res.status(400).json({ error: "Numéro de version requis" });
        }

        // Vérifier si cette version existe déjà
        const { rows: existing } = await pool.query(`
            SELECT id FROM model_file_versions
            WHERE model_id = $1 AND version_number = $2
        `, [modelId, versionNumber]);

        if (existing.length > 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: "Cette version existe déjà" });
        }

        const fileUrl = `uploads/models/${req.file.filename}`;
        const shouldBeLatest = isLatest === "true" || isLatest === true;

        // Créer la nouvelle version
        const { rows } = await pool.query(`
            INSERT INTO model_file_versions
            (model_id, version_number, file_url, file_size, file_name, changelog, is_latest, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7, true)
                RETURNING *
        `, [
            modelId,
            versionNumber,
            fileUrl,
            req.file.size,
            req.file.originalname,
            changelog || null,
            shouldBeLatest
        ]);

        const newVersion = rows[0];

        // Ajouter les compatibilités de version du jeu
        if (compatibleVersions) {
            const versions = JSON.parse(compatibleVersions);
            for (const gameVersionId of versions) {
                await pool.query(`
                    INSERT INTO model_file_version_compatibilities (file_version_id, game_version_id)
                    VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                `, [newVersion.id, gameVersionId]);
            }
        }

        // Récupérer les versions compatibles pour la réponse
        const { rows: compatibilities } = await pool.query(`
            SELECT gv.id, gv.version
            FROM model_file_version_compatibilities mfvc
                     JOIN game_versions gv ON gv.id = mfvc.game_version_id
            WHERE mfvc.file_version_id = $1
        `, [newVersion.id]);

        res.status(201).json({
            version: {
                ...newVersion,
                compatible_versions: compatibilities
            }
        });
    } catch (error) {
        if (req.file) {
            try { fs.unlinkSync(req.file.path); } catch (e) {}
        }
        next(error);
    }
});

// PUT /api/model-versions/:modelId/:versionId - Modifier une version
router.put("/:modelId/:versionId", requireAuth, requireRole("CREATOR", "STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { modelId, versionId } = req.params;
        const { changelog, compatibleVersions, isLatest, isActive } = req.body;
        const userId = req.user.id;

        // Vérifier ownership
        const { rows: models } = await pool.query(`
            SELECT creator_id FROM models WHERE id = $1
        `, [modelId]);

        if (models.length === 0) {
            return res.status(404).json({ error: "Produit non trouvé" });
        }

        if (models[0].creator_id !== userId && !["STAFF", "ADMIN"].includes(req.user.role)) {
            return res.status(403).json({ error: "Non autorisé" });
        }

        // Mettre à jour la version
        const updates = [];
        const values = [];
        let paramCount = 0;

        if (changelog !== undefined) {
            paramCount++;
            updates.push(`changelog = $${paramCount}`);
            values.push(changelog);
        }

        if (isLatest !== undefined) {
            paramCount++;
            updates.push(`is_latest = $${paramCount}`);
            values.push(isLatest);
        }

        if (isActive !== undefined) {
            paramCount++;
            updates.push(`is_active = $${paramCount}`);
            values.push(isActive);
        }

        if (updates.length > 0) {
            paramCount++;
            updates.push(`updated_at = NOW()`);
            values.push(versionId);

            await pool.query(`
                UPDATE model_file_versions
                SET ${updates.join(", ")}
                WHERE id = $${paramCount}
            `, values);
        }

        // Mettre à jour les compatibilités
        if (compatibleVersions !== undefined) {
            await pool.query(`
                DELETE FROM model_file_version_compatibilities WHERE file_version_id = $1
            `, [versionId]);

            const versions = Array.isArray(compatibleVersions) ? compatibleVersions : JSON.parse(compatibleVersions);
            for (const gameVersionId of versions) {
                await pool.query(`
                    INSERT INTO model_file_version_compatibilities (file_version_id, game_version_id)
                    VALUES ($1, $2)
                        ON CONFLICT DO NOTHING
                `, [versionId, gameVersionId]);
            }
        }

        // Récupérer la version mise à jour
        const { rows } = await pool.query(`
            SELECT
                mfv.*,
                COALESCE(
                        json_agg(
                                json_build_object('id', gv.id, 'version', gv.version)
                        ) FILTER (WHERE gv.id IS NOT NULL),
                        '[]'
                ) as compatible_versions
            FROM model_file_versions mfv
                     LEFT JOIN model_file_version_compatibilities mfvc ON mfvc.file_version_id = mfv.id
                     LEFT JOIN game_versions gv ON gv.id = mfvc.game_version_id
            WHERE mfv.id = $1
            GROUP BY mfv.id
        `, [versionId]);

        res.json({ version: rows[0] });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/model-versions/:modelId/:versionId - Supprimer une version
router.delete("/:modelId/:versionId", requireAuth, requireRole("CREATOR", "STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { modelId, versionId } = req.params;
        const userId = req.user.id;

        // Vérifier ownership
        const { rows: models } = await pool.query(`
            SELECT creator_id FROM models WHERE id = $1
        `, [modelId]);

        if (models.length === 0) {
            return res.status(404).json({ error: "Produit non trouvé" });
        }

        if (models[0].creator_id !== userId && !["STAFF", "ADMIN"].includes(req.user.role)) {
            return res.status(403).json({ error: "Non autorisé" });
        }

        // Vérifier qu'il reste au moins une version
        const { rows: count } = await pool.query(`
            SELECT COUNT(*) as count FROM model_file_versions WHERE model_id = $1 AND is_active = true
        `, [modelId]);

        if (parseInt(count[0].count) <= 1) {
            return res.status(400).json({ error: "Impossible de supprimer la dernière version." });
        }

        // Récupérer l'info du fichier avant suppression
        const { rows: versions } = await pool.query(`
            SELECT file_url, is_latest FROM model_file_versions WHERE id = $1
        `, [versionId]);

        if (versions.length === 0) {
            return res.status(404).json({ error: "Version non trouvée" });
        }

        const wasLatest = versions[0].is_latest;

        // Supprimer le fichier physique
        const fileUrl = versions[0].file_url.replace(/\\/g, '/');
        const filePath = path.join(__dirname, "../../", fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Supprimer la version
        await pool.query(`DELETE FROM model_file_versions WHERE id = $1`, [versionId]);

        // Si c'était la dernière version, définir la plus récente comme latest
        if (wasLatest) {
            await pool.query(`
                UPDATE model_file_versions
                SET is_latest = true
                WHERE model_id = $1 AND is_active = true
                    ORDER BY created_at DESC
                LIMIT 1
            `, [modelId]);
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// POST /api/model-versions/:modelId/:versionId/set-latest - Définir comme dernière version
router.post("/:modelId/:versionId/set-latest", requireAuth, requireRole("CREATOR", "STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { modelId, versionId } = req.params;
        const userId = req.user.id;

        // Vérifier ownership
        const { rows: models } = await pool.query(`
            SELECT creator_id FROM models WHERE id = $1
        `, [modelId]);

        if (models.length === 0) {
            return res.status(404).json({ error: "Produit non trouvé" });
        }

        if (models[0].creator_id !== userId && !["STAFF", "ADMIN"].includes(req.user.role)) {
            return res.status(403).json({ error: "Non autorisé" });
        }

        // Le trigger s'occupera de mettre à jour les autres versions
        await pool.query(`
            UPDATE model_file_versions
            SET is_latest = true, updated_at = NOW()
            WHERE id = $1 AND model_id = $2
        `, [versionId, modelId]);

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

module.exports = router;