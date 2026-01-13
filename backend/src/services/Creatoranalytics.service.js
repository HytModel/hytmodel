const pool = require('../db/pool')

class CreatorAnalyticsService {

    // Frais Stripe par transaction (x2 car intermédiaire)
    // Stripe prend 1.5% + 0.25€ à chaque transaction
    // Comme on est intermédiaire : paiement client + transfert vendeur = 2x
    calculateStripeFees(amount) {
        const stripeFeeRate = 0.015 // 1.5%
        const stripeFeeFixed = 0.25 // 0.25€
        // 2x car : 1 fois quand le client paie, 1 fois quand on transfère au vendeur
        return 2 * (amount * stripeFeeRate + stripeFeeFixed)
    }

    // Récupérer toutes les analytics d'un créateur
    async getAll(creatorId, days = 30, filters = {}) {
        const creatorInfo = await this.getCreatorInfo(creatorId)
        const overview = await this.getOverview(creatorId, days, filters)
        const trends = await this.getTrends(creatorId, days, filters)
        const models = await this.getModelsPerformance(creatorId, days, filters)
        const bestHours = await this.getBestHours(creatorId, days, filters)
        const bestDays = await this.getBestDays(creatorId, days, filters)
        const salesBreakdown = await this.getSalesBreakdown(creatorId, days, filters)
        const insights = this.generateInsights(overview, trends, models)

        return {
            overview,
            trends,
            models,
            bestHours,
            bestDays,
            salesBreakdown,
            insights,
            creatorType: creatorInfo.creator_type,
            creatorRate: this.getCreatorRate(creatorInfo.creator_type) * 100
        }
    }

    // Construire les clauses WHERE pour les filtres sur les modèles
    buildModelFilterClauses(filters, modelAlias = 'm', startIndex = 1) {
        const clauses = []
        const params = []
        let paramIndex = startIndex

        if (filters.gameId) {
            clauses.push(`${modelAlias}.game_id = $${paramIndex}`)
            params.push(filters.gameId)
            paramIndex++
        }

        if (filters.categoryId) {
            clauses.push(`${modelAlias}.category_id = $${paramIndex}`)
            params.push(filters.categoryId)
            paramIndex++
        }

        if (filters.tagIds && filters.tagIds.length > 0) {
            clauses.push(`EXISTS (
                SELECT 1 FROM model_tags mt 
                WHERE mt.model_id = ${modelAlias}.id 
                AND mt.tag_id = ANY($${paramIndex})
            )`)
            params.push(filters.tagIds)
            paramIndex++
        }

        if (filters.versionIds && filters.versionIds.length > 0) {
            clauses.push(`EXISTS (
                SELECT 1 FROM model_file_versions mfv
                JOIN model_file_version_compatibilities mfvc ON mfvc.file_version_id = mfv.id
                WHERE mfv.model_id = ${modelAlias}.id 
                AND mfv.is_active = true
                AND mfvc.game_version_id = ANY($${paramIndex})
            )`)
            params.push(filters.versionIds)
            paramIndex++
        }

        return { clauses, params, nextIndex: paramIndex }
    }

