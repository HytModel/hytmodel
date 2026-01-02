import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Eye, Download, Check } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function ModelCard({ model, showActions = true }) {
    const { addToCart, isInCart } = useCart()
    const { isAuthenticated } = useAuth()

    const inCart = isInCart(model.id)

    const handleAddToCart = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!inCart) {
            await addToCart(model.id)
        }
    }

    return (
        <Link
            to={`/models/${model.id}`}
            className="group block card-hover overflow-hidden"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] bg-hyt-darker overflow-hidden rounded-lg mb-4">
                {model.thumbnail_url ? (
                    <img
                        src={model.thumbnail_url}
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

                {/* Tags */}
                {model.tags && model.tags.length > 0 && (
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                        {model.tags.slice(0, 2).map((tag, index) => (
                            <span
                                key={index}
                                className="px-2 py-0.5 text-xs font-medium bg-hyt-dark/80 backdrop-blur-sm text-gray-300 rounded-full"
                            >
                {tag}
              </span>
                        ))}
                    </div>
                )}

                {/* Quick Actions */}
                {showActions && isAuthenticated && (
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

                {/* Description */}
                {model.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {model.description}
                    </p>
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
                        {model.views !== undefined && (
                            <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                                {model.views}
              </span>
                        )}
                        {model.downloads !== undefined && (
                            <span className="flex items-center gap-1">
                <Download className="w-3.5 h-3.5" />
                                {model.downloads}
              </span>
                        )}
                    </div>

                    <span className="font-display font-bold text-lg text-white">
            {Number(model.price).toFixed(2)}€
          </span>
                </div>
            </div>
        </Link>
    )
}