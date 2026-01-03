const router = require("express").Router();
const pool = require("../db/pool");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");

// ============ PROPOSITIONS (Catégories, Tags, Versions) ============

// Créer une proposition (vendeurs)
router.post("/proposals", requireAuth, async (req, res, next) => {
    try {
        const { type, gameId, name, description } = req.body;

        // Vérifier que l'utilisateur est créateur
        if (!["CREATOR", "STAFF", "ADMIN"].includes(req.user.role)) {
            return res.status(403).json({ error: "Seuls les créateurs peuvent faire des propositions" });
        }

        const validTypes = ['CATEGORY', 'TAG', 'VERSION'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: "Type invalide (CATEGORY, TAG, VERSION)" });
        }

        if (!gameId || !name?.trim()) {
            return res.status(400).json({ error: "Le jeu et le nom sont requis" });
        }

        const { rows } = await pool.query(
            `INSERT INTO proposals (user_id, type, game_id, name, description, status)
             VALUES ($1, $2, $3, $4, $5, 'PENDING')
                 RETURNING *`,
            [req.user.id, type, gameId, name.trim(), description?.trim() || null]
        );

        res.status(201).json({ proposal: rows[0] });
    } catch (error) {
        next(error);
    }
});

// Voir mes propositions (vendeurs)
router.get("/proposals/me", requireAuth, async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT p.*, g.name AS game_name
             FROM proposals p
                      LEFT JOIN games g ON g.id = p.game_id
             WHERE p.user_id = $1
             ORDER BY p.created_at DESC`,
            [req.user.id]
        );
        res.json({ proposals: rows });
    } catch (error) {
        next(error);
    }
});

// Voir toutes les propositions en attente (staff/admin)
router.get("/proposals", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT p.*, g.name AS game_name, u.username AS user_name
            FROM proposals p
                     LEFT JOIN games g ON g.id = p.game_id
                     LEFT JOIN users u ON u.id = p.user_id
        `;

        const values = [];
        if (status) {
            values.push(status);
            query += ` WHERE p.status = $1`;
        }

        query += ` ORDER BY p.created_at DESC`;

        const { rows } = await pool.query(query, values);
        res.json({ proposals: rows });
    } catch (error) {
        next(error);
    }
});

// Approuver une proposition (staff/admin)
router.post("/proposals/:id/approve", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { id } = req.params;

        // Récupérer la proposition
        const { rows: proposals } = await client.query(
            "SELECT * FROM proposals WHERE id = $1",
            [id]
        );

        if (!proposals[0]) {
            return res.status(404).json({ error: "Proposition non trouvée" });
        }

        const proposal = proposals[0];

        if (proposal.status !== 'PENDING') {
            return res.status(400).json({ error: "Cette proposition a déjà été traitée" });
        }

        // Créer l'élément selon le type
        let createdItem = null;

        if (proposal.type === 'CATEGORY') {
            const slug = proposal.name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');

            const { rows } = await client.query(
                "INSERT INTO categories (name, slug, game_id) VALUES ($1, $2, $3) RETURNING *",
                [proposal.name, slug, proposal.game_id]
            );
            createdItem = rows[0];
        } else if (proposal.type === 'TAG') {
            const { rows } = await client.query(
                "INSERT INTO tags (name, game_id) VALUES ($1, $2) RETURNING *",
                [proposal.name, proposal.game_id]
            );
            createdItem = rows[0];
        } else if (proposal.type === 'VERSION') {
            const { rows } = await client.query(
                "INSERT INTO game_versions (version, game_id) VALUES ($1, $2) RETURNING *",
                [proposal.name, proposal.game_id]
            );
            createdItem = rows[0];
        }

        // Mettre à jour le statut de la proposition
        await client.query(
            `UPDATE proposals
             SET status = 'APPROVED', reviewed_by = $1, reviewed_at = NOW()
             WHERE id = $2`,
            [req.user.id, id]
        );

        await client.query('COMMIT');

        res.json({ success: true, createdItem });
    } catch (error) {
        await client.query('ROLLBACK');
        if (error.code === '23505') {
            return res.status(409).json({ error: "Cet élément existe déjà" });
        }
        next(error);
    } finally {
        client.release();
    }
});