    // Récupérer les filtres disponibles pour un créateur (seulement ceux qu'il utilise)
    async getAvailableFilters(creatorId) {
        // Jeux utilisés par le créateur
        const gamesQuery = await pool.query(`
            SELECT DISTINCT g.id, g.name
            FROM games g
                     INNER JOIN models m ON m.game_id = g.id
            WHERE m.creator_id = $1
              AND m.status = 'APPROVED'
              AND m.deleted_at IS NULL
            ORDER BY g.name
        `, [creatorId])

        // Catégories utilisées par le créateur
        const categoriesQuery = await pool.query(`
            SELECT DISTINCT c.id, c.name
            FROM categories c
                     INNER JOIN models m ON m.category_id = c.id
            WHERE m.creator_id = $1
              AND m.status = 'APPROVED'
              AND m.deleted_at IS NULL
            ORDER BY c.name
        `, [creatorId])

        // Tags utilisés par le créateur
        const tagsQuery = await pool.query(`
            SELECT DISTINCT t.id, t.name
            FROM tags t
                     INNER JOIN model_tags mt ON mt.tag_id = t.id
                     INNER JOIN models m ON m.id = mt.model_id
            WHERE m.creator_id = $1
              AND m.status = 'APPROVED'
              AND m.deleted_at IS NULL
            ORDER BY t.name
        `, [creatorId])

        // Versions de jeu utilisées par le créateur (via model_file_versions et compatibilities)
        const versionsQuery = await pool.query(`
            SELECT DISTINCT gv.id, gv.version, gv.game_id, g.name as game_name
            FROM game_versions gv
                     INNER JOIN model_file_version_compatibilities mfvc ON mfvc.game_version_id = gv.id
                     INNER JOIN model_file_versions mfv ON mfv.id = mfvc.file_version_id
                     INNER JOIN models m ON m.id = mfv.model_id
                     INNER JOIN games g ON g.id = gv.game_id
            WHERE m.creator_id = $1
              AND m.status = 'APPROVED'
              AND m.deleted_at IS NULL
              AND mfv.is_active = true
            ORDER BY g.name, gv.version DESC
        `, [creatorId])

        return {
            games: gamesQuery.rows,
            categories: categoriesQuery.rows,
            tags: tagsQuery.rows,
            versions: versionsQuery.rows
        }
    }

    // Répartition des ventes par type (produit, bundle, sur mesure)
    async getSalesBreakdown(creatorId, days, filters = {}) {
        // Note: Les filtres ne s'appliquent pas directement ici car seller_payments n'a pas de model_id
        const { rows } = await pool.query(`
            SELECT
                payment_number,
                gross_amount,
                net_amount
            FROM seller_payments
            WHERE seller_id = $1
              AND created_at >= NOW() - INTERVAL '${days} days'
        `, [creatorId])

        // Catégoriser par type selon le préfixe du payment_number
        // PAY-... : modèle simple ou panier
        // PAY-B-... : bundle
        // PAY-C-... : panier (cart)
        // PAY-CO-... : commande sur mesure
        const breakdown = {
            products: { count: 0, revenue: 0, label: 'products' },
            bundles: { count: 0, revenue: 0, label: 'bundles' },
            customOrders: { count: 0, revenue: 0, label: 'customOrders' }
        }

        rows.forEach(payment => {
            const gross = parseFloat(payment.gross_amount) || 0
            const net = parseFloat(payment.net_amount) || 0
            const stripeFees = this.calculateStripeFees(gross)
            const netRevenue = Math.max(0, net - stripeFees)

            if (payment.payment_number.startsWith('PAY-CO-')) {
                breakdown.customOrders.count++
                breakdown.customOrders.revenue += netRevenue
            } else if (payment.payment_number.startsWith('PAY-B-')) {
                breakdown.bundles.count++
                breakdown.bundles.revenue += netRevenue
            } else {
                // PAY- ou PAY-C- sont des ventes de produits (simple ou panier)
                breakdown.products.count++
                breakdown.products.revenue += netRevenue
            }
        })

        // Calculer les pourcentages
        const totalCount = breakdown.products.count + breakdown.bundles.count + breakdown.customOrders.count
        const totalRevenue = breakdown.products.revenue + breakdown.bundles.revenue + breakdown.customOrders.revenue

        return {
            products: {
                ...breakdown.products,
                revenue: Math.round(breakdown.products.revenue * 100), // En centimes
                countPercent: totalCount > 0 ? (breakdown.products.count / totalCount) * 100 : 0,
                revenuePercent: totalRevenue > 0 ? (breakdown.products.revenue / totalRevenue) * 100 : 0
            },
            bundles: {
                ...breakdown.bundles,
                revenue: Math.round(breakdown.bundles.revenue * 100),
                countPercent: totalCount > 0 ? (breakdown.bundles.count / totalCount) * 100 : 0,
                revenuePercent: totalRevenue > 0 ? (breakdown.bundles.revenue / totalRevenue) * 100 : 0
            },
            customOrders: {
                ...breakdown.customOrders,
                revenue: Math.round(breakdown.customOrders.revenue * 100),
                countPercent: totalCount > 0 ? (breakdown.customOrders.count / totalCount) * 100 : 0,
                revenuePercent: totalRevenue > 0 ? (breakdown.customOrders.revenue / totalRevenue) * 100 : 0
            },
            totalCount,
            totalRevenue: Math.round(totalRevenue * 100)
        }
    }

