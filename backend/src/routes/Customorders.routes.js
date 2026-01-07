const router = require("express").Router();
const pool = require("../db/pool");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configuration multer pour les fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(process.cwd(), "uploads", "custom-orders");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: (req, file, cb) => {
        const allowed = [".jpg", ".jpeg", ".png", ".gif", ".zip", ".rar", ".pdf", ".doc", ".docx"];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Type de fichier non autorisé"));
        }
    }
});

// ==================== ROUTES CLIENT ====================

// POST /api/custom-orders/requests - Créer une demande sur mesure
router.post("/requests", requireAuth, upload.array("attachments", 5), async (req, res, next) => {
    try {
        const { title, description, budget_min, budget_max, deadline, game_id, category_id } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: "Titre et description requis" });
        }

        const attachments = req.files ? req.files.map(f => ({
            filename: f.filename,
            originalname: f.originalname,
            path: `/uploads/custom-orders/${f.filename}`,
            size: f.size
        })) : [];

        const { rows } = await pool.query(
            `INSERT INTO custom_requests
             (client_id, title, description, budget_min, budget_max, deadline, game_id, category_id, attachments)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING *`,
            [
                req.user.id, title, description,
                budget_min || null, budget_max || null, deadline || null,
                game_id || null, category_id || null, JSON.stringify(attachments)
            ]
        );

        res.status(201).json({ request: rows[0] });
    } catch (error) {
        next(error);
    }
});

// GET /api/custom-orders/requests/my - Mes demandes (client)
router.get("/requests/my", requireAuth, async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT cr.*, g.name as game_name, c.name as category_name,
                    (SELECT COUNT(*) FROM custom_offers WHERE request_id = cr.id AND status = 'PENDING') as offers_count
             FROM custom_requests cr
                      LEFT JOIN games g ON g.id = cr.game_id
                      LEFT JOIN categories c ON c.id = cr.category_id
             WHERE cr.client_id = $1
             ORDER BY cr.created_at DESC`,
            [req.user.id]
        );
        res.json({ requests: rows });
    } catch (error) {
        next(error);
    }
});

// GET /api/custom-orders/requests/:id - Détails d'une demande
router.get("/requests/:id", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(
            `SELECT cr.*, g.name as game_name, c.name as category_name,
                    u.username as client_username, u.avatar_url as client_avatar
             FROM custom_requests cr
                      LEFT JOIN games g ON g.id = cr.game_id
                      LEFT JOIN categories c ON c.id = cr.category_id
                      JOIN users u ON u.id = cr.client_id
             WHERE cr.id = $1`,
            [id]
        );

        if (!rows[0]) {
            return res.status(404).json({ error: "Demande non trouvée" });
        }

        const request = rows[0];
        const isClient = request.client_id === req.user.id;
        const isStaff = ["STAFF", "ADMIN"].includes(req.user.role);

        // Vérifier si créateur affilié via creator_type
        const { rows: creatorCheck } = await pool.query(
            `SELECT id, creator_type FROM users WHERE id = $1 AND role = 'CREATOR' AND creator_type IN ('AFFILIATED', 'HYTSTUDIO')`,
            [req.user.id]
        );
        const isAffiliatedCreator = creatorCheck.length > 0;

        if (!isClient && !isStaff && !isAffiliatedCreator) {
            return res.status(403).json({ error: "Accès non autorisé" });
        }

        if (isClient || isStaff) {
            const { rows: offers } = await pool.query(
                `SELECT co.*, u.username as creator_username, u.avatar_url as creator_avatar,
                        u.creator_type
                 FROM custom_offers co
                          JOIN users u ON u.id = co.creator_id
                 WHERE co.request_id = $1
                 ORDER BY co.created_at DESC`,
                [id]
            );
            request.offers = offers;
        }

        if (isAffiliatedCreator) {
            const { rows: myOffer } = await pool.query(
                `SELECT * FROM custom_offers WHERE request_id = $1 AND creator_id = $2`,
                [id, req.user.id]
            );
            request.my_offer = myOffer[0] || null;
        }

        res.json({ request });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/offers/:id/accept - Accepter une offre
router.post("/offers/:id/accept", requireAuth, async (req, res, next) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const { id } = req.params;

        const { rows: offerRows } = await client.query(
            `SELECT co.*, cr.client_id, cr.title as request_title,
                    u.creator_type
             FROM custom_offers co
                      JOIN custom_requests cr ON cr.id = co.request_id
                      JOIN users u ON u.id = co.creator_id
             WHERE co.id = $1 AND co.status = 'PENDING'`,
            [id]
        );

        if (!offerRows[0]) {
            return res.status(404).json({ error: "Offre non trouvée ou déjà traitée" });
        }

        const offer = offerRows[0];
        if (offer.client_id !== req.user.id) {
            return res.status(403).json({ error: "Vous n'êtes pas le client de cette demande" });
        }

        // Commission: 0% si HYTSTUDIO, 5% si AFFILIATED
        const isHytStudio = offer.creator_type === 'HYTSTUDIO';
        const commissionRate = isHytStudio ? 0 : 0.05;
        const commissionAmount = offer.price * commissionRate;
        const firstPayment = offer.price / 2;
        const secondPayment = offer.price - firstPayment;

        await client.query(`UPDATE custom_offers SET status = 'ACCEPTED' WHERE id = $1`, [id]);
        await client.query(
            `UPDATE custom_offers SET status = 'REJECTED' WHERE request_id = $1 AND id != $2 AND status = 'PENDING'`,
            [offer.request_id, id]
        );
        await client.query(`UPDATE custom_requests SET status = 'ASSIGNED' WHERE id = $1`, [offer.request_id]);

        const { rows: orderRows } = await client.query(
            `INSERT INTO custom_orders
             (request_id, offer_id, client_id, creator_id, total_price, commission_rate,
              commission_amount, first_payment_amount, second_payment_amount, estimated_delivery)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW() + INTERVAL '1 day' * $10)
                 RETURNING *`,
            [offer.request_id, id, offer.client_id, offer.creator_id, offer.price,
                commissionRate, commissionAmount, firstPayment, secondPayment, offer.estimated_days]
        );

        await client.query("COMMIT");
        res.json({ order: orderRows[0], message: "Offre acceptée ! Procédez au premier paiement." });
    } catch (error) {
        await client.query("ROLLBACK");
        next(error);
    } finally {
        client.release();
    }
});

// POST /api/custom-orders/offers/:id/reject - Rejeter une offre
router.post("/offers/:id/reject", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            `SELECT co.*, cr.client_id FROM custom_offers co
                                                JOIN custom_requests cr ON cr.id = co.request_id
             WHERE co.id = $1 AND co.status = 'PENDING'`,
            [id]
        );

        if (!rows[0]) return res.status(404).json({ error: "Offre non trouvée" });
        if (rows[0].client_id !== req.user.id) return res.status(403).json({ error: "Non autorisé" });

        await pool.query(`UPDATE custom_offers SET status = 'REJECTED' WHERE id = $1`, [id]);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/orders/:id/pay-first - Payer les 50% initiaux
router.post("/orders/:id/pay-first", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

        const { rows } = await pool.query(
            `SELECT co.*, cr.title as request_title FROM custom_orders co
                                                             JOIN custom_requests cr ON cr.id = co.request_id
             WHERE co.id = $1 AND co.client_id = $2 AND co.status = 'AWAITING_PAYMENT'`,
            [id, req.user.id]
        );

        if (!rows[0]) return res.status(404).json({ error: "Commande non trouvée" });
        const order = rows[0];

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: `Acompte: ${order.request_title}`,
                        description: "Premier paiement (50%) - Remboursable à 50% en cas d'annulation"
                    },
                    unit_amount: Math.round(parseFloat(order.first_payment_amount) * 100)
                },
                quantity: 1
            }],
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/custom-orders/orders/${id}?payment=first&success=true`,
            cancel_url: `${process.env.FRONTEND_URL}/custom-orders/orders/${id}`,
            metadata: { type: "custom_order_first", order_id: id, user_id: req.user.id }
        });

        res.json({ url: session.url });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/orders/:id/pay-final - Payer les 50% finaux
router.post("/orders/:id/pay-final", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

        const { rows } = await pool.query(
            `SELECT co.*, cr.title as request_title FROM custom_orders co
                                                             JOIN custom_requests cr ON cr.id = co.request_id
             WHERE co.id = $1 AND co.client_id = $2 AND co.status = 'AWAITING_FINAL_PAYMENT'`,
            [id, req.user.id]
        );

        if (!rows[0]) return res.status(404).json({ error: "Commande non prête pour le paiement final" });
        const order = rows[0];

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: `Solde: ${order.request_title}`,
                        description: "Paiement final (50%) - Déblocage des fichiers"
                    },
                    unit_amount: Math.round(parseFloat(order.second_payment_amount) * 100)
                },
                quantity: 1
            }],
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/custom-orders/orders/${id}?payment=first&success=true`,
            cancel_url: `${process.env.FRONTEND_URL}/custom-orders/orders/${id}`,
            metadata: { type: "custom_order_final", order_id: id, user_id: req.user.id }
        });

        res.json({ url: session.url });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/orders/:id/cancel - Annuler une commande
// Remboursement: 50% du premier paiement uniquement (25% du total)
// Après livraison: aucun remboursement
router.post("/orders/:id/cancel", requireAuth, async (req, res, next) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const { id } = req.params;
        const { reason } = req.body;

        const { rows } = await client.query(
            `SELECT * FROM custom_orders WHERE id = $1 AND client_id = $2`,
            [id, req.user.id]
        );

        if (!rows[0]) return res.status(404).json({ error: "Commande non trouvée" });
        const order = rows[0];

        // Impossible d'annuler après livraison complète
        if (order.status === 'COMPLETED') {
            return res.status(400).json({ error: "Impossible d'annuler une commande livrée et payée" });
        }
        if (['CANCELLED', 'REFUNDED'].includes(order.status)) {
            return res.status(400).json({ error: "Commande déjà annulée" });
        }

        let refundAmount = 0;
        let refundMessage = "Commande annulée sans remboursement";

        // Remboursement: 50% du premier paiement seulement
        if (order.first_payment_paid && order.first_payment_stripe_id) {
            refundAmount = parseFloat(order.first_payment_amount) * 0.5;
            refundMessage = `Remboursement de ${refundAmount.toFixed(2)}€ (50% de l'acompte)`;

            const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
            try {
                await stripe.refunds.create({
                    payment_intent: order.first_payment_stripe_id,
                    amount: Math.round(refundAmount * 100)
                });
            } catch (stripeError) {
                console.error("Stripe refund error:", stripeError);
            }
        }

        await client.query(
            `UPDATE custom_orders
             SET status = 'CANCELLED', cancel_reason = $2, cancelled_at = NOW(), refund_amount = $3
             WHERE id = $1`,
            [id, reason || 'Annulé par le client', refundAmount]
        );
        await client.query(`UPDATE custom_requests SET status = 'CANCELLED' WHERE id = $1`, [order.request_id]);

        await client.query("COMMIT");
        res.json({ success: true, refund_amount: refundAmount, message: refundMessage });
    } catch (error) {
        await client.query("ROLLBACK");
        next(error);
    } finally {
        client.release();
    }
});

