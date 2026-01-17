const Stripe = require("stripe");
const pool = require("../db/pool");

class StripeService {
    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }

    /**
     * Vérifie si c'est un compte interne (pas de transfert)
     */
    isInternalAccount(creatorType) {
        return ['HYTSTUDIO', 'ADMIN', 'STAFF'].includes(creatorType);
    }

    /**
     * Détermine le taux de commission selon le type de créateur
     */
    getCommissionRate(creatorType, isCustomOrder = false) {
        if (this.isInternalAccount(creatorType)) return 1.0;
        if (creatorType === 'AFFILIATED' && isCustomOrder) return 0.05;
        if (creatorType === 'AFFILIATED') return 0.10;
        return 0.15;
    }

    /**
     * Calcule l'application fee
     */
    calculateApplicationFee(amountCents, creatorType, isCustomOrder = false) {
        const commissionRate = this.getCommissionRate(creatorType, isCustomOrder);
        const commission = Math.round(amountCents * commissionRate);
        return {
            applicationFee: commission,
            commission,
            commissionRate,
            sellerReceives: amountCents - commission
        };
    }

    /**
     * Récupérer les infos du créateur
     */
    async getCreatorInfo(creatorId) {
        const { rows } = await pool.query(
            `SELECT id, username, email, stripe_account_id, creator_type
             FROM users WHERE id = $1`,
            [creatorId]
        );
        return rows[0] || null;
    }

    /**
     * Créer une session de paiement pour un SEUL vendeur
     */
    async createCheckoutSessionSingleSeller(data) {
        const {
            userId,
            items,
            creatorId,
            successUrl,
            cancelUrl,
            metadata = {},
            isCustomOrder = false
        } = data;

        const creator = await this.getCreatorInfo(creatorId);
        if (!creator) {
            throw new Error(`Creator not found: ${creatorId}`);
        }

        const totalCents = items.reduce((sum, item) => {
            return sum + Math.round(Number(item.price) * 100);
        }, 0);

        const line_items = items.map(item => ({
            price_data: {
                currency: "eur",
                product_data: { name: item.title },
                unit_amount: Math.round(Number(item.price) * 100)
            },
            quantity: 1
        }));

        const { applicationFee, commission, commissionRate, sellerReceives } =
            this.calculateApplicationFee(totalCents, creator.creator_type, isCustomOrder);

        console.log(`💰 Checkout for creator ${creator.username}:`);
        console.log(`   Total: ${(totalCents/100).toFixed(2)}€`);
        console.log(`   Type: ${creator.creator_type || 'NON_AFFILIATED'}`);
        console.log(`   Commission (${(commissionRate*100)}%): ${(commission/100).toFixed(2)}€`);
        console.log(`   Seller receives: ${(sellerReceives/100).toFixed(2)}€`);

        const sessionConfig = {
            mode: "payment",
            payment_method_types: ["card"],
            line_items,
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                ...metadata,
                user_id: userId,
                creator_id: creatorId,
                creator_type: creator.creator_type,
                commission: commission,
                commission_rate: commissionRate,
                seller_receives: sellerReceives
            }
        };

        // Destination charge si compte Stripe ET pas compte interne
        if (creator.stripe_account_id && !this.isInternalAccount(creator.creator_type)) {
            sessionConfig.payment_intent_data = {
                application_fee_amount: applicationFee,
                transfer_data: {
                    destination: creator.stripe_account_id
                }
            };
            console.log(`   ✅ Destination charge to ${creator.stripe_account_id}`);
        } else if (this.isInternalAccount(creator.creator_type)) {
            console.log(`   ✅ Internal account (${creator.creator_type}) - Platform keeps all`);
        } else {
            console.log(`   ⚠️ No Stripe account - Manual transfer needed later`);
        }

        const session = await this.stripe.checkout.sessions.create(sessionConfig);
        return session;
    }

    /**
     * Créer une session de paiement pour un PANIER
     */
    async createCheckoutSession(data) {
        const { userId, cartId, items, successUrl, cancelUrl } = data;

        // Grouper les items par créateur
        const itemsByCreator = {};
        for (const item of items) {
            const creatorId = item.creator_id;
            if (!itemsByCreator[creatorId]) {
                itemsByCreator[creatorId] = [];
            }
            itemsByCreator[creatorId].push(item);
        }

        const creatorIds = Object.keys(itemsByCreator);

        // Si un seul créateur → utiliser destination charges
        if (creatorIds.length === 1) {
            return this.createCheckoutSessionSingleSeller({
                userId,
                items,
                creatorId: creatorIds[0],
                successUrl,
                cancelUrl,
                metadata: {
                    type: "cart",
                    cart_id: cartId,
                    model_ids: JSON.stringify(items.map(i => i.id))
                }
            });
        }

        // Plusieurs créateurs → paiement classique + transfers dans le webhook
        console.log(`🛒 Multi-seller cart (${creatorIds.length} sellers) - Using separate charges`);

        const line_items = items.map(item => ({
            price_data: {
                currency: "eur",
                product_data: { name: item.title },
                unit_amount: Math.round(Number(item.price) * 100)
            },
            quantity: 1
        }));

        const modelIds = items.map(i => i.id);

        const session = await this.stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items,
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                type: "cart",
                multi_seller: "true",
                user_id: userId,
                cart_id: cartId,
                model_ids: JSON.stringify(modelIds)
            }
        });

        return session;
    }

    /**
     * Créer une session pour un Bundle
     */
    async createBundleCheckoutSession(data) {
        const { userId, bundle, items, successUrl, cancelUrl } = data;

        return this.createCheckoutSessionSingleSeller({
            userId,
            items: [{
                title: `Bundle: ${bundle.title}`,
                price: bundle.final_price
            }],
            creatorId: bundle.creator_id,
            successUrl,
            cancelUrl,
            metadata: {
                type: "bundle",
                bundle_id: bundle.id,
                item_count: items.length
            }
        });
    }

    /**
     * Créer une session pour une commande sur mesure
     */
    async createCustomOrderCheckoutSession(data) {
        const {
            userId,
            order,
            amount,
            paymentType,
            successUrl,
            cancelUrl
        } = data;

        return this.createCheckoutSessionSingleSeller({
            userId,
            items: [{
                title: `${paymentType === 'first' ? 'Acompte' : 'Solde'}: ${order.request_title}`,
                price: amount
            }],
            creatorId: order.creator_id,
            successUrl,
            cancelUrl,
            isCustomOrder: true,
            metadata: {
                type: paymentType === 'first' ? 'custom_order_first' : 'custom_order_final',
                order_id: order.id
            }
        });
    }

    // Récupérer une session
    async getSession(sessionId) {
        return await this.stripe.checkout.sessions.retrieve(sessionId);
    }

    // Vérifier la signature du webhook
    constructWebhookEvent(payload, signature) {
        return this.stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    }

    // Créer un remboursement
    async createRefund(paymentIntentId, amount) {
        return await this.stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount
        });
    }

    // Transfer manuel
    async createTransfer(amount, destinationAccountId, chargeId, metadata = {}) {
        return await this.stripe.transfers.create({
            amount,
            currency: "eur",
            destination: destinationAccountId,
            source_transaction: chargeId,
            metadata
        });
    }
}

module.exports = new StripeService();