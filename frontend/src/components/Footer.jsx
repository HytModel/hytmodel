import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Github, Twitter, Heart, MessageCircle } from 'lucide-react'
import { useTranslation } from '../context/LanguageContext'

export default function Footer() {
    const { t } = useTranslation()
    const currentYear = new Date().getFullYear()

    const footerLinks = {
        platform: [
            { to: '/models', label: t('footer.links.products') },
            { to: '/become-creator', label: t('footer.links.becomeCreator') },
        ],
        support: [
            { to: '/faq', label: t('footer.links.faq') },
            { to: '/contact', label: t('footer.links.contact') },
            { to: '/help', label: t('footer.links.help') },
        ],
        legal: [
            { to: '/terms', label: t('footer.links.terms') },
            { to: '/privacy', label: t('footer.links.privacy') },
            { to: '/cookies', label: t('footer.links.cookies') },
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
                            {t('footer.description')}
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
                                href="https://discord.gg/3VJQZ6sjRR"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-hyt-accent transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
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
                        <h3 className="text-white font-semibold mb-4">{t('footer.sections.platform')}</h3>
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
                        <h3 className="text-white font-semibold mb-4">{t('footer.sections.support')}</h3>
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
                        <h3 className="text-white font-semibold mb-4">{t('footer.sections.legal')}</h3>
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
                        © {currentYear} HytModel. {t('footer.allRightsReserved')}
                    </p>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                        {t('footer.madeWith')} <Heart className="w-4 h-4 text-red-500" /> {t('footer.inFrance')}
                    </p>
                </div>
            </div>
        </footer>
    )
}