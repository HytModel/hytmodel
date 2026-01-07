import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    User, Star, Eye, Download, Package, Calendar,
    ExternalLink, ShoppingBag, Award, TrendingUp,
    Grid, List, Filter, Search, ChevronDown, Gift
} from 'lucide-react'
import { sellersAPI, bundlesAPI } from '../services/api'
import { useTranslation } from '../context/LanguageContext'
import ModelCard from '../components/ModelCard'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'

// Icônes sociales
const DiscordIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
)

const TwitterIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
)

const YoutubeIcon = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
)

export default function SellerProfile() {
    const { username } = useParams()
    const { t } = useTranslation()

    const [seller, setSeller] = useState(null)
    const [products, setProducts] = useState([])
    const [bundles, setBundles] = useState([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState('grid')
    const [activeSection, setActiveSection] = useState('products')

    // Filtres
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('newest')
    const [selectedGame, setSelectedGame] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [games, setGames] = useState([])
    const [categories, setCategories] = useState([])

    useEffect(() => {
        loadSellerProfile()
    }, [username])

    const loadSellerProfile = async () => {
        try {
            const { data } = await sellersAPI.getPublicProfile(username)
            setSeller(data.seller)
            setProducts(data.products || [])

            // Extraire les jeux uniques
            const uniqueGames = [...new Set(data.products?.map(p => p.game_name).filter(Boolean))]
            setGames(uniqueGames)

            // Extraire les catégories uniques
            const uniqueCategories = [...new Set(data.products?.map(p => p.category_name).filter(Boolean))]
            setCategories(uniqueCategories)

            // Charger les bundles du vendeur
            try {
                const bundlesRes = await bundlesAPI.getAll({ creator_id: data.seller.id })
                setBundles(bundlesRes.data.bundles || [])
            } catch (e) {
                console.error('Failed to load bundles:', e)
            }
        } catch (error) {
            console.error('Failed to load seller:', error)
            toast.error(t('sellerProfile.errors.notFound'))
        } finally {
            setLoading(false)
        }
    }

    // Mettre à jour les catégories quand le jeu change
    useEffect(() => {
        if (selectedGame) {
            const filteredCategories = [...new Set(
                products
                    .filter(p => p.game_name === selectedGame)
                    .map(p => p.category_name)
                    .filter(Boolean)
            )]
            setCategories(filteredCategories)
            if (selectedCategory && !filteredCategories.includes(selectedCategory)) {
                setSelectedCategory('')
            }
        } else {
            const allCategories = [...new Set(products?.map(p => p.category_name).filter(Boolean))]
            setCategories(allCategories)
        }
    }, [selectedGame, products])

    // Filtrer et trier les produits
    const filteredProducts = products
        .filter(p => {
            if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
            if (selectedGame && p.game_name !== selectedGame) return false
            if (selectedCategory && p.category_name !== selectedCategory) return false
            return true
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest': return new Date(b.created_at) - new Date(a.created_at)
                case 'oldest': return new Date(a.created_at) - new Date(b.created_at)
                case 'price-low': return parseFloat(a.price) - parseFloat(b.price)
                case 'price-high': return parseFloat(b.price) - parseFloat(a.price)
                case 'popular': return (b.view_count || 0) - (a.view_count || 0)
                case 'rating': return (parseFloat(b.rating_avg) || 0) - (parseFloat(a.rating_avg) || 0)
                default: return 0
            }
        })

    const formatNumber = (num) => {
        if (!num && num !== 0) return '0'
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
        return num.toLocaleString('fr-FR')
    }

    if (loading) {
        return <Loading fullScreen />
    }

    if (!seller) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="text-center">
                    <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">{t('sellerProfile.notFound.title')}</h2>
                    <p className="text-gray-400 mb-4">{t('sellerProfile.notFound.description')}</p>
                    <Link to="/models" className="btn-primary">
                        {t('sellerProfile.notFound.backToProducts')}
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-20">
            {/* Header / Banner */}
            <div className="bg-gradient-to-b from-hyt-accent/20 to-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-hyt-card bg-hyt-card flex-shrink-0">
                            {seller.avatar_url ? (
                                <img
                                    src={`http://localhost:3001${seller.avatar_url}`}
                                    alt={seller.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-hyt-accent to-hyt-purple">
                                    <span className="text-5xl font-bold text-white">
                                        {seller.username?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <h1 className="font-display text-3xl font-bold text-white">
                                    {seller.display_name || seller.username}
                                </h1>
                                {seller.creator_type === 'HYTSTUDIO' && (
                                    <span className="px-2 py-1 bg-hyt-accent/20 text-hyt-accent text-xs font-bold rounded">
                                        HytStudio
                                    </span>
                                )}
                                {seller.creator_type === 'AFFILIATED' && (
                                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-bold rounded">
                                        {t('sellerProfile.badges.affiliated')}
                                    </span>
                                )}
                            </div>

                            <p className="text-gray-400 mb-2">@{seller.username}</p>

                            {seller.bio && (
                                <p className="text-gray-300 max-w-2xl mb-4">{seller.bio}</p>
                            )}

                            {/* Social links */}
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                                {seller.website_url && (
                                    <a
                                        href={seller.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-hyt-card hover:bg-hyt-dark rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title={t('sellerProfile.social.website')}
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                )}
                                {seller.social_discord && (
                                    <a
                                        href={`https://discord.com/users/${seller.social_discord}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-hyt-card hover:bg-[#5865F2] rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title="Discord"
                                    >
                                        <DiscordIcon />
                                    </a>
                                )}
                                {seller.social_twitter && (
                                    <a
                                        href={`https://twitter.com/${seller.social_twitter.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-hyt-card hover:bg-hyt-dark rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title="Twitter"
                                    >
                                        <TwitterIcon />
                                    </a>
                                )}
                                {seller.social_youtube && (
                                    <a
                                        href={seller.social_youtube}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-hyt-card hover:bg-red-600 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        title="YouTube"
                                    >
                                        <YoutubeIcon />
                                    </a>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center justify-center md:justify-start gap-6">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{seller.total_products || 0}</p>
                                    <p className="text-xs text-gray-500">{t('sellerProfile.stats.products')}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{formatNumber(seller.total_sales || 0)}</p>
                                    <p className="text-xs text-gray-500">{t('sellerProfile.stats.sales')}</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                        <span className="text-2xl font-bold text-white">
                                            {seller.average_rating ? parseFloat(seller.average_rating).toFixed(1) : '-'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">{t('sellerProfile.stats.avgRating')}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{formatNumber(seller.total_views || 0)}</p>
                                    <p className="text-xs text-gray-500">{t('sellerProfile.stats.totalViews')}</p>
                                </div>
                            </div>

                            {/* Member since */}
                            <p className="text-xs text-gray-500 mt-4 flex items-center justify-center md:justify-start gap-1">
                                <Calendar className="w-3 h-3" />
                                {t('sellerProfile.memberSince')} {new Date(seller.member_since).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Catalogue */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs Produits / Bundles */}
                <div className="flex items-center gap-4 mb-6 border-b border-hyt-border">
                    <button
                        onClick={() => setActiveSection('products')}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                            activeSection === 'products' ? 'text-hyt-accent' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Package className="w-5 h-5" />
                        {t('sellerProfile.tabs.products')}
                        <span className="text-sm text-gray-500">({products.length})</span>
                        {activeSection === 'products' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                        )}
                    </button>
                    {bundles.length > 0 && (
                        <button
                            onClick={() => setActiveSection('bundles')}
                            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                                activeSection === 'bundles' ? 'text-hyt-accent' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Gift className="w-5 h-5" />
                            {t('sellerProfile.tabs.bundles')}
                            <span className="text-sm text-gray-500">({bundles.length})</span>
                            {activeSection === 'bundles' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                            )}
                        </button>
                    )}
                </div>

                {/* Section Bundles */}
                {activeSection === 'bundles' ? (
                    <div className="grid gap-6 md:grid-cols-2">
                        {bundles.map(bundle => (
                            <Link
                                key={bundle.id}
                                to={`/bundles/${bundle.id}`}
                                className="bg-hyt-card border border-hyt-border rounded-xl p-6 hover:border-hyt-accent/50 transition-all group"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white group-hover:text-hyt-accent transition-colors">
                                            {bundle.title}
                                        </h3>
                                        {bundle.description && (
                                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{bundle.description}</p>
                                        )}
                                    </div>
                                    <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold">
                                        {bundle.discount_type === 'PERCENT'
                                            ? `-${bundle.discount_value}%`
                                            : `-${parseFloat(bundle.discount_value).toFixed(0)}€`
                                        }
                                    </div>
                                </div>

                                {/* Produits inclus */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {bundle.items?.slice(0, 4).map(item => (
                                        <div key={item.id} className="flex items-center gap-2 px-2 py-1 bg-hyt-dark rounded-lg">
                                            {item.thumbnail_url && (
                                                <img
                                                    src={`http://localhost:3001${item.thumbnail_url}`}
                                                    alt={item.title}
                                                    className="w-6 h-6 rounded object-cover"
                                                />
                                            )}
                                            <span className="text-xs text-gray-300 truncate max-w-24">{item.title}</span>
                                        </div>
                                    ))}
                                    {bundle.items?.length > 4 && (
                                        <div className="px-2 py-1 bg-hyt-dark rounded-lg text-xs text-gray-400">
                                            +{bundle.items.length - 4} {t('sellerProfile.bundles.others')}
                                        </div>
                                    )}
                                </div>

                                {/* Prix */}
                                <div className="flex items-center justify-between pt-4 border-t border-hyt-border">
                                    <div className="text-sm text-gray-500">
                                        {bundle.item_count} {t('sellerProfile.bundles.productsIncluded')}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-500 line-through">
                                            {parseFloat(bundle.original_price).toFixed(2)}€
                                        </span>
                                        <span className="text-2xl font-bold text-hyt-accent">
                                            {parseFloat(bundle.final_price).toFixed(2)}€
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* Section Produits */
                    <>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <Package className="w-6 h-6 text-hyt-accent" />
                                {t('sellerProfile.catalog')}
                                <span className="text-gray-500 text-lg font-normal">({filteredProducts.length})</span>
                            </h2>

                            {/* Contrôles */}
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {/* Recherche */}
                                <div className="relative flex-1 sm:flex-none">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('sellerProfile.filters.search')}
                                        className="input-field pl-10 w-full sm:w-48"
                                    />
                                </div>

                                {/* Jeu */}
                                {games.length > 0 && (
                                    <select
                                        value={selectedGame}
                                        onChange={(e) => setSelectedGame(e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="">{t('sellerProfile.filters.allGames')}</option>
                                        {games.map(game => (
                                            <option key={game} value={game}>{game}</option>
                                        ))}
                                    </select>
                                )}

                                {/* Catégorie */}
                                {categories.length > 0 && (
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="">{t('sellerProfile.filters.allCategories')}</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                )}

                                {/* Tri */}
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="newest">{t('sellerProfile.sort.newest')}</option>
                                    <option value="oldest">{t('sellerProfile.sort.oldest')}</option>
                                    <option value="price-low">{t('sellerProfile.sort.priceAsc')}</option>
                                    <option value="price-high">{t('sellerProfile.sort.priceDesc')}</option>
                                    <option value="popular">{t('sellerProfile.sort.popular')}</option>
                                    <option value="rating">{t('sellerProfile.sort.rating')}</option>
                                </select>

                                {/* Vue */}
                                <div className="flex bg-hyt-card rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-hyt-accent text-black' : 'text-gray-400'}`}
                                    >
                                        <Grid className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-hyt-accent text-black' : 'text-gray-400'}`}
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Produits */}
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-16">
                                <ShoppingBag className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">{t('sellerProfile.empty.title')}</h3>
                                <p className="text-gray-400">
                                    {searchQuery || selectedGame || selectedCategory
                                        ? t('sellerProfile.empty.noMatch')
                                        : t('sellerProfile.empty.noProducts')}
                                </p>
                                {(searchQuery || selectedGame || selectedCategory) && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('')
                                            setSelectedGame('')
                                            setSelectedCategory('')
                                        }}
                                        className="mt-4 btn-secondary"
                                    >
                                        {t('sellerProfile.empty.resetFilters')}
                                    </button>
                                )}
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map(product => (
                                    <ModelCard key={product.id} model={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredProducts.map(product => (
                                    <Link
                                        key={product.id}
                                        to={`/models/${product.id}`}
                                        className="flex gap-4 p-4 bg-hyt-card border border-hyt-border rounded-xl hover:border-hyt-accent/50 transition-colors"
                                    >
                                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-hyt-dark flex-shrink-0">
                                            {product.thumbnail_url ? (
                                                <img
                                                    src={`http://localhost:3001${product.thumbnail_url}`}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-8 h-8 text-gray-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-white truncate">{product.title}</h3>
                                            <p className="text-sm text-gray-400 line-clamp-2">{product.description}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                {product.category_name && (
                                                    <span className="px-2 py-0.5 bg-hyt-dark rounded">{product.category_name}</span>
                                                )}
                                                <span className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" />
                                                    {formatNumber(product.view_count || 0)}
                                        </span>
                                                {product.rating_avg && (
                                                    <span className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-500" />
                                                        {parseFloat(product.rating_avg).toFixed(1)}
                                            </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xl font-bold text-white">{parseFloat(product.price).toFixed(2)}€</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}