// GET /api/custom-orders/orders/my - Mes commandes (client)
router.get("/orders/my", requireAuth, async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT co.*, cr.title as request_title,
                    u.username as creator_username, u.avatar_url as creator_avatar
             FROM custom_orders co
                      JOIN custom_requests cr ON cr.id = co.request_id
                      JOIN users u ON u.id = co.creator_id
             WHERE co.client_id = $1
             ORDER BY co.created_at DESC`,
            [req.user.id]
        );
        res.json({ orders: rows });
    } catch (error) {
        next(error);
    }
});

// GET /api/custom-orders/orders/:id - Détails d'une commande
router.get("/orders/:id", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(
            `SELECT co.*, cr.title as request_title, cr.description as request_description,
                    cr.attachments as request_attachments,
                    client.username as client_username, client.avatar_url as client_avatar,
                    creator.username as creator_username, creator.avatar_url as creator_avatar
             FROM custom_orders co
                      JOIN custom_requests cr ON cr.id = co.request_id
                      JOIN users client ON client.id = co.client_id
                      JOIN users creator ON creator.id = co.creator_id
             WHERE co.id = $1`,
            [id]
        );

        if (!rows[0]) return res.status(404).json({ error: "Commande non trouvée" });
        const order = rows[0];

        const isClient = order.client_id === req.user.id;
        const isCreator = order.creator_id === req.user.id;
        const isStaff = ["STAFF", "ADMIN"].includes(req.user.role);

        if (!isClient && !isCreator && !isStaff) {
            return res.status(403).json({ error: "Accès non autorisé" });
        }

        // Récupérer les messages
        const { rows: messages } = await pool.query(
            `SELECT com.*, u.username as sender_username, u.avatar_url as sender_avatar
             FROM custom_order_messages com
                      JOIN users u ON u.id = com.sender_id
             WHERE com.order_id = $1
             ORDER BY com.created_at ASC`,
            [id]
        );
        order.messages = messages;

        // Masquer les fichiers finaux tant que pas payé entièrement
        if (!order.second_payment_paid && !isStaff && !isCreator) {
            order.final_files = [];
        }

        res.json({ order, isClient, isCreator });
    } catch (error) {
        next(error);
    }
});

// NOTE: Route déplacée plus bas avec notifications - voir ligne ~876
// POST /api/custom-orders/orders/:id/messages - Envoyer un message
// router.post("/orders/:id/messages", requireAuth, upload.array("attachments", 5), async (req, res, next) => {
//     -- SUPPRIMÉE car dupliquée et sans notification --
// });

// ==================== ROUTES CRÉATEUR ====================

// GET /api/custom-orders/creator/requests - Demandes disponibles
router.get("/creator/requests", requireAuth, async (req, res, next) => {
    try {
        // STAFF/ADMIN sont considérés comme HytStudio
        const isStaffOrAdmin = ['STAFF', 'ADMIN'].includes(req.user.role);

        if (!isStaffOrAdmin) {
            // Vérifier si l'utilisateur est un créateur AFFILIATED ou HYTSTUDIO
            const { rows: userCheck } = await pool.query(
                `SELECT id, creator_type FROM users WHERE id = $1 AND role = 'CREATOR' AND creator_type IN ('AFFILIATED', 'HYTSTUDIO')`,
                [req.user.id]
            );
            if (!userCheck[0]) {
                return res.status(403).json({ error: "Vous devez être un créateur affilié ou HytStudio pour accéder aux demandes sur mesure" });
            }
        }

        // Récupérer les demandes disponibles pour le créateur
        // Inclure : demandes sans interaction OU avec conversation ouverte OU avec offre en attente/acceptée
        // Exclure : demandes avec conversation clôturée OU offre refusée/retirée
        // En production : exclure aussi ses propres demandes
        const isDev = process.env.NODE_ENV !== 'production';

        const { rows } = await pool.query(
            `SELECT cr.*, g.name as game_name, c.name as category_name,
                    u.username as client_username,
                    (SELECT COUNT(*) FROM custom_offers WHERE request_id = cr.id) as offers_count,
                    (SELECT id FROM custom_offers WHERE request_id = cr.id AND creator_id = $1) as my_offer_id,
                    (SELECT status FROM custom_offers WHERE request_id = cr.id AND creator_id = $1) as my_offer_status,
                    (SELECT id FROM custom_conversations WHERE request_id = cr.id AND creator_id = $1) as my_conversation_id,
                    (SELECT status FROM custom_conversations WHERE request_id = cr.id AND creator_id = $1) as my_conversation_status,
                    (SELECT creator_unread_count FROM custom_conversations WHERE request_id = cr.id AND creator_id = $1) as unread_messages
             FROM custom_requests cr
                      LEFT JOIN games g ON g.id = cr.game_id
                      LEFT JOIN categories c ON c.id = cr.category_id
                      JOIN users u ON u.id = cr.client_id
             WHERE cr.status = 'APPROVED'
             -- En production, exclure ses propres demandes
                 ${isDev ? '' : 'AND cr.client_id != $1'}
               -- Exclure si le créateur a une conversation clôturée
               AND NOT EXISTS (
                   SELECT 1 FROM custom_conversations cc 
                   WHERE cc.request_id = cr.id 
                   AND cc.creator_id = $1
               AND cc.status = 'CLOSED'
                 )
             -- Exclure si le créateur a une offre refusée ou retirée (et pas de conversation ouverte)
               AND NOT EXISTS (
                 SELECT 1 FROM custom_offers co
                 WHERE co.request_id = cr.id
               AND co.creator_id = $1
               AND co.status IN ('REJECTED', 'WITHDRAWN')
               AND NOT EXISTS (
                 SELECT 1 FROM custom_conversations cc2
                 WHERE cc2.request_id = cr.id
               AND cc2.creator_id = $1
               AND cc2.status = 'OPEN'
                 )
                 )
             ORDER BY cr.created_at DESC`,
            [req.user.id]
        );

        // Récupérer aussi les conversations actives du créateur (pour les afficher séparément)
        const { rows: activeConversations } = await pool.query(
            `SELECT cc.*, cr.title as request_title, cr.description as request_description,
                    cr.budget_min, cr.budget_max, cr.deadline, cr.status as request_status,
                    g.name as game_name, cat.name as category_name,
                    u.username as client_username, u.avatar_url as client_avatar,
                    co.id as offer_id, co.price as offer_price, co.status as offer_status, co.estimated_days
             FROM custom_conversations cc
                      JOIN custom_requests cr ON cr.id = cc.request_id
                      LEFT JOIN games g ON g.id = cr.game_id
                      LEFT JOIN categories cat ON cat.id = cr.category_id
                      JOIN users u ON u.id = cc.client_id
                      LEFT JOIN custom_offers co ON co.request_id = cc.request_id AND co.creator_id = cc.creator_id
             WHERE cc.creator_id = $1
               AND cc.status = 'OPEN'
               AND cr.status IN ('APPROVED', 'ASSIGNED')
             ORDER BY cc.last_message_at DESC`,
            [req.user.id]
        );

        res.json({
            requests: rows,
            active_conversations: activeConversations
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/creator/offers - Faire une offre
router.post("/creator/offers", requireAuth, async (req, res, next) => {
    try {
        const { request_id, price, estimated_days, message } = req.body;
        if (!request_id || !price || !estimated_days || !message) {
            return res.status(400).json({ error: "Tous les champs sont requis" });
        }

        // STAFF/ADMIN sont considérés comme HytStudio (0% commission)
        const isStaffOrAdmin = ['STAFF', 'ADMIN'].includes(req.user.role);
        let isHytStudio = isStaffOrAdmin;

        if (!isStaffOrAdmin) {
            // Vérifier si l'utilisateur est un créateur AFFILIATED ou HYTSTUDIO
            const { rows: userCheck } = await pool.query(
                `SELECT id, creator_type FROM users WHERE id = $1 AND role = 'CREATOR' AND creator_type IN ('AFFILIATED', 'HYTSTUDIO')`,
                [req.user.id]
            );
            if (!userCheck[0]) {
                return res.status(403).json({ error: "Vous devez être un créateur affilié ou HytStudio" });
            }
            isHytStudio = userCheck[0].creator_type === 'HYTSTUDIO';
        }

        const commissionRate = isHytStudio ? 0 : 0.05; // 0% pour HytStudio/Staff/Admin, 5% pour Affilié

        const { rows: requestCheck } = await pool.query(
            `SELECT * FROM custom_requests WHERE id = $1 AND status = 'APPROVED'`,
            [request_id]
        );
        if (!requestCheck[0]) return res.status(404).json({ error: "Demande non disponible" });

        // En production, empêcher de faire une offre sur sa propre demande
        // En dev (NODE_ENV !== 'production'), on autorise pour les tests
        const isDev = process.env.NODE_ENV !== 'production';
        if (!isDev && requestCheck[0].client_id === req.user.id) {
            return res.status(400).json({ error: "Vous ne pouvez pas faire une offre sur votre propre demande" });
        }

        const { rows: existingOffer } = await pool.query(
            `SELECT id FROM custom_offers WHERE request_id = $1 AND creator_id = $2`,
            [request_id, req.user.id]
        );
        if (existingOffer[0]) return res.status(400).json({ error: "Vous avez déjà fait une offre" });

        const { rows } = await pool.query(
            `INSERT INTO custom_offers
             (request_id, creator_id, price, estimated_days, message, commission_rate, is_hytmodel_creator)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING *`,
            [request_id, req.user.id, price, estimated_days, message, commissionRate, isHytStudio]
        );

        // Notification au client (sauf si c'est soi-même en dev)
        if (requestCheck[0].client_id !== req.user.id) {
            await pool.query(
                `INSERT INTO notifications (user_id, type, title, message, data)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    requestCheck[0].client_id,
                    'CUSTOM_ORDER_OFFER',
                    'Nouvelle offre reçue',
                    `Vous avez reçu une offre de ${(price / 100).toFixed(2)}€ pour "${requestCheck[0].title}"`,
                    JSON.stringify({
                        request_id: request_id,
                        offer_id: rows[0].id,
                        link: `/custom-orders/requests/${request_id}`
                    })
                ]
            );
        }

        res.status(201).json({ offer: rows[0] });
    } catch (error) {
        next(error);
    }
});

