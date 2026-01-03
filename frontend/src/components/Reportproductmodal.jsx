import React, { useState } from 'react'
import { AlertTriangle, X, Loader2, Bug, AlertCircle, Copyright, Ban, HelpCircle, FileText } from 'lucide-react'
import { feedbackAPI } from '../services/api'
import toast from 'react-hot-toast'

// Raisons disponibles AVANT achat (éléments visibles)
const PRE_PURCHASE_REASONS = [
    { value: 'COPYRIGHT', label: 'Vol de contenu', icon: Copyright, description: 'Le produit utilise du contenu volé ou protégé' },
    { value: 'MISLEADING', label: 'Description trompeuse', icon: FileText, description: 'Le titre ou la description est mensonger' },
    { value: 'INAPPROPRIATE', label: 'Contenu inapproprié', icon: Ban, description: 'Images ou texte offensant/inapproprié' },
]

// Raisons disponibles APRÈS achat (éléments téléchargés)
const POST_PURCHASE_REASONS = [
    { value: 'BUG', label: 'Bug / Erreur technique', icon: Bug, description: 'Le produit ne fonctionne pas correctement' },
    { value: 'ERROR', label: 'Fichiers manquants / corrompus', icon: AlertCircle, description: 'Des fichiers sont absents ou endommagés' },
    { value: 'MISLEADING', label: 'Description trompeuse', icon: FileText, description: 'Le produit ne correspond pas à la description' },
    { value: 'COPYRIGHT', label: 'Vol de contenu', icon: Copyright, description: 'Le produit utilise du contenu volé ou protégé' },
    { value: 'INAPPROPRIATE', label: 'Contenu inapproprié', icon: Ban, description: 'Le produit contient du contenu offensant' },
    { value: 'OTHER', label: 'Autre raison', icon: HelpCircle, description: 'Précisez dans la description' },
]

export default function ReportProductModal({ isOpen, onClose, modelId, modelTitle, hasPurchased = false }) {
    const [reason, setReason] = useState('')
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Sélectionner les raisons selon si l'utilisateur a acheté ou non
    const availableReasons = hasPurchased ? POST_PURCHASE_REASONS : PRE_PURCHASE_REASONS

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!reason) {
            toast.error('Veuillez sélectionner une raison')
            return
        }

        if ((reason === 'OTHER' || !hasPurchased) && !description.trim()) {
            toast.error('Veuillez décrire le problème')
            return
        }

        setSubmitting(true)
        try {
            await feedbackAPI.reportProduct({
                modelId,
                reason,
                description: description.trim() || null
            })
            toast.success('Signalement envoyé ! Le staff et le vendeur ont été notifiés.')
            onClose()
            setReason('')
            setDescription('')
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors du signalement')
        } finally {
            setSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-hyt-card border border-hyt-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-hyt-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Signaler un problème</h3>
                            <p className="text-gray-400 text-sm truncate max-w-[250px]">{modelTitle}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
                    {/* Info si pas acheté */}
                    {!hasPurchased && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm">
                            <p className="text-blue-400">
                                <strong>Note :</strong> Vous n'avez pas encore acheté ce produit.
                                Seuls les signalements concernant les éléments visibles sont disponibles.
                            </p>
                        </div>
                    )}

                    {/* Raisons */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-3">Type de problème *</label>
                        <div className="space-y-2">
                            {availableReasons.map((r) => (
                                <label
                                    key={r.value}
                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                        reason === r.value
                                            ? 'border-hyt-accent bg-hyt-accent/10'
                                            : 'border-hyt-border hover:border-hyt-accent/50'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r.value}
                                        checked={reason === r.value}
                                        onChange={(e) => setReason(e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        reason === r.value ? 'bg-hyt-accent/20' : 'bg-hyt-dark'
                                    }`}>
                                        <r.icon className={`w-4 h-4 ${
                                            reason === r.value ? 'text-hyt-accent' : 'text-gray-400'
                                        }`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-medium ${
                                            reason === r.value ? 'text-white' : 'text-gray-300'
                                        }`}>
                                            {r.label}
                                        </p>
                                        <p className="text-gray-500 text-sm">{r.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Description du problème {(reason === 'OTHER' || !hasPurchased) ? '*' : '(optionnel)'}
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Décrivez le problème en détail..."
                            className="input-field w-full h-24 resize-none"
                            required={reason === 'OTHER' || !hasPurchased}
                        />
                        <p className="text-gray-500 text-xs mt-1">
                            Plus vous donnez de détails, plus vite le problème pourra être résolu.
                        </p>
                    </div>

                    {/* Info */}
                    <div className="bg-hyt-dark rounded-lg p-3 text-sm">
                        <p className="text-gray-400">
                            <strong className="text-white">Note :</strong> Le vendeur et l'équipe de modération seront
                            notifiés de votre signalement. Nous vous contacterons si nous avons besoin de plus d'informations.
                        </p>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex gap-3 p-4 border-t border-hyt-border">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-ghost flex-1"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !reason}
                        className="btn-primary flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50"
                    >
                        {submitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <AlertTriangle className="w-4 h-4" />
                        )}
                        Envoyer le signalement
                    </button>
                </div>
            </div>
        </div>
    )
}