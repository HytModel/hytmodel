const pool = require("../db/pool");

class AdminAnalyticsService {
    // Taux de commission - ce que la PLATEFORME garde
    // HYTSTUDIO/STAFF/ADMIN = 100% (tout revient à la plateforme)
    // AFFILIATED = 10% commission
    // NON_AFFILIATED = 20% commission
    getCommissionRate(creatorType, role) {
        if (creatorType === 'HYTSTUDIO' || role === 'ADMIN' || role === 'STAFF') {
            return 1.0; // 100% pour la plateforme
        }
        switch (creatorType) {
            case 'AFFILIATED': return 0.10;
            default: return 0.20;
        }
    }

    // Frais Stripe (1.5% + 0.25€)
    calculateStripeFees(amount) {
        if (amount <= 0) return 0;
        return (amount * 0.015) + 0.25;
    }

    // Calculer les revenus avec frais Stripe
    calculateRevenues(rows) {
        let totalGrossRevenue = 0;
        let totalStripeFees = 0;
        let totalPlatformRevenue = 0;
        let totalNetToCreators = 0;

        if (!rows || rows.length === 0) {
            console.log('calculateRevenues: No rows to process');
            return { totalGrossRevenue, totalStripeFees, totalPlatformRevenue, totalNetToCreators };
        }

        rows.forEach((row, index) => {
            const pricePaid = parseFloat(row.price_paid) || 0;
            if (pricePaid <= 0) return;

            // Déterminer si c'est un vendeur HytStudio
            const creatorType = (row.creator_type || 'NON_AFFILIATED').toUpperCase();
            const role = (row.role || 'CREATOR').toUpperCase();

            const isHytStudio = creatorType === 'HYTSTUDIO' ||
                role === 'ADMIN' ||
                role === 'STAFF';

            // Frais Stripe sur l'encaissement (1.5% + 0.25€)
            const stripeIn = (pricePaid * 0.015) + 0.25;
            const afterStripeIn = pricePaid - stripeIn;

            if (isHytStudio) {
                // HytStudio/Staff/Admin: tout revient à la plateforme (après frais Stripe)
                totalPlatformRevenue += afterStripeIn;
                totalStripeFees += stripeIn;
            } else {
                // Commission selon le type
                let commissionRate = 0.20; // Par défaut 20%
                if (creatorType === 'AFFILIATED') {
                    commissionRate = 0.10; // 10% pour affiliés
                }

                const commission = pricePaid * commissionRate;
                const creatorAmount = afterStripeIn - commission;

                // Frais Stripe sur le payout
                const stripeOut = (creatorAmount * 0.015) + 0.25;
                const netToCreator = Math.max(0, creatorAmount - stripeOut);

                totalPlatformRevenue += commission;
                totalStripeFees += stripeIn + stripeOut;
                totalNetToCreators += netToCreator;
            }

            totalGrossRevenue += pricePaid;
        });

        console.log('calculateRevenues result:', {
            rows: rows.length,
            totalGrossRevenue,
            totalPlatformRevenue,
            totalStripeFees,
            totalNetToCreators
        });

        return {
            totalGrossRevenue,
            totalStripeFees,
            totalPlatformRevenue,
            totalNetToCreators
        };
    }

    // ============ FILTRES DISPONIBLES ============
    async getAvailableFilters() {
        const [gamesRes, categoriesRes, tagsRes, versionsRes] = await Promise.all([
            pool.query(`
                SELECT DISTINCT g.id, g.name
                FROM games g
                         JOIN models m ON m.game_id = g.id
                WHERE m.deleted_at IS NULL
                ORDER BY g.name
            `),
            pool.query(`
                SELECT DISTINCT c.id, c.name, c.game_id
                FROM categories c
                         JOIN models m ON m.category_id = c.id
                WHERE m.deleted_at IS NULL
                ORDER BY c.name
            `),
            pool.query(`
                SELECT DISTINCT t.id, t.name
                FROM tags t
                         JOIN model_tags mt ON mt.tag_id = t.id
                         JOIN models m ON m.id = mt.model_id
                WHERE m.deleted_at IS NULL
                ORDER BY t.name
            `),
            pool.query(`
                SELECT DISTINCT gv.id, gv.version, gv.game_id
                FROM game_versions gv
                         JOIN model_file_version_compatibilities mfvc ON mfvc.game_version_id = gv.id
                         JOIN model_file_versions mfv ON mfv.id = mfvc.file_version_id
                         JOIN models m ON m.id = mfv.model_id
                WHERE m.deleted_at IS NULL AND mfv.is_active = true
                ORDER BY gv.version DESC
            `)
        ]);

        return {
            games: gamesRes.rows,
            categories: categoriesRes.rows,
            tags: tagsRes.rows,
            versions: versionsRes.rows
        };
    }