// GET /api/custom-orders/creator/orders - Mes commandes (créateur)
router.get("/creator/orders", requireAuth, async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT co.*, cr.title as request_title,
                    u.username as client_username, u.avatar_url as client_avatar
             FROM custom_orders co
                      JOIN custom_requests cr ON cr.id = co.request_id
                      JOIN users u ON u.id = co.client_id
             WHERE co.creator_id = $1
             ORDER BY co.created_at DESC`,
            [req.user.id]
        );
        res.json({ orders: rows });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/orders/:id/deliver - Livrer la commande avec fichiers
router.post("/orders/:id/deliver", requireAuth, upload.array("files", 10), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        const { rows } = await pool.query(
            `SELECT co.*, cr.title as request_title
             FROM custom_orders co
                      JOIN custom_requests cr ON cr.id = co.request_id
             WHERE co.id = $1 AND co.creator_id = $2 AND co.status = 'IN_PROGRESS'`,
            [id, req.user.id]
        );
        if (!rows[0]) return res.status(404).json({ error: "Commande non trouvée ou pas en cours" });

        const order = rows[0];

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "Veuillez joindre les fichiers de livraison" });
        }

        const finalFiles = req.files.map(f => ({
            filename: f.filename,
            originalname: f.originalname,
            path: `/uploads/custom-orders/${f.filename}`,
            size: f.size
        }));

        // Mettre en attente de validation (pas directement AWAITING_FINAL_PAYMENT)
        await pool.query(
            `UPDATE custom_orders
             SET status = 'PENDING_REVIEW', progress = 100, final_files = $2, delivered_at = NOW()
             WHERE id = $1`,
            [id, JSON.stringify(finalFiles)]
        );

        // Message de livraison
        await pool.query(
            `INSERT INTO custom_order_messages
             (order_id, sender_id, message_type, content, attachments, progress_value)
             VALUES ($1, $2, 'DELIVERY', $3, $4, 100)`,
            [id, req.user.id, message || '📦 Livraison effectuée ! Veuillez vérifier les fichiers.', JSON.stringify(finalFiles)]
        );

        // Notification au client
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                order.client_id,
                'CUSTOM_ORDER_DELIVERED',
                'Commande livrée ! 📦',
                `Le créateur a livré votre commande "${order.request_title}". Vérifiez et validez.`,
                JSON.stringify({ order_id: id, link: `/custom-orders/orders/${id}` })
            ]
        );

        res.json({ success: true, message: "Livraison effectuée ! En attente de validation du client." });
    } catch (error) {
        next(error);
    }
});

// GET /api/custom-orders/orders/:id - Détails d'une commande avec messages
router.get("/orders/:id", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(
            `SELECT co.*,
                    cr.title as request_title, cr.description as request_description,
                    cr.attachments as request_attachments,
                    client.username as client_username, client.avatar_url as client_avatar,
                    creator.username as creator_username, creator.avatar_url as creator_avatar
             FROM custom_orders co
                      JOIN custom_requests cr ON cr.id = co.request_id
                      JOIN users client ON client.id = co.client_id
                      JOIN users creator ON creator.id = co.creator_id
             WHERE co.id = $1`,
            [id]
        );

        if (!rows[0]) {
            return res.status(404).json({ error: "Commande non trouvée" });
        }

        const order = rows[0];

        // Vérifier que l'utilisateur fait partie de la commande
        if (order.client_id !== req.user.id && order.creator_id !== req.user.id && !['STAFF', 'ADMIN'].includes(req.user.role)) {
            return res.status(403).json({ error: "Accès non autorisé" });
        }

        // Récupérer la conversation associée (si elle existe)
        const { rows: convRows } = await pool.query(
            `SELECT id FROM custom_conversations
             WHERE request_id = $1 AND client_id = $2 AND creator_id = $3`,
            [order.request_id, order.client_id, order.creator_id]
        );
        const conversationId = convRows[0]?.id;

        // Récupérer les messages de la conversation (pré-commande)
        let conversationMessages = [];
        if (conversationId) {
            const { rows: convMsgs } = await pool.query(
                `SELECT ccm.id, ccm.conversation_id, ccm.sender_id, ccm.content, ccm.attachments,
                        ccm.is_read, ccm.created_at,
                        'CONVERSATION' as source,
                        'MESSAGE' as message_type,
                        u.username as sender_username, u.avatar_url as sender_avatar
                 FROM custom_conversation_messages ccm
                          JOIN users u ON u.id = ccm.sender_id
                 WHERE ccm.conversation_id = $1
                 ORDER BY ccm.created_at ASC`,
                [conversationId]
            );
            conversationMessages = convMsgs;
        }

        // Récupérer les messages de la commande (post-acceptation)
        const { rows: orderMessages } = await pool.query(
            `SELECT com.id, com.order_id, com.sender_id, com.content, com.attachments,
                    com.is_read, com.created_at, com.message_type, com.progress_value,
                    'ORDER' as source,
                    u.username as sender_username, u.avatar_url as sender_avatar
             FROM custom_order_messages com
                      JOIN users u ON u.id = com.sender_id
             WHERE com.order_id = $1
             ORDER BY com.created_at ASC`,
            [id]
        );

        // Fusionner et trier par date
        const allMessages = [...conversationMessages, ...orderMessages].sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );

        // Ajouter un message système pour marquer le début de la commande
        if (conversationMessages.length > 0 && orderMessages.length > 0) {
            // Trouver la date du premier message de commande
            const firstOrderMessage = orderMessages[0];
            const orderStartIndex = allMessages.findIndex(m => m.source === 'ORDER');

            if (orderStartIndex > 0) {
                // Insérer un séparateur
                allMessages.splice(orderStartIndex, 0, {
                    id: 'separator-order-start',
                    content: '✅ Offre acceptée - Commande démarrée',
                    message_type: 'SYSTEM',
                    source: 'SYSTEM',
                    created_at: firstOrderMessage.created_at,
                    is_separator: true
                });
            }
        }

        // Marquer les messages de commande comme lus
        await pool.query(
            `UPDATE custom_order_messages
             SET is_read = TRUE
             WHERE order_id = $1 AND sender_id != $2 AND is_read = FALSE`,
            [id, req.user.id]
        );

        // Marquer les messages de conversation comme lus aussi
        if (conversationId) {
            const isClient = order.client_id === req.user.id;
            if (isClient) {
                await pool.query(
                    `UPDATE custom_conversations SET client_unread_count = 0 WHERE id = $1`,
                    [conversationId]
                );
            } else {
                await pool.query(
                    `UPDATE custom_conversations SET creator_unread_count = 0 WHERE id = $1`,
                    [conversationId]
                );
            }
        }

        // Ajouter les messages à l'objet order pour compatibilité
        order.messages = allMessages;
        order.conversation_id = conversationId;

        res.json({
            order,
            messages: allMessages,
            isClient: order.client_id === req.user.id,
            isCreator: order.creator_id === req.user.id
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/orders/:id/messages - Envoyer un message dans une commande
router.post("/orders/:id/messages", requireAuth, upload.array("attachments", 5), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content, message_type } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({ error: "Message requis" });
        }

        // Vérifier la commande
        const { rows } = await pool.query(
            `SELECT * FROM custom_orders WHERE id = $1`,
            [id]
        );

        if (!rows[0]) {
            return res.status(404).json({ error: "Commande non trouvée" });
        }

        const order = rows[0];

        // Vérifier que l'utilisateur fait partie de la commande
        if (order.client_id !== req.user.id && order.creator_id !== req.user.id) {
            return res.status(403).json({ error: "Accès non autorisé" });
        }

        // Bloquer les messages sur commandes terminées ou annulées (sauf DISPUTED)
        if (['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(order.status)) {
            return res.status(400).json({ error: "Impossible d'envoyer des messages sur une commande terminée" });
        }

        const attachments = req.files ? req.files.map(f => ({
            filename: f.filename,
            originalname: f.originalname,
            path: `/uploads/custom-orders/${f.filename}`,
            size: f.size
        })) : [];

        // Créer le message
        const { rows: messageRows } = await pool.query(
            `INSERT INTO custom_order_messages (order_id, sender_id, message_type, content, attachments)
             VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
            [id, req.user.id, message_type || 'MESSAGE', content.trim(), JSON.stringify(attachments)]
        );

        // Récupérer le message avec les infos utilisateur
        const { rows: fullMessage } = await pool.query(
            `SELECT com.*, u.username as sender_username, u.avatar_url as sender_avatar
             FROM custom_order_messages com
                      JOIN users u ON u.id = com.sender_id
             WHERE com.id = $1`,
            [messageRows[0].id]
        );

        // Notification au destinataire
        const recipientId = order.client_id === req.user.id ? order.creator_id : order.client_id;
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                recipientId,
                'CUSTOM_ORDER_MESSAGE',
                'Nouveau message',
                `Nouveau message sur votre commande`,
                JSON.stringify({ order_id: id, link: `/custom-orders/orders/${id}` })
            ]
        );

        res.status(201).json({ message: fullMessage[0] });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/orders/:id/deliver - Livrer (sans fichier obligatoire)
