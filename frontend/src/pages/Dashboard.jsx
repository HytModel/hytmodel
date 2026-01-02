import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    TrendingUp, DollarSign, ShoppingBag, Eye,
    ArrowUpRight, ArrowDownRight, Package, FileText,
    Upload, Settings, CreditCard
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { sellerAPI, checkoutAPI, invoicesAPI, stripeAPI } from '../services/api'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'

export default function Dashboard() {
    const { user, isCreator } = useAuth()
    const [stats, setStats] = useState(null)
    const [recentSales, setRecentSales] = useState([])
    const [purchases, setPurchases] = useState([])
    const [loading, setLoading] = useState(true)
    const [connectingStripe, setConnectingStripe] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

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
            </div>
        </div>
    )
}