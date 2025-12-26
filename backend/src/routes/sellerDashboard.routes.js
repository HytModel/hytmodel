const express = require("express");
const db = require("../db");
const requireAuth = require("../middlewares/requireAuth");
const requireRole = require("../middlewares/requireRole");
const { parsePeriod } = require("../utils/period");

const router = express.Router();

// 👤 vendeur: KPIs
router.get("/seller/dashboard/stats", requireAuth, requireRole("SELLER", "ADMIN"), async (req, res) => {
    try {
        const sellerId = req.user.id;

        const { rows } = await db.query(
            `
      SELECT
        COALESCE(SUM(price_cents), 0)::bigint AS gross_cents,
        COALESCE(SUM(commission_cents), 0)::bigint AS commission_cents,
        COALESCE(SUM(net_cents), 0)::bigint AS net_cents,
        COALESCE(COUNT(*), 0)::bigint AS sales_count,
        MAX(created_at) AS last_sale_at
      FROM order_items
      WHERE seller_id = $1
      `,
            [sellerId]
        );

        const stats = rows[0];

        // Dernier payout (si tu stockes stripe_transfer_id + payout_status=paid)
        const payout = await db.query(
            `
      SELECT stripe_transfer_id, SUM(net_cents)::bigint AS amount_cents, MAX(created_at) AS date
      FROM order_items
      WHERE seller_id = $1 AND payout_status = 'paid' AND stripe_transfer_id IS NOT NULL
      GROUP BY stripe_transfer_id
      ORDER BY date DESC
      LIMIT 1
      `,
            [sellerId]
        );

        res.json({
            grossCents: Number(stats.gross_cents),
            commissionCents: Number(stats.commission_cents),
            netCents: Number(stats.net_cents),
            salesCount: Number(stats.sales_count),
            lastSaleAt: stats.last_sale_at,
            lastPayout: payout.rows[0] || null,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal error" });
    }
});

// 👤 vendeur: courbe net par jour
router.get("/seller/dashboard/chart", requireAuth, requireRole("SELLER", "ADMIN"), async (req, res) => {
    try {
        const sellerId = req.user.id;
        const { days } = parsePeriod(req.query);

        const { rows } = await db.query(
            `
      SELECT
        to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
        COALESCE(SUM(net_cents), 0)::bigint AS net_cents,
        COALESCE(SUM(price_cents), 0)::bigint AS gross_cents,
        COALESCE(SUM(commission_cents), 0)::bigint AS commission_cents,
        COUNT(*)::bigint AS sales_count
      FROM order_items
      WHERE seller_id = $1
        AND created_at >= now() - ($2::int || ' days')::interval
      GROUP BY 1
      ORDER BY 1 ASC
      `,
            [sellerId, days]
        );

        res.json(rows.map(r => ({
            day: r.day,
            netCents: Number(r.net_cents),
            grossCents: Number(r.gross_cents),
            commissionCents: Number(r.commission_cents),
            salesCount: Number(r.sales_count),
        })));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal error" });
    }
});

// 👤 vendeur: dernières ventes
router.get("/seller/dashboard/sales", requireAuth, requireRole("SELLER", "ADMIN"), async (req, res) => {
    try {
        const sellerId = req.user.id;
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || "20", 10)));

        const { rows } = await db.query(
            `
      SELECT
        id, order_id, model_id, model_title,
        price_cents, commission_cents, net_cents,
        payout_status, stripe_transfer_id,
        created_at
      FROM order_items
      WHERE seller_id = $1
      ORDER BY created_at DESC
      LIMIT $2
      `,
            [sellerId, limit]
        );

        res.json(rows.map(r => ({
            id: r.id,
            orderId: r.order_id,
            modelId: r.model_id,
            modelTitle: r.model_title,
            priceCents: Number(r.price_cents),
            commissionCents: Number(r.commission_cents),
            netCents: Number(r.net_cents),
            payoutStatus: r.payout_status,
            stripeTransferId: r.stripe_transfer_id,
            createdAt: r.created_at,
        })));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal error" });
    }
});

// 👤 vendeur: top modèles
router.get("/seller/dashboard/top-models", requireAuth, requireRole("SELLER", "ADMIN"), async (req, res) => {
    try {
        const sellerId = req.user.id;
        const { days } = parsePeriod(req.query);

        const { rows } = await db.query(
            `
      SELECT
        model_id,
        COALESCE(model_title, 'Model') AS model_title,
        COUNT(*)::bigint AS sales_count,
        SUM(net_cents)::bigint AS net_cents
      FROM order_items
      WHERE seller_id = $1
        AND created_at >= now() - ($2::int || ' days')::interval
      GROUP BY model_id, model_title
      ORDER BY net_cents DESC
      LIMIT 10
      `,
            [sellerId, days]
        );

        res.json(rows.map(r => ({
            modelId: r.model_id,
            modelTitle: r.model_title,
            salesCount: Number(r.sales_count),
            netCents: Number(r.net_cents),
        })));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal error" });
    }
});

module.exports = router;
