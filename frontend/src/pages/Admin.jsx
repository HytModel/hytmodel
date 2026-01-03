import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Users,
    Package,
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    Ban,
    UserCheck,
    Trash2,
    Eye,
    EyeOff,
    Search,
    Filter,
    ChevronRight,
    Loader2,
    BarChart3,
    Gamepad2,
    Tag,
    Layers,
    AlertTriangle,
    X,
    Settings,
    MessageSquare
} from 'lucide-react'
import { adminAPI, modelsAPI } from '../services/api'
import toast from 'react-hot-toast'
import AdminSellers from './AdminSellers'
import AdminSettings from './AdminSettings'
import AdminFeedback from './AdminFeedback'

// Fonction pour obtenir l'URL complète de l'image
const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `http://localhost:3001${url}`
}

// Composant Stats Card
function StatCard({ title, value, icon: Icon, color, trend }) {
    return (
        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm mb-1">{title}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {trend > 0 ? '+' : ''}{trend}% vs mois dernier
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    )
}

// Dashboard Overview
function AdminOverview() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            const { data } = await adminAPI.getDashboardStats()
            setStats(data)
        } catch (error) {
            console.error('Failed to load stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Vue d'ensemble</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Revenus totaux"
                    value={`${((stats?.totalRevenue || 0) / 100).toFixed(2)} €`}
                    icon={DollarSign}
                    color="bg-green-500/20 text-green-500"
                />
                <StatCard
                    title="Commission plateforme"
                    value={`${((stats?.platformCommission || 0) / 100).toFixed(2)} €`}
                    icon={TrendingUp}
                    color="bg-hyt-accent/20 text-hyt-accent"
                />
                <StatCard
                    title="Ventes"
                    value={stats?.salesCount || 0}
                    icon={Package}
                    color="bg-hyt-purple/20 text-hyt-purple"
                />
                <StatCard
                    title="Vendeurs actifs"
                    value={stats?.sellersCount || 0}
                    icon={Users}
                    color="bg-yellow-500/20 text-yellow-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Actions rapides</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            to="/admin/pending"
                            className="flex items-center gap-3 p-4 bg-hyt-dark rounded-lg hover:bg-hyt-dark/70 transition-colors"
                        >
                            <Clock className="w-5 h-5 text-yellow-500" />
                            <span className="text-white">Produits en attente</span>
                        </Link>
                        <Link
                            to="/admin/users"
                            className="flex items-center gap-3 p-4 bg-hyt-dark rounded-lg hover:bg-hyt-dark/70 transition-colors"
                        >
                            <Users className="w-5 h-5 text-hyt-accent" />
                            <span className="text-white">Utilisateurs</span>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Activité récente</h3>
                    <p className="text-gray-400">Aucune activité récente</p>
                </div>
            </div>
        </div>
    )
}

// Composant pour afficher une valeur modifiée avec surbrillance
function ModifiedValue({ label, oldValue, newValue, type = 'text' }) {
    if (!oldValue && !newValue) return null

    const hasChanged = oldValue !== newValue && oldValue !== undefined && oldValue !== null

    if (type === 'price') {
        const oldPrice = parseFloat(oldValue || 0).toFixed(2)
        const newPrice = parseFloat(newValue || 0).toFixed(2)
        const changed = oldPrice !== newPrice && oldValue !== undefined

        return (
            <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">{label}:</span>
                {changed ? (
                    <>
                        <span className="line-through text-red-400 text-xs">{oldPrice}€</span>
                        <span className="text-green-400 font-medium bg-green-500/20 px-1 rounded">{newPrice}€</span>
                    </>
                ) : (
                    <span className="text-white text-sm">{newPrice}€</span>
                )}
            </div>
        )
    }

    if (!hasChanged) {
        return (
            <div className="text-sm">
                <span className="text-gray-500 text-xs">{label}:</span>
                <span className="text-white ml-1">{newValue || '-'}</span>
            </div>
        )
    }

    return (
        <div className="text-sm">
            <span className="text-gray-500 text-xs">{label}:</span>
            <div className="mt-1 space-y-1">
                <div className="flex items-start gap-1">
                    <span className="text-red-400 text-xs">Avant:</span>
                    <span className="line-through text-red-400/70 text-xs">{oldValue || '(vide)'}</span>
                </div>
                <div className="flex items-start gap-1">
                    <span className="text-green-400 text-xs">Après:</span>
                    <span className="bg-green-500/20 text-green-400 px-1 rounded text-xs">{newValue || '(vide)'}</span>
                </div>
            </div>
        </div>
    )
}

