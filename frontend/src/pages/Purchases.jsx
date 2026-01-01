import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Download,
    Package,
    Calendar,
    Euro,
    Search,
    Filter,
    ExternalLink,
    Loader2
} from 'lucide-react'
import { checkoutAPI, modelsAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function Purchases() {
    const [purchases, setPurchases] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
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

            // Créer un blob et télécharger
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
            console.error('Download failed:', error)
            toast.error('Erreur lors du téléchargement')
        } finally {
            setDownloading(null)
        }
    }

    const filteredPurchases = purchases.filter(purchase =>
        purchase.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalSpent = purchases.reduce((sum, p) => sum + Number(p.price || 0), 0)

    return (
        <div className="min-h-screen bg-hyt-dark py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-display font-bold text-white mb-2">
                        Mes Achats
                    </h1>
                    <p className="text-gray-400">
                        Retrouvez tous vos modèles achetés et téléchargez-les à tout moment
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
                >
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-hyt-accent/20 rounded-lg">
                                <Package className="w-6 h-6 text-hyt-accent" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{purchases.length}</p>
                                <p className="text-sm text-gray-400">Modèles achetés</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-500/20 rounded-lg">
                                <Euro className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{totalSpent.toFixed(2)} €</p>
                                <p className="text-sm text-gray-400">Total dépensé</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-hyt-purple/20 rounded-lg">
                                <Download className="w-6 h-6 text-hyt-purple" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">∞</p>
                                <p className="text-sm text-gray-400">Téléchargements</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher dans mes achats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-12 w-full"
                        />
                    </div>
                </motion.div>

                {/* Purchases List */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-hyt-card border border-hyt-border rounded-xl p-6 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-hyt-dark rounded-lg" />
                                    <div className="flex-1">
                                        <div className="h-5 bg-hyt-dark rounded w-1/3 mb-2" />
                                        <div className="h-4 bg-hyt-dark rounded w-1/4" />
                                    </div>
                                    <div className="h-10 bg-hyt-dark rounded w-32" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredPurchases.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {searchQuery ? 'Aucun résultat' : 'Aucun achat'}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {searchQuery
                                ? 'Aucun modèle ne correspond à votre recherche'
                                : "Vous n'avez pas encore acheté de modèles"
                            }
                        </p>
                        {!searchQuery && (
                            <Link to="/models" className="btn-primary inline-flex items-center gap-2">
                                Découvrir les modèles
                            </Link>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        {filteredPurchases.map((purchase, index) => (
                            <motion.div
                                key={purchase.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="bg-hyt-card border border-hyt-border rounded-xl p-6 hover:border-hyt-accent/30 transition-colors"
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    {/* Thumbnail placeholder */}
                                    <div className="w-20 h-20 bg-gradient-to-br from-hyt-accent/20 to-hyt-purple/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Package className="w-8 h-8 text-hyt-accent" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-white truncate">
                                            {purchase.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                          {new Date(purchase.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                          })}
                      </span>
                                            <span className="flex items-center gap-1">
                        <Euro className="w-4 h-4" />
                                                {Number(purchase.price).toFixed(2)} €
                      </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <Link
                                            to={`/models/${purchase.model_id}`}
                                            className="btn-secondary py-2 px-4 flex items-center gap-2 flex-1 sm:flex-none justify-center"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Voir
                                        </Link>
                                        <button
                                            onClick={() => handleDownload(purchase)}
                                            disabled={downloading === purchase.model_id}
                                            className="btn-primary py-2 px-4 flex items-center gap-2 flex-1 sm:flex-none justify-center"
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
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    )
}