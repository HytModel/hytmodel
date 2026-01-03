const router = require("express").Router();
const pool = require("../db/pool");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuration multer pour les images de jeux
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../uploads/games');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Seules les images sont autorisées'));
    }
});

// Récupérer tous les jeux
router.get("/", async (req, res, next) => {
    try {
        const { rows } = await pool.query("SELECT * FROM games ORDER BY name ASC");
        res.json({ games: rows });
    } catch (error) {
        next(error);
    }
});

// Récupérer un jeu par slug
router.get("/:slug", async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { rows } = await pool.query(
            "SELECT * FROM games WHERE slug = $1",
            [slug]
        );

        if (!rows[0]) {
            return res.status(404).json({ error: "Jeu non trouvé" });
        }

        res.json({ game: rows[0] });
    } catch (error) {
        next(error);
    }
});

// Créer un jeu (admin/staff)
router.post("/", requireAuth, requireRole("STAFF", "ADMIN"), upload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), async (req, res, next) => {
    try {
        const { name, slug } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Le nom est requis" });
        }

        const finalSlug = slug?.trim() || name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const iconUrl = req.files?.icon?.[0]
            ? `/uploads/games/${req.files.icon[0].filename}`
            : null;
        const bannerUrl = req.files?.banner?.[0]
            ? `/uploads/games/${req.files.banner[0].filename}`
            : null;

        const { rows } = await pool.query(
            `INSERT INTO games (name, slug, icon_url, banner_url) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [name.trim(), finalSlug, iconUrl, bannerUrl]
        );

        res.status(201).json({ game: rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: "Ce jeu existe déjà" });
        }
        next(error);
    }
});

// Modifier un jeu (admin/staff)
router.put("/:id", requireAuth, requireRole("STAFF", "ADMIN"), upload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, slug } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Le nom est requis" });
        }

        // Récupérer le jeu actuel pour les anciennes images
        const { rows: currentGame } = await pool.query(
            "SELECT * FROM games WHERE id = $1",
            [id]
        );

        if (!currentGame[0]) {
            return res.status(404).json({ error: "Jeu non trouvé" });
        }

        const finalSlug = slug?.trim() || name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        // Nouvelles images ou garder les anciennes
        let iconUrl = currentGame[0].icon_url;
        let bannerUrl = currentGame[0].banner_url;

        if (req.files?.icon?.[0]) {
            // Supprimer l'ancienne icône si elle existe
            if (iconUrl) {
                const oldPath = path.join(__dirname, '../..', iconUrl);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            iconUrl = `/uploads/games/${req.files.icon[0].filename}`;
        }

        if (req.files?.banner?.[0]) {
            // Supprimer l'ancienne bannière si elle existe
            if (bannerUrl) {
                const oldPath = path.join(__dirname, '../..', bannerUrl);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            bannerUrl = `/uploads/games/${req.files.banner[0].filename}`;
        }

        const { rows } = await pool.query(
            `UPDATE games 
             SET name = $1, slug = $2, icon_url = $3, banner_url = $4 
             WHERE id = $5 
             RETURNING *`,
            [name.trim(), finalSlug, iconUrl, bannerUrl, id]
        );

        res.json({ game: rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: "Ce jeu existe déjà" });
        }
        next(error);
    }
});

// Supprimer un jeu (admin/staff)
router.delete("/:id", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { id } = req.params;

        // Récupérer le jeu pour supprimer les images
        const { rows: game } = await pool.query(
            "SELECT * FROM games WHERE id = $1",
            [id]
        );

        if (game[0]) {
            // Supprimer les images
            if (game[0].icon_url) {
                const iconPath = path.join(__dirname, '../..', game[0].icon_url);
                if (fs.existsSync(iconPath)) {
                    fs.unlinkSync(iconPath);
                }
            }
            if (game[0].banner_url) {
                const bannerPath = path.join(__dirname, '../..', game[0].banner_url);
                if (fs.existsSync(bannerPath)) {
                    fs.unlinkSync(bannerPath);
                }
            }
        }

        // Supprimer les versions du jeu
        await pool.query("DELETE FROM game_versions WHERE game_id = $1", [id]);

        // Mettre à NULL le game_id des modèles associés
        await pool.query("UPDATE models SET game_id = NULL WHERE game_id = $1", [id]);

        // Supprimer le jeu
        await pool.query("DELETE FROM games WHERE id = $1", [id]);

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

module.exports = router;