router.post("/orders/:id/deliver-simple", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(
            `SELECT * FROM custom_orders WHERE id = $1 AND creator_id = $2 AND status = 'IN_PROGRESS'`,
            [id, req.user.id]
        );
        if (!rows[0]) return res.status(404).json({ error: "Commande non trouvée ou pas en cours" });

        await pool.query(
            `UPDATE custom_orders
             SET status = 'PENDING_REVIEW', progress = 100, delivered_at = NOW()
             WHERE id = $1`,
            [id]
        );

        // Message système
        await pool.query(
            `INSERT INTO custom_order_messages
                 (order_id, sender_id, message_type, content, attachments)
             VALUES ($1, $2, 'DELIVERY', '📦 Commande livrée ! En attente de validation.', '[]')`,
            [id, req.user.id]
        );

        // Notification au client
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                rows[0].client_id,
                'CUSTOM_ORDER_DELIVERED',
                'Commande livrée !',
                'Le créateur a livré votre commande. Vérifiez et validez.',
                JSON.stringify({ order_id: id, link: `/custom-orders/orders/${id}` })
            ]
        );

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/orders/:id/approve - Client valide la livraison
router.post("/orders/:id/approve", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(
            `SELECT * FROM custom_orders WHERE id = $1 AND client_id = $2 AND status = 'PENDING_REVIEW'`,
            [id, req.user.id]
        );
        if (!rows[0]) return res.status(404).json({ error: "Commande non trouvée ou pas en attente de validation" });

        await pool.query(
            `UPDATE custom_orders
             SET status = 'AWAITING_FINAL_PAYMENT'
             WHERE id = $1`,
            [id]
        );

        // Message système
        await pool.query(
            `INSERT INTO custom_order_messages
                 (order_id, sender_id, message_type, content, attachments)
             VALUES ($1, $2, 'PROGRESS_UPDATE', '✅ Livraison validée par le client !', '[]')`,
            [id, req.user.id]
        );

        // Notification au créateur
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                rows[0].creator_id,
                'CUSTOM_ORDER_APPROVED',
                'Livraison validée !',
                'Le client a validé votre livraison. En attente du paiement final.',
                JSON.stringify({ order_id: id, link: `/custom-orders/orders/${id}` })
            ]
        );

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/orders/:id/revision - Client demande des révisions
router.post("/orders/:id/revision", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason?.trim()) {
            return res.status(400).json({ error: "Veuillez décrire les modifications souhaitées" });
        }

        const { rows } = await pool.query(
            `SELECT * FROM custom_orders WHERE id = $1 AND client_id = $2 AND status = 'PENDING_REVIEW'`,
            [id, req.user.id]
        );
        if (!rows[0]) return res.status(404).json({ error: "Commande non trouvée ou pas en attente de validation" });

        await pool.query(
            `UPDATE custom_orders
             SET status = 'IN_PROGRESS', progress = 80
             WHERE id = $1`,
            [id]
        );

        // Message système
        await pool.query(
            `INSERT INTO custom_order_messages
                 (order_id, sender_id, message_type, content, attachments)
             VALUES ($1, $2, 'REVISION_REQUEST', $3, '[]')`,
            [id, req.user.id, `🔄 Demande de révision :\n\n${reason}`]
        );

        // Notification au créateur
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                rows[0].creator_id,
                'CUSTOM_ORDER_REVISION',
                'Révision demandée',
                'Le client a demandé des modifications.',
                JSON.stringify({ order_id: id, link: `/custom-orders/orders/${id}` })
            ]
        );

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// ==================== RÉTRACTATION & RÉCLAMATIONS ====================

// POST /api/custom-orders/orders/:id/withdraw - Client se rétracte pendant IN_PROGRESS
// Remboursement: 25% au client, 20% au vendeur (pour travail effectué)
router.post("/orders/:id/withdraw", requireAuth, async (req, res, next) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const { id } = req.params;
        const { reason } = req.body;

        const { rows } = await client.query(
            `SELECT co.*, cr.title as request_title,
                    creator.username as creator_username, creator.stripe_account_id as creator_stripe_id
             FROM custom_orders co
                      JOIN custom_requests cr ON cr.id = co.request_id
                      JOIN users creator ON creator.id = co.creator_id
             WHERE co.id = $1 AND co.client_id = $2 AND co.status = 'IN_PROGRESS'`,
            [id, req.user.id]
        );

        if (!rows[0]) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Commande non trouvée ou rétractation impossible à ce stade" });
        }

        const order = rows[0];
        const firstPayment = parseFloat(order.first_payment_amount);

        // Calculs: 25% remboursé au client, 20% au vendeur, 5% frais plateforme
        const clientRefund = firstPayment * 0.25;
        const creatorPayment = firstPayment * 0.20;
        const platformFee = firstPayment * 0.05; // 5% de frais

        // Remboursement Stripe au client
        if (order.first_payment_stripe_id) {
            try {
                const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
                await stripe.refunds.create({
                    payment_intent: order.first_payment_stripe_id,
                    amount: Math.round(clientRefund * 100)
                });
            } catch (stripeError) {
                console.error("Stripe refund error:", stripeError);
            }
        }

        // Paiement au créateur si compte Stripe Connect
        if (order.creator_stripe_id) {
            try {
                const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
                await stripe.transfers.create({
                    amount: Math.round(creatorPayment * 100),
                    currency: "eur",
                    destination: order.creator_stripe_id,
                    transfer_group: `custom_order_withdraw_${id}`
                });
            } catch (stripeError) {
                console.error("Stripe transfer error:", stripeError);
            }
        }

        // Mettre à jour la commande
        await client.query(
            `UPDATE custom_orders
             SET status = 'CANCELLED',
                 cancel_reason = $2,
                 cancelled_at = NOW(),
                 refund_amount = $3
             WHERE id = $1`,
            [id, reason || 'Rétractation client pendant réalisation', clientRefund]
        );

        // Mettre à jour la demande
        await client.query(
            `UPDATE custom_requests SET status = 'CANCELLED' WHERE id = $1`,
            [order.request_id]
        );

        // Message système
        await client.query(
            `INSERT INTO custom_order_messages
                 (order_id, sender_id, message_type, content, attachments)
             VALUES ($1, $2, 'SYSTEM', $3, '[]')`,
            [id, req.user.id, `⚠️ Rétractation du client\n\nRemboursement client: ${clientRefund.toFixed(2)}€ (25%)\nCompensation créateur: ${creatorPayment.toFixed(2)}€ (20%)\n\nRaison: ${reason || 'Non spécifiée'}`]
        );

        // Notification au créateur
        await client.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                order.creator_id,
                'CUSTOM_ORDER_WITHDRAWN',
                'Commande annulée par le client',
                `Le client s'est rétracté de la commande "${order.request_title}". Vous recevez ${creatorPayment.toFixed(2)}€ pour le travail effectué.`,
                JSON.stringify({ order_id: id, link: `/custom-orders/orders/${id}` })
            ]
        );

        // Enregistrer le paiement vendeur
        await client.query(
            `INSERT INTO seller_payments
             (seller_id, payment_number, gross_amount, commission_rate, commission_amount, net_amount, status)
             VALUES ($1, $2, $3, 0, 0, $3, 'PAID')`,
            [order.creator_id, `PAY-WITHDRAW-${Date.now()}`, creatorPayment]
        );

        await client.query("COMMIT");

        res.json({
            success: true,
            client_refund: clientRefund,
            creator_payment: creatorPayment,
            message: `Rétractation effectuée. Remboursement: ${clientRefund.toFixed(2)}€`
        });
    } catch (error) {
        await client.query("ROLLBACK");
        next(error);
    } finally {
        client.release();
    }
});

