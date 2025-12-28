const router = require("express").Router();
const invoicesController = require("../controllers/invoices.controller");
const { requireAuth } = require("../middlewares/requireAuth");

// Mes factures (client)
router.get("/me", requireAuth, invoicesController.getMyInvoices);

// Télécharger une facture
router.get("/:id/download", requireAuth, invoicesController.downloadInvoice);

// Télécharger via /pdf (alias)
router.get("/:id/pdf", requireAuth, invoicesController.downloadInvoicePdf);

// Factures vendeur
router.get("/seller/me", requireAuth, invoicesController.getSellerInvoices);

// Télécharger facture vendeur
router.get("/seller/:id/download", requireAuth, invoicesController.downloadSellerInvoice);


module.exports = router;