const router = require("express").Router();
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");
const pool = require("../db/pool");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuration multer pour les logos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../../uploads/dependencies");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Type de fichier non autorisé"));
        }
    },
});

// Helper pour générer un slug
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
};

// ============================================
// ROUTES PUBLIQUES - DÉPENDANCES PRÉDÉFINIES
// ============================================

// GET /api/dependencies - Liste des dépendances par jeu
router.get("/", async (req, res, next) => {
    try {
        const { gameId } = req.query;

        let query = `
            SELECT d.*, g.name as game_name
            FROM dependencies d
                     JOIN games g ON g.id = d.game_id
            WHERE d.is_active = true
        `;
        const params = [];

        if (gameId) {
            query += ` AND d.game_id = $1`;
            params.push(gameId);
        }

        query += ` ORDER BY g.name ASC, d.name ASC`;

        const { rows } = await pool.query(query, params);
        res.json({ dependencies: rows });
    } catch (error) {
        next(error);
    }
});

// ============================================
// ROUTES ADMIN - GESTION DES DÉPENDANCES
// ============================================

// GET /api/dependencies/admin/all - Toutes les dépendances (même inactives)
router.get("/admin/all", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { gameId } = req.query;

        let query = `
            SELECT d.*, g.name as game_name,
                   (SELECT COUNT(*) FROM model_dependency_links WHERE dependency_id = d.id) as usage_count
            FROM dependencies d
                     JOIN games g ON g.id = d.game_id
        `;
        const params = [];

        if (gameId) {
            query += ` WHERE d.game_id = $1`;
            params.push(gameId);
        }

        query += ` ORDER BY g.name ASC, d.name ASC`;

        const { rows } = await pool.query(query, params);
        res.json({ dependencies: rows });
    } catch (error) {
        next(error);
    }
});

// POST /api/dependencies - Créer une dépendance (admin)
router.post("/", requireAuth, requireRole("STAFF", "ADMIN"), upload.single("logo"), async (req, res, next) => {
    try {
        const { name, description, websiteUrl, gameId } = req.body;

        if (!name || !gameId) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: "Nom et jeu requis" });
        }

        const slug = generateSlug(name);
        const logoUrl = req.file ? `/uploads/dependencies/${req.file.filename}` : null;

        const { rows } = await pool.query(`
            INSERT INTO dependencies (name, slug, logo_url, description, website_url, game_id)
            VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
        `, [name, slug, logoUrl, description || null, websiteUrl || null, gameId]);

        res.status(201).json({ dependency: rows[0] });
    } catch (error) {
        if (req.file) {
            try { fs.unlinkSync(req.file.path); } catch (e) {}
        }
        if (error.code === '23505') {
            return res.status(400).json({ error: "Une dépendance avec ce nom existe déjà pour ce jeu" });
        }
        next(error);
    }
});

// PUT /api/dependencies/:id - Modifier une dépendance (admin)
router.put("/:id", requireAuth, requireRole("STAFF", "ADMIN"), upload.single("logo"), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, websiteUrl, gameId, isActive } = req.body;

        // Récupérer l'ancienne dépendance
        const { rows: existing } = await pool.query(`SELECT * FROM dependencies WHERE id = $1`, [id]);
        if (existing.length === 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ error: "Dépendance non trouvée" });
        }

        let logoUrl = existing[0].logo_url;
        if (req.file) {
            // Supprimer l'ancien logo
            if (logoUrl) {
                const oldPath = path.join(__dirname, "../../", logoUrl);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            logoUrl = `/uploads/dependencies/${req.file.filename}`;
        }

        const slug = name ? generateSlug(name) : existing[0].slug;

        const { rows } = await pool.query(`
            UPDATE dependencies
            SET name = COALESCE($1, name),
                slug = $2,
                logo_url = $3,
                description = $4,
                website_url = $5,
                game_id = COALESCE($6, game_id),
                is_active = COALESCE($7, is_active),
                updated_at = NOW()
            WHERE id = $8
                RETURNING *
        `, [name, slug, logoUrl, description, websiteUrl, gameId, isActive, id]);

        res.json({ dependency: rows[0] });
    } catch (error) {
        if (req.file) {
            try { fs.unlinkSync(req.file.path); } catch (e) {}
        }
        next(error);
    }
});

