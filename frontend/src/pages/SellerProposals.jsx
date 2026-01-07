import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Lightbulb, Plus, Tag, Layers, Package, Gamepad2,
    Clock, CheckCircle, XCircle, Trash2, X, Loader2,
    Send, AlertCircle, ChevronDown
} from 'lucide-react'
import { proposalsAPI, gamesAPI } from '../services/api'
import { useTranslation } from '../context/LanguageContext'
import toast from 'react-hot-toast'

// Badge de statut
function StatusBadge({ status }) {
    const { t } = useTranslation()

    const config = {
        PENDING: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/20', label: t('sellerProposals.status.pending') },
        APPROVED: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/20', label: t('sellerProposals.status.approved') },
        REJECTED: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/20', label: t('sellerProposals.status.rejected') }
    }
    const { icon: Icon, color, bg, label } = config[status] || config.PENDING

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${bg} ${color}`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    )
}

// Modal de création
function CreateProposalModal({ isOpen, onClose, onCreated, games }) {
    const { t } = useTranslation()
    const [type, setType] = useState('')
    const [gameId, setGameId] = useState('')
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)

    const PROPOSAL_TYPES = [
        { value: 'CATEGORY', label: t('sellerProposals.types.category'), icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/20', description: t('sellerProposals.types.categoryDesc') },
        { value: 'TAG', label: t('sellerProposals.types.tag'), icon: Tag, color: 'text-green-500', bg: 'bg-green-500/20', description: t('sellerProposals.types.tagDesc'), needsGame: true },
        { value: 'VERSION', label: t('sellerProposals.types.version'), icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/20', description: t('sellerProposals.types.versionDesc'), needsGame: true }
    ]

    const selectedType = PROPOSAL_TYPES.find(pt => pt.value === type)
    const needsGame = selectedType?.needsGame

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!type || !name.trim()) {
            toast.error(t('sellerProposals.errors.fillRequired'))
            return
        }

        if (needsGame && !gameId) {
            toast.error(t('sellerProposals.errors.selectGame'))
            return
        }

        setLoading(true)
        try {
            await proposalsAPI.create({
                proposalType: type,
                gameId: needsGame ? gameId : null,
                name: name.trim(),
                description: description.trim() || null
            })
            toast.success(t('sellerProposals.success.sent'))
            onCreated()
            onClose()
            // Reset form
            setType('')
            setGameId('')
            setName('')
            setDescription('')
        } catch (error) {
            toast.error(error.response?.data?.error || t('sellerProposals.errors.sendFailed'))
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
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-hyt-card border border-hyt-border rounded-xl p-6 w-full max-w-lg"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Lightbulb className="w-6 h-6 text-yellow-500" />
                        {t('sellerProposals.modal.title')}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type de proposition */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            {t('sellerProposals.modal.proposalType')} *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {PROPOSAL_TYPES.map((propType) => (
                                <button
                                    key={propType.value}
                                    type="button"
                                    onClick={() => {
                                        setType(propType.value)
                                        if (!propType.needsGame) setGameId('')
                                    }}
                                    className={`p-3 rounded-lg border transition-all ${
                                        type === propType.value
                                            ? `${propType.bg} border-current ${propType.color}`
                                            : 'border-hyt-border hover:border-gray-500'
                                    }`}
                                >
                                    <propType.icon className={`w-5 h-5 mx-auto mb-1 ${type === propType.value ? propType.color : 'text-gray-400'}`} />
                                    <span className={`text-sm ${type === propType.value ? 'text-white' : 'text-gray-400'}`}>
                                        {propType.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                        {selectedType && (
                            <p className="text-xs text-gray-500 mt-2">{selectedType.description}</p>
                        )}
                    </div>

                    {/* Sélection du jeu (si nécessaire) */}
                    {needsGame && (
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                <Gamepad2 className="w-4 h-4 inline mr-1" />
                                {t('sellerProposals.modal.game')} *
                            </label>
                            <select
                                value={gameId}
                                onChange={(e) => setGameId(e.target.value)}
                                className="input-field w-full"
                                required
                            >
                                <option value="">{t('sellerProposals.modal.selectGame')}</option>
                                {games.map(game => (
                                    <option key={game.id} value={game.id}>{game.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Nom */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            {t('sellerProposals.modal.proposedName')} *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={
                                type === 'CATEGORY' ? t('sellerProposals.modal.placeholders.category') :
                                    type === 'TAG' ? t('sellerProposals.modal.placeholders.tag') :
                                        type === 'VERSION' ? t('sellerProposals.modal.placeholders.version') :
                                            t('sellerProposals.modal.placeholders.default')
                            }
                            className="input-field w-full"
                            required
                            maxLength={100}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            {t('sellerProposals.modal.justification')} ({t('common.optional')})
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('sellerProposals.modal.justificationPlaceholder')}
                            rows={3}
                            className="input-field w-full resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1">{description.length}/500 {t('sellerProposals.modal.characters')}</p>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-blue-400 text-sm">
                                {t('sellerProposals.modal.info')}
                            </p>
                        </div>
                    </div>

                    {/* Boutons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-ghost flex-1"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !type || !name.trim() || (needsGame && !gameId)}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            {t('sellerProposals.modal.send')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

// Composant principal
export default function SellerProposals() {
    const { t } = useTranslation()
    const [proposals, setProposals] = useState([])
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [filter, setFilter] = useState('all')
    const [deleting, setDeleting] = useState(null)

    const PROPOSAL_TYPES = [
        { value: 'CATEGORY', label: t('sellerProposals.types.category'), icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/20' },
        { value: 'TAG', label: t('sellerProposals.types.tag'), icon: Tag, color: 'text-green-500', bg: 'bg-green-500/20' },
        { value: 'VERSION', label: t('sellerProposals.types.version'), icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/20' }
    ]

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [proposalsRes, gamesRes] = await Promise.all([
                proposalsAPI.getMy(),
                gamesAPI.getAll()
            ])
            setProposals(proposalsRes.data.proposals || [])
            setGames(gamesRes.data.games || gamesRes.data || [])
        } catch (error) {
            console.error('Failed to load data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm(t('sellerProposals.confirmDelete'))) return

        setDeleting(id)
        try {
            await proposalsAPI.delete(id)
            toast.success(t('sellerProposals.success.deleted'))
            loadData()
        } catch (error) {
            toast.error(t('sellerProposals.errors.deleteFailed'))
        } finally {
            setDeleting(null)
        }
    }

    const filteredProposals = proposals.filter(p =>
        filter === 'all' || p.status === filter
    )

    const stats = {
        total: proposals.length,
        pending: proposals.filter(p => p.status === 'PENDING').length,
        approved: proposals.filter(p => p.status === 'APPROVED').length,
        rejected: proposals.filter(p => p.status === 'REJECTED').length
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Lightbulb className="w-6 h-6 text-yellow-500" />
                        {t('sellerProposals.title')}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {t('sellerProposals.subtitle')}
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    {t('sellerProposals.newProposal')}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-hyt-card border border-hyt-border rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-gray-400 text-sm">{t('sellerProposals.stats.total')}</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
                    <p className="text-yellow-500/70 text-sm">{t('sellerProposals.stats.pending')}</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
                    <p className="text-green-500/70 text-sm">{t('sellerProposals.stats.approved')}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
                    <p className="text-red-500/70 text-sm">{t('sellerProposals.stats.rejected')}</p>
                </div>
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">{t('sellerProposals.filter')}:</span>
                {[
                    { value: 'all', label: t('sellerProposals.filters.all') },
                    { value: 'PENDING', label: t('sellerProposals.filters.pending') },
                    { value: 'APPROVED', label: t('sellerProposals.filters.approved') },
                    { value: 'REJECTED', label: t('sellerProposals.filters.rejected') }
                ].map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            filter === f.value
                                ? 'bg-hyt-accent text-black font-medium'
                                : 'bg-hyt-dark text-gray-400 hover:text-white'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Liste des propositions */}
            {filteredProposals.length === 0 ? (
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                    <Lightbulb className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-white font-medium">
                        {filter === 'all' ? t('sellerProposals.empty.title') : t('sellerProposals.empty.noStatus')}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                        {filter === 'all' && t('sellerProposals.empty.description')}
                    </p>
                    {filter === 'all' && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-primary mt-4"
                        >
                            <Plus className="w-4 h-4 inline mr-2" />
                            {t('sellerProposals.empty.makeProposal')}
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {filteredProposals.map((proposal) => {
                            const typeConfig = PROPOSAL_TYPES.find(pt => pt.value === proposal.proposal_type)
                            const TypeIcon = typeConfig?.icon || Tag

                            return (
                                <motion.div
                                    key={proposal.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className={`bg-hyt-card border rounded-xl p-4 ${
                                        proposal.status === 'APPROVED' ? 'border-green-500/30' :
                                            proposal.status === 'REJECTED' ? 'border-red-500/30' :
                                                'border-hyt-border'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icône type */}
                                        <div className={`p-3 rounded-lg ${typeConfig?.bg || 'bg-gray-500/20'}`}>
                                            <TypeIcon className={`w-5 h-5 ${typeConfig?.color || 'text-gray-400'}`} />
                                        </div>

                                        {/* Contenu */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h3 className="text-white font-medium">{proposal.name}</h3>
                                                <StatusBadge status={proposal.status} />
                                                <span className={`text-xs px-2 py-0.5 rounded ${typeConfig?.bg} ${typeConfig?.color}`}>
                                                    {typeConfig?.label}
                                                </span>
                                            </div>

                                            {proposal.game_name && (
                                                <p className="text-gray-400 text-sm flex items-center gap-1">
                                                    <Gamepad2 className="w-3 h-3" />
                                                    {proposal.game_name}
                                                </p>
                                            )}

                                            {proposal.description && (
                                                <p className="text-gray-500 text-sm mt-2">{proposal.description}</p>
                                            )}

                                            {proposal.rejection_reason && (
                                                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                                                    <p className="text-red-400 text-sm">
                                                        <strong>{t('sellerProposals.rejectionReason')}:</strong> {proposal.rejection_reason}
                                                    </p>
                                                </div>
                                            )}

                                            <p className="text-gray-500 text-xs mt-2">
                                                {t('sellerProposals.proposedOn')} {new Date(proposal.created_at).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        {proposal.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleDelete(proposal.id)}
                                                disabled={deleting === proposal.id}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title={t('common.delete')}
                                            >
                                                {deleting === proposal.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal de création */}
            <CreateProposalModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onCreated={loadData}
                games={games}
            />
        </div>
    )
}