const pool = require("../db/pool");

async function getOrCreateCart(userId) {
    let { rows } = await pool.query(
        "SELECT id FROM carts WHERE user_id = $1",
        [userId]
    );

    if (rows.length) {
        return rows[0].id;
    }

    const result = await pool.query(
        "INSERT INTO carts (user_id) VALUES ($1) RETURNING id",
        [userId]
    );

    return result.rows[0].id;
}

module.exports = { getOrCreateCart };