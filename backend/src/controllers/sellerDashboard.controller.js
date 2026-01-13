const sellerDashboardService = require("../services/sellerDashboard.service");
const pool = require("../db/pool");

// Fonction pour calculer les frais Stripe (x2 car intermédiaire)
// Stripe prend 1.5% + 0.25€ à chaque transaction
// Comme on est intermédiaire : paiement client + transfert vendeur = 2x
const calculateStripeFees = (grossAmount) => {
    return 2 * (grossAmount * 0.015 + 0.25);
};

class SellerDashboardController {
    // KPIs vendeur
    async getStats(req, res, next) {
        try {
            const sellerId = req.user.id;
            const stats = await sellerDashboardService.getSellerStats(sellerId);
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }

    // Courbe de ventes
    async getChart(req, res, next) {
        try {
            const sellerId = req.user.id;
            const days = parseInt(req.query.days || "30", 10);

            const data = await sellerDashboardService.getSalesChart(sellerId, days);
            res.json(data);
        } catch (error) {
            next(error);
        }
    }

    // Dernières ventes
    async getRecentSales(req, res, next) {
        try {
            const sellerId = req.user.id;
            const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || "20", 10)));

            const sales = await sellerDashboardService.getRecentSales(sellerId, limit);
            res.json(sales);
        } catch (error) {
            next(error);
        }
    }

    // Top modèles
    async getTopModels(req, res, next) {
        try {
            const sellerId = req.user.id;
            const days = parseInt(req.query.days || "30", 10);

            const models = await sellerDashboardService.getTopModels(sellerId, days);
            res.json(models);
        } catch (error) {
            next(error);
        }
    }

    // Analytics vendeur avec revenus NETS réels
    async getAnalytics(req, res, next) {
        try {
            const userId = req.user.id;

            // Top 5 produits les plus vendus
            const { rows: topProducts } = await pool.query(`
                SELECT
                    m.id,
                    m.title,
                    m.price,
                    m.thumbnail_url as image_url,
                    COUNT(p.id) as sales_count,
                    COALESCE(SUM(p.price_paid), 0) as total_revenue
                FROM models m
                         LEFT JOIN purchases p ON p.model_id = m.id
                WHERE m.creator_id = $1
                GROUP BY m.id, m.title, m.price, m.thumbnail_url
                ORDER BY sales_count DESC
                    LIMIT 5
            `, [userId]);

            // Revenus NETS totaux depuis seller_payments (après commission)
            const { rows: allPayments } = await pool.query(`
                SELECT gross_amount, net_amount, commission_amount
                FROM seller_payments
                WHERE seller_id = $1
            `, [userId]);

            let totalEarningsNet = 0;
            let totalStripeFees = 0;
            let totalCommission = 0;

            allPayments.forEach(payment => {
                const gross = parseFloat(payment.gross_amount || 0);
                const net = parseFloat(payment.net_amount || 0);
                const commission = parseFloat(payment.commission_amount || 0);
                const stripeFees = calculateStripeFees(gross);

                totalStripeFees += stripeFees;
                totalCommission += commission;
                totalEarningsNet += Math.max(0, net - stripeFees);
            });

            // Revenus NETS des 30 derniers jours
            const { rows: recent30Payments } = await pool.query(`
                SELECT gross_amount, net_amount
                FROM seller_payments
                WHERE seller_id = $1
                  AND created_at >= NOW() - INTERVAL '30 days'
            `, [userId]);

            let revenue30DaysNet = 0;
            recent30Payments.forEach(payment => {
                const gross = parseFloat(payment.gross_amount || 0);
                const net = parseFloat(payment.net_amount || 0);
                const stripeFees = calculateStripeFees(gross);
                revenue30DaysNet += Math.max(0, net - stripeFees);
            });

            // Revenus NETS des 7 derniers jours
            const { rows: recent7Payments } = await pool.query(`
                SELECT gross_amount, net_amount
                FROM seller_payments
                WHERE seller_id = $1
                  AND created_at >= NOW() - INTERVAL '7 days'
            `, [userId]);

            let revenue7DaysNet = 0;
            recent7Payments.forEach(payment => {
                const gross = parseFloat(payment.gross_amount || 0);
                const net = parseFloat(payment.net_amount || 0);
                const stripeFees = calculateStripeFees(gross);
                revenue7DaysNet += Math.max(0, net - stripeFees);
            });

            // Balance disponible (depuis users)
            const { rows: userBalance } = await pool.query(`
                SELECT COALESCE(available_balance, 0) as available_balance
                FROM users
                WHERE id = $1
            `, [userId]);

            // Nombre total de produits
            const { rows: productsCount } = await pool.query(`
                SELECT COUNT(*) as total_products
                FROM models
                WHERE creator_id = $1 AND status = 'APPROVED'
            `, [userId]);

            // Ventes par jour (7 derniers jours) pour le graphique
            const { rows: salesByDay } = await pool.query(`
                SELECT
                    DATE(p.created_at) as date,
                    COUNT(*) as sales,
                    COALESCE(SUM(p.price_paid), 0) as revenue
                FROM purchases p
                    JOIN models m ON m.id = p.model_id
                WHERE m.creator_id = $1
                  AND p.created_at >= NOW() - INTERVAL '7 days'
                GROUP BY DATE(p.created_at)
                ORDER BY date ASC
            `, [userId]);

            // Revenus des commandes sur mesure (avec frais Stripe déduits)
            const { rows: customOrdersData } = await pool.query(`
                SELECT
                    co.id,
                    co.first_payment_amount,
                    co.second_payment_amount,
                    co.first_payment_paid,
                    co.second_payment_paid,
                    co.commission_amount,
                    co.status
                FROM custom_orders co
                WHERE co.creator_id = $1
            `, [userId]);

            let customOrdersRevenueNet = 0;
            let completedOrders = 0;

            customOrdersData.forEach(order => {
                if (order.status === 'COMPLETED') {
                    completedOrders++;
                }

                // Calculer le revenu net pour cette commande
                let orderGross = 0;
                if (order.first_payment_paid) {
                    orderGross += parseFloat(order.first_payment_amount || 0) / 100;
                }
                if (order.second_payment_paid) {
                    orderGross += parseFloat(order.second_payment_amount || 0) / 100;
                }

                if (orderGross > 0) {
                    const commission = parseFloat(order.commission_amount || 0) / 100;
                    const netBeforeStripe = orderGross - commission;
                    const stripeFees = calculateStripeFees(orderGross);
                    customOrdersRevenueNet += Math.max(0, netBeforeStripe - stripeFees);
                }
            });

            res.json({
                topProducts: topProducts.map(p => ({
                    ...p,
                    sales_count: parseInt(p.sales_count),
                    total_revenue: parseFloat(p.total_revenue || 0)
                })),
                totalEarnings: totalEarningsNet,
                availableBalance: parseFloat(userBalance[0]?.available_balance || 0),
                revenue30Days: revenue30DaysNet,
                revenue7Days: revenue7DaysNet,
                totalProducts: parseInt(productsCount[0]?.total_products || 0),
                salesByDay: salesByDay.map(d => ({
                    date: d.date,
                    sales: parseInt(d.sales),
                    revenue: parseFloat(d.revenue)
                })),
                customOrdersRevenue: customOrdersRevenueNet,
                completedCustomOrders: completedOrders,
                // Infos supplémentaires pour transparence
                totalStripeFees: totalStripeFees,
                totalCommission: totalCommission
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SellerDashboardController();