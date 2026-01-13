import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Users,
    Package,
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    Ban,
    UserCheck,
    Trash2,
    Eye,
    EyeOff,
    Search,
    Filter,
    ChevronRight,
    Loader2,
    BarChart3,
    Gamepad2,
    Tag,
    Layers,
    AlertTriangle,
    X,
    Settings,
    MessageSquare,
    Flag,
    Download,
    Globe,
    Timer,
    Activity,
    PieChart,
    PenTool,
    CreditCard
} from 'lucide-react'
import { adminAPI, modelsAPI, dependenciesAPI, customOrdersAPI } from '../services/api'
import { useTranslation } from '../context/LanguageContext'
import toast from 'react-hot-toast'
import AdminSellers from './AdminSellers'
import AdminSettings from './AdminSettings'
import AdminFeedback from './AdminFeedback'
import AdminAnalytics from './AdminAnalytics'
import AdminCustomOrders from './AdminCustomOrders'

// Fonction pour obtenir l'URL complète de l'image
const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `http://localhost:3001${url}`
}

// Composant Stats Card
function StatCard({ title, value, icon: Icon, color, trend, subtitle }) {
    const { t } = useTranslation()
    return (
        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm mb-1">{title}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                    )}
                    {trend !== undefined && (
                        <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {trend > 0 ? '+' : ''}{trend}% {t('admin.stats.vsLastMonth')}
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    )
}

// Mini Stats Card (plus compact)
function MiniStatCard({ title, value, icon: Icon, color, subtitle }) {
    return (
        <div className="bg-hyt-dark border border-hyt-border rounded-lg p-3 flex items-center gap-2 min-w-0">
            <div className={`p-2 rounded-lg flex-shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-gray-400 text-xs truncate">{title}</p>
                <p className="text-base font-bold text-white">{value}</p>
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
        </div>
    )
}

// Dashboard Overview - MODIFIÉ avec nouvelles stats
function AdminOverview() {
    const { t } = useTranslation()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [reportsCount, setReportsCount] = useState({ pending: 0, reviewed: 0, total: 0 })
    const [siteStats, setSiteStats] = useState({ visits: 0, downloads: 0, avgTime: '0:00' })
    const [customOrdersCount, setCustomOrdersCount] = useState(0)

    useEffect(() => {
        loadStats()
        loadReportsCount()
        loadSiteStats()
        loadCustomOrdersCount()
    }, [])

    const loadStats = async () => {
        try {
            const { data } = await adminAPI.getDashboardStats()
            setStats(data)
        } catch (error) {
            console.error('Failed to load stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadReportsCount = async () => {
        try {
            const [pendingRes, reviewedRes, allRes] = await Promise.all([
                adminAPI.getReports('PENDING').catch(() => ({ data: { reports: [] } })),
                adminAPI.getReports('REVIEWED').catch(() => ({ data: { reports: [] } })),
                adminAPI.getReports().catch(() => ({ data: { reports: [] } }))
            ])
            setReportsCount({
                pending: pendingRes.data.reports?.length || 0,
                reviewed: reviewedRes.data.reports?.length || 0,
                total: allRes.data.reports?.length || 0
            })
        } catch (error) {
            console.error('Failed to load reports count:', error)
        }
    }

    const loadSiteStats = async () => {
        try {
            const { data } = await adminAPI.getSiteStats().catch(() => ({ data: null }))
            if (data) {
                setSiteStats({
                    visits: data.totalVisits || 0,
                    downloads: data.totalDownloads || 0,
                    avgTime: data.avgTimeOnSite || '0:00'
                })
            }
        } catch (error) {
            console.error('Failed to load site stats:', error)
        }
    }

    const loadCustomOrdersCount = async () => {
        try {
            const { data } = await customOrdersAPI.getStaffRequests('PENDING').catch(() => ({ data: { requests: [] } }))
            setCustomOrdersCount(data.requests?.length || 0)
        } catch (error) {
            console.error('Failed to load custom orders count:', error)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
            </div>
        )
    }

    // Calcul des montants (les valeurs sont en centimes)
    const totalRevenue = (stats?.totalRevenue || 0) / 100
    const platformCommission = (stats?.platformCommission || 0) / 100
    const stripeFees = (stats?.totalStripeFees || 0) / 100
    const sellerEarnings = (stats?.sellerEarnings || 0) / 100
    const totalDownloads = stats?.totalDownloads || siteStats.downloads || 0

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">{t('admin.overview.title')}</h2>

            {/* Stats principales - Revenus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={t('admin.stats.totalRevenue')}
                    value={`${totalRevenue.toFixed(2)} €`}
                    subtitle={`${stats?.salesCount || 0} ventes`}
                    icon={DollarSign}
                    color="bg-green-500/20 text-green-500"
                />
                <StatCard
                    title="Revenus Plateforme"
                    value={`${platformCommission.toFixed(2)} €`}
                    subtitle="Commissions + ventes HytStudio"
                    icon={TrendingUp}
                    color="bg-hyt-accent/20 text-hyt-accent"
                />
                <StatCard
                    title="Frais Stripe"
                    value={`${stripeFees.toFixed(2)} €`}
                    subtitle="1.5% + 0.25€ par transaction"
                    icon={CreditCard}
                    color="bg-red-500/20 text-red-500"
                />
                <StatCard
                    title="Versé aux créateurs"
                    value={`${sellerEarnings.toFixed(2)} €`}
                    subtitle={`${stats?.sellersCount || 0} vendeurs actifs`}
                    icon={Users}
                    color="bg-purple-500/20 text-purple-500"
                />
            </div>

            {/* Stats secondaires - Site & Signalements */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <MiniStatCard
                    title="Vues produits"
                    value={siteStats.visits.toLocaleString()}
                    icon={Eye}
                    color="bg-blue-500/20 text-blue-500"
                />
                <MiniStatCard
                    title="Téléchargements"
                    value={totalDownloads.toLocaleString()}
                    icon={Download}
                    color="bg-green-500/20 text-green-500"
                />
                <MiniStatCard
                    title="Acheteurs"
                    value={(stats?.buyersCount || 0).toLocaleString()}
                    icon={Users}
                    color="bg-purple-500/20 text-purple-500"
                />
                <MiniStatCard
                    title={t('admin.stats.reports')}
                    value={reportsCount.pending}
                    icon={Flag}
                    color="bg-red-500/20 text-red-500"
                />
                <MiniStatCard
                    title={t('admin.stats.customOrders')}
                    value={customOrdersCount}
                    icon={PenTool}
                    color="bg-orange-500/20 text-orange-500"
                />
                <MiniStatCard
                    title={t('admin.stats.totalReports')}
                    value={reportsCount.total}
                    icon={AlertTriangle}
                    color="bg-gray-500/20 text-gray-400"
                />
            </div>

            {/* Résumé financier */}
            <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Résumé Financier</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-hyt-border">
                            <span className="text-gray-400">Revenus bruts (clients)</span>
                            <span className="text-white font-medium">{totalRevenue.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-hyt-border">
                            <span className="text-gray-400">- Frais Stripe</span>
                            <span className="text-red-400 font-medium">-{stripeFees.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-hyt-border">
                            <span className="text-gray-400">= Net après Stripe</span>
                            <span className="text-white font-medium">{(totalRevenue - stripeFees).toFixed(2)} €</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-hyt-border">
                            <span className="text-gray-400">Revenus plateforme</span>
                            <span className="text-hyt-accent font-bold">{platformCommission.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-hyt-border">
                            <span className="text-gray-400">Versé aux créateurs</span>
                            <span className="text-purple-400 font-medium">{sellerEarnings.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-400">Vérification</span>
                            <span className={`font-medium ${Math.abs(totalRevenue - stripeFees - platformCommission - sellerEarnings) < 0.01 ? 'text-green-400' : 'text-red-400'}`}>
                                {(platformCommission + sellerEarnings + stripeFees).toFixed(2)} € = {totalRevenue.toFixed(2)} €
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alertes Signalements et Commandes sur mesure */}
            {(reportsCount.pending > 0 || customOrdersCount > 0) && (
                <div className="space-y-3">
                    {reportsCount.pending > 0 && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-500/20 rounded-lg">
                                        <Flag className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-red-400 font-medium">
                                            {t('admin.alerts.pendingReports', { count: reportsCount.pending })}
                                        </p>
                                        <p className="text-red-400/70 text-sm">
                                            {t('admin.alerts.reportsNeedAttention')}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    to="/admin/feedback"
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                >
                                    {t('admin.alerts.viewReports')}
                                </Link>
                            </div>
                        </div>
                    )}

                    {customOrdersCount > 0 && (
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500/20 rounded-lg">
                                        <PenTool className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-orange-400 font-medium">
                                            {t('admin.alerts.pendingCustomOrders', { count: customOrdersCount })}
                                        </p>
                                        <p className="text-orange-400/70 text-sm">
                                            {t('admin.alerts.customOrdersNeedValidation')}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    to="/admin/custom-orders"
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                                >
                                    {t('admin.alerts.viewRequests')}
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">{t('admin.quickActions.title')}</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            to="/admin/pending"
                            className="flex items-center gap-3 p-4 bg-hyt-dark rounded-lg hover:bg-hyt-dark/70 transition-colors"
                        >
                            <Clock className="w-5 h-5 text-yellow-500" />
                            <span className="text-white">{t('admin.quickActions.pendingProducts')}</span>
                        </Link>
                        <Link
                            to="/admin/users"
                            className="flex items-center gap-3 p-4 bg-hyt-dark rounded-lg hover:bg-hyt-dark/70 transition-colors"
                        >
                            <Users className="w-5 h-5 text-hyt-accent" />
                            <span className="text-white">{t('admin.quickActions.users')}</span>
                        </Link>
                        <Link
                            to="/admin/custom-orders"
                            className="flex items-center gap-3 p-4 bg-hyt-dark rounded-lg hover:bg-hyt-dark/70 transition-colors relative"
                        >
                            <PenTool className="w-5 h-5 text-orange-500" />
                            <span className="text-white">{t('admin.quickActions.customOrders')}</span>
                            {customOrdersCount > 0 && (
                                <span className="absolute top-2 right-2 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {customOrdersCount}
                                </span>
                            )}
                        </Link>
                        <Link
                            to="/admin/sellers"
                            className="flex items-center gap-3 p-4 bg-hyt-dark rounded-lg hover:bg-hyt-dark/70 transition-colors"
                        >
                            <BarChart3 className="w-5 h-5 text-green-500" />
                            <span className="text-white">{t('admin.quickActions.sellers')}</span>
                        </Link>
                    </div>
                </div>

                {/* Signalements récents */}
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">{t('admin.reportsSection.title')}</h3>
                        <Link to="/admin/feedback" className="text-sm text-hyt-accent hover:underline">
                            {t('admin.reportsSection.viewAll')} →
                        </Link>
                    </div>
                    {reportsCount.total === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                            <p className="text-gray-400">{t('admin.reportsSection.noReports')}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-hyt-dark rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <span className="text-gray-300">{t('admin.reportsSection.pending')}</span>
                                </div>
                                <span className="text-white font-bold">{reportsCount.pending}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-hyt-dark rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <span className="text-gray-300">{t('admin.reportsSection.underReview')}</span>
                                </div>
                                <span className="text-white font-bold">{reportsCount.reviewed}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-hyt-dark rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                    <span className="text-gray-300">{t('admin.reportsSection.processed')}</span>
                                </div>
                                <span className="text-white font-bold">{reportsCount.total - reportsCount.pending - reportsCount.reviewed}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Composant pour afficher une valeur modifiée avec surbrillance
function ModifiedValue({ label, oldValue, newValue, type = 'text' }) {
    const { t } = useTranslation()
    if (!oldValue && !newValue) return null

    const hasChanged = oldValue !== newValue && oldValue !== undefined && oldValue !== null

    if (type === 'price') {
        const oldPrice = parseFloat(oldValue || 0).toFixed(2)
        const newPrice = parseFloat(newValue || 0).toFixed(2)
        const changed = oldPrice !== newPrice && oldValue !== undefined

        return (
            <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">{label}:</span>
                {changed ? (
                    <>
                        <span className="line-through text-red-400 text-xs">{oldPrice}€</span>
                        <span className="text-green-400 font-medium bg-green-500/20 px-1 rounded">{newPrice}€</span>
                    </>
                ) : (
                    <span className="text-white text-sm">{newPrice}€</span>
                )}
            </div>
        )
    }

    if (!hasChanged) {
        return (
            <div className="text-sm">
                <span className="text-gray-500 text-xs">{label}:</span>
                <span className="text-white ml-1">{newValue || '-'}</span>
            </div>
        )
    }

    return (
        <div className="text-sm">
            <span className="text-gray-500 text-xs">{label}:</span>
            <div className="mt-1 space-y-1">
                <div className="flex items-start gap-1">
                    <span className="text-red-400 text-xs">{t('admin.modifications.before')}:</span>
                    <span className="line-through text-red-400/70 text-xs">{oldValue || t('admin.modifications.empty')}</span>
                </div>
                <div className="flex items-start gap-1">
                    <span className="text-green-400 text-xs">{t('admin.modifications.after')}:</span>
                    <span className="bg-green-500/20 text-green-400 px-1 rounded text-xs">{newValue || t('admin.modifications.empty')}</span>
                </div>
            </div>
        </div>
    )
}

// Modal de détail des modifications
function ModificationDetailModal({ model, onClose }) {
    const { t } = useTranslation()
    const prev = model.previous_values || {}

    const changes = []

    if (prev.title !== undefined && prev.title !== model.title) {
        changes.push({ label: t('admin.modifications.fields.title'), old: prev.title, new: model.title })
    }
    if (prev.description !== undefined && prev.description !== model.description) {
        changes.push({ label: t('admin.modifications.fields.description'), old: prev.description, new: model.description, isLong: true })
    }
    if (prev.price !== undefined && parseFloat(prev.price) !== parseFloat(model.price)) {
        const oldPrice = parseFloat(prev.price) === 0 ? t('common.free') : `${parseFloat(prev.price).toFixed(2)}€`
        const newPrice = parseFloat(model.price) === 0 ? t('common.free') : `${parseFloat(model.price).toFixed(2)}€`
        changes.push({ label: t('admin.modifications.fields.price'), old: oldPrice, new: newPrice })
    }
    if (prev.youtube_url !== model.youtube_url) {
        changes.push({ label: 'YouTube', old: prev.youtube_url || t('admin.modifications.none'), new: model.youtube_url || t('admin.modifications.none') })
    }
    if (prev.game_id !== model.game_id) {
        changes.push({ label: t('admin.modifications.fields.game'), old: t('admin.modifications.changed'), new: model.game_name || 'N/A' })
    }
    if (prev.category_id !== model.category_id) {
        changes.push({ label: t('admin.modifications.fields.category'), old: t('admin.modifications.changed'), new: model.category_name || 'N/A' })
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Eye className="w-5 h-5 text-blue-500" />
                        {t('admin.modifications.detailTitle')}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-4">
                    <h4 className="text-lg font-medium text-white mb-2">{model.title}</h4>
                    <p className="text-gray-400 text-sm">{t('admin.products.by')} {model.creator_username}</p>
                </div>

                {changes.length === 0 ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-green-400">{t('admin.modifications.newProduct')}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                            <p className="text-blue-400 text-sm font-medium">
                                {t('admin.modifications.changesDetected', { count: changes.length })}
                            </p>
                        </div>

                        {changes.map((change, index) => (
                            <div key={index} className="bg-hyt-dark rounded-lg p-4">
                                <p className="text-gray-400 text-xs font-medium mb-2">{change.label}</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-red-400 text-xs mb-1">{t('admin.modifications.before')}</p>
                                        <p className={`text-red-300 ${change.isLong ? 'text-xs' : 'text-sm'} bg-red-500/10 p-2 rounded line-through`}>
                                            {change.old || t('admin.modifications.empty')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-green-400 text-xs mb-1">{t('admin.modifications.after')}</p>
                                        <p className={`text-green-300 ${change.isLong ? 'text-xs' : 'text-sm'} bg-green-500/10 p-2 rounded`}>
                                            {change.new || t('admin.modifications.empty')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {model.previous_hidden_reason && (
                    <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                        <p className="text-orange-400 text-sm font-medium mb-1">{t('admin.modifications.previousHiddenReason')}:</p>
                        <p className="text-orange-300 text-sm">{model.previous_hidden_reason}</p>
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="btn-ghost">
                        {t('common.close')}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Pending Models
function PendingModels({ onCountChange }) {
    const { t } = useTranslation()
    const [models, setModels] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(null)
    const [selectedModel, setSelectedModel] = useState(null)

    useEffect(() => {
        loadPendingModels()
    }, [])

    const loadPendingModels = async () => {
        try {
            const { data } = await adminAPI.getPendingModels()
            const modelsArray = Array.isArray(data) ? data : (data.models || [])
            setModels(modelsArray)
            if (onCountChange) {
                onCountChange(modelsArray.length)
            }
        } catch (error) {
            console.error('Failed to load pending models:', error)
            setModels([])
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (modelId) => {
        setProcessing(modelId)
        try {
            await modelsAPI.approve(modelId)
            toast.success(t('admin.products.success.approved'))
            loadPendingModels()
        } catch (error) {
            toast.error(t('admin.products.errors.approveFailed'))
        } finally {
            setProcessing(null)
        }
    }

    const handleReject = async (modelId) => {
        setProcessing(modelId)
        try {
            await modelsAPI.reject(modelId)
            toast.success(t('admin.products.success.rejected'))
            loadPendingModels()
        } catch (error) {
            toast.error(t('admin.products.errors.rejectFailed'))
        } finally {
            setProcessing(null)
        }
    }

    const hasModifications = (model) => {
        return model.modification_reason === 'CREATOR_UPDATE' || model.modification_reason === 'HIDDEN_CORRECTION'
    }

    const countChanges = (model) => {
        if (!model.previous_values) return 0
        const prev = model.previous_values
        let count = 0
        if (prev.title !== undefined && prev.title !== model.title) count++
        if (prev.description !== undefined && prev.description !== model.description) count++
        if (prev.price !== undefined && parseFloat(prev.price) !== parseFloat(model.price)) count++
        if (prev.youtube_url !== model.youtube_url) count++
        if (prev.game_id !== model.game_id) count++
        if (prev.category_id !== model.category_id) count++
        return count
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
            <h2 className="text-2xl font-bold text-white">{t('admin.pending.title')}</h2>

            {models.length === 0 ? (
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-white font-medium">{t('admin.pending.noPending')}</p>
                    <p className="text-gray-400 text-sm mt-1">{t('admin.pending.allProcessed')}</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {models.map((model) => {
                        const changeCount = countChanges(model)
                        const isModified = hasModifications(model)

                        return (
                            <div
                                key={model.id}
                                className={`bg-hyt-card border rounded-xl p-4 ${
                                    model.modification_reason === 'HIDDEN_CORRECTION'
                                        ? 'border-orange-500/50 bg-orange-500/5'
                                        : model.modification_reason === 'CREATOR_UPDATE'
                                            ? 'border-blue-500/50 bg-blue-500/5'
                                            : 'border-hyt-border'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-hyt-dark flex-shrink-0">
                                        {model.thumbnail_url ? (
                                            <img
                                                src={getImageUrl(model.thumbnail_url)}
                                                alt={model.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                <Package className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h3 className="text-white font-medium truncate">{model.title}</h3>
                                            {model.modification_reason === 'HIDDEN_CORRECTION' ? (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 text-orange-500 rounded-full text-xs font-medium">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    {t('admin.pending.badges.corrected')}
                                                </span>
                                            ) : model.modification_reason === 'CREATOR_UPDATE' ? (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded-full text-xs font-medium">
                                                    <Clock className="w-3 h-3" />
                                                    {t('admin.pending.badges.modified')}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                                                    <CheckCircle className="w-3 h-3" />
                                                    {t('admin.pending.badges.new')}
                                                </span>
                                            )}
                                            {isModified && changeCount > 0 && (
                                                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                                                    {changeCount} {t('admin.pending.modifs', { count: changeCount })}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-gray-400 text-sm">{t('admin.products.by')} {model.creator_username}</p>

                                        <div className="flex flex-wrap gap-4 mt-2">
                                                <span className={`font-medium ${parseFloat(model.price) === 0 ? 'text-green-400' : 'text-hyt-accent'}`}>
                                                    {parseFloat(model.price) === 0 ? t('common.free') : `${parseFloat(model.price).toFixed(2)} €`}
                                                </span>
                                            {model.game_name && (
                                                <span className="text-gray-400 text-sm">{model.game_name}</span>
                                            )}
                                            {model.category_name && (
                                                <span className="text-gray-500 text-sm">{model.category_name}</span>
                                            )}
                                        </div>

                                        {isModified && model.previous_values && (
                                            <div className="mt-3 p-3 bg-hyt-dark/50 rounded-lg border border-hyt-border">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-xs text-gray-400 font-medium">{t('admin.pending.modificationsPreview')}:</p>
                                                    <button
                                                        onClick={() => setSelectedModel(model)}
                                                        className="text-xs text-hyt-accent hover:underline"
                                                    >
                                                        {t('admin.pending.viewAll')} →
                                                    </button>
                                                </div>
                                                <div className="space-y-2 text-xs">
                                                    {model.previous_values.title !== model.title && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-500">{t('admin.modifications.fields.title')}:</span>
                                                            <span className="line-through text-red-400">{model.previous_values.title}</span>
                                                            <span className="text-green-400">→</span>
                                                            <span className="bg-green-500/20 text-green-400 px-1 rounded">{model.title}</span>
                                                        </div>
                                                    )}
                                                    {model.previous_values.price !== undefined && parseFloat(model.previous_values.price) !== parseFloat(model.price) && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-500">{t('admin.modifications.fields.price')}:</span>
                                                            <span className="line-through text-red-400">{parseFloat(model.previous_values.price).toFixed(2)}€</span>
                                                            <span className="text-green-400">→</span>
                                                            <span className="bg-green-500/20 text-green-400 px-1 rounded">{parseFloat(model.price).toFixed(2)}€</span>
                                                        </div>
                                                    )}
                                                    {model.previous_values.description !== model.description && (
                                                        <div className="text-yellow-400">
                                                            📝 {t('admin.pending.descriptionModified')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {model.modification_reason === 'HIDDEN_CORRECTION' && model.previous_hidden_reason && (
                                            <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                                                <p className="text-xs text-orange-400">
                                                    <strong>{t('admin.pending.previousHiddenReason')}:</strong> {model.previous_hidden_reason}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <div className="flex items-center gap-2">
                                            {isModified && (
                                                <button
                                                    onClick={() => setSelectedModel(model)}
                                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title={t('admin.pending.viewModifications')}
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            )}
                                            <Link
                                                to={`/models/${model.id}`}
                                                className="p-2 text-gray-400 hover:text-white transition-colors"
                                                title={t('admin.products.view')}
                                            >
                                                <Package className="w-5 h-5" />
                                            </Link>
                                        </div>
                                        <button
                                            onClick={() => handleApprove(model.id)}
                                            disabled={processing === model.id}
                                            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 w-full justify-center"
                                        >
                                            {processing === model.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                            {t('admin.products.approve')}
                                        </button>
                                        <button
                                            onClick={() => handleReject(model.id)}
                                            disabled={processing === model.id}
                                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 w-full justify-center"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            {t('admin.products.reject')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {selectedModel && (
                <ModificationDetailModal
                    model={selectedModel}
                    onClose={() => setSelectedModel(null)}
                />
            )}
        </div>
    )
}

// Users Management
function UsersManagement() {
    const { t } = useTranslation()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('')

    useEffect(() => {
        loadUsers()
    }, [roleFilter])

    const loadUsers = async () => {
        try {
            const { data } = await adminAPI.getUsers({
                role: roleFilter || undefined,
                search: searchQuery || undefined
            })
            setUsers(data.users || data || [])
        } catch (error) {
            console.error('Failed to load users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        loadUsers()
    }

    const handleBan = async (userId, isBanned) => {
        try {
            if (isBanned) {
                await adminAPI.unbanUser(userId)
                toast.success(t('admin.users.success.unbanned'))
            } else {
                await adminAPI.banUser(userId)
                toast.success(t('admin.users.success.banned'))
            }
            loadUsers()
        } catch (error) {
            toast.error(t('admin.users.errors.banFailed'))
        }
    }

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminAPI.setRole(userId, newRole)
            toast.success(t('admin.users.success.roleChanged'))
            loadUsers()
        } catch (error) {
            toast.error(t('admin.users.errors.roleChangeFailed'))
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">{t('admin.users.title')}</h2>

            <div className="flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('admin.users.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-12 w-full"
                        />
                    </div>
                </form>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="input-field w-full sm:w-48"
                >
                    <option value="">{t('admin.users.allRoles')}</option>
                    <option value="USER">User</option>
                    <option value="CREATOR">Creator</option>
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-hyt-border">
                            <th className="text-left py-4 px-4 text-gray-400 font-medium">{t('admin.users.table.user')}</th>
                            <th className="text-left py-4 px-4 text-gray-400 font-medium">{t('admin.users.table.email')}</th>
                            <th className="text-left py-4 px-4 text-gray-400 font-medium">{t('admin.users.table.role')}</th>
                            <th className="text-left py-4 px-4 text-gray-400 font-medium">{t('admin.users.table.registered')}</th>
                            <th className="text-right py-4 px-4 text-gray-400 font-medium">{t('admin.users.table.actions')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-hyt-border/50 hover:bg-hyt-dark/30">
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center">
                                            <span className="text-sm font-bold text-white">
                                                {user.username?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="text-white font-medium">{user.username}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-gray-400">{user.email}</td>
                                <td className="py-4 px-4">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="bg-hyt-dark border border-hyt-border rounded-lg px-3 py-1 text-white text-sm"
                                    >
                                        <option value="USER">User</option>
                                        <option value="CREATOR">Creator</option>
                                        <option value="STAFF">Staff</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </td>
                                <td className="py-4 px-4 text-gray-400">
                                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <button
                                        onClick={() => handleBan(user.id, user.is_banned)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                            user.is_banned
                                                ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                                                : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                                        }`}
                                    >
                                        {user.is_banned ? t('admin.users.unban') : t('admin.users.ban')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

// Modal pour cacher un produit avec raison
function HideModelModal({ model, onClose, onConfirm }) {
    const { t } = useTranslation()
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!reason.trim()) {
            toast.error(t('admin.products.errors.reasonRequired'))
            return
        }

        setLoading(true)
        try {
            await onConfirm(model.id, reason)
            onClose()
        } catch (error) {
            toast.error(t('admin.products.errors.hideFailed'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <EyeOff className="w-5 h-5 text-yellow-500" />
                        {t('admin.products.hideModal.title')}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-gray-400 mb-4">
                    {t('admin.products.hideModal.description', { title: model.title })}
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm text-gray-400 mb-2">
                            {t('admin.products.hideModal.reasonLabel')} *
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={t('admin.products.hideModal.reasonPlaceholder')}
                            rows={4}
                            className="input-field w-full resize-none"
                            required
                        />
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
                            disabled={loading}
                            className="btn-primary flex-1 bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <EyeOff className="w-4 h-4" />
                            )}
                            {t('admin.products.hide')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Modal de confirmation pour supprimer
function DeleteModelModal({ model, onClose, onConfirm }) {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)

    const handleConfirm = async () => {
        setLoading(true)
        try {
            await onConfirm(model.id)
            onClose()
        } catch (error) {
            toast.error(t('admin.products.errors.deleteFailed'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        {t('admin.products.deleteModal.title')}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-gray-400 mb-6">
                    {t('admin.products.deleteModal.description', { title: model.title })}
                </p>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-ghost flex-1"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="btn-primary flex-1 bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                        {t('admin.products.delete')}
                    </button>
                </div>
            </div>
        </div>
    )
}

// Admin Models Management
function AdminModels() {
    const { t } = useTranslation()
    const [models, setModels] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [hideModal, setHideModal] = useState(null)
    const [deleteModal, setDeleteModal] = useState(null)
    const [processing, setProcessing] = useState(null)

    useEffect(() => {
        loadModels()
    }, [statusFilter])

    const loadModels = async () => {
        setLoading(true)
        try {
            try {
                const { data } = await adminAPI.getAllModels({
                    status: statusFilter || undefined
                })
                const modelsArray = Array.isArray(data) ? data : (data.models || [])
                setModels(modelsArray)
            } catch (e) {
                const { data } = await modelsAPI.getAll()
                const modelsArray = Array.isArray(data) ? data : (data.models || [])
                setModels(modelsArray)
            }
        } catch (error) {
            console.error('Failed to load models:', error)
            setModels([])
        } finally {
            setLoading(false)
        }
    }

    const handleHide = async (modelId, reason) => {
        try {
            await modelsAPI.hide(modelId, reason)
            toast.success(t('admin.products.success.hidden'))
            loadModels()
        } catch (error) {
            throw error
        }
    }

    const handleUnhide = async (modelId) => {
        setProcessing(modelId)
        try {
            await modelsAPI.unhide(modelId)
            toast.success(t('admin.products.success.unhidden'))
            loadModels()
        } catch (error) {
            toast.error(t('admin.products.errors.unhideFailed'))
        } finally {
            setProcessing(null)
        }
    }

    const handleDelete = async (modelId) => {
        try {
            await modelsAPI.delete(modelId)
            toast.success(t('admin.products.success.deleted'))
            loadModels()
        } catch (error) {
            throw error
        }
    }

    const handleApprove = async (modelId) => {
        setProcessing(modelId)
        try {
            await modelsAPI.approve(modelId)
            toast.success(t('admin.products.success.approved'))
            loadModels()
        } catch (error) {
            toast.error(t('admin.products.errors.approveFailed'))
        } finally {
            setProcessing(null)
        }
    }

    const handleReject = async (modelId) => {
        setProcessing(modelId)
        try {
            await modelsAPI.reject(modelId)
            toast.success(t('admin.products.success.rejected'))
            loadModels()
        } catch (error) {
            toast.error(t('admin.products.errors.rejectFailed'))
        } finally {
            setProcessing(null)
        }
    }

    const getStatusBadge = (model) => {
        if (model.is_hidden) {
            return (
                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium">
                    <EyeOff className="w-3 h-3" />
                    {t('admin.products.status.hidden')}
                </span>
            )
        }

        switch (model.status) {
            case 'APPROVED':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        {t('admin.products.status.approved')}
                    </span>
                )
            case 'PENDING':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        {t('admin.products.status.pending')}
                    </span>
                )
            case 'REJECTED':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-medium">
                        <XCircle className="w-3 h-3" />
                        {t('admin.products.status.rejected')}
                    </span>
                )
            default:
                return null
        }
    }

    const filteredModels = models.filter(model =>
        model.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.creator_username?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{t('admin.products.title')}</h2>
                <span className="text-gray-400">{t('admin.products.count', { count: filteredModels.length })}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('admin.products.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-12 w-full"
                        />
                    </div>
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-field w-full sm:w-48"
                >
                    <option value="">{t('admin.products.allStatuses')}</option>
                    <option value="APPROVED">{t('admin.products.status.approved')}</option>
                    <option value="PENDING">{t('admin.products.status.pending')}</option>
                    <option value="REJECTED">{t('admin.products.status.rejected')}</option>
                </select>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
                </div>
            ) : filteredModels.length === 0 ? (
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                    <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-white font-medium">{t('admin.products.noProducts')}</p>
                    <p className="text-gray-400 text-sm mt-1">
                        {searchQuery ? t('admin.products.tryOtherTerms') : t('admin.products.noProductsInDb')}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredModels.map((model) => (
                        <div
                            key={model.id}
                            className={`bg-hyt-card border rounded-xl p-4 ${
                                model.is_hidden
                                    ? 'border-yellow-500/50 bg-yellow-500/5'
                                    : 'border-hyt-border'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-hyt-dark flex-shrink-0">
                                    {model.thumbnail_url ? (
                                        <img
                                            src={getImageUrl(model.thumbnail_url)}
                                            alt={model.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                            <Package className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-white font-medium truncate">{model.title}</h3>
                                        {getStatusBadge(model)}
                                    </div>
                                    <p className="text-gray-400 text-sm">
                                        {t('admin.products.by')} <span className="text-hyt-accent">{model.creator_username || t('admin.products.unknown')}</span>
                                    </p>
                                    <p className={`font-medium ${parseFloat(model.price) === 0 ? 'text-green-400' : 'text-white'}`}>
                                        {parseFloat(model.price) === 0 ? t('common.free') : `${parseFloat(model.price).toFixed(2)} €`}
                                    </p>
                                    {model.is_hidden && model.hidden_reason && (
                                        <div className="mt-2 flex items-start gap-2 text-sm text-yellow-500">
                                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <span>{t('admin.products.reason')}: {model.hidden_reason}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Link
                                        to={`/models/${model.id}`}
                                        className="p-2 text-gray-400 hover:text-white transition-colors"
                                        title={t('admin.products.view')}
                                    >
                                        <Eye className="w-5 h-5" />
                                    </Link>

                                    {model.status === 'PENDING' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(model.id)}
                                                disabled={processing === model.id}
                                                className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg flex items-center gap-1 text-sm transition-colors disabled:opacity-50"
                                            >
                                                {processing === model.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="w-4 h-4" />
                                                )}
                                                <span className="hidden sm:inline">{t('admin.products.approve')}</span>
                                            </button>
                                            <button
                                                onClick={() => handleReject(model.id)}
                                                disabled={processing === model.id}
                                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg flex items-center gap-1 text-sm transition-colors disabled:opacity-50"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                <span className="hidden sm:inline">{t('admin.products.reject')}</span>
                                            </button>
                                        </>
                                    )}

                                    {model.status === 'APPROVED' && (
                                        model.is_hidden ? (
                                            <button
                                                onClick={() => handleUnhide(model.id)}
                                                disabled={processing === model.id}
                                                className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg flex items-center gap-1 text-sm transition-colors disabled:opacity-50"
                                            >
                                                {processing === model.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                                <span className="hidden sm:inline">{t('admin.products.unhide')}</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setHideModal(model)}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-3 rounded-lg flex items-center gap-1 text-sm transition-colors"
                                            >
                                                <EyeOff className="w-4 h-4" />
                                                <span className="hidden sm:inline">{t('admin.products.hide')}</span>
                                            </button>
                                        )
                                    )}

                                    <button
                                        onClick={() => setDeleteModal(model)}
                                        className="p-2 text-red-500 hover:text-red-400 transition-colors"
                                        title={t('admin.products.delete')}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {hideModal && (
                <HideModelModal
                    model={hideModal}
                    onClose={() => setHideModal(null)}
                    onConfirm={handleHide}
                />
            )}

            {deleteModal && (
                <DeleteModelModal
                    model={deleteModal}
                    onClose={() => setDeleteModal(null)}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    )
}

// Main Admin Component
export default function Admin() {
    const { t } = useTranslation()
    const location = useLocation()
    const [pendingCount, setPendingCount] = useState(0)
    const [proposalsCount, setProposalsCount] = useState(0)
    const [reportsCount, setReportsCount] = useState(0)
    const [customOrdersCount, setCustomOrdersCount] = useState(0)

    useEffect(() => {
        loadPendingCount()
        loadFeedbackCounts()
        loadCustomOrdersCount()
    }, [])

    const loadPendingCount = async () => {
        try {
            const { data } = await adminAPI.getPendingModels()
            const models = Array.isArray(data) ? data : (data.models || [])
            setPendingCount(models.length)
        } catch (error) {
            console.error('Failed to load pending count:', error)
        }
    }

    const loadFeedbackCounts = async () => {
        try {
            const [proposalsRes, depProposalsRes, reportsRes] = await Promise.all([
                adminAPI.getProposals('PENDING').catch(() => ({ data: { proposals: [] } })),
                dependenciesAPI.getProposals('PENDING').catch(() => ({ data: { proposals: [] } })),
                adminAPI.getReports('PENDING').catch(() => ({ data: { reports: [] } }))
            ])
            const totalProposals = (proposalsRes.data.proposals?.length || 0) + (depProposalsRes.data.proposals?.length || 0)
            setProposalsCount(totalProposals)
            setReportsCount(reportsRes.data.reports?.length || 0)
        } catch (error) {
            console.error('Failed to load feedback counts:', error)
        }
    }

    const loadCustomOrdersCount = async () => {
        try {
            const { data } = await customOrdersAPI.getStaffRequests('PENDING').catch(() => ({ data: { requests: [] } }))
            setCustomOrdersCount(data.requests?.length || 0)
        } catch (error) {
            console.error('Failed to load custom orders count:', error)
        }
    }

    const handlePendingCountChange = (count) => {
        setPendingCount(count)
    }

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: t('admin.nav.dashboard'), exact: true },
        {
            path: '/admin/pending',
            icon: Clock,
            label: t('admin.nav.pending'),
            badge: pendingCount > 0 ? pendingCount : null,
            badgeColor: 'bg-yellow-500 text-black'
        },
        { path: '/admin/analytics', icon: PieChart, label: t('admin.nav.analytics') },
        { path: '/admin/users', icon: Users, label: t('admin.nav.users') },
        { path: '/admin/sellers', icon: BarChart3, label: t('admin.nav.sellers') },
        { path: '/admin/models', icon: Package, label: t('admin.nav.products') },
        {
            path: '/admin/custom-orders',
            icon: PenTool,
            label: t('admin.nav.customOrders'),
            badge: customOrdersCount > 0 ? customOrdersCount : null,
            badgeColor: 'bg-orange-500 text-white'
        },
        {
            path: '/admin/feedback',
            icon: MessageSquare,
            label: t('admin.nav.feedback'),
            badges: [
                proposalsCount > 0 ? { count: proposalsCount, color: 'bg-blue-500 text-white' } : null,
                reportsCount > 0 ? { count: reportsCount, color: 'bg-red-500 text-white' } : null,
            ].filter(Boolean)
        },
        { path: '/admin/settings', icon: Settings, label: t('admin.nav.settings') },
    ]

    return (
        <div className="min-h-screen bg-hyt-dark pt-20">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <motion.aside
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:w-64 flex-shrink-0"
                    >
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-4 sticky top-24">
                            <h2 className="text-lg font-bold text-white mb-4 px-2">{t('admin.sidebar.title')}</h2>
                            <nav className="space-y-1">
                                {navItems.map((item) => {
                                    const isActive = item.exact
                                        ? location.pathname === item.path
                                        : location.pathname.startsWith(item.path) && location.pathname !== '/admin'

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                                                isActive || (item.exact && location.pathname === '/admin')
                                                    ? 'bg-hyt-accent/20 text-hyt-accent'
                                                    : 'text-gray-400 hover:text-white hover:bg-hyt-dark/50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className="w-5 h-5" />
                                                <span>{item.label}</span>
                                            </div>
                                            {item.badge && (
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-yellow-500 text-black'}`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                            {item.badges && item.badges.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    {item.badges.map((b, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.color}`}
                                                        >
                                                            {b.count}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>
                    </motion.aside>

                    {/* Main Content */}
                    <motion.main
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 min-w-0"
                    >
                        <Routes>
                            <Route index element={<AdminOverview />} />
                            <Route path="pending" element={<PendingModels onCountChange={handlePendingCountChange} />} />
                            <Route path="analytics" element={<AdminAnalytics />} />
                            <Route path="users" element={<UsersManagement />} />
                            <Route path="sellers" element={<AdminSellers />} />
                            <Route path="feedback" element={<AdminFeedback />} />
                            <Route path="settings" element={<AdminSettings />} />
                            <Route path="models" element={<AdminModels />} />
                            <Route path="custom-orders" element={<AdminCustomOrders />} />
                        </Routes>
                    </motion.main>
                </div>
            </div>
        </div>
    )
}