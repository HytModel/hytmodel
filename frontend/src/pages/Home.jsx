import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Shield, Zap, Users, TrendingUp, Box, Gamepad2, ChevronRight } from 'lucide-react'
import { modelsAPI, gamesAPI } from '../services/api'
import { useTranslation } from '../context/LanguageContext'
import ModelCard from '../components/ModelCard'
import Loading from '../components/Loading'

// Fonction pour obtenir l'URL complète de l'image
const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `http://localhost:3001${url}`
}

export default function Home() {
    const { t } = useTranslation()
    const [models, setModels] = useState([])
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [modelsRes, gamesRes] = await Promise.all([
                modelsAPI.getAll().catch(() => ({ data: [] })),
                gamesAPI.getAll().catch(() => ({ data: [] }))
            ])

            const modelsData = modelsRes?.data?.models || modelsRes?.data || []
            const gamesData = gamesRes?.data?.games || gamesRes?.data || []

            setModels(Array.isArray(modelsData) ? modelsData.slice(0, 8) : [])
            setGames(Array.isArray(gamesData) ? gamesData : [])
        } catch (error) {
            console.error('Failed to fetch data:', error)
            setModels([])
            setGames([])
        } finally {
            setLoading(false)
        }
    }

    const features = [
        {
            icon: Shield,
            title: t('home.features.quality.title'),
            description: t('home.features.quality.description')
        },
        {
            icon: Zap,
            title: t('home.features.instant.title'),
            description: t('home.features.instant.description')
        },
        {
            icon: Users,
            title: t('home.features.community.title'),
            description: t('home.features.community.description')
        },
        {
            icon: TrendingUp,
            title: t('home.features.revenue.title'),
            description: t('home.features.revenue.description')
        }
    ]

    const stats = [
        { value: '10K+', label: t('home.stats.products') },
        { value: '5K+', label: t('home.stats.creators') },
        { value: '50K+', label: t('home.stats.sales') },
        { value: '4.9', label: t('home.stats.rating') }
    ]

    return (
        <div className="page-enter">
            {/* Hero Section */}
            <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 mesh-bg" />
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hyt-accent/10 rounded-full blur-3xl animate-float" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-hyt-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-hyt-card border border-hyt-border">
                        <Sparkles className="w-4 h-4 text-hyt-accent" />
                        <span className="text-sm text-gray-400">{t('home.hero.badge')}</span>
                    </div>

                    <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                        {t('home.hero.title')}
                        <br />
                        <span className="gradient-text">{t('home.hero.titleHighlight')}</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl text-gray-400 mb-10">
                        {t('home.hero.description')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/models" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                            {t('home.hero.exploreButton')}
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/become-creator" className="btn-secondary text-lg px-8 py-4">
                            {t('home.hero.creatorButton')}
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-gray-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Games Section - Avec bannières */}
            {games.length > 0 && (
                <section className="py-16 bg-hyt-darker">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                                    {t('home.games.title')}
                                </h2>
                                <p className="text-gray-400">{t('home.games.subtitle')}</p>
                            </div>
                            <Link to="/models" className="btn-ghost flex items-center gap-2">
                                {t('home.games.viewAll')}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Grille de jeux avec bannières */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {games.map((game) => (
                                <Link
                                    key={game.id}
                                    to={`/models?game=${game.id}`}
                                    className="group relative overflow-hidden rounded-2xl border border-hyt-border hover:border-hyt-accent/50 transition-all duration-300"
                                >
                                    {/* Bannière */}
                                    <div className="relative h-40 overflow-hidden">
                                        {game.banner_url ? (
                                            <img
                                                src={getImageUrl(game.banner_url)}
                                                alt={game.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-hyt-accent/20 via-hyt-purple/20 to-hyt-dark" />
                                        )}
                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-hyt-dark via-hyt-dark/50 to-transparent" />
                                    </div>

                                    {/* Contenu */}
                                    <div className="absolute bottom-0 left-0 right-0 p-5">
                                        <div className="flex items-center gap-4">
                                            {/* Logo */}
                                            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-hyt-border bg-hyt-card flex-shrink-0 shadow-lg">
                                                {game.icon_url ? (
                                                    <img
                                                        src={getImageUrl(game.icon_url)}
                                                        alt={game.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center">
                                                        <Gamepad2 className="w-8 h-8 text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Infos */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-bold text-white group-hover:text-hyt-accent transition-colors truncate">
                                                    {game.name}
                                                </h3>
                                                <p className="text-gray-400 text-sm flex items-center gap-1">
                                                    {t('home.games.explore')}
                                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Models */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
                                {t('home.popular.title')}
                            </h2>
                            <p className="text-gray-400">{t('home.popular.subtitle')}</p>
                        </div>
                        <Link to="/models" className="btn-ghost flex items-center gap-2">
                            {t('home.popular.viewAll')}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {loading ? (
                        <Loading />
                    ) : models.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {models.map((model) => (
                                <ModelCard key={model.id} model={model} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Box className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-400">{t('home.popular.empty')}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-hyt-darker">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                            {t('home.whyUs.title')}
                        </h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            {t('home.whyUs.subtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-hyt-card border border-hyt-border rounded-2xl p-6 hover:border-hyt-accent/50 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-hyt-accent/20 to-hyt-purple/20 flex items-center justify-center mb-4">
                                    <feature.icon className="w-6 h-6 text-hyt-accent" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-gray-400 text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
                        {t('home.cta.title')}
                    </h2>
                    <p className="text-xl text-gray-400 mb-8">
                        {t('home.cta.description')}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="btn-primary text-lg px-8 py-4">
                            {t('home.cta.registerButton')}
                        </Link>
                        <Link to="/models" className="btn-ghost text-lg px-8 py-4">
                            {t('home.cta.exploreButton')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}