    // Récupérer les infos du créateur
    async getCreatorInfo(creatorId) {
        const result = await pool.query(
            'SELECT creator_type FROM users WHERE id = $1',
            [creatorId]
        )
        return result.rows[0] || { creator_type: null }
    }

    // Calcul du taux vendeur selon le type (pour info seulement)
    getCreatorRate(creatorType) {
        switch (creatorType) {
            case 'AFFILIATED': return 0.90
            case 'HYTSTUDIO': return 1.00
            default: return 0.85
        }
    }

    // Vue d'ensemble - utilise seller_payments pour les vrais revenus moins frais Stripe
    async getOverview(creatorId, days, filters = {}) {
        const hasFilters = filters.gameId || filters.categoryId || (filters.tagIds && filters.tagIds.length > 0) || (filters.versionIds && filters.versionIds.length > 0)

        // Récupérer chaque paiement pour calculer les frais Stripe individuellement
        const paymentsQuery = await pool.query(`
            SELECT
                gross_amount,
                net_amount,
                commission_amount
            FROM seller_payments
            WHERE seller_id = $1
              AND created_at >= NOW() - INTERVAL '${days} days'
        `, [creatorId])

        let totalNetRevenue = 0
        let totalGrossRevenue = 0
        let totalCommission = 0
        let totalStripeFees = 0

        paymentsQuery.rows.forEach(payment => {
            const gross = parseFloat(payment.gross_amount) || 0
            const net = parseFloat(payment.net_amount) || 0
            const commission = parseFloat(payment.commission_amount) || 0
            const stripeFees = this.calculateStripeFees(gross)

            totalGrossRevenue += gross
            totalCommission += commission
            totalStripeFees += stripeFees
            // Revenu réel = net (après commission) - frais Stripe
            totalNetRevenue += Math.max(0, net - stripeFees)
        })

        // Nombre de ventes depuis seller_payments (inclut tout: modèles, bundles, custom orders)
        const salesQuery = await pool.query(`
            SELECT
                COUNT(*) as total_sales
            FROM seller_payments
            WHERE seller_id = $1
              AND created_at >= NOW() - INTERVAL '${days} days'
        `, [creatorId])

        // Acheteurs uniques depuis purchases + bundle_purchases
        const buyersQuery = await pool.query(`
            SELECT COUNT(DISTINCT buyer_id) as unique_buyers FROM (
                                                                      SELECT p.user_id as buyer_id
                                                                      FROM purchases p
                                                                               JOIN models m ON p.model_id = m.id
                                                                      WHERE m.creator_id = $1
                                                                        AND p.created_at >= NOW() - INTERVAL '${days} days'
                                                                      UNION
                                                                      SELECT bp.user_id as buyer_id
                                                                      FROM bundle_purchases bp
                                                                          JOIN bundles b ON b.id = bp.bundle_id
                                                                      WHERE b.creator_id = $1
                                                                        AND bp.purchased_at >= NOW() - INTERVAL '${days} days'
                                                                      UNION
                                                                      SELECT co.client_id as buyer_id
                                                                      FROM custom_orders co
                                                                      WHERE co.creator_id = $1
                                                                        AND co.created_at >= NOW() - INTERVAL '${days} days'
                                                                  ) all_buyers
        `, [creatorId])

        // Stats des modèles (avec filtres si présents)
        const { clauses: filterClauses, params: filterParams } = this.buildModelFilterClauses(filters, 'm', 2)
        const filterWhere = filterClauses.length > 0 ? `AND ${filterClauses.join(' AND ')}` : ''

        const modelsQuery = await pool.query(`
            SELECT
                COUNT(*) as active_products,
                COALESCE(SUM(view_count), 0) as total_views,
                COALESCE(AVG(NULLIF(rating_avg, 0)), 0) as average_rating
            FROM models m
            WHERE m.creator_id = $1
              AND m.status = 'APPROVED'
              AND m.deleted_at IS NULL
                ${filterWhere}
        `, [creatorId, ...filterParams])

        // Téléchargements depuis model_file_versions (avec filtre par version du jeu si applicable)
        let downloadsQuery
        if (filters.versionIds && filters.versionIds.length > 0) {
            // Filtrer par versions du jeu spécifiques
            // Reconstruire les clauses pour cette requête avec le bon offset ($1=creatorId, $2=versionIds, $3+=filters)
            const { clauses: dlFilterClauses, params: dlFilterParams } = this.buildModelFilterClauses(
                { gameId: filters.gameId, categoryId: filters.categoryId, tagIds: filters.tagIds },
                'm',
                3
            )
            const dlFilterWhere = dlFilterClauses.length > 0 ? `AND ${dlFilterClauses.join(' AND ')}` : ''

            downloadsQuery = await pool.query(`
                SELECT COALESCE(SUM(mfv.download_count), 0) as total_downloads
                FROM model_file_versions mfv
                         JOIN models m ON m.id = mfv.model_id
                         JOIN model_file_version_compatibilities mfvc ON mfvc.file_version_id = mfv.id
                WHERE m.creator_id = $1
                  AND m.status = 'APPROVED'
                  AND m.deleted_at IS NULL
                  AND mfv.is_active = true
                  AND mfvc.game_version_id = ANY($2)
                    ${dlFilterWhere}
            `, [creatorId, filters.versionIds, ...dlFilterParams])
        } else {
            // Tous les téléchargements (pas de filtre versionIds)
            downloadsQuery = await pool.query(`
                SELECT COALESCE(SUM(mfv.download_count), 0) as total_downloads
                FROM model_file_versions mfv
                         JOIN models m ON m.id = mfv.model_id
                WHERE m.creator_id = $1
                  AND m.status = 'APPROVED'
                  AND m.deleted_at IS NULL
                  AND mfv.is_active = true
                    ${filterWhere}
            `, [creatorId, ...filterParams])
        }

        const sales = salesQuery.rows[0]
        const buyers = buyersQuery.rows[0]
        const models = modelsQuery.rows[0]
        const downloads = downloadsQuery.rows[0]

        const totalViews = parseInt(models.total_views) || 0
        const totalSales = parseInt(sales.total_sales) || 0
        const totalDownloads = parseInt(downloads.total_downloads) || 0
        const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0

        return {
            // Revenus NETS réels (après commission ET frais Stripe)
            totalRevenue: Math.round(totalNetRevenue * 100), // En centimes
            // Revenus bruts
            grossRevenue: Math.round(totalGrossRevenue * 100),
            // Commission plateforme
            totalCommission: Math.round(totalCommission * 100),
            // Frais Stripe totaux
            totalStripeFees: Math.round(totalStripeFees * 100),
            totalSales: totalSales,
            totalViews: totalViews,
            totalDownloads: totalDownloads,
            averageRating: parseFloat(models.average_rating) || 0,
            uniqueBuyers: parseInt(buyers.unique_buyers) || 0,
            activeProducts: parseInt(models.active_products) || 0,
            conversionRate: conversionRate
        }
    }

