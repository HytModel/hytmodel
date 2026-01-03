const pool = require("../db/pool");
const stripeService = require("./stripe.service");
const generateInvoiceNumber = require("../utils/generateInvoiceNumber");
const generateSellerInvoicePdf = require("../utils/generateSellerInvoicePdf");

class SellerService {
    // Récupérer les infos du vendeur
    async getSeller(sellerId) {
        const { rows } = await pool.query(
            `SELECT u.id, u.username, u.email, u.stripe_account_id,
                    COALESCE(u.is_affiliated, FALSE) AS is_affiliated,
                    u.creator_type
             FROM users u
             WHERE u.id = $1`,
            [sellerId]
        );
        return rows[0] || null;
    }

    // Calculer commission et montant vendeur
    calculateSellerAmounts(priceCents, creatorType) {
        // HYTSTUDIO = le site garde 100%
        if (creatorType === 'HYTSTUDIO') {
            return {
                commission: priceCents,
                sellerAmount: 0,
                commissionRate: 1.0
            };
        }

        // AFFILIATED = 10% commission, NON_AFFILIATED = 15% commission
        const commissionRate = creatorType === 'AFFILIATED' ? 0.10 : 0.15;
        const commission = Math.round(priceCents * commissionRate);
        const sellerAmount = priceCents - commission;

        return { commission, sellerAmount, commissionRate };
    }

    // Créer une facture vendeur
    async createSellerInvoice(seller, priceCents, commission, sellerAmount) {
        const sellerInvoiceNumber = `HMT-PAY-${new Date().getFullYear()}-${Date.now()}`;

        const sellerPdfPath = await generateSellerInvoicePdf({
            invoiceNumber: sellerInvoiceNumber,
            seller,
            grossAmount: priceCents,
            commissionAmount: commission,
            netAmount: sellerAmount,
            stripeTransferId: null,
            createdAt: new Date()
        });

        await pool.query(
            `INSERT INTO seller_invoices
             (seller_id, invoice_number, gross_amount, commission_amount, net_amount, pdf_path)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [seller.id, sellerInvoiceNumber, priceCents, commission, sellerAmount, sellerPdfPath]
        );

        return { sellerInvoiceNumber, sellerPdfPath };
    }

    // Effectuer le paiement Stripe Connect
    async payoutToSeller(seller, sellerAmount, paymentIntentId) {
        if (!seller.stripe_account_id) {
            console.warn("⚠️ Seller has no Stripe account:", seller.id);
            return null;
        }

        try {
            // Récupérer le Payment Intent pour obtenir le Charge ID
            const paymentIntent = await stripeService.stripe.paymentIntents.retrieve(paymentIntentId);

            // Le charge ID est dans latest_charge
            const chargeId = paymentIntent.latest_charge;

            if (!chargeId) {
                console.warn("⚠️ No charge found for payment intent:", paymentIntentId);
                return null;
            }

            console.log("💳 Creating transfer with charge:", chargeId);

            const transfer = await stripeService.stripe.transfers.create({
                amount: sellerAmount,
                currency: "eur",
                destination: seller.stripe_account_id,
                source_transaction: chargeId // Utiliser le Charge ID, pas le Payment Intent ID
            });

            console.log("✅ Transfer created:", transfer.id);
            return transfer;
        } catch (error) {
            console.error("❌ Transfer error:", error.message);
            // Ne pas bloquer le webhook si le transfert échoue
            // Le vendeur peut être payé manuellement plus tard
            return null;
        }
    }

    // Enregistrer le payout dans la DB
    async recordPayout(sellerId, paymentId, modelId, sellerAmount, commission, transferId) {
        await pool.query(
            `INSERT INTO seller_payouts
             (seller_id, payment_id, model_id, amount, commission, stripe_transfer_id)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [sellerId, paymentId, modelId, sellerAmount, commission, transferId]
        );
    }

    // Process complet vendeur (facture + paiement)
    async processSeller(item, paymentId, paymentIntentId) {
        const seller = await this.getSeller(item.creator_id);
        if (!seller) {
            console.warn("⚠️ Seller not found:", item.creator_id);
            return;
        }

        const priceCents = Math.round(item.price * 100);
        const { commission, sellerAmount, commissionRate } = this.calculateSellerAmounts(
            priceCents,
            seller.creator_type
        );

        console.log(`💰 Sale: ${(priceCents/100).toFixed(2)}€ | Type: ${seller.creator_type} | Commission: ${(commissionRate * 100)}% = ${(commission/100).toFixed(2)}€`);

        // HYTSTUDIO = pas de facture vendeur ni de transfert (le site garde tout)
        if (seller.creator_type === 'HYTSTUDIO') {
            console.log("💰 HYTSTUDIO sale - site keeps 100%:", (priceCents / 100).toFixed(2), "€");
            return;
        }

        // Facture vendeur
        await this.createSellerInvoice(seller, priceCents, commission, sellerAmount);

        // Paiement Stripe Connect (ne bloque pas si erreur)
        const transfer = await this.payoutToSeller(seller, sellerAmount, paymentIntentId);

        // Enregistrer le payout si transfert réussi
        if (transfer) {
            await this.recordPayout(seller.id, paymentId, item.model_id, sellerAmount, commission, transfer.id);
        }
    }
}

module.exports = new SellerService();