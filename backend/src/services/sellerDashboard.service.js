const pool = require("../db/pool");

class SellerDashboardService {
    // KPIs du vendeur
    async getSellerStats(sellerId) {
        const { rows } = await pool.query(
            `SELECT
                 COALESCE(SUM(sp.amount), 0)::bigint AS total_earnings,
                 COALESCE(COUNT(*), 0)::bigint AS sales_count,
                 MAX(sp.created_at) AS last_sale_at
             FROM seller_payouts sp
             WHERE sp.seller_id = $1`,
            [sellerId]
        );

        const stats = rows[0];

        // Dernier payout
        const { rows: lastPayout } = await pool.query(
            `SELECT stripe_transfer_id, amount, created_at
             FROM seller_payouts
             WHERE seller_id = $1
             ORDER BY created_at DESC
                 LIMIT 1`,
            [sellerId]
        );

        return {
            totalEarnings: Number(stats.total_earnings),
            salesCount: Number(stats.sales_count),
            lastSaleAt: stats.last_sale_at,
            lastPayout: lastPayout[0] || null
        };
    }

    // Courbe de ventes par jour
    async getSalesChart(sellerId, days = 30) {
        const { rows } = await pool.query(
            `SELECT
                 to_char(date_trunc('day', sp.created_at), 'YYYY-MM-DD') AS day,
                COALESCE(SUM(sp.amount), 0)::bigint AS earnings,
                COALESCE(COUNT(*), 0)::bigint AS sales_count
             FROM seller_payouts sp
             WHERE sp.seller_id = $1
               AND sp.created_at >= now() - ($2::int || ' days')::interval
             GROUP BY 1
             ORDER BY 1 ASC`,
            [sellerId, days]
        );

        return rows.map(r => ({
            day: r.day,
            earnings: Number(r.earnings),
            salesCount: Number(r.sales_count)
        }));
    }

    // Dernières ventes
    async getRecentSales(sellerId, limit = 20) {
        const { rows } = await pool.query(
            `SELECT
                 sp.id,
                 sp.model_id,
                 sp.amount,
                 sp.stripe_transfer_id,
                 sp.created_at,
                 m.title AS model_title,
                 p.stripe_session_id
             FROM seller_payouts sp
                      JOIN payments p ON p.id = sp.payment_id
                      LEFT JOIN models m ON m.id = sp.model_id
             WHERE sp.seller_id = $1
             ORDER BY sp.created_at DESC
                 LIMIT $2`,
            [sellerId, limit]
        );

        return rows.map(r => ({
            id: r.id,
            modelId: r.model_id,
            modelTitle: r.model_title,
            amount: Number(r.amount),
            stripeTransferId: r.stripe_transfer_id,
            createdAt: r.created_at
        }));
    }

    // Top modèles
    async getTopModels(sellerId, days = 30) {
        const { rows } = await pool.query(
            `SELECT
                 sp.model_id,
                 m.title AS model_title,
                 COUNT(*)::bigint AS sales_count,
                 SUM(sp.amount)::bigint AS total_earnings
             FROM seller_payouts sp
                      LEFT JOIN models m ON m.id = sp.model_id
             WHERE sp.seller_id = $1
               AND sp.created_at >= now() - ($2::int || ' days')::interval
             GROUP BY sp.model_id, m.title
             ORDER BY total_earnings DESC
                 LIMIT 10`,
            [sellerId, days]
        );

        return rows.map(r => ({
            modelId: r.model_id,
            modelTitle: r.model_title || 'Unknown Model',
            salesCount: Number(r.sales_count),
            totalEarnings: Number(r.total_earnings)
        }));
    }
}

module.exports = new SellerDashboardService();