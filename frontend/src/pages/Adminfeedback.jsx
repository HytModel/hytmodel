import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    MessageSquare, Tag, FolderOpen, Layers, Clock, CheckCircle, XCircle,
    Loader2, Eye, Check, X, AlertTriangle, Bug, AlertCircle, Copyright, Ban, HelpCircle,
    ExternalLink
} from 'lucide-react'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'

// Icônes pour les types de propositions
const TYPE_ICONS = {
    CATEGORY: FolderOpen,
    TAG: Tag,
    VERSION: Layers
}

const TYPE_LABELS = {
    CATEGORY: 'Catégorie',
    TAG: 'Tag',
    VERSION: 'Version'
}

// Icônes pour les raisons de signalement
const REASON_ICONS = {
    BUG: Bug,
    ERROR: AlertCircle,
    MISLEADING: AlertTriangle,
    COPYRIGHT: Copyright,
    INAPPROPRIATE: Ban,
    OTHER: HelpCircle
}

const REASON_LABELS = {
    BUG: 'Bug technique',
    ERROR: 'Fichiers manquants',
    MISLEADING: 'Description trompeuse',
    COPYRIGHT: 'Violation de droits',
    INAPPROPRIATE: 'Contenu inapproprié',
    OTHER: 'Autre'
}

