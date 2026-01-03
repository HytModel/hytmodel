// Ajouter ces routes dans admin.routes.js

// ============ SITE STATS ============

// GET /api/admin/site-stats - Stats globales du site
router.get("/site-stats", requireAuth, requireRole("STAFF", "ADMIN"), async (req, res, next) => {
    try {
        // Total des visites (depuis la table site_visits)
        const { rows: visitRows } = await pool.query(`
            SELECT 
                COUNT(*) as total_visits,
                COUNT(DISTINCT session_id) as unique_sessions
            FROM site_visits
        `);

        // Visites des 30 derniers jours
        const { rows: recentVisitRows } = await pool.query(`
            SELECT COUNT(*) as recent_visits
            FROM site_visits
            WHERE created_at >= NOW() - INTERVAL '30 days'
        `);

        // Total des téléchargements (depuis purchases)
        const { rows: downloadRows } = await pool.query(`
            SELECT COUNT(*) as total_downloads
            FROM purchases
        `);

        // Temps moyen sur le site (moyenne des sessions)
        const { rows: avgTimeRows } = await pool.query(`
            SELECT 
                AVG(duration_seconds) as avg_duration
            FROM site_visits
            WHERE duration_seconds IS NOT NULL AND duration_seconds > 0
        `);

        // Formater le temps moyen
        const avgSeconds = parseInt(avgTimeRows[0]?.avg_duration || 0);
        const avgMinutes = Math.floor(avgSeconds / 60);
        const avgSecondsRemainder = avgSeconds % 60;
        const avgTimeFormatted = `${avgMinutes}:${avgSecondsRemainder.toString().padStart(2, '0')}`;

        // Stats par jour (7 derniers jours)
        const { rows: dailyStats } = await pool.query(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as visits
            FROM site_visits
            WHERE created_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        `);

        res.json({
            totalVisits: parseInt(visitRows[0]?.total_visits || 0),
            uniqueSessions: parseInt(visitRows[0]?.unique_sessions || 0),
            recentVisits: parseInt(recentVisitRows[0]?.recent_visits || 0),
            totalDownloads: parseInt(downloadRows[0]?.total_downloads || 0),
            avgTimeOnSite: avgTimeFormatted,
            avgDurationSeconds: avgSeconds,
            dailyStats: dailyStats
        });
    } catch (error) {
        // Si la table n'existe pas encore, retourner des valeurs par défaut
        if (error.code === '42P01') {
            return res.json({
                totalVisits: 0,
                uniqueSessions: 0,
                recentVisits: 0,
                totalDownloads: 0,
                avgTimeOnSite: '0:00',
                avgDurationSeconds: 0,
                dailyStats: []
            });
        }
        next(error);
    }
});

// POST /api/tracking/visit - Enregistrer une visite
router.post("/tracking/visit", async (req, res, next) => {
    try {
        const { sessionId, page, referrer, userAgent } = req.body;
        const userId = req.user?.id || null;

        const { rows } = await pool.query(
            `INSERT INTO site_visits (session_id, user_id, page, referrer, user_agent)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [sessionId, userId, page || '/', referrer || null, userAgent || null]
        );

        res.json({ visitId: rows[0].id });
    } catch (error) {
        // Ignorer les erreurs de tracking pour ne pas impacter l'UX
        console.error('Tracking error:', error);
        res.json({ visitId: null });
    }
});

// PUT /api/tracking/visit/:id/end - Mettre à jour la durée d'une visite
router.put("/tracking/visit/:id/end", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { durationSeconds } = req.body;

        await pool.query(
            `UPDATE site_visits 
             SET duration_seconds = $1, ended_at = NOW()
             WHERE id = $2`,
            [durationSeconds, id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Tracking end error:', error);
        res.json({ success: false });
    }
});