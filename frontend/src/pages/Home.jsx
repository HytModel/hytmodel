import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Shield, Zap, Users, TrendingUp, Box } from 'lucide-react'
import { modelsAPI, gamesAPI } from '../services/api'
import ModelCard from '../components/ModelCard'
import Loading from '../components/Loading'

export default function Home() {
    const [models, setModels] = useState([])
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [modelsRes, gamesRes] = await Promise.all([
                modelsAPI.list(),
                gamesAPI.list()
            ])
            setModels(modelsRes.data.models?.slice(0, 8) || [])
            setGames(gamesRes.data.games?.slice(0, 6) || [])
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const features = [
        {
            icon: Shield,
            title: 'Qualité vérifiée',
            description: 'Chaque modèle est vérifié par notre équipe avant publication.'
        },
        {
            icon: Zap,
            title: 'Téléchargement instantané',
            description: 'Accédez à vos achats immédiatement après paiement.'
        },
        {
            icon: Users,
            title: 'Communauté active',
            description: 'Rejoignez des milliers de créateurs et acheteurs.'
        },
        {
            icon: TrendingUp,
            title: 'Revenus justes',
            description: 'Les créateurs gardent jusqu\'à 90% des ventes.'
        }
    ]

    const stats = [
        { value: '10K+', label: 'Modèles' },
        { value: '5K+', label: 'Créateurs' },
        { value: '50K+', label: 'Ventes' },
        { value: '4.9', label: 'Note moyenne' }
    ]

    return (
        <div className="page-enter">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 mesh-bg" />
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hyt-accent/10 rounded-full blur-3xl animate-float" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-hyt-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-hyt-card border border-hyt-border">
                        <Sparkles className="w-4 h-4 text-hyt-accent" />
                        <span className="text-sm text-gray-400">La marketplace 3D de référence</span>
                    </div>

                    <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                        Trouvez le modèle 3D
                        <br />
                        <span className="gradient-text">parfait pour votre projet</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl text-gray-400 mb-10">
                        Des milliers de modèles 3D premium créés par des artistes talentueux.
                        Qualité professionnelle, prix accessibles.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/models" className="btn-primary text-lg px-8 py-4">
                            Explorer les modèles
                            <ArrowRight className="inline-block ml-2 w-5 h-5" />
                        </Link>
                        <Link to="/register" className="btn-secondary text-lg px-8 py-4">
                            Devenir créateur
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-10 border-t border-hyt-border">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="font-display text-4xl font-bold gradient-text mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-gray-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Models */}
            <section className="py-20 bg-hyt-darker">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="font-display text-3xl font-bold text-white mb-2">
                                Modèles populaires
                            </h2>
                            <p className="text-gray-500">Les modèles les plus appréciés par notre communauté</p>
                        </div>
                        <Link to="/models" className="btn-ghost flex items-center gap-2">
                            Voir tout <ArrowRight className="w-4 h-4" />
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
                        <div className="text-center py-20">
                            <Box className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-500">Aucun modèle disponible pour le moment</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Games Section */}
            {games.length > 0 && (
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="font-display text-3xl font-bold text-white mb-4">
                                Parcourez par jeu
                            </h2>
                            <p className="text-gray-500 max-w-2xl mx-auto">
                                Trouvez des modèles adaptés à votre jeu préféré
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {games.map((game) => (
                                <Link
                                    key={game.id}
                                    to={`/games/${game.slug}`}
                                    className="card-hover text-center group"
                                >
                                    <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-hyt-accent/20 to-hyt-purple/20 flex items-center justify-center group-hover:shadow-glow transition-shadow">
                                        {game.icon_url ? (
                                            <img src={game.icon_url} alt={game.name} className="w-10 h-10 rounded-lg" />
                                        ) : (
                                            <span className="text-2xl font-bold text-hyt-accent">
                        {game.name.charAt(0)}
                      </span>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-white group-hover:text-hyt-accent transition-colors">
                                        {game.name}
                                    </h3>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Features */}
            <section className="py-20 bg-hyt-darker">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl font-bold text-white mb-4">
                            Pourquoi choisir HytModel ?
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Une plateforme pensée pour les créateurs et les acheteurs
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="card group">
                                <div className="w-12 h-12 mb-4 rounded-xl bg-hyt-accent/10 flex items-center justify-center group-hover:bg-hyt-accent/20 transition-colors">
                                    <feature.icon className="w-6 h-6 text-hyt-accent" />
                                </div>
                                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-500">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-hyt-accent/10 to-hyt-purple/10" />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="font-display text-4xl font-bold text-white mb-6">
                        Prêt à commencer ?
                    </h2>
                    <p className="text-xl text-gray-400 mb-8">
                        Rejoignez notre communauté et découvrez des milliers de modèles 3D.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="btn-primary text-lg px-8 py-4">
                            Créer un compte gratuitement
                        </Link>
                        <Link to="/models" className="btn-secondary text-lg px-8 py-4">
                            Parcourir les modèles
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}