import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
    Loader2, TrendingUp, TrendingDown, Eye, ShoppingCart, Clock,
    Gamepad2, Tag, Layers, DollarSign, Users, Package, Calendar,
    ArrowUp, ArrowDown, Minus, RefreshCw, Filter, Download, X,
    Crown, UserCheck, UserX, Percent, Award, Store, ChevronDown, ChevronUp
} from 'lucide-react'
import { adminAPI, gamesAPI, categoriesAPI, tagsAPI, versionsAPI } from '../services/api'
import { useTranslation } from '../context/LanguageContext'

// Couleurs pour les graphiques
const COLORS = {
    primary: '#00D9FF',
    secondary: '#A855F7',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    chart: ['#00D9FF', '#A855F7', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6', '#8B5CF6', '#F97316']
}

// Composant StatCard
function StatCard({ title, value, subtitle, icon: Icon, color, trend, trendValue }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-hyt-card to-hyt-dark border border-hyt-border rounded-xl p-5 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <Icon className="w-full h-full" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${color}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {trend !== undefined && trend !== 0 && (
                        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                            trend > 0 ? 'bg-green-500/20 text-green-400' :
                                trend < 0 ? 'bg-red-500/20 text-red-400' :
                                    'bg-gray-500/20 text-gray-400'
                        }`}>
                            {trend > 0 ? <ArrowUp className="w-3 h-3" /> :
                                trend < 0 ? <ArrowDown className="w-3 h-3" /> :
                                    <Minus className="w-3 h-3" />}
                            {Math.abs(trendValue || trend)}%
                        </div>
                    )}
                </div>
                <p className="text-gray-400 text-sm mb-1">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
                {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
        </motion.div>
    )
}

// Composant ChartCard
function ChartCard({ title, subtitle, children, className = "", action, collapsible = false, defaultOpen = true }) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-hyt-card border border-hyt-border rounded-xl p-6 ${className}`}
        >
            <div
                className={`flex items-start justify-between mb-4 ${collapsible ? 'cursor-pointer' : ''}`}
                onClick={() => collapsible && setIsOpen(!isOpen)}
            >
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        {title}
                        {collapsible && (
                            isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </h3>
                    {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
                </div>
                {action}
            </div>
            {(!collapsible || isOpen) && children}
        </motion.div>
    )
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-hyt-dark border border-hyt-border rounded-lg p-3 shadow-xl">
                <p className="text-gray-400 text-sm mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-white font-medium" style={{ color: entry.color }}>
                        {entry.name}: {typeof entry.value === 'number' && entry.name.includes('€')
                        ? `${entry.value.toFixed(2)} €`
                        : entry.value}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

// Filtre Multi-Select
function MultiSelect({ label, options, selected, onChange, icon: Icon }) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleOption = (id) => {
        if (selected.includes(id)) {
            onChange(selected.filter(s => s !== id))
        } else {
            onChange([...selected, id])
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-hyt-dark border border-hyt-border rounded-lg px-3 py-2 text-white text-sm min-w-[150px] hover:border-hyt-accent/50 transition-colors"
            >
                {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                <span className="truncate">
                    {selected.length === 0 ? label : `${selected.length} sélectionné(s)`}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-hyt-dark border border-hyt-border rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                    {options.length === 0 ? (
                        <p className="text-gray-400 text-sm p-3 text-center">Aucune option</p>
                    ) : (
                        options.map(opt => (
                            <label
                                key={opt.id}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-hyt-card cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(opt.id)}
                                    onChange={() => toggleOption(opt.id)}
                                    className="rounded bg-hyt-card border-hyt-border text-hyt-accent focus:ring-hyt-accent"
                                />
                                <span className="text-white text-sm truncate">{opt.name || opt.version}</span>
                            </label>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

// Tabs
function Tabs({ tabs, activeTab, onChange }) {
    return (
        <div className="flex items-center gap-2 p-1 bg-hyt-dark rounded-lg">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                            ? 'bg-hyt-accent text-black'
                            : 'text-gray-400 hover:text-white hover:bg-hyt-card'
                    }`}
                >
                    {tab.icon && <tab.icon className="w-4 h-4" />}
                    {tab.label}
                </button>
            ))}
        </div>
    )
}

// Composant principal
export default function AdminAnalytics() {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    // Filtres
    const [period, setPeriod] = useState('30')
    const [selectedGame, setSelectedGame] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedTags, setSelectedTags] = useState([])
    const [selectedVersions, setSelectedVersions] = useState([])

    // Options de filtres
    const [games, setGames] = useState([])
    const [categories, setCategories] = useState([])
    const [tags, setTags] = useState([])
    const [versions, setVersions] = useState([])

    // Data
    const [analytics, setAnalytics] = useState(null)
    const [sellersAnalytics, setSellersAnalytics] = useState(null)
    const [gameDetails, setGameDetails] = useState(null)
    const [loadingGameDetails, setLoadingGameDetails] = useState(false)
    const [loadingSellers, setLoadingSellers] = useState(false)

    const tabs = [
        { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
        { id: 'sellers', label: 'Vendeurs', icon: Users },
        { id: 'products', label: 'Produits', icon: Package }
    ]

    useEffect(() => {
        loadFilterOptions()
    }, [])

    useEffect(() => {
        loadAnalytics()
    }, [period, selectedGame, selectedCategory, selectedTags, selectedVersions])

    useEffect(() => {
        if (activeTab === 'sellers') {
            loadSellersAnalytics()
        }
    }, [activeTab, period, selectedGame, selectedCategory, selectedTags, selectedVersions])

    useEffect(() => {
        if (selectedGame) {
            loadGameDetails()
        } else {
            setGameDetails(null)
        }
    }, [selectedGame, period, selectedCategory, selectedTags, selectedVersions])

    const loadFilterOptions = async () => {
        try {
            // Essayer le nouvel endpoint
            try {
                const { data } = await adminAPI.getAnalyticsFilters()
                setGames(data.games || [])
                setCategories(data.categories || [])
                setTags(data.tags || [])
                setVersions(data.versions || [])
                return
            } catch (e) {
                // Fallback sur les anciens endpoints
            }

            const [gamesRes, categoriesRes, tagsRes, versionsRes] = await Promise.all([
                gamesAPI.getAll(),
                categoriesAPI.getAll(),
                tagsAPI.getAll(),
                versionsAPI.getAll()
            ])
            setGames(gamesRes.data.games || gamesRes.data || [])
            setCategories(categoriesRes.data.categories || categoriesRes.data || [])
            setTags(tagsRes.data.tags || tagsRes.data || [])
            setVersions(versionsRes.data.versions || versionsRes.data || [])
        } catch (error) {
            console.error('Failed to load filter options:', error)
        }
    }

    const loadAnalytics = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ days: period })
            if (selectedGame) params.append('gameId', selectedGame)
            if (selectedCategory) params.append('categoryId', selectedCategory)
            if (selectedTags.length) params.append('tagIds', selectedTags.join(','))
            if (selectedVersions.length) params.append('versionIds', selectedVersions.join(','))

            // Essayer le nouvel endpoint
            try {
                const { data } = await adminAPI.getAdvancedAnalytics(params.toString())
                setAnalytics(data)
            } catch (e) {
                // Fallback sur l'ancien endpoint
                const { data } = await adminAPI.getAnalytics(period, selectedGame)
                setAnalytics(data)
            }
        } catch (error) {
            console.error('Failed to load analytics:', error)
            setAnalytics(null)
        } finally {
            setLoading(false)
        }
    }

    const loadSellersAnalytics = async () => {
        setLoadingSellers(true)
        try {
            const params = new URLSearchParams({ days: period })
            if (selectedGame) params.append('gameId', selectedGame)
            if (selectedCategory) params.append('categoryId', selectedCategory)
            if (selectedTags.length) params.append('tagIds', selectedTags.join(','))
            if (selectedVersions.length) params.append('versionIds', selectedVersions.join(','))

            const { data } = await adminAPI.getSellersAnalytics(params.toString())
            setSellersAnalytics(data)
        } catch (error) {
            console.error('Failed to load sellers analytics:', error)
            setSellersAnalytics(null)
        } finally {
            setLoadingSellers(false)
        }
    }

    const loadGameDetails = async () => {
        if (!selectedGame) return
        setLoadingGameDetails(true)
        try {
            const params = new URLSearchParams({ days: period })
            if (selectedCategory) params.append('categoryId', selectedCategory)
            if (selectedTags.length) params.append('tagIds', selectedTags.join(','))
            if (selectedVersions.length) params.append('versionIds', selectedVersions.join(','))

            const { data } = await adminAPI.getGameAnalytics(selectedGame, period)
            setGameDetails(data)
        } catch (error) {
            console.error('Failed to load game details:', error)
            setGameDetails(null)
        } finally {
            setLoadingGameDetails(false)
        }
    }

    const clearFilters = () => {
        setSelectedGame('')
        setSelectedCategory('')
        setSelectedTags([])
        setSelectedVersions([])
    }

    const hasActiveFilters = selectedGame || selectedCategory || selectedTags.length > 0 || selectedVersions.length > 0

    // Filtrer les catégories/versions par jeu sélectionné
    const filteredCategories = selectedGame
        ? categories.filter(c => c.game_id === selectedGame)
        : categories

    const filteredVersions = selectedGame
        ? versions.filter(v => v.game_id === selectedGame)
        : versions

    if (loading && !analytics) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-hyt-accent animate-spin" />
            </div>
        )
    }

    const data = analytics || {}
    const overview = data.overview || {}
    const sellers = sellersAnalytics || {}

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Analytics Avancées</h2>
                        <p className="text-gray-400 text-sm">Analyse complète des ventes et performances</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
                        <button
                            onClick={loadAnalytics}
                            disabled={loading}
                            className="p-2 bg-hyt-dark border border-hyt-border rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Filtres avancés */}
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm font-medium">Filtres:</span>
                        </div>

                        {/* Période */}
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="bg-hyt-dark border border-hyt-border rounded-lg px-3 py-2 text-white text-sm"
                        >
                            <option value="7">7 derniers jours</option>
                            <option value="30">30 derniers jours</option>
                            <option value="90">90 derniers jours</option>
                            <option value="365">Cette année</option>
                        </select>

                        {/* Jeu */}
                        <select
                            value={selectedGame}
                            onChange={(e) => {
                                setSelectedGame(e.target.value)
                                setSelectedCategory('') // Reset category when game changes
                                setSelectedVersions([]) // Reset versions when game changes
                            }}
                            className="bg-hyt-dark border border-hyt-border rounded-lg px-3 py-2 text-white text-sm min-w-[150px]"
                        >
                            <option value="">Tous les jeux</option>
                            {games.map(game => (
                                <option key={game.id} value={game.id}>{game.name}</option>
                            ))}
                        </select>

                        {/* Catégorie */}
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-hyt-dark border border-hyt-border rounded-lg px-3 py-2 text-white text-sm min-w-[150px]"
                        >
                            <option value="">Toutes catégories</option>
                            {filteredCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>

                        {/* Tags (Multi-select) */}
                        <MultiSelect
                            label="Tags"
                            options={tags}
                            selected={selectedTags}
                            onChange={setSelectedTags}
                            icon={Tag}
                        />

                        {/* Versions (Multi-select) */}
                        <MultiSelect
                            label="Versions"
                            options={filteredVersions}
                            selected={selectedVersions}
                            onChange={setSelectedVersions}
                            icon={Layers}
                        />

                        {/* Clear filters */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                Effacer
                            </button>
                        )}
                    </div>

                    {/* Résumé des filtres actifs */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-hyt-border">
                            <span className="text-xs text-gray-500">Filtres actifs:</span>
                            {selectedGame && (
                                <span className="px-2 py-1 bg-hyt-accent/20 text-hyt-accent rounded text-xs">
                                    {games.find(g => g.id === selectedGame)?.name}
                                </span>
                            )}
                            {selectedCategory && (
                                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                                    {categories.find(c => c.id === selectedCategory)?.name}
                                </span>
                            )}
                            {selectedTags.length > 0 && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                    {selectedTags.length} tag(s)
                                </span>
                            )}
                            {selectedVersions.length > 0 && (
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                    {selectedVersions.length} version(s)
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Contenu selon l'onglet */}
            {activeTab === 'overview' && (
                <>
                    {/* KPIs Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <StatCard
                            title="Revenus bruts"
                            value={`${(overview.totalRevenue || 0).toFixed(2)} €`}
                            subtitle={`${overview.totalSales || 0} ventes`}
                            icon={DollarSign}
                            color="bg-green-500/20 text-green-500"
                            trend={data.trends?.revenue}
                        />
                        <StatCard
                            title="Revenus Plateforme"
                            value={`${(overview.platformRevenue || 0).toFixed(2)} €`}
                            subtitle="Commissions + HytStudio"
                            icon={TrendingUp}
                            color="bg-hyt-accent/20 text-hyt-accent"
                        />
                        <StatCard
                            title="Frais Stripe"
                            value={`${(overview.totalStripeFees || 0).toFixed(2)} €`}
                            subtitle="1.5% + 0.25€"
                            icon={ShoppingCart}
                            color="bg-red-500/20 text-red-500"
                        />
                        <StatCard
                            title="Téléchargements"
                            value={(overview.totalDownloads || data.totalDownloads || 0).toLocaleString()}
                            subtitle="Total fichiers"
                            icon={Download}
                            color="bg-purple-500/20 text-purple-500"
                        />
                        <StatCard
                            title="Taux de conversion"
                            value={`${overview.conversionRate || 0}%`}
                            subtitle="Visiteurs → Acheteurs"
                            icon={TrendingUp}
                            color="bg-yellow-500/20 text-yellow-500"
                        />
                    </div>

                    {/* Graphiques globaux */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Ventes par Jeu */}
                        <ChartCard title="Ventes par Jeu" subtitle="Répartition des ventes">
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.salesByGame || []}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={{ stroke: '#4B5563', strokeWidth: 1 }}
                                        >
                                            {(data.salesByGame || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                {(data.salesByGame || []).map((game, index) => (
                                    <div
                                        key={`game-${index}`}
                                        className="flex items-center gap-2 cursor-pointer hover:bg-hyt-dark/50 p-1 rounded transition-colors"
                                        onClick={() => {
                                            const gameObj = games.find(g => g.name === game.name)
                                            if (gameObj) setSelectedGame(gameObj.id)
                                        }}
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: COLORS.chart[index % COLORS.chart.length] }}
                                        />
                                        <span className="text-gray-400 text-sm truncate">{game.name}</span>
                                        <span className="text-white text-sm font-medium ml-auto">{(game.revenue ).toFixed(0)}€</span>
                                    </div>
                                ))}
                            </div>
                        </ChartCard>

                        {/* Ventes par Catégorie */}
                        <ChartCard title="Ventes par Catégorie" subtitle="Par type de produit">
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.salesByCategory || []}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={{ stroke: '#4B5563', strokeWidth: 1 }}
                                        >
                                            {(data.salesByCategory || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS.chart[(index + 3) % COLORS.chart.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                {(data.salesByCategory || []).map((cat, index) => (
                                    <div key={`cat-${index}`} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: COLORS.chart[(index + 3) % COLORS.chart.length] }}
                                        />
                                        <span className="text-gray-400 text-sm truncate">{cat.name}</span>
                                        <span className="text-white text-sm font-medium ml-auto">{cat.count}</span>
                                    </div>
                                ))}
                            </div>
                        </ChartCard>
                    </div>

                    {/* Ventes par Tag et Version */}
                    {(data.salesByTag?.length > 0 || data.salesByVersion?.length > 0) && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Ventes par Tag */}
                            {data.salesByTag?.length > 0 && (
                                <ChartCard title="Ventes par Tag" subtitle="Tags les plus populaires">
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {data.salesByTag.map((tag, index) => (
                                            <div key={`tag-${index}`} className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: COLORS.chart[index % COLORS.chart.length] }}
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-white">{tag.name}</span>
                                                        <span className="text-green-400 text-sm">{tag.count} ventes</span>
                                                    </div>
                                                    <div className="h-2 bg-hyt-dark rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-hyt-accent to-hyt-purple"
                                                            style={{ width: `${tag.value}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ChartCard>
                            )}

                            {/* Ventes par Version */}
                            {data.salesByVersion?.length > 0 && (
                                <ChartCard title="Ventes par Version" subtitle="Versions les plus vendues">
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {data.salesByVersion.map((version, index) => (
                                            <div key={`ver-${index}`} className="bg-hyt-dark rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-white font-medium">{version.name}</span>
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                        index === 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                                    }`}>
                                                        {version.value}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-400">{version.count} ventes</span>
                                                    <span className="text-green-400">{(version.revenue ).toFixed(2)}€</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ChartCard>
                            )}
                        </div>
                    )}

                    {/* Évolution des ventes */}
                    <ChartCard title="Évolution des ventes" subtitle="Ventes et revenus dans le temps">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.salesOverTime || []}>
                                    <defs>
                                        <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="date" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                    <YAxis yAxisId="left" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="ventes"
                                        stroke={COLORS.primary}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorVentes)"
                                        name="Ventes"
                                    />
                                    <Area
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="revenus"
                                        stroke={COLORS.secondary}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorRevenus)"
                                        name="Revenus (€)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    {/* Détails du jeu sélectionné */}
                    {selectedGame && gameDetails && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Gamepad2 className="w-6 h-6 text-hyt-accent" />
                                Détails: {games.find(g => g.id === selectedGame)?.name}
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Top Catégories */}
                                <ChartCard title="Top Catégories" subtitle="Pour ce jeu">
                                    {loadingGameDetails ? (
                                        <div className="flex items-center justify-center h-64">
                                            <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {(gameDetails.topCategories || []).map((cat, index) => (
                                                <div key={`topcat-${index}`} className="flex items-center gap-3">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                        index === 0 ? 'bg-yellow-500 text-black' :
                                                            index === 1 ? 'bg-gray-400 text-black' :
                                                                index === 2 ? 'bg-amber-700 text-white' :
                                                                    'bg-hyt-border text-gray-400'
                                                    }`}>
                                                        {index + 1}
                                                    </span>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-white font-medium">{cat.name}</span>
                                                            <span className="text-green-400 text-sm">{cat.sales} ventes</span>
                                                        </div>
                                                        <div className="h-2 bg-hyt-dark rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full bg-gradient-to-r from-hyt-accent to-hyt-purple"
                                                                style={{ width: `${cat.percentage}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!gameDetails.topCategories || gameDetails.topCategories.length === 0) && (
                                                <p className="text-gray-400 text-center py-8">Aucune donnée</p>
                                            )}
                                        </div>
                                    )}
                                </ChartCard>

                                {/* Top Tags */}
                                <ChartCard title="Top Tags" subtitle="Pour ce jeu">
                                    {loadingGameDetails ? (
                                        <div className="flex items-center justify-center h-64">
                                            <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {(gameDetails.topTags || []).map((tag, index) => (
                                                <div key={`tag-${index}`} className="flex items-center gap-3">
                                                    <div
                                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: COLORS.chart[index % COLORS.chart.length] }}
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-white">{tag.name}</span>
                                                            <div className="flex items-center gap-3 text-sm">
                                                                <span className="text-gray-400">{tag.products} produits</span>
                                                                <span className="text-green-400">{tag.sales} ventes</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!gameDetails.topTags || gameDetails.topTags.length === 0) && (
                                                <p className="text-gray-400 text-center py-8">Aucune donnée</p>
                                            )}
                                        </div>
                                    )}
                                </ChartCard>

                                {/* Top Vendeurs pour ce jeu */}
                                <ChartCard title="Top Vendeurs" subtitle="Pour ce jeu">
                                    {loadingGameDetails ? (
                                        <div className="flex items-center justify-center h-64">
                                            <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {(gameDetails.topSellers || []).map((seller, index) => (
                                                <div key={seller.id} className="flex items-center gap-3 bg-hyt-dark rounded-lg p-2">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                                        index === 0 ? 'bg-yellow-500 text-black' :
                                                            index === 1 ? 'bg-gray-400 text-black' :
                                                                index === 2 ? 'bg-amber-700 text-white' :
                                                                    'bg-hyt-border text-gray-400'
                                                    }`}>
                                                        {index + 1}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-medium truncate">{seller.username}</p>
                                                        <p className="text-gray-400 text-xs">{seller.products} produits</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-green-400 font-bold">{seller.sales} ventes</p>
                                                        <p className="text-gray-400 text-xs">{(seller.revenue ).toFixed(2)}€</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!gameDetails.topSellers || gameDetails.topSellers.length === 0) && (
                                                <p className="text-gray-400 text-center py-8">Aucune donnée</p>
                                            )}
                                        </div>
                                    )}
                                </ChartCard>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Onglet Vendeurs */}
            {activeTab === 'sellers' && (
                <>
                    {loadingSellers ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-hyt-accent animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Stats vendeurs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                <StatCard
                                    title="Total créateurs"
                                    value={sellers.sellersComparison?.totalCreators || 0}
                                    icon={Users}
                                    color="bg-blue-500/20 text-blue-500"
                                />
                                <StatCard
                                    title="Vendeurs actifs"
                                    value={sellers.sellersComparison?.activeSellers || 0}
                                    subtitle={`${sellers.sellersComparison?.activeRate || 0}% du total`}
                                    icon={UserCheck}
                                    color="bg-green-500/20 text-green-500"
                                />
                                <StatCard
                                    title="Sans ventes"
                                    value={sellers.sellersComparison?.inactiveSellers || 0}
                                    subtitle="Avec produits"
                                    icon={UserX}
                                    color="bg-yellow-500/20 text-yellow-500"
                                />
                                <StatCard
                                    title="Nouveaux vendeurs"
                                    value={sellers.newVsExisting?.newSellers?.count || 0}
                                    subtitle={`${((sellers.newVsExisting?.newSellers?.revenue || 0) ).toFixed(2)}€`}
                                    icon={Award}
                                    color="bg-purple-500/20 text-purple-500"
                                />
                                <StatCard
                                    title="Vendeurs existants"
                                    value={sellers.newVsExisting?.existingSellers?.count || 0}
                                    subtitle={`${((sellers.newVsExisting?.existingSellers?.revenue || 0) ).toFixed(2)}€`}
                                    icon={Store}
                                    color="bg-hyt-accent/20 text-hyt-accent"
                                />
                            </div>

                            {/* Performance par type de créateur */}
                            <ChartCard title="Performance par type de créateur" subtitle="Revenus et commissions par type">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(sellers.performanceByType || []).map((type, index) => (
                                        <div key={type.type} className="bg-hyt-dark rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    {type.type === 'HYTSTUDIO' && <Crown className="w-5 h-5 text-yellow-500" />}
                                                    {type.type === 'AFFILIATED' && <Award className="w-5 h-5 text-purple-500" />}
                                                    {type.type === 'NON_AFFILIATED' && <Users className="w-5 h-5 text-gray-400" />}
                                                    <span className="text-white font-medium">{type.typeName}</span>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    type.commissionRate === 100
                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                        : 'bg-hyt-border text-gray-400'
                                                }`}>
                                                    {type.commissionRate === 100 ? '100% plateforme' : `${type.commissionRate}% comm.`}
                                                </span>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Vendeurs</span>
                                                    <span className="text-white font-medium">{type.sellersCount}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Ventes</span>
                                                    <span className="text-white font-medium">{type.salesCount}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Revenus bruts</span>
                                                    <span className="text-green-400 font-medium">{(type.totalRevenue ).toFixed(2)}€</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Revenus plateforme</span>
                                                    <span className="text-hyt-accent font-bold">{(type.platformRevenue ).toFixed(2)}€</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Vente moyenne</span>
                                                    <span className="text-white font-medium">{(type.avgSale ).toFixed(2)}€</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ChartCard>

                            {/* Vendeurs par jeu */}
                            <ChartCard title="Vendeurs par Jeu" subtitle="Répartition et performance">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                        <tr className="border-b border-hyt-border">
                                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Jeu</th>
                                            <th className="text-center py-3 px-4 text-gray-400 font-medium">Vendeurs</th>
                                            <th className="text-center py-3 px-4 text-gray-400 font-medium">Ventes</th>
                                            <th className="text-center py-3 px-4 text-gray-400 font-medium">Revenus</th>
                                            <th className="text-center py-3 px-4 text-gray-400 font-medium">Moy./Vendeur</th>
                                            <th className="text-left py-3 px-4 text-gray-400 font-medium">Top Vendeur</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {(sellers.sellersByGame || []).map((game, index) => (
                                            <tr
                                                key={game.gameId}
                                                className="border-b border-hyt-border/50 hover:bg-hyt-dark/50 cursor-pointer transition-colors"
                                                onClick={() => setSelectedGame(game.gameId)}
                                            >
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Gamepad2 className="w-4 h-4 text-hyt-accent" />
                                                        <span className="text-white font-medium">{game.gameName}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center text-white">{game.sellersCount}</td>
                                                <td className="py-3 px-4 text-center text-white">{game.totalSales}</td>
                                                <td className="py-3 px-4 text-center text-green-400 font-medium">{(game.totalRevenue ).toFixed(2)}€</td>
                                                <td className="py-3 px-4 text-center text-gray-400">{(game.avgRevenuePerSeller ).toFixed(2)}€</td>
                                                <td className="py-3 px-4">
                                                    {game.topSeller ? (
                                                        <span className="flex items-center gap-1 text-yellow-500">
                                                                <Crown className="w-4 h-4" />
                                                            {game.topSeller}
                                                            </span>
                                                    ) : (
                                                        <span className="text-gray-500">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </ChartCard>

                            {/* Top 20 Vendeurs */}
                            <ChartCard title="Top 20 Vendeurs" subtitle="Classement par revenus">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {(sellers.topSellers || []).map((seller, index) => (
                                        <div key={seller.id} className={`flex items-center gap-3 rounded-lg p-3 ${
                                            seller.isHytStudio ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-hyt-dark'
                                        }`}>
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                                index === 0 ? 'bg-yellow-500 text-black' :
                                                    index === 1 ? 'bg-gray-400 text-black' :
                                                        index === 2 ? 'bg-amber-700 text-white' :
                                                            'bg-hyt-border text-gray-400'
                                            }`}>
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-white font-medium truncate">{seller.username}</p>
                                                    {seller.isHytStudio && (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                                                            <Crown className="w-3 h-3" />
                                                            100%
                                                        </span>
                                                    )}
                                                    {!seller.isHytStudio && seller.creatorType === 'AFFILIATED' && (
                                                        <Award className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                                                    <span>{seller.salesCount} ventes</span>
                                                    <span>{seller.productsSold} produits</span>
                                                    <span>{seller.gamesCount} jeux</span>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-green-400 font-bold">{(seller.grossRevenue ).toFixed(2)}€</p>
                                                <p className="text-gray-400 text-xs">
                                                    {seller.isHytStudio
                                                        ? <span className="text-yellow-400">→ Plateforme</span>
                                                        : `Net: ${(seller.netRevenue ).toFixed(2)}€`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ChartCard>
                        </>
                    )}
                </>
            )}

            {/* Onglet Produits */}
            {activeTab === 'products' && (
                <>
                    {/* Distribution des prix */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Distribution des prix" subtitle="Ventes par tranche de prix">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.priceDistribution || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="range" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                        <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="count" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Nombre de ventes" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartCard>

                        {/* Tags populaires */}
                        <ChartCard title="Tags populaires" subtitle="Tags les plus vendus">
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {(data.topTags || []).map((tag, index) => (
                                    <div key={`tag-${index}`} className="flex items-center gap-3">
                                        <span className="text-gray-500 text-sm w-6">#{index + 1}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-white font-medium">{tag.name}</span>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="text-gray-400">
                                                        <Eye className="w-3 h-3 inline mr-1" />
                                                        {(tag.views || 0).toLocaleString()}
                                                    </span>
                                                    <span className="text-green-400">
                                                        <ShoppingCart className="w-3 h-3 inline mr-1" />
                                                        {tag.sales}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-2 bg-hyt-dark rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${((tag.sales || 0) / (data.topTags?.[0]?.sales || 1)) * 100}%`,
                                                        background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary})`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ChartCard>
                    </div>

                    {/* Produits best-sellers */}
                    <ChartCard title="Produits best-sellers" subtitle="Top 10 des produits les plus vendus">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(data.mostViewedProducts || []).map((product, index) => (
                                <div key={`prod-${index}`} className="bg-hyt-dark rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                            index === 0 ? 'bg-yellow-500 text-black' :
                                                index === 1 ? 'bg-gray-400 text-black' :
                                                    index === 2 ? 'bg-amber-700 text-white' :
                                                        'bg-hyt-border text-gray-400'
                                        }`}>
                                            {index + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{product.name}</p>
                                            <div className="flex items-center gap-4 text-sm mt-1">
                                                <span className="text-gray-400">
                                                    <Eye className="w-3 h-3 inline mr-1" />
                                                    {(product.views || 0).toLocaleString()} vues
                                                </span>
                                                <span className="text-green-400">
                                                    <ShoppingCart className="w-3 h-3 inline mr-1" />
                                                    {product.sales} ventes
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-green-400 font-bold">{(product.revenue ).toFixed(2)}€</p>
                                            <p className={`text-xs font-medium ${
                                                product.conversion >= 3 ? 'text-green-400' :
                                                    product.conversion >= 2 ? 'text-yellow-400' : 'text-red-400'
                                            }`}>
                                                {product.conversion}% conv.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ChartCard>

                    {/* Funnel de conversion */}
                    <ChartCard title="Funnel de conversion" subtitle="Parcours utilisateur">
                        <div className="flex items-end justify-between gap-2 h-64 px-4">
                            {(data.conversionFunnel || []).map((step, index) => {
                                const maxValue = data.conversionFunnel?.[0]?.value || 1
                                const heightPercent = (step.value / maxValue) * 100
                                const dropRate = index > 0
                                    ? ((1 - step.value / (data.conversionFunnel[index - 1]?.value || 1)) * 100).toFixed(1)
                                    : null

                                return (
                                    <div key={step.step} className="flex-1 flex flex-col items-center">
                                        <div className="text-center mb-2">
                                            <p className="text-white font-bold">{(step.value || 0).toLocaleString()}</p>
                                            {dropRate && parseFloat(dropRate) > 0 && (
                                                <p className="text-red-400 text-xs">-{dropRate}%</p>
                                            )}
                                        </div>
                                        <div
                                            className="w-full rounded-t-lg transition-all duration-500"
                                            style={{
                                                height: `${Math.max(heightPercent, 5)}%`,
                                                minHeight: '20px',
                                                background: `linear-gradient(180deg, ${COLORS.chart[index]}, ${COLORS.chart[index]}88)`
                                            }}
                                        />
                                        <p className="text-gray-400 text-xs mt-2 text-center">{step.step}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </ChartCard>
                </>
            )}
        </div>
    )
}