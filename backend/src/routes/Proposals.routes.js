const router = require("express").Router();
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");
const pool = require("../db/pool");

// ============ ROUTES VENDEUR ============

// GET /api/proposals/my - Mes propositions (pour le vendeur)
router.get("/my", requireAuth, requireRole("CREATOR", "STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { rows } = await pool.query(`
            SELECT sp.*, g.name as game_name
            FROM seller_proposals sp
                     LEFT JOIN games g ON g.id = sp.game_id
            WHERE sp.user_id = $1
            ORDER BY sp.created_at DESC
        `, [req.user.id]);

        res.json({ proposals: rows });
    } catch (error) {
        next(error);
    }
});

// POST /api/proposals - Créer une proposition
router.post("/", requireAuth, requireRole("CREATOR", "STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { proposalType, gameId, name, description } = req.body;

        // Validation
        if (!proposalType || !name) {
            return res.status(400).json({ error: 'Type et nom requis' });
        }

        const validTypes = ['CATEGORY', 'TAG', 'VERSION'];
        if (!validTypes.includes(proposalType)) {
            return res.status(400).json({ error: 'Type invalide' });
        }

        // TAG et VERSION nécessitent un jeu
        if ((proposalType === 'TAG' || proposalType === 'VERSION') && !gameId) {
            return res.status(400).json({ error: 'Un jeu doit être sélectionné pour les tags et versions' });
        }

        // Vérifier si une proposition similaire existe déjà (en attente)
        const { rows: existing } = await pool.query(`
            SELECT id FROM seller_proposals
            WHERE LOWER(name) = LOWER($1)
              AND proposal_type = $2
              AND (game_id = $3 OR (game_id IS NULL AND $3 IS NULL))
              AND status = 'PENDING'
        `, [name.trim(), proposalType, gameId || null]);

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Une proposition similaire est déjà en attente' });
        }

        // Vérifier si ça existe déjà dans la base
        let existsQuery = '';
        let existsParams = [name.trim()];

        if (proposalType === 'CATEGORY') {
            existsQuery = 'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)';
        } else if (proposalType === 'TAG') {
            existsQuery = 'SELECT id FROM tags WHERE LOWER(name) = LOWER($1) AND game_id = $2';
            existsParams.push(gameId);
        } else if (proposalType === 'VERSION') {
            existsQuery = 'SELECT id FROM game_versions WHERE LOWER(version) = LOWER($1) AND game_id = $2';
            existsParams.push(gameId);
        }

        const { rows: alreadyExists } = await pool.query(existsQuery, existsParams);
        if (alreadyExists.length > 0) {
            return res.status(400).json({ error: 'Cet élément existe déjà' });
        }

        // Créer la proposition
        const { rows } = await pool.query(`
            INSERT INTO seller_proposals (user_id, proposal_type, game_id, name, description)
            VALUES ($1, $2, $3, $4, $5)
                RETURNING *
        `, [req.user.id, proposalType, gameId || null, name.trim(), description?.trim() || null]);

        // Créer une notification staff
        try {
            await pool.query(`
                INSERT INTO staff_notifications (user_id, type, title, message)
                VALUES ($1, 'PROPOSAL', $2, $3)
            `, [
                req.user.id,
                `Nouvelle proposition: ${proposalType}`,
                `${req.user.username} propose d'ajouter "${name}" comme ${proposalType.toLowerCase()}`
            ]);
        } catch (e) {
            // Ignorer si la table n'existe pas
        }

        res.status(201).json({ proposal: rows[0] });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/proposals/:id - Supprimer ma proposition (si encore en attente)
router.delete("/:id", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        // Vérifier que c'est bien ma proposition et qu'elle est en attente
        const { rows } = await pool.query(`
            DELETE FROM seller_proposals
            WHERE id = $1 AND user_id = $2 AND status = 'PENDING'
                RETURNING id
        `, [id, req.user.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Proposition non trouvée ou déjà traitée' });
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// ============ ROUTES ADMIN/STAFF ============

// GET /api/proposals - Toutes les propositions (admin)
router.get("/", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { status, type } = req.query;

        let query = `
            SELECT sp.*, g.name as game_name, u.username as user_name, u.email as user_email
            FROM seller_proposals sp
                     LEFT JOIN games g ON g.id = sp.game_id
                     JOIN users u ON u.id = sp.user_id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            params.push(status);
            query += ` AND sp.status = $${params.length}`;
        }

        if (type) {
            params.push(type);
            query += ` AND sp.proposal_type = $${params.length}`;
        }

        query += ' ORDER BY sp.created_at DESC';

        const { rows } = await pool.query(query, params);

        // Mapper les champs pour correspondre au frontend
        const proposals = rows.map(row => ({
            ...row,
            type: row.proposal_type // Le frontend attend "type" pas "proposal_type"
        }));

        res.json({ proposals });
    } catch (error) {
        next(error);
    }
});

// GET /api/proposals/pending/count - Nombre de propositions en attente
router.get("/pending/count", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { rows } = await pool.query(`
            SELECT COUNT(*) as count FROM seller_proposals WHERE status = 'PENDING'
        `);
        res.json({ count: parseInt(rows[0].count) });
    } catch (error) {
        next(error);
    }
});

// POST /api/proposals/:id/approve - Approuver une proposition
router.post("/:id/approve", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { id } = req.params;

        // Récupérer la proposition
        const { rows: proposals } = await pool.query(`
            SELECT * FROM seller_proposals WHERE id = $1 AND status = 'PENDING'
        `, [id]);

        if (proposals.length === 0) {
            return res.status(404).json({ error: 'Proposition non trouvée ou déjà traitée' });
        }

        const proposal = proposals[0];

        // Créer l'élément selon le type
        let newItemId = null;

        if (proposal.proposal_type === 'CATEGORY') {
            // Générer un slug
            const slug = proposal.name.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');

            const { rows } = await pool.query(`
                INSERT INTO categories (name, slug, game_id) VALUES ($1, $2, $3) RETURNING id
            `, [proposal.name, slug, proposal.game_id]);
            newItemId = rows[0].id;

        } else if (proposal.proposal_type === 'TAG') {
            const { rows } = await pool.query(`
                INSERT INTO tags (name, game_id) VALUES ($1, $2) RETURNING id
            `, [proposal.name, proposal.game_id]);
            newItemId = rows[0].id;

        } else if (proposal.proposal_type === 'VERSION') {
            // Utiliser game_versions avec le champ "version"
            try {
                const { rows } = await pool.query(`
                    INSERT INTO game_versions (version, game_id, is_active) 
                    VALUES ($1, $2, true) 
                    RETURNING id
                `, [proposal.name, proposal.game_id]);
                newItemId = rows[0].id;
                console.log('✅ Version créée:', proposal.name, 'ID:', newItemId);
            } catch (insertError) {
                console.error('❌ Erreur création version:', insertError.message);
                // Si doublon, on continue quand même (la version existe déjà)
                if (insertError.code !== '23505') {
                    throw insertError;
                }
            }
        }

        // Mettre à jour la proposition
        await pool.query(`
            UPDATE seller_proposals
            SET status = 'APPROVED', reviewed_by = $1, reviewed_at = NOW(), updated_at = NOW()
            WHERE id = $2
        `, [req.user.id, id]);

        // Notifier le vendeur
        try {
            await pool.query(`
                INSERT INTO notifications (user_id, type, title, message)
                VALUES ($1, 'PROPOSAL_APPROVED', $2, $3)
            `, [
                proposal.user_id,
                'Proposition approuvée !',
                `Votre proposition "${proposal.name}" a été approuvée et ajoutée.`
            ]);
        } catch (e) {}

        res.json({ success: true, newItemId });
    } catch (error) {
        next(error);
    }
});

// POST /api/proposals/:id/reject - Rejeter une proposition
router.post("/:id/reject", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Récupérer la proposition
        const { rows: proposals } = await pool.query(`
            SELECT * FROM seller_proposals WHERE id = $1 AND status = 'PENDING'
        `, [id]);

        if (proposals.length === 0) {
            return res.status(404).json({ error: 'Proposition non trouvée ou déjà traitée' });
        }

        const proposal = proposals[0];

        // Mettre à jour la proposition
        await pool.query(`
            UPDATE seller_proposals
            SET status = 'REJECTED', reviewed_by = $1, reviewed_at = NOW(), rejection_reason = $2, updated_at = NOW()
            WHERE id = $3
        `, [req.user.id, reason || null, id]);

        // Notifier le vendeur
        try {
            await pool.query(`
                INSERT INTO notifications (user_id, type, title, message)
                VALUES ($1, 'PROPOSAL_REJECTED', $2, $3)
            `, [
                proposal.user_id,
                'Proposition refusée',
                `Votre proposition "${proposal.name}" a été refusée.${reason ? ` Raison: ${reason}` : ''}`
            ]);
        } catch (e) {}

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

module.exports = router;