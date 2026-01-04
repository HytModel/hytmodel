// Créer une instance axios configurée
import axios from 'axios'

// URL du backend
const api = axios.create({
    baseURL: 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

// Intercepteur : ajoute le token JWT à chaque requête
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Intercepteur : gère les erreurs (ex: token expiré)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            // Optionnel : rediriger vers login
        }
        return Promise.reject(error)
    }
)

// ============ AUTH ============
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    me: () => api.get('/auth/me')
}

// ============ NOTIFICATIONS ============
export const notificationsAPI = {
    getAll: () => api.get('/notifications'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`),
}

// ============ MODELS ============
export const modelsAPI = {
    // Liste et recherche
    getAll: () => api.get('/models'),
    getById: (id) => api.get(`/models/${id}/details`),
    search: (params) => api.get('/models/search', { params }),
    searchAdvanced: (params) => api.get('/models/search-advanced', { params }),

    // Actions créateur
    upload: (formData) => api.post('/models/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getMyProducts: () => api.get('/models/my-products'),
    uploadDetailed: (formData) => api.post('/models/upload-detailed', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/models/${id}`, data),
    delete: (id) => api.delete(`/models/${id}`),

    // Actions utilisateur
    download: (id) => api.get(`/models/${id}/download`, { responseType: 'blob' }),
    checkPurchase: (id) => api.get(`/models/${id}/check-purchase`),
    rate: (id, rating) => api.post(`/models/${id}/rate`, { rating }),
    getStats: (id) => api.get(`/models/${id}/stats`),

    // Actions staff
    trackView: (modelId, sessionId) => api.post(`/models/${modelId}/view`, { sessionId }),
    approve: (id) => api.post(`/models/${id}/approve`),
    reject: (id) => api.post(`/models/${id}/reject`),
    hide: (id, reason) => api.post(`/models/${id}/hide`, { reason }),
    unhide: (id) => api.post(`/models/${id}/unhide`)
}

// ============ CART ============
export const cartAPI = {
    get: () => api.get('/cart'),
    add: (modelId) => api.post(`/cart/add/${modelId}`),
    remove: (modelId) => api.delete(`/cart/remove/${modelId}`),
    clear: () => api.delete('/cart/clear')
}

// ============ CHECKOUT ============
export const checkoutAPI = {
    create: () => api.post('/checkout'),
    getPurchases: () => api.get('/checkout/purchases')
}

// ============ INVOICES ============
export const invoicesAPI = {
    getMine: () => api.get('/invoices/me'),
    download: (id) => api.get(`/invoices/${id}/download`, { responseType: 'blob' }),
    getSellerInvoices: () => api.get('/invoices/seller/me'),
    downloadSeller: (id) => api.get(`/invoices/seller/${id}/download`, { responseType: 'blob' })
}

// ============ GAMES ============
export const gamesAPI = {
    getAll: () => api.get('/games'),
    getById: (id) => api.get(`/games/${id}`),
    getBySlug: (slug) => api.get(`/games/slug/${slug}`),
    create: (formData) => api.post('/games', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, formData) => api.put(`/games/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/games/${id}`)
}