// POST /api/custom-orders/orders/:id/claim - Client fait une réclamation sur les fichiers
router.post("/orders/:id/claim", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason?.trim() || reason.length < 20) {
            return res.status(400).json({ error: "Veuillez décrire le problème en détail (min 20 caractères)" });
        }

        // Vérifier la commande (autoriser COMPLETED, AWAITING_FINAL_PAYMENT, PENDING_REVIEW)
        // On autorise aussi DISPUTED si la réclamation précédente a été résolue
        const { rows } = await pool.query(
            `SELECT co.*, cr.title as request_title
             FROM custom_orders co
                      JOIN custom_requests cr ON cr.id = co.request_id
             WHERE co.id = $1 AND co.client_id = $2`,
            [id, req.user.id]
        );

        if (!rows[0]) {
            return res.status(404).json({ error: "Commande non trouvée" });
        }

        const order = rows[0];

        // Vérifier que la commande n'est pas annulée
        if (['CANCELLED', 'REFUNDED'].includes(order.status)) {
            return res.status(400).json({ error: "Impossible de faire une réclamation sur une commande annulée" });
        }

        // Vérifier qu'il n'y a pas déjà une réclamation OUVERTE (non résolue)
        const { rows: existingClaim } = await pool.query(
            `SELECT id FROM custom_order_claims WHERE order_id = $1 AND status IN ('OPEN', 'IN_REVIEW')`,
            [id]
        );

        if (existingClaim[0]) {
            return res.status(400).json({ error: "Une réclamation est déjà en cours pour cette commande" });
        }

        // Créer la réclamation
        const { rows: claimRows } = await pool.query(
            `INSERT INTO custom_order_claims (order_id, client_id, reason)
             VALUES ($1, $2, $3)
                 RETURNING *`,
            [id, req.user.id, reason]
        );

        // Marquer la commande comme ayant une réclamation
        await pool.query(
            `UPDATE custom_orders
             SET has_active_claim = TRUE, claim_count = claim_count + 1, status = 'DISPUTED'
             WHERE id = $1`,
            [id]
        );

        // Message système
        await pool.query(
            `INSERT INTO custom_order_messages
                 (order_id, sender_id, message_type, content, attachments)
             VALUES ($1, $2, 'SYSTEM', $3, '[]')`,
            [id, req.user.id, `⚠️ Réclamation ouverte\n\nProblème signalé:\n${reason}`]
        );

        // Notification au créateur
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                order.creator_id,
                'CUSTOM_ORDER_CLAIM',
                'Réclamation client ⚠️',
                `Le client a signalé un problème avec "${order.request_title}". Veuillez proposer une correction.`,
                JSON.stringify({ order_id: id, claim_id: claimRows[0].id, link: `/custom-orders/orders/${id}` })
            ]
        );

        // Notification aux staff
        const { rows: staffUsers } = await pool.query(
            `SELECT id FROM users WHERE role IN ('STAFF', 'ADMIN')`
        );

        for (const staff of staffUsers) {
            await pool.query(
                `INSERT INTO notifications (user_id, type, title, message, data)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    staff.id,
                    'CUSTOM_ORDER_CLAIM_STAFF',
                    'Nouvelle réclamation',
                    `Réclamation sur la commande "${order.request_title}"`,
                    JSON.stringify({ order_id: id, claim_id: claimRows[0].id, link: `/admin/custom-orders/claims/${claimRows[0].id}` })
                ]
            );
        }

        res.status(201).json({
            claim: claimRows[0],
            message: "Réclamation envoyée. Le créateur et notre équipe ont été notifiés."
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/custom-orders/orders/:id/claims - Réclamations d'une commande
router.get("/orders/:id/claims", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        // Vérifier l'accès
        const { rows: orderRows } = await pool.query(
            `SELECT * FROM custom_orders WHERE id = $1`,
            [id]
        );

        if (!orderRows[0]) {
            return res.status(404).json({ error: "Commande non trouvée" });
        }

        const order = orderRows[0];
        const isParticipant = order.client_id === req.user.id || order.creator_id === req.user.id;
        const isStaff = ['STAFF', 'ADMIN'].includes(req.user.role);

        if (!isParticipant && !isStaff) {
            return res.status(403).json({ error: "Accès non autorisé" });
        }

        // Récupérer les réclamations avec les correctifs
        const { rows: claims } = await pool.query(
            `SELECT coc.*,
                    u.username as client_username,
                    s.username as staff_username
             FROM custom_order_claims coc
                      JOIN users u ON u.id = coc.client_id
                      LEFT JOIN users s ON s.id = coc.staff_id
             WHERE coc.order_id = $1
             ORDER BY coc.created_at DESC`,
            [id]
        );

        // Récupérer les correctifs
        const { rows: fixes } = await pool.query(
            `SELECT cof.*, u.username as creator_username
             FROM custom_order_fixes cof
                      JOIN users u ON u.id = cof.creator_id
             WHERE cof.order_id = $1
             ORDER BY cof.created_at DESC`,
            [id]
        );

        res.json({ claims, fixes });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/orders/:id/fix - Créateur envoie un correctif
router.post("/orders/:id/fix", requireAuth, upload.array("files", 10), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { message, claim_id } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "Veuillez joindre les fichiers corrigés" });
        }

        // Vérifier la commande
        const { rows } = await pool.query(
            `SELECT co.*, cr.title as request_title
             FROM custom_orders co
                      JOIN custom_requests cr ON cr.id = co.request_id
             WHERE co.id = $1 AND co.creator_id = $2 AND co.status = 'DISPUTED'`,
            [id, req.user.id]
        );

        if (!rows[0]) {
            return res.status(404).json({ error: "Commande non trouvée ou pas en litige" });
        }

        const order = rows[0];

        // Compter les versions existantes
        const { rows: versionCount } = await pool.query(
            `SELECT COUNT(*) as count FROM custom_order_fixes WHERE order_id = $1`,
            [id]
        );
        const newVersion = parseInt(versionCount[0].count) + 1;

        const files = req.files.map(f => ({
            filename: f.filename,
            originalname: f.originalname,
            path: `/uploads/custom-orders/${f.filename}`,
            size: f.size
        }));

        // Créer le correctif
        const { rows: fixRows } = await pool.query(
            `INSERT INTO custom_order_fixes (order_id, claim_id, creator_id, files, message, version)
             VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
            [id, claim_id || null, req.user.id, JSON.stringify(files), message || '', newVersion]
        );

        // Message système
        await pool.query(
            `INSERT INTO custom_order_messages
                 (order_id, sender_id, message_type, content, attachments)
             VALUES ($1, $2, 'SYSTEM', $3, $4)`,
            [id, req.user.id, `🔧 Correctif v${newVersion} envoyé\n\n${message || 'Veuillez vérifier les fichiers corrigés.'}`, JSON.stringify(files)]
        );

        // Notification au client
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                order.client_id,
                'CUSTOM_ORDER_FIX',
                'Correctif disponible 🔧',
                `Le créateur a envoyé une correction (v${newVersion}) pour "${order.request_title}"`,
                JSON.stringify({ order_id: id, fix_id: fixRows[0].id, link: `/custom-orders/orders/${id}` })
            ]
        );

        res.status(201).json({ fix: fixRows[0], message: "Correctif envoyé au client" });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/orders/:id/fix/:fixId/accept - Client accepte le correctif
router.post("/orders/:id/fix/:fixId/accept", requireAuth, async (req, res, next) => {
    try {
        const { id, fixId } = req.params;

        // Vérifier la commande
        const { rows } = await pool.query(
            `SELECT co.*, cr.title as request_title
             FROM custom_orders co
                      JOIN custom_requests cr ON cr.id = co.request_id
             WHERE co.id = $1 AND co.client_id = $2`,
            [id, req.user.id]
        );

        if (!rows[0]) {
            return res.status(404).json({ error: "Commande non trouvée" });
        }

        const order = rows[0];

        // Vérifier le correctif
        const { rows: fixRows } = await pool.query(
            `SELECT * FROM custom_order_fixes WHERE id = $1 AND order_id = $2`,
            [fixId, id]
        );

        if (!fixRows[0]) {
            return res.status(404).json({ error: "Correctif non trouvé" });
        }

        // Accepter le correctif
        await pool.query(
            `UPDATE custom_order_fixes SET is_accepted = TRUE WHERE id = $1`,
            [fixId]
        );

        // Mettre à jour les fichiers finaux avec le correctif
        // S'assurer que files est bien une chaîne JSON
        const fixFiles = typeof fixRows[0].files === 'string'
            ? fixRows[0].files
            : JSON.stringify(fixRows[0].files);

        // Déterminer le nouveau statut : si déjà tout payé, rester COMPLETED, sinon AWAITING_FINAL_PAYMENT
        const newStatus = order.second_payment_paid ? 'COMPLETED' : 'AWAITING_FINAL_PAYMENT';

        await pool.query(
            `UPDATE custom_orders
             SET final_files = $2, has_active_claim = FALSE, status = $3
             WHERE id = $1`,
            [id, fixFiles, newStatus]
        );

        // Résoudre la réclamation liée au correctif OU toutes les réclamations ouvertes
        if (fixRows[0].claim_id) {
            await pool.query(
                `UPDATE custom_order_claims
                 SET status = 'RESOLVED', resolution = 'Correctif accepté par le client', resolved_at = NOW()
                 WHERE id = $1`,
                [fixRows[0].claim_id]
            );
        }

        // Résoudre aussi toutes les autres réclamations ouvertes de cette commande
        await pool.query(
            `UPDATE custom_order_claims
             SET status = 'RESOLVED', resolution = 'Correctif accepté par le client', resolved_at = NOW()
             WHERE order_id = $1 AND status IN ('OPEN', 'IN_REVIEW')`,
            [id]
        );

        // Message système
        await pool.query(
            `INSERT INTO custom_order_messages 
             (order_id, sender_id, message_type, content, attachments)
             VALUES ($1, $2, 'SYSTEM', '✅ Correctif accepté ! La réclamation est résolue.', '[]')`,
            [id, req.user.id]
        );

        // Notification au créateur
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                order.creator_id,
                'CUSTOM_ORDER_FIX_ACCEPTED',
                'Correctif accepté ✅',
                `Le client a accepté votre correctif pour "${order.request_title}"`,
                JSON.stringify({ order_id: id, link: `/custom-orders/orders/${id}` })
            ]
        );

        res.json({ success: true, message: "Correctif accepté. Vous pouvez maintenant procéder au paiement final." });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/orders/:id/fix/:fixId/reject - Client refuse le correctif
router.post("/orders/:id/fix/:fixId/reject", requireAuth, async (req, res, next) => {
    try {
        const { id, fixId } = req.params;
        const { feedback } = req.body;

        // Vérifier la commande
        const { rows } = await pool.query(
            `SELECT co.*, cr.title as request_title
             FROM custom_orders co
                      JOIN custom_requests cr ON cr.id = co.request_id
             WHERE co.id = $1 AND co.client_id = $2`,
            [id, req.user.id]
        );

        if (!rows[0]) {
            return res.status(404).json({ error: "Commande non trouvée" });
        }

        const order = rows[0];

        // Refuser le correctif
        await pool.query(
            `UPDATE custom_order_fixes SET is_accepted = FALSE, client_feedback = $2 WHERE id = $1`,
            [fixId, feedback || null]
        );

        // Message système
        await pool.query(
            `INSERT INTO custom_order_messages
                 (order_id, sender_id, message_type, content, attachments)
             VALUES ($1, $2, 'SYSTEM', $3, '[]')`,
            [id, req.user.id, `❌ Correctif refusé\n\n${feedback ? 'Feedback: ' + feedback : 'Veuillez proposer une nouvelle correction.'}`]
        );

        // Notification au créateur
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                order.creator_id,
                'CUSTOM_ORDER_FIX_REJECTED',
                'Correctif refusé ❌',
                `Le client a refusé votre correctif pour "${order.request_title}". ${feedback ? 'Feedback: ' + feedback : ''}`,
                JSON.stringify({ order_id: id, link: `/custom-orders/orders/${id}` })
            ]
        );

        res.json({ success: true, message: "Feedback envoyé au créateur" });
    } catch (error) {
        next(error);
    }
});

