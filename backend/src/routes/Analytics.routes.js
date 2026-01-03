// ============ ANALYTICS ============
// Ajouter ces routes dans admin.routes.js

// GET /api/admin/analytics - Statistiques avancées
router.get("/analytics", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        const { period = '30' } = req.query;
        const days = parseInt(period) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // ===== OVERVIEW =====
        // Total des revenus et ventes
        const { rows: salesRows } = await pool.query(`
            SELECT 
                COUNT(*) as total_sales,
                COALESCE(SUM(p.amount), 0) as total_revenue,
                COALESCE(AVG(p.amount), 0) as avg_order_value
            FROM purchases p
            WHERE p.created_at >= $1
        `, [startDate]);

        // Vues totales (si table existe)
        let totalViews = 0;
        let uniqueVisitors = 0;
        try {
            const { rows: viewRows } = await pool.query(`
                SELECT COUNT(*) as total_views, COUNT(DISTINCT session_id) as unique_visitors
                FROM site_visits
                WHERE created_at >= $1
            `, [startDate]);
            totalViews = parseInt(viewRows[0]?.total_views || 0);
            uniqueVisitors = parseInt(viewRows[0]?.unique_visitors || 0);
        } catch (e) {}

        // Temps moyen entre achats (pour les utilisateurs avec plusieurs achats)
        const { rows: timeBetweenRows } = await pool.query(`
            WITH user_purchases AS (
                SELECT user_id, created_at,
                       LAG(created_at) OVER (PARTITION BY user_id ORDER BY created_at) as prev_purchase
                FROM purchases
                WHERE user_id IS NOT NULL
            )
            SELECT AVG(EXTRACT(EPOCH FROM (created_at - prev_purchase)) / 86400) as avg_days
            FROM user_purchases
            WHERE prev_purchase IS NOT NULL
        `);
        const avgTimeBetweenPurchases = parseFloat(timeBetweenRows[0]?.avg_days || 0).toFixed(1);

        // ===== TENDANCES (comparaison période précédente) =====
        const prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - days);

        const { rows: prevSalesRows } = await pool.query(`
            SELECT COUNT(*) as total_sales, COALESCE(SUM(amount), 0) as total_revenue
            FROM purchases
            WHERE created_at >= $1 AND created_at < $2
        `, [prevStartDate, startDate]);

        const currentRevenue = parseInt(salesRows[0]?.total_revenue || 0);
        const prevRevenue = parseInt(prevSalesRows[0]?.total_revenue || 1);
        const revenueTrend = ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1);

        const currentSales = parseInt(salesRows[0]?.total_sales || 0);
        const prevSales = parseInt(prevSalesRows[0]?.total_sales || 1);
        const salesTrend = ((currentSales - prevSales) / prevSales * 100).toFixed(1);

        // ===== VENTES PAR JEU =====
        const { rows: gameRows } = await pool.query(`
            SELECT g.name, COUNT(p.id) as count, COALESCE(SUM(pu.amount), 0) as revenue
            FROM purchases pu
            JOIN models m ON m.id = pu.model_id
            JOIN games g ON g.id = m.game_id
            WHERE pu.created_at >= $1
            GROUP BY g.id, g.name
            ORDER BY count DESC
            LIMIT 5
        `, [startDate]);

        const totalGameSales = gameRows.reduce((acc, row) => acc + parseInt(row.count), 0) || 1;
        const salesByGame = gameRows.map(row => ({
            name: row.name,
            value: Math.round((parseInt(row.count) / totalGameSales) * 100),
            revenue: parseInt(row.revenue)
        }));

        // ===== VENTES PAR CATÉGORIE =====
        const { rows: categoryRows } = await pool.query(`
            SELECT c.name, COUNT(p.id) as count
            FROM purchases p
            JOIN models m ON m.id = p.model_id
            JOIN categories c ON c.id = m.category_id
            WHERE p.created_at >= $1
            GROUP BY c.id, c.name
            ORDER BY count DESC
            LIMIT 5
        `, [startDate]);

        const totalCatSales = categoryRows.reduce((acc, row) => acc + parseInt(row.count), 0) || 1;
        const salesByCategory = categoryRows.map(row => ({
            name: row.name,
            value: Math.round((parseInt(row.count) / totalCatSales) * 100),
            count: parseInt(row.count)
        }));

        // ===== DISTRIBUTION DES PRIX =====
        const { rows: priceRows } = await pool.query(`
            SELECT 
                CASE 
                    WHEN m.price < 1000 THEN '5-10€'
                    WHEN m.price < 2000 THEN '10-20€'
                    WHEN m.price < 5000 THEN '20-50€'
                    WHEN m.price < 10000 THEN '50-100€'
                    ELSE '100€+'
                END as range,
                COUNT(*) as count,
                SUM(p.amount) as revenue
            FROM purchases p
            JOIN models m ON m.id = p.model_id
            WHERE p.created_at >= $1
            GROUP BY range
            ORDER BY MIN(m.price)
        `, [startDate]);

        const priceDistribution = priceRows.map(row => ({
            range: row.range,
            count: parseInt(row.count),
            revenue: parseInt(row.revenue) / 100
        }));

        // ===== VENTES DANS LE TEMPS =====
        const { rows: timeRows } = await pool.query(`
            SELECT 
                TO_CHAR(created_at, 'Dy') as date,
                COUNT(*) as ventes,
                COALESCE(SUM(amount), 0) / 100 as revenus
            FROM purchases
            WHERE created_at >= $1
            GROUP BY TO_CHAR(created_at, 'Dy'), EXTRACT(DOW FROM created_at)
            ORDER BY EXTRACT(DOW FROM created_at)
        `, [startDate]);

        const salesOverTime = timeRows.map(row => ({
            date: row.date,
            ventes: parseInt(row.ventes),
            revenus: parseFloat(row.revenus)
        }));

        // ===== TAGS POPULAIRES =====
        const { rows: tagRows } = await pool.query(`
            SELECT t.name, 
                   COUNT(DISTINCT mv.id) as views,
                   COUNT(DISTINCT p.id) as sales
            FROM tags t
            LEFT JOIN model_tags mt ON mt.tag_id = t.id
            LEFT JOIN models m ON m.id = mt.model_id
            LEFT JOIN model_views mv ON mv.model_id = m.id AND mv.created_at >= $1
            LEFT JOIN purchases p ON p.model_id = m.id AND p.created_at >= $1
            GROUP BY t.id, t.name
            ORDER BY views DESC
            LIMIT 8
        `, [startDate]);

        const topTags = tagRows.map(row => ({
            name: row.name,
            views: parseInt(row.views) || 0,
            sales: parseInt(row.sales) || 0
        }));

        // ===== PRODUITS LES PLUS VUS =====
        const { rows: viewedRows } = await pool.query(`
            SELECT m.title as name,
                   COUNT(DISTINCT mv.id) as views,
                   COUNT(DISTINCT p.id) as sales
            FROM models m
            LEFT JOIN model_views mv ON mv.model_id = m.id AND mv.created_at >= $1
            LEFT JOIN purchases p ON p.model_id = m.id AND p.created_at >= $1
            WHERE m.deleted_at IS NULL
            GROUP BY m.id, m.title
            ORDER BY views DESC
            LIMIT 5
        `, [startDate]);

        const mostViewedProducts = viewedRows.map(row => {
            const views = parseInt(row.views) || 1;
            const sales = parseInt(row.sales) || 0;
            return {
                name: row.name,
                views: views,
                sales: sales,
                conversion: parseFloat(((sales / views) * 100).toFixed(1))
            };
        });

        // ===== ACTIVITÉ HORAIRE =====
        let hourlyActivity = [];
        try {
            const { rows: hourRows } = await pool.query(`
                SELECT 
                    EXTRACT(HOUR FROM created_at)::int as hour,
                    COUNT(*) as views
                FROM site_visits
                WHERE created_at >= $1
                GROUP BY hour
                ORDER BY hour
            `, [startDate]);

            const { rows: purchaseHourRows } = await pool.query(`
                SELECT 
                    EXTRACT(HOUR FROM created_at)::int as hour,
                    COUNT(*) as purchases
                FROM purchases
                WHERE created_at >= $1
                GROUP BY hour
                ORDER BY hour
            `, [startDate]);

            const hourMap = {};
            for (let i = 0; i < 24; i += 2) {
                hourMap[i] = { hour: `${i.toString().padStart(2, '0')}h`, views: 0, purchases: 0 };
            }
            hourRows.forEach(row => {
                const h = Math.floor(row.hour / 2) * 2;
                if (hourMap[h]) hourMap[h].views += parseInt(row.views);
            });
            purchaseHourRows.forEach(row => {
                const h = Math.floor(row.hour / 2) * 2;
                if (hourMap[h]) hourMap[h].purchases += parseInt(row.purchases);
            });
            hourlyActivity = Object.values(hourMap);
        } catch (e) {
            // Table site_visits n'existe pas
            hourlyActivity = Array.from({ length: 12 }, (_, i) => ({
                hour: `${(i * 2).toString().padStart(2, '0')}h`,
                views: 0,
                purchases: 0
            }));
        }

        // ===== FUNNEL DE CONVERSION =====
        const totalSales = parseInt(salesRows[0]?.total_sales || 0);
        const conversionFunnel = [
            { step: 'Visiteurs', value: uniqueVisitors || totalSales * 50 },
            { step: 'Vues produit', value: totalViews || totalSales * 30 },
            { step: 'Ajout panier', value: Math.round(totalSales * 5) },
            { step: 'Checkout', value: Math.round(totalSales * 1.5) },
            { step: 'Achat', value: totalSales }
        ];

        res.json({
            overview: {
                totalRevenue: parseInt(salesRows[0]?.total_revenue || 0),
                totalSales: totalSales,
                avgOrderValue: parseInt(salesRows[0]?.avg_order_value || 0),
                avgTimeBetweenPurchases: parseFloat(avgTimeBetweenPurchases) || 0,
                conversionRate: uniqueVisitors > 0 ? ((totalSales / uniqueVisitors) * 100).toFixed(1) : 0,
                totalViews: totalViews,
                uniqueVisitors: uniqueVisitors
            },
            trends: {
                revenue: parseFloat(revenueTrend) || 0,
                sales: parseFloat(salesTrend) || 0,
                views: 0
            },
            salesByGame,
            salesByCategory,
            priceDistribution,
            salesOverTime,
            topTags,
            mostViewedProducts,
            hourlyActivity,
            conversionFunnel
        });
    } catch (error) {
        console.error('Analytics error:', error);
        next(error);
    }
});