import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Cookie, Mail, MessageCircle, Settings, BarChart3, Shield, Target, Check, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../context/LanguageContext'

export default function Cookies() {
    const { t } = useTranslation()
    const lastUpdate = "13 janvier 2025"

    const [preferences, setPreferences] = useState({
        necessary: true,
        functional: true,
        analytics: false,
        marketing: false
    })

    const cookieTypes = [
        {
            id: 'necessary',
            icon: Shield,
            required: true,
            cookies: [
                { name: 'session_id', purpose: 'Session', duration: 'Session' },
                { name: 'csrf_token', purpose: 'CSRF protection', duration: 'Session' },
                { name: 'cookie_consent', purpose: 'Cookie preferences', duration: '12 months' }
            ]
        },
        {
            id: 'functional',
            icon: Settings,
            required: false,
            cookies: [
                { name: 'theme', purpose: 'Theme preference', duration: '12 months' },
                { name: 'recent_views', purpose: 'Recent history', duration: '30 days' },
                { name: 'cart', purpose: 'Shopping cart', duration: '7 days' }
            ]
        },
        {
            id: 'analytics',
            icon: BarChart3,
            required: false,
            cookies: [
                { name: '_ga', purpose: 'Google Analytics', duration: '2 years' },
                { name: '_gid', purpose: 'Google Analytics', duration: '24 hours' },
                { name: '_gat', purpose: 'Rate limiting', duration: '1 minute' }
            ]
        },
        {
            id: 'marketing',
            icon: Target,
            required: false,
            cookies: [
                { name: '_fbp', purpose: 'Facebook tracking', duration: '3 months' },
                { name: 'fr', purpose: 'Facebook ads', duration: '3 months' }
            ]
        }
    ]

    const togglePreference = (id) => {
        if (id === 'necessary') return
        setPreferences(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const acceptAll = () => setPreferences({ necessary: true, functional: true, analytics: true, marketing: true })
    const rejectAll = () => setPreferences({ necessary: true, functional: false, analytics: false, marketing: false })

    return (
        <div className="min-h-screen bg-hyt-dark pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-hyt-accent/10 mb-6">
                        <Cookie className="w-8 h-8 text-hyt-accent" />
                    </div>
                    <h1 className="text-4xl font-display font-bold text-white mb-4">{t('legal.cookies.title')}</h1>
                    <p className="text-gray-400">{t('legal.lastUpdate')} : {lastUpdate}</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">

                    {/* Qu'est-ce qu'un cookie */}
                    <div className="bg-hyt-card border border-hyt-border rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">{t('legal.cookies.whatIs.title')}</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">{t('legal.cookies.whatIs.p1')}</p>
                        <p className="text-gray-300 leading-relaxed">{t('legal.cookies.whatIs.p2')}</p>
                    </div>

                    {/* Pourquoi */}
                    <div className="bg-hyt-card border border-hyt-border rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">{t('legal.cookies.why.title')}</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">{t('legal.cookies.why.p1')}</p>
                        <ul className="text-gray-300 space-y-2 ml-4">
                            {['reason1', 'reason2', 'reason3', 'reason4'].map(key => (
                                <li key={key}>• <strong className="text-white">{t(`legal.cookies.why.${key}`)}</strong> {t(`legal.cookies.why.${key}Desc`)}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Types de cookies */}
                    <div className="bg-hyt-card border border-hyt-border rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">{t('legal.cookies.types.title')}</h2>

                        <div className="space-y-6">
                            {cookieTypes.map((type) => {
                                const Icon = type.icon
                                const isEnabled = preferences[type.id]

                                return (
                                    <div key={type.id} className="border border-hyt-border rounded-xl overflow-hidden">
                                        <div className="bg-hyt-darker p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isEnabled ? 'bg-hyt-accent/20' : 'bg-gray-700/50'}`}>
                                                    <Icon className={`w-5 h-5 ${isEnabled ? 'text-hyt-accent' : 'text-gray-500'}`} />
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-semibold">{t(`legal.cookies.types.${type.id}.name`)}</h3>
                                                    {type.required && <span className="text-xs text-hyt-accent">{t('legal.cookies.types.necessary.required')}</span>}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => togglePreference(type.id)}
                                                disabled={type.required}
                                                className={`relative w-12 h-6 rounded-full transition-colors ${isEnabled ? 'bg-hyt-accent' : 'bg-gray-600'} ${type.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                            >
                                                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isEnabled ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        <div className="p-4">
                                            <p className="text-gray-400 text-sm mb-4">{t(`legal.cookies.types.${type.id}.description`)}</p>

                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                    <tr className="text-gray-500 border-b border-hyt-border/50">
                                                        <th className="text-left py-2 pr-4">{t('legal.cookies.types.cookieName')}</th>
                                                        <th className="text-left py-2 pr-4">{t('legal.cookies.types.cookiePurpose')}</th>
                                                        <th className="text-left py-2">{t('legal.cookies.types.cookieDuration')}</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {type.cookies.map((cookie, idx) => (
                                                        <tr key={idx} className="border-b border-hyt-border/30 last:border-0">
                                                            <td className="py-2 pr-4 text-white font-mono text-xs">{cookie.name}</td>
                                                            <td className="py-2 pr-4 text-gray-400">{cookie.purpose}</td>
                                                            <td className="py-2 text-gray-500">{cookie.duration}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-hyt-border">
                            <button onClick={acceptAll} className="flex items-center gap-2 px-6 py-3 bg-hyt-accent text-white rounded-lg hover:bg-hyt-accent/90 transition-colors">
                                <Check className="w-4 h-4" />
                                {t('legal.cookies.buttons.acceptAll')}
                            </button>
                            <button onClick={rejectAll} className="flex items-center gap-2 px-6 py-3 bg-hyt-darker text-gray-300 rounded-lg hover:bg-hyt-darker/70 transition-colors border border-hyt-border">
                                <X className="w-4 h-4" />
                                {t('legal.cookies.buttons.rejectAll')}
                            </button>
                        </div>
                    </div>

                    {/* Gestion des cookies */}
                    <div className="bg-hyt-card border border-hyt-border rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">{t('legal.cookies.manage.title')}</h2>

                        <h3 className="text-lg font-semibold text-white mt-6 mb-3">{t('legal.cookies.manage.platform')}</h3>
                        <p className="text-gray-300 leading-relaxed mb-4">{t('legal.cookies.manage.platformDesc')}</p>

                        <h3 className="text-lg font-semibold text-white mt-6 mb-3">{t('legal.cookies.manage.browser')}</h3>
                        <p className="text-gray-300 leading-relaxed mb-4">{t('legal.cookies.manage.browserDesc')}</p>
                        <ul className="text-gray-300 space-y-2 ml-4">
                            <li>• <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-hyt-accent hover:underline">Google Chrome</a></li>
                            <li>• <a href="https://support.mozilla.org/fr/kb/cookies-informations-sites-enregistrent" target="_blank" rel="noopener noreferrer" className="text-hyt-accent hover:underline">Mozilla Firefox</a></li>
                            <li>• <a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-hyt-accent hover:underline">Safari</a></li>
                            <li>• <a href="https://support.microsoft.com/fr-fr/microsoft-edge" target="_blank" rel="noopener noreferrer" className="text-hyt-accent hover:underline">Microsoft Edge</a></li>
                        </ul>

                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mt-6">
                            <p className="text-yellow-200 text-sm">
                                <strong>{t('legal.cookies.manage.warning')}</strong> {t('legal.cookies.manage.warningText')}
                            </p>
                        </div>
                    </div>

                    {/* Cookies tiers */}
                    <div className="bg-hyt-card border border-hyt-border rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">{t('legal.cookies.thirdParty.title')}</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">{t('legal.cookies.thirdParty.p1')}</p>
                        <ul className="text-gray-300 space-y-3 ml-4">
                            <li>
                                <strong className="text-white">Stripe :</strong> {t('legal.cookies.thirdParty.stripe')}
                                <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer" className="text-hyt-accent hover:underline ml-1">Privacy Policy</a>
                            </li>
                            <li>
                                <strong className="text-white">Google Analytics :</strong> {t('legal.cookies.thirdParty.analytics')}
                                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-hyt-accent hover:underline ml-1">Privacy Policy</a>
                            </li>
                        </ul>
                    </div>

                    {/* Mises à jour */}
                    <div className="bg-hyt-card border border-hyt-border rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">{t('legal.cookies.updates.title')}</h2>
                        <p className="text-gray-300 leading-relaxed">{t('legal.cookies.updates.p1')}</p>
                    </div>

                    {/* En savoir plus */}
                    <div className="bg-hyt-card border border-hyt-border rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">{t('legal.cookies.learnMore.title')}</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">{t('legal.cookies.learnMore.p1')}</p>
                        <ul className="text-gray-300 space-y-2 ml-4">
                            <li>• <a href="https://www.cnil.fr/fr/cookies-et-autres-traceurs" target="_blank" rel="noopener noreferrer" className="text-hyt-accent hover:underline">{t('legal.cookies.learnMore.cnilLink')}</a></li>
                            <li>• <Link to="/privacy" className="text-hyt-accent hover:underline">{t('legal.cookies.learnMore.privacyLink')}</Link></li>
                            <li>• <Link to="/terms" className="text-hyt-accent hover:underline">{t('legal.cookies.learnMore.termsLink')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="bg-hyt-card border border-hyt-border rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">{t('legal.contact')}</h2>
                        <p className="text-gray-300 leading-relaxed mb-4">{t('legal.contactText')}</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <a href="mailto:contact@hytstudio.com" className="flex items-center gap-3 p-4 bg-hyt-darker rounded-xl hover:bg-hyt-darker/70 transition-colors">
                                <Mail className="w-5 h-5 text-hyt-accent" />
                                <span className="text-gray-300">contact@hytstudio.com</span>
                            </a>
                            <a href="https://discord.gg/3VJQZ6sjRR" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-hyt-darker rounded-xl hover:bg-hyt-darker/70 transition-colors">
                                <MessageCircle className="w-5 h-5 text-hyt-accent" />
                                <span className="text-gray-300">{t('legal.discord')}</span>
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}