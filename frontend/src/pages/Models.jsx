import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, X, SlidersHorizontal, Grid3X3, LayoutList, Box } from 'lucide-react'
import { modelsAPI, gamesAPI, categoriesAPI, tagsAPI } from '../services/api'
import ModelCard from '../components/ModelCard'
import Loading from '../components/Loading'

export default function Models() {
    const [searchParams, setSearchParams] = useSearchParams()

    const [models, setModels] = useState([])
    const [games, setGames] = useState([])
    const [categories, setCategories] = useState([])
    const [tags, setTags] = useState([])
    const [loading, setLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(false)
    const [viewMode, setViewMode] = useState('grid')

    // Filters
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
    const [selectedGame, setSelectedGame] = useState(searchParams.get('game') || '')
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
    const [selectedTags, setSelectedTags] = useState([])
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')

    useEffect(() => {
        fetchFiltersData()
    }, [])

    useEffect(() => {
        fetchModels()
    }, [searchQuery, selectedGame, selectedCategory, selectedTags, minPrice, maxPrice, sortBy])

    const fetchFiltersData = async () => {
        try {
            const [gamesRes, categoriesRes, tagsRes] = await Promise.all([
                gamesAPI.getAll(),
                categoriesAPI.getAll(),
                tagsAPI.getAll()
            ])
            setGames(gamesRes.data.games || gamesRes.data || [])
            setCategories(categoriesRes.data.categories || categoriesRes.data || [])
            setTags(tagsRes.data.tags || tagsRes.data || [])
        } catch (error) {
            console.error('Failed to fetch filters data:', error)
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
            if (minPrice) params.minPrice = minPrice
            if (maxPrice) params.maxPrice = maxPrice

            const { data } = await modelsAPI.searchAdvanced(params)
            let sortedModels = data.models || data || []

            // Sort
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
        setMinPrice('')
        setMaxPrice('')
        setSortBy('newest')
        setSearchParams({})
    }

    const hasActiveFilters = searchQuery || selectedGame || selectedCategory || selectedTags.length > 0 || minPrice || maxPrice

    const toggleTag = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        )
    }

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-white">Modèles 3D</h1>
                        <p className="text-gray-400 mt-1">
                            {models.length} modèle{models.length !== 1 ? 's' : ''} disponible{models.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-field pl-12 w-full"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`btn-ghost flex items-center gap-2 ${showFilters ? 'bg-hyt-accent/10 text-hyt-accent' : ''}`}
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            <span className="hidden sm:inline">Filtres</span>
                        </button>

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

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 mb-8 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Filtres</h3>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-sm text-hyt-accent hover:underline">
                                    Effacer tout
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Game Filter */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Jeu</label>
                                <select
                                    value={selectedGame}
                                    onChange={(e) => setSelectedGame(e.target.value)}
                                    className="input-field w-full"
                                >
                                    <option value="">Tous les jeux</option>
                                    {games.map(game => (
                                        <option key={game.id} value={game.id}>{game.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Catégorie</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="input-field w-full"
                                >
                                    <option value="">Toutes les catégories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Prix min (€)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="input-field w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Prix max (€)</label>
                                <input
                                    type="number"
                                    placeholder="1000"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="input-field w-full"
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="mt-4">
                                <label className="block text-sm text-gray-400 mb-2">Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(tag => (
                                        <button
                                            key={tag.id}
                                            onClick={() => toggleTag(tag.id)}
                                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                                selectedTags.includes(tag.id)
                                                    ? 'bg-hyt-accent text-white'
                                                    : 'bg-hyt-dark text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sort */}
                        <div className="mt-4">
                            <label className="block text-sm text-gray-400 mb-2">Trier par</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="input-field w-full md:w-48"
                            >
                                <option value="newest">Plus récents</option>
                                <option value="popular">Plus populaires</option>
                                <option value="rating">Mieux notés</option>
                                <option value="price-asc">Prix croissant</option>
                                <option value="price-desc">Prix décroissant</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Active Filters */}
                {hasActiveFilters && !showFilters && (
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        <span className="text-sm text-gray-400">Filtres actifs:</span>
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
                                {games.find(g => g.id === selectedGame)?.name}
                                <button onClick={() => setSelectedGame('')} className="ml-1 text-gray-400 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        )}
                        <button onClick={clearFilters} className="text-sm text-hyt-accent hover:underline">
                            Effacer tout
                        </button>
                    </div>
                )}

                {/* Results Count */}
                <div className="mb-4">
                    <p className="text-gray-400 text-sm">
                        {models.length} résultat{models.length !== 1 ? 's' : ''} trouvé{models.length !== 1 ? 's' : ''}
                    </p>
                </div>

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
                        <h3 className="text-xl font-semibold text-white mb-2">Aucun modèle trouvé</h3>
                        <p className="text-gray-500 mb-6">
                            Essayez de modifier vos critères de recherche
                        </p>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="btn-secondary">
                                Effacer les filtres
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}