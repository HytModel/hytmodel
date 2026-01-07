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

// ==================== BUNDLES API ====================
// Ajouter dans api.js

export const bundlesAPI = {
    // Mes bundles (vendeur)
    getMy: () => api.get('/bundles/my'),

    // Créer un bundle
    create: (data) => api.post('/bundles', data),

    // Modifier un bundle
    update: (id, data) => api.put(`/bundles/${id}`, data),

    // Supprimer un bundle
    delete: (id) => api.delete(`/bundles/${id}`),

    // Liste des bundles actifs (public)
    getAll: (params) => api.get('/bundles', { params }),

    // Détails d'un bundle
    getById: (id) => api.get(`/bundles/${id}`),

    // Acheter un bundle
    purchase: (id) => api.post(`/bundles/${id}/purchase`),

    // Vérifier si acheté
    checkPurchase: (id) => api.get(`/bundles/check/${id}`),
}


export const modelDependenciesAPI = {
    // Obtenir les dépendances d'un produit
    getByModel: (modelId) => api.get(`/model-dependencies/${modelId}`),

    // Obtenir les produits qui dépendent de celui-ci
    getDependents: (modelId) => api.get(`/model-dependencies/${modelId}/dependents`),

    // Rechercher des produits pour ajouter comme dépendance
    searchProducts: (params) => api.get('/model-dependencies/search/products', { params }),

    // Ajouter une dépendance
    add: (modelId, data) => api.post(`/model-dependencies/${modelId}`, data),
    // data = { dependencyId, isRequired, note }

    // Modifier une dépendance
    update: (modelId, dependencyId, data) => api.put(`/model-dependencies/${modelId}/${dependencyId}`, data),

    // Supprimer une dépendance
    delete: (modelId, dependencyId) => api.delete(`/model-dependencies/${modelId}/${dependencyId}`),
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

// ==================== PROFILE API ====================
// Ajouter dans api.js

export const profileAPI = {
    // Récupérer son profil
    get: () => api.get('/profile'),

    // Mettre à jour son profil (avec avatar)
    update: (formData) => api.put('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Changer le mot de passe
    changePassword: (data) => api.post('/profile/change-password', data),

    // 2FA
    setup2FA: () => api.post('/profile/2fa/setup'),
    verify2FA: (data) => api.post('/profile/2fa/verify', data),
    disable2FA: () => api.post('/profile/2fa/disable'),

    // OAuth
    disconnectOAuth: (provider) => api.delete(`/profile/oauth/${provider}`),

    // Sessions
    getSessions: () => api.get('/profile/sessions'),
    revokeSession: (sessionId) => api.delete(`/profile/sessions/${sessionId}`),
    revokeAllSessions: () => api.delete('/profile/sessions'),
}

// ==================== SELLERS API ====================

export const sellersAPI = {
    // Profil public d'un vendeur
    getPublicProfile: (username) => api.get(`/sellers/${username}`),

    // Liste des vendeurs (page "Nos créateurs")
    getAll: (params) => api.get('/sellers', { params }),
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

export const dependenciesAPI = {
    // === Dépendances prédéfinies ===
    getAll: (gameId = null) => {
        const params = gameId ? `?gameId=${gameId}` : '';
        return api.get(`/dependencies${params}`);
    },
    getById: (id) => api.get(`/dependencies/${id}`),

    // === Admin - Gestion des dépendances ===
    adminGetAll: (gameId = null) => {
        const params = gameId ? `?gameId=${gameId}` : '';
        return api.get(`/dependencies/admin/all${params}`);
    },
    create: (formData) => api.post('/dependencies', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, formData) => api.put(`/dependencies/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/dependencies/${id}`),

    // === Propositions vendeurs ===
    getMyProposals: () => api.get('/dependencies/proposals/my'),
    propose: (formData) => api.post('/dependencies/proposals', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteProposal: (id) => api.delete(`/dependencies/proposals/${id}`),

    // === Admin - Gestion des propositions ===
    getProposals: (status = null) => {
        const params = status ? `?status=${status}` : '';
        return api.get(`/dependencies/proposals${params}`);
    },
    getPendingCount: () => api.get('/dependencies/proposals/pending/count'),
    approveProposal: (id) => api.post(`/dependencies/proposals/${id}/approve`),
    rejectProposal: (id, reason) => api.post(`/dependencies/proposals/${id}/reject`, { reason }),

    // === Liaisons produit <-> dépendance ===
    getByModel: (modelId) => api.get(`/dependencies/model/${modelId}`),
    addToModel: (modelId, data) => api.post(`/dependencies/model/${modelId}`, data),
    // data = { dependencyId?, productDependencyId?, versionInfo?, isRequired?, note? }
    updateLink: (modelId, linkId, data) => api.put(`/dependencies/model/${modelId}/${linkId}`, data),
    removeFromModel: (modelId, linkId) => api.delete(`/dependencies/model/${modelId}/${linkId}`),

    // === Recherche produits comme dépendance ===
    searchProducts: (params) => api.get('/dependencies/search/products', { params }),
    // params = { q, gameId, excludeModelId }
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

export const customOrdersAPI = {
    // ==================== CLIENT ====================

    // ==================== CONVERSATIONS ====================


    // Démarrer ou récupérer une conversation
    startConversation: (data) => api.post('/custom-orders/conversations', data),
    // data = { request_id, creator_id? } - creator_id requis si c'est le client qui initie

    // Mes conversations
    getMyConversations: () => api.get('/custom-orders/conversations'),

    // Détails d'une conversation avec messages
    getConversation: (id) => api.get(`/custom-orders/conversations/${id}`),

    makeConversationOffer: (conversationId, data) => api.post(`/custom-orders/conversations/${conversationId}/offer`, data),

    sendOrderMessage: (orderId, formData) => api.post(`/custom-orders/orders/${orderId}/messages`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    deliverOrderWithFiles: (orderId, formData) => api.post(`/custom-orders/orders/${orderId}/deliver`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    approveDelivery: (orderId) => api.post(`/custom-orders/orders/${orderId}/approve`),
    requestRevision: (orderId, data) => api.post(`/custom-orders/orders/${orderId}/revision`, data),


    // Rétractation & Réclamations
    withdrawOrder: (orderId, data) => api.post(`/custom-orders/orders/${orderId}/withdraw`, data),
    openClaim: (orderId, data) => api.post(`/custom-orders/orders/${orderId}/claim`, data),
    getClaims: (orderId) => api.get(`/custom-orders/orders/${orderId}/claims`),
    sendFix: (orderId, formData) => api.post(`/custom-orders/orders/${orderId}/fix`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    acceptFix: (orderId, fixId) => api.post(`/custom-orders/orders/${orderId}/fix/${fixId}/accept`),
    rejectFix: (orderId, fixId, data) => api.post(`/custom-orders/orders/${orderId}/fix/${fixId}/reject`, data),

    // Envoyer un message
    sendConversationMessage: (conversationId, formData) => api.post(
        `/custom-orders/conversations/${conversationId}/messages`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
    ),



    // Conversations d'une demande (pour le client)
    getRequestConversations: (requestId) => api.get(`/custom-orders/requests/${requestId}/conversations`),
    // Créer une demande
    createRequest: (formData) => api.post('/custom-orders/requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // Mes demandes
    getMyRequests: () => api.get('/custom-orders/requests/my'),

    // Détails d'une demande
    getRequest: (id) => api.get(`/custom-orders/requests/${id}`),

    // Accepter une offre
    acceptOffer: (offerId) => api.post(`/custom-orders/offers/${offerId}/accept`),

    // Rejeter une offre
    rejectOffer: (offerId) => api.post(`/custom-orders/offers/${offerId}/reject`),

    // Mes commandes
    getMyOrders: () => api.get('/custom-orders/orders/my'),

    // Détails d'une commande
    getOrder: (id) => api.get(`/custom-orders/orders/${id}`),

    // Payer le premier versement (50%)
    payFirstPayment: (orderId) => api.post(`/custom-orders/orders/${orderId}/pay-first`),

    // Payer le solde (50%)
    // Paiements
    payFinalPayment: (orderId) => api.post(`/custom-orders/orders/${orderId}/pay-final`),

    // Annuler une commande
    cancelOrder: (orderId, reason) => api.post(`/custom-orders/orders/${orderId}/cancel`, { reason }),

    // Envoyer un message
    sendMessage: (orderId, formData) => api.post(`/custom-orders/orders/${orderId}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // ==================== CRÉATEUR ====================

    // Demandes disponibles
    getAvailableRequests: () => api.get('/custom-orders/creator/requests'),

    // Faire une offre
    makeOffer: (data) => api.post('/custom-orders/creator/offers', data),

    // Mes commandes (créateur)
    getCreatorOrders: () => api.get('/custom-orders/creator/orders'),

    // Livrer une commande
    deliverOrder: (orderId) => api.post(`/custom-orders/orders/${orderId}/deliver-simple`),



    // ==================== STAFF ====================

    // Toutes les demandes
    getStaffRequests: (status) => api.get('/custom-orders/staff/requests', { params: { status } }),

    // Approuver une demande
    approveRequest: (id, notes) => api.post(`/custom-orders/staff/requests/${id}/approve`, { notes }),

    // Rejeter une demande
    rejectRequest: (id, reason) => api.post(`/custom-orders/staff/requests/${id}/reject`, { reason }),

    // Liste des créateurs affiliés
    getAffiliatedCreators: () => api.get('/custom-orders/staff/creators'),

    // Ajouter un créateur affilié
    addAffiliatedCreator: (data) => api.post('/custom-orders/staff/creators', data),

    // Désactiver un créateur
    removeAffiliatedCreator: (id) => api.delete(`/custom-orders/staff/creators/${id}`),

    // Toutes les commandes
    getStaffOrders: () => api.get('/custom-orders/staff/orders'),
};

export default api