    // ============ ANALYTICS GLOBALES AVEC FILTRES ============
    async getAnalytics(filters = {}) {
        const { days = 30, gameId, categoryId, tagIds, versionIds } = filters;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Construire les clauses de filtre
        const { whereClause, params } = this.buildFilterClauses(filters, startDate);

        // Overview avec revenus détaillés
        const overview = await this.getOverview(whereClause, params, startDate);

        // Tendances (comparaison avec période précédente)
        const trends = await this.getTrends(filters, days);

        // Ventes par jeu
        const salesByGame = await this.getSalesByGame(whereClause, params);

        // Ventes par catégorie
        const salesByCategory = await this.getSalesByCategory(whereClause, params);

        // Ventes par tag
        const salesByTag = await this.getSalesByTag(whereClause, params);

        // Ventes par version
        const salesByVersion = await this.getSalesByVersion(whereClause, params);

        // Distribution des prix
        const priceDistribution = await this.getPriceDistribution(whereClause, params);

        // Évolution des ventes
        const salesOverTime = await this.getSalesOverTime(whereClause, params, days);

        // Top tags
        const topTags = await this.getTopTags(whereClause, params);

        // Produits best-sellers
        const mostViewedProducts = await this.getBestProducts(whereClause, params);

        // Funnel de conversion
        const conversionFunnel = await this.getConversionFunnel(whereClause, params);

        // Téléchargements totaux
        const totalDownloads = await this.getTotalDownloads();

        return {
            overview,
            trends,
            salesByGame,
            salesByCategory,
            salesByTag,
            salesByVersion,
            priceDistribution,
            salesOverTime,
            topTags,
            mostViewedProducts,
            conversionFunnel,
            totalDownloads
        };
    }

    // Construire les clauses WHERE
    buildFilterClauses(filters, startDate) {
        const { gameId, categoryId, tagIds, versionIds } = filters;
        let whereClause = 'WHERE p.created_at >= $1 AND p.price_paid > 0 AND m.deleted_at IS NULL';
        const params = [startDate];

        if (gameId) {
            params.push(gameId);
            whereClause += ` AND m.game_id = $${params.length}`;
        }

        if (categoryId) {
            params.push(categoryId);
            whereClause += ` AND m.category_id = $${params.length}`;
        }

        if (tagIds && tagIds.length > 0) {
            const tagArray = Array.isArray(tagIds) ? tagIds : tagIds.split(',');
            params.push(tagArray);
            whereClause += ` AND EXISTS (
                SELECT 1 FROM model_tags mt 
                WHERE mt.model_id = m.id AND mt.tag_id = ANY($${params.length})
            )`;
        }

        if (versionIds && versionIds.length > 0) {
            const versionArray = Array.isArray(versionIds) ? versionIds : versionIds.split(',');
            params.push(versionArray);
            whereClause += ` AND EXISTS (
                SELECT 1 FROM model_file_versions mfv
                JOIN model_file_version_compatibilities mfvc ON mfvc.file_version_id = mfv.id
                WHERE mfv.model_id = m.id AND mfv.is_active = true
                AND mfvc.game_version_id = ANY($${params.length})
            )`;
        }

        return { whereClause, params };
    }

