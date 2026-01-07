import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    PenTool, Clock, CheckCircle, XCircle, Users, Euro,
    Loader2, Search, Filter, Eye,
    AlertCircle, Calendar, Star, Package, MessageSquare,
    ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react'
import { customOrdersAPI, adminAPI } from '../services/api'
import toast from 'react-hot-toast'

const requestStatusConfig = {
    PENDING: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
    APPROVED: { label: 'Approuvée', color: 'bg-blue-500/20 text-blue-400', icon: CheckCircle },
    ASSIGNED: { label: 'Assignée', color: 'bg-purple-500/20 text-purple-400', icon: Users },
    IN_PROGRESS: { label: 'En cours', color: 'bg-hyt-accent/20 text-hyt-accent', icon: PenTool },
    COMPLETED: { label: 'Terminée', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
    CANCELLED: { label: 'Annulée', color: 'bg-red-500/20 text-red-400', icon: XCircle },
    REJECTED: { label: 'Refusée', color: 'bg-red-500/20 text-red-400', icon: XCircle },
}

// Onglet Demandes
function RequestsTab() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('PENDING')
    const [expandedId, setExpandedId] = useState(null)
    const [actionLoading, setActionLoading] = useState(null)
    const [rejectReason, setRejectReason] = useState('')
    const [showRejectModal, setShowRejectModal] = useState(null)

    useEffect(() => {
        loadRequests()
    }, [statusFilter])

    const loadRequests = async () => {
        setLoading(true)
        try {
            const { data } = await customOrdersAPI.getStaffRequests(statusFilter || undefined)
            setRequests(data.requests || [])
        } catch (error) {
            console.error('Failed to load requests:', error)
            toast.error('Erreur lors du chargement')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id) => {
        setActionLoading(id)
        try {
            await customOrdersAPI.approveRequest(id)
            toast.success('Demande approuvée')
            loadRequests()
        } catch (error) {
            toast.error('Erreur lors de l\'approbation')
        } finally {
            setActionLoading(null)
        }
    }

    const handleReject = async (id) => {
        if (!rejectReason.trim()) {
            toast.error('Veuillez entrer une raison')
            return
        }
        setActionLoading(id)
        try {
            await customOrdersAPI.rejectRequest(id, rejectReason)
            toast.success('Demande refusée')
            setShowRejectModal(null)
            setRejectReason('')
            loadRequests()
        } catch (error) {
            toast.error('Erreur lors du refus')
        } finally {
            setActionLoading(null)
        }
    }

    const StatusBadge = ({ status }) => {
        const config = requestStatusConfig[status] || requestStatusConfig.PENDING
        const Icon = config.icon
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
            </span>
        )
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
            {/* Filtres */}
            <div className="flex flex-wrap gap-2">
                {['', 'PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            statusFilter === status
                                ? 'bg-hyt-accent text-black'
                                : 'bg-hyt-dark text-gray-400 hover:text-white'
                        }`}
                    >
                        {status === '' ? 'Toutes' : requestStatusConfig[status]?.label || status}
                    </button>
                ))}
            </div>

            {/* Liste */}
            {requests.length === 0 ? (
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                    <PenTool className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-white font-medium">Aucune demande</p>
                    <p className="text-gray-400 text-sm mt-1">
                        {statusFilter ? `Aucune demande avec le statut "${requestStatusConfig[statusFilter]?.label}"` : 'Aucune demande dans le système'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div
                            key={request.id}
                            className="bg-hyt-card border border-hyt-border rounded-xl overflow-hidden"
                        >
                            {/* Header */}
                            <div
                                className="p-4 cursor-pointer hover:bg-hyt-dark/30 transition-colors"
                                onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-white truncate">{request.title}</h3>
                                            <StatusBadge status={request.status} />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                            <span>Par {request.client_username}</span>
                                            <span>{request.client_email}</span>
                                            {request.offers_count > 0 && (
                                                <span className="text-hyt-accent">{request.offers_count} offre(s)</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {request.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleApprove(request.id) }}
                                                    disabled={actionLoading === request.id}
                                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                >
                                                    {actionLoading === request.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4" />
                                                    )}
                                                    Approuver
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setShowRejectModal(request.id) }}
                                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Refuser
                                                </button>
                                            </>
                                        )}
                                        {expandedId === request.id ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded content */}
                            {expandedId === request.id && (
                                <div className="border-t border-hyt-border p-4 bg-hyt-dark/30">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                                            <p className="text-white text-sm whitespace-pre-wrap">{request.description}</p>
                                        </div>
                                        <div className="space-y-3">
                                            {request.game_name && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-gray-500">Jeu:</span>
                                                    <span className="text-white">{request.game_name}</span>
                                                </div>
                                            )}
                                            {request.category_name && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-gray-500">Catégorie:</span>
                                                    <span className="text-white">{request.category_name}</span>
                                                </div>
                                            )}
                                            {(request.budget_min || request.budget_max) && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-gray-500">Budget:</span>
                                                    <span className="text-white">
                                                        {request.budget_min && request.budget_max
                                                            ? `${request.budget_min}€ - ${request.budget_max}€`
                                                            : request.budget_max
                                                                ? `Max ${request.budget_max}€`
                                                                : `Min ${request.budget_min}€`
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                            {request.deadline && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="text-gray-500">Deadline:</span>
                                                    <span className="text-white">
                                                        {new Date(request.deadline).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-gray-500">Créée le:</span>
                                                <span className="text-white">
                                                    {new Date(request.created_at).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de refus */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-4">Refuser la demande</h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Raison du refus..."
                            rows={4}
                            className="input-field w-full resize-none mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowRejectModal(null); setRejectReason('') }}
                                className="btn-ghost flex-1"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => handleReject(showRejectModal)}
                                disabled={actionLoading === showRejectModal}
                                className="btn-primary flex-1 bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2"
                            >
                                {actionLoading === showRejectModal && <Loader2 className="w-4 h-4 animate-spin" />}
                                Refuser
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Onglet Créateurs affiliés - Utilise les créateurs AFFILIATED et HYTSTUDIO existants
function CreatorsTab() {
    const [creators, setCreators] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadCreators()
    }, [])

    const loadCreators = async () => {
        try {
            // Récupère les vendeurs qui sont AFFILIATED ou HYTSTUDIO
            const { data } = await adminAPI.getSellers()
            const sellers = data.sellers || data || []
            // Filtrer les créateurs affiliés ou HytStudio
            const affiliatedCreators = sellers.filter(
                s => s.creator_type === 'AFFILIATED' || s.creator_type === 'HYTSTUDIO'
            )
            setCreators(affiliatedCreators)
        } catch (error) {
            console.error('Failed to load creators:', error)
        } finally {
            setLoading(false)
        }
    }

    const getImageUrl = (url) => {
        if (!url) return null
        if (url.startsWith('http')) return url
        return `http://localhost:3001${url}`
    }

    const CreatorTypeBadge = ({ type }) => {
        if (type === 'HYTSTUDIO') {
            return (
                <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-full font-medium">
                    HytStudio (0%)
                </span>
            )
        }
        return (
            <span className="px-2 py-0.5 text-xs bg-hyt-accent/20 text-hyt-accent rounded-full font-medium">
                Affilié (10%)
            </span>
        )
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
            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-blue-400 text-sm">
                    Les créateurs <strong>Affiliés</strong> et <strong>HytStudio</strong> peuvent recevoir des demandes sur mesure.
                    Gérez leurs types dans l'onglet <strong>"Vendeurs actifs"</strong> de la page Vendeurs.
                </p>
            </div>

            {/* Liste */}
            {creators.length === 0 ? (
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-white font-medium">Aucun créateur affilié</p>
                    <p className="text-gray-400 text-sm mt-1">
                        Promouvez des vendeurs en "Affilié" ou "HytStudio" dans la gestion des vendeurs
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {creators.map((creator) => (
                        <Link
                            key={creator.id}
                            to={`/seller/${creator.username}`}
                            className="bg-hyt-card border border-hyt-border rounded-xl p-4 hover:border-hyt-accent/50 transition-colors"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-hyt-accent to-purple-500 flex items-center justify-center flex-shrink-0">
                                        {creator.avatar_url ? (
                                            <img
                                                src={getImageUrl(creator.avatar_url)}
                                                alt={creator.username}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-lg font-bold text-white">
                                                {creator.username?.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-white">{creator.username}</p>
                                            <CreatorTypeBadge type={creator.creator_type} />
                                        </div>
                                        <p className="text-sm text-gray-400">{creator.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-white">{creator.products_count || 0}</p>
                                        <p className="text-xs text-gray-500">Produits</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-white">{creator.sales_count || 0}</p>
                                        <p className="text-xs text-gray-500">Ventes</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-500">
                                            {parseFloat(creator.total_revenue || 0).toFixed(0)}€
                                        </p>
                                        <p className="text-xs text-gray-500">Revenus</p>
                                    </div>
                                    <ExternalLink className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

// Onglet Commandes
function OrdersTab() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadOrders()
    }, [])

    const loadOrders = async () => {
        try {
            const { data } = await customOrdersAPI.getStaffOrders()
            setOrders(data.orders || [])
        } catch (error) {
            console.error('Failed to load orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const config = {
            AWAITING_PAYMENT: { label: 'Attente paiement', color: 'bg-yellow-500/20 text-yellow-400' },
            IN_PROGRESS: { label: 'En cours', color: 'bg-blue-500/20 text-blue-400' },
            AWAITING_FINAL_PAYMENT: { label: 'Attente solde', color: 'bg-orange-500/20 text-orange-400' },
            COMPLETED: { label: 'Terminée', color: 'bg-green-500/20 text-green-400' },
            CANCELLED: { label: 'Annulée', color: 'bg-red-500/20 text-red-400' },
            DISPUTED: { label: 'Litige', color: 'bg-red-500/20 text-red-400' },
        }
        const cfg = config[status] || { label: status, color: 'bg-gray-500/20 text-gray-400' }
        return (
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                {cfg.label}
            </span>
        )
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
            {orders.length === 0 ? (
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                    <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-white font-medium">Aucune commande</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-hyt-border">
                            <th className="text-left py-4 px-4 text-gray-400 font-medium">Commande</th>
                            <th className="text-left py-4 px-4 text-gray-400 font-medium">Client</th>
                            <th className="text-left py-4 px-4 text-gray-400 font-medium">Créateur</th>
                            <th className="text-left py-4 px-4 text-gray-400 font-medium">Prix</th>
                            <th className="text-left py-4 px-4 text-gray-400 font-medium">Statut</th>
                            <th className="text-left py-4 px-4 text-gray-400 font-medium">Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} className="border-b border-hyt-border/50 hover:bg-hyt-dark/30">
                                <td className="py-4 px-4">
                                    <p className="text-white font-medium truncate max-w-[200px]">
                                        {order.request_title}
                                    </p>
                                </td>
                                <td className="py-4 px-4 text-gray-400">{order.client_username}</td>
                                <td className="py-4 px-4 text-gray-400">{order.creator_username}</td>
                                <td className="py-4 px-4">
                                    <p className="text-white font-medium">{parseFloat(order.total_price).toFixed(2)}€</p>
                                    <p className="text-xs text-gray-500">
                                        Commission: {parseFloat(order.commission_amount).toFixed(2)}€
                                    </p>
                                </td>
                                <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                                <td className="py-4 px-4 text-gray-400">
                                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
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

// Composant principal
export default function AdminCustomOrders() {
    const [activeTab, setActiveTab] = useState('requests')
    const [stats, setStats] = useState({
        pendingRequests: 0,
        activeCreators: 0,
        activeOrders: 0,
        totalRevenue: 0
    })

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            const [requestsRes, creatorsRes, ordersRes] = await Promise.all([
                customOrdersAPI.getStaffRequests('PENDING').catch(() => ({ data: { requests: [] } })),
                customOrdersAPI.getAffiliatedCreators().catch(() => ({ data: { creators: [] } })),
                customOrdersAPI.getStaffOrders().catch(() => ({ data: { orders: [] } }))
            ])

            const activeOrders = (ordersRes.data.orders || []).filter(
                o => ['IN_PROGRESS', 'AWAITING_FINAL_PAYMENT'].includes(o.status)
            )
            const completedOrders = (ordersRes.data.orders || []).filter(o => o.status === 'COMPLETED')
            const totalRevenue = completedOrders.reduce(
                (sum, o) => sum + parseFloat(o.commission_amount || 0), 0
            )

            setStats({
                pendingRequests: requestsRes.data.requests?.length || 0,
                activeCreators: (creatorsRes.data.creators || []).filter(c => c.is_active).length,
                activeOrders: activeOrders.length,
                totalRevenue
            })
        } catch (error) {
            console.error('Failed to load stats:', error)
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Commandes sur mesure</h2>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <Clock className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.pendingRequests}</p>
                            <p className="text-xs text-gray-500">En attente</p>
                        </div>
                    </div>
                </div>
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Users className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.activeCreators}</p>
                            <p className="text-xs text-gray-500">Créateurs</p>
                        </div>
                    </div>
                </div>
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <PenTool className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.activeOrders}</p>
                            <p className="text-xs text-gray-500">En cours</p>
                        </div>
                    </div>
                </div>
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Euro className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.totalRevenue.toFixed(2)}€</p>
                            <p className="text-xs text-gray-500">Commissions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-hyt-border">
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-6 py-3 font-medium transition-colors relative ${
                        activeTab === 'requests'
                            ? 'text-hyt-accent'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Demandes
                    {stats.pendingRequests > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                            {stats.pendingRequests}
                        </span>
                    )}
                    {activeTab === 'requests' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('creators')}
                    className={`px-6 py-3 font-medium transition-colors relative ${
                        activeTab === 'creators'
                            ? 'text-hyt-accent'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Créateurs affiliés
                    {activeTab === 'creators' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-6 py-3 font-medium transition-colors relative ${
                        activeTab === 'orders'
                            ? 'text-hyt-accent'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Commandes
                    {activeTab === 'orders' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                    )}
                </button>
            </div>

            {/* Tab content */}
            {activeTab === 'requests' && <RequestsTab />}
            {activeTab === 'creators' && <CreatorsTab />}
            {activeTab === 'orders' && <OrdersTab />}
        </div>
    )
}