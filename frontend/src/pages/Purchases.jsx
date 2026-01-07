import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Download,
    ShoppingBag,
    Calendar,
    Search,
    ExternalLink,
    Loader2
} from 'lucide-react'
import { checkoutAPI, modelsAPI } from '../services/api'
import { useTranslation } from '../context/LanguageContext'
import toast from 'react-hot-toast'

export default function Purchases() {
    const { t } = useTranslation()
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
            toast.error(t('purchases.errors.loadFailed'))
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

            toast.success(t('purchases.success.downloadStarted'))
        } catch (error) {
            console.error('Download failed:', error)
            toast.error(t('purchases.errors.downloadFailed'))
        } finally {
            setDownloading(null)
        }
    }

    const filteredPurchases = purchases.filter(purchase =>
        purchase.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-hyt-dark pt-20 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-display font-bold text-white mb-2">
                        {t('purchases.title')}
                    </h1>
                    <p className="text-gray-400">
                        {t('purchases.subtitle')}
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
                >
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-hyt-accent/20 rounded-lg">
                                <ShoppingBag className="w-6 h-6 text-hyt-accent" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{purchases.length}</p>
                                <p className="text-sm text-gray-400">{t('purchases.stats.purchased')}</p>
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
                                <p className="text-sm text-gray-400">{t('purchases.stats.downloads')}</p>
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
                            placeholder={t('purchases.searchPlaceholder')}
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
                        <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {searchQuery ? t('purchases.empty.noResults') : t('purchases.empty.title')}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {searchQuery
                                ? t('purchases.empty.tryOtherTerms')
                                : t('purchases.empty.description')
                            }
                        </p>
                        {!searchQuery && (
                            <Link to="/models" className="btn-primary">
                                {t('purchases.empty.discover')}
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
                                transition={{ delay: index * 0.05 }}
                                className="bg-hyt-card border border-hyt-border rounded-xl p-6 hover:border-hyt-accent/30 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Thumbnail */}
                                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-hyt-dark flex-shrink-0">
                                        {purchase.thumbnail_url ? (
                                            <img
                                                src={purchase.thumbnail_url.startsWith('http')
                                                    ? purchase.thumbnail_url
                                                    : `http://localhost:3001${purchase.thumbnail_url}`}
                                                alt={purchase.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-hyt-accent/10 to-hyt-purple/10">
                                                <span className="text-2xl font-bold text-hyt-accent/30">3D</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white truncate">
                                            {purchase.title}
                                        </h3>
                                        <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                            <Calendar className="w-4 h-4" />
                                            {t('purchases.purchasedOn')} {new Date(purchase.purchased_at).toLocaleDateString('fr-FR')}
                                        </p>
                                        <Link
                                            to={`/models/${purchase.model_id}`}
                                            className="text-sm text-hyt-accent hover:underline flex items-center gap-1 mt-1"
                                        >
                                            {t('purchases.viewProduct')}
                                            <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </div>

                                    {/* Download Button */}
                                    <button
                                        onClick={() => handleDownload(purchase)}
                                        disabled={downloading === purchase.model_id}
                                        className="btn-primary flex items-center gap-2"
                                    >
                                        {downloading === purchase.model_id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4" />
                                        )}
                                        {t('purchases.download')}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    )
}