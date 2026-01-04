const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

// 🎨 CHARTE
const BRAND_COLOR = "#2563EB";
const DARK_COLOR  = "#111827";
const GREY_COLOR  = "#6B7280";
const LIGHT_BG    = "#F3F4F6";
const BUNDLE_COLOR = "#8B5CF6"; // Violet pour les bundles

// 📐 LAYOUT
const PAGE_LEFT  = 50;
const PAGE_RIGHT = 545;

const LOGO_WIDTH  = 90;
const LOGO_HEIGHT = 45;

module.exports = async function generateSellerNotePdf({
                                                          invoiceNumber,
                                                          seller,
                                                          grossAmount,        // centimes
                                                          commissionAmount,   // centimes
                                                          netAmount,          // centimes
                                                          stripeTransferId,
                                                          createdAt,
                                                          // Infos bundle (optionnel)
                                                          isBundle = false,
                                                          bundleTitle = null,
                                                          itemCount = 0
                                                      }) {
    const date = createdAt ? new Date(createdAt) : new Date();

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
        .text("NOTE DE PAIEMENT", 350, 45, { align: "right" });

    doc
        .fontSize(10)
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
        .text(seller.username || "Vendeur")
        .fontSize(10)
        .fillColor(GREY_COLOR)
        .text(seller.email || "");

    doc.moveDown(1);
    doc.text(`Référence Stripe : ${stripeTransferId || "—"}`);

    // ─────────────────────────
    // 📦 INFO BUNDLE (si applicable)
    // ─────────────────────────
    if (isBundle && bundleTitle) {
        doc.moveDown(1.5);

        // Badge Bundle
        const badgeY = doc.y;
        doc
            .rect(PAGE_LEFT, badgeY, PAGE_RIGHT - PAGE_LEFT, 40)
            .fill("#F3E8FF"); // Fond violet clair

        doc
            .fillColor(BUNDLE_COLOR)
            .fontSize(12)
            .font('Helvetica-Bold')
            .text("VENTE DE BUNDLE", PAGE_LEFT + 10, badgeY + 8);

        doc
            .fontSize(11)
            .font('Helvetica')
            .fillColor(DARK_COLOR)
            .text(`"${bundleTitle}" (${itemCount} produits)`, PAGE_LEFT + 10, badgeY + 24);

        doc.y = badgeY + 50;
    }

    // ─────────────────────────
    // 📊 TABLEAU RÉCAP
    // ─────────────────────────
    doc.moveDown(1.5);

    const startY = doc.y;

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

    const euro = v => `${(v / 100).toFixed(2)} €`;

    // Ligne de vente avec détail bundle si applicable
    const saleLabel = isBundle
        ? `Vente Bundle "${bundleTitle}"`
        : "Ventes réalisées";

    const lines = [
        [saleLabel, euro(grossAmount)],
        ["Commission HytModel (15%)", `- ${euro(commissionAmount)}`],
    ];

    lines.forEach(([label, value]) => {
        doc
            .fillColor(DARK_COLOR)
            .fontSize(11)
            .font('Helvetica')
            .text(label, PAGE_LEFT, doc.y, { width: 340 })
            .text(value, 400, doc.y - 11, { width: 120, align: "right" });
        doc.moveDown(0.8);
    });

    // ─────────────────────────
    // 💰 TOTAL NET PAYÉ
    // ─────────────────────────
    doc.moveDown(1.5);

    const totalY = doc.y;

    doc
        .rect(300, totalY - 8, 245, 32)
        .fill(LIGHT_BG);

    doc
        .fillColor(BRAND_COLOR)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text("TOTAL NET PAYÉ", 310, totalY);

    doc
        .fontSize(14)
        .text(
            euro(netAmount),
            300,
            totalY,
            { width: 235, align: "right" }
        );

    // ─────────────────────────
    // 🏷️ FOOTER
    // ─────────────────────────
    doc
        .moveDown(3)
        .fontSize(9)
        .font('Helvetica')
        .fillColor(GREY_COLOR)
        .text(
            "HytModel agit en tant qu'intermédiaire technique.\nCe document ne constitue pas une facture TVA.",
            PAGE_LEFT,
            doc.y,
            { width: PAGE_RIGHT - PAGE_LEFT, align: "center" }
        );

    doc.end();
    return filePath;
};