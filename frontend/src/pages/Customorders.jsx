import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    PenTool, Plus, Clock, CheckCircle, XCircle, AlertCircle,
    Euro, Calendar, Gamepad2, FolderOpen, MessageSquare,
    ArrowRight, Loader2, Package, Users, Star
} from 'lucide-react'
import { customOrdersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const statusConfig = {
    PENDING: { label: 'En attente de validation', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
    APPROVED: { label: 'Recherche de créateur', color: 'bg-blue-500/20 text-blue-400', icon: Users },
    ASSIGNED: { label: 'Créateur assigné', color: 'bg-purple-500/20 text-purple-400', icon: CheckCircle },
    IN_PROGRESS: { label: 'En cours', color: 'bg-hyt-accent/20 text-hyt-accent', icon: PenTool },
    AWAITING_FINAL_PAYMENT: { label: 'En attente paiement final', color: 'bg-orange-500/20 text-orange-400', icon: Euro },
    COMPLETED: { label: 'Terminée', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
    CANCELLED: { label: 'Annulée', color: 'bg-red-500/20 text-red-400', icon: XCircle },
    REJECTED: { label: 'Refusée', color: 'bg-red-500/20 text-red-400', icon: XCircle },
}

export default function CustomOrders() {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [requests, setRequests] = useState([])
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('requests')

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/custom-orders' } })
            return
        }
        loadData()
    }, [isAuthenticated])

    const loadData = async () => {
        try {
            const [requestsRes, ordersRes] = await Promise.all([
                customOrdersAPI.getMyRequests(),
                customOrdersAPI.getMyOrders()
            ])
            setRequests(requestsRes.data.requests || [])
            setOrders(ordersRes.data.orders || [])
        } catch (error) {
            console.error('Failed to load custom orders:', error)
            toast.error('Erreur lors du chargement')
        } finally {
            setLoading(false)
        }
    }

    const StatusBadge = ({ status }) => {
        const config = statusConfig[status] || statusConfig.PENDING
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
            <div className="min-h-screen bg-hyt-dark pt-20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-hyt-dark pt-20 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
                >
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white mb-2">
                            Commandes sur mesure
                        </h1>
                        <p className="text-gray-400">
                            Demandez une création personnalisée à nos créateurs
                        </p>
                    </div>

                    <Link
                        to="/custom-orders/new"
                        className="btn-primary flex items-center gap-2 w-fit"
                    >
                        <Plus className="w-5 h-5" />
                        Nouvelle demande
                    </Link>
                </motion.div>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-hyt-accent/10 to-purple-500/10 border border-hyt-accent/30 rounded-xl p-6 mb-8"
                >
                    <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <PenTool className="w-5 h-5 text-hyt-accent" />
                        Comment ça fonctionne ?
                    </h3>
                    <div className="grid sm:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-hyt-accent/20 flex items-center justify-center text-hyt-accent font-bold flex-shrink-0">1</div>
                            <div>
                                <p className="font-medium text-white">Décrivez votre besoin</p>
                                <p className="text-gray-400">Détaillez votre projet</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-hyt-accent/20 flex items-center justify-center text-hyt-accent font-bold flex-shrink-0">2</div>
                            <div>
                                <p className="font-medium text-white">Recevez des offres</p>
                                <p className="text-gray-400">Nos créateurs vous proposent</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-hyt-accent/20 flex items-center justify-center text-hyt-accent font-bold flex-shrink-0">3</div>
                            <div>
                                <p className="font-medium text-white">Payez 50% d'acompte</p>
                                <p className="text-gray-400">Le travail commence</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-hyt-accent/20 flex items-center justify-center text-hyt-accent font-bold flex-shrink-0">4</div>
                            <div>
                                <p className="font-medium text-white">Payez le solde</p>
                                <p className="text-gray-400">Recevez vos fichiers</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-2 mb-6"
                >
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            activeTab === 'requests'
                                ? 'bg-hyt-accent text-black'
                                : 'bg-hyt-card text-gray-400 hover:text-white'
                        }`}
                    >
                        Mes demandes ({requests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            activeTab === 'orders'
                                ? 'bg-hyt-accent text-black'
                                : 'bg-hyt-card text-gray-400 hover:text-white'
                        }`}
                    >
                        Mes commandes ({orders.length})
                    </button>
                </motion.div>

                {/* Content */}
                {activeTab === 'requests' ? (
                    <div className="space-y-4">
                        {requests.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-16 bg-hyt-card rounded-xl border border-hyt-border"
                            >
                                <PenTool className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    Aucune demande
                                </h3>
                                <p className="text-gray-400 mb-6">
                                    Vous n'avez pas encore fait de demande sur mesure
                                </p>
                                <Link to="/custom-orders/new" className="btn-primary inline-flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Créer ma première demande
                                </Link>
                            </motion.div>
                        ) : (
                            requests.map((request, index) => (
                                <motion.div
                                    key={request.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        to={`/custom-orders/requests/${request.id}`}
                                        className="block bg-hyt-card border border-hyt-border rounded-xl p-6 hover:border-hyt-accent/30 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-white truncate">
                                                        {request.title}
                                                    </h3>
                                                    <StatusBadge status={request.status} />
                                                </div>

                                                <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                                                    {request.description}
                                                </p>

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                    {request.game_name && (
                                                        <span className="flex items-center gap-1">
                                                            <Gamepad2 className="w-4 h-4" />
                                                            {request.game_name}
                                                        </span>
                                                    )}
                                                    {request.category_name && (
                                                        <span className="flex items-center gap-1">
                                                            <FolderOpen className="w-4 h-4" />
                                                            {request.category_name}
                                                        </span>
                                                    )}
                                                    {(request.budget_min || request.budget_max) && (
                                                        <span className="flex items-center gap-1">
                                                            <Euro className="w-4 h-4" />
                                                            {request.budget_min && request.budget_max
                                                                ? `${request.budget_min}€ - ${request.budget_max}€`
                                                                : request.budget_max
                                                                    ? `Max ${request.budget_max}€`
                                                                    : `Min ${request.budget_min}€`
                                                            }
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(request.created_at).toLocaleDateString('fr-FR')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {request.offers_count > 0 && (
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-hyt-accent">{request.offers_count}</p>
                                                        <p className="text-xs text-gray-500">offre{request.offers_count > 1 ? 's' : ''}</p>
                                                    </div>
                                                )}
                                                <ArrowRight className="w-5 h-5 text-gray-500" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-16 bg-hyt-card rounded-xl border border-hyt-border"
                            >
                                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    Aucune commande
                                </h3>
                                <p className="text-gray-400">
                                    Vous n'avez pas encore de commande en cours
                                </p>
                            </motion.div>
                        ) : (
                            orders.map((order, index) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        to={`/custom-orders/orders/${order.id}`}
                                        className="block bg-hyt-card border border-hyt-border rounded-xl p-6 hover:border-hyt-accent/30 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-white truncate">
                                                        {order.request_title}
                                                    </h3>
                                                    <StatusBadge status={order.status} />
                                                </div>

                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-hyt-dark">
                                                        {order.creator_avatar ? (
                                                            <img
                                                                src={order.creator_avatar.startsWith('http') ? order.creator_avatar : `http://localhost:3001${order.creator_avatar}`}
                                                                alt={order.creator_username}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-hyt-accent to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                                                {order.creator_username?.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-gray-400">
                                                        par <span className="text-white">{order.creator_username}</span>
                                                    </span>
                                                </div>

                                                {/* Progress bar */}
                                                <div className="mb-3">
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className="text-gray-500">Progression</span>
                                                        <span className="text-white font-medium">{order.progress || 0}%</span>
                                                    </div>
                                                    <div className="h-2 bg-hyt-dark rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-hyt-accent to-purple-500 transition-all"
                                                            style={{ width: `${order.progress || 0}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Euro className="w-4 h-4" />
                                                        {parseFloat(order.total_price).toFixed(2)}€
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                                    </span>
                                                    {order.first_payment_paid && !order.second_payment_paid && (
                                                        <span className="text-orange-400">50% payé</span>
                                                    )}
                                                    {order.second_payment_paid && (
                                                        <span className="text-green-400">100% payé</span>
                                                    )}
                                                </div>
                                            </div>

                                            <ArrowRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}