// ==================== ROUTES STAFF ====================

// GET /api/custom-orders/staff/requests - Toutes les demandes
router.get("/staff/requests", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { status } = req.query;
        let query = `
            SELECT cr.*, g.name as game_name, c.name as category_name,
                   u.username as client_username, u.email as client_email,
                   (SELECT COUNT(*) FROM custom_offers WHERE request_id = cr.id) as offers_count
            FROM custom_requests cr
                     LEFT JOIN games g ON g.id = cr.game_id
                     LEFT JOIN categories c ON c.id = cr.category_id
                     JOIN users u ON u.id = cr.client_id
        `;
        const values = [];
        if (status) {
            query += ` WHERE cr.status = $1`;
            values.push(status);
        }
        query += ` ORDER BY cr.created_at DESC`;

        const { rows } = await pool.query(query, values);
        res.json({ requests: rows });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/staff/requests/:id/approve - Approuver une demande
router.post("/staff/requests/:id/approve", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        await pool.query(
            `UPDATE custom_requests
             SET status = 'APPROVED', reviewed_by = $2, reviewed_at = NOW(), staff_notes = $3
             WHERE id = $1 AND status = 'PENDING'`,
            [id, req.user.id, notes || null]
        );
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/staff/requests/:id/reject - Rejeter une demande
router.post("/staff/requests/:id/reject", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        if (!reason) return res.status(400).json({ error: "Raison requise" });

        await pool.query(
            `UPDATE custom_requests
             SET status = 'REJECTED', reviewed_by = $2, reviewed_at = NOW(), staff_notes = $3
             WHERE id = $1 AND status = 'PENDING'`,
            [id, req.user.id, reason]
        );
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// GET /api/custom-orders/staff/creators - Liste des créateurs affiliés
router.get("/staff/creators", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT ac.*, u.username, u.email, u.avatar_url
             FROM affiliated_creators ac
                      JOIN users u ON u.id = ac.user_id
             ORDER BY ac.created_at DESC`
        );
        res.json({ creators: rows });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/staff/creators - Ajouter un créateur affilié
router.post("/staff/creators", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { user_id, is_hytmodel_creator, commission_rate, specialties, bio, portfolio_url } = req.body;
        if (!user_id) return res.status(400).json({ error: "user_id requis" });

        const { rows } = await pool.query(
            `INSERT INTO affiliated_creators
             (user_id, is_hytmodel_creator, commission_rate, specialties, bio, portfolio_url, verified_by, verified_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                 ON CONFLICT (user_id) DO UPDATE SET
                is_hytmodel_creator = $2, commission_rate = $3, specialties = $4,
                                              bio = $5, portfolio_url = $6, is_active = TRUE, updated_at = NOW()
                                              RETURNING *`,
            [user_id, is_hytmodel_creator || false,
                is_hytmodel_creator ? 0 : (commission_rate || 0.05),
                specialties || [], bio || null, portfolio_url || null, req.user.id]
        );
        res.json({ creator: rows[0] });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/custom-orders/staff/creators/:id - Désactiver un créateur
router.delete("/staff/creators/:id", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        await pool.query(`UPDATE affiliated_creators SET is_active = FALSE WHERE id = $1`, [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// GET /api/custom-orders/staff/orders - Toutes les commandes
router.get("/staff/orders", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT co.*, cr.title as request_title,
                    client.username as client_username,
                    creator.username as creator_username
             FROM custom_orders co
                      JOIN custom_requests cr ON cr.id = co.request_id
                      JOIN users client ON client.id = co.client_id
                      JOIN users creator ON creator.id = co.creator_id
             ORDER BY co.created_at DESC`
        );
        res.json({ orders: rows });
    } catch (error) {
        next(error);
    }
});

// ==================== CONVERSATIONS PRIVÉES ====================

// POST /api/custom-orders/conversations - Démarrer ou récupérer une conversation
router.post("/conversations", requireAuth, async (req, res, next) => {
    try {
        const { request_id, creator_id } = req.body;

        if (!request_id) {
            return res.status(400).json({ error: "request_id requis" });
        }

        // Récupérer la demande
        const { rows: requestRows } = await pool.query(
            `SELECT * FROM custom_requests WHERE id = $1`,
            [request_id]
        );
        if (!requestRows[0]) {
            return res.status(404).json({ error: "Demande non trouvée" });
        }
        const request = requestRows[0];

        // Déterminer qui est le client et qui est le créateur
        let clientId, creatorId;

        if (request.client_id === req.user.id) {
            // L'utilisateur est le client, il doit spécifier le créateur
            if (!creator_id) {
                return res.status(400).json({ error: "creator_id requis (vous êtes le client)" });
            }
            clientId = req.user.id;
            creatorId = creator_id;
        } else {
            // L'utilisateur est un créateur qui veut contacter le client
            clientId = request.client_id;
            creatorId = req.user.id;
        }

        // Empêcher de se contacter soi-même (sauf en dev pour les tests)
        const isDev = process.env.NODE_ENV !== 'production';
        if (!isDev && clientId === creatorId) {
            return res.status(400).json({ error: "Vous ne pouvez pas vous contacter vous-même" });
        }

        // Vérifier que le créateur est éligible (AFFILIATED, HYTSTUDIO, STAFF, ADMIN)
        const { rows: creatorCheck } = await pool.query(
            `SELECT id, role, creator_type FROM users WHERE id = $1`,
            [creatorId]
        );
        if (!creatorCheck[0]) {
            return res.status(404).json({ error: "Créateur non trouvé" });
        }
        const creator = creatorCheck[0];
        const isEligible = ['STAFF', 'ADMIN'].includes(creator.role) ||
            ['AFFILIATED', 'HYTSTUDIO'].includes(creator.creator_type);
        if (!isEligible) {
            return res.status(403).json({ error: "Ce créateur n'est pas éligible aux commandes sur mesure" });
        }

        // Chercher une conversation existante ou en créer une
        let conversation;
        const { rows: existingConv } = await pool.query(
            `SELECT * FROM custom_conversations
             WHERE request_id = $1 AND client_id = $2 AND creator_id = $3`,
            [request_id, clientId, creatorId]
        );

        if (existingConv[0]) {
            conversation = existingConv[0];
        } else {
            const { rows: newConv } = await pool.query(
                `INSERT INTO custom_conversations (request_id, client_id, creator_id)
                 VALUES ($1, $2, $3)
                     RETURNING *`,
                [request_id, clientId, creatorId]
            );
            conversation = newConv[0];
        }

        // Récupérer les infos des participants
        const { rows: participants } = await pool.query(
            `SELECT id, username, avatar_url FROM users WHERE id IN ($1, $2)`,
            [clientId, creatorId]
        );

        res.json({
            conversation,
            client: participants.find(p => p.id === clientId),
            creator: participants.find(p => p.id === creatorId)
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/custom-orders/conversations - Mes conversations
router.get("/conversations", requireAuth, async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT cc.*,
                    cr.title as request_title, cr.status as request_status,
                    client.username as client_username, client.avatar_url as client_avatar,
                    creator.username as creator_username, creator.avatar_url as creator_avatar,
                    (SELECT content FROM custom_conversation_messages
                     WHERE conversation_id = cc.id
                     ORDER BY created_at DESC LIMIT 1) as last_message
             FROM custom_conversations cc
                 JOIN custom_requests cr ON cr.id = cc.request_id
                 JOIN users client ON client.id = cc.client_id
                 JOIN users creator ON creator.id = cc.creator_id
             WHERE cc.client_id = $1 OR cc.creator_id = $1
             ORDER BY cc.last_message_at DESC`,
            [req.user.id]
        );

        // Ajouter le nombre de non-lus pour l'utilisateur courant
        const conversations = rows.map(conv => ({
            ...conv,
            unread_count: conv.client_id === req.user.id
                ? conv.client_unread_count
                : conv.creator_unread_count
        }));

        // Calculer le total de messages non lus
        const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0);

        res.json({ conversations, total_unread: totalUnread });
    } catch (error) {
        next(error);
    }
});

// GET /api/custom-orders/conversations/unread-count - Nombre de messages non lus
router.get("/conversations/unread-count", requireAuth, async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT
                 COALESCE(SUM(CASE WHEN client_id = $1 THEN client_unread_count ELSE 0 END), 0) +
                 COALESCE(SUM(CASE WHEN creator_id = $1 THEN creator_unread_count ELSE 0 END), 0) as total_unread
             FROM custom_conversations
             WHERE client_id = $1 OR creator_id = $1`,
            [req.user.id]
        );
        res.json({ unread_count: parseInt(rows[0]?.total_unread || 0) });
    } catch (error) {
        next(error);
    }
});

// GET /api/custom-orders/conversations/:id - Détails d'une conversation avec messages
router.get("/conversations/:id", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        // Récupérer la conversation
        const { rows: convRows } = await pool.query(
            `SELECT cc.*,
                    cr.title as request_title, cr.description as request_description,
                    cr.status as request_status, cr.budget_min, cr.budget_max,
                    client.username as client_username, client.avatar_url as client_avatar,
                    creator.username as creator_username, creator.avatar_url as creator_avatar
             FROM custom_conversations cc
                      JOIN custom_requests cr ON cr.id = cc.request_id
                      JOIN users client ON client.id = cc.client_id
                      JOIN users creator ON creator.id = cc.creator_id
             WHERE cc.id = $1`,
            [id]
        );

        if (!convRows[0]) {
            return res.status(404).json({ error: "Conversation non trouvée" });
        }

        const conversation = convRows[0];

        // Vérifier que l'utilisateur fait partie de la conversation
        if (conversation.client_id !== req.user.id && conversation.creator_id !== req.user.id) {
            return res.status(403).json({ error: "Accès non autorisé" });
        }

        // Récupérer les messages
        const { rows: messages } = await pool.query(
            `SELECT ccm.*, u.username as sender_username, u.avatar_url as sender_avatar
             FROM custom_conversation_messages ccm
                      JOIN users u ON u.id = ccm.sender_id
             WHERE ccm.conversation_id = $1
             ORDER BY ccm.created_at ASC`,
            [id]
        );

        // Marquer les messages comme lus
        await pool.query(
            `UPDATE custom_conversation_messages
             SET is_read = TRUE
             WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE`,
            [id, req.user.id]
        );

        // Réinitialiser le compteur de non-lus
        if (conversation.client_id === req.user.id) {
            await pool.query(
                `UPDATE custom_conversations SET client_unread_count = 0 WHERE id = $1`,
                [id]
            );
        } else {
            await pool.query(
                `UPDATE custom_conversations SET creator_unread_count = 0 WHERE id = $1`,
                [id]
            );
        }

        // Vérifier si une offre existe déjà
        const { rows: offerRows } = await pool.query(
            `SELECT * FROM custom_offers
             WHERE request_id = $1 AND creator_id = $2`,
            [conversation.request_id, conversation.creator_id]
        );

        res.json({
            conversation,
            messages,
            existing_offer: offerRows[0] || null,
            is_client: conversation.client_id === req.user.id
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/conversations/:id/messages - Envoyer un message
router.post("/conversations/:id/messages", requireAuth, upload.array("attachments", 5), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({ error: "Message requis" });
        }

        // Vérifier la conversation
        const { rows: convRows } = await pool.query(
            `SELECT * FROM custom_conversations WHERE id = $1`,
            [id]
        );

        if (!convRows[0]) {
            return res.status(404).json({ error: "Conversation non trouvée" });
        }

        const conversation = convRows[0];

        // Vérifier que l'utilisateur fait partie de la conversation
        if (conversation.client_id !== req.user.id && conversation.creator_id !== req.user.id) {
            return res.status(403).json({ error: "Accès non autorisé" });
        }

        const attachments = req.files ? req.files.map(f => ({
            filename: f.filename,
            originalname: f.originalname,
            path: `/uploads/custom-orders/${f.filename}`,
            size: f.size
        })) : [];

        // Créer le message
        const { rows: messageRows } = await pool.query(
            `INSERT INTO custom_conversation_messages (conversation_id, sender_id, content, attachments)
             VALUES ($1, $2, $3, $4)
                 RETURNING *`,
            [id, req.user.id, content.trim(), JSON.stringify(attachments)]
        );

        // Mettre à jour la conversation
        const isClient = conversation.client_id === req.user.id;
        await pool.query(
            `UPDATE custom_conversations
             SET last_message_at = NOW(),
                 ${isClient ? 'creator_unread_count = creator_unread_count + 1' : 'client_unread_count = client_unread_count + 1'}
             WHERE id = $1`,
            [id]
        );

        // Récupérer le message avec les infos utilisateur
        const { rows: fullMessage } = await pool.query(
            `SELECT ccm.*, u.username as sender_username, u.avatar_url as sender_avatar
             FROM custom_conversation_messages ccm
                      JOIN users u ON u.id = ccm.sender_id
             WHERE ccm.id = $1`,
            [messageRows[0].id]
        );

        // Créer une notification pour le destinataire
        const recipientId = isClient ? conversation.creator_id : conversation.client_id;
        const senderUsername = fullMessage[0].sender_username;

        // Récupérer le titre de la demande
        const { rows: requestRows } = await pool.query(
            `SELECT title FROM custom_requests WHERE id = $1`,
            [conversation.request_id]
        );
        const requestTitle = requestRows[0]?.title || 'Demande sur mesure';

        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                recipientId,
                'CUSTOM_ORDER_MESSAGE',
                'Nouveau message',
                `${senderUsername} vous a envoyé un message concernant "${requestTitle}"`,
                JSON.stringify({
                    conversation_id: id,
                    sender_id: req.user.id,
                    request_id: conversation.request_id,
                    link: `/custom-orders/conversation/${id}`
                })
            ]
        );

        res.status(201).json({ message: fullMessage[0] });
    } catch (error) {
        next(error);
    }
});

// GET /api/custom-orders/requests/:id/conversations - Conversations d'une demande (pour le client)
router.get("/requests/:id/conversations", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        // Vérifier que l'utilisateur est le client de la demande
        const { rows: requestRows } = await pool.query(
            `SELECT * FROM custom_requests WHERE id = $1`,
            [id]
        );

        if (!requestRows[0]) {
            return res.status(404).json({ error: "Demande non trouvée" });
        }

        if (requestRows[0].client_id !== req.user.id) {
            return res.status(403).json({ error: "Accès non autorisé" });
        }

        // Récupérer toutes les conversations de cette demande
        const { rows } = await pool.query(
            `SELECT cc.*,
                    creator.username as creator_username, creator.avatar_url as creator_avatar,
                    (SELECT content FROM custom_conversation_messages
                     WHERE conversation_id = cc.id
                     ORDER BY created_at DESC LIMIT 1) as last_message,
                    co.id as offer_id, co.price as offer_price, co.status as offer_status,
                    co.estimated_days as offer_days
             FROM custom_conversations cc
                 JOIN users creator ON creator.id = cc.creator_id
                 LEFT JOIN custom_offers co ON co.request_id = cc.request_id AND co.creator_id = cc.creator_id
             WHERE cc.request_id = $1
             ORDER BY cc.last_message_at DESC`,
            [id]
        );

        res.json({ conversations: rows });
    } catch (error) {
        next(error);
    }
});

