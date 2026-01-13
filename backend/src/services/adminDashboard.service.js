const pool = require("../db/pool");

class AdminDashboardService {
    // Taux de commission - ce que la PLATEFORME garde
    // HYTSTUDIO/STAFF/ADMIN = 100% (tout revient à la plateforme)
    // AFFILIATED = 10% commission
    // NON_AFFILIATED = 20% commission
    getCommissionRate(creatorType) {
        switch (creatorType) {
            case 'HYTSTUDIO': return 1.0;   // 100% pour la plateforme
            case 'AFFILIATED': return 0.10;  // 10% commission
            default: return 0.20;            // 20% commission
        }
    }

    // Calculer les frais Stripe (1.5% + 0.25€)
    calculateStripeFees(amount) {
        if (amount <= 0) return 0;
        return (amount * 0.015) + 0.25;
    }

    // KPIs globaux avec frais Stripe
    async getGlobalStats() {
        // Récupérer toutes les ventes avec le type de créateur
        const { rows } = await pool.query(
            `SELECT
                 p.price_paid,
                 u.creator_type,
                 u.role
             FROM purchases p
                      JOIN models m ON m.id = p.model_id
                      JOIN users u ON u.id = m.creator_id
             WHERE p.price_paid > 0`
        );

        let totalGrossRevenue = 0;      // Revenus bruts (prix payés par clients)
        let totalStripeFees = 0;        // Frais Stripe totaux
        let totalPlatformRevenue = 0;   // Ce que la plateforme garde (commissions)
        let totalNetToCreators = 0;     // Net versé aux créateurs

        rows.forEach(row => {
            const pricePaid = parseFloat(row.price_paid);

            // HYTSTUDIO ou ADMIN/STAFF = tout revient à la plateforme
            const isHytStudio = row.creator_type === 'HYTSTUDIO' ||
                row.role === 'ADMIN' ||
                row.role === 'STAFF';

            const commissionRate = isHytStudio ? 1.0 : this.getCommissionRate(row.creator_type);

            // Frais Stripe sur l'encaissement (paiement client)
            const stripeFeesIn = this.calculateStripeFees(pricePaid);
            const afterStripeIn = pricePaid - stripeFeesIn;

            if (isHytStudio) {
                // HYTSTUDIO: tout revient à la plateforme (après frais Stripe)
                totalPlatformRevenue += afterStripeIn;
                totalStripeFees += stripeFeesIn;
                // Pas de payout, donc pas de frais Stripe supplémentaires
            } else {
                // Autres créateurs: on calcule la commission
                const platformCommission = pricePaid * commissionRate;
                const creatorAmount = afterStripeIn - platformCommission;

                // Frais Stripe sur le payout (vers le créateur)
                const stripeFeesOut = this.calculateStripeFees(creatorAmount);
                const netToCreator = Math.max(0, creatorAmount - stripeFeesOut);

                totalPlatformRevenue += platformCommission;
                totalStripeFees += stripeFeesIn + stripeFeesOut;
                totalNetToCreators += netToCreator;
            }

            totalGrossRevenue += pricePaid;
        });

        // Compter les stats supplémentaires
        const countsResult = await pool.query(
            `SELECT
                 COUNT(DISTINCT p.id)::bigint AS sales_count,
                 COUNT(DISTINCT p.user_id)::bigint AS buyers_count,
                 COUNT(DISTINCT m.creator_id)::bigint AS sellers_count
             FROM purchases p
                      JOIN models m ON m.id = p.model_id
             WHERE p.price_paid > 0`
        );

        // Téléchargements totaux depuis model_file_versions
        const { rows: downloadRows } = await pool.query(`
            SELECT COALESCE(SUM(download_count), 0) as total_downloads
            FROM model_file_versions
            WHERE is_active = true
        `);

        const counts = countsResult.rows[0];

        return {
            // Revenus bruts totaux (ce que les clients ont payé) - en centimes
            totalRevenue: Math.round(totalGrossRevenue * 100),
            // Ce que la plateforme garde (commissions + ventes HYTSTUDIO) - en centimes
            platformCommission: Math.round(totalPlatformRevenue * 100),
            // Frais Stripe totaux - en centimes
            totalStripeFees: Math.round(totalStripeFees * 100),
            // Net versé aux créateurs - en centimes
            sellerEarnings: Math.round(totalNetToCreators * 100),
            // Stats
            salesCount: Number(counts.sales_count),
            buyersCount: Number(counts.buyers_count),
            sellersCount: Number(counts.sellers_count),
            // Téléchargements
            totalDownloads: parseInt(downloadRows[0]?.total_downloads || 0)
        };
    }

