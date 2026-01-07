import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Send, Paperclip, Loader2, User, Clock,
    MessageSquare, Euro, Calendar, CheckCircle, X, XCircle,
    FileText, AlertCircle, CreditCard, Lock
} from 'lucide-react'
import { customOrdersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/LanguageContext'
import toast from 'react-hot-toast'

const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `http://localhost:3001${url}`
}

// Composant Message
function MessageBubble({ message, isOwn, t }) {
    const attachments = typeof message.attachments === 'string'
        ? JSON.parse(message.attachments)
        : message.attachments || []

    // Détecter les messages système
    const isSystemMessage = message.content?.startsWith('💰') ||
        message.content?.startsWith('✅') ||
        message.content?.startsWith('❌') ||
        message.content?.startsWith('🔒')

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

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                {!isOwn && (
                    <div className="flex items-center gap-2 mb-1">
                        {message.sender_avatar ? (
                            <img
                                src={getImageUrl(message.sender_avatar)}
                                alt={message.sender_username}
                                className="w-6 h-6 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-hyt-dark flex items-center justify-center">
                                <User className="w-3 h-3 text-gray-400" />
                            </div>
                        )}
                        <span className="text-sm text-gray-400">{message.sender_username}</span>
                    </div>
                )}

                <div className={`rounded-2xl px-4 py-2 ${
                    isOwn
                        ? 'bg-hyt-accent text-black rounded-br-md'
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
                                    {file.originalname || `${t('conversation.file')} ${i + 1}`}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                    {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </p>
            </div>
        </div>
    )
}

// Modal pour faire une offre (créateur)
function MakeOfferModal({ onClose, onSubmit, loading, existingOffer }) {
    const { t } = useTranslation()
    const [price, setPrice] = useState(existingOffer ? (existingOffer.price / 100).toString() : '')
    const [days, setDays] = useState(existingOffer?.estimated_days?.toString() || '')
    const [message, setMessage] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!price || parseFloat(price) < 5) {
            toast.error(t('conversation.offerModal.errors.minPrice'))
            return
        }
        if (!days || parseInt(days) < 1) {
            toast.error(t('conversation.offerModal.errors.minDays'))
            return
        }
        onSubmit({
            price: Math.round(parseFloat(price) * 100),
            estimated_days: parseInt(days),
            message: message.trim()
        })
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-hyt-card border border-hyt-border rounded-xl w-full max-w-md">
                <div className="p-4 border-b border-hyt-border flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Euro className="w-5 h-5 text-hyt-accent" />
                        {existingOffer ? t('conversation.offerModal.editTitle') : t('conversation.offerModal.title')}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">{t('conversation.offerModal.priceLabel')} *</label>
                        <div className="relative">
                            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="number"
                                min="5"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="input-field w-full pl-10"
                                placeholder="Ex: 50"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">{t('conversation.offerModal.daysLabel')} *</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="number"
                                min="1"
                                value={days}
                                onChange={(e) => setDays(e.target.value)}
                                className="input-field w-full pl-10"
                                placeholder="Ex: 7"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">{t('conversation.offerModal.messageLabel')}</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="input-field w-full resize-none"
                            rows={3}
                            placeholder={t('conversation.offerModal.messagePlaceholder')}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="btn-ghost flex-1">
                            {t('common.cancel')}
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {t('conversation.offerModal.send')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Modal pour refuser une offre (client)
function RejectOfferModal({ onClose, onSubmit, loading }) {
    const { t } = useTranslation()
    const [reason, setReason] = useState('')
    const [closeConversation, setCloseConversation] = useState(false)

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-hyt-card border border-hyt-border rounded-xl w-full max-w-md">
                <div className="p-4 border-b border-hyt-border flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-500" />
                        {t('conversation.rejectModal.title')}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">{t('conversation.rejectModal.reasonLabel')}</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="input-field w-full resize-none"
                            rows={3}
                            placeholder={t('conversation.rejectModal.reasonPlaceholder')}
                        />
                    </div>

                    <label className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg cursor-pointer">
                        <input
                            type="checkbox"
                            checked={closeConversation}
                            onChange={(e) => setCloseConversation(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <div>
                            <p className="text-red-400 font-medium">{t('conversation.rejectModal.closeDefinitely')}</p>
                            <p className="text-gray-400 text-sm">{t('conversation.rejectModal.closeHint')}</p>
                        </div>
                    </label>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="btn-ghost flex-1">
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={() => onSubmit(reason, closeConversation)}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            {closeConversation ? t('conversation.rejectModal.rejectAndClose') : t('conversation.rejectModal.reject')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Modal pour clôturer la conversation (créateur)
function CloseConversationModal({ onClose, onSubmit, loading }) {
    const { t } = useTranslation()
    const [reason, setReason] = useState('')

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-hyt-card border border-hyt-border rounded-xl w-full max-w-md">
                <div className="p-4 border-b border-hyt-border flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Lock className="w-5 h-5 text-orange-500" />
                        {t('conversation.closeModal.title')}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                        <p className="text-orange-400 text-sm">
                            ⚠️ {t('conversation.closeModal.warning')}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">{t('conversation.closeModal.reasonLabel')}</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="input-field w-full resize-none"
                            rows={3}
                            placeholder={t('conversation.closeModal.reasonPlaceholder')}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="btn-ghost flex-1">
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={() => onSubmit(reason)}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                            {t('conversation.closeModal.close')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Composant principal
export default function CustomOrderConversation() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { t } = useTranslation()
    const messagesEndRef = useRef(null)
    const fileInputRef = useRef(null)

    const [conversation, setConversation] = useState(null)
    const [messages, setMessages] = useState([])
    const [existingOffer, setExistingOffer] = useState(null)
    const [isClient, setIsClient] = useState(false)
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    const [newMessage, setNewMessage] = useState('')
    const [attachments, setAttachments] = useState([])
    const [showOfferModal, setShowOfferModal] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [showCloseModal, setShowCloseModal] = useState(false)

    useEffect(() => {
        loadConversation()
        const interval = setInterval(loadMessages, 5000)
        return () => clearInterval(interval)
    }, [id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const loadConversation = async () => {
        try {
            const { data } = await customOrdersAPI.getConversation(id)
            setConversation(data.conversation)
            setMessages(data.messages || [])
            setExistingOffer(data.existing_offer)
            setIsClient(data.is_client)
        } catch (error) {
            toast.error(t('conversation.errors.loadFailed'))
            navigate('/custom-orders')
        } finally {
            setLoading(false)
        }
    }

    const loadMessages = async () => {
        if (!id) return
        try {
            const { data } = await customOrdersAPI.getConversation(id)
            setMessages(data.messages || [])
            setExistingOffer(data.existing_offer)
            setConversation(data.conversation)
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
            attachments.forEach(file => formData.append('attachments', file))

            const { data } = await customOrdersAPI.sendConversationMessage(id, formData)
            setMessages([...messages, data.message])
            setNewMessage('')
            setAttachments([])
        } catch (error) {
            toast.error(t('conversation.errors.sendFailed'))
        } finally {
            setSending(false)
        }
    }

    const handleMakeOffer = async (offerData) => {
        setActionLoading(true)
        try {
            await customOrdersAPI.makeConversationOffer(id, offerData)
            toast.success(t('conversation.success.offerSent'))
            setShowOfferModal(false)
            loadConversation()
        } catch (error) {
            toast.error(error.response?.data?.error || t('conversation.errors.generic'))
        } finally {
            setActionLoading(false)
        }
    }

    const handleAcceptOffer = async () => {
        if (!confirm(t('conversation.confirmAcceptOffer'))) return

        setActionLoading(true)
        try {
            const { data } = await customOrdersAPI.acceptConversationOffer(id)
            toast.success(t('conversation.success.offerAccepted'))
            loadConversation()
        } catch (error) {
            toast.error(error.response?.data?.error || t('conversation.errors.generic'))
        } finally {
            setActionLoading(false)
        }
    }

    const handleRejectOffer = async (reason, closeConversation) => {
        setActionLoading(true)
        try {
            await customOrdersAPI.rejectConversationOffer(id, { reason, close_conversation: closeConversation })
            toast.success(closeConversation ? t('conversation.success.conversationClosed') : t('conversation.success.offerRejected'))
            setShowRejectModal(false)
            if (closeConversation) {
                navigate('/custom-orders')
            } else {
                loadConversation()
            }
        } catch (error) {
            toast.error(error.response?.data?.error || t('conversation.errors.generic'))
        } finally {
            setActionLoading(false)
        }
    }

    // Créateur clôture la conversation
    const handleCloseConversation = async (reason) => {
        setActionLoading(true)
        try {
            await customOrdersAPI.closeConversation(id, { reason })
            toast.success(t('conversation.success.conversationClosed'))
            setShowCloseModal(false)
            navigate('/dashboard')
        } catch (error) {
            toast.error(error.response?.data?.error || t('conversation.errors.generic'))
        } finally {
            setActionLoading(false)
        }
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files)
        if (files.length + attachments.length > 5) {
            toast.error(t('conversation.errors.maxFiles'))
            return
        }
        setAttachments([...attachments, ...files])
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
            </div>
        )
    }

    if (!conversation) return null

    const isClosed = conversation.status === 'CLOSED'
    const otherUser = isClient
        ? { username: conversation.creator_username, avatar: conversation.creator_avatar }
        : { username: conversation.client_username, avatar: conversation.client_avatar }

    return (
        <div className="min-h-screen pt-20 flex flex-col">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col px-4 py-4">
                {/* Header */}
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-hyt-dark rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>

                        {otherUser.avatar ? (
                            <img
                                src={getImageUrl(otherUser.avatar)}
                                alt={otherUser.username}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-hyt-dark flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-400" />
                            </div>
                        )}

                        <div className="flex-1">
                            <h2 className="font-semibold text-white">{otherUser.username}</h2>
                            <p className="text-sm text-gray-400">{conversation.request_title}</p>
                        </div>

                        {/* Statut */}
                        {isClosed ? (
                            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm flex items-center gap-1">
                                <Lock className="w-4 h-4" />
                                {t('conversation.status.closed')}
                            </span>
                        ) : existingOffer?.status === 'ACCEPTED' ? (
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                                ✓ {t('conversation.status.offerAccepted')}
                            </span>
                        ) : existingOffer?.status === 'PENDING' ? (
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                                {t('conversation.status.offer')}: {(existingOffer.price / 100).toFixed(0)}€
                            </span>
                        ) : null}

                        {/* Bouton clôturer pour le créateur */}
                        {!isClient && !isClosed && existingOffer?.status !== 'ACCEPTED' && (
                            <button
                                onClick={() => setShowCloseModal(true)}
                                className="px-3 py-1 text-orange-400 hover:bg-orange-500/10 rounded-lg text-sm flex items-center gap-1 transition-colors"
                                title={t('conversation.closeModal.title')}
                            >
                                <Lock className="w-4 h-4" />
                                {t('conversation.close')}
                            </button>
                        )}
                    </div>

                    {/* Barre d'actions pour offre en attente */}
                    {existingOffer?.status === 'PENDING' && !isClosed && (
                        <div className="mt-4 pt-4 border-t border-hyt-border">
                            {isClient ? (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium">
                                            {t('conversation.status.offer')} : {(existingOffer.price / 100).toFixed(2)}€
                                        </p>
                                        <p className="text-gray-400 text-sm">
                                            {t('conversation.delay')} : {existingOffer.estimated_days} {t('conversation.days')}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowRejectModal(true)}
                                            className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            {t('conversation.reject')}
                                        </button>
                                        <button
                                            onClick={handleAcceptOffer}
                                            disabled={actionLoading}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                                        >
                                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                            {t('conversation.accept')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <p className="text-yellow-400">
                                        <Clock className="w-4 h-4 inline mr-1" />
                                        {t('conversation.awaitingClientResponse')}
                                    </p>
                                    <button
                                        onClick={() => setShowOfferModal(true)}
                                        className="text-sm text-gray-400 hover:text-white"
                                    >
                                        {t('conversation.modifyOffer')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bouton paiement après acceptation */}
                    {existingOffer?.status === 'ACCEPTED' && isClient && !isClosed && (
                        <div className="mt-4 pt-4 border-t border-hyt-border">
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-green-400 font-medium">{t('conversation.offerAccepted')}</p>
                                    <p className="text-gray-400 text-sm">{t('conversation.payDepositToStart')}</p>
                                </div>
                                <button
                                    onClick={() => toast.success(t('conversation.redirectingToPayment'))}
                                    className="px-4 py-2 bg-hyt-accent text-black font-medium rounded-lg hover:bg-hyt-accent/90 flex items-center gap-2"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    {t('conversation.pay')} {(existingOffer.price / 100 / 2).toFixed(2)}€
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Zone de messages */}
                <div className="flex-1 bg-hyt-card border border-hyt-border rounded-xl p-4 overflow-y-auto mb-4 min-h-[400px] max-h-[500px]">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                            <MessageSquare className="w-12 h-12 mb-4" />
                            <p>{t('conversation.noMessages')}</p>
                            <p className="text-sm">{t('conversation.startConversation')}</p>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg) => (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg}
                                    isOwn={msg.sender_id === user?.id}
                                    t={t}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Bannière si clôturée */}
                {isClosed && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 text-center">
                        <Lock className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <p className="text-red-400 font-medium">{t('conversation.conversationClosed')}</p>
                        {conversation.close_reason && (
                            <p className="text-gray-400 text-sm mt-1">{conversation.close_reason}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-2">
                            {t('conversation.willBeDeleted')}
                        </p>
                    </div>
                )}

                {/* Pièces jointes en attente */}
                {attachments.length > 0 && !isClosed && (
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-3 mb-2">
                        <div className="flex flex-wrap gap-2">
                            {attachments.map((file, i) => (
                                <div key={i} className="flex items-center gap-2 bg-hyt-dark px-3 py-1 rounded-lg text-sm">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span className="text-white truncate max-w-[150px]">{file.name}</span>
                                    <button
                                        onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Zone de saisie */}
                {!isClosed && (
                    <form onSubmit={handleSend} className="bg-hyt-card border border-hyt-border rounded-xl p-3">
                        <div className="flex items-end gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-gray-400 hover:text-white hover:bg-hyt-dark rounded-lg transition-colors"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx,.zip,.rar"
                            />

                            {/* Bouton faire une offre (créateur seulement) */}
                            {!isClient && (
                                <button
                                    type="button"
                                    onClick={() => setShowOfferModal(true)}
                                    className="p-2 text-hyt-accent hover:bg-hyt-accent/10 rounded-lg transition-colors"
                                    title={t('conversation.makeOffer')}
                                >
                                    <Euro className="w-5 h-5" />
                                </button>
                            )}

                            <textarea
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={t('conversation.messagePlaceholder')}
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
                                className="p-2 bg-hyt-accent text-black rounded-lg hover:bg-hyt-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Modals */}
            {showOfferModal && (
                <MakeOfferModal
                    onClose={() => setShowOfferModal(false)}
                    onSubmit={handleMakeOffer}
                    loading={actionLoading}
                    existingOffer={existingOffer?.status === 'PENDING' ? existingOffer : null}
                />
            )}

            {showRejectModal && (
                <RejectOfferModal
                    onClose={() => setShowRejectModal(false)}
                    onSubmit={handleRejectOffer}
                    loading={actionLoading}
                />
            )}

            {showCloseModal && (
                <CloseConversationModal
                    onClose={() => setShowCloseModal(false)}
                    onSubmit={handleCloseConversation}
                    loading={actionLoading}
                />
            )}
        </div>
    )
}