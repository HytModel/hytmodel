const pool = require("../db/pool");
const fs = require("fs");

class InvoicesService {
    // Récupérer une facture par ID et user
    async getInvoiceByIdAndUser(invoiceId, userId) {
        const { rows } = await pool.query(
            `SELECT id, invoice_number, total_amount, pdf_path, created_at
             FROM invoices
             WHERE id = $1 AND user_id = $2`,
            [invoiceId, userId]
        );
        return rows[0] || null;
    }

    // Récupérer toutes les factures d'un utilisateur
    async getUserInvoices(userId) {
        const { rows } = await pool.query(
            `SELECT id, invoice_number, total_amount, created_at
             FROM invoices
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );
        return rows;
    }

    // Vérifier si le PDF existe
    pdfExists(pdfPath) {
        return pdfPath && typeof pdfPath === "string" && fs.existsSync(pdfPath);
    }

    // Récupérer les notes de paiement vendeur
    async getSellerInvoices(sellerId) {
        const { rows } = await pool.query(
            `SELECT id, payment_number as invoice_number, gross_amount,
                    commission_amount, net_amount, pdf_path, created_at, status
             FROM seller_payments
             WHERE seller_id = $1
             ORDER BY created_at DESC`,
            [sellerId]
        );
        return rows;
    }

    // Récupérer une note de paiement vendeur par ID
    async getSellerInvoiceById(invoiceId, sellerId) {
        const { rows } = await pool.query(
            `SELECT id, payment_number as invoice_number, gross_amount,
                    commission_amount, net_amount, pdf_path, created_at, status
             FROM seller_payments
             WHERE id = $1 AND seller_id = $2`,
            [invoiceId, sellerId]
        );
        return rows[0] || null;
    }
}

module.exports = new InvoicesService();