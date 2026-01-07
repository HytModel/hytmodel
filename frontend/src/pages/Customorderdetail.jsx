import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    ArrowLeft, Send, Paperclip, Loader2, User, Clock,
    MessageSquare, Euro, Calendar, CheckCircle, X, XCircle,
    FileText, Package, Upload, CreditCard, AlertTriangle,
    Download, Eye, Lock
} from 'lucide-react'
import { customOrdersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
    WithdrawModal,
    ClaimModal,
    RevisionModal,
    DeliveryConfirmModal,
    ApproveDeliveryModal,
    RejectFixModal,
    AcceptFixModal
} from '../components/CustomOrderModals'

const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `http://localhost:3001${url}`
}

const orderStatusConfig = {
    AWAITING_PAYMENT: { label: 'En attente de paiement', color: 'bg-yellow-500/20 text-yellow-400', icon: CreditCard },
    IN_PROGRESS: { label: 'En cours', color: 'bg-blue-500/20 text-blue-400', icon: Clock },
    PENDING_REVIEW: { label: 'En attente de validation', color: 'bg-purple-500/20 text-purple-400', icon: Eye },
    AWAITING_FINAL_PAYMENT: { label: 'Paiement final requis', color: 'bg-orange-500/20 text-orange-400', icon: CreditCard },
    COMPLETED: { label: 'Terminée', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
    DISPUTED: { label: 'Litige', color: 'bg-red-500/20 text-red-400', icon: AlertTriangle },
    CANCELLED: { label: 'Annulée', color: 'bg-gray-500/20 text-gray-400', icon: XCircle },
    REFUNDED: { label: 'Remboursée', color: 'bg-gray-500/20 text-gray-400', icon: XCircle },
}

// Composant Message
function MessageBubble({ message, isOwn }) {
    const attachments = typeof message.attachments === 'string'
        ? JSON.parse(message.attachments)
        : message.attachments || []

    // Séparateur de commande
    if (message.is_separator) {
        return (
            <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-green-500/30" />
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">{message.content}</span>
                </div>
                <div className="flex-1 h-px bg-green-500/30" />
            </div>
        )
    }

    // Messages système (offres, livraisons, etc.)
    const isSystemMessage = message.message_type === 'SYSTEM' ||
        message.message_type === 'DELIVERY' ||
        message.message_type === 'PROGRESS_UPDATE' ||
        message.message_type === 'REVISION_REQUEST' ||
        message.content?.startsWith('📦') ||
        message.content?.startsWith('✅') ||
        message.content?.startsWith('💳') ||
        message.content?.startsWith('💰') ||
        message.content?.startsWith('❌') ||
        message.content?.startsWith('🔄')

    if (isSystemMessage) {
        return (
            <div className="flex justify-center mb-4">
                <div className="bg-hyt-dark/50 border border-hyt-border rounded-xl px-4 py-3 max-w-md text-center">
                    <p className="text-gray-300 whitespace-pre-wrap text-sm">{message.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        {new Date(message.created_at).toLocaleString('fr-FR')}
                    </p>
                </div>
            </div>
        )
    }

    // Messages normaux
    const isConversationMessage = message.source === 'CONVERSATION'

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[70%]`}>
                {!isOwn && (
                    <div className="flex items-center gap-2 mb-1">
                        {message.sender_avatar ? (
                            <img
                                src={getImageUrl(message.sender_avatar)}
                                alt={message.sender_username}
                                className="w-5 h-5 rounded-full object-cover"
                            />
                        ) : null}
                        <span className="text-sm text-gray-400">{message.sender_username}</span>
                        {isConversationMessage && (
                            <span className="text-xs text-gray-600">(avant commande)</span>
                        )}
                    </div>
                )}
                <div className={`rounded-2xl px-4 py-2 ${
                    isOwn
                        ? 'bg-hyt-accent text-black rounded-br-md'
                        : isConversationMessage
                            ? 'bg-hyt-dark border border-hyt-border text-white rounded-bl-md'
                            : 'bg-hyt-card border border-hyt-border text-white rounded-bl-md'
                }`}>
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    {attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {attachments.map((file, i) => (
                                <a
                                    key={i}
                                    href={getImageUrl(file.path)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 text-sm ${
                                        isOwn ? 'text-black/70 hover:text-black' : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <FileText className="w-4 h-4" />
                                    {file.originalname || `Fichier ${i + 1}`}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
                <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {new Date(message.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    )
}

export default function CustomOrderDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const messagesEndRef = useRef(null)
    const fileInputRef = useRef(null)

    const [order, setOrder] = useState(null)
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    const [newMessage, setNewMessage] = useState('')
    const [attachments, setAttachments] = useState([])

    // Fichiers de livraison (créateur)
    const [deliveryFiles, setDeliveryFiles] = useState([])
    const [deliveryMessage, setDeliveryMessage] = useState('')
    const deliveryFileInputRef = useRef(null)

    // Fichiers correctifs (créateur)
    const [fixFiles, setFixFiles] = useState([])
    const [fixMessage, setFixMessage] = useState('')
    const fixFileInputRef = useRef(null)

    // Modales
    const [showWithdrawModal, setShowWithdrawModal] = useState(false)
    const [showClaimModal, setShowClaimModal] = useState(false)
    const [showRevisionModal, setShowRevisionModal] = useState(false)
    const [showDeliveryModal, setShowDeliveryModal] = useState(false)
    const [showApproveModal, setShowApproveModal] = useState(false)

    // Correctifs reçus (pour le client)
    const [fixes, setFixes] = useState([])
    const [showRejectFixModal, setShowRejectFixModal] = useState(false)
    const [showAcceptFixModal, setShowAcceptFixModal] = useState(false)
    const [selectedFix, setSelectedFix] = useState(null)

    const isClient = order?.client_id === user?.id
    const isCreator = order?.creator_id === user?.id

    useEffect(() => {
        loadOrder()
        const interval = setInterval(loadMessages, 5000)
        return () => clearInterval(interval)
    }, [id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const loadOrder = async () => {
        try {
            const { data } = await customOrdersAPI.getOrder(id)
            console.log('Load order data:', data)
            setOrder(data.order)
            // Prendre les messages soit de data.messages, soit de data.order.messages
            const msgs = data.messages || data.order?.messages || []
            console.log('Messages loaded:', msgs.length)
            setMessages(msgs)

            // Charger les correctifs si en litige
            if (data.order?.status === 'DISPUTED') {
                loadFixes()
            }
        } catch (error) {
            toast.error('Commande non trouvée')
            navigate('/custom-orders')
        } finally {
            setLoading(false)
        }
    }

    const loadFixes = async () => {
        try {
            const { data } = await customOrdersAPI.getClaims(id)
            setFixes(data.fixes || [])
        } catch (error) {
            console.error('Failed to load fixes:', error)
        }
    }

    const loadMessages = async () => {
        if (!id) return
        try {
            const { data } = await customOrdersAPI.getOrder(id)
            // Prendre les messages soit de data.messages, soit de data.order.messages
            const msgs = data.messages || data.order?.messages || []
            setMessages(msgs)
            setOrder(data.order)
        } catch (error) {
            console.error('Failed to load messages:', error)
        }
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() && attachments.length === 0) return

        setSending(true)
        try {
            const formData = new FormData()
            formData.append('content', newMessage.trim())
            formData.append('message_type', 'MESSAGE')
            attachments.forEach(file => formData.append('attachments', file))

            await customOrdersAPI.sendOrderMessage(id, formData)
            setNewMessage('')
            setAttachments([])
            // Recharger les messages pour avoir la bonne structure
            await loadMessages()
        } catch (error) {
            toast.error('Erreur lors de l\'envoi')
        } finally {
            setSending(false)
        }
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files)
        if (files.length + attachments.length > 5) {
            toast.error('Maximum 5 fichiers')
            return
        }
        setAttachments([...attachments, ...files])
    }

    // Créateur ajoute des fichiers de livraison
    const handleDeliveryFileChange = (e) => {
        const files = Array.from(e.target.files)
        setDeliveryFiles(prev => [...prev, ...files])
    }

    // Créateur livre la commande avec fichiers
    const handleDeliver = async () => {
        if (deliveryFiles.length === 0) {
            toast.error('Veuillez ajouter au moins un fichier à livrer')
            return
        }
        setShowDeliveryModal(true)
    }

    // Confirmation de livraison
    const confirmDeliver = async () => {
        setActionLoading(true)
        try {
            const formData = new FormData()
            formData.append('message', deliveryMessage || 'Livraison effectuée !')
            deliveryFiles.forEach(file => formData.append('files', file))

            await customOrdersAPI.deliverOrderWithFiles(id, formData)
            toast.success('Commande livrée !')
            setDeliveryFiles([])
            setDeliveryMessage('')
            setShowDeliveryModal(false)
            loadOrder()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de la livraison')
        } finally {
            setActionLoading(false)
        }
    }

    // Client valide la livraison
    const handleApprove = async () => {
        setShowApproveModal(true)
    }

    // Confirmation validation
    const confirmApprove = async () => {
        setActionLoading(true)
        try {
            await customOrdersAPI.approveDelivery(id)
            toast.success('Livraison validée !')
            setShowApproveModal(false)
            loadOrder()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setActionLoading(false)
        }
    }

    // Client demande des révisions
    const handleRequestRevision = async () => {
        setShowRevisionModal(true)
    }

    // Confirmation révision
    const confirmRevision = async (reason) => {
        setActionLoading(true)
        try {
            await customOrdersAPI.requestRevision(id, { reason })
            toast.success('Demande de révision envoyée')
            setShowRevisionModal(false)
            loadOrder()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setActionLoading(false)
        }
    }

    // Client paye l'acompte (50%)
    const handlePayFirst = async () => {
        setActionLoading(true)
        try {
            const { data } = await customOrdersAPI.payFirstPayment(id)
            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de la redirection vers le paiement')
            setActionLoading(false)
        }
    }

    // Client paye le solde (50%)
    const handlePayFinal = async () => {
        setActionLoading(true)
        try {
            const { data } = await customOrdersAPI.payFinalPayment(id)
            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de la redirection vers le paiement')
            setActionLoading(false)
        }
    }

    // Client se rétracte (25% remboursé, 20% au créateur)
    const handleWithdraw = async () => {
        setShowWithdrawModal(true)
    }

    // Confirmation rétractation
    const confirmWithdraw = async (reason) => {
        setActionLoading(true)
        try {
            const { data } = await customOrdersAPI.withdrawOrder(id, { reason })
            toast.success(`Rétractation effectuée. Remboursement: ${data.client_refund.toFixed(2)}€`)
            setShowWithdrawModal(false)
            loadOrder()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setActionLoading(false)
        }
    }

    // Client ouvre une réclamation
    const handleOpenClaim = async () => {
        setShowClaimModal(true)
    }

    // Confirmation réclamation
    const confirmClaim = async (reason) => {
        setActionLoading(true)
        try {
            await customOrdersAPI.openClaim(id, { reason })
            toast.success('Réclamation envoyée. Le créateur et notre équipe ont été notifiés.')
            setShowClaimModal(false)
            loadOrder()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setActionLoading(false)
        }
    }

    // Créateur envoie un correctif
    const handleSendFix = async () => {
        if (fixFiles.length === 0) {
            toast.error('Veuillez ajouter des fichiers corrigés')
            return
        }

        setActionLoading(true)
        try {
            const formData = new FormData()
            formData.append('message', fixMessage)
            fixFiles.forEach(file => formData.append('files', file))

            await customOrdersAPI.sendFix(id, formData)
            toast.success('Correctif envoyé au client')
            setFixFiles([])
            setFixMessage('')
            loadOrder()
            loadFixes()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setActionLoading(false)
        }
    }

    // Client accepte un correctif
    const handleAcceptFix = (fix) => {
        setSelectedFix(fix)
        setShowAcceptFixModal(true)
    }

    // Confirmation accepter correctif
    const confirmAcceptFix = async () => {
        if (!selectedFix) return

        setActionLoading(true)
        try {
            await customOrdersAPI.acceptFix(id, selectedFix.id)
            toast.success('Correctif accepté ! Réclamation clôturée.')
            setShowAcceptFixModal(false)
            setSelectedFix(null)
            loadOrder()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setActionLoading(false)
        }
    }

    // Client refuse un correctif
    const handleRejectFix = (fix) => {
        setSelectedFix(fix)
        setShowRejectFixModal(true)
    }

    // Confirmation refuser correctif
    const confirmRejectFix = async (feedback) => {
        if (!selectedFix) return

        setActionLoading(true)
        try {
            await customOrdersAPI.rejectFix(id, selectedFix.id, { feedback })
            toast.success('Feedback envoyé au créateur')
            setShowRejectFixModal(false)
            setSelectedFix(null)
            loadFixes()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
            </div>
        )
    }

    if (!order) return null

    const statusCfg = orderStatusConfig[order.status] || orderStatusConfig.IN_PROGRESS
    const StatusIcon = statusCfg.icon

    const finalFiles = typeof order.final_files === 'string'
        ? JSON.parse(order.final_files)
        : order.final_files || []

    return (
        <div className="min-h-screen pt-20 pb-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">{order.request_title}</h1>
                            <p className="text-gray-400">
                                Commande avec {isClient ? order.creator_username : order.client_username}
                            </p>
                        </div>
                        <span className={`px-4 py-2 rounded-full flex items-center gap-2 ${statusCfg.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusCfg.label}
                        </span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Colonne principale - Messages */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Zone de messages */}
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-4 h-[500px] overflow-y-auto">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                    <MessageSquare className="w-12 h-12 mb-4" />
                                    <p>Aucun message</p>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg) => (
                                        <MessageBubble
                                            key={msg.id}
                                            message={msg}
                                            isOwn={msg.sender_id === user?.id}
                                        />
                                    ))}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Zone de saisie */}
                        {!['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(order.status) && (
                            <form onSubmit={handleSend} className="bg-hyt-card border border-hyt-border rounded-xl p-3">
                                {/* Bandeau litige */}
                                {order.status === 'DISPUTED' && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                        <p className="text-red-400 text-sm">
                                            Litige en cours - Continuez à communiquer pour résoudre le problème
                                        </p>
                                    </div>
                                )}
                                {attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {attachments.map((file, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-hyt-dark px-3 py-1 rounded-lg text-sm">
                                                <FileText className="w-4 h-4 text-gray-400" />
                                                <span className="text-white truncate max-w-[150px]">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex items-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-hyt-dark rounded-lg"
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Écrivez votre message..."
                                        rows={1}
                                        className="flex-1 bg-hyt-dark border border-hyt-border rounded-lg px-4 py-2 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-hyt-accent"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                handleSend(e)
                                            }
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || (!newMessage.trim() && attachments.length === 0)}
                                        className="p-2 bg-hyt-accent text-black rounded-lg hover:bg-hyt-accent/80 disabled:opacity-50"
                                    >
                                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Infos commande */}
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                            <h3 className="font-semibold text-white mb-4">Détails</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Prix total</span>
                                    <span className="text-white font-medium">{Number(order.total_price).toFixed(2)}€</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Acompte (50%)</span>
                                    <span className={order.first_payment_paid ? 'text-green-400' : 'text-yellow-400'}>
                                        {Number(order.first_payment_amount).toFixed(2)}€
                                        {order.first_payment_paid ? ' ✓' : ' (en attente)'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Solde (50%)</span>
                                    <span className={order.second_payment_paid ? 'text-green-400' : 'text-gray-400'}>
                                        {Number(order.second_payment_amount).toFixed(2)}€
                                        {order.second_payment_paid ? ' ✓' : ''}
                                    </span>
                                </div>
                                {order.estimated_delivery && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Livraison estimée</span>
                                        <span className="text-white">
                                            {new Date(order.estimated_delivery).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions selon le statut */}
                        {/* Client: Payer l'acompte */}
                        {isClient && order.status === 'AWAITING_PAYMENT' && !order.first_payment_paid && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                                <h3 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Paiement requis
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Payez l'acompte de 50% pour démarrer la commande
                                </p>
                                <button
                                    onClick={handlePayFirst}
                                    disabled={actionLoading}
                                    className="w-full btn-primary flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                                    Payer {Number(order.first_payment_amount).toFixed(2)}€
                                </button>
                            </div>
                        )}

                        {/* Créateur: Livrer avec fichiers */}
                        {isCreator && order.status === 'IN_PROGRESS' && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Livrer la commande
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Uploadez vos fichiers finaux puis livrez
                                </p>

                                {/* Zone d'upload */}
                                <div className="space-y-3">
                                    {/* Fichiers sélectionnés */}
                                    {deliveryFiles.length > 0 && (
                                        <div className="space-y-2">
                                            {deliveryFiles.map((file, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-hyt-dark px-3 py-2 rounded-lg">
                                                    <FileText className="w-4 h-4 text-blue-400" />
                                                    <span className="text-white text-sm flex-1 truncate">{file.name}</span>
                                                    <span className="text-gray-500 text-xs">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </span>
                                                    <button
                                                        onClick={() => setDeliveryFiles(deliveryFiles.filter((_, idx) => idx !== i))}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Bouton ajouter fichiers */}
                                    <button
                                        type="button"
                                        onClick={() => deliveryFileInputRef.current?.click()}
                                        className="w-full btn-ghost border-2 border-dashed border-hyt-border hover:border-blue-500 py-4 flex items-center justify-center gap-2"
                                    >
                                        <Upload className="w-5 h-5" />
                                        {deliveryFiles.length > 0 ? 'Ajouter d\'autres fichiers' : 'Sélectionner les fichiers'}
                                    </button>
                                    <input
                                        ref={deliveryFileInputRef}
                                        type="file"
                                        multiple
                                        onChange={handleDeliveryFileChange}
                                        className="hidden"
                                    />

                                    {/* Message de livraison */}
                                    <textarea
                                        value={deliveryMessage}
                                        onChange={(e) => setDeliveryMessage(e.target.value)}
                                        placeholder="Message de livraison (optionnel)..."
                                        rows={2}
                                        className="w-full bg-hyt-dark border border-hyt-border rounded-lg px-3 py-2 text-white placeholder-gray-500 resize-none text-sm"
                                    />

                                    {/* Bouton livrer */}
                                    <button
                                        onClick={handleDeliver}
                                        disabled={actionLoading || deliveryFiles.length === 0}
                                        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {actionLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4" />
                                        )}
                                        Livrer ({deliveryFiles.length} fichier{deliveryFiles.length > 1 ? 's' : ''})
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Client: Valider ou demander révision */}
                        {isClient && order.status === 'PENDING_REVIEW' && (
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                                <h3 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                                    <Eye className="w-5 h-5" />
                                    Livraison reçue
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Vérifiez le travail et validez ou demandez des modifications
                                </p>
                                <div className="space-y-2">
                                    <button
                                        onClick={handleApprove}
                                        disabled={actionLoading}
                                        className="w-full btn-primary flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Valider
                                    </button>
                                    <button
                                        onClick={handleRequestRevision}
                                        disabled={actionLoading}
                                        className="w-full btn-ghost flex items-center justify-center gap-2"
                                    >
                                        Demander des révisions
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Client: Payer le solde */}
                        {isClient && order.status === 'AWAITING_FINAL_PAYMENT' && (
                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                                <h3 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Paiement final
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Payez le solde pour finaliser la commande et accéder aux fichiers
                                </p>
                                <button
                                    onClick={handlePayFinal}
                                    disabled={actionLoading}
                                    className="w-full btn-primary flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                                    Payer {Number(order.second_payment_amount).toFixed(2)}€
                                </button>
                            </div>
                        )}

                        {/* Client: Rétractation pendant IN_PROGRESS */}
                        {isClient && order.status === 'IN_PROGRESS' && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    Rétractation
                                </h3>
                                <p className="text-gray-400 text-sm mb-2">
                                    Vous pouvez annuler la commande en cours.
                                </p>
                                <ul className="text-xs text-gray-500 mb-4 space-y-1">
                                    <li>• Vous récupérez 25% de l'acompte</li>
                                    <li>• Le créateur reçoit 20% (travail effectué)</li>
                                </ul>
                                <button
                                    onClick={handleWithdraw}
                                    disabled={actionLoading}
                                    className="w-full btn-ghost border border-red-500/50 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    Me rétracter
                                </button>
                            </div>
                        )}

                        {/* Client: Signaler un problème (après livraison ou même après résolution) */}
                        {isClient && ['COMPLETED', 'AWAITING_FINAL_PAYMENT', 'PENDING_REVIEW'].includes(order.status) && !order.has_active_claim && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                                <h3 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    Un problème ?
                                </h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Si les fichiers ne fonctionnent pas correctement, signalez-le.
                                </p>
                                {order.claim_count > 0 && (
                                    <p className="text-gray-500 text-xs mb-3">
                                        {order.claim_count} réclamation{order.claim_count > 1 ? 's' : ''} précédente{order.claim_count > 1 ? 's' : ''} résolue{order.claim_count > 1 ? 's' : ''}
                                    </p>
                                )}
                                <button
                                    onClick={handleOpenClaim}
                                    className="w-full btn-ghost border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 flex items-center justify-center gap-2"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    Signaler un problème
                                </button>
                            </div>
                        )}

                        {/* Statut: En litige */}
                        {order.status === 'DISPUTED' && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    Réclamation en cours
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {isCreator
                                        ? "Le client a signalé un problème. Veuillez envoyer un correctif."
                                        : "Votre réclamation est en cours de traitement."
                                    }
                                </p>
                            </div>
                        )}

                        {/* Client: Correctifs reçus */}
                        {isClient && order.status === 'DISPUTED' && fixes.length > 0 && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                <h3 className="font-semibold text-blue-400 mb-4 flex items-center gap-2">
                                    <Download className="w-5 h-5" />
                                    Correctifs reçus ({fixes.length})
                                </h3>
                                <div className="space-y-4">
                                    {fixes.map((fix) => {
                                        const fixFiles = typeof fix.files === 'string' ? JSON.parse(fix.files) : fix.files || []
                                        return (
                                            <div key={fix.id} className="bg-hyt-dark rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-white font-medium text-sm">
                                                        Version {fix.version}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(fix.created_at).toLocaleString('fr-FR')}
                                                    </span>
                                                </div>

                                                {fix.message && (
                                                    <p className="text-gray-400 text-sm mb-3">{fix.message}</p>
                                                )}

                                                {/* Fichiers téléchargeables */}
                                                <div className="space-y-2 mb-3">
                                                    {fixFiles.map((file, i) => (
                                                        <a
                                                            key={i}
                                                            href={getImageUrl(file.path)}
                                                            download={file.originalname}
                                                            className="flex items-center gap-2 p-2 bg-hyt-card rounded-lg hover:bg-hyt-border/50 transition-colors"
                                                        >
                                                            <FileText className="w-4 h-4 text-blue-400" />
                                                            <span className="text-white text-sm flex-1 truncate">
                                                                {file.originalname}
                                                            </span>
                                                            <Download className="w-4 h-4 text-gray-400" />
                                                        </a>
                                                    ))}
                                                </div>

                                                {/* Statut du correctif */}
                                                {fix.is_accepted === true && (
                                                    <div className="text-green-400 text-sm flex items-center gap-1">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Accepté
                                                    </div>
                                                )}
                                                {fix.is_accepted === false && (
                                                    <div className="text-red-400 text-sm flex items-center gap-1">
                                                        <XCircle className="w-4 h-4" />
                                                        Refusé {fix.client_feedback && `- ${fix.client_feedback}`}
                                                    </div>
                                                )}

                                                {/* Boutons d'action si pas encore traité */}
                                                {fix.is_accepted === null && (
                                                    <div className="flex gap-2 mt-3">
                                                        <button
                                                            onClick={() => handleAcceptFix(fix)}
                                                            disabled={actionLoading}
                                                            className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-1"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Accepter
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectFix(fix)}
                                                            disabled={actionLoading}
                                                            className="flex-1 btn-ghost border border-red-500/50 text-red-400 text-sm py-2 flex items-center justify-center gap-1"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            Refuser
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Créateur: Envoyer correctif (si litige) */}
                        {isCreator && order.status === 'DISPUTED' && (
                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                                <h3 className="font-semibold text-orange-400 mb-2 flex items-center gap-2">
                                    <Upload className="w-5 h-5" />
                                    Envoyer un correctif
                                </h3>
                                <div className="space-y-3">
                                    {/* Fichiers correctifs */}
                                    {fixFiles.length > 0 && (
                                        <div className="space-y-2">
                                            {fixFiles.map((file, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-hyt-dark px-3 py-2 rounded-lg">
                                                    <FileText className="w-4 h-4 text-orange-400" />
                                                    <span className="text-white text-sm flex-1 truncate">{file.name}</span>
                                                    <button
                                                        onClick={() => setFixFiles(fixFiles.filter((_, idx) => idx !== i))}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => fixFileInputRef.current?.click()}
                                        className="w-full btn-ghost border-2 border-dashed border-hyt-border hover:border-orange-500 py-3 flex items-center justify-center gap-2"
                                    >
                                        <Upload className="w-5 h-5" />
                                        {fixFiles.length > 0 ? 'Ajouter des fichiers' : 'Sélectionner fichiers corrigés'}
                                    </button>
                                    <input
                                        ref={fixFileInputRef}
                                        type="file"
                                        multiple
                                        onChange={(e) => setFixFiles([...fixFiles, ...Array.from(e.target.files)])}
                                        className="hidden"
                                    />

                                    <textarea
                                        value={fixMessage}
                                        onChange={(e) => setFixMessage(e.target.value)}
                                        placeholder="Expliquez les corrections apportées..."
                                        rows={2}
                                        className="w-full bg-hyt-dark border border-hyt-border rounded-lg px-3 py-2 text-white placeholder-gray-500 resize-none text-sm"
                                    />

                                    <button
                                        onClick={handleSendFix}
                                        disabled={actionLoading || fixFiles.length === 0}
                                        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        Envoyer le correctif
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Fichiers finaux */}
                        {finalFiles.length > 0 && order.status === 'COMPLETED' && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                                <h3 className="font-semibold text-green-400 mb-4 flex items-center gap-2">
                                    <Download className="w-5 h-5" />
                                    Fichiers finaux
                                </h3>
                                <div className="space-y-2">
                                    {finalFiles.map((file, i) => (
                                        <a
                                            key={i}
                                            href={getImageUrl(file.path)}
                                            download
                                            className="flex items-center gap-3 p-2 bg-hyt-dark rounded-lg hover:bg-hyt-border/50"
                                        >
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <span className="text-white text-sm flex-1 truncate">
                                                {file.originalname}
                                            </span>
                                            <Download className="w-4 h-4 text-gray-400" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Commande terminée */}
                        {order.status === 'COMPLETED' && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                                <p className="text-green-400 font-medium">Commande terminée !</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Merci pour votre confiance
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modales */}
            <WithdrawModal
                isOpen={showWithdrawModal}
                onClose={() => setShowWithdrawModal(false)}
                onConfirm={confirmWithdraw}
                order={order}
                loading={actionLoading}
            />

            <ClaimModal
                isOpen={showClaimModal}
                onClose={() => setShowClaimModal(false)}
                onSubmit={confirmClaim}
                loading={actionLoading}
            />

            <RevisionModal
                isOpen={showRevisionModal}
                onClose={() => setShowRevisionModal(false)}
                onSubmit={confirmRevision}
                loading={actionLoading}
            />

            <DeliveryConfirmModal
                isOpen={showDeliveryModal}
                onClose={() => setShowDeliveryModal(false)}
                onConfirm={confirmDeliver}
                filesCount={deliveryFiles.length}
                loading={actionLoading}
            />

            <ApproveDeliveryModal
                isOpen={showApproveModal}
                onClose={() => setShowApproveModal(false)}
                onConfirm={confirmApprove}
                order={order}
                loading={actionLoading}
            />

            <RejectFixModal
                isOpen={showRejectFixModal}
                onClose={() => {
                    setShowRejectFixModal(false)
                    setSelectedFix(null)
                }}
                onSubmit={confirmRejectFix}
                fix={selectedFix}
                loading={actionLoading}
            />

            <AcceptFixModal
                isOpen={showAcceptFixModal}
                onClose={() => {
                    setShowAcceptFixModal(false)
                    setSelectedFix(null)
                }}
                onConfirm={confirmAcceptFix}
                fix={selectedFix}
                loading={actionLoading}
            />
        </div>
    )
}