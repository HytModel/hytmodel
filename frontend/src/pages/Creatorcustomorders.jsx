import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    PenTool, Clock, CheckCircle, XCircle, Euro, Send,
    Loader2, Eye, MessageSquare, Calendar, User, Gamepad2,
    Tag, FileText, ChevronDown, ChevronUp, ExternalLink,
    DollarSign, Package, AlertCircle
} from 'lucide-react'
import { customOrdersAPI } from '../services/api'
import toast from 'react-hot-toast'

// Fonction pour l'URL des images
const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `http://localhost:3001${url}`
}

// Badge de statut pour les demandes
function RequestStatusBadge({ status }) {
    const config = {
        APPROVED: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle, label: 'Disponible' },
        ASSIGNED: { color: 'bg-blue-500/20 text-blue-400', icon: User, label: 'Assignée' },
        IN_PROGRESS: { color: 'bg-purple-500/20 text-purple-400', icon: Clock, label: 'En cours' },
        COMPLETED: { color: 'bg-gray-500/20 text-gray-400', icon: CheckCircle, label: 'Terminée' },
    }
    const c = config[status] || config.APPROVED
    const Icon = c.icon

    return (
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.color}`}>
            <Icon className="w-3 h-3" />
            {c.label}
        </span>
    )
}

// Badge de statut pour les commandes
function OrderStatusBadge({ status }) {
    const config = {
        AWAITING_PAYMENT: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Attente paiement' },
        IN_PROGRESS: { color: 'bg-blue-500/20 text-blue-400', label: 'En cours' },
        AWAITING_FINAL_PAYMENT: { color: 'bg-orange-500/20 text-orange-400', label: 'Attente solde' },
        COMPLETED: { color: 'bg-green-500/20 text-green-400', label: 'Terminée' },
        CANCELLED: { color: 'bg-red-500/20 text-red-400', label: 'Annulée' },
        DISPUTED: { color: 'bg-red-500/20 text-red-400', label: 'Litige' },
    }
    const c = config[status] || { color: 'bg-gray-500/20 text-gray-400', label: status }

    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.color}`}>
            {c.label}
        </span>
    )
}

