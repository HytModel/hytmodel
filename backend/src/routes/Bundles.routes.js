const router = require("express").Router();
const pool = require("../db/pool");
const { requireAuth } = require("../middlewares/requireAuth");
const { requireRole } = require("../middlewares/requireRole");

// ==================== ROUTES VENDEUR ====================

// GET /api/bundles/my - Mes bundles (vendeur)
router.get("/my", requireAuth, requireRole("CREATOR", "STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { rows } = await pool.query(
            `SELECT b.*,
                    (SELECT COUNT(*) FROM bundle_items WHERE bundle_id = b.id) as item_count,
                    (SELECT COUNT(*) FROM bundle_purchases WHERE bundle_id = b.id) as sales_count
             FROM bundles b
             WHERE b.creator_id = $1
             ORDER BY b.created_at DESC`,
            [req.user.id]
        );

        // Récupérer les produits de chaque bundle
        for (let bundle of rows) {
            const { rows: items } = await pool.query(
                `SELECT m.id, m.title, m.price, m.thumbnail_url
                 FROM bundle_items bi
                          JOIN models m ON m.id = bi.model_id
                 WHERE bi.bundle_id = $1`,
                [bundle.id]
            );
            bundle.items = items;
        }

        res.json({ bundles: rows });
    } catch (error) {
        next(error);
    }
});

// POST /api/bundles - Créer un bundle
router.post("/", requireAuth, requireRole("CREATOR", "STAFF", "ADMIN"), async (req, res, next) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { title, description, discount_type, discount_value, product_ids, starts_at, ends_at } = req.body;

        // Validation
        if (!title || !discount_type || !discount_value || !product_ids || product_ids.length < 2) {
            return res.status(400).json({ error: "Titre, type de remise, valeur et au moins 2 produits requis" });
        }

        if (!['PERCENT', 'FIXED'].includes(discount_type)) {
            return res.status(400).json({ error: "Type de remise invalide (PERCENT ou FIXED)" });
        }

        if (discount_type === 'PERCENT' && (discount_value <= 0 || discount_value >= 100)) {
            return res.status(400).json({ error: "Le pourcentage doit être entre 1 et 99" });
        }

        // Vérifier que tous les produits appartiennent au vendeur
        const { rows: products } = await client.query(
            `SELECT id, price FROM models
             WHERE id = ANY($1) AND creator_id = $2 AND deleted_at IS NULL`,
            [product_ids, req.user.id]
        );

        if (products.length !== product_ids.length) {
            return res.status(400).json({ error: "Un ou plusieurs produits sont invalides ou ne vous appartiennent pas" });
        }

        // Calculer les prix
        const originalPrice = products.reduce((sum, p) => sum + parseFloat(p.price), 0);
        let finalPrice;

        if (discount_type === 'PERCENT') {
            finalPrice = originalPrice * (1 - discount_value / 100);
        } else {
            finalPrice = originalPrice - discount_value;
        }

        // Vérifier le prix minimum de 5€
        if (finalPrice < 5) {
            return res.status(400).json({
                error: `Le prix final (${finalPrice.toFixed(2)}€) est inférieur au minimum de 5€. Réduisez la remise.`,
                calculated_price: finalPrice.toFixed(2)
            });
        }

        // Créer le bundle
        const { rows: bundleRows } = await client.query(
            `INSERT INTO bundles (creator_id, title, description, discount_type, discount_value, original_price, final_price, starts_at, ends_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING *`,
            [req.user.id, title, description || null, discount_type, discount_value, originalPrice, finalPrice, starts_at || null, ends_at || null]
        );

        const bundle = bundleRows[0];

        // Ajouter les produits au bundle
        for (const productId of product_ids) {
            await client.query(
                `INSERT INTO bundle_items (bundle_id, model_id) VALUES ($1, $2)`,
                [bundle.id, productId]
            );
        }

        await client.query('COMMIT');

        // Récupérer le bundle complet avec les items
        bundle.items = products;
        bundle.item_count = products.length;

        res.status(201).json({ bundle });
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
});

