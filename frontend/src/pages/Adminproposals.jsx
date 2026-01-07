import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Lightbulb, Tag, Layers, Package, Gamepad2,
    Clock, CheckCircle, XCircle, X, Loader2,
    User, Mail, Calendar, MessageSquare, Filter
} from 'lucide-react'
import { proposalsAPI } from '../services/api'
import { useTranslation } from '../context/LanguageContext'
import toast from 'react-hot-toast'

// Badge de statut
function StatusBadge({ status }) {
    const { t } = useTranslation()
    const config = {
        PENDING: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/20', label: t('proposals.status.pending') },
        APPROVED: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/20', label: t('proposals.status.approved') },
        REJECTED: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/20', label: t('proposals.status.rejected') }
    }
    const { icon: Icon, color, bg, label } = config[status] || config.PENDING

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${color}`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    )
}

// Modal de rejet
function RejectModal({ isOpen, onClose, onConfirm, proposalName }) {
    const { t } = useTranslation()
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onConfirm(reason)
            setReason('')
            onClose()
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-hyt-card border border-hyt-border rounded-xl p-6 w-full max-w-md"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-500" />
                        {t('proposals.rejectModal.title')}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-gray-400 mb-4">
                    {t('proposals.rejectModal.description')} <span className="text-white font-medium">"{proposalName}"</span>
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm text-gray-400 mb-2">
                            {t('proposals.rejectModal.reasonLabel')}
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={t('proposals.rejectModal.reasonPlaceholder')}
                            rows={3}
                            className="input-field w-full resize-none"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="btn-ghost flex-1">
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1 bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                            {t('proposals.actions.reject')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

// Composant principal
export default function AdminProposals() {
    const { t } = useTranslation()
    const [proposals, setProposals] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(null)
    const [statusFilter, setStatusFilter] = useState('PENDING')
    const [typeFilter, setTypeFilter] = useState('')
    const [rejectModal, setRejectModal] = useState(null)

    // Types de proposition
    const PROPOSAL_TYPES = [
        { value: 'CATEGORY', label: t('proposals.types.category'), icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/20' },
        { value: 'TAG', label: t('proposals.types.tag'), icon: Tag, color: 'text-green-500', bg: 'bg-green-500/20' },
        { value: 'VERSION', label: t('proposals.types.version'), icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/20' }
    ]

    useEffect(() => {
        loadProposals()
    }, [statusFilter, typeFilter])

    const loadProposals = async () => {
        setLoading(true)
        try {
            const { data } = await proposalsAPI.getAll({
                status: statusFilter || undefined,
                type: typeFilter || undefined
            })
            setProposals(data.proposals || [])
        } catch (error) {
            console.error('Failed to load proposals:', error)
            toast.error(t('proposals.errors.loadFailed'))
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (id) => {
        setProcessing(id)
        try {
            await proposalsAPI.approve(id)
            toast.success(t('proposals.success.approved'))
            loadProposals()
        } catch (error) {
            toast.error(error.response?.data?.error || t('proposals.errors.approveFailed'))
        } finally {
            setProcessing(null)
        }
    }

    const handleReject = async (id, reason) => {
        setProcessing(id)
        try {
            await proposalsAPI.reject(id, reason)
            toast.success(t('proposals.success.rejected'))
            loadProposals()
        } catch (error) {
            toast.error(t('proposals.errors.rejectFailed'))
        } finally {
            setProcessing(null)
        }
    }

    const pendingCount = proposals.filter(p => p.status === 'PENDING').length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Lightbulb className="w-6 h-6 text-yellow-500" />
                        {t('proposals.title')}
                        {pendingCount > 0 && (
                            <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                                {pendingCount}
                            </span>
                        )}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {t('proposals.subtitle')}
                    </p>
                </div>
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-hyt-card border border-hyt-border rounded-xl">
                <div className="flex items-center gap-2 text-gray-400">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('proposals.filters.label')}:</span>
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-hyt-dark border border-hyt-border rounded-lg px-3 py-2 text-white text-sm"
                >
                    <option value="">{t('proposals.filters.allStatuses')}</option>
                    <option value="PENDING">{t('proposals.status.pending')}</option>
                    <option value="APPROVED">{t('proposals.status.approved')}</option>
                    <option value="REJECTED">{t('proposals.status.rejected')}</option>
                </select>

                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-hyt-dark border border-hyt-border rounded-lg px-3 py-2 text-white text-sm"
                >
                    <option value="">{t('proposals.filters.allTypes')}</option>
                    <option value="CATEGORY">{t('proposals.types.categories')}</option>
                    <option value="TAG">{t('proposals.types.tags')}</option>
                    <option value="VERSION">{t('proposals.types.versions')}</option>
                </select>
            </div>

            {/* Liste */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
                </div>
            ) : proposals.length === 0 ? (
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                    <Lightbulb className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-white font-medium">{t('proposals.noProposals')}</p>
                    <p className="text-gray-400 text-sm mt-1">
                        {statusFilter === 'PENDING'
                            ? t('proposals.noPendingProposals')
                            : t('proposals.noProposalsWithCriteria')}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {proposals.map((proposal) => {
                            const typeConfig = PROPOSAL_TYPES.find(t => t.value === proposal.proposal_type)
                            const TypeIcon = typeConfig?.icon || Tag

                            return (
                                <motion.div
                                    key={proposal.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`bg-hyt-card border rounded-xl p-5 ${
                                        proposal.status === 'PENDING' ? 'border-yellow-500/30 bg-yellow-500/5' :
                                            proposal.status === 'APPROVED' ? 'border-green-500/30' :
                                                proposal.status === 'REJECTED' ? 'border-red-500/30' :
                                                    'border-hyt-border'
                                    }`}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                                        {/* Icône type */}
                                        <div className={`p-3 rounded-lg ${typeConfig?.bg || 'bg-gray-500/20'} self-start`}>
                                            <TypeIcon className={`w-6 h-6 ${typeConfig?.color || 'text-gray-400'}`} />
                                        </div>

                                        {/* Contenu principal */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <h3 className="text-lg font-bold text-white">{proposal.name}</h3>
                                                <StatusBadge status={proposal.status} />
                                                <span className={`text-xs px-2 py-0.5 rounded ${typeConfig?.bg} ${typeConfig?.color}`}>
                                                    {typeConfig?.label}
                                                </span>
                                            </div>

                                            {/* Info jeu */}
                                            {proposal.game_name && (
                                                <div className="flex items-center gap-1 text-gray-400 text-sm mb-2">
                                                    <Gamepad2 className="w-4 h-4" />
                                                    <span>{t('proposals.forGame')}: <span className="text-white">{proposal.game_name}</span></span>
                                                </div>
                                            )}

                                            {/* Description */}
                                            {proposal.description && (
                                                <div className="bg-hyt-dark rounded-lg p-3 mb-3">
                                                    <p className="text-gray-300 text-sm flex items-start gap-2">
                                                        <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                                        {proposal.description}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Info vendeur */}
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {proposal.proposer_username}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-4 h-4" />
                                                    {proposal.proposer_email}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(proposal.created_at).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>

                                            {/* Raison du refus */}
                                            {proposal.rejection_reason && (
                                                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                                    <p className="text-red-400 text-sm">
                                                        <strong>{t('proposals.rejectionReason')}:</strong> {proposal.rejection_reason}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {proposal.status === 'PENDING' && (
                                            <div className="flex lg:flex-col gap-2 self-start">
                                                <button
                                                    onClick={() => handleApprove(proposal.id)}
                                                    disabled={processing === proposal.id}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {processing === proposal.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4" />
                                                    )}
                                                    {t('proposals.actions.approve')}
                                                </button>
                                                <button
                                                    onClick={() => setRejectModal(proposal)}
                                                    disabled={processing === proposal.id}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    {t('proposals.actions.reject')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal de rejet */}
            <RejectModal
                isOpen={!!rejectModal}
                onClose={() => setRejectModal(null)}
                onConfirm={(reason) => handleReject(rejectModal?.id, reason)}
                proposalName={rejectModal?.name}
            />
        </div>
    )
}