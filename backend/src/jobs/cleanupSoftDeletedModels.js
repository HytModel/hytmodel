const pool = require("../db/pool");
const fs = require("fs");
const path = require("path");

async function cleanupSoftDeletedModels() {
    console.log("🧹 Cleanup job started...");

    const { rows } = await pool.query(`
        SELECT id, file_path
        FROM models
        WHERE deleted_at IS NOT NULL
          AND deleted_at < NOW() - INTERVAL '1 year'
    `);

    for (const model of rows) {
        // 🗑️ Supprimer le fichier
        if (model.file_path) {
            const absolutePath = path.resolve(model.file_path);
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
            }
        }

        // 🧹 Nettoyage relations
        await pool.query("DELETE FROM model_tags WHERE model_id = $1", [model.id]);
        await pool.query("DELETE FROM model_reviews WHERE model_id = $1", [model.id]);
        await pool.query("DELETE FROM cart_items WHERE model_id = $1", [model.id]);
        await pool.query("DELETE FROM model_stats WHERE model_id = $1", [model.id]);

        // 🔥 Suppression définitive
        await pool.query("DELETE FROM models WHERE id = $1", [model.id]);

        console.log(`🔥 Model ${model.id} permanently deleted`);
    }

    console.log(`✅ Cleanup done (${rows.length} models)`);
}

module.exports = { cleanupSoftDeletedModels };