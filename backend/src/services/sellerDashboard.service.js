const pool = require("../db/pool");

// Fonction pour calculer les frais Stripe (x2 car intermédiaire)
const calculateStripeFees = (grossAmount) => {
    return 2 * (grossAmount * 0.015 + 0.25);
};

class SellerDashboardService {
    // KPIs du vendeur - utilise seller_payments
    async getSellerStats(sellerId) {
        // Compter TOUTES les ventes (modèles, bundles, custom orders) depuis seller_payments
        const { rows: salesRows } = await pool.query(
            `SELECT COUNT(*) as sales_count
             FROM seller_payments
             WHERE seller_id = $1`,
            [sellerId]
        );

        // Revenus depuis seller_payments (avec frais Stripe déduits)
        const { rows: paymentsRows } = await pool.query(
            `SELECT gross_amount, net_amount, created_at
             FROM seller_payments
             WHERE seller_id = $1
             ORDER BY created_at DESC`,
            [sellerId]
        );

        let totalEarningsNet = 0;
        let lastSaleAt = null;

        paymentsRows.forEach((payment, index) => {
            const gross = parseFloat(payment.gross_amount || 0);
            const net = parseFloat(payment.net_amount || 0);
            const stripeFees = calculateStripeFees(gross);
            totalEarningsNet += Math.max(0, net - stripeFees);

            if (index === 0) {
                lastSaleAt = payment.created_at;
            }
        });

        // Dernier paiement
        const lastPayout = paymentsRows[0] ? {
            amount: parseFloat(paymentsRows[0].net_amount || 0),
            created_at: paymentsRows[0].created_at
        } : null;

        return {
            totalEarnings: totalEarningsNet,
            salesCount: parseInt(salesRows[0]?.sales_count || 0),
            lastSaleAt: lastSaleAt,
            lastPayout: lastPayout
        };
    }

    // Courbe de ventes par jour - utilise seller_payments
    async getSalesChart(sellerId, days = 30) {
        const { rows } = await pool.query(
            `SELECT
                 to_char(date_trunc('day', sp.created_at), 'YYYY-MM-DD') AS day,
                 COALESCE(SUM(sp.net_amount), 0) AS earnings,
                 COALESCE(COUNT(*), 0)::bigint AS sales_count
             FROM seller_payments sp
             WHERE sp.seller_id = $1
               AND sp.created_at >= now() - ($2::int || ' days')::interval
             GROUP BY 1
             ORDER BY 1 ASC`,
            [sellerId, days]
        );

        return rows.map(r => {
            const earnings = parseFloat(r.earnings || 0);
            // On ne peut pas calculer les frais Stripe par jour sans les montants bruts individuels
            // Donc on retourne le net après commission
            return {
                day: r.day,
                earnings: earnings,
                salesCount: Number(r.sales_count)
            };
        });
    }

    // Dernières ventes - utilise seller_payments
    async getRecentSales(sellerId, limit = 20) {
        const { rows } = await pool.query(
            `SELECT
                 sp.id,
                 sp.gross_amount,
                 sp.net_amount,
                 sp.commission_amount,
                 sp.stripe_session_id,
                 sp.created_at,
                 sp.payment_number
             FROM seller_payments sp
             WHERE sp.seller_id = $1
             ORDER BY sp.created_at DESC
                 LIMIT $2`,
            [sellerId, limit]
        );

        return rows.map(r => {
            const gross = parseFloat(r.gross_amount || 0);
            const net = parseFloat(r.net_amount || 0);
            const stripeFees = calculateStripeFees(gross);
            const netAfterStripe = Math.max(0, net - stripeFees);

            return {
                id: r.id,
                modelTitle: r.payment_number, // ou récupérer le titre du modèle si besoin
                amount: netAfterStripe,
                grossAmount: gross,
                commission: parseFloat(r.commission_amount || 0),
                stripeFees: stripeFees,
                createdAt: r.created_at
            };
        });
    }

    // Top modèles - utilise purchases avec calcul net
    async getTopModels(sellerId, days = 30) {
        const { rows } = await pool.query(
            `SELECT
                 p.model_id,
                 m.title AS model_title,
                 COUNT(*)::bigint AS sales_count,
                 SUM(p.price_paid) AS total_gross
             FROM purchases p
                      JOIN models m ON m.id = p.model_id
             WHERE m.creator_id = $1
               AND p.created_at >= now() - ($2::int || ' days')::interval
             GROUP BY p.model_id, m.title
             ORDER BY total_gross DESC
                 LIMIT 10`,
            [sellerId, days]
        );

        // Récupérer le taux du créateur
        const { rows: creatorRows } = await pool.query(
            `SELECT creator_type FROM users WHERE id = $1`,
            [sellerId]
        );
        const creatorType = creatorRows[0]?.creator_type;
        const creatorRate = creatorType === 'AFFILIATED' ? 0.90 :
            creatorType === 'HYTSTUDIO' ? 1.00 : 0.85;

        return rows.map(r => {
            const totalGross = parseFloat(r.total_gross || 0);
            const salesCount = Number(r.sales_count);
            // Estimer le revenu net
            const netBeforeStripe = totalGross * creatorRate;
            const stripeFees = salesCount > 0 ? salesCount * calculateStripeFees(totalGross / salesCount) : 0;
            const totalNet = Math.max(0, netBeforeStripe - stripeFees);

            return {
                modelId: r.model_id,
                modelTitle: r.model_title || 'Unknown Model',
                salesCount: salesCount,
                totalEarnings: totalNet
            };
        });
    }
}

module.exports = new SellerDashboardService();