// Rejeter une proposition (staff/admin)
router.post("/proposals/:id/reject", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const { rows } = await pool.query(
            `UPDATE proposals
             SET status = 'REJECTED', rejection_reason = $1, reviewed_by = $2, reviewed_at = NOW()
             WHERE id = $3 AND status = 'PENDING'
                 RETURNING *`,
            [reason || null, req.user.id, id]
        );

        if (!rows[0]) {
            return res.status(404).json({ error: "Proposition non trouvée ou déjà traitée" });
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// ============ SIGNALEMENTS DE PRODUITS ============

// Signaler un produit (tous les utilisateurs connectés)
router.post("/reports", requireAuth, async (req, res, next) => {
    try {
        const { modelId, reason, description } = req.body;

        const validReasons = ['BUG', 'ERROR', 'MISLEADING', 'COPYRIGHT', 'INAPPROPRIATE', 'OTHER'];
        if (!validReasons.includes(reason)) {
            return res.status(400).json({ error: "Raison invalide" });
        }

        if (!modelId) {
            return res.status(400).json({ error: "L'ID du produit est requis" });
        }

        // Vérifier que le produit existe
        const { rows: modelRows } = await pool.query(
            "SELECT id, creator_id, title FROM models WHERE id = $1",
            [modelId]
        );

        if (!modelRows[0]) {
            return res.status(404).json({ error: "Produit non trouvé" });
        }

        // Vérifier si l'utilisateur n'a pas déjà signalé ce produit
        const { rows: existingReport } = await pool.query(
            "SELECT id FROM product_reports WHERE model_id = $1 AND user_id = $2 AND status = 'PENDING'",
            [modelId, req.user.id]
        );

        if (existingReport[0]) {
            return res.status(400).json({ error: "Vous avez déjà signalé ce produit" });
        }

        const { rows } = await pool.query(
            `INSERT INTO product_reports (model_id, user_id, reason, description, status)
             VALUES ($1, $2, $3, $4, 'PENDING')
                 RETURNING *`,
            [modelId, req.user.id, reason, description?.trim() || null]
        );

        // Créer une notification pour le staff
        await pool.query(
            `INSERT INTO staff_notifications (user_id, type, message, data)
             VALUES ($1, $2, $3, $4)`,
            [
                modelRows[0].creator_id,
                'PRODUCT_REPORT',
                `Nouveau signalement sur "${modelRows[0].title}"`,
                JSON.stringify({
                    report_id: rows[0].id,
                    model_id: modelId,
                    reason: reason
                })
            ]
        );

        res.status(201).json({ report: rows[0] });
    } catch (error) {
        next(error);
    }
});

// Voir les signalements d'un produit (créateur du produit)
router.get("/reports/model/:modelId", requireAuth, async (req, res, next) => {
    try {
        const { modelId } = req.params;

        // Vérifier que l'utilisateur est le créateur ou staff
        const { rows: modelRows } = await pool.query(
            "SELECT creator_id FROM models WHERE id = $1",
            [modelId]
        );

        if (!modelRows[0]) {
            return res.status(404).json({ error: "Produit non trouvé" });
        }

        const isOwner = modelRows[0].creator_id === req.user.id;
        const isStaff = ["STAFF", "ADMIN"].includes(req.user.role);

        if (!isOwner && !isStaff) {
            return res.status(403).json({ error: "Accès non autorisé" });
        }

        const { rows } = await pool.query(
            `SELECT r.*, u.username AS reporter_username
             FROM product_reports r
                      LEFT JOIN users u ON u.id = r.user_id
             WHERE r.model_id = $1
             ORDER BY r.created_at DESC`,
            [modelId]
        );

        res.json({ reports: rows });
    } catch (error) {
        next(error);
    }
});

// Voir tous les signalements (staff/admin)
router.get("/reports", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT r.*,
                   m.title AS model_title,
                   m.creator_id,
                   u.username AS reporter_username,
                   c.username AS creator_username
            FROM product_reports r
                     LEFT JOIN models m ON m.id = r.model_id
                     LEFT JOIN users u ON u.id = r.user_id
                     LEFT JOIN users c ON c.id = m.creator_id
        `;

        const values = [];
        if (status) {
            values.push(status);
            query += ` WHERE r.status = $1`;
        }

        query += ` ORDER BY r.created_at DESC`;

        const { rows } = await pool.query(query, values);
        res.json({ reports: rows });
    } catch (error) {
        next(error);
    }
});

// Traiter un signalement (staff/admin)
router.put("/reports/:id", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, staffNote } = req.body;

        const validStatuses = ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Statut invalide" });
        }

        // Récupérer les infos du signalement avant la mise à jour
        const { rows: reportRows } = await pool.query(
            `SELECT r.*, m.title AS model_title, m.creator_id
             FROM product_reports r
                      JOIN models m ON m.id = r.model_id
             WHERE r.id = $1`,
            [id]
        );

        if (!reportRows[0]) {
            return res.status(404).json({ error: "Signalement non trouvé" });
        }

        const report = reportRows[0];

        // Mettre à jour le signalement
        const { rows } = await pool.query(
            `UPDATE product_reports
             SET status = $1, staff_note = $2, reviewed_by = $3, reviewed_at = NOW()
             WHERE id = $4
                 RETURNING *`,
            [status, staffNote || null, req.user.id, id]
        );

        // Notifier le vendeur du résultat du signalement
        if (status !== 'PENDING' && report.creator_id) {
            const statusMessages = {
                'REVIEWED': `Un signalement sur votre produit "${report.model_title}" est en cours d'examen.`,
                'RESOLVED': `Un signalement sur votre produit "${report.model_title}" a été résolu. ${staffNote ? 'Note du staff: ' + staffNote : ''}`,
                'DISMISSED': `Un signalement sur votre produit "${report.model_title}" a été rejeté (non fondé).`
            };

            const notificationTypes = {
                'REVIEWED': 'REPORT_REVIEWED',
                'RESOLVED': 'REPORT_RESOLVED',
                'DISMISSED': 'REPORT_DISMISSED'
            };

            await pool.query(
                `INSERT INTO notifications (user_id, type, title, message, data)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    report.creator_id,
                    notificationTypes[status],
                    status === 'RESOLVED' ? '⚠️ Signalement résolu' :
                        status === 'DISMISSED' ? '✅ Signalement rejeté' : '🔍 Signalement en cours',
                    statusMessages[status],
                    JSON.stringify({
                        report_id: id,
                        model_id: report.model_id,
                        model_title: report.model_title,
                        reason: report.reason,
                        status: status,
                        staff_note: staffNote || null
                    })
                ]
            );
        }

        res.json({ report: rows[0] });
    } catch (error) {
        next(error);
    }
});

// Voir mes signalements envoyés
router.get("/reports/me", requireAuth, async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT r.*, m.title AS model_title
             FROM product_reports r
                      LEFT JOIN models m ON m.id = r.model_id
             WHERE r.user_id = $1
             ORDER BY r.created_at DESC`,
            [req.user.id]
        );
        res.json({ reports: rows });
    } catch (error) {
        next(error);
    }
});

