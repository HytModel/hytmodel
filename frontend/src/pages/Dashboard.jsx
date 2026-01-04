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
import { sellerAPI, checkoutAPI, invoicesAPI, stripeAPI, proposalsAPI, dependenciesAPI, gamesAPI } from '../services/api'
import Loading from '../components/Loading'
import SellerProposals from './SellerProposals'
import toast from 'react-hot-toast'
import BundleManager from '../components/BundleManager'

export default function Dashboard() {
    const { user, isCreator } = useAuth()
    const [stats, setStats] = useState(null)
    const [recentSales, setRecentSales] = useState([])
    const [purchases, setPurchases] = useState([])
    const [loading, setLoading] = useState(true)
    const [connectingStripe, setConnectingStripe] = useState(false)
    const [activeTab, setActiveTab] = useState('overview') // overview, proposals, dependencies
    const [proposalsCount, setProposalsCount] = useState(0)

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

            if (isCreator()) {
                const [statsRes, salesRes] = await Promise.all([
                    sellerAPI.getStats(),
                    sellerAPI.getSales(5)
                ])
                setStats(statsRes.data)
                setRecentSales(salesRes.data || [])

                // Charger le nombre de propositions en attente
                try {
                    const proposalsRes = await proposalsAPI.getMy()
                    const pending = (proposalsRes.data.proposals || []).filter(p => p.status === 'PENDING').length
                    setProposalsCount(pending)
                } catch (e) {
                    console.error('Failed to load proposals count:', e)
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
            toast.error('Erreur lors de la connexion à Stripe')
        } finally {
            setConnectingStripe(false)
        }
    }

    const handleDepLogoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Logo trop volumineux (max 2MB)')
                return
            }
            setDepLogo(file)
            setDepLogoPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmitDepProposal = async (e) => {
        e.preventDefault()
        if (!depForm.name.trim() || !depForm.gameId) {
            toast.error('Nom et jeu requis')
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
            toast.success('Proposition envoyée !')
            setShowDepModal(false)
            setDepForm({ name: '', description: '', websiteUrl: '', gameId: '' })
            setDepLogo(null)
            setDepLogoPreview(null)
            fetchDepProposals()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setSubmittingDep(false)
        }
    }

    const handleDeleteDepProposal = async (id) => {
        if (!confirm('Supprimer cette proposition ?')) return
        try {
            await dependenciesAPI.deleteProposal(id)
            toast.success('Proposition supprimée')
            fetchDepProposals()
        } catch (error) {
            toast.error('Erreur')
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
                            Bonjour, {user?.username} 👋
                        </h1>
                        <p className="text-gray-500">
                            Bienvenue sur votre tableau de bord
                        </p>
                    </div>

                    {isCreator() && (
                        <Link to="/upload" className="btn-primary flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            Ajouter un produit
                        </Link>
                    )}
                </div>

                {/* Tabs pour les créateurs */}
                {isCreator() && (
                    <div className="flex items-center gap-2 mb-6 border-b border-hyt-border">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-4 py-3 font-medium transition-colors relative ${
                                activeTab === 'overview'
                                    ? 'text-hyt-accent'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Vue d'ensemble
                            {activeTab === 'overview' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('proposals')}
                            className={`px-4 py-3 font-medium transition-colors relative flex items-center gap-2 ${
                                activeTab === 'proposals'
                                    ? 'text-hyt-accent'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Lightbulb className="w-4 h-4" />
                            Propositions
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
                            className={`px-4 py-3 font-medium transition-colors relative flex items-center gap-2 ${
                                activeTab === 'dependencies'
                                    ? 'text-hyt-accent'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Link2 className="w-4 h-4" />
                            Dépendances
                            {activeTab === 'dependencies' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('bundles')}
                            className={`px-4 py-3 font-medium transition-colors relative flex items-center gap-2 ${
                                activeTab === 'bundles'
                                    ? 'text-hyt-accent'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Gift className="w-4 h-4" />
                            Bundles
                            {activeTab === 'bundles' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                            )}
                        </button>
                    </div>
                )}

                {/* Contenu selon l'onglet actif */}
                {activeTab === 'proposals' && isCreator() ? (
                    <SellerProposals />
                ) : activeTab === 'bundles' && isCreator() ? (
                    <BundleManager />
                ) : activeTab === 'dependencies' && isCreator() ? (
                    /* Onglet Dépendances */
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Propositions de dépendances</h2>
                                <p className="text-gray-400 text-sm">
                                    Proposez de nouvelles dépendances pour les produits
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDepModal(true)}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Proposer
                            </button>
                        </div>

                        {/* Info Card */}
                        <div className="card bg-blue-500/5 border-blue-500/30">
                            <div className="flex items-start gap-3">
                                <Link2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-blue-400 font-medium">Qu'est-ce qu'une dépendance ?</p>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Une dépendance est une ressource externe nécessaire pour faire fonctionner un produit
                                        (ex: Fabric, Forge, OptiFine pour Minecraft). Proposez des dépendances manquantes
                                        et notre équipe les ajoutera après validation.
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
                                <p className="text-gray-400 mb-2">Aucune proposition</p>
                                <p className="text-gray-500 text-sm">
                                    Proposez une dépendance manquante pour les produits
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
                                                    {proposal.status === 'PENDING' ? 'En attente' :
                                                        proposal.status === 'APPROVED' ? 'Approuvée' : 'Refusée'}
                                                </span>
                                            </div>
                                            {proposal.description && (
                                                <p className="text-sm text-gray-400 mt-1 line-clamp-1">{proposal.description}</p>
                                            )}
                                            {proposal.rejection_reason && (
                                                <p className="text-sm text-red-400 mt-1">
                                                    Raison: {proposal.rejection_reason}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">
                                                Proposée le {new Date(proposal.created_at).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        {proposal.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleDeleteDepProposal(proposal.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                title="Supprimer"
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
                                            Proposer une dépendance
                                        </h3>
                                        <button onClick={() => setShowDepModal(false)} className="text-gray-400 hover:text-white">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmitDepProposal} className="p-4 space-y-4">
                                        {/* Logo */}
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Logo (optionnel)</label>
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
                                                    <p>Cliquez pour uploader</p>
                                                    <p className="text-xs">PNG, JPG (max 2MB)</p>
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
                                            <label className="block text-sm text-gray-400 mb-2">Nom *</label>
                                            <input
                                                type="text"
                                                value={depForm.name}
                                                onChange={(e) => setDepForm({ ...depForm, name: e.target.value })}
                                                placeholder="Ex: Fabric, Forge, OptiFine..."
                                                className="input-field w-full"
                                                required
                                            />
                                        </div>

                                        {/* Jeu */}
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Jeu *</label>
                                            <select
                                                value={depForm.gameId}
                                                onChange={(e) => setDepForm({ ...depForm, gameId: e.target.value })}
                                                className="input-field w-full"
                                                required
                                            >
                                                <option value="">Sélectionner un jeu</option>
                                                {games.map(game => (
                                                    <option key={game.id} value={game.id}>{game.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Description (optionnel)</label>
                                            <textarea
                                                value={depForm.description}
                                                onChange={(e) => setDepForm({ ...depForm, description: e.target.value })}
                                                placeholder="Courte description..."
                                                rows={2}
                                                className="input-field w-full resize-none"
                                            />
                                        </div>

                                        {/* Site web */}
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Site web (optionnel)</label>
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
                                                Annuler
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
                                                Proposer
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
                                    <p className="text-gray-400 text-sm">Mes achats</p>
                                    <p className="font-semibold text-white">{purchases.length} produits</p>
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
                                    <p className="text-gray-400 text-sm">Factures</p>
                                    <p className="font-semibold text-white">Voir tout</p>
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
                                            <p className="text-gray-400 text-sm">Mes produits</p>
                                            <p className="font-semibold text-white">Gérer</p>
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
                                            <p className="text-gray-400 text-sm">Paramètres</p>
                                            <p className="font-semibold text-white">Configurer</p>
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
                                        <p className="text-gray-400 text-sm mb-1">Revenus totaux</p>
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
                                        <p className="text-gray-400 text-sm mb-1">Ventes totales</p>
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
                                        <p className="text-gray-400 text-sm mb-1">Dernière vente</p>
                                        <p className="font-display text-lg font-bold text-white">
                                            {stats.lastSaleAt
                                                ? new Date(stats.lastSaleAt).toLocaleDateString('fr-FR')
                                                : 'Aucune'
                                            }
                                        </p>
                                    </div>

                                    <div className="card">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-10 h-10 rounded-lg bg-hyt-warning/10 flex items-center justify-center">
                                                <CreditCard className="w-5 h-5 text-hyt-warning" />
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-1">Dernier paiement</p>
                                        <p className="font-display text-lg font-bold text-white">
                                            {stats.lastPayout
                                                ? `${(stats.lastPayout.amount / 100).toFixed(2)}€`
                                                : 'Aucun'
                                            }
                                        </p>
                                    </div>
                                </div>

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
                                            <h3 className="font-semibold text-white mb-1">Proposez vos idées</h3>
                                            <p className="text-gray-400 text-sm">
                                                Suggérez de nouvelles catégories, tags ou versions pour enrichir la plateforme !
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
                                                <h3 className="font-semibold text-white mb-1">Configurez vos paiements</h3>
                                                <p className="text-gray-400 text-sm mb-4">
                                                    Connectez votre compte Stripe pour recevoir vos paiements automatiquement.
                                                </p>
                                                <button
                                                    onClick={handleConnectStripe}
                                                    disabled={connectingStripe}
                                                    className="btn-primary"
                                                >
                                                    {connectingStripe ? 'Connexion...' : 'Connecter Stripe'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Recent Sales */}
                                {recentSales.length > 0 && (
                                    <div className="card">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="font-semibold text-white">Ventes récentes</h2>
                                            <Link to="/dashboard/sales" className="text-sm text-hyt-accent hover:underline">
                                                Voir tout
                                            </Link>
                                        </div>

                                        <div className="space-y-4">
                                            {recentSales.map((sale) => (
                                                <div
                                                    key={sale.id}
                                                    className="flex items-center justify-between py-3 border-b border-hyt-border last:border-0"
                                                >
                                                    <div>
                                                        <p className="font-medium text-white">{sale.modelTitle || 'Produit'}</p>
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
                                    <h2 className="font-semibold text-white">Mes derniers achats</h2>
                                    <Link to="/purchases" className="text-sm text-hyt-accent hover:underline">
                                        Voir tout
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
                                            Devenez créateur
                                        </h3>
                                        <p className="text-gray-400 mb-4">
                                            Vendez vos créations et gagnez jusqu'à 90% sur chaque vente.
                                        </p>
                                        <Link to="/become-creator" className="btn-primary">
                                            En savoir plus
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