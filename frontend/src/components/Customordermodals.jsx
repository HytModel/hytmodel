import React, { useState, useEffect } from 'react'
import { X, AlertTriangle, CheckCircle, XCircle, Info, Loader2 } from 'lucide-react'

// ==================== MODAL DE BASE ====================
export function Modal({ isOpen, onClose, children, size = 'md' }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative bg-hyt-card border border-hyt-border rounded-2xl w-full ${sizeClasses[size]} shadow-2xl transform transition-all`}
                style={{ animation: 'modalFadeIn 0.2s ease-out' }}
            >
                <style>{`
                    @keyframes modalFadeIn {
                        from {
                            opacity: 0;
                            transform: scale(0.95);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                `}</style>
                {children}
            </div>
        </div>
    )
}

// ==================== MODAL DE CONFIRMATION ====================
export function ConfirmModal({
                                 isOpen,
                                 onClose,
                                 onConfirm,
                                 title,
                                 message,
                                 confirmText = 'Confirmer',
                                 cancelText = 'Annuler',
                                 variant = 'danger', // 'danger', 'warning', 'success', 'info'
                                 loading = false,
                                 children // Pour contenu personnalisé
                             }) {
    const variants = {
        danger: {
            icon: XCircle,
            iconBg: 'bg-red-500/20',
            iconColor: 'text-red-400',
            buttonClass: 'bg-red-500 hover:bg-red-600 text-white'
        },
        warning: {
            icon: AlertTriangle,
            iconBg: 'bg-yellow-500/20',
            iconColor: 'text-yellow-400',
            buttonClass: 'bg-yellow-500 hover:bg-yellow-600 text-black'
        },
        success: {
            icon: CheckCircle,
            iconBg: 'bg-green-500/20',
            iconColor: 'text-green-400',
            buttonClass: 'bg-green-500 hover:bg-green-600 text-white'
        },
        info: {
            icon: Info,
            iconBg: 'bg-blue-500/20',
            iconColor: 'text-blue-400',
            buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white'
        }
    }

    const v = variants[variant]
    const Icon = v.icon

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="p-6">
                {/* Icône */}
                <div className={`w-16 h-16 ${v.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${v.iconColor}`} />
                </div>

                {/* Titre */}
                <h3 className="text-xl font-bold text-white text-center mb-2">
                    {title}
                </h3>

                {/* Message */}
                {message && (
                    <p className="text-gray-400 text-center mb-4">
                        {message}
                    </p>
                )}

                {/* Contenu personnalisé */}
                {children}

                {/* Boutons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-hyt-dark border border-hyt-border rounded-xl text-white hover:bg-hyt-border transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${v.buttonClass}`}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

// ==================== MODAL AVEC INPUT ====================
export function PromptModal({
                                isOpen,
                                onClose,
                                onSubmit,
                                title,
                                message,
                                placeholder = '',
                                submitText = 'Envoyer',
                                cancelText = 'Annuler',
                                variant = 'info',
                                loading = false,
                                required = false,
                                minLength = 0,
                                multiline = false,
                                rows = 3
                            }) {
    const [value, setValue] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isOpen) {
            setValue('')
            setError('')
        }
    }, [isOpen])

    const handleSubmit = () => {
        if (required && !value.trim()) {
            setError('Ce champ est requis')
            return
        }
        if (minLength && value.trim().length < minLength) {
            setError(`Minimum ${minLength} caractères requis`)
            return
        }
        onSubmit(value)
    }

    const variants = {
        danger: {
            icon: XCircle,
            iconBg: 'bg-red-500/20',
            iconColor: 'text-red-400',
            buttonClass: 'bg-red-500 hover:bg-red-600 text-white'
        },
        warning: {
            icon: AlertTriangle,
            iconBg: 'bg-yellow-500/20',
            iconColor: 'text-yellow-400',
            buttonClass: 'bg-yellow-500 hover:bg-yellow-600 text-black'
        },
        success: {
            icon: CheckCircle,
            iconBg: 'bg-green-500/20',
            iconColor: 'text-green-400',
            buttonClass: 'bg-green-500 hover:bg-green-600 text-white'
        },
        info: {
            icon: Info,
            iconBg: 'bg-blue-500/20',
            iconColor: 'text-blue-400',
            buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white'
        }
    }

    const v = variants[variant]
    const Icon = v.icon

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 ${v.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${v.iconColor}`} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">
                            {title}
                        </h3>
                        {message && (
                            <p className="text-gray-400 text-sm mt-1">
                                {message}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Input */}
                <div className="mb-4">
                    {multiline ? (
                        <textarea
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value)
                                setError('')
                            }}
                            placeholder={placeholder}
                            rows={rows}
                            className={`w-full bg-hyt-dark border rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-hyt-accent transition-colors ${error ? 'border-red-500' : 'border-hyt-border'}`}
                        />
                    ) : (
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value)
                                setError('')
                            }}
                            placeholder={placeholder}
                            className={`w-full bg-hyt-dark border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-hyt-accent transition-colors ${error ? 'border-red-500' : 'border-hyt-border'}`}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                    )}
                    {error && (
                        <p className="text-red-400 text-sm mt-2">{error}</p>
                    )}
                    {minLength > 0 && (
                        <p className={`text-xs mt-2 ${value.length >= minLength ? 'text-green-400' : 'text-gray-500'}`}>
                            {value.length}/{minLength} caractères minimum
                        </p>
                    )}
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-hyt-dark border border-hyt-border rounded-xl text-white hover:bg-hyt-border transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${v.buttonClass}`}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            submitText
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

// ==================== MODAL DE RÉTRACTATION ====================
export function WithdrawModal({ isOpen, onClose, onConfirm, order, loading }) {
    const [reason, setReason] = useState('')

    const clientRefund = order ? Number(order.first_payment_amount) * 0.25 : 0
    const creatorPayment = order ? Number(order.first_payment_amount) * 0.20 : 0

    useEffect(() => {
        if (!isOpen) setReason('')
    }, [isOpen])

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-7 h-7 text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Se rétracter</h3>
                        <p className="text-gray-400 text-sm">Cette action est irréversible</p>
                    </div>
                </div>

                {/* Détails remboursement */}
                <div className="bg-hyt-dark rounded-xl p-4 mb-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Acompte payé</span>
                        <span className="text-white font-medium">
                            {order ? Number(order.first_payment_amount).toFixed(2) : 0}€
                        </span>
                    </div>
                    <div className="border-t border-hyt-border pt-3 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Vous récupérez (25%)</span>
                            <span className="text-green-400 font-medium">+{clientRefund.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Créateur reçoit (20%)</span>
                            <span className="text-yellow-400 font-medium">{creatorPayment.toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Frais plateforme (5%)</span>
                            <span className="text-gray-500 font-medium">
                                {(Number(order?.first_payment_amount || 0) * 0.05).toFixed(2)}€
                            </span>
                        </div>
                    </div>
                </div>

                {/* Raison */}
                <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">
                        Raison de la rétractation (optionnel)
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Expliquez pourquoi vous souhaitez annuler..."
                        rows={3}
                        className="w-full bg-hyt-dark border border-hyt-border rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-hyt-accent"
                    />
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-hyt-dark border border-hyt-border rounded-xl text-white hover:bg-hyt-border transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={() => onConfirm(reason)}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <XCircle className="w-4 h-4" />
                                Confirmer la rétractation
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

// ==================== MODAL DE RÉCLAMATION ====================
export function ClaimModal({ isOpen, onClose, onSubmit, loading }) {
    const [reason, setReason] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isOpen) {
            setReason('')
            setError('')
        }
    }, [isOpen])

    const handleSubmit = () => {
        if (reason.trim().length < 20) {
            setError('Veuillez décrire le problème plus en détail (min 20 caractères)')
            return
        }
        onSubmit(reason)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-7 h-7 text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Signaler un problème</h3>
                        <p className="text-gray-400 text-sm">Le créateur et notre équipe seront notifiés</p>
                    </div>
                </div>

                {/* Info */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                    <p className="text-blue-400 text-sm">
                        💡 Si les fichiers ne fonctionnent pas correctement, décrivez précisément le problème.
                        Le créateur pourra vous envoyer une version corrigée.
                    </p>
                </div>

                {/* Raison */}
                <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">
                        Décrivez le problème rencontré *
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value)
                            setError('')
                        }}
                        placeholder="Ex: Le fichier ne s'ouvre pas, il manque des textures, les dimensions ne correspondent pas..."
                        rows={4}
                        className={`w-full bg-hyt-dark border rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-hyt-accent transition-colors ${error ? 'border-red-500' : 'border-hyt-border'}`}
                    />
                    {error && (
                        <p className="text-red-400 text-sm mt-2">{error}</p>
                    )}
                    <p className={`text-xs mt-2 ${reason.length >= 20 ? 'text-green-400' : 'text-gray-500'}`}>
                        {reason.length}/20 caractères minimum
                    </p>
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-hyt-dark border border-hyt-border rounded-xl text-white hover:bg-hyt-border transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || reason.length < 20}
                        className="flex-1 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <AlertTriangle className="w-4 h-4" />
                                Envoyer la réclamation
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

