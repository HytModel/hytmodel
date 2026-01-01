import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen pt-20 flex items-center justify-center">
            <div className="max-w-2xl mx-auto px-4 text-center">
                {/* 404 Animation */}
                <div className="relative mb-8">
                    <div className="text-[12rem] font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-hyt-accent to-hyt-purple leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 text-[12rem] font-display font-black text-hyt-accent/10 blur-3xl leading-none">
                        404
                    </div>
                </div>

                {/* Message */}
                <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                    Page introuvable
                </h1>
                <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                    Oups ! La page que vous recherchez semble avoir disparu dans une autre dimension.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/"
                        className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                        <Home className="w-5 h-5" />
                        Retour à l'accueil
                    </Link>
                    <Link
                        to="/models"
                        className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                        <Search className="w-5 h-5" />
                        Explorer les modèles
                    </Link>
                </div>

                {/* Back button */}
                <button
                    onClick={() => window.history.back()}
                    className="mt-6 text-gray-500 hover:text-hyt-accent transition-colors inline-flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Revenir en arrière
                </button>

                {/* Decorative elements */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hyt-accent/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-hyt-purple/5 rounded-full blur-3xl" />
                </div>
            </div>
        </div>
    )
}