// DELETE /api/dependencies/:id - Supprimer une dépendance (admin)
router.delete("/:id", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { id } = req.params;

        // Récupérer le logo pour le supprimer
        const { rows: existing } = await pool.query(`SELECT logo_url FROM dependencies WHERE id = $1`, [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: "Dépendance non trouvée" });
        }

        // Supprimer le logo
        if (existing[0].logo_url) {
            const logoPath = path.join(__dirname, "../../", existing[0].logo_url);
            if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
        }

        await pool.query(`DELETE FROM dependencies WHERE id = $1`, [id]);

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// ============================================
// ROUTES VENDEUR - PROPOSITIONS DE DÉPENDANCES
// ============================================

// GET /api/dependencies/proposals/my - Mes propositions
router.get("/proposals/my", requireAuth, async (req, res, next) => {
    try {
        const { rows } = await pool.query(`
            SELECT dp.*, g.name as game_name
            FROM dependency_proposals dp
                     JOIN games g ON g.id = dp.game_id
            WHERE dp.proposed_by = $1
            ORDER BY dp.created_at DESC
        `, [req.user.id]);

        res.json({ proposals: rows });
    } catch (error) {
        next(error);
    }
});

// POST /api/dependencies/proposals - Proposer une dépendance
router.post("/proposals", requireAuth, requireRole("CREATOR", "STAFF", "ADMIN"), upload.single("logo"), async (req, res, next) => {
    try {
        const { name, description, websiteUrl, gameId } = req.body;

        if (!name || !gameId) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: "Nom et jeu requis" });
        }

        const logoUrl = req.file ? `/uploads/dependencies/${req.file.filename}` : null;

        const { rows } = await pool.query(`
            INSERT INTO dependency_proposals (name, logo_url, description, website_url, game_id, proposed_by)
            VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
        `, [name, logoUrl, description || null, websiteUrl || null, gameId, req.user.id]);

        res.status(201).json({ proposal: rows[0] });
    } catch (error) {
        if (req.file) {
            try { fs.unlinkSync(req.file.path); } catch (e) {}
        }
        next(error);
    }
});

// DELETE /api/dependencies/proposals/:id - Supprimer ma proposition (si pending)
router.delete("/proposals/:id", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(`
            SELECT * FROM dependency_proposals WHERE id = $1
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Proposition non trouvée" });
        }

        if (rows[0].proposed_by !== req.user.id && !["STAFF", "ADMIN"].includes(req.user.role)) {
            return res.status(403).json({ error: "Non autorisé" });
        }

        if (rows[0].status !== 'PENDING' && !["STAFF", "ADMIN"].includes(req.user.role)) {
            return res.status(400).json({ error: "Impossible de supprimer une proposition déjà traitée" });
        }

        // Supprimer le logo
        if (rows[0].logo_url) {
            const logoPath = path.join(__dirname, "../../", rows[0].logo_url);
            if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
        }

        await pool.query(`DELETE FROM dependency_proposals WHERE id = $1`, [id]);

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// ============================================
// ROUTES ADMIN - GESTION DES PROPOSITIONS
// ============================================

// GET /api/dependencies/proposals/pending/count - Nombre de propositions en attente
router.get("/proposals/pending/count", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { rows } = await pool.query(`
            SELECT COUNT(*) as count FROM dependency_proposals WHERE status = 'PENDING'
        `);
        res.json({ count: parseInt(rows[0].count) });
    } catch (error) {
        next(error);
    }
});

// GET /api/dependencies/proposals - Toutes les propositions (admin)
router.get("/proposals", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT dp.*, g.name as game_name, u.username as proposed_by_username
            FROM dependency_proposals dp
                     JOIN games g ON g.id = dp.game_id
                     JOIN users u ON u.id = dp.proposed_by
        `;
        const params = [];

        if (status) {
            query += ` WHERE dp.status = $1`;
            params.push(status);
        }

        query += ` ORDER BY dp.created_at DESC`;

        const { rows } = await pool.query(query, params);
        res.json({ proposals: rows });
    } catch (error) {
        next(error);
    }
});

