import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Package, Plus, Edit, Trash2, Eye, EyeOff,
    Clock, CheckCircle, XCircle, Loader2, ArrowLeft,
    TrendingUp, DollarSign, AlertTriangle, MessageSquare,
    ChevronDown, ChevronUp, Send, Flag, X
} from 'lucide-react'
import { modelsAPI, feedbackAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/LanguageContext'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
    PENDING: 'bg-yellow-500/20 text-yellow-500',
    REVIEWED: 'bg-blue-500/20 text-blue-500',
    RESOLVED: 'bg-orange-500/20 text-orange-500',
    DISMISSED: 'bg-green-500/20 text-green-500'
}

// Modal pour répondre à un signalement
function ReportResponseModal({ report, onClose, onSubmit }) {
    const { t } = useTranslation()
    const [response, setResponse] = useState('')
    const [sending, setSending] = useState(false)

    const REASON_LABELS = {
        BUG: t('myProducts.reports.reasons.bug'),
        ERROR: t('myProducts.reports.reasons.error'),
        MISLEADING: t('myProducts.reports.reasons.misleading'),
        COPYRIGHT: t('myProducts.reports.reasons.copyright'),
        INAPPROPRIATE: t('myProducts.reports.reasons.inappropriate'),
        OTHER: t('myProducts.reports.reasons.other')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!response.trim()) {
            toast.error(t('myProducts.reports.modal.errors.emptyResponse'))
            return
        }

        setSending(true)
        try {
            await onSubmit(report.id, response)
            toast.success(t('myProducts.reports.modal.success'))
            onClose()
        } catch (error) {
            toast.error(t('myProducts.reports.modal.errors.sendFailed'))
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-hyt-card border border-hyt-border rounded-xl w-full max-w-lg">
                <div className="flex items-center justify-between p-4 border-b border-hyt-border">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-hyt-accent" />
                        {t('myProducts.reports.modal.title')}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4">
                    {/* Info du signalement */}
                    <div className="bg-hyt-dark rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[report.status]}`}>
                                {REASON_LABELS[report.reason]}
                            </span>
                            <span className="text-gray-500 text-xs">
                                {new Date(report.created_at).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                        <p className="text-gray-300 text-sm">{report.description || t('myProducts.reports.noDescription')}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-2">
                                {t('myProducts.reports.modal.responseLabel')}
                            </label>
                            <textarea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder={t('myProducts.reports.modal.responsePlaceholder')}
                                rows={5}
                                className="input-field w-full resize-none"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {t('myProducts.reports.modal.responseHint')}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-ghost flex-1"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={sending}
                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                {sending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                {t('myProducts.reports.modal.send')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

// Composant pour afficher les signalements d'un produit
function ProductReports({ productId, productTitle }) {
    const { t } = useTranslation()
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(false)
    const [responseModal, setResponseModal] = useState(null)

    const REASON_LABELS = {
        BUG: t('myProducts.reports.reasons.bug'),
        ERROR: t('myProducts.reports.reasons.error'),
        MISLEADING: t('myProducts.reports.reasons.misleading'),
        COPYRIGHT: t('myProducts.reports.reasons.copyright'),
        INAPPROPRIATE: t('myProducts.reports.reasons.inappropriate'),
        OTHER: t('myProducts.reports.reasons.other')
    }

    const STATUS_LABELS = {
        PENDING: t('myProducts.reports.status.pending'),
        REVIEWED: t('myProducts.reports.status.reviewed'),
        RESOLVED: t('myProducts.reports.status.resolved'),
        DISMISSED: t('myProducts.reports.status.dismissed')
    }

    useEffect(() => {
        fetchReports()
    }, [productId])

    const fetchReports = async () => {
        try {
            const { data } = await feedbackAPI.getReportsByModel(productId)
            setReports(data.reports || [])
        } catch (error) {
            console.error('Failed to fetch reports:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitResponse = async (reportId, response) => {
        await feedbackAPI.respondToReport(reportId, response)
        fetchReports()
    }

    if (loading) {
        return (
            <div className="mt-3 p-3 bg-hyt-dark rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
        )
    }

    if (reports.length === 0) {
        return null
    }

    const pendingReports = reports.filter(r => r.status === 'PENDING' || r.status === 'REVIEWED')
    const hasActiveReports = pendingReports.length > 0

    return (
        <div className={`mt-3 border rounded-lg ${hasActiveReports ? 'border-red-500/30 bg-red-500/5' : 'border-hyt-border bg-hyt-dark/50'}`}>
            {/* Header cliquable */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-3"
            >
                <div className="flex items-center gap-2">
                    <Flag className={`w-4 h-4 ${hasActiveReports ? 'text-red-500' : 'text-gray-500'}`} />
                    <span className={`text-sm font-medium ${hasActiveReports ? 'text-red-400' : 'text-gray-400'}`}>
                        {t('myProducts.reports.count', { count: reports.length })}
                        {hasActiveReports && ` (${t('myProducts.reports.active', { count: pendingReports.length })})`}
                    </span>
                </div>
                {expanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
            </button>

            {/* Liste des signalements */}
            {expanded && (
                <div className="border-t border-hyt-border">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className="p-3 border-b border-hyt-border/50 last:border-b-0"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    {/* Header du signalement */}
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[report.status]}`}>
                                            {STATUS_LABELS[report.status]}
                                        </span>
                                        <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded-full text-xs">
                                            {REASON_LABELS[report.reason]}
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                            {new Date(report.created_at).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>

                                    {/* Description du signalement */}
                                    {report.description && (
                                        <p className="text-gray-300 text-sm mb-2">
                                            {report.description}
                                        </p>
                                    )}

                                    {/* Note du staff si présente */}
                                    {report.staff_note && (
                                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mb-2">
                                            <p className="text-xs text-blue-400 font-medium mb-1">{t('myProducts.reports.staffNote')} :</p>
                                            <p className="text-sm text-blue-300">{report.staff_note}</p>
                                        </div>
                                    )}

                                    {/* Réponse du vendeur si présente */}
                                    {report.seller_response && (
                                        <div className="bg-hyt-accent/10 border border-hyt-accent/30 rounded-lg p-2 mb-2">
                                            <p className="text-xs text-hyt-accent font-medium mb-1">{t('myProducts.reports.yourResponse')} :</p>
                                            <p className="text-sm text-gray-300">{report.seller_response}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {t('myProducts.reports.sentOn')} {new Date(report.seller_response_at).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Bouton répondre */}
                                {(report.status === 'PENDING' || report.status === 'REVIEWED') && !report.seller_response && (
                                    <button
                                        onClick={() => setResponseModal(report)}
                                        className="flex-shrink-0 px-3 py-1.5 bg-hyt-accent/20 text-hyt-accent rounded-lg text-sm hover:bg-hyt-accent/30 transition-colors flex items-center gap-1"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        {t('myProducts.reports.respond')}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de réponse */}
            {responseModal && (
                <ReportResponseModal
                    report={responseModal}
                    onClose={() => setResponseModal(null)}
                    onSubmit={handleSubmitResponse}
                />
            )}
        </div>
    )
}

export default function MyProducts() {
    const { user } = useAuth()
    const { t } = useTranslation()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(null)
    const [showReportsFor, setShowReportsFor] = useState({})

    useEffect(() => {
        fetchMyProducts()
    }, [])

    const fetchMyProducts = async () => {
        try {
            const { data } = await modelsAPI.getMyProducts()
            const myProducts = Array.isArray(data) ? data : (data.models || [])
            setProducts(myProducts)
        } catch (error) {
            console.error('Failed to fetch products:', error)
            toast.error(t('myProducts.errors.loadFailed'))
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (productId, productTitle) => {
        if (!window.confirm(t('myProducts.confirmDelete', { title: productTitle }))) {
            return
        }

        setDeleting(productId)
        try {
            await modelsAPI.delete(productId)
            toast.success(t('myProducts.success.deleted'))
            fetchMyProducts()
        } catch (error) {
            toast.error(t('myProducts.errors.deleteFailed'))
        } finally {
            setDeleting(null)
        }
    }

    const getImageUrl = (url) => {
        if (!url) return null
        if (url.startsWith('http')) return url
        return `http://localhost:3001${url}`
    }

    const getStatusBadge = (product) => {
        if (product.is_hidden) {
            return (
                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium">
                    <EyeOff className="w-3 h-3" />
                    {t('myProducts.status.hidden')}
                </span>
            )
        }

        switch (product.status) {
            case 'APPROVED':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        {t('myProducts.status.online')}
                    </span>
                )
            case 'PENDING':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        {t('myProducts.status.pending')}
                    </span>
                )
            case 'REJECTED':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-medium">
                        <XCircle className="w-3 h-3" />
                        {t('myProducts.status.rejected')}
                    </span>
                )
            default:
                return null
        }
    }

    if (loading) {
        return <Loading fullScreen />
    }

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t('myProducts.backToDashboard')}
                        </Link>
                        <h1 className="font-display text-3xl font-bold text-white">
                            {t('myProducts.title')}
                        </h1>
                        <p className="text-gray-400 mt-1">
                            {t('myProducts.count', { count: products.length })}
                        </p>
                    </div>

                    <Link to="/upload" className="btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        {t('myProducts.addProduct')}
                    </Link>
                </div>

                {/* Stats rapides */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-hyt-accent/10 flex items-center justify-center">
                                <Package className="w-5 h-5 text-hyt-accent" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{products.length}</p>
                                <p className="text-xs text-gray-400">{t('myProducts.stats.total')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">
                                    {products.filter(p => p.status === 'APPROVED' && !p.is_hidden).length}
                                </p>
                                <p className="text-xs text-gray-400">{t('myProducts.stats.online')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">
                                    {products.filter(p => p.status === 'PENDING').length}
                                </p>
                                <p className="text-xs text-gray-400">{t('myProducts.stats.pending')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                                <EyeOff className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">
                                    {products.filter(p => p.is_hidden).length}
                                </p>
                                <p className="text-xs text-gray-400">{t('myProducts.stats.hidden')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liste des produits */}
                {products.length === 0 ? (
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                        <Package className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {t('myProducts.empty.title')}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {t('myProducts.empty.description')}
                        </p>
                        <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            {t('myProducts.empty.addFirst')}
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className={`bg-hyt-card border rounded-xl p-4 ${
                                    product.is_hidden
                                        ? 'border-yellow-500/30 bg-yellow-500/5'
                                        : product.status === 'REJECTED'
                                            ? 'border-red-500/30 bg-red-500/5'
                                            : 'border-hyt-border'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Thumbnail */}
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-hyt-dark flex-shrink-0">
                                        {product.thumbnail_url ? (
                                            <img
                                                src={getImageUrl(product.thumbnail_url)}
                                                alt={product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                <Package className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-white font-medium truncate">{product.title}</h3>
                                            {getStatusBadge(product)}
                                            {product.reports_count > 0 && (
                                                <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-medium">
                                                    <Flag className="w-3 h-3" />
                                                    {product.reports_count}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-400 text-sm truncate">
                                            {product.game_name && `${product.game_name}`}
                                            {product.category_name && ` • ${product.category_name}`}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-hyt-accent font-semibold">
                                                {parseFloat(product.price).toFixed(2)} €
                                            </span>
                                            {product.download_count > 0 && (
                                                <span className="text-gray-500 text-sm flex items-center gap-1">
                                                    <TrendingUp className="w-3 h-3" />
                                                    {t('myProducts.sales', { count: product.download_count })}
                                                </span>
                                            )}
                                        </div>

                                        {/* Message si masqué par le staff */}
                                        {product.is_hidden && product.hidden_reason && (
                                            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                                <div className="flex items-start gap-2">
                                                    <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-yellow-500">
                                                            {t('myProducts.messages.hiddenByTeam')}
                                                        </p>
                                                        <p className="text-sm text-yellow-400/80 mt-1">
                                                            {t('myProducts.messages.reason')}: {product.hidden_reason}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Message si rejeté */}
                                        {product.status === 'REJECTED' && (
                                            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                                <div className="flex items-start gap-2">
                                                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-red-500">
                                                            {t('myProducts.messages.rejected')}
                                                        </p>
                                                        <p className="text-sm text-red-400/80 mt-1">
                                                            {t('myProducts.messages.rejectedDescription')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Message si en attente */}
                                        {product.status === 'PENDING' && (
                                            <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                                                <div className="flex items-start gap-2">
                                                    <Clock className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-orange-400/80">
                                                        {t('myProducts.messages.pendingValidation')}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Section Signalements */}
                                        <ProductReports productId={product.id} productTitle={product.title} />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Link
                                            to={`/models/${product.id}`}
                                            className="p-2 text-gray-400 hover:text-white transition-colors"
                                            title={t('myProducts.actions.view')}
                                        >
                                            <Eye className="w-5 h-5" />
                                        </Link>

                                        <Link
                                            to={`/dashboard/models/${product.id}/edit`}
                                            className="p-2 text-gray-400 hover:text-hyt-accent transition-colors"
                                            title={t('myProducts.actions.edit')}
                                        >
                                            <Edit className="w-5 h-5" />
                                        </Link>

                                        <button
                                            onClick={() => handleDelete(product.id, product.title)}
                                            disabled={deleting === product.id}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                            title={t('myProducts.actions.delete')}
                                        >
                                            {deleting === product.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}