    // Courbe de revenus par jour
    async getRevenueChart(days = 30) {
        const { rows } = await pool.query(
            `SELECT
                 to_char(date_trunc('day', p.created_at), 'YYYY-MM-DD') AS day,
                 COALESCE(SUM(p.price_paid), 0) AS revenue,
                 COALESCE(COUNT(*), 0)::bigint AS sales_count
             FROM purchases p
             WHERE p.created_at >= now() - ($1::int || ' days')::interval
               AND p.price_paid > 0
             GROUP BY 1
             ORDER BY 1 ASC`,
            [days]
        );

        return rows.map(r => ({
            day: r.day,
            revenue: Math.round(parseFloat(r.revenue) * 100), // En centimes
            salesCount: Number(r.sales_count)
        }));
    }

    // Stats par vendeur avec frais Stripe
    async getSellerStats(days = 30) {
        const { rows } = await pool.query(
            `SELECT
                 m.creator_id AS seller_id,
                 u.username AS seller_username,
                 u.email AS seller_email,
                 u.creator_type,
                 u.role,
                 COUNT(DISTINCT p.id)::bigint AS sales_count,
                 SUM(p.price_paid)::numeric AS gross_revenue,
                 MAX(p.created_at) AS last_sale_at
             FROM purchases p
                      JOIN models m ON m.id = p.model_id
                      JOIN users u ON u.id = m.creator_id
             WHERE p.created_at >= now() - ($1::int || ' days')::interval
             AND p.price_paid > 0
             GROUP BY m.creator_id, u.username, u.email, u.creator_type, u.role
             ORDER BY gross_revenue DESC`,
            [days]
        );

        return rows.map(r => {
            const grossRevenue = parseFloat(r.gross_revenue) || 0;
            const isHytStudio = r.creator_type === 'HYTSTUDIO' ||
                r.role === 'ADMIN' ||
                r.role === 'STAFF';

            const commissionRate = isHytStudio ? 1.0 : this.getCommissionRate(r.creator_type);
            const salesCount = Number(r.sales_count);

            let totalPlatformCommission = 0;
            let totalStripeFees = 0;
            let totalNetToCreator = 0;

            // Calculer pour chaque vente (estimation basée sur prix moyen)
            const avgPricePerSale = grossRevenue / salesCount;

            for (let i = 0; i < salesCount; i++) {
                const stripeIn = this.calculateStripeFees(avgPricePerSale);
                const afterStripeIn = avgPricePerSale - stripeIn;

                if (isHytStudio) {
                    totalPlatformCommission += afterStripeIn;
                    totalStripeFees += stripeIn;
                } else {
                    const commission = avgPricePerSale * commissionRate;
                    const creatorAmount = afterStripeIn - commission;
                    const stripeOut = this.calculateStripeFees(creatorAmount);
                    const netToCreator = Math.max(0, creatorAmount - stripeOut);

                    totalPlatformCommission += commission;
                    totalStripeFees += stripeIn + stripeOut;
                    totalNetToCreator += netToCreator;
                }
            }

            return {
                sellerId: r.seller_id,
                sellerUsername: r.seller_username,
                sellerEmail: r.seller_email,
                creatorType: r.creator_type,
                isHytStudio: isHytStudio,
                salesCount: salesCount,
                grossRevenue: Math.round(grossRevenue * 100), // en centimes
                platformCommission: Math.round(totalPlatformCommission * 100), // en centimes
                stripeFees: Math.round(totalStripeFees * 100), // en centimes
                sellerEarnings: Math.round(totalNetToCreator * 100), // en centimes
                commissionRate: commissionRate * 100, // en pourcentage
                lastSaleAt: r.last_sale_at
            };
        });
    }

