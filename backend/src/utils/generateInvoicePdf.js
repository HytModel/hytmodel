const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

// 🎨 CHARTE GRAPHIQUE
const BRAND_COLOR = "#2563EB";
const DARK_COLOR  = "#111827";
const GREY_COLOR  = "#6B7280";
const LIGHT_BG    = "#F3F4F6";

// 🖼️ LOGO
const LOGO_WIDTH  = 90;
const LOGO_HEIGHT = 45;

// 📐 LAYOUT
const CONTENT_PADDING_TOP = 80;
const PAGE_LEFT  = 50;
const PAGE_RIGHT = 545;

// 📊 COLONNES
const COL_ITEM_X  = 50;
const COL_PRICE_X = 400;
const COL_PRICE_W = 120;

// TOTAL
const TOTAL_BOX_X = 300;
const TOTAL_BOX_W = 245;

module.exports = async function generateInvoicePdf({
                                                       invoiceNumber,
                                                       user,
                                                       items = [],   // items.price = CENTIMES (integer)
                                                       createdAt
                                                   }) {
    const safeDate = createdAt ? new Date(createdAt) : new Date();

    const displayName  = user?.username || "Client";
    const displayEmail = user?.email || "";

    // 📁 DOSSIERS
    const invoicesDir = path.join(process.cwd(), "backend", "pdf", "invoices");
    if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const fileName = `${invoiceNumber}.pdf`;
    const filePath = path.join(invoicesDir, fileName);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));

    // ─────────────────────────
    // 🧮 TOTAL TTC (CENTIMES)
    // ─────────────────────────
    let totalCents = 0;
    items.forEach(item => {
        const priceCents = Number(item.price);
        if (Number.isFinite(priceCents)) {
            totalCents += priceCents;
        }
    });

    // ─────────────────────────
    // 🖼️ HEADER FIXE — LOGO
    // ─────────────────────────
    let logoBottomY = 40;
    const logoPath = path.join(process.cwd(), "assets", "logo-hytmodels.png");

    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, PAGE_LEFT, 40, { width: LOGO_WIDTH });
        logoBottomY = 40 + LOGO_HEIGHT;
    }

    // ─────────────────────────
    // 🧾 HEADER FIXE — FACTURE
    // ─────────────────────────
    doc
        .fillColor(DARK_COLOR)
        .fontSize(22)
        .text("FACTURE", 350, 45, { align: "right" });

    doc
        .fontSize(10)
        .fillColor(GREY_COLOR)
        .text(invoiceNumber, { align: "right" })
        .text(safeDate.toLocaleDateString("fr-FR"), { align: "right" });

    // ─────────────────────────
    // 📐 DÉBUT CONTENU
    // ─────────────────────────
    const CONTENT_START_Y = logoBottomY + CONTENT_PADDING_TOP;
    doc.y = CONTENT_START_Y;

    doc
        .moveTo(PAGE_LEFT, CONTENT_START_Y)
        .lineTo(PAGE_RIGHT, CONTENT_START_Y)
        .lineWidth(3)
        .stroke(BRAND_COLOR);

    doc.moveDown(2);

    // ─────────────────────────
    // 👤 CLIENT
    // ─────────────────────────
    const clientX = 350;

    doc
        .fontSize(10)
        .fillColor(GREY_COLOR)
        .text("FACTURÉ À", clientX)
        .moveDown(0.3)
        .fontSize(12)
        .fillColor(DARK_COLOR)
        .text(displayName, clientX)
        .fontSize(10)
        .fillColor(GREY_COLOR)
        .text(displayEmail, clientX);

    // ─────────────────────────
    // 📦 TABLE DES ITEMS
    // ─────────────────────────
    doc.moveDown(2);

    const headerY = doc.y;

    doc
        .rect(PAGE_LEFT - 5, headerY - 5, PAGE_RIGHT - PAGE_LEFT + 10, 24)
        .fill(LIGHT_BG);

    doc
        .fillColor(BRAND_COLOR)
        .fontSize(12)
        .text("Désignation", COL_ITEM_X, headerY)
        .text("Prix", COL_PRICE_X, headerY, {
            width: COL_PRICE_W,
            align: "right"
        });

    doc.moveDown(1);

    items.forEach(item => {
        const priceCents = Number(item.price) || 0;
        const priceEuro  = priceCents / 10000;

        doc
            .fillColor(DARK_COLOR)
            .fontSize(11)
            .text(item.title || "Item", COL_ITEM_X, doc.y, {
                width: COL_PRICE_X - COL_ITEM_X - 10
            })
            .text(`${priceEuro.toFixed(2)} €`, COL_PRICE_X, doc.y, {
                width: COL_PRICE_W,
                align: "right"
            });

        doc.moveDown(0.8);
    });

    // ─────────────────────────
    // 💰 TOTAL TTC
    // ─────────────────────────
    doc.moveDown(1.5);

    const totalY = doc.y;
    const totalEuro = totalCents / 10000;

    doc
        .rect(TOTAL_BOX_X, totalY - 8, TOTAL_BOX_W, 32)
        .fill(LIGHT_BG);

    doc
        .fillColor(BRAND_COLOR)
        .fontSize(12)
        .text("TOTAL TTC", TOTAL_BOX_X + 10, totalY);

    doc
        .fontSize(14)
        .text(
            `${totalEuro.toFixed(2)} €`,
            TOTAL_BOX_X,
            totalY,
            {
                width: TOTAL_BOX_W - 10,
                align: "right"
            }
        );

    // ─────────────────────────
    // 🏷️ FOOTER
    // ─────────────────────────
    doc
        .moveDown(3)
        .fontSize(9)
        .fillColor(GREY_COLOR)
        .text(
            "HytModel • Marketplace de modèles 3D\nhttps://hytmodel.fr",
            PAGE_LEFT,
            doc.y,
            {
                width: PAGE_RIGHT - PAGE_LEFT,
                align: "center"
            }
        );

    doc.end();

    console.log("📄 Invoice PDF generated:", filePath);
    return filePath;
};
