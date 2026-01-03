import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Download, Calendar, Loader2, ShoppingBag, FileText, ExternalLink } from 'lucide-react'
import { checkoutAPI, modelsAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function MyPurchases() {
    const [purchases, setPurchases] = useState([])
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(null)

    useEffect(() => {
        loadPurchases()
    }, [])

    const loadPurchases = async () => {
        try {
            const { data } = await checkoutAPI.getPurchases()
            setPurchases(data.purchases || [])
        } catch (error) {
            console.error('Failed to load purchases:', error)
            toast.error('Erreur lors du chargement des achats')
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async (purchase) => {
        setDownloading(purchase.model_id)
        try {
            const response = await modelsAPI.download(purchase.model_id)
            const blob = new Blob([response.data])
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${purchase.title}.zip`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.success('Téléchargement démarré')
        } catch (error) {
            toast.error('Erreur lors du téléchargement')
        } finally {
            setDownloading(null)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Mes achats</h2>
                    <p className="text-gray-400">
                        {purchases.length} produit{purchases.length !== 1 ? 's' : ''} acheté{purchases.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {purchases.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-hyt-card flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Aucun achat</h3>
                    <p className="text-gray-400 mb-6">
                        Vous n'avez pas encore effectué d'achat
                    </p>
                    <Link to="/models" className="btn-primary">
                        Découvrir les produits
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {purchases.map((purchase) => (
                        <div
                            key={purchase.id}
                            className="bg-hyt-card border border-hyt-border rounded-xl p-4"
                        >
                            <div className="flex items-center gap-4">
                                {/* Thumbnail */}
                                <Link
                                    to={`/models/${purchase.model_id}`}
                                    className="flex-shrink-0"
                                >
                                    <div className="w-20 h-20 rounded-lg bg-hyt-dark overflow-hidden">
                                        {purchase.thumbnail_url ? (
                                            <img
                                                src={purchase.thumbnail_url}
                                                alt={purchase.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-hyt-accent/10 to-hyt-purple/10">
                                                <Package className="w-8 h-8 text-hyt-accent/30" />
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <Link
                                        to={`/models/${purchase.model_id}`}
                                        className="font-semibold text-white hover:text-hyt-accent transition-colors line-clamp-1"
                                    >
                                        {purchase.title}
                                    </Link>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(purchase.created_at).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                        <span className="text-white font-medium">
                                            {(Number(purchase.price)).toFixed(2)}€
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <Link
                                        to={`/models/${purchase.model_id}`}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-hyt-dark rounded-lg transition-colors"
                                        title="Voir le produit"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </Link>
                                    <button
                                        onClick={() => handleDownload(purchase)}
                                        disabled={downloading === purchase.model_id}
                                        className="btn-primary py-2 px-4 flex items-center gap-2"
                                    >
                                        {downloading === purchase.model_id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4" />
                                        )}
                                        Télécharger
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Info factures */}
            {purchases.length > 0 && (
                <div className="bg-hyt-dark rounded-xl p-4 flex items-start gap-3">
                    <FileText className="w-5 h-5 text-hyt-accent flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-white font-medium">Factures</p>
                        <p className="text-gray-400 text-sm">
                            Vos factures sont envoyées par email après chaque achat.
                            Contactez le support si vous avez besoin d'une copie.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}