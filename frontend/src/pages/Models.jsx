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
                gamesAPI.list(),
                categoriesAPI.list(),
                tagsAPI.list()
            ])
            setGames(gamesRes.data.games || [])
            setCategories(categoriesRes.data.categories || [])
            setTags(tagsRes.data.tags || [])
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
            let sortedModels = data.models || []

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
                case 'oldest':
                    sortedModels.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
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

    const handleSearch = (e) => {
        e.preventDefault()
        fetchModels()
    }

    const clearFilters = () => {
        setSearchQuery('')
        setSelectedGame('')
        setSelectedCategory('')
        setSelectedTags([])
        setMinPrice('')
        setMaxPrice('')
        setSortBy('newest')
    }

    const hasActiveFilters = searchQuery || selectedGame || selectedCategory || selectedTags.length > 0 || minPrice || maxPrice

    const toggleTag = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        )
    }

    const filteredCategories = selectedGame
        ? categories.filter(c => c.game_id === selectedGame)
        : categories

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-display text-4xl font-bold text-white mb-2">
                        Modèles 3D
                    </h1>
                    <p className="text-gray-500">
                        Découvrez notre collection de modèles 3D premium
                    </p>
                </div>

                {/* Search & Filters Bar */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher des modèles..."
                                className="input-field pl-12 pr-4"
                            />
                        </div>
                    </form>

                    {/* Filter & Sort Controls */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                                showFilters || hasActiveFilters
                                    ? 'bg-hyt-accent/10 border-hyt-accent/30 text-hyt-accent'
                                    : 'bg-hyt-card border-hyt-border text-gray-400 hover:text-white'
                            }`}
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            <span className="hidden sm:inline">Filtres</span>
                            {hasActiveFilters && (
                                <span className="w-2 h-2 rounded-full bg-hyt-accent" />
                            )}
                        </button>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="input-field pr-10 min-w-[160px]"
                        >
                            <option value="newest">Plus récents</option>
                            <option value="oldest">Plus anciens</option>
                            <option value="price-asc">Prix croissant</option>
                            <option value="price-desc">Prix décroissant</option>
                            <option value="rating">Mieux notés</option>
                        </select>

                        <div className="hidden sm:flex border border-hyt-border rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-3 transition-colors ${
                                    viewMode === 'grid' ? 'bg-hyt-accent text-hyt-dark' : 'bg-hyt-card text-gray-400 hover:text-white'
                                }`}
                            >
                                <Grid3X3 className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-3 transition-colors ${
                                    viewMode === 'list' ? 'bg-hyt-accent text-hyt-dark' : 'bg-hyt-card text-gray-400 hover:text-white'
                                }`}
                            >
                                <LayoutList className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="card mb-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-white">Filtres</h3>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-hyt-accent hover:underline flex items-center gap-1"
                                >
                                    <X className="w-4 h-4" />
                                    Effacer les filtres
                                </button>
                            )}
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Game */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Jeu
                                </label>
                                <select
                                    value={selectedGame}
                                    onChange={(e) => {
                                        setSelectedGame(e.target.value)
                                        setSelectedCategory('')
                                    }}
                                    className="input-field"
                                >
                                    <option value="">Tous les jeux</option>
                                    {games.map(game => (
                                        <option key={game.id} value={game.id}>{game.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Catégorie
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">Toutes les catégories</option>
                                    {filteredCategories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Prix minimum (€)
                                </label>
                                <input
                                    type="number"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    placeholder="5"
                                    min="0"
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Prix maximum (€)
                                </label>
                                <input
                                    type="number"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    placeholder="100"
                                    min="0"
                                    className="input-field"
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Tags
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {tags.slice(0, 20).map(tag => (
                                        <button
                                            key={tag.id}
                                            onClick={() => toggleTag(tag.id)}
                                            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                                                selectedTags.includes(tag.id)
                                                    ? 'bg-hyt-accent text-hyt-dark'
                                                    : 'bg-hyt-darker text-gray-400 hover:text-white border border-hyt-border'
                                            }`}
                                        >
                                            {tag.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-500">
                        {models.length} modèle{models.length !== 1 ? 's' : ''} trouvé{models.length !== 1 ? 's' : ''}
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