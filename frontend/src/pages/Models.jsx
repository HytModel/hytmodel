import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Filter, X, SlidersHorizontal, Grid3X3, LayoutList, Box, Tag, Layers, Gift } from 'lucide-react'
import { modelsAPI, gamesAPI, categoriesAPI, tagsAPI, versionsAPI, bundlesAPI } from '../services/api'
import { useTranslation } from '../context/LanguageContext'
import ModelCard from '../components/ModelCard'
import Loading from '../components/Loading'

export default function Models() {
    const { t } = useTranslation()
    const [searchParams, setSearchParams] = useSearchParams()

    const [models, setModels] = useState([])
    const [bundles, setBundles] = useState([])
    const [games, setGames] = useState([])
    const [categories, setCategories] = useState([])
    const [tags, setTags] = useState([])
    const [versions, setVersions] = useState([])
    const [loading, setLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(false)
    const [viewMode, setViewMode] = useState('grid')
    const [activeTab, setActiveTab] = useState('products')

    // Filters
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
    const [selectedGame, setSelectedGame] = useState(searchParams.get('game') || '')
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
    const [selectedTags, setSelectedTags] = useState([])
    const [selectedVersions, setSelectedVersions] = useState([])
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')

    useEffect(() => {
        fetchInitialData()
    }, [])

    useEffect(() => {
        if (selectedGame) {
            fetchVersionsByGame(selectedGame)
        } else {
            setVersions([])
            setSelectedVersions([])
        }
    }, [selectedGame])

    useEffect(() => {
        fetchTags()
    }, [selectedCategory])

    useEffect(() => {
        fetchModels()
    }, [searchQuery, selectedGame, selectedCategory, selectedTags, selectedVersions, minPrice, maxPrice, sortBy])

    const fetchInitialData = async () => {
        try {
            const [gamesRes, categoriesRes, bundlesRes] = await Promise.all([
                gamesAPI.getAll(),
                categoriesAPI.getAll(),
                bundlesAPI.getAll()
            ])
            setGames(gamesRes.data.games || gamesRes.data || [])
            setCategories(categoriesRes.data.categories || categoriesRes.data || [])
            setBundles(bundlesRes.data.bundles || [])
        } catch (error) {
            console.error('Failed to fetch initial data:', error)
        }
    }

    const fetchVersionsByGame = async (gameId) => {
        try {
            const { data } = await versionsAPI.getByGame(gameId)
            setVersions(data.versions || data || [])
        } catch (error) {
            console.error('Failed to fetch versions:', error)
            setVersions([])
        }
    }

    const fetchTags = async () => {
        try {
            const { data } = await tagsAPI.getAll()
            setTags(data.tags || data || [])
        } catch (error) {
            console.error('Failed to fetch tags:', error)
        }
    }

    const fetchModels = async () => {
        setLoading(true)
        try {
            const params = {}
            if (searchQuery) params.query = searchQuery
            if (selectedGame) params.gameId = selectedGame
            if (selectedCategory) params.categoryId = selectedCategory
            if (selectedTags.length > 0) params.tagIds = selectedTags.join(',')
            if (selectedVersions.length > 0) params.versionIds = selectedVersions.join(',')
            if (minPrice) params.minPrice = minPrice
            if (maxPrice) params.maxPrice = maxPrice

            const { data } = await modelsAPI.searchAdvanced(params)
            let sortedModels = data.models || data || []

            switch (sortBy) {
                case 'price-asc':
                    sortedModels.sort((a, b) => a.price - b.price)
                    break
                case 'price-desc':
                    sortedModels.sort((a, b) => b.price - a.price)
                    break
                case 'rating':
                    sortedModels.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0))
                    break
                case 'popular':
                    sortedModels.sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
                    break
                case 'newest':
                default:
                    sortedModels.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            }

            setModels(sortedModels)
        } catch (error) {
            console.error('Failed to fetch models:', error)
        } finally {
            setLoading(false)
        }
    }

    const clearFilters = () => {
        setSearchQuery('')
        setSelectedGame('')
        setSelectedCategory('')
        setSelectedTags([])
        setSelectedVersions([])
        setMinPrice('')
        setMaxPrice('')
        setSortBy('newest')
        setSearchParams({})
    }

    const handleGameChange = (gameId) => {
        setSelectedGame(gameId)
        setSelectedVersions([])
    }

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId)
    }

    const hasActiveFilters = searchQuery || selectedGame || selectedCategory || selectedTags.length > 0 || selectedVersions.length > 0 || minPrice || maxPrice

    const toggleTag = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        )
    }

    const toggleVersion = (versionId) => {
        setSelectedVersions(prev =>
            prev.includes(versionId)
                ? prev.filter(id => id !== versionId)
                : [...prev, versionId]
        )
    }

    const getActiveFiltersCount = () => {
        let count = 0
        if (selectedGame) count++
        if (selectedCategory) count++
        if (selectedTags.length > 0) count += selectedTags.length
        if (selectedVersions.length > 0) count += selectedVersions.length
        if (minPrice || maxPrice) count++
        return count
    }

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-white">{t('models.title')}</h1>
                        <p className="text-gray-400 mt-1">
                            {t('models.subtitle')}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('models.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-field pl-12 w-full"
                            />
                        </div>

                        {/* Filter Toggle - Only for products */}
                        {activeTab === 'products' && (
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`btn-ghost flex items-center gap-2 ${showFilters ? 'bg-hyt-accent/10 text-hyt-accent' : ''}`}
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                                <span className="hidden sm:inline">{t('models.filters.button')}</span>
                            </button>
                        )}

                        {/* View Mode */}
                        <div className="hidden sm:flex items-center gap-1 bg-hyt-card rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-hyt-accent text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Grid3X3 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-hyt-accent text-white' : 'text-gray-400 hover:text-white'}`}
                            >
                                <LayoutList className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-4 mb-6 border-b border-hyt-border">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                            activeTab === 'products' ? 'text-hyt-accent' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Box className="w-5 h-5" />
                        {t('models.tabs.products')}
                        <span className="text-sm text-gray-500">({models.length})</span>
                        {activeTab === 'products' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('bundles')}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                            activeTab === 'bundles' ? 'text-hyt-accent' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Gift className="w-5 h-5" />
                        {t('models.tabs.bundles')}
                        {bundles.length > 0 && (
                            <span className="text-sm text-gray-500">({bundles.length})</span>
                        )}
                        {activeTab === 'bundles' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                        )}
                    </button>
                </div>

                {/* Filters Panel - Only for products */}
                {showFilters && activeTab === 'products' && (
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 mb-8 animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                {t('models.filters.title')}
                            </h3>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-sm text-hyt-accent hover:underline">
                                    {t('models.filters.clearAll')}
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Game Filter */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">{t('models.filters.game')}</label>
                                <select
                                    value={selectedGame}
                                    onChange={(e) => handleGameChange(e.target.value)}
                                    className="input-field w-full"
                                >
                                    <option value="">{t('models.filters.allGames')}</option>
                                    {games.map(game => (
                                        <option key={game.id} value={game.id}>{game.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">{t('models.filters.category')}</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="input-field w-full"
                                >
                                    <option value="">{t('models.filters.allCategories')}</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">{t('models.filters.minPrice')}</label>
                                <input
                                    type="number"
                                    placeholder="5"
                                    min="0"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(Math.max(0, e.target.value))}
                                    className="input-field w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">{t('models.filters.maxPrice')}</label>
                                <input
                                    type="number"
                                    placeholder="1000"
                                    min="0"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(Math.max(0, e.target.value))}
                                    className="input-field w-full"
                                />
                            </div>
                        </div>

                        {/* Versions */}
                        {selectedGame && versions.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-hyt-border">
                                <label className="block text-sm text-gray-400 mb-3 flex items-center gap-2">
                                    <Layers className="w-4 h-4" />
                                    {t('models.filters.gameVersions')}
                                    <span className="text-xs text-gray-500">
                                        ({t('models.filters.available', { count: versions.length })})
                                    </span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {versions.map(version => (
                                        <button
                                            key={version.id}
                                            onClick={() => toggleVersion(version.id)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                                selectedVersions.includes(version.id)
                                                    ? 'bg-hyt-accent text-black'
                                                    : 'bg-hyt-dark text-gray-400 hover:text-white hover:bg-hyt-border'
                                            }`}
                                        >
                                            {version.version}
                                        </button>
                                    ))}
                                </div>
                                {selectedVersions.length > 0 && (
                                    <p className="text-xs text-hyt-accent mt-2">
                                        {t('models.filters.versionsSelected', { count: selectedVersions.length })}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Message si aucun jeu sélectionné pour les versions */}
                        {!selectedGame && (
                            <div className="mt-6 pt-6 border-t border-hyt-border">
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <Layers className="w-4 h-4" />
                                    <span>{t('models.filters.selectGameForVersions')}</span>
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-hyt-border">
                                <label className="block text-sm text-gray-400 mb-3 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    {t('models.filters.tags')}
                                    <span className="text-xs text-gray-500">
                                        ({t('models.filters.available', { count: tags.length })})
                                    </span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(tag => (
                                        <button
                                            key={tag.id}
                                            onClick={() => toggleTag(tag.id)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                                selectedTags.includes(tag.id)
                                                    ? 'bg-hyt-purple text-white'
                                                    : 'bg-hyt-dark text-gray-400 hover:text-white hover:bg-hyt-border'
                                            }`}
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                                {selectedTags.length > 0 && (
                                    <p className="text-xs text-hyt-purple mt-2">
                                        {t('models.filters.tagsSelected', { count: selectedTags.length })}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Sort */}
                        <div className="mt-6 pt-6 border-t border-hyt-border">
                            <label className="block text-sm text-gray-400 mb-2">{t('models.filters.sortBy')}</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="input-field w-full md:w-48"
                            >
                                <option value="newest">{t('models.filters.sort.newest')}</option>
                                <option value="popular">{t('models.filters.sort.popular')}</option>
                                <option value="rating">{t('models.filters.sort.rating')}</option>
                                <option value="price-asc">{t('models.filters.sort.priceAsc')}</option>
                                <option value="price-desc">{t('models.filters.sort.priceDesc')}</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Active Filters - Quick view - Only for products */}
                {hasActiveFilters && !showFilters && activeTab === 'products' && (
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        <span className="text-sm text-gray-400">{t('models.filters.activeFilters')}:</span>

                        {searchQuery && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-hyt-card rounded-full text-sm text-white">
                                "{searchQuery}"
                                <button onClick={() => setSearchQuery('')} className="ml-1 text-gray-400 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        )}

                        {selectedGame && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-hyt-card rounded-full text-sm text-white">
                                🎮 {games.find(g => g.id === selectedGame)?.name}
                                <button onClick={() => handleGameChange('')} className="ml-1 text-gray-400 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        )}

                        {selectedCategory && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-hyt-card rounded-full text-sm text-white">
                                📁 {categories.find(c => c.id === selectedCategory)?.name}
                                <button onClick={() => setSelectedCategory('')} className="ml-1 text-gray-400 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        )}

                        {selectedVersions.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-hyt-accent/20 text-hyt-accent rounded-full text-sm">
                                <Layers className="w-3 h-3" />
                                {selectedVersions.length} version{selectedVersions.length > 1 ? 's' : ''}
                                <button onClick={() => setSelectedVersions([])} className="ml-1 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        )}

                        {selectedTags.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-hyt-purple/20 text-hyt-purple rounded-full text-sm">
                                <Tag className="w-3 h-3" />
                                {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}
                                <button onClick={() => setSelectedTags([])} className="ml-1 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        )}

                        {(minPrice || maxPrice) && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-hyt-card rounded-full text-sm text-white">
                                💰 {minPrice || '5'}€ - {maxPrice || '∞'}€
                                <button onClick={() => { setMinPrice(''); setMaxPrice('') }} className="ml-1 text-gray-400 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        )}

                        <button onClick={clearFilters} className="text-sm text-hyt-accent hover:underline ml-2">
                            {t('models.filters.clearAll')}
                        </button>
                    </div>
                )}

                {/* Results Count */}
                {activeTab === 'products' && (
                    <div className="mb-4">
                        <p className="text-gray-400 text-sm">
                            {t('models.results', { count: models.length })}
                        </p>
                    </div>
                )}

                {/* Bundles Section */}
                {activeTab === 'bundles' ? (
                    bundles.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {bundles
                                .filter(b => !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(bundle => (
                                    <Link
                                        key={bundle.id}
                                        to={`/bundles/${bundle.id}`}
                                        className="bg-hyt-card border border-hyt-border rounded-xl p-6 hover:border-hyt-accent/50 transition-all group"
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-white group-hover:text-hyt-accent transition-colors">
                                                    {bundle.title}
                                                </h3>
                                                {bundle.description && (
                                                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{bundle.description}</p>
                                                )}
                                            </div>
                                            <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-bold ml-3">
                                                {bundle.discount_type === 'PERCENT'
                                                    ? `-${bundle.discount_value}%`
                                                    : `-${parseFloat(bundle.discount_value).toFixed(0)}€`
                                                }
                                            </div>
                                        </div>

                                        {/* Vendeur */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-6 h-6 rounded-full overflow-hidden bg-hyt-dark">
                                                {bundle.creator_avatar ? (
                                                    <img
                                                        src={`http://localhost:3001${bundle.creator_avatar}`}
                                                        alt={bundle.creator_username}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-hyt-accent to-hyt-purple">
                                                    <span className="text-[10px] font-bold text-white">
                                                        {bundle.creator_username?.charAt(0).toUpperCase()}
                                                    </span>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-400">{bundle.creator_username}</span>
                                        </div>

                                        {/* Produits inclus */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {bundle.items?.slice(0, 3).map(item => (
                                                <div key={item.id} className="flex items-center gap-2 px-2 py-1 bg-hyt-dark rounded-lg">
                                                    {item.thumbnail_url && (
                                                        <img
                                                            src={`http://localhost:3001${item.thumbnail_url}`}
                                                            alt={item.title}
                                                            className="w-5 h-5 rounded object-cover"
                                                        />
                                                    )}
                                                    <span className="text-xs text-gray-300 truncate max-w-20">{item.title}</span>
                                                </div>
                                            ))}
                                            {bundle.items?.length > 3 && (
                                                <div className="px-2 py-1 bg-hyt-dark rounded-lg text-xs text-gray-400">
                                                    +{bundle.items.length - 3}
                                                </div>
                                            )}
                                        </div>

                                        {/* Prix */}
                                        <div className="flex items-center justify-between pt-4 border-t border-hyt-border">
                                            <div className="text-sm text-gray-500">
                                                {t('models.bundles.productCount', { count: bundle.item_count })}
                                            </div>
                                            <div className="flex items-center gap-2">
                                            <span className="text-gray-500 line-through text-sm">
                                                {parseFloat(bundle.original_price).toFixed(2)}€
                                            </span>
                                                <span className="text-xl font-bold text-hyt-accent">
                                                {parseFloat(bundle.final_price).toFixed(2)}€
                                            </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <Gift className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">{t('models.bundles.empty.title')}</h3>
                            <p className="text-gray-500">
                                {t('models.bundles.empty.description')}
                            </p>
                        </div>
                    )
                ) : (
                    /* Products Section */
                    <>
                        {/* Models Grid */}
                        {loading ? (
                            <Loading />
                        ) : models.length > 0 ? (
                            <div className={
                                viewMode === 'grid'
                                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                    : 'space-y-4'
                            }>
                                {models.map((model) => (
                                    <ModelCard key={model.id} model={model} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <Box className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">{t('models.empty.title')}</h3>
                                <p className="text-gray-500 mb-6">
                                    {t('models.empty.description')}
                                </p>
                                {hasActiveFilters && (
                                    <button onClick={clearFilters} className="btn-secondary">
                                        {t('models.empty.clearFilters')}
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}