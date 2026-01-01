
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
    uploadDetailed: (formData) => api.post('/models/upload-detailed', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/models/${id}`, data),
    delete: (id) => api.delete(`/models/${id}`),

    // Actions utilisateur
    download: (id) => api.get(`/models/${id}/download`, { responseType: 'blob' }),
    rate: (id, rating) => api.post(`/models/${id}/rate`, { rating }),
    getStats: (id) => api.get(`/models/${id}/stats`),

    // Actions staff
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
    create: () => api.post('/checkout/checkout'),
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
    create: (data) => api.post('/games', data),
    update: (id, data) => api.put(`/games/${id}`, data),
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
    delete: (id) => api.delete(`/tags/${id}`)
}

// ============ VERSIONS ============
export const versionsAPI = {
    getAll: () => api.get('/versions'),
    getByGame: (gameId) => api.get(`/versions/game/${gameId}`),
    getByCategory: (categoryId) => api.get(`/versions/category/${categoryId}`),
    create: (data) => api.post('/versions', data),
    delete: (id) => api.delete(`/versions/${id}`)
}

// ============ SELLER DASHBOARD ============
export const sellerAPI = {
    getStats: () => api.get('/seller/dashboard/stats'),
    getChart: (days = 30) => api.get(`/seller/dashboard/chart?days=${days}`),
    getSales: (limit = 20) => api.get(`/seller/dashboard/sales?limit=${limit}`),
    getTopModels: (days = 30) => api.get(`/seller/dashboard/top-models?days=${days}`)
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

    // Stats
    getStats: () => api.get('/admin/stats'),
    getPendingModels: () => api.get('/admin/models/pending'),

    // Dashboard
    getDashboardStats: () => api.get('/admin/dashboard/stats'),
    getRevenueChart: (days = 30) => api.get(`/admin/dashboard/chart?days=${days}`),
    getSellerStats: (days = 30) => api.get(`/admin/dashboard/sellers?days=${days}`),
    getTopModels: (days = 30) => api.get(`/admin/dashboard/top-models?days=${days}`)
}

// ============ STRIPE ============
export const stripeAPI = {
    createConnectAccount: () => api.post('/stripe/connect/create')
}

export default api