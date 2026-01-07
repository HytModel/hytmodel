import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    TrendingUp, DollarSign, ShoppingBag, Eye,
    ArrowUpRight, ArrowDownRight, Package, FileText,
    Upload, Settings, CreditCard, Lightbulb, ChevronRight,
    Link2, Plus, X, Loader2, Check, Clock, XCircle, CheckCircle,
    Search, Trash2, Gift
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/LanguageContext'
import { sellerAPI, checkoutAPI, invoicesAPI, stripeAPI, proposalsAPI, dependenciesAPI, gamesAPI, customOrdersAPI } from '../services/api'
import Loading from '../components/Loading'
import SellerProposals from './SellerProposals'
import toast from 'react-hot-toast'
import BundleManager from '../components/BundleManager'
import { PenTool } from 'lucide-react'
import CreatorCustomOrders from './CreatorCustomOrders'

export default function Dashboard() {
    const { user, isCreator } = useAuth()
    const { t } = useTranslation()
    const [stats, setStats] = useState(null)
    const [recentSales, setRecentSales] = useState([])
    const [purchases, setPurchases] = useState([])
    const [loading, setLoading] = useState(true)
    const [connectingStripe, setConnectingStripe] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')
    const [proposalsCount, setProposalsCount] = useState(0)
    const [customOrdersCount, setCustomOrdersCount] = useState(0)

    // Propositions de dépendances
    const [depProposals, setDepProposals] = useState([])
    const [depProposalsLoading, setDepProposalsLoading] = useState(false)
    const [showDepModal, setShowDepModal] = useState(false)
    const [games, setGames] = useState([])
    const [depForm, setDepForm] = useState({ name: '', description: '', websiteUrl: '', gameId: '' })
    const [depLogo, setDepLogo] = useState(null)
    const [depLogoPreview, setDepLogoPreview] = useState(null)
    const [submittingDep, setSubmittingDep] = useState(false)

    useEffect(() => {
        fetchData()
        fetchGames()
    }, [])

    useEffect(() => {
        if (activeTab === 'dependencies' && isCreator()) {
            fetchDepProposals()
        }
    }, [activeTab])

    const fetchGames = async () => {
        try {
            const { data } = await gamesAPI.getAll()
            setGames(data.games || data || [])
        } catch (error) {
            console.error('Failed to fetch games:', error)
        }
    }

    const fetchDepProposals = async () => {
        setDepProposalsLoading(true)
        try {
            const { data } = await dependenciesAPI.getMyProposals()
            setDepProposals(data.proposals || [])
        } catch (error) {
            console.error('Failed to fetch dep proposals:', error)
        } finally {
            setDepProposalsLoading(false)
        }
    }

    const fetchData = async () => {
        try {
            const purchasesRes = await checkoutAPI.getPurchases()
            setPurchases(purchasesRes.data.purchases || [])

            const canAccessCreatorFeatures = isCreator() || ['STAFF', 'ADMIN'].includes(user?.role)

            if (canAccessCreatorFeatures) {
                if (isCreator()) {
                    const [statsRes, salesRes] = await Promise.all([
                        sellerAPI.getStats(),
                        sellerAPI.getSales(5)
                    ])
                    setStats(statsRes.data)
                    setRecentSales(salesRes.data || [])

                    try {
                        const proposalsRes = await proposalsAPI.getMy()
                        const pending = (proposalsRes.data.proposals || []).filter(p => p.status === 'PENDING').length
                        setProposalsCount(pending)
                    } catch (e) {
                        console.error('Failed to load proposals count:', e)
                    }
                }

                try {
                    const customRes = await customOrdersAPI.getAvailableRequests()
                    const available = (customRes.data.requests || []).filter(r => r.status === 'APPROVED').length
                    setCustomOrdersCount(available)
                } catch (e) {
                    console.error('Failed to load custom orders count:', e)
                }
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleConnectStripe = async () => {
        setConnectingStripe(true)
        try {
            const { data } = await stripeAPI.createConnectAccount()
            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            toast.error(t('dashboard.errors.stripeConnect'))
        } finally {
            setConnectingStripe(false)
        }
    }

    const handleDepLogoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error(t('dashboard.dependencies.errors.logoTooLarge'))
                return
            }
            setDepLogo(file)
            setDepLogoPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmitDepProposal = async (e) => {
        e.preventDefault()
        if (!depForm.name.trim() || !depForm.gameId) {
            toast.error(t('dashboard.dependencies.errors.nameAndGameRequired'))
            return
        }

        setSubmittingDep(true)
        try {
            const formData = new FormData()
            formData.append('name', depForm.name.trim())
            formData.append('description', depForm.description)
            formData.append('websiteUrl', depForm.websiteUrl)
            formData.append('gameId', depForm.gameId)
            if (depLogo) {
                formData.append('logo', depLogo)
            }

            await dependenciesAPI.propose(formData)
            toast.success(t('dashboard.dependencies.success.proposed'))
            setShowDepModal(false)
            setDepForm({ name: '', description: '', websiteUrl: '', gameId: '' })
            setDepLogo(null)
            setDepLogoPreview(null)
            fetchDepProposals()
        } catch (error) {
            toast.error(error.response?.data?.error || t('dashboard.errors.generic'))
        } finally {
            setSubmittingDep(false)
        }
    }

    const handleDeleteDepProposal = async (id) => {
        if (!confirm(t('dashboard.dependencies.confirmDelete'))) return
        try {
            await dependenciesAPI.deleteProposal(id)
            toast.success(t('dashboard.dependencies.success.deleted'))
            fetchDepProposals()
        } catch (error) {
            toast.error(t('dashboard.errors.generic'))
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
                        <h1 className="font-display text-3xl font-bold text-white">
                            {t('dashboard.greeting', { username: user?.username })} 👋
                        </h1>
                        <p className="text-gray-500">
                            {t('dashboard.welcomeMessage')}
                        </p>
                    </div>

                    {isCreator() && (
                        <Link to="/upload" className="btn-primary flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            {t('dashboard.addProduct')}
                        </Link>
                    )}
                </div>

                {/* Tabs pour les créateurs */}
                {isCreator() && (
                    <div className="flex items-center gap-2 mb-6 border-b border-hyt-border overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-3 font-medium transition-colors relative whitespace-nowrap ${
                                activeTab === 'overview'
                                    ? 'text-hyt-accent'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {t('dashboard.tabs.overview')}
                            {activeTab === 'overview' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('custom-orders')}
                            className={`px-4 py-3 font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                                activeTab === 'custom-orders'
                                    ? 'text-hyt-accent'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <PenTool className="w-4 h-4" />
                            {t('dashboard.tabs.customOrders')}
                            {customOrdersCount > 0 && (
                                <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                    {customOrdersCount}
                                </span>
                            )}
                            {activeTab === 'custom-orders' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('proposals')}
                            className={`px-4 py-3 font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                                activeTab === 'proposals'
                                    ? 'text-hyt-accent'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Lightbulb className="w-4 h-4" />
                            {t('dashboard.tabs.proposals')}
                            {proposalsCount > 0 && (
                                <span className="bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                                    {proposalsCount}
                                </span>
                            )}
                            {activeTab === 'proposals' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('dependencies')}
                            className={`px-4 py-3 font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                                activeTab === 'dependencies'
                                    ? 'text-hyt-accent'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Link2 className="w-4 h-4" />
                            {t('dashboard.tabs.dependencies')}
                            {activeTab === 'dependencies' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('bundles')}
                            className={`px-4 py-3 font-medium transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                                activeTab === 'bundles'
                                    ? 'text-hyt-accent'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Gift className="w-4 h-4" />
                            {t('dashboard.tabs.bundles')}
                            {activeTab === 'bundles' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                            )}
                        </button>
                    </div>
                )}

                {/* Contenu selon l'onglet actif */}
                {activeTab === 'custom-orders' && isCreator() ? (
                    <CreatorCustomOrders />
                ) : activeTab === 'proposals' && isCreator() ? (
                    <SellerProposals />
                ) : activeTab === 'bundles' && isCreator() ? (
                    <BundleManager />
                ) : activeTab === 'dependencies' && isCreator() ? (
                    /* Onglet Dépendances */
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">{t('dashboard.dependencies.title')}</h2>
                                <p className="text-gray-400 text-sm">
                                    {t('dashboard.dependencies.subtitle')}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDepModal(true)}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                {t('dashboard.dependencies.propose')}
                            </button>
                        </div>

                        {/* Info Card */}
                        <div className="card bg-blue-500/5 border-blue-500/30">
                            <div className="flex items-start gap-3">
                                <Link2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-blue-400 font-medium">{t('dashboard.dependencies.whatIs.title')}</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {t('dashboard.dependencies.whatIs.description')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Liste des propositions */}
                        {depProposalsLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
                            </div>
                        ) : depProposals.length === 0 ? (
                            <div className="card text-center py-12">
                                <Link2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <p className="text-gray-400 mb-2">{t('dashboard.dependencies.empty.title')}</p>
                                <p className="text-gray-500 text-sm">
                                    {t('dashboard.dependencies.empty.description')}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {depProposals.map(proposal => (
                                    <div
                                        key={proposal.id}
                                        className="card flex items-center gap-4"
                                    >
                                        {/* Logo */}
                                        <div className="w-14 h-14 rounded-xl bg-hyt-dark flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {proposal.logo_url ? (
                                                <img
                                                    src={`http://localhost:3001${proposal.logo_url}`}
                                                    alt={proposal.name}
                                                    className="w-full h-full object-contain p-1"
                                                />
                                            ) : (
                                                <Link2 className="w-6 h-6 text-gray-500" />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-white">{proposal.name}</h3>
                                                <span className="px-2 py-0.5 text-xs bg-hyt-border text-gray-400 rounded">
                                                    {proposal.game_name}
                                                </span>
                                                <span className={`px-2 py-0.5 text-xs rounded flex items-center gap-1 ${
                                                    proposal.status === 'PENDING' ? 'bg-orange-500/20 text-orange-400' :
                                                        proposal.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                                            'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {proposal.status === 'PENDING' && <Clock className="w-3 h-3" />}
                                                    {proposal.status === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
                                                    {proposal.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                                                    {proposal.status === 'PENDING' ? t('dashboard.dependencies.status.pending') :
                                                        proposal.status === 'APPROVED' ? t('dashboard.dependencies.status.approved') : t('dashboard.dependencies.status.rejected')}
                                                </span>
                                            </div>
                                            {proposal.description && (
                                                <p className="text-sm text-gray-400 mt-1 line-clamp-1">{proposal.description}</p>
                                            )}
                                            {proposal.rejection_reason && (
                                                <p className="text-sm text-red-400 mt-1">
                                                    {t('dashboard.dependencies.reason')}: {proposal.rejection_reason}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                {t('dashboard.dependencies.proposedOn')} {new Date(proposal.created_at).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        {proposal.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleDeleteDepProposal(proposal.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                title={t('common.delete')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Modal de proposition */}
                        {showDepModal && (
                            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                                <div className="bg-hyt-card border border-hyt-border rounded-xl w-full max-w-md">
                                    <div className="flex items-center justify-between p-4 border-b border-hyt-border">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Link2 className="w-5 h-5 text-hyt-accent" />
                                            {t('dashboard.dependencies.modal.title')}
                                        </h3>
                                        <button onClick={() => setShowDepModal(false)} className="text-gray-400 hover:text-white">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmitDepProposal} className="p-4 space-y-4">
                                        {/* Logo */}
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">{t('dashboard.dependencies.modal.logo')}</label>
                                            <div className="flex items-center gap-4">
                                                <div
                                                    onClick={() => document.getElementById('dep-logo-input').click()}
                                                    className="w-16 h-16 rounded-xl bg-hyt-dark border-2 border-dashed border-hyt-border hover:border-hyt-accent/50 flex items-center justify-center cursor-pointer overflow-hidden"
                                                >
                                                    {depLogoPreview ? (
                                                        <img src={depLogoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                                                    ) : (
                                                        <Link2 className="w-6 h-6 text-gray-500" />
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    <p>{t('dashboard.dependencies.modal.clickToUpload')}</p>
                                                    <p className="text-xs">{t('dashboard.dependencies.modal.logoFormat')}</p>
                                                </div>
                                            </div>
                                            <input
                                                id="dep-logo-input"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleDepLogoChange}
                                                className="hidden"
                                            />
                                        </div>

                                        {/* Nom */}
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">{t('dashboard.dependencies.modal.name')} *</label>
                                            <input
                                                type="text"
                                                value={depForm.name}
                                                onChange={(e) => setDepForm({ ...depForm, name: e.target.value })}
                                                placeholder={t('dashboard.dependencies.modal.namePlaceholder')}
                                                className="input-field w-full"
                                                required
                                            />
                                        </div>

                                        {/* Jeu */}
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">{t('dashboard.dependencies.modal.game')} *</label>
                                            <select
                                                value={depForm.gameId}
                                                onChange={(e) => setDepForm({ ...depForm, gameId: e.target.value })}
                                                className="input-field w-full"
                                                required
                                            >
                                                <option value="">{t('dashboard.dependencies.modal.selectGame')}</option>
                                                {games.map(game => (
                                                    <option key={game.id} value={game.id}>{game.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">{t('dashboard.dependencies.modal.description')}</label>
                                            <textarea
                                                value={depForm.description}
                                                onChange={(e) => setDepForm({ ...depForm, description: e.target.value })}
                                                placeholder={t('dashboard.dependencies.modal.descriptionPlaceholder')}
                                                rows={2}
                                                className="input-field w-full resize-none"
                                            />
                                        </div>

                                        {/* Site web */}
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">{t('dashboard.dependencies.modal.website')}</label>
                                            <input
                                                type="url"
                                                value={depForm.websiteUrl}
                                                onChange={(e) => setDepForm({ ...depForm, websiteUrl: e.target.value })}
                                                placeholder="https://..."
                                                className="input-field w-full"
                                            />
                                        </div>

                                        {/* Boutons */}
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowDepModal(false)}
                                                className="btn-ghost flex-1"
                                            >
                                                {t('common.cancel')}
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={submittingDep}
                                                className="btn-primary flex-1 flex items-center justify-center gap-2"
                                            >
                                                {submittingDep ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4" />
                                                )}
                                                {t('dashboard.dependencies.propose')}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Quick Actions */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <Link
                                to="/purchases"
                                className="card-hover flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-xl bg-hyt-accent/10 flex items-center justify-center">
                                    <Package className="w-6 h-6 text-hyt-accent" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">{t('dashboard.quickActions.myPurchases')}</p>
                                    <p className="font-semibold text-white">{t('dashboard.quickActions.productsCount', { count: purchases.length })}</p>
                                </div>
                            </Link>

                            <Link
                                to="/invoices"
                                className="card-hover flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-xl bg-hyt-purple/10 flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-hyt-purple" />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">{t('dashboard.quickActions.invoices')}</p>
                                    <p className="font-semibold text-white">{t('dashboard.quickActions.viewAll')}</p>
                                </div>
                            </Link>

                            {isCreator() && (
                                <>
                                    <Link
                                        to="/dashboard/models"
                                        className="card-hover flex items-center gap-4"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-hyt-success/10 flex items-center justify-center">
                                            <ShoppingBag className="w-6 h-6 text-hyt-success" />
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">{t('dashboard.quickActions.myProducts')}</p>
                                            <p className="font-semibold text-white">{t('dashboard.quickActions.manage')}</p>
                                        </div>
                                    </Link>

                                    <Link
                                        to="/dashboard/settings"
                                        className="card-hover flex items-center gap-4"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-hyt-warning/10 flex items-center justify-center">
                                            <Settings className="w-6 h-6 text-hyt-warning" />
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">{t('dashboard.quickActions.settings')}</p>
                                            <p className="font-semibold text-white">{t('dashboard.quickActions.configure')}</p>
                                        </div>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Creator Dashboard */}
                        {isCreator() && stats && (
                            <>
                                {/* Stats Cards */}
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                    <div className="card">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-hyt-success/10 flex items-center justify-center">
                                                <DollarSign className="w-5 h-5 text-hyt-success" />
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-1">{t('dashboard.stats.totalRevenue')}</p>
                                        <p className="font-display text-2xl font-bold text-white">
                                            {(stats.totalEarnings / 100).toFixed(2)}€
                                        </p>
                                    </div>

                                    <div className="card">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-hyt-accent/10 flex items-center justify-center">
                                                <ShoppingBag className="w-5 h-5 text-hyt-accent" />
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-1">{t('dashboard.stats.totalSales')}</p>
                                        <p className="font-display text-2xl font-bold text-white">
                                            {stats.salesCount}
                                        </p>
                                    </div>

                                    <div className="card">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-hyt-purple/10 flex items-center justify-center">
                                                <TrendingUp className="w-5 h-5 text-hyt-purple" />
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-1">{t('dashboard.stats.lastSale')}</p>
                                        <p className="font-display text-lg font-bold text-white">
                                            {stats.lastSaleAt
                                                ? new Date(stats.lastSaleAt).toLocaleDateString('fr-FR')
                                                : t('dashboard.stats.none')
                                            }
                                        </p>
                                    </div>

                                    <div className="card">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-hyt-warning/10 flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-hyt-warning" />
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-1">{t('dashboard.stats.lastPayout')}</p>
                                        <p className="font-display text-lg font-bold text-white">
                                            {stats.lastPayout
                                                ? `${(stats.lastPayout.amount / 100).toFixed(2)}€`
                                                : t('dashboard.stats.none')
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Custom Orders CTA */}
                                {customOrdersCount > 0 && (
                                    <div
                                        onClick={() => setActiveTab('custom-orders')}
                                        className="card mb-8 border-orange-500/30 bg-orange-500/5 cursor-pointer hover:bg-orange-500/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                                <PenTool className="w-6 h-6 text-orange-500" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white mb-1">
                                                    {t('dashboard.customOrdersCta.title', { count: customOrdersCount })}
                                                </h3>
                                                <p className="text-gray-400 text-sm">
                                                    {t('dashboard.customOrdersCta.description')}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>
                                )}

                                {/* Propositions CTA Card */}
                                <div
                                    onClick={() => setActiveTab('proposals')}
                                    className="card mb-8 border-yellow-500/30 bg-yellow-500/5 cursor-pointer hover:bg-yellow-500/10 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                                            <Lightbulb className="w-6 h-6 text-yellow-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white mb-1">{t('dashboard.proposalsCta.title')}</h3>
                                            <p className="text-gray-400 text-sm">
                                                {t('dashboard.proposalsCta.description')}
                                            </p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Stripe Connect */}
                                {!user?.stripe_account_id && (
                                    <div className="card mb-8 border-hyt-warning/30 bg-hyt-warning/5">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-hyt-warning/10 flex items-center justify-center flex-shrink-0">
                                                <CreditCard className="w-6 h-6 text-hyt-warning" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white mb-1">{t('dashboard.stripe.title')}</h3>
                                                <p className="text-gray-400 text-sm mb-4">
                                                    {t('dashboard.stripe.description')}
                                                </p>
                                                <button
                                                    onClick={handleConnectStripe}
                                                    disabled={connectingStripe}
                                                    className="btn-primary"
                                                >
                                                    {connectingStripe ? t('dashboard.stripe.connecting') : t('dashboard.stripe.connect')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Recent Sales */}
                                {recentSales.length > 0 && (
                                    <div className="card">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="font-semibold text-white">{t('dashboard.recentSales.title')}</h2>
                                            <Link to="/dashboard/sales" className="text-sm text-hyt-accent hover:underline">
                                                {t('dashboard.recentSales.viewAll')}
                                            </Link>
                                        </div>

                                        <div className="space-y-4">
                                            {recentSales.map((sale) => (
                                                <div
                                                    key={sale.id}
                                                    className="flex items-center justify-between py-3 border-b border-hyt-border last:border-0"
                                                >
                                                    <div>
                                                        <p className="font-medium text-white">{sale.modelTitle || t('dashboard.recentSales.product')}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(sale.createdAt).toLocaleDateString('fr-FR')}
                                                        </p>
                                                    </div>
                                                    <span className="font-mono font-semibold text-hyt-success">
                                                        +{(sale.amount / 100).toFixed(2)}€
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Buyer Section */}
                        {!isCreator() && purchases.length > 0 && (
                            <div className="card">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-semibold text-white">{t('dashboard.recentPurchases.title')}</h2>
                                    <Link to="/purchases" className="text-sm text-hyt-accent hover:underline">
                                        {t('dashboard.recentPurchases.viewAll')}
                                    </Link>
                                </div>

                                <div className="space-y-4">
                                    {purchases.slice(0, 5).map((purchase) => (
                                        <div
                                            key={purchase.id}
                                            className="flex items-center gap-4 py-3 border-b border-hyt-border last:border-0"
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-hyt-darker overflow-hidden flex-shrink-0">
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-hyt-accent/10 to-hyt-purple/10">
                                                    <span className="text-sm font-bold text-hyt-accent/30">3D</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-white truncate">{purchase.title}</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(purchase.created_at).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                            <span className="font-mono text-gray-400">
                                                {Number(purchase.price).toFixed(2)}€
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Become Creator CTA */}
                        {!isCreator() && (
                            <div className="card mt-8 bg-gradient-to-r from-hyt-accent/10 to-hyt-purple/10 border-hyt-accent/20">
                                <div className="flex items-center gap-6">
                                    <div className="hidden sm:block w-20 h-20 rounded-2xl bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center">
                                        <Upload className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-display text-xl font-bold text-white mb-2">
                                            {t('dashboard.becomeCreator.title')}
                                        </h3>
                                        <p className="text-gray-400 mb-4">
                                            {t('dashboard.becomeCreator.description')}
                                        </p>
                                        <Link to="/become-creator" className="btn-primary">
                                            {t('dashboard.becomeCreator.learnMore')}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}