import React, { useState } from 'react'
import { AlertTriangle, X, Loader2, Bug, AlertCircle, Copyright, Ban, HelpCircle, FileText } from 'lucide-react'
import { feedbackAPI } from '../services/api'
import { useTranslation } from '../context/LanguageContext'
import toast from 'react-hot-toast'

export default function ReportProductModal({ isOpen, onClose, modelId, modelTitle, hasPurchased = false }) {
    const { t } = useTranslation()
    const [reason, setReason] = useState('')
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Raisons disponibles AVANT achat (éléments visibles)
    const PRE_PURCHASE_REASONS = [
        { value: 'COPYRIGHT', label: t('report.reasons.copyright'), icon: Copyright, description: t('report.reasons.copyrightDesc') },
        { value: 'MISLEADING', label: t('report.reasons.misleading'), icon: FileText, description: t('report.reasons.misleadingDesc') },
        { value: 'INAPPROPRIATE', label: t('report.reasons.inappropriate'), icon: Ban, description: t('report.reasons.inappropriateDesc') },
    ]

    // Raisons disponibles APRÈS achat (éléments téléchargés)
    const POST_PURCHASE_REASONS = [
        { value: 'BUG', label: t('report.reasons.bug'), icon: Bug, description: t('report.reasons.bugDesc') },
        { value: 'ERROR', label: t('report.reasons.error'), icon: AlertCircle, description: t('report.reasons.errorDesc') },
        { value: 'MISLEADING', label: t('report.reasons.misleading'), icon: FileText, description: t('report.reasons.misleadingDescPost') },
        { value: 'COPYRIGHT', label: t('report.reasons.copyright'), icon: Copyright, description: t('report.reasons.copyrightDescPost') },
        { value: 'INAPPROPRIATE', label: t('report.reasons.inappropriate'), icon: Ban, description: t('report.reasons.inappropriateDescPost') },
        { value: 'OTHER', label: t('report.reasons.other'), icon: HelpCircle, description: t('report.reasons.otherDesc') },
    ]

    // Sélectionner les raisons selon si l'utilisateur a acheté ou non
    const availableReasons = hasPurchased ? POST_PURCHASE_REASONS : PRE_PURCHASE_REASONS

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!reason) {
            toast.error(t('report.errors.noReason'))
            return
        }

        if ((reason === 'OTHER' || !hasPurchased) && !description.trim()) {
            toast.error(t('report.errors.noDescription'))
            return
        }

        setSubmitting(true)
        try {
            await feedbackAPI.reportProduct({
                modelId,
                reason,
                description: description.trim() || null
            })
            toast.success(t('report.success'))
            onClose()
            setReason('')
            setDescription('')
        } catch (error) {
            toast.error(error.response?.data?.error || t('report.errors.generic'))
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
                            <h3 className="text-lg font-semibold text-white">{t('report.title')}</h3>
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
                                <strong>{t('report.note')} :</strong> {t('report.notPurchasedInfo')}
                            </p>
                        </div>
                    )}

                    {/* Raisons */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-3">{t('report.problemType')} *</label>
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
                            {t('report.descriptionLabel')} {(reason === 'OTHER' || !hasPurchased) ? '*' : t('report.optional')}
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('report.descriptionPlaceholder')}
                            className="input-field w-full h-24 resize-none"
                            required={reason === 'OTHER' || !hasPurchased}
                        />
                        <p className="text-gray-500 text-xs mt-1">
                            {t('report.descriptionHint')}
                        </p>
                    </div>

                    {/* Info */}
                    <div className="bg-hyt-dark rounded-lg p-3 text-sm">
                        <p className="text-gray-400">
                            <strong className="text-white">{t('report.note')} :</strong> {t('report.infoNote')}
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
                        {t('common.cancel')}
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
                        {t('report.submit')}
                    </button>
                </div>
            </div>
        </div>
    )
}