    // Top modèles vendus (global) - basé sur purchases
    async getTopModels(days = 30) {
        const { rows } = await pool.query(
            `SELECT
                 p.model_id,
                 m.title AS model_title,
                 m.price,
                 u.username AS seller_username,
                 u.creator_type,
                 COUNT(*)::bigint AS sales_count,
                 SUM(p.price_paid)::numeric AS total_revenue
             FROM purchases p
                      JOIN models m ON m.id = p.model_id
                      JOIN users u ON u.id = m.creator_id
             WHERE p.created_at >= now() - ($1::int || ' days')::interval
             AND p.price_paid > 0
             GROUP BY p.model_id, m.title, m.price, u.username, u.creator_type
             ORDER BY sales_count DESC, total_revenue DESC
                 LIMIT 10`,
            [days]
        );

        return rows.map(r => ({
            modelId: r.model_id,
            modelTitle: r.model_title || 'Unknown Model',
            price: Math.round(parseFloat(r.price) * 100), // en centimes
            sellerUsername: r.seller_username,
            creatorType: r.creator_type,
            salesCount: Number(r.sales_count),
            totalRevenue: Math.round(parseFloat(r.total_revenue) * 100) // en centimes
        }));
    }

    // Stats globales pour la page AdminSellers
    async getSellersOverviewStats() {
        // Compter les vendeurs actifs
        const sellersResult = await pool.query(
            `SELECT COUNT(DISTINCT id) as count FROM users WHERE role = 'CREATOR'`
        );
        const totalSellers = Number(sellersResult.rows[0].count);

        // Récupérer toutes les ventes pour calculer revenus et commissions
        const { rows } = await pool.query(
            `SELECT
                 p.price_paid,
                 u.creator_type,
                 u.role
             FROM purchases p
                      JOIN models m ON m.id = p.model_id
                      JOIN users u ON u.id = m.creator_id
             WHERE p.price_paid > 0`
        );

        let totalGrossRevenue = 0;
        let totalPlatformRevenue = 0;
        let totalStripeFees = 0;
        let totalNetToCreators = 0;

        rows.forEach(row => {
            const pricePaid = parseFloat(row.price_paid);
            const isHytStudio = row.creator_type === 'HYTSTUDIO' ||
                row.role === 'ADMIN' ||
                row.role === 'STAFF';

            const commissionRate = isHytStudio ? 1.0 : this.getCommissionRate(row.creator_type);

            const stripeIn = this.calculateStripeFees(pricePaid);
            const afterStripeIn = pricePaid - stripeIn;

            if (isHytStudio) {
                totalPlatformRevenue += afterStripeIn;
                totalStripeFees += stripeIn;
            } else {
                const commission = pricePaid * commissionRate;
                const creatorAmount = afterStripeIn - commission;
                const stripeOut = this.calculateStripeFees(creatorAmount);
                const netToCreator = Math.max(0, creatorAmount - stripeOut);

                totalPlatformRevenue += commission;
                totalStripeFees += stripeIn + stripeOut;
                totalNetToCreators += netToCreator;
            }

            totalGrossRevenue += pricePaid;
        });

        // Téléchargements totaux
        const { rows: downloadRows } = await pool.query(`
            SELECT COALESCE(SUM(download_count), 0) as total_downloads
            FROM model_file_versions
            WHERE is_active = true
        `);

        return {
            totalSellers,
            totalSales: rows.length,
            totalRevenue: totalGrossRevenue.toFixed(2),
            platformRevenue: totalPlatformRevenue.toFixed(2),
            totalStripeFees: totalStripeFees.toFixed(2),
            totalNetToCreators: totalNetToCreators.toFixed(2),
            totalDownloads: parseInt(downloadRows[0]?.total_downloads || 0)
        };
    }
}

module.exports = new AdminDashboardService();