// ==================== OFFRES DANS CONVERSATION ====================

// POST /api/custom-orders/conversations/:id/offer - Créateur fait une offre dans la conversation
router.post("/conversations/:id/offer", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { price, estimated_days, message } = req.body;

        if (!price || !estimated_days) {
            return res.status(400).json({ error: "Prix et délai requis" });
        }

        // Vérifier la conversation
        const { rows: convRows } = await pool.query(
            `SELECT cc.*, cr.status as request_status, cr.title as request_title
             FROM custom_conversations cc
                      JOIN custom_requests cr ON cr.id = cc.request_id
             WHERE cc.id = $1`,
            [id]
        );

        if (!convRows[0]) {
            return res.status(404).json({ error: "Conversation non trouvée" });
        }

        const conversation = convRows[0];

        // Vérifier que c'est le créateur
        if (conversation.creator_id !== req.user.id) {
            return res.status(403).json({ error: "Seul le créateur peut faire une offre" });
        }

        // Vérifier que la conversation n'est pas clôturée
        if (conversation.status === 'CLOSED') {
            return res.status(400).json({ error: "Cette conversation est clôturée" });
        }

        // Vérifier qu'il n'y a pas déjà une offre en attente
        const { rows: existingOffer } = await pool.query(
            `SELECT id FROM custom_offers
             WHERE request_id = $1 AND creator_id = $2 AND status = 'PENDING'`,
            [conversation.request_id, req.user.id]
        );

        // Déterminer la commission
        const { rows: userCheck } = await pool.query(
            `SELECT role, creator_type FROM users WHERE id = $1`,
            [req.user.id]
        );
        const isHytStudio = ['STAFF', 'ADMIN'].includes(userCheck[0]?.role) ||
            userCheck[0]?.creator_type === 'HYTSTUDIO';
        const commissionRate = isHytStudio ? 0 : 0.05;

        let offer;
        if (existingOffer[0]) {
            // Mettre à jour l'offre existante
            const { rows } = await pool.query(
                `UPDATE custom_offers
                 SET price = $1, estimated_days = $2, message = $3, updated_at = NOW()
                 WHERE id = $4
                     RETURNING *`,
                [price, estimated_days, message || '', existingOffer[0].id]
            );
            offer = rows[0];
        } else {
            // Créer une nouvelle offre
            const { rows } = await pool.query(
                `INSERT INTO custom_offers
                 (request_id, creator_id, price, estimated_days, message, commission_rate, is_hytmodel_creator)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                     RETURNING *`,
                [conversation.request_id, req.user.id, price, estimated_days, message || '', commissionRate, isHytStudio]
            );
            offer = rows[0];
        }

        // Créer un message système dans la conversation
        await pool.query(
            `INSERT INTO custom_conversation_messages
                 (conversation_id, sender_id, content, attachments)
             VALUES ($1, $2, $3, '[]')`,
            [id, req.user.id, `💰 Nouvelle offre : ${(price / 100).toFixed(2)}€ - Délai : ${estimated_days} jour(s)${message ? '\n\n' + message : ''}`]
        );

        // Mettre à jour la conversation
        await pool.query(
            `UPDATE custom_conversations
             SET last_message_at = NOW(), client_unread_count = client_unread_count + 1
             WHERE id = $1`,
            [id]
        );

        // Notification au client
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                conversation.client_id,
                'CUSTOM_ORDER_OFFER',
                'Nouvelle offre reçue',
                `Vous avez reçu une offre de ${(price / 100).toFixed(2)}€ pour "${conversation.request_title}"`,
                JSON.stringify({
                    conversation_id: id,
                    offer_id: offer.id,
                    link: `/custom-orders/conversation/${id}`
                })
            ]
        );

        res.status(201).json({ offer });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/conversations/:id/accept-offer - Client accepte l'offre
