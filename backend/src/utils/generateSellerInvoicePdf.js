const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

// 🎨 CHARTE
const BRAND_COLOR = "#2563EB";
const DARK_COLOR  = "#111827";
const GREY_COLOR  = "#6B7280";
const LIGHT_BG    = "#F3F4F6";
const BUNDLE_COLOR = "#8B5CF6";    // Violet pour les bundles
const CUSTOM_COLOR = "#10B981";    // Vert pour les commandes sur mesure

// 📐 LAYOUT
const PAGE_LEFT  = 50;
const PAGE_RIGHT = 545;
const LOGO_WIDTH  = 90;
const LOGO_HEIGHT = 45;

/**
 * Détermine le taux de commission selon le contexte
 * @param {string} creatorType - 'HYTSTUDIO', 'ADMIN', 'STAFF', 'AFFILIATED', ou null
 * @param {boolean} isCustomOrder - Est-ce une commande sur mesure ?
 * @returns {number} Taux de commission (0, 0.05, 0.10, ou 0.15)
 */
function getCommissionRate(creatorType, isCustomOrder) {
    // Comptes internes (HytStudio / Admin / Staff) → 0% (pas de commission, c'est nous)
    if (['HYTSTUDIO', 'ADMIN', 'STAFF'].includes(creatorType)) return 0;

    // Affilié + Commande sur mesure → 5%
    if (creatorType === 'AFFILIATED' && isCustomOrder) return 0.05;

    // Affilié + Produit normal → 10%
    if (creatorType === 'AFFILIATED') return 0.10;

    // Non-affilié → 15%
    return 0.15;
}

