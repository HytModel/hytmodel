import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingBag,
    Eye, Download, Star, Users, Calendar, Clock, ArrowLeft,
    Package, Award, Target, Zap, RefreshCw, Gift, PenTool,
    Filter, X, SlidersHorizontal, Tag, Layers, Hash
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/LanguageContext'
import { creatorAnalyticsAPI } from '../services/api'
import Loading from '../components/Loading'

export default function CreatorAnalytics() {
    const { user } = useAuth()
    const { t } = useTranslation()
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [period, setPeriod] = useState(30)
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)

    // Filtres disponibles (chargés depuis le backend)
    const [availableFilters, setAvailableFilters] = useState({
        games: [],
        categories: [],
        tags: [],
        versions: []
    })

    // Versions chargées dynamiquement selon le jeu sélectionné (depuis availableFilters)
    const [versions, setVersions] = useState([])

    // Filtres sélectionnés
    const [selectedGame, setSelectedGame] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedTags, setSelectedTags] = useState([])
    const [selectedVersions, setSelectedVersions] = useState([])
    const [showFilters, setShowFilters] = useState(false)

    // Toggle pour la répartition (revenus vs nombre de ventes)
    const [breakdownMode, setBreakdownMode] = useState('revenue') // 'revenue' ou 'count'

    useEffect(() => {
        fetchFilters()
    }, [])

    useEffect(() => {
        // Filtrer les versions par jeu sélectionné depuis availableFilters
        if (selectedGame) {
            const filteredVersions = availableFilters.versions.filter(v => v.game_id === selectedGame)
            setVersions(filteredVersions)
        } else {
            setVersions([])
            setSelectedVersions([])
        }
    }, [selectedGame, availableFilters.versions])

    useEffect(() => {
        fetchAnalytics()
    }, [period, selectedGame, selectedCategory, selectedTags, selectedVersions])

    const fetchFilters = async () => {
        try {
            const { data } = await creatorAnalyticsAPI.getFilters()
            setAvailableFilters(data)
        } catch (err) {
            console.error('Failed to fetch filters:', err)
        }
    }

    const fetchAnalytics = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true)
        } else {
            setLoading(true)
        }
        setError(null)

        try {
            // Construire les params avec filtres
            const params = { days: period }
            if (selectedGame) params.gameId = selectedGame
            if (selectedCategory) params.categoryId = selectedCategory
            if (selectedTags.length > 0) params.tagIds = selectedTags.join(',')
            if (selectedVersions.length > 0) params.versionIds = selectedVersions.join(',')

            const { data: analyticsData } = await creatorAnalyticsAPI.getAll(params)
            setData(analyticsData)
        } catch (err) {
            console.error('Failed to fetch analytics:', err)
            setError(err.response?.data?.error || t('creatorAnalytics.errors.loadFailed'))
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const clearFilters = () => {
        setSelectedGame('')
        setSelectedCategory('')
        setSelectedTags([])
        setSelectedVersions([])
    }

    const handleGameChange = (gameId) => {
        setSelectedGame(gameId)
        setSelectedVersions([])
    }

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

    const hasActiveFilters = selectedGame || selectedCategory || selectedTags.length > 0 || selectedVersions.length > 0

    const getActiveFiltersCount = () => {
        let count = 0
        if (selectedGame) count++
        if (selectedCategory) count++
        if (selectedTags.length > 0) count += selectedTags.length
        if (selectedVersions.length > 0) count += selectedVersions.length
        return count
    }

    const formatCurrency = (value) => {
        return ((value || 0) / 100).toFixed(2) + '€'
    }

    const formatPercent = (value) => {
        if (value === null || value === undefined) return '-'
        const sign = value >= 0 ? '+' : ''
        return sign + value.toFixed(1) + '%'
    }

    const getImageUrl = (url) => {
        if (!url) return null
        if (url.startsWith('http')) return url
        return `http://localhost:3001${url}`
    }

    const getDayName = (dayIndex) => {
        const days = [
            t('creatorAnalytics.days.sunday'),
            t('creatorAnalytics.days.monday'),
            t('creatorAnalytics.days.tuesday'),
            t('creatorAnalytics.days.wednesday'),
            t('creatorAnalytics.days.thursday'),
            t('creatorAnalytics.days.friday'),
            t('creatorAnalytics.days.saturday')
        ]
        return days[dayIndex]
    }

    if (loading) {
        return <Loading fullScreen />
    }

    if (error) {
        return (
            <div className="min-h-screen pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="card text-center py-12">
                        <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">{t('creatorAnalytics.errors.title')}</h2>
                        <p className="text-gray-400 mb-6">{error}</p>
                        <button onClick={() => fetchAnalytics()} className="btn-primary">
                            {t('creatorAnalytics.retry')}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const overview = data?.overview || {}
    const trends = data?.trends || {}
    const models = data?.models || []
    const bestHours = data?.bestHours || []
    const bestDays = data?.bestDays || []
    const salesBreakdown = data?.salesBreakdown || {}
    const insights = data?.insights || []
    const creatorType = data?.creatorType || null

    // Données pour le graphique camembert
    // N'affiche pas "sur mesure" si le créateur n'est pas affilié/hytstudio/staff/admin
    const canAccessCustomOrders = creatorType === 'AFFILIATED' ||
        creatorType === 'HYTSTUDIO' ||
        user?.role === 'STAFF' ||
        user?.role === 'ADMIN'

    // Choisir la valeur selon le mode (revenue ou count)
    const getBreakdownValue = (item) => {
        return breakdownMode === 'revenue' ? item.revenue : item.count
    }

    const pieChartData = [
        {
            name: t('creatorAnalytics.breakdown.products'),
            value: breakdownMode === 'revenue'
                ? (salesBreakdown.products?.revenue || 0)
                : (salesBreakdown.products?.count || 0),
            revenue: salesBreakdown.products?.revenue || 0,
            count: salesBreakdown.products?.count || 0,
            color: '#10b981' // green
        },
        {
            name: t('creatorAnalytics.breakdown.bundles'),
            value: breakdownMode === 'revenue'
                ? (salesBreakdown.bundles?.revenue || 0)
                : (salesBreakdown.bundles?.count || 0),
            revenue: salesBreakdown.bundles?.revenue || 0,
            count: salesBreakdown.bundles?.count || 0,
            color: '#8b5cf6' // purple
        },
        // N'inclure les commandes sur mesure que pour les affiliés/hytstudio/staff/admin
        ...(canAccessCustomOrders ? [{
            name: t('creatorAnalytics.breakdown.customOrders'),
            value: breakdownMode === 'revenue'
                ? (salesBreakdown.customOrders?.revenue || 0)
                : (salesBreakdown.customOrders?.count || 0),
            revenue: salesBreakdown.customOrders?.revenue || 0,
            count: salesBreakdown.customOrders?.count || 0,
            color: '#f97316' // orange
        }] : [])
    ].filter(item => item.value > 0)

    const COLORS = ['#10b981', '#8b5cf6', '#f97316']

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="p-2 rounded-lg bg-hyt-card hover:bg-hyt-border transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </Link>
                        <div>
                            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                                <BarChart3 className="w-8 h-8 text-purple-400" />
                                {t('creatorAnalytics.title')}
                            </h1>
                            <p className="text-gray-500">{t('creatorAnalytics.subtitle')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Refresh */}
                        <button
                            onClick={() => fetchAnalytics(true)}
                            disabled={refreshing}
                            className="p-2 rounded-lg bg-hyt-card hover:bg-hyt-border transition-colors"
                        >
                            <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`btn-ghost flex items-center gap-2 ${showFilters ? 'bg-hyt-accent/10 text-hyt-accent' : ''}`}
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            <span className="hidden sm:inline">{t('creatorAnalytics.filters.button')}</span>
                            {getActiveFiltersCount() > 0 && (
                                <span className="w-5 h-5 bg-hyt-accent text-black text-xs font-bold rounded-full flex items-center justify-center">
                                    {getActiveFiltersCount()}
                                </span>
                            )}
                        </button>

                        {/* Period Selector */}
                        <div className="flex bg-hyt-card rounded-lg p-1">
                            {[7, 30, 90, 365].map((days) => (
                                <button
                                    key={days}
                                    onClick={() => setPeriod(days)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                        period === days
                                            ? 'bg-purple-500 text-white'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {days === 365 ? t('creatorAnalytics.period.year') : `${days}${t('creatorAnalytics.period.daysShort')}`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 mb-8 animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                {t('creatorAnalytics.filters.title')}
                            </h3>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-sm text-hyt-accent hover:underline">
                                    {t('creatorAnalytics.filters.clearAll')}
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Game Filter */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">{t('creatorAnalytics.filters.game')}</label>
                                <select
                                    value={selectedGame}
                                    onChange={(e) => handleGameChange(e.target.value)}
                                    className="input-field w-full"
                                >
                                    <option value="">{t('creatorAnalytics.filters.allGames')}</option>
                                    {availableFilters.games.map(game => (
                                        <option key={game.id} value={game.id}>{game.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">{t('creatorAnalytics.filters.category')}</label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="input-field w-full"
                                >
                                    <option value="">{t('creatorAnalytics.filters.allCategories')}</option>
                                    {availableFilters.categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Versions */}
                        {selectedGame && versions.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-hyt-border">
                                <label className="block text-sm text-gray-400 mb-3 flex items-center gap-2">
                                    <Layers className="w-4 h-4" />
                                    {t('creatorAnalytics.filters.gameVersions')}
                                    <span className="text-xs text-gray-500">
                                        ({t('creatorAnalytics.filters.available', { count: versions.length })})
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
                                        {t('creatorAnalytics.filters.versionsSelected', { count: selectedVersions.length })}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Message si aucun jeu sélectionné pour les versions */}
                        {!selectedGame && (
                            <div className="mt-6 pt-6 border-t border-hyt-border">
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <Layers className="w-4 h-4" />
                                    <span>{t('creatorAnalytics.filters.selectGameForVersions')}</span>
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {availableFilters.tags.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-hyt-border">
                                <label className="block text-sm text-gray-400 mb-3 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    {t('creatorAnalytics.filters.tags')}
                                    <span className="text-xs text-gray-500">
                                        ({t('creatorAnalytics.filters.available', { count: availableFilters.tags.length })})
                                    </span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {availableFilters.tags.map(tag => (
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
                                        {t('creatorAnalytics.filters.tagsSelected', { count: selectedTags.length })}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Note */}
                        {hasActiveFilters && (
                            <div className="mt-6 pt-6 border-t border-hyt-border">
                                <p className="text-sm text-gray-500">
                                    {t('creatorAnalytics.filters.note')}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Active Filters - Quick view */}
                {hasActiveFilters && !showFilters && (
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        <span className="text-sm text-gray-400">{t('creatorAnalytics.filters.activeFilters')}:</span>

                        {selectedGame && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-hyt-card rounded-full text-sm text-white">
                                🎮 {availableFilters.games.find(g => g.id === selectedGame)?.name}
                                <button onClick={() => handleGameChange('')} className="ml-1 text-gray-400 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        )}

                        {selectedCategory && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-hyt-card rounded-full text-sm text-white">
                                📁 {availableFilters.categories.find(c => c.id === selectedCategory)?.name}
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

                        <button onClick={clearFilters} className="text-sm text-hyt-accent hover:underline ml-2">
                            {t('creatorAnalytics.filters.clearAll')}
                        </button>
                    </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Revenus */}
                    <div className="card bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-green-400" />
                            </div>
                            {trends.revenueGrowth !== undefined && (
                                <div className={`flex items-center gap-1 text-sm ${trends.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {trends.revenueGrowth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    {formatPercent(trends.revenueGrowth)}
                                </div>
                            )}
                        </div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-1">
                            {t('creatorAnalytics.kpis.revenue')} ({period}{t('creatorAnalytics.period.daysShort')})
                        </p>
                        <p className="font-display text-xl sm:text-2xl font-bold text-green-400">
                            {formatCurrency(overview.totalRevenue)}
                        </p>
                    </div>

                    {/* Ventes */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-hyt-accent/10 flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-hyt-accent" />
                            </div>
                            {trends.salesGrowth !== undefined && (
                                <div className={`flex items-center gap-1 text-sm ${trends.salesGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {trends.salesGrowth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    {formatPercent(trends.salesGrowth)}
                                </div>
                            )}
                        </div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-1">
                            {t('creatorAnalytics.kpis.sales')} ({period}{t('creatorAnalytics.period.daysShort')})
                        </p>
                        <p className="font-display text-xl sm:text-2xl font-bold text-white">
                            {overview.totalSales || 0}
                        </p>
                    </div>

                    {/* Vues */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Eye className="w-5 h-5 text-blue-400" />
                            </div>
                        </div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-1">{t('creatorAnalytics.kpis.totalViews')}</p>
                        <p className="font-display text-xl sm:text-2xl font-bold text-white">
                            {(overview.totalViews || 0).toLocaleString()}
                        </p>
                    </div>

                    {/* Taux de conversion */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                <Target className="w-5 h-5 text-purple-400" />
                            </div>
                        </div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-1">{t('creatorAnalytics.kpis.conversion')}</p>
                        <p className="font-display text-xl sm:text-2xl font-bold text-white">
                            {(overview.conversionRate || 0).toFixed(1)}%
                        </p>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="card py-4">
                        <div className="flex items-center gap-3">
                            <Download className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">{t('creatorAnalytics.stats.downloads')}</p>
                                <p className="font-semibold text-white">{(overview.totalDownloads || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card py-4">
                        <div className="flex items-center gap-3">
                            <Star className="w-5 h-5 text-yellow-400" />
                            <div>
                                <p className="text-xs text-gray-500">{t('creatorAnalytics.stats.avgRating')}</p>
                                <p className="font-semibold text-white">{(overview.averageRating || 0).toFixed(1)}/5</p>
                            </div>
                        </div>
                    </div>
                    <div className="card py-4">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">{t('creatorAnalytics.stats.uniqueBuyers')}</p>
                                <p className="font-semibold text-white">{overview.uniqueBuyers || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="card py-4">
                        <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">{t('creatorAnalytics.stats.activeProducts')}</p>
                                <p className="font-semibold text-white">{overview.activeProducts || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sales Breakdown - Graphique Camembert */}
                {pieChartData.length > 0 && (
                    <div className="card mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-purple-400" />
                                {t('creatorAnalytics.breakdown.title')}
                            </h3>

                            {/* Toggle Revenus / Nombre de ventes */}
                            <div className="flex bg-hyt-darker rounded-lg p-1">
                                <button
                                    onClick={() => setBreakdownMode('revenue')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                                        breakdownMode === 'revenue'
                                            ? 'bg-purple-500 text-white'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <DollarSign className="w-4 h-4" />
                                    {t('creatorAnalytics.breakdown.revenue')}
                                </button>
                                <button
                                    onClick={() => setBreakdownMode('count')}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                                        breakdownMode === 'count'
                                            ? 'bg-purple-500 text-white'
                                            : 'text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <Hash className="w-4 h-4" />
                                    {t('creatorAnalytics.breakdown.count')}
                                </button>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Graphique */}
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {pieChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload
                                                    return (
                                                        <div className="bg-hyt-card border border-hyt-border rounded-lg p-3 shadow-lg">
                                                            <p className="text-white font-medium">{data.name}</p>
                                                            {breakdownMode === 'revenue' ? (
                                                                <>
                                                                    <p className="text-green-400 text-sm font-semibold">
                                                                        {formatCurrency(data.revenue)}
                                                                    </p>
                                                                    <p className="text-gray-500 text-xs">
                                                                        {data.count} {t('creatorAnalytics.breakdown.sales')}
                                                                    </p>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <p className="text-purple-400 text-sm font-semibold">
                                                                        {data.count} {t('creatorAnalytics.breakdown.sales')}
                                                                    </p>
                                                                    <p className="text-gray-500 text-xs">
                                                                        {formatCurrency(data.revenue)}
                                                                    </p>
                                                                </>
                                                            )}
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Légende détaillée */}
                            <div className="flex flex-col justify-center space-y-4">
                                {/* Produits */}
                                <div className="flex items-center gap-4 p-3 rounded-xl bg-hyt-darker/50">
                                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                        <ShoppingBag className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{t('creatorAnalytics.breakdown.products')}</p>
                                        <p className="text-gray-500 text-sm">
                                            {salesBreakdown.products?.count || 0} {t('creatorAnalytics.breakdown.sales')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-green-400 font-semibold">
                                            {formatCurrency(salesBreakdown.products?.revenue || 0)}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            {(salesBreakdown.products?.revenuePercent || 0).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Bundles */}
                                <div className="flex items-center gap-4 p-3 rounded-xl bg-hyt-darker/50">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                        <Gift className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-medium">{t('creatorAnalytics.breakdown.bundles')}</p>
                                        <p className="text-gray-500 text-sm">
                                            {salesBreakdown.bundles?.count || 0} {t('creatorAnalytics.breakdown.sales')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-purple-400 font-semibold">
                                            {formatCurrency(salesBreakdown.bundles?.revenue || 0)}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            {(salesBreakdown.bundles?.revenuePercent || 0).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Commandes sur mesure - uniquement pour les affiliés/hytstudio/staff/admin */}
                                {canAccessCustomOrders && (
                                    <div className="flex items-center gap-4 p-3 rounded-xl bg-hyt-darker/50">
                                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                            <PenTool className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{t('creatorAnalytics.breakdown.customOrders')}</p>
                                            <p className="text-gray-500 text-sm">
                                                {salesBreakdown.customOrders?.count || 0} {t('creatorAnalytics.breakdown.sales')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-orange-400 font-semibold">
                                                {formatCurrency(salesBreakdown.customOrders?.revenue || 0)}
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                {(salesBreakdown.customOrders?.revenuePercent || 0).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Insights */}
                {insights.length > 0 && (
                    <div className="mb-8">
                        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            {t('creatorAnalytics.insights.title')}
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {insights.slice(0, 3).map((insight, index) => (
                                <div
                                    key={index}
                                    className={`card border-l-4 ${
                                        insight.type === 'success' ? 'border-l-green-500 bg-green-500/5' :
                                            insight.type === 'warning' ? 'border-l-yellow-500 bg-yellow-500/5' :
                                                'border-l-blue-500 bg-blue-500/5'
                                    }`}
                                >
                                    <p className="text-sm text-white font-medium mb-1">
                                        {t(`creatorAnalytics.insights.${insight.key}.title`)}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {t(`creatorAnalytics.insights.${insight.key}.message`, { value: insight.value })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Best Hours & Days */}
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                    {/* Meilleures heures */}
                    {bestHours.length > 0 && (
                        <div className="card">
                            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-purple-400" />
                                {t('creatorAnalytics.bestHours.title')}
                            </h3>
                            <div className="space-y-2">
                                {bestHours.slice(0, 5).map((hour, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-gray-400">{hour.hour}h - {hour.hour + 1}h</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-hyt-darker rounded-full h-2">
                                                <div
                                                    className="bg-purple-500 h-2 rounded-full"
                                                    style={{ width: `${(hour.sales / bestHours[0].sales) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-white font-medium w-8 text-right">{hour.sales}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Meilleurs jours */}
                    {bestDays.length > 0 && (
                        <div className="card">
                            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-purple-400" />
                                {t('creatorAnalytics.bestDays.title')}
                            </h3>
                            <div className="space-y-2">
                                {bestDays.map((day, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-gray-400">{getDayName(day.day)}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 bg-hyt-darker rounded-full h-2">
                                                <div
                                                    className="bg-purple-500 h-2 rounded-full"
                                                    style={{ width: `${(day.sales / Math.max(...bestDays.map(d => d.sales))) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-white font-medium w-8 text-right">{day.sales}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Models Performance */}
                {models.length > 0 && (
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Award className="w-5 h-5 text-hyt-accent" />
                                {t('creatorAnalytics.products.title')}
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="text-left text-gray-400 text-sm border-b border-hyt-border">
                                    <th className="pb-3 font-medium">{t('creatorAnalytics.products.product')}</th>
                                    <th className="pb-3 font-medium text-center">{t('creatorAnalytics.products.views')}</th>
                                    <th className="pb-3 font-medium text-center">{t('creatorAnalytics.products.downloads')}</th>
                                    <th className="pb-3 font-medium text-center">{t('creatorAnalytics.products.sales')}</th>
                                    <th className="pb-3 font-medium text-center">{t('creatorAnalytics.products.conv')}</th>
                                    <th className="pb-3 font-medium text-right">{t('creatorAnalytics.products.revenue')}</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-hyt-border">
                                {models.slice(0, 10).map((model) => (
                                    <tr key={model.id} className="hover:bg-hyt-darker/50">
                                        <td className="py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-hyt-dark overflow-hidden flex-shrink-0">
                                                    {model.image_url ? (
                                                        <img
                                                            src={getImageUrl(model.image_url)}
                                                            alt={model.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-4 h-4 text-gray-600" />
                                                        </div>
                                                    )}
                                                </div>
                                                <Link
                                                    to={`/models/${model.id}`}
                                                    className="font-medium text-white hover:text-hyt-accent transition-colors line-clamp-1"
                                                >
                                                    {model.title}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="py-3 text-center text-gray-400">
                                            {(model.views || 0).toLocaleString()}
                                        </td>
                                        <td className="py-3 text-center text-blue-400">
                                            {(model.downloads || 0).toLocaleString()}
                                        </td>
                                        <td className="py-3 text-center text-white font-medium">
                                            {model.sales || 0}
                                        </td>
                                        <td className="py-3 text-center">
                                            <span className={`${(model.conversionRate || 0) > 5 ? 'text-green-400' : 'text-gray-400'}`}>
                                                {(model.conversionRate || 0).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="py-3 text-right text-green-400 font-medium">
                                            {formatCurrency(model.revenue)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {models.length === 0 && (
                            <div className="text-center py-8">
                                <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400">{t('creatorAnalytics.noData')}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {models.length === 0 && !loading && (
                    <div className="card text-center py-12">
                        <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2">{t('creatorAnalytics.empty.title')}</h2>
                        <p className="text-gray-400 mb-6">
                            {t('creatorAnalytics.empty.description')}
                        </p>
                        <Link to="/upload" className="btn-primary">
                            {t('creatorAnalytics.empty.addProduct')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}