// Modal pour faire une offre
function MakeOfferModal({ request, onClose, onSuccess }) {
    const [price, setPrice] = useState('')
    const [estimatedDays, setEstimatedDays] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!price || parseFloat(price) < 5) {
            toast.error('Prix minimum: 5€')
            return
        }
        if (!estimatedDays || parseInt(estimatedDays) < 1) {
            toast.error('Délai minimum: 1 jour')
            return
        }
        if (!message.trim() || message.length < 20) {
            toast.error('Message trop court (min 20 caractères)')
            return
        }

        setLoading(true)
        try {
            await customOrdersAPI.makeOffer({
                request_id: request.id,      // avec underscore !
                price: Math.round(parseFloat(price)),
                estimated_days: parseInt(estimatedDays),  // avec underscore !
                message: message.trim()
            })
            toast.success('Offre envoyée !')
            onSuccess()
            onClose()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-hyt-card border border-hyt-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-hyt-border">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Send className="w-5 h-5 text-hyt-accent" />
                        Faire une offre
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                        Pour: {request.title}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Budget du client */}
                    <div className="bg-hyt-dark rounded-lg p-4">
                        <p className="text-sm text-gray-400">Budget du client</p>
                        <p className="text-2xl font-bold text-white">
                            {request.budget_min && request.budget_max ? (
                                `${(request.budget_min / 100).toFixed(0)}€ - ${(request.budget_max / 100).toFixed(0)}€`
                            ) : request.budget_max ? (
                                `Max ${(request.budget_max / 100).toFixed(0)}€`
                            ) : (
                                'Non spécifié'
                            )}
                        </p>
                    </div>

                    {/* Prix proposé */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Votre prix (€) *
                        </label>
                        <div className="relative">
                            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="number"
                                min="5"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="Ex: 50"
                                className="input-field w-full pl-10"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Le client paiera 50% à la commande, 50% à la livraison
                        </p>
                    </div>

                    {/* Délai estimé */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Délai estimé (jours) *
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="number"
                                min="1"
                                max="365"
                                value={estimatedDays}
                                onChange={(e) => setEstimatedDays(e.target.value)}
                                placeholder="Ex: 7"
                                className="input-field w-full pl-10"
                                required
                            />
                        </div>
                        {request.deadline && (
                            <p className="text-xs text-orange-400 mt-1">
                                ⚠️ Deadline client: {new Date(request.deadline).toLocaleDateString('fr-FR')}
                            </p>
                        )}
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Message au client *
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Présentez votre approche, vos compétences, posez des questions si nécessaire..."
                            rows={5}
                            className="input-field w-full resize-none"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {message.length}/20 caractères minimum
                        </p>
                    </div>

                    {/* Boutons */}
                    <div className="flex gap-3 pt-4">
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
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            Envoyer l'offre
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Carte de demande disponible
function AvailableRequestCard({ request, onMakeOffer, onContact }) {
    const [expanded, setExpanded] = useState(false)

    // Déterminer le statut de l'interaction du créateur avec cette demande
    const hasConversation = !!request.my_conversation_id
    const hasOffer = !!request.my_offer_id
    const offerStatus = request.my_offer_status
    const conversationStatus = request.my_conversation_status

    return (
        <div className={`bg-hyt-card border rounded-xl overflow-hidden ${
            hasConversation && request.unread_messages > 0
                ? 'border-hyt-accent/50'
                : 'border-hyt-border'
        }`}>
            {/* Header */}
            <div
                className="p-4 cursor-pointer hover:bg-hyt-dark/30 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-semibold text-white">{request.title}</h3>
                            <RequestStatusBadge status={request.status} />

                            {/* Badge statut interaction */}
                            {hasConversation && conversationStatus === 'OPEN' && (
                                <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                                    En discussion
                                </span>
                            )}
                            {hasOffer && offerStatus === 'PENDING' && (
                                <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                                    Offre envoyée
                                </span>
                            )}
                            {hasOffer && offerStatus === 'ACCEPTED' && (
                                <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                                    ✓ Acceptée
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            {request.game_name && (
                                <span className="flex items-center gap-1">
                                    <Gamepad2 className="w-4 h-4" />
                                    {request.game_name}
                                </span>
                            )}
                            {request.category_name && (
                                <span className="flex items-center gap-1">
                                    <Tag className="w-4 h-4" />
                                    {request.category_name}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(request.created_at).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Badge messages non lus */}
                        {request.unread_messages > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-hyt-accent/20 rounded-full animate-pulse">
                                <MessageSquare className="w-4 h-4 text-hyt-accent" />
                                <span className="text-xs font-bold text-hyt-accent">{request.unread_messages}</span>
                            </div>
                        )}

                        {/* Budget */}
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Budget</p>
                            <p className="font-bold text-hyt-accent">
                                {request.budget_min && request.budget_max ? (
                                    `${Number(request.budget_min).toFixed(0)}€ - ${Number(request.budget_max).toFixed(0)}€`
                                ) : request.budget_max ? (
                                    `Max ${Number(request.budget_max).toFixed(0)}€`
                                ) : (
                                    'À définir'
                                )}
                            </p>
                        </div>

                        {expanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                </div>
            </div>

            {/* Détails expandés */}
            {expanded && (
                <div className="px-4 pb-4 border-t border-hyt-border pt-4 space-y-4">
                    {/* Description */}
                    <div>
                        <p className="text-sm text-gray-400 mb-1">Description</p>
                        <p className="text-white whitespace-pre-wrap">{request.description}</p>
                    </div>

                    {/* Deadline */}
                    {request.deadline && (
                        <div className="flex items-center gap-2 text-orange-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                                Deadline: {new Date(request.deadline).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                    )}

                    {/* Pièces jointes */}
                    {request.attachments?.length > 0 && (
                        <div>
                            <p className="text-sm text-gray-400 mb-2">Pièces jointes</p>
                            <div className="flex flex-wrap gap-2">
                                {request.attachments.map((file, i) => (
                                    <a
                                        key={i}
                                        href={getImageUrl(file)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 px-3 py-1 bg-hyt-dark rounded-lg text-sm text-gray-300 hover:text-white"
                                    >
                                        <FileText className="w-4 h-4" />
                                        Fichier {i + 1}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Info offres */}
                    <div className="flex items-center justify-between pt-2">
                        <p className="text-sm text-gray-400">
                            {request.offers_count || 0} offre(s) reçue(s)
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onContact(request)
                                }}
                                className={`btn-ghost flex items-center gap-2 ${request.unread_messages > 0 ? 'text-hyt-accent' : ''}`}
                            >
                                <MessageSquare className="w-4 h-4" />
                                {request.my_conversation_id ? 'Messages' : 'Contacter'}
                                {request.unread_messages > 0 && (
                                    <span className="bg-hyt-accent text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                                        {request.unread_messages}
                                    </span>
                                )}
                            </button>
                            {!request.my_offer_id && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onMakeOffer(request)
                                    }}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Faire une offre
                                </button>
                            )}
                            {request.my_offer_id && (
                                <span className="px-3 py-2 bg-green-500/20 text-green-400 text-sm rounded-lg">
                                    ✓ Offre envoyée
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Carte de négociation en cours
function NegotiationCard({ conversation, onClick }) {
    const getImageUrl = (url) => {
        if (!url) return null
        if (url.startsWith('http')) return url
        return `http://localhost:3001${url}`
    }

    return (
        <div
            onClick={onClick}
            className="bg-hyt-card border border-hyt-border rounded-xl p-4 cursor-pointer hover:border-hyt-accent/50 transition-colors"
        >
            <div className="flex items-start gap-4">
                {/* Avatar client */}
                {conversation.client_avatar ? (
                    <img
                        src={getImageUrl(conversation.client_avatar)}
                        alt={conversation.client_username}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hyt-accent to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-white">
                            {conversation.client_username?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}

                {/* Infos */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white truncate">{conversation.request_title}</h3>
                        {conversation.creator_unread_count > 0 && (
                            <span className="px-1.5 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                                {conversation.creator_unread_count}
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-gray-400">
                        Client : {conversation.client_username}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-sm">
                        {conversation.budget_min && conversation.budget_max && (
                            <span className="text-gray-400">
                                <Euro className="w-4 h-4 inline mr-1" />
                                {Number(conversation.budget_min).toFixed(0)}€ - {Number(conversation.budget_max).toFixed(0)}€
                            </span>
                        )}
                        {conversation.game_name && (
                            <span className="text-gray-400">
                                <Gamepad2 className="w-4 h-4 inline mr-1" />
                                {conversation.game_name}
                            </span>
                        )}
                    </div>
                </div>

                {/* Statut offre */}
                <div className="text-right">
                    {conversation.offer_status === 'PENDING' ? (
                        <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                            Offre: {Number(conversation.offer_price).toFixed(2)}€
                        </div>
                    ) : conversation.offer_id ? (
                        <div className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">
                            Offre refusée
                        </div>
                    ) : (
                        <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                            En discussion
                        </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        {new Date(conversation.last_message_at).toLocaleDateString('fr-FR')}
                    </p>
                </div>
            </div>
        </div>
    )
}

// Carte de commande en cours
function ActiveOrderCard({ order, onDeliver }) {
    const [expanded, setExpanded] = useState(false)
    const [delivering, setDelivering] = useState(false)
    const [deliveryMessage, setDeliveryMessage] = useState('')
    const [showDeliverForm, setShowDeliverForm] = useState(false)

    const handleDeliver = async () => {
        if (!deliveryMessage.trim()) {
            toast.error('Ajoutez un message de livraison')
            return
        }

        setDelivering(true)
        try {
            await customOrdersAPI.deliverOrder(order.id, { message: deliveryMessage })
            toast.success('Livraison envoyée ! En attente du paiement final.')
            onDeliver()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setDelivering(false)
        }
    }

    return (
        <div className="bg-hyt-card border border-hyt-border rounded-xl overflow-hidden">
            {/* Header */}
            <div
                className="p-4 cursor-pointer hover:bg-hyt-dark/30 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-semibold text-white">{order.request_title}</h3>
                            <OrderStatusBadge status={order.status} />
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {order.client_username}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.created_at).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Montant</p>
                            <p className="font-bold text-green-500">
                                {Number(order.total_price).toFixed(2)}€
                            </p>
                        </div>

                        {expanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                </div>
            </div>

            {/* Détails expandés */}
            {expanded && (
                <div className="px-4 pb-4 border-t border-hyt-border pt-4 space-y-4">
                    {/* Statut paiement */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-hyt-dark rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Acompte (50%)</p>
                            <p className={`font-semibold ${order.first_payment_paid ? 'text-green-400' : 'text-yellow-400'}`}>
                                {order.first_payment_paid ? '✓ Payé' : 'En attente'}
                            </p>
                        </div>
                        <div className="bg-hyt-dark rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Solde (50%)</p>
                            <p className={`font-semibold ${order.second_payment_paid ? 'text-green-400' : 'text-gray-400'}`}>
                                {order.second_payment_paid ? '✓ Payé' : 'Après livraison'}
                            </p>
                        </div>
                    </div>

                    {/* Actions selon statut */}
                    {order.status === 'IN_PROGRESS' && !showDeliverForm && (
                        <div className="flex gap-3">
                            <Link
                                to={`/custom-orders/orders/${order.id}`}
                                className="btn-ghost flex-1 flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Messages
                            </Link>
                            <button
                                onClick={() => setShowDeliverForm(true)}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                <Package className="w-4 h-4" />
                                Livrer
                            </button>
                        </div>
                    )}
                    {!['COMPLETED', 'CANCELLED'].includes(order.status) && (
                        <div className="flex gap-3">
                            <Link
                                to={`/custom-orders/orders/${order.id}`}
                                className="btn-ghost flex-1 flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Messages
                            </Link>
                            {order.status === 'IN_PROGRESS' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowDeliverForm(true)
                                    }}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    <Package className="w-4 h-4" />
                                    Livrer
                                </button>
                            )}
                        </div>
                    )}

                    {/* Formulaire de livraison */}
                    {showDeliverForm && (
                        <div className="space-y-3">
                            <textarea
                                value={deliveryMessage}
                                onChange={(e) => setDeliveryMessage(e.target.value)}
                                placeholder="Message de livraison, instructions, liens de téléchargement..."
                                rows={4}
                                className="input-field w-full resize-none"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeliverForm(false)}
                                    className="btn-ghost flex-1"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDeliver}
                                    disabled={delivering}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600"
                                >
                                    {delivering ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4" />
                                    )}
                                    Confirmer la livraison
                                </button>
                            </div>
                        </div>
                    )}

                    {order.status === 'AWAITING_FINAL_PAYMENT' && (
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
                            <Clock className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                            <p className="text-orange-400 font-medium">En attente du paiement final</p>
                            <p className="text-orange-400/70 text-sm">Le client doit payer le solde pour finaliser</p>
                        </div>
                    )}

                    {order.status === 'COMPLETED' && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                            <p className="text-green-400 font-medium">Commande terminée !</p>
                            <p className="text-green-400/70 text-sm">Le paiement a été versé sur votre compte</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// Composant principal
export default function CreatorCustomOrders() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('requests') // requests, negotiations, orders
    const [requests, setRequests] = useState([])
    const [activeConversations, setActiveConversations] = useState([]) // Négociations en cours
    const [orders, setOrders] = useState([])
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)
    const [offerModal, setOfferModal] = useState(null)

    // Stats
    const [stats, setStats] = useState({
        availableRequests: 0,
        activeNegotiations: 0,
        activeOrders: 0,
        completedOrders: 0,
        totalEarned: 0,
        unreadMessages: 0
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [requestsRes, ordersRes, conversationsRes] = await Promise.all([
                customOrdersAPI.getAvailableRequests().catch(() => ({ data: { requests: [], active_conversations: [] } })),
                customOrdersAPI.getCreatorOrders().catch(() => ({ data: { orders: [] } })),
                customOrdersAPI.getMyConversations().catch(() => ({ data: { conversations: [], total_unread: 0 } }))
            ])

            const requestsData = requestsRes.data.requests || []
            const activeConvData = requestsRes.data.active_conversations || []
            const ordersData = ordersRes.data.orders || []
            const conversationsData = conversationsRes.data.conversations || []
            const totalUnread = conversationsRes.data.total_unread || 0

            setRequests(requestsData)
            setActiveConversations(activeConvData)
            setOrders(ordersData)
            setConversations(conversationsData)

            // Calculer les stats
            setStats({
                availableRequests: requestsData.length,
                activeNegotiations: activeConvData.length,
                activeOrders: ordersData.filter(o => ['IN_PROGRESS', 'AWAITING_FINAL_PAYMENT'].includes(o.status)).length,
                completedOrders: ordersData.filter(o => o.status === 'COMPLETED').length,
                totalEarned: ordersData
                    .filter(o => o.status === 'COMPLETED')
                    .reduce((sum, o) => sum + (o.creator_amount || 0), 0),
                unreadMessages: totalUnread
            })
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Démarrer une conversation avec le client ou aller à la conversation existante
    const handleContact = async (request) => {
        // Si une conversation existe déjà, y aller directement
        if (request.my_conversation_id) {
            navigate(`/custom-orders/conversation/${request.my_conversation_id}`)
            return
        }

        // Sinon, créer une nouvelle conversation
        try {
            const { data } = await customOrdersAPI.startConversation({
                request_id: request.id
            })
            navigate(`/custom-orders/conversation/${data.conversation.id}`)
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de la création de la conversation')
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
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-hyt-accent/20 flex items-center justify-center">
                            <PenTool className="w-5 h-5 text-hyt-accent" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.availableRequests}</p>
                            <p className="text-xs text-gray-400">Demandes disponibles</p>
                        </div>
                    </div>
                </div>
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.activeOrders}</p>
                            <p className="text-xs text-gray-400">En cours</p>
                        </div>
                    </div>
                </div>
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.completedOrders}</p>
                            <p className="text-xs text-gray-400">Terminées</p>
                        </div>
                    </div>
                </div>
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-500">
                                {(stats.totalEarned / 100).toFixed(0)}€
                            </p>
                            <p className="text-xs text-gray-400">Revenus sur mesure</p>
                        </div>
                    </div>
                </div>
                {stats.unreadMessages > 0 && (
                    <div className="bg-hyt-card border border-hyt-accent/30 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-hyt-accent/20 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-hyt-accent" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-hyt-accent">{stats.unreadMessages}</p>
                                <p className="text-xs text-gray-400">Messages non lus</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-hyt-border">
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-3 font-medium transition-colors relative ${
                        activeTab === 'requests' ? 'text-hyt-accent' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Demandes disponibles
                    {stats.availableRequests > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-hyt-accent text-black text-xs font-bold rounded-full">
                            {stats.availableRequests}
                        </span>
                    )}
                    {activeTab === 'requests' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('negotiations')}
                    className={`px-4 py-3 font-medium transition-colors relative ${
                        activeTab === 'negotiations' ? 'text-hyt-accent' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Négociations
                    {stats.activeNegotiations > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-full">
                            {stats.activeNegotiations}
                        </span>
                    )}
                    {stats.unreadMessages > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                            {stats.unreadMessages}
                        </span>
                    )}
                    {activeTab === 'negotiations' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-3 font-medium transition-colors relative ${
                        activeTab === 'orders' ? 'text-hyt-accent' : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Mes commandes
                    {stats.activeOrders > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                            {stats.activeOrders}
                        </span>
                    )}
                    {activeTab === 'orders' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                    )}
                </button>
            </div>

            {/* Contenu */}
            {activeTab === 'requests' ? (
                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                            <PenTool className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-white font-medium">Aucune demande disponible</p>
                            <p className="text-gray-400 text-sm mt-1">
                                Les nouvelles demandes apparaîtront ici
                            </p>
                        </div>
                    ) : (
                        requests.map(request => (
                            <AvailableRequestCard
                                key={request.id}
                                request={request}
                                onMakeOffer={setOfferModal}
                                onContact={handleContact}
                            />
                        ))
                    )}
                </div>
            ) : activeTab === 'negotiations' ? (
                <div className="space-y-4">
                    {activeConversations.length === 0 ? (
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-white font-medium">Aucune négociation en cours</p>
                            <p className="text-gray-400 text-sm mt-1">
                                Contactez des clients pour commencer à négocier
                            </p>
                        </div>
                    ) : (
                        activeConversations.map(conv => (
                            <NegotiationCard
                                key={conv.id}
                                conversation={conv}
                                onClick={() => navigate(`/custom-orders/conversation/${conv.id}`)}
                            />
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                            <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-white font-medium">Aucune commande</p>
                            <p className="text-gray-400 text-sm mt-1">
                                Vos commandes sur mesure apparaîtront ici
                            </p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <ActiveOrderCard
                                key={order.id}
                                order={order}
                                onDeliver={loadData}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Modal d'offre */}
            {offerModal && (
                <MakeOfferModal
                    request={offerModal}
                    onClose={() => setOfferModal(null)}
                    onSuccess={loadData}
                />
            )}
        </div>
    )
}