    async getOverview(whereClause, params, startDate) {
        // Récupérer toutes les ventes avec le type de créateur
        const { rows } = await pool.query(`
            SELECT
                p.price_paid,
                COALESCE(u.creator_type, 'NON_AFFILIATED') as creator_type,
                COALESCE(u.role, 'CREATOR') as role
            FROM purchases p
                     JOIN models m ON m.id = p.model_id
                     JOIN users u ON u.id = m.creator_id
                ${whereClause}
        `, params);

        console.log('Analytics Overview - Sales data:', {
            rowCount: rows.length,
            sampleRow: rows[0],
            allTypes: [...new Set(rows.map(r => r.creator_type))],
            allRoles: [...new Set(rows.map(r => r.role))]
        });

        // Calculer les revenus détaillés
        const revenues = this.calculateRevenues(rows);

        console.log('Analytics Overview - Calculated revenues:', revenues);

        // Stats complémentaires
        const { rows: statsRows } = await pool.query(`
            SELECT
                COUNT(DISTINCT p.id) as total_sales,
                COALESCE(AVG(p.price_paid), 0) as avg_order_value,
                COUNT(DISTINCT p.user_id) as unique_buyers
            FROM purchases p
                     JOIN models m ON m.id = p.model_id
                ${whereClause}
        `, params);

        const stats = statsRows[0];
        const totalSales = parseInt(stats.total_sales || 0);

        // Vues totales (sans filtre de date car la colonne n'existe pas toujours)
        let totalViews = 0;
        try {
            const { rows: viewRows } = await pool.query(`
                SELECT COUNT(*) as total_views
                FROM model_views mv
                JOIN models m ON m.id = mv.model_id
                WHERE m.deleted_at IS NULL
            `);
            totalViews = parseInt(viewRows[0]?.total_views || 0);
        } catch (e) {
            // Table model_views n'existe pas ou erreur
            console.log('model_views query failed:', e.message);
            totalViews = totalSales * 25; // Estimation
        }

        // Téléchargements totaux
        const { rows: downloadRows } = await pool.query(`
            SELECT COALESCE(SUM(download_count), 0) as total_downloads
            FROM model_file_versions
            WHERE is_active = true
        `);

        // Retourner les valeurs en EUROS (pas en centimes)
        return {
            totalRevenue: parseFloat(revenues.totalGrossRevenue.toFixed(2)),
            platformRevenue: parseFloat(revenues.totalPlatformRevenue.toFixed(2)),
            totalStripeFees: parseFloat(revenues.totalStripeFees.toFixed(2)),
            sellerEarnings: parseFloat(revenues.totalNetToCreators.toFixed(2)),
            // Stats
            totalSales,
            avgOrderValue: parseFloat(parseFloat(stats.avg_order_value || 0).toFixed(2)),
            uniqueVisitors: parseInt(stats.unique_buyers || 0),
            totalViews: totalViews || totalSales * 25,
            conversionRate: totalViews > 0 ? ((totalSales / totalViews) * 100).toFixed(2) : 0,
            totalDownloads: parseInt(downloadRows[0]?.total_downloads || 0)
        };
    }

    async getTotalDownloads() {
        const { rows } = await pool.query(`
            SELECT COALESCE(SUM(download_count), 0) as total_downloads
            FROM model_file_versions
            WHERE is_active = true
        `);
        return parseInt(rows[0]?.total_downloads || 0);
    }

    async getTrends(filters, days) {
        const currentStart = new Date();
        currentStart.setDate(currentStart.getDate() - parseInt(days));

        const previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - parseInt(days));

        const { whereClause: currentWhere, params: currentParams } = this.buildFilterClauses(filters, currentStart);
        const { whereClause: previousWhere, params: previousParams } = this.buildFilterClauses(filters, previousStart);

        const previousEndWhere = previousWhere + ` AND p.created_at < $${previousParams.length + 1}`;
        previousParams.push(currentStart);

        const [currentRes, previousRes] = await Promise.all([
            pool.query(`
                SELECT COUNT(*) as sales, COALESCE(SUM(p.price_paid), 0) as revenue
                FROM purchases p
                         JOIN models m ON m.id = p.model_id
                    ${currentWhere}
            `, currentParams),
            pool.query(`
                SELECT COUNT(*) as sales, COALESCE(SUM(p.price_paid), 0) as revenue
                FROM purchases p
                         JOIN models m ON m.id = p.model_id
                    ${previousEndWhere}
            `, previousParams)
        ]);

        const current = currentRes.rows[0];
        const previous = previousRes.rows[0];

        const calcTrend = (curr, prev) => {
            if (!prev || prev === 0) return curr > 0 ? 100 : 0;
            return Math.round(((curr - prev) / prev) * 100);
        };

