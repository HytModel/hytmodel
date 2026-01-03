const pool = require("../db/pool");

class NotificationService {
    /**
     * Vérifie si un vendeur a atteint 1000 ventes et crée une notification
     * À appeler après chaque achat
     */
    async checkSellerMilestone(creatorId) {
        try {
            // Récupérer le vendeur et son type
            const { rows: userRows } = await pool.query(
                "SELECT id, username, creator_type FROM users WHERE id = $1",
                [creatorId]
            );

            if (!userRows[0]) return;

            const user = userRows[0];

            // Si déjà affilié ou HytStudio, pas besoin de notifier
            if (user.creator_type === 'AFFILIATED' || user.creator_type === 'HYTSTUDIO') {
                return;
            }

            // Compter les ventes totales du vendeur
            const { rows: salesRows } = await pool.query(
                `SELECT COUNT(p.id) AS total_sales
                 FROM purchases p
                 JOIN models m ON m.id = p.model_id
                 WHERE m.creator_id = $1`,
                [creatorId]
            );

            const totalSales = parseInt(salesRows[0]?.total_sales || 0);

            // Si 1000 ventes atteintes
            if (totalSales >= 1000) {
                // Vérifier si une notification existe déjà pour ce vendeur
                const { rows: existingNotif } = await pool.query(
                    "SELECT id FROM staff_notifications WHERE user_id = $1 AND type = 'ELIGIBLE_AFFILIATE'",
                    [creatorId]
                );

                if (existingNotif.length === 0) {
                    // Créer la notification
                    await pool.query(
                        `INSERT INTO staff_notifications (user_id, type, message, data)
                         VALUES ($1, $2, $3, $4)`,
                        [
                            creatorId,
                            'ELIGIBLE_AFFILIATE',
                            `${user.username} a atteint ${totalSales} ventes et est éligible au statut Affilié !`,
                            JSON.stringify({ total_sales: totalSales })
                        ]
                    );

                    console.log(`📣 Notification créée: ${user.username} éligible au statut Affilié (${totalSales} ventes)`);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du milestone:', error);
            // Ne pas faire échouer l'achat pour une erreur de notification
        }
    }

    /**
     * Récupérer toutes les notifications non lues
     */
    async getUnreadNotifications() {
        const { rows } = await pool.query(
            `SELECT n.*, u.username, u.email
             FROM staff_notifications n
             JOIN users u ON u.id = n.user_id
             WHERE n.is_read = FALSE
             ORDER BY n.created_at DESC`
        );
        return rows;
    }

    /**
     * Compter les notifications non lues
     */
    async getUnreadCount() {
        const { rows } = await pool.query(
            "SELECT COUNT(*) AS count FROM staff_notifications WHERE is_read = FALSE"
        );
        return parseInt(rows[0]?.count || 0);
    }
}

module.exports = new NotificationService();