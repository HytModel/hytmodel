import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Download, Package, ArrowRight, Loader2, FileText } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useTranslation } from '../context/LanguageContext'
import { checkoutAPI } from '../services/api'

export default function CheckoutSuccess() {
    const [searchParams] = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const { fetchCart } = useCart()
    const { t } = useTranslation()
    const [purchases, setPurchases] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Rafraîchir le panier (sera vide car vidé par le webhook)
        fetchCart()

        // Effet confetti
        try {
            import('canvas-confetti').then((confetti) => {
                confetti.default({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                })
            })
        } catch (e) {
            // canvas-confetti optionnel
        }

        // Charger les achats avec un petit délai pour laisser le webhook finir
        setTimeout(() => {
            loadPurchases()
        }, 1500)
    }, [])

    const loadPurchases = async () => {
        try {
            const { data } = await checkoutAPI.getPurchases()
            setPurchases(data.purchases || [])
        } catch (error) {
            console.error('Failed to load purchases:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Success Icon */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="font-display text-4xl font-bold text-white mb-3">
                        {t('checkoutSuccess.title')}
                    </h1>
                    <p className="text-gray-400 text-lg">
                        {t('checkoutSuccess.description')}
                    </p>
                </div>

                {/* Purchases */}
                <div className="card mb-8">
                    <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-hyt-accent" />
                        {t('checkoutSuccess.recentPurchases')}
                    </h2>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                            <Loader2 className="w-6 h-6 text-hyt-accent animate-spin" />
                            <p className="text-gray-400 text-sm">{t('checkoutSuccess.loadingPurchases')}</p>
                        </div>
                    ) : purchases.length > 0 ? (
                        <div className="space-y-3">
                            {purchases.slice(0, 5).map((purchase) => (
                                <div
                                    key={purchase.id}
                                    className="flex items-center justify-between p-3 bg-hyt-dark rounded-lg"
                                >
                                    <div>
                                        <p className="text-white font-medium">{purchase.title}</p>
                                        <p className="text-gray-500 text-sm">
                                            {Number(purchase.price).toFixed(2)}€
                                        </p>
                                    </div>
                                    <Link
                                        to={`/models/${purchase.model_id}`}
                                        className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        {t('checkoutSuccess.download')}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-gray-400 mb-2">
                                {t('checkoutSuccess.purchasesAppearSoon')}
                            </p>
                            <button
                                onClick={loadPurchases}
                                className="text-hyt-accent hover:underline text-sm"
                            >
                                {t('checkoutSuccess.refresh')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-4 mb-8">
                    <div className="flex items-start gap-3">
                        <FileText className="w-5 h-5 text-hyt-accent flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-white font-medium">{t('checkoutSuccess.invoiceSent')}</p>
                            <p className="text-gray-400 text-sm">
                                {t('checkoutSuccess.invoiceDescription')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/dashboard/purchases"
                        className="btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                        <Package className="w-5 h-5" />
                        {t('checkoutSuccess.viewPurchases')}
                    </Link>
                    <Link
                        to="/models"
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                        {t('checkoutSuccess.continueShopping')}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    )
}