// PUT /api/bundles/:id - Modifier un bundle
router.put("/:id", requireAuth, requireRole("CREATOR", "STAFF", "ADMIN"), async (req, res, next) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { id } = req.params;
        const { title, description, discount_type, discount_value, product_ids, is_active, starts_at, ends_at } = req.body;

        // Vérifier que le bundle appartient au vendeur
        const { rows: existingBundle } = await client.query(
            `SELECT * FROM bundles WHERE id = $1 AND creator_id = $2`,
            [id, req.user.id]
        );

        if (!existingBundle[0]) {
            return res.status(404).json({ error: "Bundle non trouvé" });
        }

        // Si on modifie les produits
        if (product_ids && product_ids.length >= 2) {
            // Vérifier que tous les produits appartiennent au vendeur
            const { rows: products } = await client.query(
                `SELECT id, price FROM models
                 WHERE id = ANY($1) AND creator_id = $2 AND deleted_at IS NULL`,
                [product_ids, req.user.id]
            );

            if (products.length !== product_ids.length) {
                return res.status(400).json({ error: "Un ou plusieurs produits sont invalides" });
            }

            // Calculer le nouveau prix
            const originalPrice = products.reduce((sum, p) => sum + parseFloat(p.price), 0);
            const discType = discount_type || existingBundle[0].discount_type;
            const discVal = discount_value || existingBundle[0].discount_value;

            let finalPrice;
            if (discType === 'PERCENT') {
                finalPrice = originalPrice * (1 - discVal / 100);
            } else {
                finalPrice = originalPrice - discVal;
            }

            if (finalPrice < 5) {
                return res.status(400).json({
                    error: `Le prix final (${finalPrice.toFixed(2)}€) est inférieur au minimum de 5€`,
                    calculated_price: finalPrice.toFixed(2)
                });
            }

            // Supprimer les anciens items et ajouter les nouveaux
            await client.query(`DELETE FROM bundle_items WHERE bundle_id = $1`, [id]);

            for (const productId of product_ids) {
                await client.query(
                    `INSERT INTO bundle_items (bundle_id, model_id) VALUES ($1, $2)`,
                    [id, productId]
                );
            }
        }

        // Mettre à jour le bundle
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (title) {
            updates.push(`title = $${paramCount++}`);
            values.push(title);
        }
        if (description !== undefined) {
            updates.push(`description = $${paramCount++}`);
            values.push(description || null);
        }
        if (discount_type) {
            updates.push(`discount_type = $${paramCount++}`);
            values.push(discount_type);
        }
        if (discount_value) {
            updates.push(`discount_value = $${paramCount++}`);
            values.push(discount_value);
        }
        if (is_active !== undefined) {
            updates.push(`is_active = $${paramCount++}`);
            values.push(is_active);
        }
        if (starts_at !== undefined) {
            updates.push(`starts_at = $${paramCount++}`);
            values.push(starts_at || null);
        }
        if (ends_at !== undefined) {
            updates.push(`ends_at = $${paramCount++}`);
            values.push(ends_at || null);
        }

        if (updates.length > 0) {
            updates.push(`updated_at = NOW()`);
            values.push(id);

            await client.query(
                `UPDATE bundles SET ${updates.join(', ')} WHERE id = $${paramCount}`,
                values
            );
        }

        await client.query('COMMIT');

        // Récupérer le bundle mis à jour
        const { rows } = await pool.query(
            `SELECT b.*,
                    (SELECT COUNT(*) FROM bundle_items WHERE bundle_id = b.id) as item_count
             FROM bundles b WHERE b.id = $1`,
            [id]
        );

        const { rows: items } = await pool.query(
            `SELECT m.id, m.title, m.price, m.thumbnail_url
             FROM bundle_items bi
                      JOIN models m ON m.id = bi.model_id
             WHERE bi.bundle_id = $1`,
            [id]
        );

        rows[0].items = items;

        res.json({ bundle: rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
});

// DELETE /api/bundles/:id - Supprimer un bundle
router.delete("/:id", requireAuth, requireRole("CREATOR", "STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { id } = req.params;

        const { rowCount } = await pool.query(
            `DELETE FROM bundles WHERE id = $1 AND creator_id = $2`,
            [id, req.user.id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ error: "Bundle non trouvé" });
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// ==================== ROUTES PUBLIQUES ====================

// GET /api/bundles - Liste des bundles actifs (public)
router.get("/", async (req, res, next) => {
    try {
        const { creator_id } = req.query;

        // Récupérer l'utilisateur connecté s'il existe
        let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (e) {
                // Token invalide, on continue sans userId
            }
        }

        let query = `
            SELECT b.*,
                   u.username as creator_username,
                   u.avatar_url as creator_avatar,
                   (SELECT COUNT(*) FROM bundle_items WHERE bundle_id = b.id) as item_count
            FROM bundles b
            JOIN users u ON u.id = b.creator_id
            WHERE b.is_active = TRUE
            AND (b.starts_at IS NULL OR b.starts_at <= NOW())
            AND (b.ends_at IS NULL OR b.ends_at >= NOW())
        `;

        const values = [];
        if (creator_id) {
            values.push(creator_id);
            query += ` AND b.creator_id = $${values.length}`;
        }

        query += ` ORDER BY b.created_at DESC`;

        const { rows } = await pool.query(query, values);

        // Récupérer les produits de chaque bundle et filtrer si l'user possède tout
        const filteredBundles = [];

        for (let bundle of rows) {
            const { rows: items } = await pool.query(
                `SELECT m.id, m.title, m.price, m.thumbnail_url
                 FROM bundle_items bi
                          JOIN models m ON m.id = bi.model_id
                 WHERE bi.bundle_id = $1`,
                [bundle.id]
            );
            bundle.items = items;

            // Si user connecté, vérifier s'il possède tous les produits
            if (userId && items.length > 0) {
                const { rows: ownedProducts } = await pool.query(
                    `SELECT model_id FROM purchases WHERE user_id = $1 AND model_id = ANY($2)`,
                    [userId, items.map(i => i.id)]
                );

                // Si l'utilisateur possède TOUS les produits, ne pas afficher ce bundle
                if (ownedProducts.length >= items.length) {
                    continue; // Skip ce bundle
                }

                // Ajouter info sur combien de produits l'user possède déjà
                bundle.owned_count = ownedProducts.length;
            }

            // Vérifier aussi si l'utilisateur a déjà acheté ce bundle
            if (userId) {
                const { rows: purchased } = await pool.query(
                    `SELECT id FROM bundle_purchases WHERE bundle_id = $1 AND user_id = $2`,
                    [bundle.id, userId]
                );
                if (purchased.length > 0) {
                    continue; // Skip si déjà acheté
                }
            }

            filteredBundles.push(bundle);
        }

        res.json({ bundles: filteredBundles });
    } catch (error) {
        next(error);
    }
});

// GET /api/bundles/:id - Détails d'un bundle (public)
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(
            `SELECT b.*,
                    u.username as creator_username,
                    u.avatar_url as creator_avatar,
                    u.display_name as creator_display_name
             FROM bundles b
                      JOIN users u ON u.id = b.creator_id
             WHERE b.id = $1`,
            [id]
        );

        if (!rows[0]) {
            return res.status(404).json({ error: "Bundle non trouvé" });
        }

        const bundle = rows[0];

        // Récupérer les produits
        const { rows: items } = await pool.query(
            `SELECT m.id, m.title, m.description, m.price, m.thumbnail_url,
                    g.name as game_name, c.name as category_name
             FROM bundle_items bi
                      JOIN models m ON m.id = bi.model_id
                      LEFT JOIN games g ON g.id = m.game_id
                      LEFT JOIN categories c ON c.id = m.category_id
             WHERE bi.bundle_id = $1`,
            [id]
        );

        bundle.items = items;
        bundle.item_count = items.length;

        res.json({ bundle });
    } catch (error) {
        next(error);
    }
});

