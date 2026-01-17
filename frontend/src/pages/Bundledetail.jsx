import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    Gift, Package, User, ShoppingCart, Check, ArrowLeft,
    Star, Eye, Calendar, Loader2, AlertTriangle, CheckSquare, Square
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
    const [acceptedTerms, setAcceptedTerms] = useState(false)

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
            toast.error('Bundle non trouvé')
            navigate('/models')
        } finally {
            setLoading(false)
        }
    }

    const handlePurchase = async () => {
        if (!isAuthenticated) {
            toast.error('Connectez-vous pour acheter')
            navigate('/login')
            return
        }

        if (!acceptedTerms) {
            toast.error(t('cart.errors.mustAcceptTerms'))
            return
        }

        setPurchasing(true)
        try {
            const { data } = await bundlesAPI.purchase(id)

            // Rediriger vers Stripe Checkout
            if (data.url) {
                window.location.href = data.url
            } else {
                toast.success('Bundle acheté avec succès !')
                setHasPurchased(true)
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de l\'achat')
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
                    Retour
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
                                                src={bundle.creator_avatar}
                                                alt={bundle.creator_username}
                                                className="w-6 h-6 rounded-full"
                                            />
                                        ) : (
                                            <User className="w-6 h-6" />
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
                                Produits inclus ({bundle.items?.length || 0})
                            </h2>

                            <div className="space-y-3">
                                {bundle.items?.map((item) => (
                                    <Link
                                        key={item.id}
                                        to={`/models/${item.id}`}
                                        className="flex items-center gap-4 p-3 bg-hyt-dark rounded-lg hover:bg-hyt-dark/70 transition-colors"
                                    >
                                        <div className="w-16 h-16 rounded-lg bg-hyt-darker overflow-hidden flex-shrink-0">
                                            {item.thumbnail_url ? (
                                                <img
                                                    src={item.thumbnail_url}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-gray-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-medium truncate">{item.title}</h3>
                                            <p className="text-sm text-gray-500">
                                                {item.game_name} • {item.category_name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-400 line-through text-sm">
                                                {parseFloat(item.price).toFixed(2)}€
                                            </p>
                                            <p className="text-green-400 text-sm">Inclus</p>
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
                                <p className="text-gray-400 line-through text-lg">
                                    {parseFloat(bundle.original_price).toFixed(2)}€
                                </p>
                                <p className="text-4xl font-display font-bold text-white">
                                    {parseFloat(bundle.final_price).toFixed(2)}€
                                </p>
                                <p className="text-green-400 text-sm mt-1">
                                    Économisez {(parseFloat(bundle.original_price) - parseFloat(bundle.final_price)).toFixed(2)}€
                                </p>
                            </div>

                            {/* Bouton d'achat */}
                            {isOwner ? (
                                <div className="bg-hyt-dark rounded-lg p-4 text-center">
                                    <p className="text-gray-400 text-sm">C'est votre bundle</p>
                                </div>
                            ) : hasPurchased ? (
                                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                                    <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                    <p className="text-green-400 font-medium">Bundle acheté</p>
                                    <Link to="/purchases" className="text-sm text-green-400/70 hover:underline">
                                        Voir mes achats
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {/* Acceptation des CGU */}
                                    <div className="mb-4">
                                        <label
                                            className="flex items-start gap-3 cursor-pointer group"
                                            onClick={() => setAcceptedTerms(!acceptedTerms)}
                                        >
                                            <div className="mt-0.5 flex-shrink-0">
                                                {acceptedTerms ? (
                                                    <CheckSquare className="w-5 h-5 text-hyt-accent" />
                                                ) : (
                                                    <Square className="w-5 h-5 text-gray-500 group-hover:text-gray-400 transition-colors" />
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-400 leading-relaxed">
                                                {t('cart.terms.accept')}{' '}
                                                <Link
                                                    to="/terms"
                                                    target="_blank"
                                                    className="text-hyt-accent hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {t('cart.terms.termsLink')}
                                                </Link>
                                                {' '}{t('cart.terms.and')}{' '}
                                                <Link
                                                    to="/privacy"
                                                    target="_blank"
                                                    className="text-hyt-accent hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {t('cart.terms.privacyLink')}
                                                </Link>
                                            </span>
                                        </label>
                                    </div>

                                    {/* Notice droit de rétractation */}
                                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                                        <p className="text-xs text-yellow-200/80 leading-relaxed">
                                            {t('cart.terms.noRefundNotice')}
                                        </p>
                                    </div>

                                    {/* Bouton achat */}
                                    <button
                                        onClick={handlePurchase}
                                        disabled={purchasing || !acceptedTerms}
                                        className={`w-full py-4 text-lg rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                                            acceptedTerms
                                                ? 'btn-primary'
                                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        {purchasing ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-5 h-5" />
                                                Acheter le bundle
                                            </>
                                        )}
                                    </button>

                                    {!acceptedTerms && (
                                        <p className="text-xs text-center text-gray-500 mt-2">
                                            {t('cart.terms.required')}
                                        </p>
                                    )}
                                </>
                            )}

                            {/* Info */}
                            <p className="text-xs text-gray-500 text-center mt-4">
                                En achetant ce bundle, vous obtenez tous les produits inclus.
                            </p>

                            {/* Dates de validité */}
                            {(bundle.starts_at || bundle.ends_at) && (
                                <div className="mt-4 pt-4 border-t border-hyt-border">
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        {bundle.ends_at && (
                                            <span>
                                                Offre valable jusqu'au {new Date(bundle.ends_at).toLocaleDateString('fr-FR')}
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