import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, ArrowRight, ShoppingBag, CreditCard } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/LanguageContext'
import { checkoutAPI } from '../services/api'
import Loading, { LoadingButton } from '../components/Loading'
import toast from 'react-hot-toast'

export default function Cart() {
    const { items, total, loading, removeFromCart, clearCart } = useCart()
    const { isAuthenticated } = useAuth()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [checkoutLoading, setCheckoutLoading] = useState(false)

    const handleRemove = async (modelId) => {
        await removeFromCart(modelId)
    }

    const handleClear = async () => {
        if (window.confirm(t('cart.confirmClear'))) {
            await clearCart()
        }
    }

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/cart' } })
            return
        }

        setCheckoutLoading(true)
        try {
            const { data } = await checkoutAPI.create()
            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            const message = error.response?.data?.error || t('cart.errors.checkoutFailed')
            toast.error(message)
        } finally {
            setCheckoutLoading(false)
        }
    }

    if (loading) {
        return <Loading fullScreen />
    }

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-hyt-accent/10 flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-hyt-accent" />
                    </div>
                    <div>
                        <h1 className="font-display text-3xl font-bold text-white">{t('cart.title')}</h1>
                        <p className="text-gray-500">{t('cart.productCount', { count: items.length })}</p>
                    </div>
                </div>

                {items.length === 0 ? (
                    /* Empty Cart */
                    <div className="text-center py-20">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-hyt-card flex items-center justify-center">
                            <ShoppingBag className="w-12 h-12 text-gray-600" />
                        </div>
                        <h2 className="text-2xl font-semibold text-white mb-2">{t('cart.empty.title')}</h2>
                        <p className="text-gray-500 mb-8">
                            {t('cart.empty.description')}
                        </p>
                        <Link to="/models" className="btn-primary">
                            {t('cart.empty.explore')}
                            <ArrowRight className="inline-block ml-2 w-5 h-5" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="card flex gap-4 group"
                                >
                                    {/* Thumbnail */}
                                    <Link to={`/models/${item.id}`} className="flex-shrink-0">
                                        <div className="w-24 h-24 rounded-lg bg-hyt-darker overflow-hidden">
                                            {item.thumbnail_url ? (
                                                <img
                                                    src={item.thumbnail_url}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-hyt-accent/10 to-hyt-purple/10">
                                                    <span className="text-xl font-bold text-hyt-accent/30">3D</span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            to={`/models/${item.id}`}
                                            className="font-semibold text-white hover:text-hyt-accent transition-colors line-clamp-1"
                                        >
                                            {item.title}
                                        </Link>
                                        {item.game_name && (
                                            <p className="text-sm text-gray-500 mt-1">{item.game_name}</p>
                                        )}
                                    </div>

                                    {/* Price & Remove */}
                                    <div className="flex flex-col items-end justify-between">
                                        <span className="font-display font-bold text-lg text-white">
                                            {Number(item.price).toFixed(2)}€
                                        </span>
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Clear Cart */}
                            <button
                                onClick={handleClear}
                                className="text-sm text-gray-500 hover:text-red-400 transition-colors"
                            >
                                {t('cart.clearCart')}
                            </button>
                        </div>

                        {/* Summary */}
                        <div className="lg:col-span-1">
                            <div className="card sticky top-24">
                                <h2 className="font-semibold text-white mb-4">{t('cart.summary.title')}</h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-400">
                                        <span>{t('cart.summary.subtotal')}</span>
                                        <span>{total}€</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>{t('cart.summary.vatIncluded')}</span>
                                        <span>-</span>
                                    </div>
                                    <div className="border-t border-hyt-border pt-3">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-white">{t('cart.summary.total')}</span>
                                            <span className="font-display text-2xl font-bold text-white">{total}€</span>
                                        </div>
                                    </div>
                                </div>

                                <LoadingButton
                                    onClick={handleCheckout}
                                    loading={checkoutLoading}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="w-5 h-5" />
                                    {t('cart.checkout')}
                                </LoadingButton>

                                <p className="text-xs text-gray-500 text-center mt-4">
                                    {t('cart.securePayment')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}