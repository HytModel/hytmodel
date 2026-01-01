import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Download, FileText, ArrowRight, Sparkles } from 'lucide-react'
import { checkoutAPI } from '../services/api'
import { useCart } from '../context/CartContext'

export default function Success() {
    const [searchParams] = useSearchParams()
    const [purchases, setPurchases] = useState([])
    const [loading, setLoading] = useState(true)
    const { fetchCart } = useCart()

    useEffect(() => {
        // Rafraîchir le panier (devrait être vide après achat)
        fetchCart()
        loadPurchases()
    }, [])

    const loadPurchases = async () => {
        try {
            const { data } = await checkoutAPI.getPurchases()
            // Prendre les 5 derniers achats
            setPurchases(data.purchases?.slice(0, 5) || [])
        } catch (error) {
            console.error('Failed to load purchases:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full"
            >
                {/* Success Icon */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 mb-6"
                    >
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                            Paiement réussi !
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Merci pour votre achat. Vos modèles sont maintenant disponibles au téléchargement.
                        </p>
                    </motion.div>
                </div>

                {/* Confetti effect */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute inset-0 pointer-events-none overflow-hidden"
                >
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{
                                opacity: 1,
                                x: '50vw',
                                y: -20,
                                rotate: 0
                            }}
                            animate={{
                                opacity: 0,
                                x: `${Math.random() * 100}vw`,
                                y: '100vh',
                                rotate: Math.random() * 360
                            }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                delay: 0.5 + Math.random() * 0.5,
                                ease: 'easeOut'
                            }}
                            className="absolute"
                        >
                            <Sparkles className={`w-4 h-4 ${
                                ['text-hyt-accent', 'text-hyt-purple', 'text-green-500', 'text-yellow-500'][i % 4]
                            }`} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Recent Purchases */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-hyt-card border border-hyt-border rounded-2xl p-6 mb-8"
                >
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Download className="w-5 h-5 text-hyt-accent" />
                        Vos achats récents
                    </h2>

                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-16 bg-hyt-dark rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : purchases.length > 0 ? (
                        <div className="space-y-3">
                            {purchases.map((purchase) => (
                                <div
                                    key={purchase.id}
                                    className="flex items-center justify-between p-4 bg-hyt-dark rounded-lg"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-medium text-white">{purchase.title}</h3>
                                        <p className="text-sm text-gray-400">
                                            {new Date(purchase.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                    <Link
                                        to={`/models/${purchase.model_id}`}
                                        className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Télécharger
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-4">
                            Aucun achat récent trouvé
                        </p>
                    )}
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <Link
                        to="/purchases"
                        className="btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        Tous mes achats
                    </Link>
                    <Link
                        to="/invoices"
                        className="btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                        <FileText className="w-5 h-5" />
                        Mes factures
                    </Link>
                    <Link
                        to="/models"
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                        Continuer
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    )
}