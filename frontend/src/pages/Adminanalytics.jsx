import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
    Loader2, TrendingUp, TrendingDown, Eye, ShoppingCart, Clock,
    Gamepad2, Tag, Layers, DollarSign, Users, Package, Calendar,
    ArrowUp, ArrowDown, Minus, RefreshCw, Filter, Download, X
} from 'lucide-react'
import { adminAPI, gamesAPI } from '../services/api'
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
function ChartCard({ title, subtitle, children, className = "", action }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-hyt-card border border-hyt-border rounded-xl p-6 ${className}`}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
                </div>
                {action}
            </div>
            {children}
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

// Composant principal
export default function AdminAnalytics() {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState('30')
    const [selectedGame, setSelectedGame] = useState('')
    const [games, setGames] = useState([])
    const [analytics, setAnalytics] = useState(null)
    const [gameDetails, setGameDetails] = useState(null)
    const [loadingGameDetails, setLoadingGameDetails] = useState(false)

    useEffect(() => {
        loadGames()
    }, [])

    useEffect(() => {
        loadAnalytics()
    }, [period, selectedGame])

    useEffect(() => {
        if (selectedGame) {
            loadGameDetails()
        } else {
            setGameDetails(null)
        }
    }, [selectedGame, period])

    const loadGames = async () => {
        try {
            const { data } = await gamesAPI.getAll()
            setGames(data.games || data || [])
        } catch (error) {
            console.error('Failed to load games:', error)
        }
    }

    const loadAnalytics = async () => {
        setLoading(true)
        try {
            const { data } = await adminAPI.getAnalytics(period, selectedGame)
            setAnalytics(data)
        } catch (error) {
            console.error('Failed to load analytics:', error)
            setAnalytics(null)
        } finally {
            setLoading(false)
        }
    }

    const loadGameDetails = async () => {
        if (!selectedGame) return
        setLoadingGameDetails(true)
        try {
            const { data } = await adminAPI.getGameAnalytics(selectedGame, period)
            setGameDetails(data)
        } catch (error) {
            console.error('Failed to load game details:', error)
            setGameDetails(null)
        } finally {
            setLoadingGameDetails(false)
        }
    }

    const clearGameFilter = () => {
        setSelectedGame('')
    }

    if (loading && !analytics) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-hyt-accent animate-spin" />
            </div>
        )
    }

    const data = analytics || {}
    const overview = data.overview || {}

    return (
        <div className="space-y-6">
            {/* Header avec filtres */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{t('analytics.title')}</h2>
                        <p className="text-gray-400 text-sm">{t('analytics.subtitle')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadAnalytics}
                            disabled={loading}
                            className="p-2 bg-hyt-dark border border-hyt-border rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Filtres */}
                <div className="flex flex-wrap items-center gap-3 p-4 bg-hyt-card border border-hyt-border rounded-xl">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Filter className="w-4 h-4" />
                        <span className="text-sm font-medium">{t('analytics.filters.label')}:</span>
                    </div>

                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="bg-hyt-dark border border-hyt-border rounded-lg px-3 py-2 text-white text-sm"
                    >
                        <option value="7">{t('analytics.filters.last7days')}</option>
                        <option value="30">{t('analytics.filters.last30days')}</option>
                        <option value="90">{t('analytics.filters.last90days')}</option>
                        <option value="365">{t('analytics.filters.thisYear')}</option>
                    </select>

                    <select
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        className="bg-hyt-dark border border-hyt-border rounded-lg px-3 py-2 text-white text-sm min-w-[150px]"
                    >
                        <option value="">{t('analytics.filters.allGames')}</option>
                        {games.map(game => (
                            <option key={game.id} value={game.id}>{game.name}</option>
                        ))}
                    </select>

                    {selectedGame && (
                        <button
                            onClick={clearGameFilter}
                            className="flex items-center gap-1 px-3 py-2 bg-hyt-accent/20 text-hyt-accent rounded-lg text-sm hover:bg-hyt-accent/30 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            {t('analytics.filters.clearFilter')}
                        </button>
                    )}
                </div>

                {/* Badge jeu sélectionné */}
                {selectedGame && (
                    <div className="flex items-center gap-2 p-3 bg-hyt-accent/10 border border-hyt-accent/30 rounded-lg">
                        <Gamepad2 className="w-5 h-5 text-hyt-accent" />
                        <span className="text-hyt-accent font-medium">
                            {t('analytics.filteredFor')} : {games.find(g => g.id === selectedGame)?.name || t('analytics.selectedGame')}
                        </span>
                    </div>
                )}
            </div>

            {/* KPIs Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={t('analytics.kpis.totalRevenue')}
                    value={`${(overview.totalRevenue / 100 || 0).toFixed(2)} €`}
                    subtitle={t('analytics.kpis.salesCount', { count: overview.totalSales || 0 })}
                    icon={DollarSign}
                    color="bg-green-500/20 text-green-500"
                    trend={data.trends?.revenue}
                />
                <StatCard
                    title={t('analytics.kpis.avgCart')}
                    value={`${(overview.avgOrderValue / 100 || 0).toFixed(2)} €`}
                    subtitle={t('analytics.kpis.perTransaction')}
                    icon={ShoppingCart}
                    color="bg-hyt-accent/20 text-hyt-accent"
                />
                <StatCard
                    title={t('analytics.kpis.totalViews')}
                    value={(overview.totalViews || 0).toLocaleString()}
                    subtitle={t('analytics.kpis.uniqueVisitors', { count: (overview.uniqueVisitors || 0).toLocaleString() })}
                    icon={Eye}
                    color="bg-purple-500/20 text-purple-500"
                    trend={data.trends?.views}
                />
                <StatCard
                    title={t('analytics.kpis.conversionRate')}
                    value={`${overview.conversionRate || 0}%`}
                    subtitle={t('analytics.kpis.visitorsToBuyers')}
                    icon={TrendingUp}
                    color="bg-yellow-500/20 text-yellow-500"
                />
            </div>

            {/* Détails par jeu (si un jeu est sélectionné) */}
            {selectedGame && gameDetails && (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Gamepad2 className="w-6 h-6 text-hyt-accent" />
                        {t('analytics.gameDetails.title')} {games.find(g => g.id === selectedGame)?.name}
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Top Catégories pour ce jeu */}
                        <ChartCard title={t('analytics.gameDetails.topCategories')} subtitle={t('analytics.gameDetails.forThisGame')}>
                            {loadingGameDetails ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {(gameDetails.topCategories || []).map((cat, index) => (
                                        <div key={cat.name} className="flex items-center gap-3">
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
                                                    <span className="text-green-400 text-sm">{cat.sales} {t('analytics.sales')}</span>
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
                                        <p className="text-gray-400 text-center py-8">{t('analytics.noData')}</p>
                                    )}
                                </div>
                            )}
                        </ChartCard>

                        {/* Top Tags pour ce jeu */}
                        <ChartCard title={t('analytics.gameDetails.topTags')} subtitle={t('analytics.gameDetails.forThisGame')}>
                            {loadingGameDetails ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {(gameDetails.topTags || []).map((tag, index) => (
                                        <div key={tag.name} className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: COLORS.chart[index % COLORS.chart.length] }}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white">{tag.name}</span>
                                                    <div className="flex items-center gap-3 text-sm">
                                                        <span className="text-gray-400">{tag.products} {t('analytics.products')}</span>
                                                        <span className="text-green-400">{tag.sales} {t('analytics.sales')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!gameDetails.topTags || gameDetails.topTags.length === 0) && (
                                        <p className="text-gray-400 text-center py-8">{t('analytics.noData')}</p>
                                    )}
                                </div>
                            )}
                        </ChartCard>

                        {/* Top Versions pour ce jeu */}
                        <ChartCard title={t('analytics.gameDetails.topVersions')} subtitle={t('analytics.gameDetails.forThisGame')}>
                            {loadingGameDetails ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {(gameDetails.topVersions || []).map((version, index) => (
                                        <div key={version.name} className="bg-hyt-dark rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-white font-medium">{version.name}</span>
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                                    index === 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                    {version.percentage}%
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-400">{version.products} {t('analytics.products')}</span>
                                                <span className="text-green-400">{version.sales} {t('analytics.sales')}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!gameDetails.topVersions || gameDetails.topVersions.length === 0) && (
                                        <p className="text-gray-400 text-center py-8">{t('analytics.noData')}</p>
                                    )}
                                </div>
                            )}
                        </ChartCard>
                    </div>

                    {/* Produits best-sellers pour ce jeu */}
                    <ChartCard title={t('analytics.gameDetails.bestSellers')} subtitle={t('analytics.gameDetails.top10For', { game: games.find(g => g.id === selectedGame)?.name })}>
                        {loadingGameDetails ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {(gameDetails.bestSellers || []).map((product, index) => (
                                    <div key={product.name} className="flex items-center gap-3 bg-hyt-dark rounded-lg p-3">
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
                                            <p className="text-gray-400 text-sm">{product.category}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-green-400 font-bold">{product.sales} {t('analytics.sales')}</p>
                                            <p className="text-gray-400 text-sm">{(product.revenue / 100).toFixed(2)}€</p>
                                        </div>
                                    </div>
                                ))}
                                {(!gameDetails.bestSellers || gameDetails.bestSellers.length === 0) && (
                                    <p className="text-gray-400 text-center py-8 col-span-2">{t('analytics.noData')}</p>
                                )}
                            </div>
                        )}
                    </ChartCard>
                </div>
            )}

            {/* Graphiques globaux */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ventes par Jeu - Camembert */}
                <ChartCard title={t('analytics.charts.salesByGame')} subtitle={t('analytics.charts.salesDistribution')}>
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
                                key={game.name}
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
                                <span className="text-white text-sm font-medium ml-auto">{(game.revenue / 100).toFixed(0)}€</span>
                            </div>
                        ))}
                    </div>
                </ChartCard>

                {/* Ventes par Catégorie - Camembert */}
                <ChartCard title={t('analytics.charts.salesByCategory')} subtitle={t('analytics.charts.byProductType')}>
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
                            <div key={cat.name} className="flex items-center gap-2">
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

            {/* Évolution des ventes */}
            <ChartCard title={t('analytics.charts.salesEvolution')} subtitle={t('analytics.charts.salesAndRevenue')}>
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
                                name={t('analytics.charts.salesLabel')}
                            />
                            <Area
                                yAxisId="right"
                                type="monotone"
                                dataKey="revenus"
                                stroke={COLORS.secondary}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorRevenus)"
                                name={t('analytics.charts.revenueLabel')}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </ChartCard>

            {/* Distribution des prix et Tags */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribution des prix */}
                <ChartCard title={t('analytics.charts.priceDistribution')} subtitle={t('analytics.charts.salesByPriceRange')}>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.priceDistribution || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="range" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" fill={COLORS.primary} radius={[4, 4, 0, 0]} name={t('analytics.charts.salesCount')} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Tags populaires */}
                <ChartCard title={t('analytics.charts.popularTags')} subtitle={t('analytics.charts.bestSellingTags')}>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {(data.topTags || []).map((tag, index) => (
                            <div key={tag.name} className="flex items-center gap-3">
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

            {/* Produits les plus vus et Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Produits les plus vus */}
                <ChartCard title={t('analytics.charts.mostViewedProducts')} subtitle={t('analytics.charts.topProductsBySales')}>
                    <div className="space-y-3">
                        {(data.mostViewedProducts || []).map((product, index) => (
                            <div key={product.name} className="bg-hyt-dark rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                            index === 0 ? 'bg-yellow-500 text-black' :
                                                index === 1 ? 'bg-gray-400 text-black' :
                                                    index === 2 ? 'bg-amber-700 text-white' :
                                                        'bg-hyt-border text-gray-400'
                                        }`}>
                                            {index + 1}
                                        </span>
                                        <span className="text-white font-medium truncate">{product.name}</span>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                        product.conversion >= 3 ? 'bg-green-500/20 text-green-400' :
                                            product.conversion >= 2 ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                    }`}>
                                        {product.conversion}% conv.
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">
                                        <Eye className="w-3 h-3 inline mr-1" />
                                        {(product.views || 0).toLocaleString()} {t('analytics.views')}
                                    </span>
                                    <span className="text-green-400">
                                        <ShoppingCart className="w-3 h-3 inline mr-1" />
                                        {product.sales} {t('analytics.sales')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ChartCard>

                {/* Funnel de conversion */}
                <ChartCard title={t('analytics.charts.conversionFunnel')} subtitle={t('analytics.charts.userJourney')}>
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
            </div>
        </div>
    )
}