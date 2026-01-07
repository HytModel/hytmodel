import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft, Clock, CheckCircle, XCircle, Euro, Calendar,
    Gamepad2, FolderOpen, FileText, Loader2, User, Star,
    MessageSquare, Download, AlertCircle, PenTool, Users
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

const offerStatusConfig = {
    PENDING: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400' },
    ACCEPTED: { label: 'Acceptée', color: 'bg-green-500/20 text-green-400' },
    REJECTED: { label: 'Refusée', color: 'bg-red-500/20 text-red-400' },
    WITHDRAWN: { label: 'Retirée', color: 'bg-gray-500/20 text-gray-400' },
}

export default function CustomRequestDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [request, setRequest] = useState(null)
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(null)

    useEffect(() => {
        loadRequest()
    }, [id])

    const loadRequest = async () => {
        try {
            const { data } = await customOrdersAPI.getRequest(id)
            setRequest(data.request)

            // Charger les conversations si c'est le client
            if (data.request.client_id === user?.id) {
                try {
                    const convRes = await customOrdersAPI.getRequestConversations(id)
                    setConversations(convRes.data.conversations || [])
                } catch (e) {
                    console.error('Failed to load conversations:', e)
                }
            }
        } catch (error) {
            console.error('Failed to load request:', error)
            toast.error('Demande non trouvée')
            navigate('/custom-orders')
        } finally {
            setLoading(false)
        }
    }

    const handleAcceptOffer = async (offerId) => {
        if (!confirm('Accepter cette offre ? Les autres offres seront automatiquement refusées.')) return

        setActionLoading(offerId)
        try {
            const { data } = await customOrdersAPI.acceptOffer(offerId)
            toast.success('Offre acceptée ! Vous pouvez maintenant procéder au paiement.')
            navigate(`/custom-orders/${data.order.id}`)
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de l\'acceptation')
        } finally {
            setActionLoading(null)
        }
    }

    const handleRejectOffer = async (offerId) => {
        if (!confirm('Refuser cette offre ?')) return

        setActionLoading(offerId)
        try {
            await customOrdersAPI.rejectOffer(offerId)
            toast.success('Offre refusée')
            loadRequest()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setActionLoading(null)
        }
    }

    // Contacter un créateur qui a fait une offre
    const handleContactCreator = async (creatorId) => {
        try {
            const { data } = await customOrdersAPI.startConversation({
                request_id: id,
                creator_id: creatorId
            })
            navigate(`/custom-orders/conversation/${data.conversation.id}`)
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de la création de la conversation')
        }
    }

    const StatusBadge = ({ status, config = statusConfig }) => {
        const cfg = config[status] || config.PENDING
        const Icon = cfg.icon
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${cfg.color}`}>
                {Icon && <Icon className="w-4 h-4" />}
                {cfg.label}
            </span>
        )
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-hyt-dark pt-20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
            </div>
        )
    }

    if (!request) return null

    const attachments = typeof request.attachments === 'string'
        ? JSON.parse(request.attachments)
        : request.attachments || []

    return (
        <div className="min-h-screen bg-hyt-dark pt-20 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link
                        to="/custom-orders"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour aux demandes
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-display font-bold text-white mb-2">
                                {request.title}
                            </h1>
                            <StatusBadge status={request.status} />
                        </div>

                        <div className="text-right text-sm text-gray-400">
                            <p>Créée le {new Date(request.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Colonne principale */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="card"
                        >
                            <h2 className="text-lg font-semibold text-white mb-4">Description</h2>
                            <p className="text-gray-300 whitespace-pre-wrap">{request.description}</p>
                        </motion.div>

                        {/* Pièces jointes */}
                        {attachments.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="card"
                            >
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    Pièces jointes ({attachments.length})
                                </h2>
                                <div className="space-y-2">
                                    {attachments.map((file, index) => (
                                        <a
                                            key={index}
                                            href={`http://localhost:3001${file.path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-3 bg-hyt-dark rounded-lg hover:bg-hyt-border/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-gray-500" />
                                                <div>
                                                    <p className="text-white text-sm">{file.originalname}</p>
                                                    <p className="text-gray-500 text-xs">{formatFileSize(file.size)}</p>
                                                </div>
                                            </div>
                                            <Download className="w-4 h-4 text-gray-400" />
                                        </a>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Message si en attente */}
                        {request.status === 'PENDING' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-yellow-400 font-medium">En attente de validation</p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            Notre équipe examine votre demande. Vous serez notifié dès qu'elle sera approuvée.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Message si refusée */}
                        {request.status === 'REJECTED' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-red-400 font-medium">Demande refusée</p>
                                        {request.staff_notes && (
                                            <p className="text-gray-400 text-sm mt-1">
                                                Raison : {request.staff_notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Offres reçues */}
                        {request.offers && request.offers.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="card"
                            >
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    Offres reçues ({request.offers.length})
                                </h2>
                                <div className="space-y-4">
                                    {request.offers.map((offer) => (
                                        <div
                                            key={offer.id}
                                            className={`p-4 rounded-xl border ${
                                                offer.status === 'ACCEPTED'
                                                    ? 'bg-green-500/10 border-green-500/30'
                                                    : offer.status === 'REJECTED'
                                                        ? 'bg-red-500/10 border-red-500/30 opacity-60'
                                                        : 'bg-hyt-dark border-hyt-border'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-hyt-accent to-purple-500 flex items-center justify-center flex-shrink-0">
                                                        {offer.creator_avatar ? (
                                                            <img
                                                                src={offer.creator_avatar.startsWith('http') ? offer.creator_avatar : `http://localhost:3001${offer.creator_avatar}`}
                                                                alt={offer.creator_username}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-lg font-bold text-white">
                                                                {offer.creator_username?.charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium text-white">{offer.creator_username}</p>
                                                            {offer.is_hytmodel_creator && (
                                                                <span className="px-2 py-0.5 text-xs bg-hyt-accent/20 text-hyt-accent rounded-full">
                                                                    HytModel
                                                                </span>
                                                            )}
                                                        </div>
                                                        {offer.completed_orders > 0 && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                                <span>{offer.completed_orders} commandes</span>
                                                                {offer.average_rating > 0 && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                                        {offer.average_rating.toFixed(1)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-white">
                                                        {parseFloat(offer.price).toFixed(2)}€
                                                    </p>
                                                    <p className="text-sm text-gray-400">
                                                        {offer.estimated_days} jour{offer.estimated_days > 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="mt-3 text-gray-300 text-sm">{offer.message}</p>

                                            <div className="mt-4 flex items-center justify-between">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${offerStatusConfig[offer.status]?.color || ''}`}>
                                                    {offerStatusConfig[offer.status]?.label || offer.status}
                                                </span>

                                                {offer.status === 'PENDING' && request.client_id === user?.id && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleContactCreator(offer.creator_id)}
                                                            className="px-4 py-2 text-sm text-gray-400 hover:bg-hyt-dark rounded-lg transition-colors flex items-center gap-2"
                                                        >
                                                            <MessageSquare className="w-4 h-4" />
                                                            Contacter
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectOffer(offer.id)}
                                                            disabled={actionLoading === offer.id}
                                                            className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        >
                                                            Refuser
                                                        </button>
                                                        <button
                                                            onClick={() => handleAcceptOffer(offer.id)}
                                                            disabled={actionLoading === offer.id}
                                                            className="px-4 py-2 text-sm bg-hyt-accent text-black font-medium rounded-lg hover:bg-hyt-accent/90 transition-colors flex items-center gap-2"
                                                        >
                                                            {actionLoading === offer.id && <Loader2 className="w-4 h-4 animate-spin" />}
                                                            Accepter
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Aucune offre */}
                        {request.status === 'APPROVED' && (!request.offers || request.offers.length === 0) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 text-center"
                            >
                                <Users className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                                <p className="text-white font-medium">En recherche de créateur</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Votre demande est visible par nos créateurs affiliés. Vous recevrez bientôt des offres !
                                </p>
                            </motion.div>
                        )}

                        {/* Conversations avec les créateurs */}
                        {conversations.length > 0 && request.client_id === user?.id && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="card"
                            >
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-hyt-accent" />
                                    Conversations ({conversations.length})
                                </h2>
                                <div className="space-y-3">
                                    {conversations.map((conv) => (
                                        <Link
                                            key={conv.id}
                                            to={`/custom-orders/conversation/${conv.id}`}
                                            className="flex items-center gap-3 p-3 bg-hyt-dark rounded-xl hover:bg-hyt-border/50 transition-colors"
                                        >
                                            {/* Avatar créateur */}
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-hyt-accent to-purple-500 flex items-center justify-center flex-shrink-0">
                                                {conv.creator_avatar ? (
                                                    <img
                                                        src={conv.creator_avatar.startsWith('http') ? conv.creator_avatar : `http://localhost:3001${conv.creator_avatar}`}
                                                        alt={conv.creator_username}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-bold text-white">
                                                        {conv.creator_username?.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Infos */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-white">{conv.creator_username}</p>
                                                    {conv.client_unread_count > 0 && (
                                                        <span className="px-1.5 py-0.5 bg-hyt-accent text-black text-xs font-bold rounded-full">
                                                            {conv.client_unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                                {conv.last_message && (
                                                    <p className="text-sm text-gray-400 truncate">
                                                        {conv.last_message}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Offre liée */}
                                            {conv.offer_id && (
                                                <div className="text-right">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                        conv.offer_status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            conv.offer_status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                                                                'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                        {conv.offer_status === 'PENDING' ? `${Number(conv.offer_price).toFixed(0)}€` :
                                                            conv.offer_status === 'ACCEPTED' ? 'Acceptée' : 'Refusée'}
                                                    </span>
                                                </div>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Infos */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="card"
                        >
                            <h3 className="font-semibold text-white mb-4">Informations</h3>
                            <div className="space-y-3">
                                {request.game_name && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Gamepad2 className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-400">Jeu :</span>
                                        <span className="text-white">{request.game_name}</span>
                                    </div>
                                )}
                                {request.category_name && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <FolderOpen className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-400">Catégorie :</span>
                                        <span className="text-white">{request.category_name}</span>
                                    </div>
                                )}
                                {(request.budget_min || request.budget_max) && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Euro className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-400">Budget :</span>
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
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-400">Deadline :</span>
                                        <span className="text-white">
                                            {new Date(request.deadline).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Info commission */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-hyt-accent/10 border border-hyt-accent/30 rounded-xl p-4"
                        >
                            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-hyt-accent" />
                                Bon à savoir
                            </h3>
                            <ul className="text-sm text-gray-400 space-y-1">
                                <li>• Paiement en 2 fois : 50% + 50%</li>
                                <li>• Annulation : 50% de l'acompte remboursé</li>
                                <li>• Fichiers accessibles après paiement complet</li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}