    // Tendances - utilise seller_payments avec frais Stripe
    async getTrends(creatorId, days, filters = {}) {
        // Note: Les filtres ne s'appliquent pas ici car seller_payments n'a pas de model_id
        // Période actuelle
        const currentQuery = await pool.query(`
            SELECT gross_amount, net_amount
            FROM seller_payments
            WHERE seller_id = $1
              AND created_at >= NOW() - INTERVAL '${days} days'
        `, [creatorId])

        let currentRevenue = 0
        currentQuery.rows.forEach(payment => {
            const gross = parseFloat(payment.gross_amount) || 0
            const net = parseFloat(payment.net_amount) || 0
            const stripeFees = this.calculateStripeFees(gross)
            currentRevenue += Math.max(0, net - stripeFees)
        })

        const currentSalesQuery = await pool.query(`
            SELECT COUNT(*) as sales
            FROM seller_payments
            WHERE seller_id = $1
              AND created_at >= NOW() - INTERVAL '${days} days'
        `, [creatorId])

        // Période précédente
        const previousQuery = await pool.query(`
            SELECT gross_amount, net_amount
            FROM seller_payments
            WHERE seller_id = $1
              AND created_at >= NOW() - INTERVAL '${days * 2} days'
              AND created_at < NOW() - INTERVAL '${days} days'
        `, [creatorId])

        let previousRevenue = 0
        previousQuery.rows.forEach(payment => {
            const gross = parseFloat(payment.gross_amount) || 0
            const net = parseFloat(payment.net_amount) || 0
            const stripeFees = this.calculateStripeFees(gross)
            previousRevenue += Math.max(0, net - stripeFees)
        })

        const previousSalesQuery = await pool.query(`
            SELECT COUNT(*) as sales
            FROM seller_payments
            WHERE seller_id = $1
              AND created_at >= NOW() - INTERVAL '${days * 2} days'
              AND created_at < NOW() - INTERVAL '${days} days'
        `, [creatorId])

        const currentSales = parseInt(currentSalesQuery.rows[0].sales) || 0
        const previousSales = parseInt(previousSalesQuery.rows[0].sales) || 0

        const revenueGrowth = previousRevenue > 0
            ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
            : (currentRevenue > 0 ? 100 : 0)

        const salesGrowth = previousSales > 0
            ? ((currentSales - previousSales) / previousSales) * 100
            : (currentSales > 0 ? 100 : 0)

        return {
            revenueGrowth,
            salesGrowth
        }
    }