// ============ CATEGORIES ============
export const categoriesAPI = {
    getAll: () => api.get('/categories'),
    getByGame: (gameId) => api.get(`/categories/game/${gameId}`),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`)
}

// ============ TAGS ============
export const tagsAPI = {
    getAll: () => api.get('/tags'),
    getByGame: (gameId) => api.get(`/tags/game/${gameId}`),
    getGlobal: () => api.get('/tags/global'),
    create: (data) => api.post('/tags', data),
    update: (id, data) => api.put(`/tags/${id}`, data),
    delete: (id) => api.delete(`/tags/${id}`)
}

// ============ VERSIONS ============
export const versionsAPI = {
    getAll: () => api.get('/versions'),
    getByGame: (gameId) => api.get(`/versions/game/${gameId}`),
    getByCategory: (categoryId) => api.get(`/versions/category/${categoryId}`),
    create: (data) => api.post('/versions', data),
    update: (id, data) => api.put(`/versions/${id}`, data),
    delete: (id) => api.delete(`/versions/${id}`)
}
// ============ MODEL FILE VERSIONS ============
export const modelFileVersionsAPI = {
    // Obtenir toutes les versions d'un produit
    getByModel: (modelId, gameVersionId = null) => {
        const params = gameVersionId ? `?gameVersionId=${gameVersionId}` : '';
        return api.get(`/model-versions/${modelId}${params}`);
    },

    // Obtenir la dernière version (ou la dernière compatible avec une version du jeu)
    getLatest: (modelId, gameVersionId = null) => {
        const params = gameVersionId ? `?gameVersionId=${gameVersionId}` : '';
        return api.get(`/model-versions/${modelId}/latest${params}`);
    },

    // Télécharger une version spécifique
    download: (modelId, versionId) =>
        api.get(`/model-versions/${modelId}/download/${versionId}`, { responseType: 'blob' }),

    // Vendeur: Ajouter une nouvelle version
    create: (modelId, formData) =>
        api.post(`/model-versions/${modelId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    // Vendeur: Modifier une version
    update: (modelId, versionId, data) =>
        api.put(`/model-versions/${modelId}/${versionId}`, data),

    // Vendeur: Supprimer une version
    delete: (modelId, versionId) =>
        api.delete(`/model-versions/${modelId}/${versionId}`),

    // Vendeur: Définir comme version principale
    setLatest: (modelId, versionId) =>
        api.post(`/model-versions/${modelId}/${versionId}/set-latest`),
}

// ============ SELLER DASHBOARD ============
export const sellerAPI = {
    getStats: () => api.get('/seller/dashboard/stats'),
    getChart: (days = 30) => api.get(`/seller/dashboard/chart?days=${days}`),
    getSales: (limit = 20) => api.get(`/seller/dashboard/sales?limit=${limit}`),
    getTopModels: (days = 30) => api.get(`/seller/dashboard/top-models?days=${days}`)
}

// ============ PROPOSITIONS & SIGNALEMENTS ============
export const feedbackAPI = {
    // Propositions (vendeurs)
    createProposal: (data) => api.post('/feedback/proposals', data),
    getMyProposals: () => api.get('/feedback/proposals/me'),

    // Signalements
    reportProduct: (data) => api.post('/feedback/reports', data),
    getMyReports: () => api.get('/feedback/reports/me'),
    getProductReports: (modelId) => api.get(`/feedback/reports/model/${modelId}`),

    // Vendeur - voir et répondre aux signalements
    getReportsByModel: (modelId) => api.get(`/feedback/reports/model/${modelId}`),
    respondToReport: (reportId, response) => api.post(`/feedback/reports/${reportId}/respond`, { response }),
}
// Propositions vendeurs API
export const proposalsAPI = {
    // Vendeur - Mes propositions
    getMy: () => api.get('/proposals/my'),

    // Vendeur - Créer une proposition
    create: (data) => api.post('/proposals', data),
    // data = { proposalType: 'CATEGORY'|'TAG'|'VERSION', gameId?: string, name: string, description?: string }

    // Vendeur - Supprimer ma proposition (si en attente)
    delete: (id) => api.delete(`/proposals/${id}`),

    // Admin - Toutes les propositions
    getAll: (params = {}) => {
        const query = new URLSearchParams();
        if (params.status) query.append('status', params.status);
        if (params.type) query.append('type', params.type);
        return api.get(`/proposals?${query.toString()}`);
    },

    // Admin - Nombre en attente
    getPendingCount: () => api.get('/proposals/pending/count'),

    // Admin - Approuver
    approve: (id) => api.post(`/proposals/${id}/approve`),

    // Admin - Refuser
    reject: (id, reason) => api.post(`/proposals/${id}/reject`, { reason }),
}

// ============ ADMIN ============
export const adminAPI = {
    // Users

    getUsers: (params) => api.get('/admin/users', { params }),
    getUser: (id) => api.get(`/admin/users/${id}`),
    setRole: (userId, role) => api.post('/admin/set-role', { userId, role }),
    banUser: (id) => api.post(`/admin/users/${id}/ban`),
    unbanUser: (id) => api.post(`/admin/users/${id}/unban`),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),

    // Models
    getAllModels: (params) => api.get('/admin/models/all', { params }),
    getPendingModels: () => api.get('/admin/models/pending'),

    // Demandes créateur
    getCreatorRequests: () => api.get('/admin/creator-requests'),
    approveCreatorRequest: (id, creatorType) => api.post(`/admin/creator-requests/${id}/approve`, { creatorType }),
    rejectCreatorRequest: (id, reason) => api.post(`/admin/creator-requests/${id}/reject`, { reason }),


    // Vendeurs
    getSellers: () => api.get('/admin/sellers'),
    getSellersStats: () => api.get('/admin/sellers/stats'),
    updateCreatorType: (id, creatorType) => api.put(`/admin/sellers/${id}/type`, { creatorType }),
    getEligibleAffiliate: () => api.get('/admin/sellers/eligible-affiliate'),

    // Notifications
    getNotifications: () => api.get('/admin/notifications'),
    markNotificationRead: (id) => api.put(`/admin/notifications/${id}/read`),
    deleteNotification: (id) => api.delete(`/admin/notifications/${id}`),

    // Propositions (admin)
    getProposals: (status) => api.get(`/proposals${status ? `?status=${status}` : ''}`),
    approveProposal: (id) => api.post(`/proposals/${id}/approve`),
    rejectProposal: (id, reason) => api.post(`/proposals/${id}/reject`, { reason }),


    // Signalements (admin)
    getReports: (status) => api.get('/feedback/reports', { params: { status } }),
    updateReport: (id, data) => api.put(`/feedback/reports/${id}`, data),

    // Analytics avec filtre optionnel par jeu
    getAnalytics: (period = '30', gameId = '') => {
        const params = new URLSearchParams({ period });
        if (gameId) params.append('gameId', gameId);
        return api.get(`/admin/analytics?${params.toString()}`);
    },

    // Analytics détaillées pour un jeu spécifique
    getGameAnalytics: (gameId, period = '30') =>
        api.get(`/admin/game-analytics/${gameId}?period=${period}`),

    // Stats & Dashboard
    getSiteStats: () => api.get('/admin/site-stats'),
    getStats: () => api.get('/admin/stats'),
    getDashboardStats: () => api.get('/admin/dashboard/stats'),
    getRevenueChart: (days = 30) => api.get(`/admin/dashboard/chart?days=${days}`),
    getSellerStats: (days = 30) => api.get(`/admin/dashboard/sellers?days=${days}`),
    getTopModels: (days = 30) => api.get(`/admin/dashboard/top-models?days=${days}`)
}

// ============ CREATOR REQUEST (pour les utilisateurs) ============
export const creatorRequestAPI = {
    // Demander à devenir créateur
    request: (data) => api.post('/creator-request', data),
    // Voir le statut de ma demande
    getMyRequest: () => api.get('/creator-request/me')
}

// ============ MODEL IMAGES ============
export const modelImagesAPI = {
    getByModel: (modelId) => api.get(`/model-images/${modelId}`),
    upload: (modelId, formData) => api.post(`/model-images/${modelId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    setPrimary: (imageId) => api.put(`/model-images/${imageId}/primary`),
    delete: (imageId) => api.delete(`/model-images/${imageId}`),
    reorder: (modelId, imageIds) => api.put(`/model-images/${modelId}/reorder`, { imageIds })
}

// ============ STRIPE ============
export const stripeAPI = {
    createConnectAccount: () => api.post('/stripe/connect/create')
}



export default api