router.post("/conversations/:id/accept-offer", requireAuth, async (req, res, next) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const { id } = req.params;

        // Vérifier la conversation
        const { rows: convRows } = await client.query(
            `SELECT cc.*, cr.title as request_title
             FROM custom_conversations cc
                      JOIN custom_requests cr ON cr.id = cc.request_id
             WHERE cc.id = $1`,
            [id]
        );

        if (!convRows[0]) {
            return res.status(404).json({ error: "Conversation non trouvée" });
        }

        const conversation = convRows[0];

        // Vérifier que c'est le client
        if (conversation.client_id !== req.user.id) {
            return res.status(403).json({ error: "Seul le client peut accepter une offre" });
        }

        // Récupérer l'offre en attente
        const { rows: offerRows } = await client.query(
            `SELECT co.*, u.creator_type, u.role
             FROM custom_offers co
                      JOIN users u ON u.id = co.creator_id
             WHERE co.request_id = $1 AND co.creator_id = $2 AND co.status = 'PENDING'`,
            [conversation.request_id, conversation.creator_id]
        );

        if (!offerRows[0]) {
            return res.status(404).json({ error: "Aucune offre en attente" });
        }

        const offer = offerRows[0];

        // Calculer les montants
        const isHytStudio = ['STAFF', 'ADMIN'].includes(offer.role) || offer.creator_type === 'HYTSTUDIO';
        const commissionRate = isHytStudio ? 0 : 0.05;
        const commissionAmount = parseFloat(offer.price) * commissionRate;
        const firstPayment = parseFloat(offer.price) / 2;
        const secondPayment = parseFloat(offer.price) - firstPayment;

        // Accepter cette offre
        await client.query(`UPDATE custom_offers SET status = 'ACCEPTED' WHERE id = $1`, [offer.id]);

        // Refuser toutes les autres offres et clôturer leurs conversations
        const { rows: otherOffers } = await client.query(
            `SELECT co.id, co.creator_id, cc.id as conversation_id
             FROM custom_offers co
                      LEFT JOIN custom_conversations cc ON cc.request_id = co.request_id AND cc.creator_id = co.creator_id
             WHERE co.request_id = $1 AND co.id != $2 AND co.status = 'PENDING'`,
            [conversation.request_id, offer.id]
        );

        for (const other of otherOffers) {
            // Refuser l'offre
            await client.query(
                `UPDATE custom_offers SET status = 'REJECTED' WHERE id = $1`,
                [other.id]
            );

            // Clôturer la conversation si elle existe
            if (other.conversation_id) {
                await client.query(
                    `UPDATE custom_conversations
                     SET status = 'CLOSED', closed_at = NOW(), close_reason = 'Le client a accepté une autre offre'
                     WHERE id = $1`,
                    [other.conversation_id]
                );
            }

            // Notification au créateur refusé
            await client.query(
                `INSERT INTO notifications (user_id, type, title, message, data)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    other.creator_id,
                    'CUSTOM_ORDER_REJECTED',
                    'Offre non retenue',
                    `Le client a choisi un autre créateur pour "${conversation.request_title}"`,
                    JSON.stringify({ request_id: conversation.request_id })
                ]
            );
        }

        // Mettre à jour la demande
        await client.query(
            `UPDATE custom_requests SET status = 'ASSIGNED' WHERE id = $1`,
            [conversation.request_id]
        );

        // Créer la commande
        const { rows: orderRows } = await client.query(
            `INSERT INTO custom_orders
             (request_id, offer_id, client_id, creator_id, total_price, commission_rate,
              commission_amount, first_payment_amount, second_payment_amount, estimated_delivery)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW() + INTERVAL '1 day' * $10)
                 RETURNING *`,
            [conversation.request_id, offer.id, conversation.client_id, conversation.creator_id,
                offer.price, commissionRate, commissionAmount, firstPayment, secondPayment, offer.estimated_days]
        );

        // Message système dans la conversation
        await client.query(
            `INSERT INTO custom_conversation_messages
                 (conversation_id, sender_id, content, attachments)
             VALUES ($1, $2, $3, '[]')`,
            [id, req.user.id, `✅ Offre acceptée ! Montant : ${(parseFloat(offer.price) / 100).toFixed(2)}€\n\nProchaine étape : Paiement de l'acompte (50%)`]
        );

        // Notification au créateur
        await client.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                conversation.creator_id,
                'CUSTOM_ORDER_ACCEPTED',
                'Offre acceptée ! 🎉',
                `Votre offre pour "${conversation.request_title}" a été acceptée !`,
                JSON.stringify({
                    order_id: orderRows[0].id,
                    conversation_id: id,
                    link: `/custom-orders/conversation/${id}`
                })
            ]
        );

        await client.query("COMMIT");
        res.json({ order: orderRows[0], message: "Offre acceptée ! Procédez au paiement de l'acompte." });
    } catch (error) {
        await client.query("ROLLBACK");
        next(error);
    } finally {
        client.release();
    }
});

// POST /api/custom-orders/conversations/:id/reject-offer - Client refuse l'offre
router.post("/conversations/:id/reject-offer", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason, close_conversation } = req.body;

        // Vérifier la conversation
        const { rows: convRows } = await pool.query(
            `SELECT cc.*, cr.title as request_title
             FROM custom_conversations cc
                      JOIN custom_requests cr ON cr.id = cc.request_id
             WHERE cc.id = $1`,
            [id]
        );

        if (!convRows[0]) {
            return res.status(404).json({ error: "Conversation non trouvée" });
        }

        const conversation = convRows[0];

        // Vérifier que c'est le client
        if (conversation.client_id !== req.user.id) {
            return res.status(403).json({ error: "Seul le client peut refuser une offre" });
        }

        // Récupérer l'offre en attente
        const { rows: offerRows } = await pool.query(
            `SELECT * FROM custom_offers
             WHERE request_id = $1 AND creator_id = $2 AND status = 'PENDING'`,
            [conversation.request_id, conversation.creator_id]
        );

        if (offerRows[0]) {
            // Refuser l'offre
            await pool.query(
                `UPDATE custom_offers SET status = 'REJECTED' WHERE id = $1`,
                [offerRows[0].id]
            );
        }

        // Message système dans la conversation
        const rejectMessage = reason
            ? `❌ Offre refusée\n\nRaison : ${reason}`
            : `❌ Offre refusée`;

        await pool.query(
            `INSERT INTO custom_conversation_messages
                 (conversation_id, sender_id, content, attachments)
             VALUES ($1, $2, $3, '[]')`,
            [id, req.user.id, rejectMessage]
        );

        // Si le client veut clôturer définitivement la conversation
        if (close_conversation) {
            await pool.query(
                `UPDATE custom_conversations
                 SET status = 'CLOSED', closed_at = NOW(), close_reason = $2,
                     auto_delete_at = NOW() + INTERVAL '48 hours'
                 WHERE id = $1`,
                [id, reason || 'Clôturé par le client']
            );

            // Message de clôture
            await pool.query(
                `INSERT INTO custom_conversation_messages
                     (conversation_id, sender_id, content, attachments)
                 VALUES ($1, $2, $3, '[]')`,
                [id, req.user.id, `🔒 Conversation clôturée. Elle sera supprimée dans 48 heures.`]
            );
        }

        // Notification au créateur
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                conversation.creator_id,
                'CUSTOM_ORDER_OFFER_REJECTED',
                close_conversation ? 'Conversation clôturée' : 'Offre refusée',
                close_conversation
                    ? `Le client a clôturé la conversation pour "${conversation.request_title}"${reason ? '. Raison : ' + reason : ''}`
                    : `Votre offre pour "${conversation.request_title}" a été refusée${reason ? '. Raison : ' + reason : ''}`,
                JSON.stringify({
                    conversation_id: id,
                    reason: reason,
                    closed: close_conversation,
                    link: `/custom-orders/conversation/${id}`
                })
            ]
        );

        // Mettre à jour les compteurs
        await pool.query(
            `UPDATE custom_conversations
             SET last_message_at = NOW(), creator_unread_count = creator_unread_count + 1
             WHERE id = $1`,
            [id]
        );

        res.json({
            success: true,
            closed: close_conversation,
            message: close_conversation
                ? "Conversation clôturée. Elle sera supprimée dans 48 heures."
                : "Offre refusée. Vous pouvez continuer à négocier."
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/custom-orders/conversations/:id/close - Créateur clôture la conversation
router.post("/conversations/:id/close", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        // Vérifier la conversation
        const { rows: convRows } = await pool.query(
            `SELECT cc.*, cr.title as request_title
             FROM custom_conversations cc
                      JOIN custom_requests cr ON cr.id = cc.request_id
             WHERE cc.id = $1`,
            [id]
        );

        if (!convRows[0]) {
            return res.status(404).json({ error: "Conversation non trouvée" });
        }

        const conversation = convRows[0];

        // Vérifier que c'est le créateur
        if (conversation.creator_id !== req.user.id) {
            return res.status(403).json({ error: "Seul le créateur peut clôturer cette conversation" });
        }

        // Vérifier que la conversation n'est pas déjà clôturée
        if (conversation.status === 'CLOSED') {
            return res.status(400).json({ error: "Cette conversation est déjà clôturée" });
        }

        // Retirer l'offre en attente si elle existe
        await pool.query(
            `UPDATE custom_offers SET status = 'WITHDRAWN'
             WHERE request_id = $1 AND creator_id = $2 AND status = 'PENDING'`,
            [conversation.request_id, req.user.id]
        );

        // Message système dans la conversation
        const closeMessage = reason
            ? `🚫 Le créateur a clôturé la conversation\n\nRaison : ${reason}`
            : `🚫 Le créateur a clôturé la conversation`;

        await pool.query(
            `INSERT INTO custom_conversation_messages
                 (conversation_id, sender_id, content, attachments)
             VALUES ($1, $2, $3, '[]')`,
            [id, req.user.id, closeMessage]
        );

        // Clôturer la conversation
        await pool.query(
            `UPDATE custom_conversations
             SET status = 'CLOSED', closed_at = NOW(), close_reason = $2,
                 auto_delete_at = NOW() + INTERVAL '48 hours'
             WHERE id = $1`,
            [id, reason || 'Clôturé par le créateur']
        );

        // Message de suppression auto
        await pool.query(
            `INSERT INTO custom_conversation_messages
                 (conversation_id, sender_id, content, attachments)
             VALUES ($1, $2, $3, '[]')`,
            [id, req.user.id, `🔒 Conversation clôturée. Elle sera supprimée dans 48 heures.`]
        );

        // Notification au client
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                conversation.client_id,
                'CUSTOM_ORDER_CONVERSATION_CLOSED',
                'Conversation clôturée',
                `Le créateur a clôturé la conversation pour "${conversation.request_title}"${reason ? '. Raison : ' + reason : ''}`,
                JSON.stringify({
                    conversation_id: id,
                    reason: reason,
                    link: `/custom-orders/conversation/${id}`
                })
            ]
        );

        res.json({
            success: true,
            message: "Conversation clôturée. Elle sera supprimée dans 48 heures."
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;