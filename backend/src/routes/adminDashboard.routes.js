const express = require("express");
const db = require("../db");
const requireAuth = require("../middlewares/requireAuth");
const requireRole = require("../middlewares/requireRole");
const { parsePeriod } = require("../utils/period");

const router = express.Router();

// 🛡️ Staff: KPIs global
router.get("/admin/dashboard/stats", requireAuth, requireRole("ADMIN", "STAFF"), async (req, res) => {
    try {
        const { rows } = await db.query(
            `
      SELECT
        COALESCE(SUM(price_cents), 0)::bigint AS gross_cents,
        COALESCE(SUM(commission_cents), 0)::bigint AS commission_cents,
        COALESCE(SUM(net_cents), 0)::bigint AS net_cents,
        COUNT(*)::bigint AS sales_count,
        COUNT(DISTINCT seller_id)::bigint AS sellers_count
      FROM order_items
      `
        );

        const s = rows[0];
        res.json({
            grossCents: Number(s.gross_cents),
            commissionCents: Number(s.commission_cents),
            netCents: Number(s.net_cents),
            salesCount: Number(s.sales_count),
            sellersCount: Number(s.sellers_count),
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal error" });
    }
});

// 🛡️ Staff: courbe globale
router.get("/admin/dashboard/chart", requireAuth, requireRole("ADMIN", "STAFF"), async (req, res) => {
    try {
        const { days } = parsePeriod(req.query);

        const { rows } = await db.query(
            `
      SELECT
        to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
        SUM(price_cents)::bigint AS gross_cents,
        SUM(commission_cents)::bigint AS commission_cents,
        SUM(net_cents)::bigint AS net_cents,
        COUNT(*)::bigint AS sales_count
      FROM order_items
      WHERE created_at >= now() - ($1::int || ' days')::interval
      GROUP BY 1
      ORDER BY 1 ASC
      `,
            [days]
        );

        res.json(rows.map(r => ({
            day: r.day,
            grossCents: Number(r.gross_cents),
            commissionCents: Number(r.commission_cents),
            netCents: Number(r.net_cents),
            salesCount: Number(r.sales_count),
        })));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal error" });
    }
});

// 🛡️ Staff: tableau par vendeur
router.get("/admin/dashboard/sellers", requireAuth, requireRole("ADMIN", "STAFF"), async (req, res) => {
    try {
        const { days } = parsePeriod(req.query);

        const { rows } = await db.query(
            `
      SELECT
        seller_id,
        MAX(COALESCE(seller_username, 'Seller')) AS seller_username,
        MAX(COALESCE(seller_email, '')) AS seller_email,
        COUNT(*)::bigint AS sales_count,
        SUM(price_cents)::bigint AS gross_cents,
        SUM(commission_cents)::bigint AS commission_cents,
        SUM(net_cents)::bigint AS net_cents,
        MAX(created_at) AS last_sale_at
      FROM order_items
      WHERE created_at >= now() - ($1::int || ' days')::interval
      GROUP BY seller_id
      ORDER BY net_cents DESC
      `,
            [days]
        );

        res.json(rows.map(r => ({
            sellerId: r.seller_id,
            sellerUsername: r.seller_username,
            sellerEmail: r.seller_email,
            salesCount: Number(r.sales_count),
            grossCents: Number(r.gross_cents),
            commissionCents: Number(r.commission_cents),
            netCents: Number(r.net_cents),
            lastSaleAt: r.last_sale_at,
        })));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Internal error" });
    }
});

module.exports = router;