// ==================== MODAL DE RÉVISION ====================
export function RevisionModal({ isOpen, onClose, onSubmit, loading }) {
    const [reason, setReason] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isOpen) {
            setReason('')
            setError('')
        }
    }, [isOpen])

    const handleSubmit = () => {
        if (!reason.trim()) {
            setError('Veuillez décrire les modifications souhaitées')
            return
        }
        onSubmit(reason)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <Info className="w-7 h-7 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Demander des révisions</h3>
                        <p className="text-gray-400 text-sm">Le créateur sera notifié</p>
                    </div>
                </div>

                {/* Raison */}
                <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">
                        Quelles modifications souhaitez-vous ? *
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value)
                            setError('')
                        }}
                        placeholder="Décrivez précisément les changements que vous aimeriez voir..."
                        rows={4}
                        className={`w-full bg-hyt-dark border rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-hyt-accent transition-colors ${error ? 'border-red-500' : 'border-hyt-border'}`}
                    />
                    {error && (
                        <p className="text-red-400 text-sm mt-2">{error}</p>
                    )}
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-hyt-dark border border-hyt-border rounded-xl text-white hover:bg-hyt-border transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !reason.trim()}
                        className="flex-1 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            'Envoyer la demande'
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

// ==================== MODAL DE CONFIRMATION LIVRAISON ====================
export function DeliveryConfirmModal({ isOpen, onClose, onConfirm, filesCount, loading }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="p-6">
                {/* Icône */}
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-blue-400" />
                </div>

                {/* Titre */}
                <h3 className="text-xl font-bold text-white text-center mb-2">
                    Confirmer la livraison ?
                </h3>

                {/* Message */}
                <p className="text-gray-400 text-center mb-2">
                    Vous allez livrer <span className="text-white font-medium">{filesCount} fichier{filesCount > 1 ? 's' : ''}</span>
                </p>
                <p className="text-gray-500 text-sm text-center mb-6">
                    Le client pourra ensuite valider ou demander des modifications.
                </p>

                {/* Boutons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-hyt-dark border border-hyt-border rounded-xl text-white hover:bg-hyt-border transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Livrer
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

// ==================== MODAL DE VALIDATION LIVRAISON ====================
export function ApproveDeliveryModal({ isOpen, onClose, onConfirm, order, loading }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="p-6">
                {/* Icône */}
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                </div>

                {/* Titre */}
                <h3 className="text-xl font-bold text-white text-center mb-2">
                    Valider la livraison ?
                </h3>

                {/* Message */}
                <p className="text-gray-400 text-center mb-4">
                    En validant, vous confirmez que le travail correspond à vos attentes.
                </p>

                {/* Info paiement */}
                <div className="bg-hyt-dark rounded-xl p-4 mb-6">
                    <p className="text-gray-400 text-sm text-center">
                        Prochaine étape : paiement du solde
                    </p>
                    <p className="text-white font-bold text-lg text-center mt-1">
                        {order ? Number(order.second_payment_amount).toFixed(2) : 0}€
                    </p>
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-hyt-dark border border-hyt-border rounded-xl text-white hover:bg-hyt-border transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Valider
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

// ==================== MODAL REFUSER CORRECTIF ====================
export function RejectFixModal({ isOpen, onClose, onSubmit, fix, loading }) {
    const [feedback, setFeedback] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isOpen) {
            setFeedback('')
            setError('')
        }
    }, [isOpen])

    const handleSubmit = () => {
        if (!feedback.trim()) {
            setError('Veuillez expliquer pourquoi le correctif ne convient pas')
            return
        }
        onSubmit(feedback)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center">
                        <XCircle className="w-7 h-7 text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Refuser le correctif</h3>
                        <p className="text-gray-400 text-sm">Version {fix?.version || '?'}</p>
                    </div>
                </div>

                {/* Info */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                    <p className="text-blue-400 text-sm">
                        💡 Expliquez précisément ce qui ne fonctionne pas pour que le créateur puisse corriger efficacement.
                    </p>
                </div>

                {/* Feedback */}
                <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">
                        Qu'est-ce qui ne va pas ? *
                    </label>
                    <textarea
                        value={feedback}
                        onChange={(e) => {
                            setFeedback(e.target.value)
                            setError('')
                        }}
                        placeholder="Ex: Le fichier ne s'ouvre toujours pas, les couleurs ne correspondent pas à ma demande, il manque encore..."
                        rows={4}
                        className={`w-full bg-hyt-dark border rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-hyt-accent transition-colors ${error ? 'border-red-500' : 'border-hyt-border'}`}
                    />
                    {error && (
                        <p className="text-red-400 text-sm mt-2">{error}</p>
                    )}
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-hyt-dark border border-hyt-border rounded-xl text-white hover:bg-hyt-border transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !feedback.trim()}
                        className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <XCircle className="w-4 h-4" />
                                Refuser et envoyer
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

// ==================== MODAL ACCEPTER CORRECTIF ====================
export function AcceptFixModal({ isOpen, onClose, onConfirm, fix, loading }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="p-6">
                {/* Icône */}
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                </div>

                {/* Titre */}
                <h3 className="text-xl font-bold text-white text-center mb-2">
                    Accepter le correctif ?
                </h3>

                {/* Message */}
                <p className="text-gray-400 text-center mb-2">
                    Version {fix?.version || '?'}
                </p>
                <p className="text-gray-500 text-sm text-center mb-6">
                    En acceptant, la réclamation sera clôturée et les fichiers corrigés remplaceront les fichiers finaux.
                </p>

                {/* Info */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                    <p className="text-green-400 text-sm text-center">
                        ✅ Vous pourrez télécharger les fichiers corrigés une fois le paiement effectué
                    </p>
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-hyt-dark border border-hyt-border rounded-xl text-white hover:bg-hyt-border transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                Accepter
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default Modal