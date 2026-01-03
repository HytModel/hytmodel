const router = require("express").Router();
const { requireAuth } = require("../middlewares/requireAuth");
const pool = require("../db/pool");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuration multer pour les images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = "uploads/images";
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("Seules les images sont autorisées"));
        }
    }
});

// Récupérer les images d'un modèle
router.get("/:modelId", async (req, res, next) => {
    try {
        const { modelId } = req.params;
        const { rows } = await pool.query(
            `SELECT * FROM model_images
             WHERE model_id = $1
             ORDER BY is_primary DESC, position ASC`,
            [modelId]
        );
        res.json({ images: rows });
    } catch (error) {
        next(error);
    }
});

// Ajouter des images à un modèle
router.post("/:modelId", requireAuth, upload.array("images", 10), async (req, res, next) => {
    try {
        const { modelId } = req.params;

        // Vérifier que l'utilisateur est le propriétaire
        const { rows: modelRows } = await pool.query(
            "SELECT creator_id FROM models WHERE id = $1",
            [modelId]
        );

        if (!modelRows[0]) {
            return res.status(404).json({ error: "Model not found" });
        }

        if (modelRows[0].creator_id !== req.user.id && !["STAFF", "ADMIN"].includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No images provided" });
        }

        // Vérifier le nombre d'images existantes
        const { rows: existingImages } = await pool.query(
            "SELECT COUNT(*) FROM model_images WHERE model_id = $1",
            [modelId]
        );

        const currentCount = parseInt(existingImages[0].count);
        if (currentCount + req.files.length > 10) {
            return res.status(400).json({
                error: `Maximum 10 images. Vous en avez déjà ${currentCount}.`
            });
        }

        // Vérifier s'il y a déjà une image principale
        const { rows: primaryCheck } = await pool.query(
            "SELECT id FROM model_images WHERE model_id = $1 AND is_primary = true",
            [modelId]
        );
        const hasPrimary = primaryCheck.length > 0;

        const insertedImages = [];
        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const imageUrl = `/${file.path.replace(/\\/g, "/")}`;

            // La première image uploadée devient principale s'il n'y en a pas
            const isPrimary = !hasPrimary && i === 0;

            const { rows } = await pool.query(
                `INSERT INTO model_images (model_id, image_url, is_primary, position)
                 VALUES ($1, $2, $3, $4)
                     RETURNING *`,
                [modelId, imageUrl, isPrimary, currentCount + i]
            );
            insertedImages.push(rows[0]);

            // Si c'est la première image principale, mettre à jour thumbnail_url du modèle
            if (isPrimary) {
                await pool.query(
                    "UPDATE models SET thumbnail_url = $1 WHERE id = $2",
                    [imageUrl, modelId]
                );
            }
        }

        res.status(201).json({ images: insertedImages });
    } catch (error) {
        next(error);
    }
});

// Définir une image comme principale
router.put("/:imageId/primary", requireAuth, async (req, res, next) => {
    try {
        const { imageId } = req.params;

        // Récupérer l'image et le modèle
        const { rows: imageRows } = await pool.query(
            `SELECT mi.*, m.creator_id
             FROM model_images mi
                      JOIN models m ON m.id = mi.model_id
             WHERE mi.id = $1`,
            [imageId]
        );

        if (!imageRows[0]) {
            return res.status(404).json({ error: "Image not found" });
        }

        const image = imageRows[0];

        if (image.creator_id !== req.user.id && !["STAFF", "ADMIN"].includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }

        // Retirer le statut principal de toutes les autres images
        await pool.query(
            "UPDATE model_images SET is_primary = false WHERE model_id = $1",
            [image.model_id]
        );

        // Définir cette image comme principale
        await pool.query(
            "UPDATE model_images SET is_primary = true WHERE id = $1",
            [imageId]
        );

        // Mettre à jour le thumbnail du modèle
        await pool.query(
            "UPDATE models SET thumbnail_url = $1 WHERE id = $2",
            [image.image_url, image.model_id]
        );

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// Supprimer une image
router.delete("/:imageId", requireAuth, async (req, res, next) => {
    try {
        const { imageId } = req.params;

        // Récupérer l'image
        const { rows: imageRows } = await pool.query(
            `SELECT mi.*, m.creator_id
             FROM model_images mi
                      JOIN models m ON m.id = mi.model_id
             WHERE mi.id = $1`,
            [imageId]
        );

        if (!imageRows[0]) {
            return res.status(404).json({ error: "Image not found" });
        }

        const image = imageRows[0];

        if (image.creator_id !== req.user.id && !["STAFF", "ADMIN"].includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }

        // Supprimer le fichier physique
        const filePath = path.join(process.cwd(), image.image_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Supprimer de la base de données
        await pool.query("DELETE FROM model_images WHERE id = $1", [imageId]);

        // Si c'était l'image principale, définir la première autre image comme principale
        if (image.is_primary) {
            const { rows: nextImage } = await pool.query(
                `SELECT id, image_url FROM model_images
                 WHERE model_id = $1
                 ORDER BY position ASC
                     LIMIT 1`,
                [image.model_id]
            );

            if (nextImage[0]) {
                await pool.query(
                    "UPDATE model_images SET is_primary = true WHERE id = $1",
                    [nextImage[0].id]
                );
                await pool.query(
                    "UPDATE models SET thumbnail_url = $1 WHERE id = $2",
                    [nextImage[0].image_url, image.model_id]
                );
            } else {
                // Plus d'images, effacer le thumbnail
                await pool.query(
                    "UPDATE models SET thumbnail_url = NULL WHERE id = $1",
                    [image.model_id]
                );
            }
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// Réorganiser les images
router.put("/:modelId/reorder", requireAuth, async (req, res, next) => {
    try {
        const { modelId } = req.params;
        const { imageIds } = req.body; // Array d'IDs dans le nouvel ordre

        // Vérifier propriétaire
        const { rows: modelRows } = await pool.query(
            "SELECT creator_id FROM models WHERE id = $1",
            [modelId]
        );

        if (!modelRows[0]) {
            return res.status(404).json({ error: "Model not found" });
        }

        if (modelRows[0].creator_id !== req.user.id && !["STAFF", "ADMIN"].includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden" });
        }

        // Mettre à jour les positions
        for (let i = 0; i < imageIds.length; i++) {
            await pool.query(
                "UPDATE model_images SET position = $1 WHERE id = $2 AND model_id = $3",
                [i, imageIds[i], modelId]
            );
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

module.exports = router;