module.exports = async function generateSellerNotePdf({
                                                          invoiceNumber,
                                                          seller,
                                                          grossAmount,                    // centimes (prix de vente)
                                                          stripeTransferId,
                                                          createdAt,
                                                          creatorType = null,             // 'HYTSTUDIO', 'AFFILIATED', ou null
                                                          // Infos bundle (optionnel)
                                                          isBundle = false,
                                                          bundleTitle = null,
                                                          itemCount = 0,
                                                          // Infos commande sur mesure (optionnel)
                                                          isCustomOrder = false,
                                                          orderTitle = null,
                                                          // ⚠️ Ces paramètres sont calculés automatiquement si non fournis
                                                          commissionRate = null,          // Taux de commission (calculé si null)
                                                          commissionAmount = null,        // Montant commission en centimes (calculé si null)
                                                          netAmount = null                // Montant net en centimes (calculé si null)
                                                      }) {
    const date = createdAt ? new Date(createdAt) : new Date();

    // ─────────────────────────
    // 💰 CALCULS AUTOMATIQUES
    // ─────────────────────────

    // Taux de commission selon le type de créateur
    const calculatedCommissionRate = commissionRate ?? getCommissionRate(creatorType, isCustomOrder);

    // Montant de la commission (sur le prix brut)
    const calculatedCommissionAmount = commissionAmount ?? Math.round(grossAmount * calculatedCommissionRate);

    // Montant net final = Brut - Commission
    const calculatedNetAmount = netAmount ?? (grossAmount - calculatedCommissionAmount);

    // 📁 DOSSIER
    const dir = path.join(process.cwd(), "pdf", "seller-invoices");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `${invoiceNumber}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));

    // ─────────────────────────
    // 🖼️ LOGO
    // ─────────────────────────
    let logoBottomY = 40;
    const logoPath = path.join(process.cwd(), "assets", "logo.png");

    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, PAGE_LEFT, 40, { width: LOGO_WIDTH });
        logoBottomY = 40 + LOGO_HEIGHT;
    }

    // ─────────────────────────
    // 🧾 TITRE
    // ─────────────────────────
    doc
        .fillColor(DARK_COLOR)
        .fontSize(22)
        .font('Helvetica-Bold')
        .text("NOTE DE PAIEMENT", 350, 45, { align: "right" });

    doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor(GREY_COLOR)
        .text(invoiceNumber, { align: "right" })
        .text(date.toLocaleDateString("fr-FR"), { align: "right" });

    // ─────────────────────────
    // LIGNE SÉPARATION
    // ─────────────────────────
    const CONTENT_START_Y = logoBottomY + 60;

    doc
        .moveTo(PAGE_LEFT, CONTENT_START_Y)
        .lineTo(PAGE_RIGHT, CONTENT_START_Y)
        .lineWidth(3)
        .stroke(BRAND_COLOR);

    doc.y = CONTENT_START_Y + 25;

    // ─────────────────────────
    // 👤 VENDEUR
    // ─────────────────────────
    doc
        .fontSize(10)
        .fillColor(GREY_COLOR)
        .text("VERSEMENT À");

    doc
        .fontSize(12)
        .fillColor(DARK_COLOR)
        .font('Helvetica-Bold')
        .text(seller.username || "Vendeur")
        .font('Helvetica')
        .fontSize(10)
        .fillColor(GREY_COLOR)
        .text(seller.email || "");

    // Afficher le type de créateur avec badge coloré
    if (creatorType) {
        const typeConfig = {
            'HYTSTUDIO': { label: 'HytStudio', color: BRAND_COLOR },
            'ADMIN': { label: 'Admin', color: BRAND_COLOR },
            'STAFF': { label: 'Staff', color: BRAND_COLOR },
            'AFFILIATED': { label: 'Créateur Affilié', color: CUSTOM_COLOR }
        };
        const config = typeConfig[creatorType] || { label: 'Créateur', color: GREY_COLOR };

        doc
            .fontSize(9)
            .fillColor(config.color)
            .text(`Statut : ${config.label}`);
    }

    doc.moveDown(1);
    doc.fillColor(GREY_COLOR).text(`Référence Stripe : ${stripeTransferId || "—"}`);

    // ─────────────────────────
    // 📦 INFO BUNDLE (si applicable)
    // ─────────────────────────
    if (isBundle && bundleTitle) {
        doc.moveDown(1.5);

        const badgeY = doc.y;
        doc
            .rect(PAGE_LEFT, badgeY, PAGE_RIGHT - PAGE_LEFT, 40)
            .fill("#F3E8FF");

        doc
            .fillColor(BUNDLE_COLOR)
            .fontSize(12)
            .font('Helvetica-Bold')
            .text("VENTE DE BUNDLE", PAGE_LEFT + 10, badgeY + 8);

        doc
            .fontSize(11)
            .font('Helvetica')
            .fillColor(DARK_COLOR)
            .text(`"${bundleTitle}" (${itemCount} produit${itemCount > 1 ? 's' : ''})`, PAGE_LEFT + 10, badgeY + 24);

        doc.y = badgeY + 50;
    }

    // ─────────────────────────
    // 🎨 INFO COMMANDE SUR MESURE (si applicable)
    // ─────────────────────────
    if (isCustomOrder && orderTitle) {
        doc.moveDown(1.5);

        const badgeY = doc.y;
        doc
            .rect(PAGE_LEFT, badgeY, PAGE_RIGHT - PAGE_LEFT, 40)
            .fill("#D1FAE5");

        doc
            .fillColor(CUSTOM_COLOR)
            .fontSize(12)
            .font('Helvetica-Bold')
            .text("COMMANDE SUR MESURE", PAGE_LEFT + 10, badgeY + 8);

        doc
            .fontSize(11)
            .font('Helvetica')
            .fillColor(DARK_COLOR)
            .text(`"${orderTitle}"`, PAGE_LEFT + 10, badgeY + 24);

        doc.y = badgeY + 50;
    }

    // ─────────────────────────
    // 📊 TABLEAU RÉCAP
    // ─────────────────────────
    doc.moveDown(1.5);

    const startY = doc.y;

    // En-tête du tableau
    doc
        .rect(PAGE_LEFT - 5, startY - 5, PAGE_RIGHT - PAGE_LEFT + 10, 24)
        .fill(LIGHT_BG);

    doc
        .fillColor(BRAND_COLOR)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text("Désignation", PAGE_LEFT, startY)
        .text("Montant", 400, startY, { width: 120, align: "right" });

    doc.moveDown(1);

    // Fonction pour formater en euros
    const euro = v => `${(v / 100).toFixed(2)} €`;

    // Déterminer le label de vente
    let saleLabel;
    if (isCustomOrder && orderTitle) {
        saleLabel = `Commande sur mesure "${orderTitle}"`;
    } else if (isBundle && bundleTitle) {
        saleLabel = `Vente Bundle "${bundleTitle}"`;
    } else {
        saleLabel = "Vente réalisée";
    }

    // Commission en pourcentage
    const commissionPercent = Math.round(calculatedCommissionRate * 100);

    // ─────────────────────────
    // 📝 LIGNES DU TABLEAU
    // ─────────────────────────

    // Fonction pour dessiner une ligne
    const drawLine = (label, value, options = {}) => {
        const { color = DARK_COLOR, italic = false } = options;

        doc
            .fillColor(color)
            .fontSize(11)
            .font(italic ? 'Helvetica-Oblique' : 'Helvetica')
            .text(label, PAGE_LEFT, doc.y, { width: 340 });

        doc
            .fillColor(color)
            .text(value, 400, doc.y - 13, { width: 120, align: "right" });

        doc.moveDown(0.8);
    };

    // 1️⃣ Prix de vente brut
    drawLine(saleLabel, euro(grossAmount));

    // 2️⃣ Commission HytStore
    if (calculatedCommissionRate > 0) {
        drawLine(
            `Commission HytStore (${commissionPercent}%)`,
            `- ${euro(calculatedCommissionAmount)}`,
            { color: BRAND_COLOR }
        );
    } else {
        // Montrer que la commission est à 0% pour HytStudio
        drawLine(
            `Commission HytStore (0%)`,
            `- ${euro(0)}`,
            { color: CUSTOM_COLOR }
        );
    }

    // ─────────────────────────
    // 💰 TOTAL NET PAYÉ
    // ─────────────────────────
    doc.moveDown(1.5);

    const totalY = doc.y;

    // Box pour le total
    doc
        .rect(250, totalY - 10, 300, 45)
        .fill(LIGHT_BG);

    doc
        .fillColor(BRAND_COLOR)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text("MONTANT NET VERSÉ", 260, totalY);

    doc
        .fillColor(DARK_COLOR)
        .fontSize(18)
        .font('Helvetica-Bold')
        .text(
            euro(calculatedNetAmount),
            260,
            totalY + 18,
            { width: 280, align: "right" }
        );

    // ─────────────────────────
    // 📋 RÉCAPITULATIF VISUEL
    // ─────────────────────────
    doc.y = totalY + 60;
    doc.moveDown(1);

    // Mini-récap visuel du calcul
    doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor(GREY_COLOR);

    const recapY = doc.y;

    doc
        .rect(PAGE_LEFT, recapY, PAGE_RIGHT - PAGE_LEFT, 40)
        .fill("#FAFAFA");

    doc
        .fillColor(GREY_COLOR)
        .text("Détail du calcul :", PAGE_LEFT + 10, recapY + 8);

    doc
        .fontSize(8)
        .text(
            `${euro(grossAmount)} (vente) − ${euro(calculatedCommissionAmount)} (commission ${commissionPercent}%) = ${euro(calculatedNetAmount)}`,
            PAGE_LEFT + 10,
            recapY + 22,
            { width: PAGE_RIGHT - PAGE_LEFT - 20 }
        );

    doc.y = recapY + 50;

    // ─────────────────────────
    // 🏷️ FOOTER
    // ─────────────────────────
    doc
        .moveDown(2)
        .fontSize(9)
        .font('Helvetica')
        .fillColor(GREY_COLOR)
        .text(
            "HytStore agit en tant qu'intermédiaire technique.\nCe document ne constitue pas une facture TVA.",
            PAGE_LEFT,
            doc.y,
            { width: PAGE_RIGHT - PAGE_LEFT, align: "center" }
        );

    doc.end();
    return filePath;
};