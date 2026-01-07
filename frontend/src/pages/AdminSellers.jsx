import React, { useState, useEffect } from 'react'
import {
    Users, UserCheck, UserX, Clock, CheckCircle, XCircle,
    DollarSign, Package, TrendingUp, Eye, Loader2,
    Search, Calendar, X, ExternalLink, Globe, Star, Percent,
    Instagram, Twitter, Youtube, Bell, Award
} from 'lucide-react'
import { adminAPI } from '../services/api.js'
import { useTranslation } from '../context/LanguageContext'
import toast from 'react-hot-toast'

// Modal pour voir les détails complets d'une demande
function ViewRequestDetailModal({ request, onClose, onApprove, onReject }) {
    const { t } = useTranslation()
    const [rejectReason, setRejectReason] = useState('')
    const [showRejectForm, setShowRejectForm] = useState(false)
    const [selectedType, setSelectedType] = useState('NON_AFFILIATED')
    const [processing, setProcessing] = useState(false)

    const socialLinks = request.social_links ?
        (typeof request.social_links === 'string' ? JSON.parse(request.social_links) : request.social_links)
        : {}

    const handleApprove = async () => {
        setProcessing(true)
        try {
            await onApprove(request.id, selectedType)
            onClose()
        } finally {
            setProcessing(false)
        }
    }

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error(t('sellers.errors.reasonRequired'))
            return
        }
        setProcessing(true)
        try {
            await onReject(request.id, rejectReason)
            onClose()
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 w-full max-w-3xl my-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center">
                            <span className="text-xl font-bold text-white">
                                {request.username?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{request.username}</h3>
                            <p className="text-gray-400">{request.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Présentation */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">{t('sellers.modal.presentation')}</h4>
                        <div className="bg-hyt-dark rounded-lg p-4">
                            <p className="text-white whitespace-pre-wrap">
                                {request.message || t('sellers.modal.noPresentation')}
                            </p>
                        </div>
                    </div>

                    {/* Portfolio */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">{t('sellers.modal.portfolio')}</h4>
                        <div className="bg-hyt-dark rounded-lg p-4 space-y-3">
                            {request.portfolio_url && (
                                <a
                                    href={request.portfolio_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-hyt-accent hover:underline"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    {request.portfolio_url}
                                </a>
                            )}
                            <p className="text-white whitespace-pre-wrap">
                                {request.portfolio_description || t('sellers.modal.noPortfolioDescription')}
                            </p>
                        </div>
                    </div>

                    {/* Expérience */}
                    {request.experience && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">{t('sellers.modal.experience')}</h4>
                            <div className="bg-hyt-dark rounded-lg p-4">
                                <p className="text-white whitespace-pre-wrap">{request.experience}</p>
                            </div>
                        </div>
                    )}

                    {/* Réseaux sociaux */}
                    {Object.keys(socialLinks).length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-400 mb-2">{t('sellers.modal.socialNetworks')}</h4>
                            <div className="flex flex-wrap gap-3">
                                {socialLinks.twitter && (
                                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                                       className="flex items-center gap-2 px-3 py-2 bg-hyt-dark rounded-lg text-gray-300 hover:text-white">
                                        <Twitter className="w-4 h-4" />
                                        Twitter
                                    </a>
                                )}
                                {socialLinks.instagram && (
                                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                                       className="flex items-center gap-2 px-3 py-2 bg-hyt-dark rounded-lg text-gray-300 hover:text-white">
                                        <Instagram className="w-4 h-4" />
                                        Instagram
                                    </a>
                                )}
                                {socialLinks.youtube && (
                                    <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                                       className="flex items-center gap-2 px-3 py-2 bg-hyt-dark rounded-lg text-gray-300 hover:text-white">
                                        <Youtube className="w-4 h-4" />
                                        YouTube
                                    </a>
                                )}
                                {socialLinks.website && (
                                    <a href={socialLinks.website} target="_blank" rel="noopener noreferrer"
                                       className="flex items-center gap-2 px-3 py-2 bg-hyt-dark rounded-lg text-gray-300 hover:text-white">
                                        <Globe className="w-4 h-4" />
                                        {t('sellers.modal.website')}
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Date de demande */}
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {t('sellers.modal.requestSentOn')} {new Date(request.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                    </div>

                    {/* Actions */}
                    {!showRejectForm ? (
                        <div className="border-t border-hyt-border pt-6">
                            <h4 className="text-sm font-medium text-gray-400 mb-3">{t('sellers.modal.sellerTypeToAssign')}</h4>

                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <button
                                    onClick={() => setSelectedType('NON_AFFILIATED')}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        selectedType === 'NON_AFFILIATED'
                                            ? 'border-gray-500 bg-gray-500/10'
                                            : 'border-hyt-border hover:border-gray-500/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="w-5 h-5 text-gray-400" />
                                        <span className="font-medium text-white">{t('sellers.types.nonAffiliated')}</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">85%</p>
                                    <p className="text-xs text-gray-500">{t('sellers.commission')}: 15%</p>
                                </button>

                                <button
                                    onClick={() => setSelectedType('AFFILIATED')}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        selectedType === 'AFFILIATED'
                                            ? 'border-hyt-accent bg-hyt-accent/10'
                                            : 'border-hyt-border hover:border-hyt-accent/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="w-5 h-5 text-hyt-accent" />
                                        <span className="font-medium text-white">{t('sellers.types.affiliated')}</span>
                                    </div>
                                    <p className="text-2xl font-bold text-hyt-accent">90%</p>
                                    <p className="text-xs text-gray-500">{t('sellers.commission')}: 10%</p>
                                </button>

                                <button
                                    onClick={() => setSelectedType('HYTSTUDIO')}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        selectedType === 'HYTSTUDIO'
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-hyt-border hover:border-purple-500/50'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="w-5 h-5 text-purple-400" />
                                        <span className="font-medium text-white">HytStudio</span>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-400">100%</p>
                                    <p className="text-xs text-gray-500">{t('sellers.platform')}</p>
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRejectForm(true)}
                                    className="btn-ghost flex-1 flex items-center justify-center gap-2 text-red-400 hover:text-red-300"
                                >
                                    <XCircle className="w-5 h-5" />
                                    {t('sellers.actions.reject')}
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={processing}
                                    className="btn-primary flex-1 bg-green-500 hover:bg-green-600 flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-5 h-5" />
                                    )}
                                    {t('sellers.actions.approve')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="border-t border-hyt-border pt-6">
                            <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                                <XCircle className="w-4 h-4" />
                                {t('sellers.modal.rejectRequest')}
                            </h4>

                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder={t('sellers.modal.rejectPlaceholder')}
                                rows={4}
                                className="input-field w-full resize-none mb-4"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowRejectForm(false)}
                                    className="btn-ghost flex-1"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={processing || !rejectReason.trim()}
                                    className="btn-primary flex-1 bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <XCircle className="w-5 h-5" />
                                    )}
                                    {t('sellers.modal.confirmReject')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Badge pour le type de vendeur
function CreatorTypeBadge({ type }) {
    const { t } = useTranslation()
    switch (type) {
        case 'AFFILIATED':
            return (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-hyt-accent/20 text-hyt-accent rounded-full text-xs font-medium">
                    <Star className="w-3 h-3" />
                    {t('sellers.types.affiliated')} (90%)
                </span>
            )
        case 'HYTSTUDIO':
            return (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                    <DollarSign className="w-3 h-3" />
                    HytStudio
                </span>
            )
        default:
            return (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium">
                    <Users className="w-3 h-3" />
                    {t('sellers.types.nonAffiliated')} (85%)
                </span>
            )
    }
}

export default function AdminSellers() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('requests')
    const [requests, setRequests] = useState([])
    const [sellers, setSellers] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(null)
    const [viewModal, setViewModal] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [notifications, setNotifications] = useState([])
    const [eligibleSellers, setEligibleSellers] = useState([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [requestsRes, sellersRes, statsRes, notifRes, eligibleRes] = await Promise.all([
                adminAPI.getCreatorRequests().catch(() => ({ data: { requests: [] } })),
                adminAPI.getSellers().catch(() => ({ data: { sellers: [] } })),
                adminAPI.getSellersStats().catch(() => ({ data: {} })),
                adminAPI.getNotifications().catch(() => ({ data: { notifications: [] } })),
                adminAPI.getEligibleAffiliate().catch(() => ({ data: { sellers: [] } }))
            ])

            setRequests(requestsRes.data.requests || requestsRes.data || [])
            setSellers(sellersRes.data.sellers || sellersRes.data || [])
            setStats(statsRes.data.stats || statsRes.data || {})
            setNotifications(notifRes.data.notifications || notifRes.data || [])
            setEligibleSellers(eligibleRes.data.sellers || eligibleRes.data || [])
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (requestId, creatorType) => {
        setProcessing(requestId)
        try {
            await adminAPI.approveCreatorRequest(requestId, creatorType)
            toast.success(t('sellers.success.approved'))
            fetchData()
        } catch (error) {
            toast.error(t('sellers.errors.approveFailed'))
        } finally {
            setProcessing(null)
        }
    }

    const handleReject = async (requestId, reason) => {
        setProcessing(requestId)
        try {
            await adminAPI.rejectCreatorRequest(requestId, reason)
            toast.success(t('sellers.success.rejected'))
            fetchData()
        } catch (error) {
            toast.error(t('sellers.errors.rejectFailed'))
        } finally {
            setProcessing(null)
        }
    }

    const handleChangeCreatorType = async (userId, newType) => {
        try {
            await adminAPI.updateCreatorType(userId, newType)
            toast.success(t('sellers.success.typeUpdated'))
            fetchData()
        } catch (error) {
            toast.error(t('sellers.errors.updateFailed'))
        }
    }

    const handleMarkNotificationRead = async (notifId) => {
        try {
            await adminAPI.markNotificationRead(notifId)
            fetchData()
        } catch (error) {
            console.error('Error marking notification read:', error)
        }
    }

    const handlePromoteToAffiliate = async (userId) => {
        try {
            await adminAPI.updateCreatorType(userId, 'AFFILIATED')
            toast.success(t('sellers.success.promoted'))
            fetchData()
        } catch (error) {
            toast.error(t('sellers.errors.promoteFailed'))
        }
    }

    const filteredSellers = sellers.filter(seller =>
        seller.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seller.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">{t('sellers.title')}</h2>

            {/* Stats globales */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-hyt-accent/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-hyt-accent" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{stats.totalSellers || 0}</p>
                            <p className="text-xs text-gray-400">{t('sellers.stats.activeSellers')}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {parseFloat(stats.totalRevenue || 0).toFixed(0)}€
                            </p>
                            <p className="text-xs text-gray-400">{t('sellers.stats.totalRevenue')}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Percent className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {parseFloat(stats.totalCommissions || 0).toFixed(0)}€
                            </p>
                            <p className="text-xs text-gray-400">{t('sellers.stats.commissions')}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{requests.length}</p>
                            <p className="text-xs text-gray-400">{t('sellers.stats.pendingRequests')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-hyt-border">
                <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-4 py-3 font-medium transition-colors relative ${
                        activeTab === 'requests'
                            ? 'text-hyt-accent'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    {t('sellers.tabs.requests')}
                    {requests.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded-full">
                            {requests.length}
                        </span>
                    )}
                    {activeTab === 'requests' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('eligible')}
                    className={`px-4 py-3 font-medium transition-colors relative ${
                        activeTab === 'eligible'
                            ? 'text-hyt-accent'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        {t('sellers.tabs.eligible')}
                    </span>
                    {eligibleSellers.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-hyt-accent text-black text-xs font-bold rounded-full">
                            {eligibleSellers.length}
                        </span>
                    )}
                    {activeTab === 'eligible' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('sellers')}
                    className={`px-4 py-3 font-medium transition-colors relative ${
                        activeTab === 'sellers'
                            ? 'text-hyt-accent'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    {t('sellers.tabs.activeSellers')}
                    <span className="ml-2 text-gray-500">({sellers.length})</span>
                    {activeTab === 'sellers' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                    )}
                </button>
            </div>

            {/* Tab: Demandes */}
            {activeTab === 'requests' && (
                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <p className="text-white font-medium">{t('sellers.requests.noPending')}</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {t('sellers.requests.allProcessed')}
                            </p>
                        </div>
                    ) : (
                        requests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-hyt-card border border-yellow-500/30 rounded-xl p-4 hover:bg-yellow-500/5 transition-colors cursor-pointer"
                                onClick={() => setViewModal(request)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center flex-shrink-0">
                                        <span className="text-lg font-bold text-white">
                                            {request.username?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-white font-medium">{request.username}</h3>
                                            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium">
                                                {t('sellers.requests.pending')}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm">{request.email}</p>
                                        <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                                            {request.portfolio_description || request.message || t('sellers.requests.noDescription')}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <div className="text-right">
                                            <p className="text-gray-500 text-xs">
                                                {new Date(request.created_at).toLocaleDateString('fr-FR')}
                                            </p>
                                            {request.portfolio_url && (
                                                <a
                                                    href={request.portfolio_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="text-hyt-accent text-xs hover:underline flex items-center gap-1 justify-end"
                                                >
                                                    <ExternalLink className="w-3 h-3" />
                                                    Portfolio
                                                </a>
                                            )}
                                        </div>
                                        <Eye className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Tab: Éligibles Affilié */}
            {activeTab === 'eligible' && (
                <div className="space-y-4">
                    {eligibleSellers.length === 0 ? (
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                            <Award className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                            <p className="text-white font-medium">{t('sellers.eligible.noEligible')}</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {t('sellers.eligible.willAppearHere')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-hyt-accent/10 border border-hyt-accent/30 rounded-xl p-4">
                                <p className="text-hyt-accent text-sm">
                                    {t('sellers.eligible.info', { count: eligibleSellers.length })}
                                </p>
                            </div>

                            {eligibleSellers.map((seller) => (
                                <div
                                    key={seller.id}
                                    className="bg-hyt-card border border-hyt-accent/30 rounded-xl p-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center flex-shrink-0">
                                            <span className="text-lg font-bold text-white">
                                                {seller.username?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-white font-medium">{seller.username}</h3>
                                                <CreatorTypeBadge type={seller.creator_type} />
                                            </div>
                                            <p className="text-gray-400 text-sm">{seller.email}</p>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-hyt-accent font-bold">
                                                    {seller.total_sales} {t('sellers.sales')}
                                                </span>
                                                <span className="text-green-500">
                                                    {parseFloat(seller.total_revenue || 0).toFixed(2)}€ {t('sellers.generated')}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handlePromoteToAffiliate(seller.id)}
                                            className="btn-primary bg-hyt-accent hover:bg-hyt-accent/80 flex items-center gap-2"
                                        >
                                            <Star className="w-4 h-4" />
                                            {t('sellers.actions.promoteAffiliate')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tab: Vendeurs actifs */}
            {activeTab === 'sellers' && (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('sellers.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-12 w-full"
                        />
                    </div>

                    {filteredSellers.length === 0 ? (
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                            <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                            <p className="text-white font-medium">{t('sellers.noSellersFound')}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b border-hyt-border">
                                    <th className="text-left py-4 px-4 text-gray-400 font-medium">{t('sellers.table.seller')}</th>
                                    <th className="text-left py-4 px-4 text-gray-400 font-medium">{t('sellers.table.type')}</th>
                                    <th className="text-left py-4 px-4 text-gray-400 font-medium">{t('sellers.table.products')}</th>
                                    <th className="text-left py-4 px-4 text-gray-400 font-medium">{t('sellers.table.sales')}</th>
                                    <th className="text-left py-4 px-4 text-gray-400 font-medium">{t('sellers.table.revenue')}</th>
                                    <th className="text-left py-4 px-4 text-gray-400 font-medium">{t('sellers.table.actions')}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredSellers.map((seller) => (
                                    <tr key={seller.id} className="border-b border-hyt-border/50 hover:bg-hyt-dark/30">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center">
                                                        <span className="text-sm font-bold text-white">
                                                            {seller.username?.charAt(0).toUpperCase()}
                                                        </span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{seller.username}</p>
                                                    <p className="text-gray-500 text-xs">{seller.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <CreatorTypeBadge type={seller.creator_type} />
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-white font-medium">{seller.products_count || 0}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-white font-medium">{seller.sales_count || 0}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                                <span className="text-green-500 font-medium">
                                                    {parseFloat(seller.total_revenue || 0).toFixed(2)}€
                                                </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <select
                                                value={seller.creator_type || 'NON_AFFILIATED'}
                                                onChange={(e) => handleChangeCreatorType(seller.id, e.target.value)}
                                                className="input-field text-sm py-1 px-2"
                                            >
                                                <option value="NON_AFFILIATED">{t('sellers.types.nonAffiliated')} (85%)</option>
                                                <option value="AFFILIATED">{t('sellers.types.affiliated')} (90%)</option>
                                                <option value="HYTSTUDIO">HytStudio (100%)</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Modal détails */}
            {viewModal && (
                <ViewRequestDetailModal
                    request={viewModal}
                    onClose={() => setViewModal(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}
        </div>
    )
}