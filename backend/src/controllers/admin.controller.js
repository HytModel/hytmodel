const adminService = require("../services/admin.service");

class AdminController {
    // Changer le rôle d'un utilisateur
    async setUserRole(req, res, next) {
        try {
            const { userId, role } = req.body;

            if (!userId || !role) {
                return res.status(400).json({ error: "Missing userId or role" });
            }

            await adminService.setUserRole(userId, role);
            res.json({ success: true });
        } catch (error) {
            if (error.message === "Invalid role") {
                return res.status(400).json({ error: error.message });
            }
            next(error);
        }
    }

    // Lister tous les utilisateurs
    async getAllUsers(req, res, next) {
        try {
            const { role, search, limit, offset } = req.query;
            const users = await adminService.getAllUsers({ role, search, limit, offset });

            res.json({ users });
        } catch (error) {
            next(error);
        }
    }

    // Récupérer un utilisateur
    async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await adminService.getUserById(id);

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            res.json({ user });
        } catch (error) {
            next(error);
        }
    }

    // Bannir un utilisateur
    async banUser(req, res, next) {
        try {
            const { id } = req.params;
            await adminService.toggleUserBan(id, true);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    // Débannir un utilisateur
    async unbanUser(req, res, next) {
        try {
            const { id } = req.params;
            await adminService.toggleUserBan(id, false);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    // Statistiques globales
    async getGlobalStats(req, res, next) {
        try {
            const stats = await adminService.getGlobalStats();
            res.json({ stats });
        } catch (error) {
            next(error);
        }
    }

    // Modèles en attente
    async getPendingModels(req, res, next) {
        try {
            const models = await adminService.getPendingModels();
            res.json({ models });
        } catch (error) {
            next(error);
        }
    }

    // Supprimer un utilisateur
    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            await adminService.deleteUser(id);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminController();