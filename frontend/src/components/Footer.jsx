import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Github, Twitter, Heart } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const footerLinks = {
        platform: [
            { to: '/models', label: 'Modèles' },
            { to: '/games', label: 'Jeux' },
            { to: '/register', label: 'Devenir créateur' },
        ],
        support: [
            { to: '/faq', label: 'FAQ' },
            { to: '/contact', label: 'Contact' },
            { to: '/help', label: 'Aide' },
        ],
        legal: [
            { to: '/terms', label: 'CGU' },
            { to: '/privacy', label: 'Confidentialité' },
            { to: '/cookies', label: 'Cookies' },
        ]
    }

    return (
        <footer className="bg-hyt-card border-t border-hyt-border mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo & Description */}
                    <div className="md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <img
                                src="/logo.png"
                                alt="HytModel"
                                className="h-20 w-auto"
                            />
                        </Link>
                        <p className="text-gray-400 text-sm mb-4">
                            La marketplace de modèles 3D premium pour vos projets gaming.
                        </p>
                        <div className="flex items-center gap-3">
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-hyt-accent transition-colors"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-hyt-accent transition-colors"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                            <a
                                href="mailto:contact@hytmodel.com"
                                className="p-2 text-gray-400 hover:text-hyt-accent transition-colors"
                            >
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Plateforme */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Plateforme</h3>
                        <ul className="space-y-2">
                            {footerLinks.platform.map(link => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Support</h3>
                        <ul className="space-y-2">
                            {footerLinks.support.map(link => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Légal */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Légal</h3>
                        <ul className="space-y-2">
                            {footerLinks.legal.map(link => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-hyt-border flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        © {currentYear} HytModel. Tous droits réservés.
                    </p>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                        Fait avec <Heart className="w-4 h-4 text-red-500" /> en France
                    </p>
                </div>
            </div>
        </footer>
    )
}