    // Performance par modèle
    async getModelsPerformance(creatorId, days, filters = {}) {
        // Construire les clauses de filtre
        const { clauses: filterClauses, params: filterParams } = this.buildModelFilterClauses(filters, 'm', 2)
        const filterWhere = filterClauses.length > 0 ? `AND ${filterClauses.join(' AND ')}` : ''

        // Sous-requête pour les téléchargements (depuis model_file_versions)
        let downloadsSubquery
        if (filters.versionIds && filters.versionIds.length > 0) {
            // Filtrer par versions du jeu spécifiques
            downloadsSubquery = `
                LEFT JOIN (
                    SELECT 
                        mfv.model_id,
                        SUM(mfv.download_count) as total_downloads
                    FROM model_file_versions mfv
                    JOIN model_file_version_compatibilities mfvc ON mfvc.file_version_id = mfv.id
                    WHERE mfv.is_active = true
                    AND mfvc.game_version_id = ANY(ARRAY[${filters.versionIds.map(id => `'${id}'`).join(',')}]::uuid[])
                    GROUP BY mfv.model_id
                ) downloads ON m.id = downloads.model_id
            `
        } else {
            // Tous les téléchargements
            downloadsSubquery = `
                LEFT JOIN (
                    SELECT 
                        mfv.model_id,
                        SUM(mfv.download_count) as total_downloads
                    FROM model_file_versions mfv
                    WHERE mfv.is_active = true
                    GROUP BY mfv.model_id
                ) downloads ON m.id = downloads.model_id
            `
        }

        const query = await pool.query(`
            SELECT
                m.id,
                m.title,
                m.thumbnail_url as image_url,
                m.price,
                m.view_count as views,
                COALESCE(downloads.total_downloads, 0) as downloads,
                m.rating_avg,
                m.rating_count,
                m.game_id,
                m.category_id,
                COALESCE(sales.count, 0) as sales,
                COALESCE(sales.gross_revenue, 0) as gross_revenue
            FROM models m
                ${downloadsSubquery}
            LEFT JOIN (
                SELECT 
                    p.model_id,
                    COUNT(*) as count,
                    SUM(p.price_paid) as gross_revenue
                FROM purchases p
                WHERE p.created_at >= NOW() - INTERVAL '${days} days'
                GROUP BY p.model_id
            ) sales ON m.id = sales.model_id
            WHERE m.creator_id = $1
              AND m.status = 'APPROVED'
              AND m.deleted_at IS NULL
                ${filterWhere}
            ORDER BY COALESCE(sales.gross_revenue, 0) DESC, m.view_count DESC
                LIMIT 20
        `, [creatorId, ...filterParams])

        // Récupérer les infos du créateur pour le taux
        const creatorInfo = await this.getCreatorInfo(creatorId)
        const creatorRate = this.getCreatorRate(creatorInfo.creator_type)

        return query.rows.map(row => {
            const views = parseInt(row.views) || 0
            const sales = parseInt(row.sales) || 0
            const grossRevenue = parseFloat(row.gross_revenue) || 0

            // Calculer le revenu net par produit
            // Note: on utilise le taux actuel car on n'a pas l'historique par produit
            // Pour un calcul exact, il faudrait stocker le model_id dans seller_payments
            const netBeforeStripe = grossRevenue * creatorRate
            const stripeFees = sales > 0 ? sales * this.calculateStripeFees(grossRevenue / sales) : 0
            const netRevenue = Math.max(0, netBeforeStripe - stripeFees)

            return {
                id: row.id,
                title: row.title,
                image_url: row.image_url,
                price: parseFloat(row.price) || 0,
                views: views,
                downloads: parseInt(row.downloads) || 0,
                sales: sales,
                revenue: Math.round(netRevenue * 100), // En centimes
                rating: parseFloat(row.rating_avg) || 0,
                ratingCount: parseInt(row.rating_count) || 0,
                conversionRate: views > 0 ? (sales / views) * 100 : 0
            }
        })
    }