// POST /api/bundles/:id/purchase - Créer une session Stripe pour acheter un bundle
router.post("/:id/purchase", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

        // Récupérer le bundle
        const { rows: bundleRows } = await pool.query(
            `SELECT b.*, u.stripe_account_id as creator_stripe_id
             FROM bundles b
                      JOIN users u ON u.id = b.creator_id
             WHERE b.id = $1 AND b.is_active = TRUE
               AND (b.starts_at IS NULL OR b.starts_at <= NOW())
               AND (b.ends_at IS NULL OR b.ends_at >= NOW())`,
            [id]
        );

        if (!bundleRows[0]) {
            return res.status(404).json({ error: "Bundle non disponible" });
        }

        const bundle = bundleRows[0];

        // Vérifier que l'utilisateur n'a pas déjà acheté ce bundle
        const { rows: existingPurchase } = await pool.query(
            `SELECT id FROM bundle_purchases WHERE bundle_id = $1 AND user_id = $2`,
            [id, req.user.id]
        );

        if (existingPurchase[0]) {
            return res.status(400).json({ error: "Vous avez déjà acheté ce bundle" });
        }

        // Vérifier que l'utilisateur n'est pas le créateur
        if (bundle.creator_id === req.user.id) {
            return res.status(400).json({ error: "Vous ne pouvez pas acheter votre propre bundle" });
        }

        // Récupérer les produits du bundle
        const { rows: items } = await pool.query(
            `SELECT m.id, m.title FROM bundle_items bi
                                           JOIN models m ON m.id = bi.model_id
             WHERE bi.bundle_id = $1`,
            [id]
        );

        // Créer la session Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: `Bundle: ${bundle.title}`,
                        description: `${items.length} produits inclus: ${items.map(i => i.title).join(', ').substring(0, 200)}`,
                    },
                    unit_amount: Math.round(parseFloat(bundle.final_price) * 100), // En centimes
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=bundle`,
            cancel_url: `${process.env.FRONTEND_URL}/bundles/${id}`,
            metadata: {
                type: 'bundle',
                bundle_id: id,
                user_id: req.user.id,
                creator_id: bundle.creator_id,
            },
            // Si le créateur a un compte Stripe connecté, partager les revenus
            ...(bundle.creator_stripe_id && {
                payment_intent_data: {
                    transfer_data: {
                        destination: bundle.creator_stripe_id,
                        amount: Math.round(parseFloat(bundle.final_price) * 100 * 0.85), // 85% pour le créateur
                    },
                },
            }),
        });

        res.json({ url: session.url, sessionId: session.id });
    } catch (error) {
        console.error('Stripe error:', error);
        next(error);
    }
});

// GET /api/bundles/check/:id - Vérifier si l'utilisateur a acheté un bundle
router.get("/check/:id", requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;

        const { rows } = await pool.query(
            `SELECT id FROM bundle_purchases WHERE bundle_id = $1 AND user_id = $2`,
            [id, req.user.id]
        );

        res.json({ hasPurchased: rows.length > 0 });
    } catch (error) {
        next(error);
    }
});

module.exports = router;