// POST /api/dependencies/proposals/:id/approve - Approuver une proposition
router.post("/proposals/:id/approve", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { id } = req.params;

        const { rows: proposals } = await pool.query(`
            SELECT * FROM dependency_proposals WHERE id = $1
        `, [id]);

        if (proposals.length === 0) {
            return res.status(404).json({ error: "Proposition non trouvée" });
        }

        const proposal = proposals[0];

        if (proposal.status !== 'PENDING') {
            return res.status(400).json({ error: "Cette proposition a déjà été traitée" });
        }

        const slug = generateSlug(proposal.name);

        // Créer la dépendance
        const { rows: newDep } = await pool.query(`
            INSERT INTO dependencies (name, slug, logo_url, description, website_url, game_id)
            VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
        `, [proposal.name, slug, proposal.logo_url, proposal.description, proposal.website_url, proposal.game_id]);

        // Mettre à jour la proposition
        await pool.query(`
            UPDATE dependency_proposals
            SET status = 'APPROVED', reviewed_by = $1, reviewed_at = NOW()
            WHERE id = $2
        `, [req.user.id, id]);

        // Notifier le vendeur
        await pool.query(`
            INSERT INTO notifications (user_id, type, title, message)
            VALUES ($1, 'PROPOSAL_APPROVED', 'Proposition acceptée', $2)
        `, [proposal.proposed_by, `Votre proposition de dépendance "${proposal.name}" a été acceptée !`]);

        res.json({ dependency: newDep[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: "Une dépendance avec ce nom existe déjà pour ce jeu" });
        }
        next(error);
    }
});

// POST /api/dependencies/proposals/:id/reject - Refuser une proposition
router.post("/proposals/:id/reject", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const { rows } = await pool.query(`
            UPDATE dependency_proposals
            SET status = 'REJECTED', rejection_reason = $1, reviewed_by = $2, reviewed_at = NOW()
            WHERE id = $3 AND status = 'PENDING'
                RETURNING *
        `, [reason || null, req.user.id, id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Proposition non trouvée ou déjà traitée" });
        }

        // Notifier le vendeur
        await pool.query(`
            INSERT INTO notifications (user_id, type, title, message)
            VALUES ($1, 'PROPOSAL_REJECTED', 'Proposition refusée', $2)
        `, [rows[0].proposed_by, `Votre proposition de dépendance "${rows[0].name}" a été refusée.${reason ? ` Raison: ${reason}` : ''}`]);

        res.json({ proposal: rows[0] });
    } catch (error) {
        next(error);
    }
});

// ============================================
// ROUTES MODÈLE - LIAISONS DÉPENDANCES
// ============================================

// GET /api/dependencies/model/:modelId - Dépendances d'un produit
router.get("/model/:modelId", async (req, res, next) => {
    try {
        const { modelId } = req.params;

        const { rows } = await pool.query(`
            SELECT
                mdl.*,
                d.id as dep_id, d.name as dep_name, d.logo_url as dep_logo, d.slug as dep_slug,
                m.id as product_id, m.title as product_title, m.thumbnail_url as product_thumbnail,
                m.price as product_price, u.username as product_creator
            FROM model_dependency_links mdl
                     LEFT JOIN dependencies d ON d.id = mdl.dependency_id
                     LEFT JOIN models m ON m.id = mdl.product_dependency_id
                     LEFT JOIN users u ON u.id = m.creator_id
            WHERE mdl.model_id = $1
            ORDER BY mdl.is_required DESC, COALESCE(d.name, m.title) ASC
        `, [modelId]);

        res.json({ dependencies: rows });
    } catch (error) {
        next(error);
    }
});

// POST /api/dependencies/model/:modelId - Ajouter une dépendance à un produit
router.post("/model/:modelId", requireAuth, requireRole("CREATOR", "STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { modelId } = req.params;
        const { dependencyId, productDependencyId, productVersionId, versionInfo, isRequired, note } = req.body;
        const userId = req.user.id;

        // Vérifier ownership
        const { rows: models } = await pool.query(`
            SELECT creator_id, game_id FROM models WHERE id = $1
        `, [modelId]);

        if (models.length === 0) {
            return res.status(404).json({ error: "Produit non trouvé" });
        }

        if (models[0].creator_id !== userId && !["STAFF", "ADMIN"].includes(req.user.role)) {
            return res.status(403).json({ error: "Non autorisé" });
        }

        if (!dependencyId && !productDependencyId) {
            return res.status(400).json({ error: "Dépendance ou produit requis" });
        }

        if (dependencyId && productDependencyId) {
            return res.status(400).json({ error: "Choisissez une dépendance OU un produit, pas les deux" });
        }

        // Vérifier que la dépendance/produit est du même jeu
        if (dependencyId) {
            const { rows: depCheck } = await pool.query(`
                SELECT game_id FROM dependencies WHERE id = $1 AND is_active = true
            `, [dependencyId]);
            if (depCheck.length === 0) {
                return res.status(400).json({ error: "Dépendance non trouvée" });
            }
            if (depCheck[0].game_id !== models[0].game_id) {
                return res.status(400).json({ error: "La dépendance doit être du même jeu" });
            }
        }

        if (productDependencyId) {
            const { rows: prodCheck } = await pool.query(`
                SELECT game_id FROM models WHERE id = $1 AND status = 'APPROVED'
            `, [productDependencyId]);
            if (prodCheck.length === 0) {
                return res.status(400).json({ error: "Produit non trouvé ou non approuvé" });
            }
            if (prodCheck[0].game_id !== models[0].game_id) {
                return res.status(400).json({ error: "Le produit dépendance doit être du même jeu" });
            }

            // Vérifier que la version appartient bien au produit (si spécifiée)
            if (productVersionId) {
                const { rows: versionCheck } = await pool.query(`
                    SELECT id FROM model_file_versions WHERE id = $1 AND model_id = $2
                `, [productVersionId, productDependencyId]);
                if (versionCheck.length === 0) {
                    return res.status(400).json({ error: "Version non trouvée pour ce produit" });
                }
            }
        }

        const { rows } = await pool.query(`
            INSERT INTO model_dependency_links (model_id, dependency_id, product_dependency_id, product_version_id, version_info, is_required, note)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
        `, [modelId, dependencyId || null, productDependencyId || null, productVersionId || null, versionInfo || null, isRequired !== false, note || null]);

        res.status(201).json({ link: rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: "Cette dépendance est déjà ajoutée" });
        }
        next(error);
    }
});

