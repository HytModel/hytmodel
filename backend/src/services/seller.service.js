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

    /**
     * Détermine le taux de commission selon le contexte
     */
    getCommissionRate(creatorType, isCustomOrder = false) {
        // Comptes internes → 100% (tout pour la plateforme)
        if (['HYTSTUDIO', 'ADMIN', 'STAFF'].includes(creatorType)) return 1.0;
        if (creatorType === 'AFFILIATED' && isCustomOrder) return 0.05; // 5%
        if (creatorType === 'AFFILIATED') return 0.10; // 10%
        return 0.15; // 15% par défaut
    }

    /**
     * Vérifie si c'est un compte interne (pas de transfert)
     */
    isInternalAccount(creatorType) {
        return ['HYTSTUDIO', 'ADMIN', 'STAFF'].includes(creatorType);
    }

    /**
     * Calcule commission et montant vendeur
     * Note: Les frais Stripe sont prélevés sur la commission de la plateforme, pas sur le vendeur
     * @param {number} priceCents - Prix de vente en centimes
     * @param {string} creatorType - 'HYTSTUDIO', 'ADMIN', 'STAFF', 'AFFILIATED', ou null
     * @param {boolean} isCustomOrder - Est-ce une commande sur mesure ?
     * @returns {Object} { commission, sellerAmount, commissionRate }
     */
    calculateSellerAmounts(priceCents, creatorType, isCustomOrder = false) {
        // Comptes internes = le site garde 100%
        if (this.isInternalAccount(creatorType)) {
            return {
                commission: priceCents,
                sellerAmount: 0,
                commissionRate: 1.0
            };
        }

        // Déterminer le taux de commission
        const commissionRate = this.getCommissionRate(creatorType, isCustomOrder);

        // Commission basée sur le prix brut
        const commission = Math.round(priceCents * commissionRate);

        // Montant vendeur = Prix - Commission (les frais Stripe sont sur nous)
        const sellerAmount = priceCents - commission;

        return { commission, sellerAmount, commissionRate };
    }

    // Créer une facture vendeur (note de paiement)
    async createSellerInvoice(seller, priceCents, commission, sellerAmount, creatorType, isCustomOrder = false, orderTitle = null) {
        const sellerInvoiceNumber = `HMT-PAY-${new Date().getFullYear()}-${Date.now()}`;

        const sellerPdfPath = await generateSellerInvoicePdf({
            invoiceNumber: sellerInvoiceNumber,
            seller,
            grossAmount: priceCents,
            commissionAmount: commission,
            netAmount: sellerAmount,
            creatorType,
            isCustomOrder,
            orderTitle,
            stripeTransferId: null, // Sera mis à jour après le transfert
            createdAt: new Date()
        });

        const { rows } = await pool.query(
            `INSERT INTO seller_invoices
             (seller_id, invoice_number, gross_amount, commission_amount, net_amount, pdf_path)
             VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id`,
            [seller.id, sellerInvoiceNumber, priceCents, commission, sellerAmount, sellerPdfPath]
        );

        return { invoiceId: rows[0].id, sellerInvoiceNumber, sellerPdfPath };
    }

    // Effectuer le paiement Stripe Connect
    async payoutToSeller(seller, sellerAmount, paymentIntentId) {
        if (!seller.stripe_account_id) {
            console.warn("⚠️ Seller has no Stripe account:", seller.id);
            return null;
        }

        // Ne pas transférer si montant <= 0
        if (sellerAmount <= 0) {
            console.warn("⚠️ Seller amount is 0 or negative, skipping transfer");
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
    async processSeller(item, paymentId, paymentIntentId, isCustomOrder = false) {
        const seller = await this.getSeller(item.creator_id);
        if (!seller) {
            console.warn("⚠️ Seller not found:", item.creator_id);
            return;
        }

        const priceCents = Math.round(item.price * 100);
        const { commission, sellerAmount, commissionRate } = this.calculateSellerAmounts(
            priceCents,
            seller.creator_type,
            isCustomOrder
        );

        console.log(`💰 Sale: ${(priceCents/100).toFixed(2)}€`);
        console.log(`   Type: ${seller.creator_type || 'NON_AFFILIATED'}`);
        console.log(`   Commission: ${(commissionRate * 100)}% = ${(commission/100).toFixed(2)}€`);
        console.log(`   Seller gets: ${(sellerAmount/100).toFixed(2)}€`);

        // Comptes internes = pas de facture vendeur ni de transfert (le site garde tout)
        if (this.isInternalAccount(seller.creator_type)) {
            console.log(`💰 Internal sale (${seller.creator_type}) - site keeps: ${(priceCents / 100).toFixed(2)}€`);
            return;
        }

        // Facture vendeur
        await this.createSellerInvoice(
            seller,
            priceCents,
            commission,
            sellerAmount,
            seller.creator_type,
            isCustomOrder,
            item.title || null
        );

        // Paiement Stripe Connect (ne bloque pas si erreur)
        const transfer = await this.payoutToSeller(seller, sellerAmount, paymentIntentId);

        // Enregistrer le payout si transfert réussi
        if (transfer) {
            await this.recordPayout(seller.id, paymentId, item.model_id, sellerAmount, commission, transfer.id);
        }
    }
}

module.exports = new SellerService();