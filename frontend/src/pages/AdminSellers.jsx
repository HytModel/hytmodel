import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Users, UserCheck, UserX, Clock, CheckCircle, XCircle,
    DollarSign, Package, TrendingUp, Eye, Loader2,
    Search, Filter, ArrowUpRight, Calendar, AlertTriangle,
    X, MessageSquare
} from 'lucide-react'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'

// Modal pour rejeter une demande
function RejectModal({ request, onClose, onConfirm }) {
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
            await onConfirm(request.id, reason)
            onClose()
        } catch (error) {
            toast.error('Erreur lors du rejet')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <UserX className="w-5 h-5 text-red-500" />
                        Rejeter la demande
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-gray-400 mb-4">
                    Vous allez rejeter la demande de <span className="text-white font-medium">{request.username}</span>.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm text-gray-400 mb-2">
                            Raison du rejet *
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Ex: Profil incomplet, pas assez d'informations..."
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
                            className="btn-primary flex-1 bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <UserX className="w-4 h-4" />
                            )}
                            Rejeter
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Modal pour voir le message de demande
function ViewRequestModal({ request, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-hyt-accent" />
                        Message de {request.username}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="bg-hyt-dark rounded-lg p-4 mb-4">
                    <p className="text-gray-300 whitespace-pre-wrap">
                        {request.message || "Aucun message fourni."}
                    </p>
                </div>

                <div className="text-sm text-gray-500">
                    Demande envoyée le {new Date(request.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}
                </div>

                <button
                    onClick={onClose}
                    className="btn-ghost w-full mt-4"
                >
                    Fermer
                </button>
            </div>
        </div>
    )
}

export default function AdminSellers() {
    const [activeTab, setActiveTab] = useState('requests') // 'requests' | 'sellers'
    const [requests, setRequests] = useState([])
    const [sellers, setSellers] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(null)
    const [rejectModal, setRejectModal] = useState(null)
    const [viewModal, setViewModal] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [requestsRes, sellersRes, statsRes] = await Promise.all([
                adminAPI.getCreatorRequests().catch(() => ({ data: { requests: [] } })),
                adminAPI.getSellers().catch(() => ({ data: { sellers: [] } })),
                adminAPI.getSellersStats().catch(() => ({ data: { stats: null } }))
            ])

            setRequests(requestsRes.data.requests || requestsRes.data || [])
            setSellers(sellersRes.data.sellers || sellersRes.data || [])
            setStats(statsRes.data.stats || statsRes.data || null)
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (requestId) => {
        setProcessing(requestId)
        try {
            await adminAPI.approveCreatorRequest(requestId)
            toast.success('Demande approuvée ! L\'utilisateur est maintenant créateur.')
            fetchData()
        } catch (error) {
            toast.error('Erreur lors de l\'approbation')
        } finally {
            setProcessing(null)
        }
    }

    const handleReject = async (requestId, reason) => {
        try {
            await adminAPI.rejectCreatorRequest(requestId, reason)
            toast.success('Demande rejetée')
            fetchData()
        } catch (error) {
            throw error
        }
    }

    const pendingRequests = requests.filter(r => r.status === 'PENDING')

    const filteredSellers = sellers.filter(seller =>
        seller.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seller.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Gestion des vendeurs</h2>
                {pendingRequests.length > 0 && (
                    <span className="bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded-full">
                        {pendingRequests.length} demande(s) en attente
                    </span>
                )}
            </div>

            {/* Stats globales */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-hyt-accent/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-hyt-accent" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.totalSellers || 0}</p>
                                <p className="text-xs text-gray-400">Vendeurs actifs</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{parseFloat(stats.totalRevenue || 0).toFixed(2)}€</p>
                                <p className="text-xs text-gray-400">Revenus totaux</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-hyt-purple/10 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-hyt-purple" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{parseFloat(stats.totalCommissions || 0).toFixed(2)}€</p>
                                <p className="text-xs text-gray-400">Nos commissions</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                <Package className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{stats.totalSales || 0}</p>
                                <p className="text-xs text-gray-400">Ventes totales</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-hyt-border">
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-3 font-medium transition-colors relative ${
                        activeTab === 'requests'
                            ? 'text-hyt-accent'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Demandes
                        {pendingRequests.length > 0 && (
                            <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                                {pendingRequests.length}
                            </span>
                        )}
                    </span>
                    {activeTab === 'requests' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('sellers')}
                    className={`px-4 py-3 font-medium transition-colors relative ${
                        activeTab === 'sellers'
                            ? 'text-hyt-accent'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Vendeurs actifs
                        <span className="text-xs text-gray-500">({sellers.length})</span>
                    </span>
                    {activeTab === 'sellers' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                    )}
                </button>
            </div>

            {/* Tab: Demandes */}
            {activeTab === 'requests' && (
                <div className="space-y-4">
                    {pendingRequests.length === 0 ? (
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <p className="text-white font-medium">Aucune demande en attente</p>
                            <p className="text-gray-400 text-sm mt-1">Toutes les demandes ont été traitées</p>
                        </div>
                    ) : (
                        pendingRequests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-hyt-card border border-hyt-border rounded-xl p-4"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center flex-shrink-0">
                                        <span className="text-lg font-bold text-white">
                                            {request.username?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-white font-medium">{request.username}</h3>
                                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium">
                                                En attente
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm">{request.email}</p>
                                        <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Demande le {new Date(request.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        {request.message && (
                                            <button
                                                onClick={() => setViewModal(request)}
                                                className="p-2 text-gray-400 hover:text-hyt-accent transition-colors"
                                                title="Voir le message"
                                            >
                                                <MessageSquare className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleApprove(request.id)}
                                            disabled={processing === request.id}
                                            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            {processing === request.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                            Approuver
                                        </button>
                                        <button
                                            onClick={() => setRejectModal(request)}
                                            disabled={processing === request.id}
                                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Rejeter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Tab: Vendeurs actifs */}
            {activeTab === 'sellers' && (
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un vendeur..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-12 w-full"
                        />
                    </div>

                    {filteredSellers.length === 0 ? (
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                            <p className="text-white font-medium">Aucun vendeur trouvé</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {searchQuery ? 'Essayez avec d\'autres termes' : 'Aucun vendeur actif pour le moment'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-hyt-border">
                                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Vendeur</th>
                                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Produits</th>
                                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Ventes</th>
                                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Revenus</th>
                                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Commission</th>
                                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Inscription</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredSellers.map((seller) => (
                                    <tr key={seller.id} className="border-b border-hyt-border/50 hover:bg-hyt-dark/30">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center">
                                                        <span className="text-sm font-bold text-white">
                                                            {seller.username?.charAt(0).toUpperCase()}
                                                        </span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{seller.username}</p>
                                                    <p className="text-gray-500 text-xs">{seller.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-white font-medium">{seller.products_count || 0}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-white font-medium">{seller.sales_count || 0}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                                <span className="text-green-500 font-medium">
                                                    {parseFloat(seller.total_revenue || 0).toFixed(2)}€
                                                </span>
                                        </td>
                                        <td className="py-4 px-4">
                                                <span className="text-hyt-purple font-medium">
                                                    {parseFloat(seller.total_commission || 0).toFixed(2)}€
                                                </span>
                                        </td>
                                        <td className="py-4 px-4 text-gray-400">
                                            {new Date(seller.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            {rejectModal && (
                <RejectModal
                    request={rejectModal}
                    onClose={() => setRejectModal(null)}
                    onConfirm={handleReject}
                />
            )}

            {viewModal && (
                <ViewRequestModal
                    request={viewModal}
                    onClose={() => setViewModal(null)}
                />
            )}
        </div>
    )
}