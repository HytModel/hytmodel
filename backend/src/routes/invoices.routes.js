const router = require("express").Router();
const pool = require("../db/pool");
const { requireAuth } = require("../middlewares/requireAuth");
const fs = require("fs");
const path = require("path");

/**
 * 📥 Télécharger une facture PDF
 */
router.get("/:id/download", requireAuth, async (req, res) => {
    const userId = req.user.id;
    const invoiceId = req.params.id;

    const { rows } = await pool.query(
        `
            SELECT pdf_path, invoice_number
            FROM invoices
            WHERE id = $1 AND user_id = $2
        `,
        [invoiceId, userId]
    );

    if (!rows.length) {
        return res.status(404).json({ error: "Invoice not found" });
    }

    const { pdf_path, invoice_number } = rows[0];

    if (!pdf_path || !fs.existsSync(pdf_path)) {
        return res.status(404).json({ error: "Invoice PDF not generated yet" });
    }

    res.download(pdf_path, `facture-${invoice_number}.pdf`);
});

/**
 * 📄 Mes factures
 */
router.get("/me", requireAuth, async (req, res) => {
    const userId = req.user.id;

    const { rows } = await pool.query(
        `
            SELECT
                i.id,
                i.invoice_number,
                i.total_amount,
                i.created_at
            FROM invoices i
            WHERE i.user_id = $1
            ORDER BY i.created_at DESC
        `,
        [userId]
    );

    res.json({ invoices: rows });
});

/**
 * 📄 Télécharger via /pdf
 */
router.get("/:id/pdf", requireAuth, async (req, res) => {
    const { id } = req.params;

    const { rows } = await pool.query(
        `
            SELECT pdf_path, invoice_number
            FROM invoices
            WHERE id = $1 AND user_id = $2
        `,
        [id, req.user.id]
    );

    if (!rows.length) {
        return res.status(404).json({ error: "Invoice not found" });
    }

    const { pdf_path, invoice_number } = rows[0];

    if (!pdf_path || typeof pdf_path !== "string") {
        return res.status(404).json({
            error: "Invoice PDF not generated yet"
        });
    }

    res.download(pdf_path, `${invoice_number}.pdf`);
});

module.exports = router;
