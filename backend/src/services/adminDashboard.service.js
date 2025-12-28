const pool = require("../db/pool");

class AdminDashboardService {
    // KPIs globaux
    async getGlobalStats() {
        const { rows } = await pool.query(
            `SELECT
                COALESCE(SUM(p.amount), 0)::bigint AS total_revenue,
                COALESCE(COUNT(DISTINCT p.id), 0)::bigint AS sales_count,
                COALESCE(COUNT(DISTINCT pur.user_id), 0)::bigint AS buyers_count,
                COALESCE(SUM(sp.amount), 0)::bigint AS seller_earnings,
                COALESCE(COUNT(DISTINCT sp.seller_id), 0)::bigint AS sellers_count
             FROM payments p
             LEFT JOIN purchases pur ON pur.stripe_session_id = p.stripe_session_id
             LEFT JOIN seller_payouts sp ON sp.payment_id = p.id`
        );

        const stats = rows[0];
        const commission = Number(stats.total_revenue) - Number(stats.seller_earnings);

        return {
            totalRevenue: Number(stats.total_revenue),
            sellerEarnings: Number(stats.seller_earnings),
            platformCommission: commission,
            salesCount: Number(stats.sales_count),
            buyersCount: Number(stats.buyers_count),
            sellersCount: Number(stats.sellers_count)
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

    // Stats par vendeur
    async getSellerStats(days = 30) {
        const { rows } = await pool.query(
            `SELECT
                sp.seller_id,
                u.username AS seller_username,
                u.email AS seller_email,
                COUNT(*)::bigint AS sales_count,
                SUM(sp.amount)::bigint AS total_earnings,
                MAX(sp.created_at) AS last_sale_at
             FROM seller_payouts sp
             JOIN users u ON u.id = sp.seller_id
             WHERE sp.created_at >= now() - ($1::int || ' days')::interval
             GROUP BY sp.seller_id, u.username, u.email
             ORDER BY total_earnings DESC`,
            [days]
        );

        return rows.map(r => ({
            sellerId: r.seller_id,
            sellerUsername: r.seller_username,
            sellerEmail: r.seller_email,
            salesCount: Number(r.sales_count),
            totalEarnings: Number(r.total_earnings),
            lastSaleAt: r.last_sale_at
        }));
    }

    // Top modèles vendus (global)
    async getTopModels(days = 30) {
        const { rows } = await pool.query(
            `SELECT
                sp.model_id,
                m.title AS model_title,
                COUNT(*)::bigint AS sales_count,
                SUM(sp.amount)::bigint AS total_revenue
             FROM seller_payouts sp
             LEFT JOIN models m ON m.id = sp.model_id
             WHERE sp.created_at >= now() - ($1::int || ' days')::interval
             GROUP BY sp.model_id, m.title
             ORDER BY total_revenue DESC
             LIMIT 10`,
            [days]
        );

        return rows.map(r => ({
            modelId: r.model_id,
            modelTitle: r.model_title || 'Unknown Model',
            salesCount: Number(r.sales_count),
            totalRevenue: Number(r.total_revenue)
        }));
    }
}

module.exports = new AdminDashboardService();