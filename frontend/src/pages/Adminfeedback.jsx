import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    MessageSquare, Tag, FolderOpen, Layers, Clock, CheckCircle, XCircle,
    Loader2, Eye, Check, X, AlertTriangle, Bug, AlertCircle, Copyright, Ban, HelpCircle,
    ExternalLink, MessageCircleReply, Filter, Link2, Gamepad2
} from 'lucide-react'
import { adminAPI, dependenciesAPI } from '../services/api'
import toast from 'react-hot-toast'

// Icônes pour les types de propositions
const TYPE_ICONS = {
    CATEGORY: FolderOpen,
    TAG: Tag,
    VERSION: Layers,
    DEPENDENCY: Link2
}

const TYPE_LABELS = {
    CATEGORY: 'Catégorie',
    TAG: 'Tag',
    VERSION: 'Version',
    DEPENDENCY: 'Dépendance'
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

const STATUS_LABELS = {
    PENDING: 'En attente',
    REVIEWED: 'En cours',
    RESOLVED: 'Résolu',
    DISMISSED: 'Rejeté'
}

const STATUS_COLORS = {
    PENDING: 'bg-yellow-500/20 text-yellow-500',
    REVIEWED: 'bg-blue-500/20 text-blue-500',
    RESOLVED: 'bg-green-500/20 text-green-500',
    DISMISSED: 'bg-gray-500/20 text-gray-400'
}

export default function AdminFeedback() {
    const [activeTab, setActiveTab] = useState('proposals')
    const [proposals, setProposals] = useState([])
    const [depProposals, setDepProposals] = useState([]) // Propositions de dépendances
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(null)
    const [rejectModal, setRejectModal] = useState(null)
    const [rejectReason, setRejectReason] = useState('')
    const [reportFilter, setReportFilter] = useState('PENDING') // Filtre pour les signalements
    const [staffNoteModal, setStaffNoteModal] = useState(null)
    const [staffNote, setStaffNote] = useState('')
    const [rejectDepModal, setRejectDepModal] = useState(null) // Modal rejet dépendance

    useEffect(() => {
        fetchData()
    }, [reportFilter])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [proposalsRes, depProposalsRes, reportsRes] = await Promise.all([
                adminAPI.getProposals('PENDING').catch(() => ({ data: { proposals: [] } })),
                dependenciesAPI.getProposals('PENDING').catch(() => ({ data: { proposals: [] } })),
                adminAPI.getReports(reportFilter === 'ALL' ? null : reportFilter).catch(() => ({ data: { reports: [] } }))
            ])
            setProposals(proposalsRes.data.proposals || [])
            setDepProposals(depProposalsRes.data.proposals || [])
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
    const handleUpdateReport = async (id, status, note = null) => {
        setProcessing(id)
        try {
            await adminAPI.updateReport(id, { status, staffNote: note })
            toast.success('Signalement mis à jour')
            setStaffNoteModal(null)
            setStaffNote('')
            fetchData()
        } catch (error) {
            toast.error('Erreur')
        } finally {
            setProcessing(null)
        }
    }

    // ============ PROPOSITIONS DE DÉPENDANCES ============
    const handleApproveDepProposal = async (id) => {
        setProcessing(`dep-${id}`)
        try {
            await dependenciesAPI.approveProposal(id)
            toast.success('Dépendance approuvée et créée !')
            fetchData()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setProcessing(null)
        }
    }

    const handleRejectDepProposal = async () => {
        if (!rejectDepModal) return

        setProcessing(`dep-${rejectDepModal}`)
        try {
            await dependenciesAPI.rejectProposal(rejectDepModal, rejectReason)
            toast.success('Proposition de dépendance rejetée')
            setRejectDepModal(null)
            setRejectReason('')
            fetchData()
        } catch (error) {
            toast.error('Erreur lors du rejet')
        } finally {
            setProcessing(null)
        }
    }

    const openStaffNoteModal = (report, status) => {
        setStaffNoteModal({ report, status })
        setStaffNote('')
    }

    const pendingProposalsCount = proposals.length + depProposals.length
    const pendingReportsCount = reports.filter(r => r.status === 'PENDING').length
    const reportsWithResponse = reports.filter(r => r.seller_response).length

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
                    {reportsWithResponse > 0 && (
                        <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full" title="Avec réponse vendeur">
                            {reportsWithResponse} 💬
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
                            {/* Message si aucune proposition */}
                            {proposals.length === 0 && depProposals.length === 0 ? (
                                <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                                    <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                    <p className="text-white font-medium">Aucune proposition en attente</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Les propositions des vendeurs apparaîtront ici
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {/* Propositions classiques (catégories, tags, versions) */}
                                    {proposals.map((proposal) => {
                                        const Icon = TYPE_ICONS[proposal.type] || Tag
                                        const colors = {
                                            CATEGORY: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
                                            TAG: { bg: 'bg-hyt-accent/20', text: 'text-hyt-accent', border: 'border-hyt-accent/30' },
                                            VERSION: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' }
                                        }
                                        const color = colors[proposal.type] || colors.TAG

                                        return (
                                            <div
                                                key={`prop-${proposal.id}`}
                                                className={`bg-hyt-card border ${color.border} rounded-xl p-4`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 rounded-xl ${color.bg} flex items-center justify-center flex-shrink-0`}>
                                                        <Icon className={`w-6 h-6 ${color.text}`} />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <span className="text-white font-semibold text-lg">
                                                                {proposal.name}
                                                            </span>
                                                            <span className={`px-2 py-0.5 ${color.bg} ${color.text} text-xs rounded-full flex items-center gap-1`}>
                                                                <Icon className="w-3 h-3" />
                                                                {TYPE_LABELS[proposal.type]}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-400 text-sm">
                                                            <Gamepad2 className="w-4 h-4 inline mr-1" />
                                                            <span className="text-white">{proposal.game_name}</span>
                                                            {' • '}
                                                            Par : <span className="text-white">{proposal.user_name}</span>
                                                        </p>
                                                        {proposal.description && (
                                                            <p className="text-gray-500 text-sm mt-2 italic">
                                                                "{proposal.description}"
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            Proposée le {new Date(proposal.created_at).toLocaleDateString('fr-FR')}
                                                        </p>
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
                                    })}

                                    {/* Propositions de dépendances */}
                                    {depProposals.map((proposal) => (
                                        <div
                                            key={`dep-${proposal.id}`}
                                            className="bg-hyt-card border border-blue-500/30 rounded-xl p-4"
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Logo */}
                                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {proposal.logo_url ? (
                                                        <img
                                                            src={`http://localhost:3001${proposal.logo_url}`}
                                                            alt={proposal.name}
                                                            className="w-full h-full object-contain p-1"
                                                        />
                                                    ) : (
                                                        <Link2 className="w-6 h-6 text-blue-400" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className="text-white font-semibold text-lg">
                                                            {proposal.name}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
                                                            <Link2 className="w-3 h-3" />
                                                            Dépendance
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-400 text-sm">
                                                        <Gamepad2 className="w-4 h-4 inline mr-1" />
                                                        <span className="text-white">{proposal.game_name}</span>
                                                        {' • '}
                                                        Par : <span className="text-white">{proposal.proposed_by_username}</span>
                                                    </p>
                                                    {proposal.description && (
                                                        <p className="text-gray-500 text-sm mt-2">
                                                            {proposal.description}
                                                        </p>
                                                    )}
                                                    {proposal.website_url && (
                                                        <a
                                                            href={proposal.website_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-hyt-accent text-sm hover:underline flex items-center gap-1 mt-1 inline-flex"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                            Site web
                                                        </a>
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Proposée le {new Date(proposal.created_at).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => handleApproveDepProposal(proposal.id)}
                                                        disabled={processing === `dep-${proposal.id}`}
                                                        className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                                                        title="Approuver et créer"
                                                    >
                                                        {processing === `dep-${proposal.id}` ? (
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                        ) : (
                                                            <Check className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectDepModal(proposal.id)}
                                                        disabled={processing === `dep-${proposal.id}`}
                                                        className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                                        title="Refuser"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Signalements */}
                    {activeTab === 'reports' && (
                        <div className="space-y-4">
                            {/* Filtres */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <Filter className="w-4 h-4 text-gray-400" />
                                {['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED', 'ALL'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setReportFilter(status)}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                            reportFilter === status
                                                ? 'bg-hyt-accent text-black font-medium'
                                                : 'bg-hyt-dark text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {status === 'ALL' ? 'Tous' : STATUS_LABELS[status]}
                                    </button>
                                ))}
                            </div>

                            {reports.length === 0 ? (
                                <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                                    <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                    <p className="text-white font-medium">Aucun signalement</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Les signalements de produits apparaîtront ici
                                    </p>
                                </div>
                            ) : (
                                reports.map((report) => {
                                    const ReasonIcon = REASON_ICONS[report.reason] || AlertCircle
                                    const hasSellerResponse = !!report.seller_response

                                    return (
                                        <div
                                            key={report.id}
                                            className={`bg-hyt-card border rounded-xl p-4 ${
                                                hasSellerResponse
                                                    ? 'border-blue-500/50 bg-blue-500/5'
                                                    : 'border-red-500/30'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                    hasSellerResponse ? 'bg-blue-500/20' : 'bg-red-500/20'
                                                }`}>
                                                    {hasSellerResponse ? (
                                                        <MessageCircleReply className="w-6 h-6 text-blue-500" />
                                                    ) : (
                                                        <ReasonIcon className="w-6 h-6 text-red-500" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className="text-white font-semibold">
                                                            {report.model_title}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[report.status]}`}>
                                                            {STATUS_LABELS[report.status]}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                                                            {REASON_LABELS[report.reason]}
                                                        </span>
                                                        {hasSellerResponse && (
                                                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center gap-1">
                                                                <MessageCircleReply className="w-3 h-3" />
                                                                Réponse vendeur
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-gray-400 text-sm">
                                                        Vendeur : <span className="text-white">{report.creator_username}</span>
                                                        {' • '}
                                                        Signalé par : <span className="text-white">{report.reporter_username}</span>
                                                        {' • '}
                                                        <span className="text-gray-500">
                                                            {new Date(report.created_at).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    </p>

                                                    {/* Description du signalement */}
                                                    {report.description && (
                                                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                                            <p className="text-xs text-red-400 font-medium mb-1">Description du signalement :</p>
                                                            <p className="text-gray-300 text-sm">
                                                                {report.description}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Réponse du vendeur */}
                                                    {hasSellerResponse && (
                                                        <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                                            <p className="text-xs text-blue-400 font-medium mb-1">
                                                                💬 Réponse du vendeur ({new Date(report.seller_response_at).toLocaleDateString('fr-FR')}) :
                                                            </p>
                                                            <p className="text-gray-300 text-sm">
                                                                {report.seller_response}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Note du staff */}
                                                    {report.staff_note && (
                                                        <div className="mt-3 p-3 bg-hyt-accent/10 border border-hyt-accent/20 rounded-lg">
                                                            <p className="text-xs text-hyt-accent font-medium mb-1">Note du staff :</p>
                                                            <p className="text-gray-300 text-sm">
                                                                {report.staff_note}
                                                            </p>
                                                        </div>
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

                                                {/* Actions - seulement si pas encore traité */}
                                                {(report.status === 'PENDING' || report.status === 'REVIEWED') && (
                                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                                        <button
                                                            onClick={() => openStaffNoteModal(report, 'RESOLVED')}
                                                            disabled={processing === report.id}
                                                            className="px-3 py-1.5 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 text-sm"
                                                        >
                                                            ✓ Résolu
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateReport(report.id, 'REVIEWED')}
                                                            disabled={processing === report.id || report.status === 'REVIEWED'}
                                                            className="px-3 py-1.5 bg-yellow-500/20 text-yellow-500 rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50 text-sm"
                                                        >
                                                            🔍 En cours
                                                        </button>
                                                        <button
                                                            onClick={() => openStaffNoteModal(report, 'DISMISSED')}
                                                            disabled={processing === report.id}
                                                            className="px-3 py-1.5 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors disabled:opacity-50 text-sm"
                                                        >
                                                            ✗ Non fondé
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Modal de rejet proposition */}
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

            {/* Modal note staff pour signalement */}
            {staffNoteModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-hyt-card border border-hyt-border rounded-xl w-full max-w-md">
                        <div className="p-4 border-b border-hyt-border">
                            <h3 className="text-lg font-semibold text-white">
                                {staffNoteModal.status === 'RESOLVED' ? '✓ Marquer comme résolu' : '✗ Marquer comme non fondé'}
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="bg-hyt-dark rounded-lg p-3">
                                <p className="text-sm text-gray-400">Produit : <span className="text-white">{staffNoteModal.report.model_title}</span></p>
                                <p className="text-sm text-gray-400">Raison : <span className="text-white">{REASON_LABELS[staffNoteModal.report.reason]}</span></p>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    Note pour le vendeur (optionnel)
                                </label>
                                <textarea
                                    value={staffNote}
                                    onChange={(e) => setStaffNote(e.target.value)}
                                    placeholder="Ajoutez une note explicative pour le vendeur..."
                                    className="input-field w-full h-24 resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Cette note sera visible par le vendeur dans sa notification.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setStaffNoteModal(null)
                                        setStaffNote('')
                                    }}
                                    className="btn-ghost flex-1"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => handleUpdateReport(staffNoteModal.report.id, staffNoteModal.status, staffNote)}
                                    disabled={processing}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                        staffNoteModal.status === 'RESOLVED'
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                                    }`}
                                >
                                    {processing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de rejet proposition dépendance */}
            {rejectDepModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-hyt-card border border-hyt-border rounded-xl w-full max-w-md">
                        <div className="p-4 border-b border-hyt-border">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Link2 className="w-5 h-5 text-blue-500" />
                                Refuser la proposition de dépendance
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    Raison du refus (optionnel)
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Expliquez pourquoi cette dépendance est refusée..."
                                    className="input-field w-full h-24 resize-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setRejectDepModal(null)
                                        setRejectReason('')
                                    }}
                                    className="btn-ghost flex-1"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleRejectDepProposal}
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