// Vendeur répond à un signalement sur son produit
router.post("/reports/:id/respond", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { response } = req.body;

        if (!response?.trim()) {
            return res.status(400).json({ error: "La réponse est requise" });
        }

        // Vérifier que le signalement concerne un produit du vendeur
        const { rows: reportRows } = await pool.query(
            `SELECT r.*, m.creator_id, m.title as model_title
             FROM product_reports r
             JOIN models m ON m.id = r.model_id
             WHERE r.id = $1`,
            [id]
        );

        if (!reportRows[0]) {
            return res.status(404).json({ error: "Signalement non trouvé" });
        }

        const report = reportRows[0];

        // Vérifier que l'utilisateur est le créateur du produit
        if (report.creator_id !== req.user.id) {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à répondre à ce signalement" });
        }

        // Vérifier qu'il n'y a pas déjà une réponse
        if (report.seller_response) {
            return res.status(400).json({ error: "Vous avez déjà répondu à ce signalement" });
        }

        // Enregistrer la réponse
        const { rows } = await pool.query(
            `UPDATE product_reports 
             SET seller_response = $1, seller_response_at = NOW()
             WHERE id = $2
             RETURNING *`,
            [response.trim(), id]
        );

        // Notifier le staff qu'une réponse a été ajoutée
        await pool.query(
            `INSERT INTO staff_notifications (user_id, type, message, data)
             VALUES ($1, $2, $3, $4)`,
            [
                report.creator_id,
                'SELLER_RESPONSE',
                `Le vendeur a répondu au signalement sur "${report.model_title}"`,
                JSON.stringify({
                    report_id: id,
                    model_id: report.model_id,
                    response: response.trim()
                })
            ]
        );

        res.json({ success: true, report: rows[0] });
    } catch (error) {
        next(error);
    }
});

module.exports = router;