const invoicesService = require("../services/invoices.service");
const path = require("path");

class InvoicesController {
    // Télécharger une facture PDF
    async downloadInvoice(req, res, next) {
        try {
            const userId = req.user.id;
            const invoiceId = req.params.id;

            const invoice = await invoicesService.getInvoiceByIdAndUser(invoiceId, userId);

            if (!invoice) {
                return res.status(404).json({ error: "Invoice not found" });
            }

            if (!invoicesService.pdfExists(invoice.pdf_path)) {
                return res.status(404).json({ error: "Invoice PDF not generated yet" });
            }

            res.download(invoice.pdf_path, `facture-${invoice.invoice_number}.pdf`);
        } catch (error) {
            next(error);
        }
    }

    // Récupérer mes factures
    async getMyInvoices(req, res, next) {
        try {
            const userId = req.user.id;
            const invoices = await invoicesService.getUserInvoices(userId);

            res.json({ invoices });
        } catch (error) {
            next(error);
        }
    }

    // Télécharger via /pdf (même que download)
    async downloadInvoicePdf(req, res, next) {
        try {
            const userId = req.user.id;
            const invoiceId = req.params.id;

            const invoice = await invoicesService.getInvoiceByIdAndUser(invoiceId, userId);

            if (!invoice) {
                return res.status(404).json({ error: "Invoice not found" });
            }

            if (!invoicesService.pdfExists(invoice.pdf_path)) {
                return res.status(404).json({ error: "Invoice PDF not generated yet" });
            }

            res.download(invoice.pdf_path, `${invoice.invoice_number}.pdf`);
        } catch (error) {
            next(error);
        }
    }

    // Factures vendeur
    async getSellerInvoices(req, res, next) {
        try {
            const sellerId = req.user.id;
            const invoices = await invoicesService.getSellerInvoices(sellerId);

            res.json({ invoices });
        } catch (error) {
            next(error);
        }
    }

    // Télécharger facture vendeur
    async downloadSellerInvoice(req, res, next) {
        try {
            const sellerId = req.user.id;
            const invoiceId = req.params.id;

            const invoice = await invoicesService.getSellerInvoiceById(invoiceId, sellerId);

            if (!invoice) {
                return res.status(404).json({ error: "Seller invoice not found" });
            }

            if (!invoicesService.pdfExists(invoice.pdf_path)) {
                return res.status(404).json({ error: "Invoice PDF not generated yet" });
            }

            res.download(invoice.pdf_path, `seller-invoice-${invoice.invoice_number}.pdf`);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new InvoicesController();