// PUT /api/dependencies/model/:modelId/:linkId - Modifier une liaison
router.put("/model/:modelId/:linkId", requireAuth, requireRole("CREATOR", "STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { modelId, linkId } = req.params;
        const { versionInfo, isRequired, note } = req.body;
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

        const { rows } = await pool.query(`
            UPDATE model_dependency_links
            SET version_info = $1, is_required = $2, note = $3
            WHERE id = $4 AND model_id = $5
                RETURNING *
        `, [versionInfo || null, isRequired !== false, note || null, linkId, modelId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Liaison non trouvée" });
        }

        res.json({ link: rows[0] });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/dependencies/model/:modelId/:linkId - Supprimer une liaison
router.delete("/model/:modelId/:linkId", requireAuth, requireRole("CREATOR", "STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { modelId, linkId } = req.params;
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

        await pool.query(`
            DELETE FROM model_dependency_links WHERE id = $1 AND model_id = $2
        `, [linkId, modelId]);

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// GET /api/dependencies/search/products - Rechercher des produits du site comme dépendance
router.get("/search/products", requireAuth, async (req, res, next) => {
    try {
        const { q, gameId, excludeModelId } = req.query;

        if (!gameId) {
            return res.status(400).json({ error: "gameId requis" });
        }

        let query = `
            SELECT
                m.id, m.title, m.price, m.thumbnail_url,
                u.username as creator_username
            FROM models m
                     JOIN users u ON u.id = m.creator_id
            WHERE m.status = 'APPROVED'
              AND m.game_id = $1
              AND COALESCE(m.is_hidden, false) = false
              AND m.deleted_at IS NULL
              AND EXISTS (
                SELECT 1 FROM model_file_versions mfv
                WHERE mfv.model_id = m.id
                  AND COALESCE(mfv.is_active, true) = true
            )
        `;
        const params = [gameId];
        let paramCount = 1;

        if (excludeModelId) {
            paramCount++;
            query += ` AND m.id != $${paramCount}`;
            params.push(excludeModelId);
        }

        if (q) {
            paramCount++;
            query += ` AND m.title ILIKE $${paramCount}`;
            params.push(`%${q}%`);
        }

        query += ` ORDER BY m.title ASC LIMIT 50`;

        const { rows } = await pool.query(query, params);
        res.json({ products: rows });
    } catch (error) {
        next(error);
    }
});

// ============================================
// ROUTE GÉNÉRIQUE - DOIT ÊTRE À LA FIN
// ============================================

// GET /api/dependencies/:id - Détails d'une dépendance
// IMPORTANT: Cette route doit être APRÈS toutes les routes spécifiques
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        // Vérifier que c'est un UUID valide pour éviter les erreurs
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return res.status(400).json({ error: "ID invalide" });
        }

        const { rows } = await pool.query(`
            SELECT d.*, g.name as game_name
            FROM dependencies d
                     JOIN games g ON g.id = d.game_id
            WHERE d.id = $1
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Dépendance non trouvée" });
        }

        res.json({ dependency: rows[0] });
    } catch (error) {
        next(error);
    }
});

module.exports = router;