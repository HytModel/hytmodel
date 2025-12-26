const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.query("select 1")
    .then(() => console.log("✅ PostgreSQL connecté à Node.js"))
    .catch(err => console.error("❌ PostgreSQL erreur", err));

module.exports = pool;