    // Meilleures heures de vente
    async getBestHours(creatorId, days, filters = {}) {
        // Note: Les filtres ne s'appliquent pas ici car seller_payments n'a pas de model_id
        const query = await pool.query(`
            SELECT
                EXTRACT(HOUR FROM created_at) as hour,
                COUNT(*) as sales
            FROM seller_payments
            WHERE seller_id = $1
              AND created_at >= NOW() - INTERVAL '${days} days'
            GROUP BY EXTRACT(HOUR FROM created_at)
            ORDER BY sales DESC
                LIMIT 5
        `, [creatorId])

        return query.rows.map(row => ({
            hour: parseInt(row.hour),
            sales: parseInt(row.sales)
        }))
    }

    // Meilleurs jours de vente
    async getBestDays(creatorId, days, filters = {}) {
        // Note: Les filtres ne s'appliquent pas ici car seller_payments n'a pas de model_id
        const query = await pool.query(`
            SELECT
                EXTRACT(DOW FROM created_at) as day,
                COUNT(*) as sales
            FROM seller_payments
            WHERE seller_id = $1
              AND created_at >= NOW() - INTERVAL '${days} days'
            GROUP BY EXTRACT(DOW FROM created_at)
            ORDER BY day
        `, [creatorId])

        return query.rows.map(row => ({
            day: parseInt(row.day),
            sales: parseInt(row.sales)
        }))
    }

    // Génération de recommandations
    generateInsights(overview, trends, models) {
        const insights = []

        // Croissance des revenus
        if (trends.revenueGrowth > 20) {
            insights.push({
                type: 'success',
                key: 'revenueGrowth',
                value: trends.revenueGrowth.toFixed(0)
            })
        } else if (trends.revenueGrowth < -10) {
            insights.push({
                type: 'warning',
                key: 'revenueDecline'
            })
        }

        // Taux de conversion
        if (overview.conversionRate < 1 && overview.totalViews > 100) {
            insights.push({
                type: 'info',
                key: 'lowConversion'
            })
        }

        // Notes
        if (overview.averageRating >= 4.5) {
            insights.push({
                type: 'success',
                key: 'excellentRating',
                value: overview.averageRating.toFixed(1)
            })
        }

        // Produits sans ventes
        const noSalesProducts = models.filter(m => m.sales === 0 && m.views > 10)
        if (noSalesProducts.length > 0) {
            insights.push({
                type: 'info',
                key: 'productsToOptimize',
                value: noSalesProducts.length
            })
        }

        return insights
    }
}

module.exports = new CreatorAnalyticsService()