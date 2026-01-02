import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Package, Plus, Edit, Trash2, Eye, EyeOff,
    Clock, CheckCircle, XCircle, Loader2, ArrowLeft,
    TrendingUp, DollarSign, AlertTriangle
} from 'lucide-react'
import { modelsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'

export default function MyProducts() {
    const { user } = useAuth()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(null)

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
            toast.error('Erreur lors du chargement des produits')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (productId, productTitle) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${productTitle}" ?`)) {
            return
        }

        setDeleting(productId)
        try {
            await modelsAPI.delete(productId)
            toast.success('Produit supprimé')
            fetchMyProducts()
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        } finally {
            setDeleting(null)
        }
    }

    const getStatusBadge = (product) => {
        if (product.is_hidden) {
            return (
                <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium">
                    <EyeOff className="w-3 h-3" />
                    Masqué
                </span>
            )
        }

        switch (product.status) {
            case 'APPROVED':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        En ligne
                    </span>
                )
            case 'PENDING':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        En attente
                    </span>
                )
            case 'REJECTED':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-xs font-medium">
                        <XCircle className="w-3 h-3" />
                        Rejeté
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
                            Retour au dashboard
                        </Link>
                        <h1 className="font-display text-3xl font-bold text-white">
                            Mes produits
                        </h1>
                        <p className="text-gray-400 mt-1">
                            {products.length} produit{products.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <Link to="/upload" className="btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Ajouter un produit
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
                                <p className="text-xs text-gray-400">Total</p>
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
                                <p className="text-xs text-gray-400">En ligne</p>
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
                                <p className="text-xs text-gray-400">En attente</p>
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
                                <p className="text-xs text-gray-400">Masqués</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liste des produits */}
                {products.length === 0 ? (
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                        <Package className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            Aucun produit
                        </h3>
                        <p className="text-gray-400 mb-6">
                            Vous n'avez pas encore ajouté de produits.
                        </p>
                        <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Ajouter mon premier produit
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
                                                src={product.thumbnail_url}
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
                                                    {product.download_count} ventes
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
                                                            Produit masqué par l'équipe
                                                        </p>
                                                        <p className="text-sm text-yellow-400/80 mt-1">
                                                            Raison : {product.hidden_reason}
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
                                                            Produit rejeté
                                                        </p>
                                                        <p className="text-sm text-red-400/80 mt-1">
                                                            Ce produit n'a pas été approuvé par l'équipe de modération.
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
                                                        En attente de validation par l'équipe.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Link
                                            to={`/models/${product.id}`}
                                            className="p-2 text-gray-400 hover:text-white transition-colors"
                                            title="Voir"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </Link>

                                        <Link
                                            to={`/dashboard/models/${product.id}/edit`}
                                            className="p-2 text-gray-400 hover:text-hyt-accent transition-colors"
                                            title="Modifier"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </Link>

                                        <button
                                            onClick={() => handleDelete(product.id, product.title)}
                                            disabled={deleting === product.id}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                            title="Supprimer"
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