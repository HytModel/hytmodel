import React, { useState, useEffect } from 'react'
import { Plus, Tag, FolderOpen, Layers, Loader2, Check, X, Clock, CheckCircle, XCircle } from 'lucide-react'
import { feedbackAPI, gamesAPI } from '../services/api'
import { useTranslation } from '../context/LanguageContext'
import toast from 'react-hot-toast'

export default function ProposalForm() {
    const { t } = useTranslation()
    const [games, setGames] = useState([])
    const [proposals, setProposals] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [showForm, setShowForm] = useState(false)

    // Form state
    const [type, setType] = useState('TAG')
    const [gameId, setGameId] = useState('')
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [gamesRes, proposalsRes] = await Promise.all([
                gamesAPI.getAll(),
                feedbackAPI.getMyProposals()
            ])
            setGames(gamesRes.data.games || gamesRes.data || [])
            setProposals(proposalsRes.data.proposals || proposalsRes.data || [])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!gameId || !name.trim()) {
            toast.error(t('proposalForm.errors.fillRequired'))
            return
        }

        setSubmitting(true)
        try {
            await feedbackAPI.createProposal({
                type,
                gameId,
                name: name.trim(),
                description: description.trim() || null
            })
            toast.success(t('proposalForm.success'))
            setShowForm(false)
            setName('')
            setDescription('')
            fetchData()
        } catch (error) {
            toast.error(error.response?.data?.error || t('proposalForm.errors.submitFailed'))
        } finally {
            setSubmitting(false)
        }
    }

    const getTypeIcon = (t) => {
        switch (t) {
            case 'CATEGORY': return FolderOpen
            case 'TAG': return Tag
            case 'VERSION': return Layers
            default: return Tag
        }
    }

    const getTypeLabel = (proposalType) => {
        switch (proposalType) {
            case 'CATEGORY': return t('proposalForm.types.category')
            case 'TAG': return t('proposalForm.types.tag')
            case 'VERSION': return t('proposalForm.types.version')
            default: return proposalType
        }
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-medium rounded-full">
                        <Clock className="w-3 h-3" />
                        {t('proposalForm.status.pending')}
                    </span>
                )
            case 'APPROVED':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-500 text-xs font-medium rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        {t('proposalForm.status.approved')}
                    </span>
                )
            case 'REJECTED':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-500 text-xs font-medium rounded-full">
                        <XCircle className="w-3 h-3" />
                        {t('proposalForm.status.rejected')}
                    </span>
                )
            default:
                return null
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-hyt-accent animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">{t('proposalForm.title')}</h3>
                    <p className="text-gray-400 text-sm">
                        {t('proposalForm.subtitle')}
                    </p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {t('proposalForm.newProposal')}
                    </button>
                )}
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-hyt-dark rounded-xl p-6 border border-hyt-border space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Type */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">{t('proposalForm.form.type')} *</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="input-field w-full"
                            >
                                <option value="TAG">{t('proposalForm.types.tag')}</option>
                                <option value="CATEGORY">{t('proposalForm.types.category')}</option>
                                <option value="VERSION">{t('proposalForm.types.gameVersion')}</option>
                            </select>
                        </div>

                        {/* Jeu */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">{t('proposalForm.form.game')} *</label>
                            <select
                                value={gameId}
                                onChange={(e) => setGameId(e.target.value)}
                                className="input-field w-full"
                                required
                            >
                                <option value="">{t('proposalForm.form.selectGame')}</option>
                                {games.map(game => (
                                    <option key={game.id} value={game.id}>{game.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Nom */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            {type === 'VERSION' ? t('proposalForm.form.versionNumber') : t('proposalForm.form.name')} *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={
                                type === 'VERSION'
                                    ? t('proposalForm.form.versionPlaceholder')
                                    : type === 'TAG'
                                        ? t('proposalForm.form.tagPlaceholder')
                                        : t('proposalForm.form.categoryPlaceholder')
                            }
                            className="input-field w-full"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            {t('proposalForm.form.justification')} ({t('common.optional')})
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('proposalForm.form.justificationPlaceholder')}
                            className="input-field w-full h-24 resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="btn-ghost flex-1"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            {t('proposalForm.form.submit')}
                        </button>
                    </div>
                </form>
            )}

            {/* Liste des propositions */}
            {proposals.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-400">{t('proposalForm.myProposals')}</h4>
                    {proposals.map((proposal) => {
                        const Icon = getTypeIcon(proposal.type)
                        return (
                            <div
                                key={proposal.id}
                                className="bg-hyt-dark rounded-lg p-4 border border-hyt-border"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-hyt-accent/20 flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-5 h-5 text-hyt-accent" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-white font-medium">{proposal.name}</span>
                                                <span className="text-gray-500 text-sm">
                                                    ({getTypeLabel(proposal.type)})
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-sm">
                                                {t('proposalForm.forGame')}: {proposal.game_name}
                                            </p>
                                            {proposal.description && (
                                                <p className="text-gray-500 text-sm mt-1">
                                                    {proposal.description}
                                                </p>
                                            )}
                                            {proposal.status === 'REJECTED' && proposal.rejection_reason && (
                                                <p className="text-red-400 text-sm mt-2">
                                                    {t('proposalForm.rejectionReason')}: {proposal.rejection_reason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {getStatusBadge(proposal.status)}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {proposals.length === 0 && !showForm && (
                <div className="text-center py-8 text-gray-400">
                    <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('proposalForm.empty')}</p>
                </div>
            )}
        </div>
    )
}