export default function AdminFeedback() {
    const [activeTab, setActiveTab] = useState('proposals')
    const [proposals, setProposals] = useState([])
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(null)
    const [rejectModal, setRejectModal] = useState(null)
    const [rejectReason, setRejectReason] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [proposalsRes, reportsRes] = await Promise.all([
                adminAPI.getProposals('PENDING').catch(() => ({ data: { proposals: [] } })),
                adminAPI.getReports('PENDING').catch(() => ({ data: { reports: [] } }))
            ])
            setProposals(proposalsRes.data.proposals || [])
            setReports(reportsRes.data.reports || [])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    // ============ PROPOSITIONS ============
    const handleApproveProposal = async (id) => {
        setProcessing(id)
        try {
            await adminAPI.approveProposal(id)
            toast.success('Proposition approuvée et créée !')
            fetchData()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setProcessing(null)
        }
    }

    const handleRejectProposal = async () => {
        if (!rejectModal) return

        setProcessing(rejectModal)
        try {
            await adminAPI.rejectProposal(rejectModal, rejectReason)
            toast.success('Proposition rejetée')
            setRejectModal(null)
            setRejectReason('')
            fetchData()
        } catch (error) {
            toast.error('Erreur lors du rejet')
        } finally {
            setProcessing(null)
        }
    }

    // ============ SIGNALEMENTS ============
    const handleUpdateReport = async (id, status, staffNote = null) => {
        setProcessing(id)
        try {
            await adminAPI.updateReport(id, { status, staffNote })
            toast.success('Signalement mis à jour')
            fetchData()
        } catch (error) {
            toast.error('Erreur')
        } finally {
            setProcessing(null)
        }
    }

    const pendingProposalsCount = proposals.length
    const pendingReportsCount = reports.length

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Feedback & Signalements</h2>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-hyt-border">
                <button
                    onClick={() => setActiveTab('proposals')}
                    className={`px-4 py-3 font-medium transition-colors relative ${
                        activeTab === 'proposals'
                            ? 'text-hyt-accent'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Propositions
                    {pendingProposalsCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-hyt-accent text-black text-xs font-bold rounded-full">
                            {pendingProposalsCount}
                        </span>
                    )}
                    {activeTab === 'proposals' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`px-4 py-3 font-medium transition-colors relative ${
                        activeTab === 'reports'
                            ? 'text-hyt-accent'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Signalements
                    {pendingReportsCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                            {pendingReportsCount}
                        </span>
                    )}
                    {activeTab === 'reports' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                    )}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
                </div>
            ) : (
                <>
                    {/* Tab: Propositions */}
                    {activeTab === 'proposals' && (
                        <div className="space-y-4">
                            {proposals.length === 0 ? (
                                <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                                    <Tag className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                    <p className="text-white font-medium">Aucune proposition en attente</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Les propositions des vendeurs apparaîtront ici
                                    </p>
                                </div>
                            ) : (
                                proposals.map((proposal) => {
                                    const Icon = TYPE_ICONS[proposal.type] || Tag
                                    return (
                                        <div
                                            key={proposal.id}
                                            className="bg-hyt-card border border-hyt-border rounded-xl p-4"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-hyt-accent/20 flex items-center justify-center flex-shrink-0">
                                                    <Icon className="w-6 h-6 text-hyt-accent" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-white font-semibold text-lg">
                                                            {proposal.name}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-hyt-dark text-gray-400 text-xs rounded-full">
                                                            {TYPE_LABELS[proposal.type]}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-400 text-sm">
                                                        Pour : <span className="text-white">{proposal.game_name}</span>
                                                        {' • '}
                                                        Par : <span className="text-white">{proposal.user_name}</span>
                                                    </p>
                                                    {proposal.description && (
                                                        <p className="text-gray-500 text-sm mt-2 italic">
                                                            "{proposal.description}"
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleApproveProposal(proposal.id)}
                                                        disabled={processing === proposal.id}
                                                        className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                                                        title="Approuver et créer"
                                                    >
                                                        {processing === proposal.id ? (
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                            <Check className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectModal(proposal.id)}
                                                        disabled={processing === proposal.id}
                                                        className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                                        title="Refuser"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )}

                    {/* Tab: Signalements */}
                    {activeTab === 'reports' && (
                        <div className="space-y-4">
                            {reports.length === 0 ? (
                                <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                                    <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                    <p className="text-white font-medium">Aucun signalement en attente</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Les signalements de produits apparaîtront ici
                                    </p>
                                </div>
                            ) : (
                                reports.map((report) => {
                                    const ReasonIcon = REASON_ICONS[report.reason] || AlertCircle
                                    return (
                                        <div
                                            key={report.id}
                                            className="bg-hyt-card border border-red-500/30 rounded-xl p-4"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                                    <ReasonIcon className="w-6 h-6 text-red-500" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-white font-semibold">
                                                            {report.model_title}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                                                            {REASON_LABELS[report.reason]}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-400 text-sm">
                                                        Vendeur : <span className="text-white">{report.creator_username}</span>
                                                        {' • '}
                                                        Signalé par : <span className="text-white">{report.reporter_username}</span>
                                                    </p>
                                                    {report.description && (
                                                        <p className="text-gray-300 text-sm mt-2 bg-hyt-dark p-2 rounded-lg">
                                                            {report.description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-2 mt-3">
                                                        <Link
                                                            to={`/models/${report.model_id}`}
                                                            target="_blank"
                                                            className="text-hyt-accent text-sm hover:underline flex items-center gap-1"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            Voir le produit
                                                            <ExternalLink className="w-3 h-3" />
                                                        </Link>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleUpdateReport(report.id, 'RESOLVED')}
                                                        disabled={processing === report.id}
                                                        className="px-3 py-1.5 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 text-sm"
                                                    >
                                                        Résolu
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateReport(report.id, 'REVIEWED')}
                                                        disabled={processing === report.id}
                                                        className="px-3 py-1.5 bg-yellow-500/20 text-yellow-500 rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50 text-sm"
                                                    >
                                                        En cours
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateReport(report.id, 'DISMISSED')}
                                                        disabled={processing === report.id}
                                                        className="px-3 py-1.5 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors disabled:opacity-50 text-sm"
                                                    >
                                                        Ignorer
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Modal de rejet */}
            {rejectModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-hyt-card border border-hyt-border rounded-xl w-full max-w-md">
                        <div className="p-4 border-b border-hyt-border">
                            <h3 className="text-lg font-semibold text-white">Refuser la proposition</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    Raison du refus (optionnel)
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Expliquez pourquoi cette proposition est refusée..."
                                    className="input-field w-full h-24 resize-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setRejectModal(null)
                                        setRejectReason('')
                                    }}
                                    className="btn-ghost flex-1"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleRejectProposal}
                                    disabled={processing}
                                    className="btn-primary flex-1 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <X className="w-4 h-4" />
                                    )}
                                    Refuser
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}