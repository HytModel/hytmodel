import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Star, Eye, Download, Check, User, Gift } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/LanguageContext'

export default function ModelCard({ model, showActions = true }) {
    const { addToCart, isInCart } = useCart()
    const { isAuthenticated } = useAuth()
    const { t } = useTranslation()
    const navigate = useNavigate()

    const inCart = isInCart(model.id)

    // Check if product is free
    const isFree = parseFloat(model.price) === 0

    const handleAddToCart = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!inCart && !isFree) {
            await addToCart(model.id)
        }
    }

    const handleSellerClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (model.creator_username) {
            navigate(`/seller/${model.creator_username}`)
        }
    }

    // Fonction pour obtenir l'URL complète de l'image
    const getImageUrl = (url) => {
        if (!url) return null
        if (url.startsWith('http')) return url
        return `http://localhost:3001${url}`
    }

    const imageUrl = getImageUrl(model.thumbnail_url)
    const creatorAvatarUrl = getImageUrl(model.creator_avatar_url || model.creator_avatar)

    return (
        <Link
            to={`/models/${model.id}`}
            className="group block card-hover overflow-hidden"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] bg-hyt-darker overflow-hidden rounded-lg mb-4">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={model.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-hyt-accent/10 to-hyt-purple/10">
                        <span className="text-4xl font-bold text-hyt-accent/30">3D</span>
                    </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-hyt-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Badge Gratuit */}
                {isFree && (
                    <div className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg z-10">
                        <Gift className="w-3 h-3" />
                        {t('common.free')}
                    </div>
                )}

                {/* Tags - décalés si produit gratuit */}
                {!isFree && model.tags && model.tags.length > 0 && (
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                        {model.tags.slice(0, 2).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-0.5 text-xs font-medium bg-hyt-dark/80 backdrop-blur-sm text-gray-300 rounded-full"
                            >
                                {typeof tag === 'object' ? tag.name : tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Seller Avatar - Top Right */}
                {model.creator_username && (
                    <div
                        onClick={handleSellerClick}
                        className="absolute top-3 right-3 cursor-pointer group/seller"
                        title={t('modelCard.viewShop', { name: model.creator_display_name || model.creator_username })}
                    >
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 bg-hyt-dark shadow-lg transition-all group-hover/seller:border-hyt-accent group-hover/seller:scale-110">
                            {creatorAvatarUrl ? (
                                <img
                                    src={creatorAvatarUrl}
                                    alt={model.creator_display_name || model.creator_username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-hyt-accent to-hyt-purple">
                                    <span className="text-xs font-bold text-white">
                                        {(model.creator_display_name || model.creator_username)?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Quick Actions - Only for paid products */}
                {showActions && isAuthenticated && !isFree && (
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleAddToCart}
                            disabled={inCart}
                            className={`p-2.5 rounded-lg transition-all ${
                                inCart
                                    ? 'bg-hyt-success text-white cursor-default'
                                    : 'bg-hyt-accent text-hyt-dark hover:bg-hyt-accent-hover hover:shadow-glow'
                            }`}
                        >
                            {inCart ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <ShoppingCart className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                )}

                {/* Free product indicator on hover */}
                {showActions && isFree && (
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="p-2.5 rounded-lg bg-green-500 text-white">
                            <Gift className="w-4 h-4" />
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div>
                {/* Category & Game */}
                {(model.game_name || model.category_name) && (
                    <div className="flex items-center gap-2 mb-2">
                        {model.game_name && (
                            <span className="text-xs font-medium text-hyt-accent">
                                {model.game_name}
                            </span>
                        )}
                        {model.game_name && model.category_name && (
                            <span className="text-gray-600">•</span>
                        )}
                        {model.category_name && (
                            <span className="text-xs text-gray-500">
                                {model.category_name}
                            </span>
                        )}
                    </div>
                )}

                {/* Title */}
                <h3 className="font-semibold text-white group-hover:text-hyt-accent transition-colors line-clamp-1 mb-2">
                    {model.title}
                </h3>

                {/* Seller info */}
                {model.creator_username && (
                    <div
                        onClick={handleSellerClick}
                        className="flex items-center gap-2 mb-3 cursor-pointer group/seller"
                    >
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-hyt-dark flex-shrink-0">
                            {creatorAvatarUrl ? (
                                <img
                                    src={creatorAvatarUrl}
                                    alt={model.creator_display_name || model.creator_username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-hyt-accent to-hyt-purple">
                                    <span className="text-[10px] font-bold text-white">
                                        {(model.creator_display_name || model.creator_username)?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-gray-400 group-hover/seller:text-hyt-accent transition-colors truncate">
                            {model.creator_display_name || model.creator_username}
                        </span>
                    </div>
                )}

                {/* Stats & Price */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        {model.rating_avg && (
                            <span className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                {parseFloat(model.rating_avg).toFixed(1)}
                            </span>
                        )}
                        {(model.views !== undefined || model.view_count !== undefined) && (
                            <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                {model.views || model.view_count || 0}
                            </span>
                        )}
                        {(model.downloads !== undefined || model.download_count !== undefined) && (
                            <span className="flex items-center gap-1">
                                <Download className="w-3.5 h-3.5" />
                                {model.downloads || model.download_count || 0}
                            </span>
                        )}
                    </div>

                    {/* Price or Free badge */}
                    {isFree ? (
                        <span className="font-display font-bold text-lg text-green-400">
                            {t('common.free')}
                        </span>
                    ) : (
                        <span className="font-display font-bold text-lg text-white">
                            {Number(model.price).toFixed(2)}€
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}