const pool = require("../db/pool");

/**
 * Génère un numéro de facture incrémental par année
 * Format : HMT-2025-00001
 */
module.exports = async function generateInvoiceNumber() {
    const year = new Date().getFullYear();

    const { rows } = await pool.query(
        `
    INSERT INTO invoice_counters (year, last_number)
    VALUES ($1, 1)
    ON CONFLICT (year)
    DO UPDATE SET last_number = invoice_counters.last_number + 1
    RETURNING last_number
    `,
        [year]
    );

    const number = String(rows[0].last_number).padStart(5, "0");

    return `HMT-${year}-${number}`;
};