        return {
            revenue: calcTrend(parseFloat(current.revenue), parseFloat(previous.revenue)),
            sales: calcTrend(parseInt(current.sales), parseInt(previous.sales)),
            views: 0
        };
    }

    async getSalesByGame(whereClause, params) {
        const { rows } = await pool.query(`
            SELECT g.name, COUNT(p.id) as count, COALESCE(SUM(p.price_paid), 0) as revenue
            FROM purchases p
                JOIN models m ON m.id = p.model_id
                LEFT JOIN games g ON g.id = m.game_id
                ${whereClause}
            GROUP BY g.id, g.name
            ORDER BY count DESC
                LIMIT 10
        `, params);

        const total = rows.reduce((a, r) => a + parseInt(r.count || 0), 0) || 1;
        return rows.map(r => ({
            name: r.name || 'Autre',
            value: Math.round((parseInt(r.count || 0) / total) * 100),
            count: parseInt(r.count || 0),
            revenue: parseFloat(r.revenue || 0)
        }));
    }

    async getSalesByCategory(whereClause, params) {
        const { rows } = await pool.query(`
            SELECT c.name, COUNT(p.id) as count, COALESCE(SUM(p.price_paid), 0) as revenue
            FROM purchases p
                JOIN models m ON m.id = p.model_id
                LEFT JOIN categories c ON c.id = m.category_id
                ${whereClause}
            GROUP BY c.id, c.name
            ORDER BY count DESC
                LIMIT 10
        `, params);

        const total = rows.reduce((a, r) => a + parseInt(r.count || 0), 0) || 1;
        return rows.map(r => ({
            name: r.name || 'Autre',
            value: Math.round((parseInt(r.count || 0) / total) * 100),
            count: parseInt(r.count || 0),
            revenue: parseFloat(r.revenue || 0)
        }));
    }

    async getSalesByTag(whereClause, params) {
        const { rows } = await pool.query(`
            SELECT t.name, COUNT(DISTINCT p.id) as count, COALESCE(SUM(p.price_paid), 0) as revenue
            FROM purchases p
                JOIN models m ON m.id = p.model_id
                JOIN model_tags mt ON mt.model_id = m.id
                JOIN tags t ON t.id = mt.tag_id
                ${whereClause}
            GROUP BY t.id, t.name
            ORDER BY count DESC
                LIMIT 10
        `, params);

        const total = rows.reduce((a, r) => a + parseInt(r.count || 0), 0) || 1;
        return rows.map(r => ({
            name: r.name,
            value: Math.round((parseInt(r.count || 0) / total) * 100),
            count: parseInt(r.count || 0),
            revenue: parseFloat(r.revenue || 0)
        }));
    }

    async getSalesByVersion(whereClause, params) {
        const { rows } = await pool.query(`
            SELECT gv.version as name, COUNT(DISTINCT p.id) as count, COALESCE(SUM(p.price_paid), 0) as revenue
            FROM purchases p
                JOIN models m ON m.id = p.model_id
                JOIN model_file_versions mfv ON mfv.model_id = m.id AND mfv.is_active = true
                JOIN model_file_version_compatibilities mfvc ON mfvc.file_version_id = mfv.id
                JOIN game_versions gv ON gv.id = mfvc.game_version_id
                ${whereClause}
            GROUP BY gv.id, gv.version
            ORDER BY count DESC
                LIMIT 10
        `, params);

        const total = rows.reduce((a, r) => a + parseInt(r.count || 0), 0) || 1;
        return rows.map(r => ({
            name: r.name,
            value: Math.round((parseInt(r.count || 0) / total) * 100),
            count: parseInt(r.count || 0),
            revenue: parseFloat(r.revenue || 0)
        }));
    }

    async getPriceDistribution(whereClause, params) {
        const { rows } = await pool.query(`
            SELECT
                CASE
                    WHEN p.price_paid < 5 THEN '0-5€'
                    WHEN p.price_paid < 10 THEN '5-10€'
                    WHEN p.price_paid < 20 THEN '10-20€'
                    WHEN p.price_paid < 50 THEN '20-50€'
                    WHEN p.price_paid < 100 THEN '50-100€'
                    ELSE '100€+'
                    END as range,
                COUNT(*) as count,
                COALESCE(SUM(p.price_paid), 0) as revenue
            FROM purchases p
                JOIN models m ON m.id = p.model_id
                ${whereClause}
            GROUP BY range
            ORDER BY MIN(p.price_paid)
        `, params);

        return rows.map(r => ({
            range: r.range,
            count: parseInt(r.count || 0),
            revenue: parseFloat(r.revenue || 0)
        }));
    }

    async getSalesOverTime(whereClause, params, days) {
        const groupBy = days > 90 ? 'week' : 'day';
        const { rows } = await pool.query(`
            SELECT
                to_char(date_trunc('${groupBy}', p.created_at), 'YYYY-MM-DD') as date,
                COUNT(*) as ventes,
                COALESCE(SUM(p.price_paid), 0) as revenus
            FROM purchases p
                JOIN models m ON m.id = p.model_id
                ${whereClause}
            GROUP BY date_trunc('${groupBy}', p.created_at)
            ORDER BY date_trunc('${groupBy}', p.created_at)
        `, params);

        return rows.map(r => ({
            date: r.date,
            ventes: parseInt(r.ventes || 0),
            revenus: parseFloat(r.revenus || 0)
        }));
    }

    async getTopTags(whereClause, params) {
        const { rows } = await pool.query(`
            SELECT t.name, COUNT(DISTINCT p.id) as sales
            FROM tags t
                     JOIN model_tags mt ON mt.tag_id = t.id
                     JOIN models m ON m.id = mt.model_id
                     JOIN purchases p ON p.model_id = m.id
                ${whereClause.replace('WHERE', 'WHERE 1=1 AND')}
            GROUP BY t.id, t.name
            ORDER BY sales DESC
                LIMIT 10
        `, params);

        return rows.map(r => ({
            name: r.name,
            sales: parseInt(r.sales || 0),
            views: parseInt(r.sales || 0) * 15
        }));
    }

    async getBestProducts(whereClause, params) {
        const { rows } = await pool.query(`
            SELECT
                m.id,
                m.title as name,
                COUNT(p.id) as sales,
                COALESCE(SUM(p.price_paid), 0) as revenue
            FROM models m
                     JOIN purchases p ON p.model_id = m.id
                ${whereClause}
            GROUP BY m.id, m.title
            ORDER BY sales DESC
                LIMIT 10
        `, params);

        return rows.map(r => ({
            id: r.id,
            name: r.name,
            sales: parseInt(r.sales || 0),
            revenue: parseFloat(r.revenue || 0),
            views: parseInt(r.sales || 0) * 20,
            conversion: 5.0
        }));
    }

    async getConversionFunnel(whereClause, params) {
        const { rows } = await pool.query(`
            SELECT COUNT(DISTINCT p.id) as sales
            FROM purchases p
                     JOIN models m ON m.id = p.model_id
                ${whereClause}
        `, params);

        const totalSales = parseInt(rows[0]?.sales || 0);

        return [
            { step: 'Visiteurs', value: totalSales * 50 || 100 },
            { step: 'Vues produit', value: totalSales * 30 || 60 },
            { step: 'Ajout panier', value: totalSales * 5 || 10 },
            { step: 'Checkout', value: Math.round(totalSales * 1.5) || 3 },
            { step: 'Achat', value: totalSales || 1 }
        ];
    }

    // ============ ANALYTICS VENDEURS ============
    async getSellersAnalytics(filters = {}) {
        const { days = 30, gameId, categoryId, tagIds, versionIds } = filters;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const { whereClause, params } = this.buildFilterClauses(filters, startDate);

        // Top vendeurs globaux
        const topSellers = await this.getTopSellers(whereClause, params);

        // Vendeurs par jeu
        const sellersByGame = await this.getSellersByGame(whereClause, params);

        // Comparaison vendeurs actifs vs total
        const sellersComparison = await this.getSellersComparison(whereClause, params);

        // Performance par type de créateur
        const performanceByType = await this.getPerformanceByCreatorType(whereClause, params);

        // Nouveaux vendeurs vs vendeurs existants
        const newVsExisting = await this.getNewVsExistingSellers(whereClause, params, startDate);

        return {
            topSellers,
            sellersByGame,
            sellersComparison,
            performanceByType,
            newVsExisting
        };
    }

    async getTopSellers(whereClause, params) {
        const { rows } = await pool.query(`
            SELECT
                u.id,
                u.username,
                u.avatar_url,
                u.creator_type,
                u.role,
                COUNT(DISTINCT p.id) as sales_count,
                COALESCE(SUM(p.price_paid), 0) as gross_revenue,
                COUNT(DISTINCT m.id) as products_sold,
                COUNT(DISTINCT m.game_id) as games_count
            FROM users u
                     JOIN models m ON m.creator_id = u.id
                     JOIN purchases p ON p.model_id = m.id
                ${whereClause}
            GROUP BY u.id, u.username, u.avatar_url, u.creator_type, u.role
            ORDER BY gross_revenue DESC
                LIMIT 20
        `, params);

        return rows.map(r => {
            const grossRevenue = parseFloat(r.gross_revenue || 0);
            const isHytStudio = r.creator_type === 'HYTSTUDIO' || r.role === 'ADMIN' || r.role === 'STAFF';
            const commissionRate = this.getCommissionRate(r.creator_type, r.role);

            const salesCount = parseInt(r.sales_count || 0);
            let platformCommission = 0;
            let netRevenue = 0;

            if (isHytStudio) {
                // HytStudio: tout va à la plateforme (moins frais Stripe)
                const stripeIn = salesCount * 0.25 + grossRevenue * 0.015;
                platformCommission = grossRevenue - stripeIn;
                netRevenue = 0;
            } else {
                platformCommission = grossRevenue * commissionRate;
                const afterCommission = grossRevenue - platformCommission;
                const stripeTotal = salesCount * 0.50 + grossRevenue * 0.015 + afterCommission * 0.015;
                netRevenue = Math.max(0, afterCommission - stripeTotal);
            }

            return {
                id: r.id,
                username: r.username,
                avatarUrl: r.avatar_url,
                creatorType: r.creator_type,
                role: r.role,
                isHytStudio,
                salesCount,
                grossRevenue: parseFloat(grossRevenue.toFixed(2)),
                netRevenue: parseFloat(netRevenue.toFixed(2)),
                platformCommission: parseFloat(platformCommission.toFixed(2)),
                commissionRate: commissionRate * 100,
                productsSold: parseInt(r.products_sold || 0),
                gamesCount: parseInt(r.games_count || 0)
            };
        });
    }

    async getSellersByGame(whereClause, params) {
        const { rows } = await pool.query(`
            SELECT
                g.id as game_id,
                g.name as game_name,
                COUNT(DISTINCT u.id) as sellers_count,
                COUNT(DISTINCT p.id) as total_sales,
                COALESCE(SUM(p.price_paid), 0) as total_revenue,
                (
                    SELECT u2.username
                    FROM users u2
                             JOIN models m2 ON m2.creator_id = u2.id
                             JOIN purchases p2 ON p2.model_id = m2.id
                    WHERE m2.game_id = g.id AND p2.price_paid > 0
                    GROUP BY u2.id, u2.username
                    ORDER BY SUM(p2.price_paid) DESC
                    LIMIT 1
                ) as top_seller
            FROM games g
                JOIN models m ON m.game_id = g.id
                JOIN purchases p ON p.model_id = m.id
                JOIN users u ON u.id = m.creator_id
                ${whereClause}
            GROUP BY g.id, g.name
            ORDER BY total_revenue DESC
        `, params);

        return rows.map(r => ({
            gameId: r.game_id,
            gameName: r.game_name,
            sellersCount: parseInt(r.sellers_count || 0),
            totalSales: parseInt(r.total_sales || 0),
            totalRevenue: parseFloat(r.total_revenue || 0),
            topSeller: r.top_seller,
            avgRevenuePerSeller: parseFloat((parseFloat(r.total_revenue || 0) / parseInt(r.sellers_count || 1)).toFixed(2))
        }));
    }

    async getSellersComparison(whereClause, params) {
        const { rows: totalCreators } = await pool.query(`
            SELECT COUNT(*) as count FROM users WHERE role = 'CREATOR'
        `);

        const { rows: activeSellers } = await pool.query(`
            SELECT COUNT(DISTINCT m.creator_id) as count
            FROM purchases p
                JOIN models m ON m.id = p.model_id
                ${whereClause}
        `, params);

        const { rows: inactiveSellers } = await pool.query(`
            SELECT COUNT(DISTINCT m.creator_id) as count
            FROM models m
            WHERE m.deleted_at IS NULL
              AND m.status = 'APPROVED'
              AND m.creator_id NOT IN (
                SELECT DISTINCT m2.creator_id
                FROM purchases p
                JOIN models m2 ON m2.id = p.model_id
                ${whereClause}
                )
        `, params);

        const total = parseInt(totalCreators[0]?.count || 0);
        const active = parseInt(activeSellers[0]?.count || 0);
        const withProducts = parseInt(inactiveSellers[0]?.count || 0);
        const noProducts = total - active - withProducts;

        return {
            totalCreators: total,
            activeSellers: active,
            inactiveSellers: withProducts,
            noProductsSellers: Math.max(0, noProducts),
            activeRate: total > 0 ? ((active / total) * 100).toFixed(1) : 0
        };
    }

    async getPerformanceByCreatorType(whereClause, params) {
        const { rows } = await pool.query(`
            SELECT
                u.creator_type,
                u.role,
                COUNT(DISTINCT u.id) as sellers_count,
                COUNT(DISTINCT p.id) as sales_count,
                COALESCE(SUM(p.price_paid), 0) as total_revenue,
                COALESCE(AVG(p.price_paid), 0) as avg_sale
            FROM users u
                     JOIN models m ON m.creator_id = u.id
                     JOIN purchases p ON p.model_id = m.id
                ${whereClause}
            GROUP BY u.creator_type, u.role
            ORDER BY total_revenue DESC
        `, params);

        // Regrouper HYTSTUDIO + ADMIN + STAFF ensemble
        const grouped = {};

        rows.forEach(r => {
            const isHytStudio = r.creator_type === 'HYTSTUDIO' || r.role === 'ADMIN' || r.role === 'STAFF';
            const key = isHytStudio ? 'HYTSTUDIO' : (r.creator_type || 'NON_AFFILIATED');

            if (!grouped[key]) {
                grouped[key] = {
                    type: key,
                    sellersCount: 0,
                    salesCount: 0,
                    totalRevenue: 0,
                    avgSaleSum: 0,
                    avgSaleCount: 0
                };
            }

            grouped[key].sellersCount += parseInt(r.sellers_count || 0);
            grouped[key].salesCount += parseInt(r.sales_count || 0);
            grouped[key].totalRevenue += parseFloat(r.total_revenue || 0);
            grouped[key].avgSaleSum += parseFloat(r.avg_sale || 0) * parseInt(r.sales_count || 0);
            grouped[key].avgSaleCount += parseInt(r.sales_count || 0);
        });

        return Object.values(grouped).map(g => {
            const commissionRate = this.getCommissionRate(g.type, g.type === 'HYTSTUDIO' ? 'ADMIN' : 'USER');
            const totalRevenue = g.totalRevenue;

            // Calcul des revenus plateforme
            let platformRevenue = 0;
            if (g.type === 'HYTSTUDIO') {
                // HytStudio: tout après frais Stripe
                const stripeIn = g.salesCount * 0.25 + totalRevenue * 0.015;
                platformRevenue = totalRevenue - stripeIn;
            } else {
                platformRevenue = totalRevenue * commissionRate;
            }

            return {
                type: g.type,
                typeName: g.type === 'HYTSTUDIO' ? 'HytStudio / Staff' :
                    g.type === 'AFFILIATED' ? 'Affilié' : 'Standard',
                sellersCount: g.sellersCount,
                salesCount: g.salesCount,
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                avgSale: g.avgSaleCount > 0 ? parseFloat((g.avgSaleSum / g.avgSaleCount).toFixed(2)) : 0,
                commissionRate: commissionRate * 100,
                platformRevenue: parseFloat(platformRevenue.toFixed(2))
            };
        });
    }

    async getNewVsExistingSellers(whereClause, params, startDate) {
        const { rows: newSellers } = await pool.query(`
            SELECT
                COUNT(DISTINCT u.id) as count,
                COALESCE(SUM(p.price_paid), 0) as revenue
            FROM users u
                JOIN models m ON m.creator_id = u.id
                JOIN purchases p ON p.model_id = m.id
                ${whereClause}
                AND NOT EXISTS (
                SELECT 1 FROM purchases p2
                JOIN models m2 ON m2.id = p2.model_id
                WHERE m2.creator_id = u.id AND p2.created_at < $${params.length + 1}
                )
        `, [...params, startDate]);

        const { rows: existingSellers } = await pool.query(`
            SELECT
                COUNT(DISTINCT u.id) as count,
                COALESCE(SUM(p.price_paid), 0) as revenue
            FROM users u
                JOIN models m ON m.creator_id = u.id
                JOIN purchases p ON p.model_id = m.id
                ${whereClause}
                AND EXISTS (
                SELECT 1 FROM purchases p2
                JOIN models m2 ON m2.id = p2.model_id
                WHERE m2.creator_id = u.id AND p2.created_at < $${params.length + 1}
                )
        `, [...params, startDate]);

        return {
            newSellers: {
                count: parseInt(newSellers[0]?.count || 0),
                revenue: parseFloat(parseFloat(newSellers[0]?.revenue || 0).toFixed(2))
            },
            existingSellers: {
                count: parseInt(existingSellers[0]?.count || 0),
                revenue: parseFloat(parseFloat(existingSellers[0]?.revenue || 0).toFixed(2))
            }
        };
    }

    // ============ DÉTAILS PAR JEU ============
    async getGameDetails(gameId, filters = {}) {
        const { days = 30, categoryId, tagIds, versionIds } = filters;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const baseFilters = { ...filters, gameId };
        const { whereClause, params } = this.buildFilterClauses(baseFilters, startDate);

        // Top catégories pour ce jeu
        const { rows: topCategories } = await pool.query(`
            SELECT c.name, COUNT(p.id) as sales, COALESCE(SUM(p.price_paid), 0) as revenue
            FROM purchases p
                     JOIN models m ON m.id = p.model_id
                     LEFT JOIN categories c ON c.id = m.category_id
                ${whereClause}
            GROUP BY c.id, c.name
            ORDER BY sales DESC
                LIMIT 10
        `, params);

        const maxCatSales = parseInt(topCategories[0]?.sales) || 1;

        // Top tags pour ce jeu
        const { rows: topTags } = await pool.query(`
            SELECT t.name, COUNT(DISTINCT m.id) as products, COUNT(DISTINCT p.id) as sales
            FROM tags t
                     JOIN model_tags mt ON mt.tag_id = t.id
                     JOIN models m ON m.id = mt.model_id
                     JOIN purchases p ON p.model_id = m.id
                ${whereClause.replace('WHERE', 'WHERE 1=1 AND')}
            GROUP BY t.id, t.name
            ORDER BY sales DESC
                LIMIT 10
        `, params);

        // Top versions pour ce jeu
        const { rows: topVersions } = await pool.query(`
            SELECT gv.version as name, COUNT(DISTINCT m.id) as products, COUNT(DISTINCT p.id) as sales
            FROM game_versions gv
                     JOIN model_file_version_compatibilities mfvc ON mfvc.game_version_id = gv.id
                     JOIN model_file_versions mfv ON mfv.id = mfvc.file_version_id AND mfv.is_active = true
                     JOIN models m ON m.id = mfv.model_id
                     JOIN purchases p ON p.model_id = m.id
                ${whereClause.replace('WHERE', 'WHERE 1=1 AND')}
            GROUP BY gv.id, gv.version
            ORDER BY sales DESC
                LIMIT 10
        `, params);

        const totalVersionSales = topVersions.reduce((a, r) => a + parseInt(r.sales || 0), 0) || 1;

        // Best sellers pour ce jeu
        const { rows: bestSellers } = await pool.query(`
            SELECT m.title as name, c.name as category, COUNT(p.id) as sales, COALESCE(SUM(p.price_paid), 0) as revenue
            FROM models m
                     JOIN purchases p ON p.model_id = m.id
                     LEFT JOIN categories c ON c.id = m.category_id
                ${whereClause}
            GROUP BY m.id, m.title, c.name
            ORDER BY sales DESC
                LIMIT 10
        `, params);

        // Top vendeurs pour ce jeu
        const { rows: topSellers } = await pool.query(`
            SELECT
                u.id, u.username, u.avatar_url, u.creator_type, u.role,
                COUNT(DISTINCT p.id) as sales,
                COALESCE(SUM(p.price_paid), 0) as revenue,
                COUNT(DISTINCT m.id) as products
            FROM users u
                     JOIN models m ON m.creator_id = u.id
                     JOIN purchases p ON p.model_id = m.id
                ${whereClause}
            GROUP BY u.id, u.username, u.avatar_url, u.creator_type, u.role
            ORDER BY revenue DESC
                LIMIT 10
        `, params);

        return {
            topCategories: topCategories.map(r => ({
                name: r.name || 'Sans catégorie',
                sales: parseInt(r.sales || 0),
                revenue: parseFloat(r.revenue || 0),
                percentage: Math.round((parseInt(r.sales || 0) / maxCatSales) * 100)
            })),
            topTags: topTags.map(r => ({
                name: r.name,
                products: parseInt(r.products || 0),
                sales: parseInt(r.sales || 0)
            })),
            topVersions: topVersions.map(r => ({
                name: r.name,
                products: parseInt(r.products || 0),
                sales: parseInt(r.sales || 0),
                percentage: Math.round((parseInt(r.sales || 0) / totalVersionSales) * 100)
            })),
            bestSellers: bestSellers.map(r => ({
                name: r.name,
                category: r.category || 'Sans catégorie',
                sales: parseInt(r.sales || 0),
                revenue: parseFloat(r.revenue || 0)
            })),
            topSellers: topSellers.map(r => {
                const isHytStudio = r.creator_type === 'HYTSTUDIO' || r.role === 'ADMIN' || r.role === 'STAFF';
                return {
                    id: r.id,
                    username: r.username,
                    avatarUrl: r.avatar_url,
                    creatorType: r.creator_type,
                    isHytStudio,
                    sales: parseInt(r.sales || 0),
                    revenue: parseFloat(r.revenue || 0),
                    products: parseInt(r.products || 0)
                };
            })
        };
    }
}

module.exports = new AdminAnalyticsService();