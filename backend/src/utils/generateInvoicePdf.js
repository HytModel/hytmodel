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
                                                       items = [],   // items.price = EUROS (pas centimes)
                                                       totalAmount,  // totalAmount = CENTIMES depuis Stripe
                                                       createdAt
                                                   }) {
    const safeDate = createdAt ? new Date(createdAt) : new Date();

    const displayName  = user?.username || "Client";
    const displayEmail = user?.email || "";

    // 📁 DOSSIERS
    const invoicesDir = path.join(process.cwd(), "pdf", "invoices");
    if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const fileName = `${invoiceNumber}.pdf`;
    const filePath = path.join(invoicesDir, fileName);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));

    // ─────────────────────────
    // 🧮 TOTAL TTC (depuis Stripe en centimes ou calculé depuis items en euros)
    // ─────────────────────────
    let totalEuro = 0;

    if (totalAmount) {
        // totalAmount vient de Stripe en centimes
        totalEuro = totalAmount / 100;
    } else {
        // Sinon calculer depuis les items (prix en euros)
        items.forEach(item => {
            const price = Number(item.price);
            if (Number.isFinite(price)) {
                totalEuro += price;
            }
        });
    }

    // ─────────────────────────
    // 🖼️ HEADER FIXE — LOGO
    // ─────────────────────────
    let logoBottomY = 40;

    // Chercher le logo dans plusieurs emplacements possibles
    const possibleLogoPaths = [
        path.join(process.cwd(), "assets", "logo.png"),
        path.join(process.cwd(), "public", "logo.png"),
        path.join(process.cwd(), "uploads", "logo.png"),
        path.join(process.cwd(), "..", "frontend", "public", "logo.png"),
        path.join(process.cwd(), "src", "assets", "logo.png")
    ];

    let logoPath = null;
    for (const p of possibleLogoPaths) {
        if (fs.existsSync(p)) {
            logoPath = p;
            break;
        }
    }

    if (logoPath) {
        try {
            doc.image(logoPath, PAGE_LEFT, 40, { width: LOGO_WIDTH });
            logoBottomY = 40 + LOGO_HEIGHT;
            console.log("✅ Logo loaded from:", logoPath);
        } catch (err) {
            console.warn("⚠️ Failed to load logo:", err.message);
        }
    } else {
        // Afficher le nom du site en texte si pas de logo
        doc
            .fillColor(BRAND_COLOR)
            .fontSize(24)
            .font('Helvetica-Bold')
            .text("HytModel", PAGE_LEFT, 45);
        logoBottomY = 75;
        console.warn("⚠️ Logo not found, using text fallback");
    }

    // ─────────────────────────
    // 🧾 HEADER FIXE — FACTURE
    // ─────────────────────────
    doc
        .fillColor(DARK_COLOR)
        .fontSize(22)
        .font('Helvetica-Bold')
        .text("FACTURE", 350, 45, { align: "right" });

    doc
        .fontSize(10)
        .font('Helvetica')
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
        .font('Helvetica-Bold')
        .text(displayName, clientX)
        .fontSize(10)
        .font('Helvetica')
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
        .font('Helvetica-Bold')
        .text("Désignation", COL_ITEM_X, headerY)
        .text("Prix", COL_PRICE_X, headerY, {
            width: COL_PRICE_W,
            align: "right"
        });

    doc.moveDown(1);

    items.forEach(item => {
        // item.price est en EUROS (pas en centimes)
        const priceEuro = Number(item.price) || 0;

        const rowY = doc.y;

        doc
            .fillColor(DARK_COLOR)
            .fontSize(11)
            .font('Helvetica')
            .text(item.title || "Item", COL_ITEM_X, rowY, {
                width: COL_PRICE_X - COL_ITEM_X - 10
            });

        doc
            .text(`${priceEuro.toFixed(2)} €`, COL_PRICE_X, rowY, {
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

    doc
        .rect(TOTAL_BOX_X, totalY - 8, TOTAL_BOX_W, 32)
        .fill(LIGHT_BG);

    doc
        .fillColor(BRAND_COLOR)
        .fontSize(12)
        .font('Helvetica-Bold')
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
        .font('Helvetica')
        .fillColor(GREY_COLOR)
        .text(
            "HytModel • Marketplace de produits 3D\nhttps://hytmodel.fr",
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