// Modal de détail des modifications
function ModificationDetailModal({ model, onClose }) {
    const prev = model.previous_values || {}

    // Fonction pour comparer les arrays (tags, versions)
    const arraysChanged = (oldArr, newArr) => {
        if (!oldArr || !newArr) return oldArr !== newArr
        if (oldArr.length !== newArr.length) return true
        const oldIds = oldArr.map(id => String(id)).sort()
        const newIds = newArr.map(item => String(item.id || item)).sort()
        return JSON.stringify(oldIds) !== JSON.stringify(newIds)
    }

    const changes = []

    if (prev.title !== undefined && prev.title !== model.title) {
        changes.push({ label: 'Titre', old: prev.title, new: model.title })
    }
    if (prev.description !== undefined && prev.description !== model.description) {
        changes.push({ label: 'Description', old: prev.description, new: model.description, isLong: true })
    }
    if (prev.price !== undefined && parseFloat(prev.price) !== parseFloat(model.price)) {
        changes.push({ label: 'Prix', old: `${parseFloat(prev.price).toFixed(2)}€`, new: `${parseFloat(model.price).toFixed(2)}€` })
    }
    if (prev.youtube_url !== model.youtube_url) {
        changes.push({ label: 'YouTube', old: prev.youtube_url || '(aucune)', new: model.youtube_url || '(aucune)' })
    }
    if (prev.game_id !== model.game_id) {
        changes.push({ label: 'Jeu', old: 'Changé', new: model.game_name || 'N/A' })
    }
    if (prev.category_id !== model.category_id) {
        changes.push({ label: 'Catégorie', old: 'Changée', new: model.category_name || 'N/A' })
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Eye className="w-5 h-5 text-blue-500" />
                        Détail des modifications
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-4">
                    <h4 className="text-lg font-medium text-white mb-2">{model.title}</h4>
                    <p className="text-gray-400 text-sm">Par {model.creator_username}</p>
                </div>

                {changes.length === 0 ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-green-400">Nouveau produit - Pas de modifications</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                            <p className="text-blue-400 text-sm font-medium">
                                {changes.length} modification{changes.length > 1 ? 's' : ''} détectée{changes.length > 1 ? 's' : ''}
                            </p>
                        </div>

                        {changes.map((change, index) => (
                            <div key={index} className="bg-hyt-dark rounded-lg p-4">
                                <p className="text-gray-400 text-xs font-medium mb-2">{change.label}</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-red-400 text-xs mb-1">Avant</p>
                                        <p className={`text-red-300 ${change.isLong ? 'text-xs' : 'text-sm'} bg-red-500/10 p-2 rounded line-through`}>
                                            {change.old || '(vide)'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-green-400 text-xs mb-1">Après</p>
                                        <p className={`text-green-300 ${change.isLong ? 'text-xs' : 'text-sm'} bg-green-500/10 p-2 rounded`}>
                                            {change.new || '(vide)'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {model.previous_hidden_reason && (
                    <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                        <p className="text-orange-400 text-sm font-medium mb-1">Raison du masquage précédent :</p>
                        <p className="text-orange-300 text-sm">{model.previous_hidden_reason}</p>
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="btn-ghost">
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    )
}

// Pending Models
function PendingModels({ onCountChange }) {
    const [models, setModels] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(null)
    const [selectedModel, setSelectedModel] = useState(null)

    useEffect(() => {
        loadPendingModels()
    }, [])

    const loadPendingModels = async () => {
        try {
            const { data } = await adminAPI.getPendingModels()
            const modelsArray = Array.isArray(data) ? data : (data.models || [])
            setModels(modelsArray)
            if (onCountChange) {
                onCountChange(modelsArray.length)
            }
        } catch (error) {
            console.error('Failed to load pending models:', error)
            setModels([])
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (modelId) => {
        setProcessing(modelId)
        try {
            await modelsAPI.approve(modelId)
            toast.success('Produit approuvé')
            loadPendingModels()
        } catch (error) {
            toast.error('Erreur lors de l\'approbation')
        } finally {
            setProcessing(null)
        }
    }

    const handleReject = async (modelId) => {
        setProcessing(modelId)
        try {
            await modelsAPI.reject(modelId)
            toast.success('Produit rejeté')
            loadPendingModels()
        } catch (error) {
            toast.error('Erreur lors du rejet')
        } finally {
            setProcessing(null)
        }
    }

    // Fonction pour vérifier si un modèle a des modifications
    const hasModifications = (model) => {
        return model.modification_reason === 'CREATOR_UPDATE' || model.modification_reason === 'HIDDEN_CORRECTION'
    }

    // Compte les modifications
    const countChanges = (model) => {
        if (!model.previous_values) return 0
        const prev = model.previous_values
        let count = 0
        if (prev.title !== undefined && prev.title !== model.title) count++
        if (prev.description !== undefined && prev.description !== model.description) count++
        if (prev.price !== undefined && parseFloat(prev.price) !== parseFloat(model.price)) count++
        if (prev.youtube_url !== model.youtube_url) count++
        if (prev.game_id !== model.game_id) count++
        if (prev.category_id !== model.category_id) count++
        return count
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Produits en attente</h2>

            {models.length === 0 ? (
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-white font-medium">Aucun produit en attente</p>
                    <p className="text-gray-400 text-sm mt-1">Tous les produits ont été traités</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {models.map((model) => {
                        const changeCount = countChanges(model)
                        const isModified = hasModifications(model)

                        return (
                            <div
                                key={model.id}
                                className={`bg-hyt-card border rounded-xl p-4 ${
                                    model.modification_reason === 'HIDDEN_CORRECTION'
                                        ? 'border-orange-500/50 bg-orange-500/5'
                                        : model.modification_reason === 'CREATOR_UPDATE'
                                            ? 'border-blue-500/50 bg-blue-500/5'
                                            : 'border-hyt-border'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-hyt-dark flex-shrink-0">
                                        {model.thumbnail_url ? (
                                            <img
                                                src={getImageUrl(model.thumbnail_url)}
                                                alt={model.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                <Package className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h3 className="text-white font-medium truncate">{model.title}</h3>
                                            {/* Badge selon le type */}
                                            {model.modification_reason === 'HIDDEN_CORRECTION' ? (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 text-orange-500 rounded-full text-xs font-medium">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Corrigé
                                                </span>
                                            ) : model.modification_reason === 'CREATOR_UPDATE' ? (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded-full text-xs font-medium">
                                                    <Clock className="w-3 h-3" />
                                                    Modifié
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Nouveau
                                                </span>
                                            )}
                                            {/* Badge nombre de modifications */}
                                            {isModified && changeCount > 0 && (
                                                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                                                    {changeCount} modif{changeCount > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-gray-400 text-sm">Par {model.creator_username}</p>

                                        {/* Affichage rapide des infos */}
                                        <div className="flex flex-wrap gap-4 mt-2">
                                            <span className="text-hyt-accent font-medium">
                                                {parseFloat(model.price).toFixed(2)} €
                                            </span>
                                            {model.game_name && (
                                                <span className="text-gray-400 text-sm">{model.game_name}</span>
                                            )}
                                            {model.category_name && (
                                                <span className="text-gray-500 text-sm">{model.category_name}</span>
                                            )}
                                        </div>

                                        {/* Aperçu des modifications pour les produits modifiés */}
                                        {isModified && model.previous_values && (
                                            <div className="mt-3 p-3 bg-hyt-dark/50 rounded-lg border border-hyt-border">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-xs text-gray-400 font-medium">Aperçu des modifications :</p>
                                                    <button
                                                        onClick={() => setSelectedModel(model)}
                                                        className="text-xs text-hyt-accent hover:underline"
                                                    >
                                                        Voir tout →
                                                    </button>
                                                </div>
                                                <div className="space-y-2 text-xs">
                                                    {model.previous_values.title !== model.title && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-500">Titre:</span>
                                                            <span className="line-through text-red-400">{model.previous_values.title}</span>
                                                            <span className="text-green-400">→</span>
                                                            <span className="bg-green-500/20 text-green-400 px-1 rounded">{model.title}</span>
                                                        </div>
                                                    )}
                                                    {model.previous_values.price !== undefined && parseFloat(model.previous_values.price) !== parseFloat(model.price) && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-500">Prix:</span>
                                                            <span className="line-through text-red-400">{parseFloat(model.previous_values.price).toFixed(2)}€</span>
                                                            <span className="text-green-400">→</span>
                                                            <span className="bg-green-500/20 text-green-400 px-1 rounded">{parseFloat(model.price).toFixed(2)}€</span>
                                                        </div>
                                                    )}
                                                    {model.previous_values.description !== model.description && (
                                                        <div className="text-yellow-400">
                                                            📝 Description modifiée
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Afficher l'ancienne raison de masquage si corrigé */}
                                        {model.modification_reason === 'HIDDEN_CORRECTION' && model.previous_hidden_reason && (
                                            <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                                                <p className="text-xs text-orange-400">
                                                    <strong>Ancienne raison du masquage :</strong> {model.previous_hidden_reason}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <div className="flex items-center gap-2">
                                            {isModified && (
                                                <button
                                                    onClick={() => setSelectedModel(model)}
                                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Voir les modifications"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            )}
                                            <Link
                                                to={`/models/${model.id}`}
                                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                                title="Voir le produit"
                                            >
                                                <Package className="w-5 h-5" />
                                            </Link>
                                        </div>
                                        <button
                                            onClick={() => handleApprove(model.id)}
                                            disabled={processing === model.id}
                                            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 w-full justify-center"
                                        >
                                            {processing === model.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                            Approuver
                                        </button>
                                        <button
                                            onClick={() => handleReject(model.id)}
                                            disabled={processing === model.id}
                                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 w-full justify-center"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Rejeter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modal de détail des modifications */}
            {selectedModel && (
                <ModificationDetailModal
                    model={selectedModel}
                    onClose={() => setSelectedModel(null)}
                />
            )}
        </div>
    )
}

// Users Management
function UsersManagement() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('')

    useEffect(() => {
        loadUsers()
    }, [roleFilter])

    const loadUsers = async () => {
        try {
            const { data } = await adminAPI.getUsers({
                role: roleFilter || undefined,
                search: searchQuery || undefined
            })
            setUsers(data.users || data || [])
        } catch (error) {
            console.error('Failed to load users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        loadUsers()
    }

    const handleBan = async (userId, isBanned) => {
        try {
            if (isBanned) {
                await adminAPI.unbanUser(userId)
                toast.success('Utilisateur débanni')
            } else {
                await adminAPI.banUser(userId)
                toast.success('Utilisateur banni')
            }
            loadUsers()
        } catch (error) {
            toast.error('Erreur')
        }
    }

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminAPI.setRole(userId, newRole)
            toast.success('Rôle modifié')
            loadUsers()
        } catch (error) {
            toast.error('Erreur lors du changement de rôle')
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Gestion des utilisateurs</h2>

            <div className="flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-12 w-full"
                        />
                    </div>
                </form>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="input-field w-full sm:w-48"
                >
                    <option value="">Tous les rôles</option>
                    <option value="USER">User</option>
                    <option value="CREATOR">Creator</option>
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-hyt-border">
                            <th className="text-left py-4 px-4 text-gray-400 font-medium">Utilisateur</th>
                            <th className="text-left py-4 px-4 text-gray-400 font-medium">Email</th>
                            <th className="text-left py-4 px-4 text-gray-400 font-medium">Rôle</th>
                            <th className="text-left py-4 px-4 text-gray-400 font-medium">Inscription</th>
                            <th className="text-right py-4 px-4 text-gray-400 font-medium">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-hyt-border/50 hover:bg-hyt-dark/30">
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center">
                                            <span className="text-sm font-bold text-white">
                                                {user.username?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="text-white font-medium">{user.username}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-gray-400">{user.email}</td>
                                <td className="py-4 px-4">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="bg-hyt-dark border border-hyt-border rounded-lg px-3 py-1 text-white text-sm"
                                    >
                                        <option value="USER">User</option>
                                        <option value="CREATOR">Creator</option>
                                        <option value="STAFF">Staff</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </td>
                                <td className="py-4 px-4 text-gray-400">
                                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <button
                                        onClick={() => handleBan(user.id, user.is_banned)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                            user.is_banned
                                                ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                                                : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                                        }`}
                                    >
                                        {user.is_banned ? 'Débannir' : 'Bannir'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

// Modal pour cacher un produit avec raison
function HideModelModal({ model, onClose, onConfirm }) {
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!reason.trim()) {
            toast.error('Veuillez entrer une raison')
            return
        }

        setLoading(true)
        try {
            await onConfirm(model.id, reason)
            onClose()
        } catch (error) {
            toast.error('Erreur lors du masquage')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <EyeOff className="w-5 h-5 text-yellow-500" />
                        Masquer le produit
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-gray-400 mb-4">
                    Vous allez masquer <span className="text-white font-medium">"{model.title}"</span>.
                    Le vendeur sera notifié de la raison.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm text-gray-400 mb-2">
                            Raison du masquage *
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ex: Contenu inapproprié, droits d'auteur, qualité insuffisante..."
                            rows={4}
                            className="input-field w-full resize-none"
                            required
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-ghost flex-1"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1 bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <EyeOff className="w-4 h-4" />
                            )}
                            Masquer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Modal de confirmation pour supprimer
function DeleteModelModal({ model, onClose, onConfirm }) {
    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
        setLoading(true)
        try {
            await onConfirm(model.id)
            onClose()
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        Supprimer le produit
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-gray-400 mb-6">
                    Êtes-vous sûr de vouloir supprimer définitivement
                    <span className="text-white font-medium"> "{model.title}"</span> ?
                    Cette action est irréversible.
                </p>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-ghost flex-1"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="btn-primary flex-1 bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    )
}

// Admin Models Management
function AdminModels() {
    const [models, setModels] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [hideModal, setHideModal] = useState(null)
    const [deleteModal, setDeleteModal] = useState(null)
    const [processing, setProcessing] = useState(null)

    useEffect(() => {
        loadModels()
    }, [statusFilter])

    const loadModels = async () => {
        setLoading(true)
        try {
            try {
                const { data } = await adminAPI.getAllModels({
                    status: statusFilter || undefined
                })
                const modelsArray = Array.isArray(data) ? data : (data.models || [])
                setModels(modelsArray)
            } catch (e) {
                const { data } = await modelsAPI.getAll()
                const modelsArray = Array.isArray(data) ? data : (data.models || [])
                setModels(modelsArray)
            }
        } catch (error) {
            console.error('Failed to load models:', error)
            setModels([])
        } finally {
            setLoading(false)
        }
    }

    const handleHide = async (modelId, reason) => {
        try {
            await modelsAPI.hide(modelId, reason)
            toast.success('Produit masqué - Le vendeur sera notifié')
            loadModels()
        } catch (error) {
            throw error
        }
    }

    const handleUnhide = async (modelId) => {
        setProcessing(modelId)
        try {
            await modelsAPI.unhide(modelId)
            toast.success('Produit réaffiché')
            loadModels()
        } catch (error) {
            toast.error('Erreur lors du réaffichage')
        } finally {
            setProcessing(null)
        }
    }

    const handleDelete = async (modelId) => {
        try {
            await modelsAPI.delete(modelId)
            toast.success('Produit supprimé')
            loadModels()
        } catch (error) {
            throw error
        }
    }

    const handleApprove = async (modelId) => {
        setProcessing(modelId)
        try {
            await modelsAPI.approve(modelId)
            toast.success('Produit approuvé')
            loadModels()
        } catch (error) {
            toast.error('Erreur lors de l\'approbation')
        } finally {
            setProcessing(null)
        }
    }

    const handleReject = async (modelId) => {
        setProcessing(modelId)
        try {
            await modelsAPI.reject(modelId)
            toast.success('Produit rejeté')
            loadModels()
        } catch (error) {
            toast.error('Erreur lors du rejet')
        } finally {
            setProcessing(null)
        }
    }

    const getStatusBadge = (model) => {
        if (model.is_hidden) {
            return (
                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium">
                    <EyeOff className="w-3 h-3" />
                    Masqué
                </span>
            )
        }

        switch (model.status) {
            case 'APPROVED':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Approuvé
                    </span>
                )
            case 'PENDING':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        En attente
                    </span>
                )
            case 'REJECTED':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-medium">
                        <XCircle className="w-3 h-3" />
                        Rejeté
                    </span>
                )
            default:
                return null
        }
    }

    const filteredModels = models.filter(model =>
        model.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.creator_username?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Gestion des produits</h2>
                <span className="text-gray-400">{filteredModels.length} produit(s)</span>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par titre ou créateur..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-12 w-full"
                        />
                    </div>
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-field w-full sm:w-48"
                >
                    <option value="">Tous les statuts</option>
                    <option value="APPROVED">Approuvés</option>
                    <option value="PENDING">En attente</option>
                    <option value="REJECTED">Rejetés</option>
                </select>
            </div>

            {/* Models List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
                </div>
            ) : filteredModels.length === 0 ? (
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                    <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-white font-medium">Aucun produit trouvé</p>
                    <p className="text-gray-400 text-sm mt-1">
                        {searchQuery ? 'Essayez avec d\'autres termes' : 'Aucun produit dans la base de données'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredModels.map((model) => (
                        <div
                            key={model.id}
                            className={`bg-hyt-card border rounded-xl p-4 ${
                                model.is_hidden
                                    ? 'border-yellow-500/50 bg-yellow-500/5'
                                    : 'border-hyt-border'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Thumbnail */}
                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-hyt-dark flex-shrink-0">
                                    {model.thumbnail_url ? (
                                        <img
                                            src={getImageUrl(model.thumbnail_url)}
                                            alt={model.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                            <Package className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-white font-medium truncate">{model.title}</h3>
                                        {getStatusBadge(model)}
                                    </div>
                                    <p className="text-gray-400 text-sm">
                                        Par <span className="text-hyt-accent">{model.creator_username || 'Inconnu'}</span>
                                    </p>
                                    <p className="text-white font-medium">
                                        {parseFloat(model.price).toFixed(2)} €
                                    </p>
                                    {model.is_hidden && model.hidden_reason && (
                                        <div className="mt-2 flex items-start gap-2 text-sm text-yellow-500">
                                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <span>Raison: {model.hidden_reason}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <Link
                                        to={`/models/${model.id}`}
                                        className="p-2 text-gray-400 hover:text-white transition-colors"
                                        title="Voir"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </Link>

                                    {model.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(model.id)}
                                                disabled={processing === model.id}
                                                className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg flex items-center gap-1 text-sm transition-colors disabled:opacity-50"
                                            >
                                                {processing === model.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4" />
                                                )}
                                                <span className="hidden sm:inline">Approuver</span>
                                            </button>
                                            <button
                                                onClick={() => handleReject(model.id)}
                                                disabled={processing === model.id}
                                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg flex items-center gap-1 text-sm transition-colors disabled:opacity-50"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                <span className="hidden sm:inline">Rejeter</span>
                                            </button>
                                        </>
                                    )}

                                    {model.status === 'APPROVED' && (
                                        model.is_hidden ? (
                                            <button
                                                onClick={() => handleUnhide(model.id)}
                                                disabled={processing === model.id}
                                                className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg flex items-center gap-1 text-sm transition-colors disabled:opacity-50"
                                            >
                                                {processing === model.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                                <span className="hidden sm:inline">Réafficher</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setHideModal(model)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-3 rounded-lg flex items-center gap-1 text-sm transition-colors"
                                            >
                                                <EyeOff className="w-4 h-4" />
                                                <span className="hidden sm:inline">Masquer</span>
                                            </button>
                                        )
                                    )}

                                    <button
                                        onClick={() => setDeleteModal(model)}
                                        className="p-2 text-red-500 hover:text-red-400 transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            {hideModal && (
                <HideModelModal
                    model={hideModal}
                    onClose={() => setHideModal(null)}
                    onConfirm={handleHide}
                />
            )}

            {deleteModal && (
                <DeleteModelModal
                    model={deleteModal}
                    onClose={() => setDeleteModal(null)}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    )
}

// Main Admin Component
export default function Admin() {
    const location = useLocation()
    const [pendingCount, setPendingCount] = useState(0)
    const [proposalsCount, setProposalsCount] = useState(0)
    const [reportsCount, setReportsCount] = useState(0)

    useEffect(() => {
        loadPendingCount()
        loadFeedbackCounts()
    }, [])

    const loadPendingCount = async () => {
        try {
            const { data } = await adminAPI.getPendingModels()
            const models = Array.isArray(data) ? data : (data.models || [])
            setPendingCount(models.length)
        } catch (error) {
            console.error('Failed to load pending count:', error)
        }
    }

    const loadFeedbackCounts = async () => {
        try {
            const [proposalsRes, reportsRes] = await Promise.all([
                adminAPI.getProposals('PENDING').catch(() => ({ data: { proposals: [] } })),
                adminAPI.getReports('PENDING').catch(() => ({ data: { reports: [] } }))
            ])
            setProposalsCount(proposalsRes.data.proposals?.length || 0)
            setReportsCount(reportsRes.data.reports?.length || 0)
        } catch (error) {
            console.error('Failed to load feedback counts:', error)
        }
    }

    const handlePendingCountChange = (count) => {
        setPendingCount(count)
    }

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        {
            path: '/admin/pending',
            icon: Clock,
            label: 'En attente',
            badge: pendingCount > 0 ? pendingCount : null,
            badgeColor: 'bg-yellow-500 text-black'
        },
        { path: '/admin/users', icon: Users, label: 'Utilisateurs' },
        { path: '/admin/sellers', icon: BarChart3, label: 'Vendeurs' },
        { path: '/admin/models', icon: Package, label: 'Produits' },
        {
            path: '/admin/feedback',
            icon: MessageSquare,
            label: 'Feedback',
            badges: [
                proposalsCount > 0 ? { count: proposalsCount, color: 'bg-blue-500 text-white' } : null,
                reportsCount > 0 ? { count: reportsCount, color: 'bg-red-500 text-white' } : null,
            ].filter(Boolean)
        },
        { path: '/admin/settings', icon: Settings, label: 'Paramètres' },
    ]

    return (
        <div className="min-h-screen bg-hyt-dark pt-20">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <motion.aside
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:w-64 flex-shrink-0"
                    >
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-4 sticky top-24">
                            <h2 className="text-lg font-bold text-white mb-4 px-2">Administration</h2>
                            <nav className="space-y-1">
                                {navItems.map((item) => {
                                    const isActive = item.exact
                                        ? location.pathname === item.path
                                        : location.pathname.startsWith(item.path) && location.pathname !== '/admin'

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                                                isActive || (item.exact && location.pathname === '/admin')
                                                    ? 'bg-hyt-accent/20 text-hyt-accent'
                                                    : 'text-gray-400 hover:text-white hover:bg-hyt-dark/50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className="w-5 h-5" />
                                                <span>{item.label}</span>
                                            </div>
                                            {item.badge && (
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-yellow-500 text-black'}`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                            {item.badges && item.badges.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    {item.badges.map((b, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.color}`}
                                                        >
                                                            {b.count}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>
                    </motion.aside>

                    {/* Main Content */}
                    <motion.main
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 min-w-0"
                    >
                        <Routes>
                            <Route index element={<AdminOverview />} />
                            <Route path="pending" element={<PendingModels onCountChange={handlePendingCountChange} />} />
                            <Route path="users" element={<UsersManagement />} />
                            <Route path="sellers" element={<AdminSellers />} />
                            <Route path="feedback" element={<AdminFeedback />} />
                            <Route path="settings" element={<AdminSettings />} />
                            <Route path="models" element={<AdminModels />} />
                        </Routes>
                    </motion.main>
                </div>
            </div>
        </div>
    )
}