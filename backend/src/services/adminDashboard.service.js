const pool = require("../db/pool");
const router = require("../routes/auth.routes");

class AdminDashboardService {
    // KPIs globaux
    async getGlobalStats() {
        // Récupérer toutes les ventes avec le type de créateur
        const { rows } = await pool.query(
            `SELECT
                 m.price,
                 u.creator_type
             FROM purchases pur
                      JOIN models m ON m.id = pur.model_id
                      JOIN users u ON u.id = m.creator_id`
        );

        let totalRevenueCents = 0;
        let platformCommissionCents = 0;
        let sellerEarningsCents = 0;

        rows.forEach(row => {
            const priceCents = Math.round(Number(row.price) * 100);
            totalRevenueCents += priceCents;

            // Calculer la commission selon creator_type
            let commissionRate;
            if (row.creator_type === 'HYTSTUDIO') {
                commissionRate = 1.0; // 100%
            } else if (row.creator_type === 'AFFILIATED') {
                commissionRate = 0.10; // 10%
            } else {
                commissionRate = 0.15; // 15%
            }

            const commission = Math.round(priceCents * commissionRate);
            platformCommissionCents += commission;
            sellerEarningsCents += (priceCents - commission);
        });

        // Compter les stats supplémentaires
        const countsResult = await pool.query(
            `SELECT 
                COUNT(DISTINCT pur.id)::bigint AS sales_count,
                COUNT(DISTINCT pur.user_id)::bigint AS buyers_count,
                COUNT(DISTINCT m.creator_id)::bigint AS sellers_count
             FROM purchases pur
             JOIN models m ON m.id = pur.model_id`
        );

        const counts = countsResult.rows[0];

        return {
            totalRevenue: totalRevenueCents,
            sellerEarnings: sellerEarningsCents,
            platformCommission: platformCommissionCents,
            salesCount: Number(counts.sales_count),
            buyersCount: Number(counts.buyers_count),
            sellersCount: Number(counts.sellers_count)
        };
    }

    // Courbe de revenus par jour
    async getRevenueChart(days = 30) {
        const { rows } = await pool.query(
            `SELECT
                 to_char(date_trunc('day', p.created_at), 'YYYY-MM-DD') AS day,
                COALESCE(SUM(p.amount), 0)::bigint AS revenue,
                COALESCE(COUNT(*), 0)::bigint AS sales_count
             FROM payments p
             WHERE p.created_at >= now() - ($1::int || ' days')::interval
             GROUP BY 1
             ORDER BY 1 ASC`,
            [days]
        );

        return rows.map(r => ({
            day: r.day,
            revenue: Number(r.revenue),
            salesCount: Number(r.sales_count)
        }));
    }

    // Stats par vendeur (inclut HYTSTUDIO et calcule les vraies commissions)
    async getSellerStats(days = 30) {
        const { rows } = await pool.query(
            `SELECT
                 m.creator_id AS seller_id,
                 u.username AS seller_username,
                 u.email AS seller_email,
                 u.creator_type,
                 COUNT(DISTINCT pur.id)::bigint AS sales_count,
                 SUM(m.price)::numeric AS gross_revenue,
                 MAX(pur.created_at) AS last_sale_at
             FROM purchases pur
                      JOIN models m ON m.id = pur.model_id
                      JOIN users u ON u.id = m.creator_id
             WHERE pur.created_at >= now() - ($1::int || ' days')::interval
             GROUP BY m.creator_id, u.username, u.email, u.creator_type
             ORDER BY gross_revenue DESC`,
            [days]
        );

        return rows.map(r => {
            const grossRevenue = Number(r.gross_revenue) || 0;
            const grossRevenueCents = Math.round(grossRevenue * 100);

            // Calculer commission selon creator_type
            let commissionRate;
            if (r.creator_type === 'HYTSTUDIO') {
                commissionRate = 1.0; // 100% pour le site
            } else if (r.creator_type === 'AFFILIATED') {
                commissionRate = 0.10; // 10%
            } else {
                commissionRate = 0.15; // 15%
            }

            const commissionCents = Math.round(grossRevenueCents * commissionRate);
            const sellerEarningsCents = grossRevenueCents - commissionCents;

            return {
                sellerId: r.seller_id,
                sellerUsername: r.seller_username,
                sellerEmail: r.seller_email,
                creatorType: r.creator_type,
                salesCount: Number(r.sales_count),
                grossRevenue: grossRevenueCents, // en centimes
                platformCommission: commissionCents, // en centimes
                sellerEarnings: sellerEarningsCents, // en centimes
                commissionRate: commissionRate * 100, // en pourcentage
                lastSaleAt: r.last_sale_at
            };
        });
    }

    // Top modèles vendus (global) - basé sur purchases
    async getTopModels(days = 30) {
        const { rows } = await pool.query(
            `SELECT
                 pur.model_id,
                 m.title AS model_title,
                 m.price,
                 u.username AS seller_username,
                 u.creator_type,
                 COUNT(*)::bigint AS sales_count,
                 SUM(m.price)::numeric AS total_revenue
             FROM purchases pur
                      JOIN models m ON m.id = pur.model_id
                      JOIN users u ON u.id = m.creator_id
             WHERE pur.created_at >= now() - ($1::int || ' days')::interval
             GROUP BY pur.model_id, m.title, m.price, u.username, u.creator_type
             ORDER BY sales_count DESC, total_revenue DESC
                 LIMIT 10`,
            [days]
        );

        return rows.map(r => ({
            modelId: r.model_id,
            modelTitle: r.model_title || 'Unknown Model',
            price: Math.round(Number(r.price) * 100), // en centimes
            sellerUsername: r.seller_username,
            creatorType: r.creator_type,
            salesCount: Number(r.sales_count),
            totalRevenue: Math.round(Number(r.total_revenue) * 100) // en centimes
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
        const salesResult = await pool.query(
            `SELECT 
                m.price,
                u.creator_type
             FROM purchases pur
             JOIN models m ON m.id = pur.model_id
             JOIN users u ON u.id = m.creator_id`
        );

        let totalRevenueCents = 0;
        let totalCommissionsCents = 0;

        salesResult.rows.forEach(row => {
            const priceCents = Math.round(Number(row.price) * 100);
            totalRevenueCents += priceCents;

            // Calculer la commission selon creator_type
            let commissionRate;
            if (row.creator_type === 'HYTSTUDIO') {
                commissionRate = 1.0;
            } else if (row.creator_type === 'AFFILIATED') {
                commissionRate = 0.10;
            } else {
                commissionRate = 0.15;
            }

            totalCommissionsCents += Math.round(priceCents * commissionRate);
        });

        return {
            totalSellers,
            totalRevenue: (totalRevenueCents / 100).toFixed(2),
            totalCommissions: (totalCommissionsCents / 100).toFixed(2)
        };
    }
}

module.exports = new AdminDashboardService();