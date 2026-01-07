import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    Gift, Package, User, ShoppingCart, Check, ArrowLeft,
    Star, Eye, Calendar, Loader2, AlertTriangle
} from 'lucide-react'
import { bundlesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useTranslation } from '../context/LanguageContext'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'

export default function BundleDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated, user } = useAuth()
    const { addToCart, isInCart } = useCart()
    const { t } = useTranslation()

    const [bundle, setBundle] = useState(null)
    const [loading, setLoading] = useState(true)
    const [hasPurchased, setHasPurchased] = useState(false)
    const [purchasing, setPurchasing] = useState(false)

    useEffect(() => {
        loadBundle()
    }, [id])

    const loadBundle = async () => {
        try {
            const { data } = await bundlesAPI.getById(id)
            setBundle(data.bundle)

            // Vérifier si l'utilisateur a déjà acheté
            if (isAuthenticated) {
                try {
                    const checkRes = await bundlesAPI.checkPurchase(id)
                    setHasPurchased(checkRes.data.hasPurchased)
                } catch (e) {
                    console.error('Check purchase error:', e)
                }
            }
        } catch (error) {
            console.error('Failed to load bundle:', error)
            toast.error(t('bundleDetail.errors.notFound'))
            navigate('/models')
        } finally {
            setLoading(false)
        }
    }

    const handlePurchase = async () => {
        if (!isAuthenticated) {
            toast.error(t('bundleDetail.errors.loginRequired'))
            navigate('/login')
            return
        }

        setPurchasing(true)
        try {
            const { data } = await bundlesAPI.purchase(id)

            // Rediriger vers Stripe Checkout
            if (data.url) {
                window.location.href = data.url
            } else {
                toast.success(t('bundleDetail.success.purchased'))
                setHasPurchased(true)
            }
        } catch (error) {
            toast.error(error.response?.data?.error || t('bundleDetail.errors.purchaseFailed'))
            setPurchasing(false)
        }
    }

    const isOwner = bundle?.creator_id === user?.id

    if (loading) {
        return <Loading fullScreen />
    }

    if (!bundle) {
        return null
    }

    const savingsPercent = ((parseFloat(bundle.original_price) - parseFloat(bundle.final_price)) / parseFloat(bundle.original_price) * 100).toFixed(0)

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {t('common.back')}
                </button>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contenu principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header */}
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center flex-shrink-0">
                                    <Gift className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h1 className="text-2xl font-bold text-white">{bundle.title}</h1>
                                        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg font-bold">
                                            -{savingsPercent}%
                                        </span>
                                    </div>
                                    {bundle.description && (
                                        <p className="text-gray-400 mt-2">{bundle.description}</p>
                                    )}

                                    {/* Vendeur */}
                                    <Link
                                        to={`/seller/${bundle.creator_username}`}
                                        className="flex items-center gap-2 mt-4 text-sm text-gray-400 hover:text-hyt-accent transition-colors"
                                    >
                                        {bundle.creator_avatar ? (
                                            <img
                                                src={`http://localhost:3001${bundle.creator_avatar}`}
                                                alt={bundle.creator_username}
                                                className="w-6 h-6 rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-6 h-6 p-1 rounded-full bg-hyt-dark" />
                                        )}
                                        {bundle.creator_display_name || bundle.creator_username}
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Produits inclus */}
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-hyt-accent" />
                                {t('bundleDetail.includedProducts', { count: bundle.item_count })}
                            </h2>

                            <div className="space-y-3">
                                {bundle.items?.map(item => (
                                    <Link
                                        key={item.id}
                                        to={`/models/${item.id}`}
                                        className="flex items-center gap-4 p-3 bg-hyt-dark rounded-lg hover:bg-hyt-border/50 transition-colors"
                                    >
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-hyt-darker flex-shrink-0">
                                            {item.thumbnail_url ? (
                                                <img
                                                    src={`http://localhost:3001${item.thumbnail_url}`}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-gray-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-white truncate">{item.title}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                {item.game_name && (
                                                    <span>{item.game_name}</span>
                                                )}
                                                {item.category_name && (
                                                    <span className="px-2 py-0.5 bg-hyt-darker rounded text-xs">
                                                        {item.category_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-semibold text-white">
                                                {parseFloat(item.price).toFixed(2)}€
                                            </p>
                                            <p className="text-xs text-green-400">
                                                {t('bundleDetail.included')}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Achat */}
                    <div className="lg:col-span-1">
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 sticky top-24">
                            {/* Prix */}
                            <div className="text-center mb-6">
                                <p className="text-gray-500 line-through text-lg">
                                    {parseFloat(bundle.original_price).toFixed(2)}€
                                </p>
                                <p className="text-4xl font-bold text-hyt-accent">
                                    {parseFloat(bundle.final_price).toFixed(2)}€
                                </p>
                                <p className="text-green-400 text-sm mt-1">
                                    {t('bundleDetail.youSave', { amount: (parseFloat(bundle.original_price) - parseFloat(bundle.final_price)).toFixed(2) })}
                                </p>
                            </div>

                            {/* Détails remise */}
                            <div className="bg-hyt-dark rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">{t('bundleDetail.discountApplied')}</span>
                                    <span className="text-red-400 font-bold">
                                        {bundle.discount_type === 'PERCENT'
                                            ? `-${bundle.discount_value}%`
                                            : `-${parseFloat(bundle.discount_value).toFixed(2)}€`
                                        }
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm mt-2">
                                    <span className="text-gray-400">{t('bundleDetail.products')}</span>
                                    <span className="text-white">{bundle.item_count}</span>
                                </div>
                            </div>

                            {/* Bouton d'achat */}
                            {isOwner ? (
                                <div className="bg-hyt-dark rounded-lg p-4 text-center">
                                    <p className="text-gray-400 text-sm">{t('bundleDetail.yourBundle')}</p>
                                </div>
                            ) : hasPurchased ? (
                                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                                    <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                    <p className="text-green-400 font-medium">{t('bundleDetail.bundlePurchased')}</p>
                                    <Link to="/purchases" className="text-sm text-green-400/70 hover:underline">
                                        {t('bundleDetail.viewPurchases')}
                                    </Link>
                                </div>
                            ) : (
                                <button
                                    onClick={handlePurchase}
                                    disabled={purchasing}
                                    className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                                >
                                    {purchasing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-5 h-5" />
                                            {t('bundleDetail.buyBundle')}
                                        </>
                                    )}
                                </button>
                            )}

                            {/* Info */}
                            <p className="text-xs text-gray-500 text-center mt-4">
                                {t('bundleDetail.purchaseInfo')}
                            </p>

                            {/* Dates de validité */}
                            {(bundle.starts_at || bundle.ends_at) && (
                                <div className="mt-4 pt-4 border-t border-hyt-border">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        {bundle.ends_at && (
                                            <span>
                                                {t('bundleDetail.validUntil', { date: new Date(bundle.ends_at).toLocaleDateString('fr-FR') })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}