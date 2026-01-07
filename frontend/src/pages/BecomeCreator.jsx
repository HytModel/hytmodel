import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
    Store, Upload, Link as LinkIcon, FileText, Send,
    CheckCircle, Clock, XCircle, AlertTriangle, Loader2,
    Instagram, Twitter, Youtube, Globe, ArrowLeft,
    Percent, DollarSign, Users, Star
} from 'lucide-react'
import { creatorRequestAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/LanguageContext'
import toast from 'react-hot-toast'

export default function BecomeCreator() {
    const navigate = useNavigate()
    const { user, loading, isCreator } = useAuth()
    const { t } = useTranslation()

    const [pageLoading, setPageLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [existingRequest, setExistingRequest] = useState(null)

    // Form state
    const [message, setMessage] = useState('')
    const [portfolioUrl, setPortfolioUrl] = useState('')
    const [portfolioDescription, setPortfolioDescription] = useState('')
    const [experience, setExperience] = useState('')
    const [socialLinks, setSocialLinks] = useState({
        twitter: '',
        instagram: '',
        youtube: '',
        website: ''
    })

    useEffect(() => {
        // Attendre que le chargement soit terminé
        if (loading) return

        // Si pas connecté, rediriger vers login
        if (!user) {
            navigate('/login', { state: { from: '/become-creator' } })
            return
        }

        // Si déjà créateur, rediriger vers dashboard
        if (isCreator()) {
            navigate('/dashboard')
            return
        }

        checkExistingRequest()
    }, [user, loading])

    const checkExistingRequest = async () => {
        try {
            const { data } = await creatorRequestAPI.getMyRequest()
            if (data.request) {
                setExistingRequest(data.request)
            }
        } catch (error) {
            // Pas de demande existante, c'est OK
        } finally {
            setPageLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!message.trim()) {
            toast.error(t('becomeCreator.errors.presentRequired'))
            return
        }

        if (!portfolioDescription.trim()) {
            toast.error(t('becomeCreator.errors.workDescriptionRequired'))
            return
        }

        setSubmitting(true)

        try {
            await creatorRequestAPI.request({
                message: message.trim(),
                portfolioUrl: portfolioUrl.trim() || null,
                portfolioDescription: portfolioDescription.trim(),
                experience: experience.trim() || null,
                socialLinks: Object.fromEntries(
                    Object.entries(socialLinks).filter(([_, v]) => v.trim())
                )
            })

            toast.success(t('becomeCreator.success.requestSent'))
            checkExistingRequest()
        } catch (error) {
            toast.error(error.response?.data?.error || t('becomeCreator.errors.sendFailed'))
        } finally {
            setSubmitting(false)
        }
    }

    if (loading || pageLoading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
            </div>
        )
    }

    // Si une demande existe déjà
    // Mais si la demande est APPROVED et l'utilisateur n'est plus créateur, afficher le formulaire
    if (existingRequest && !(existingRequest.status === 'APPROVED' && user?.role === 'USER')) {
        return (
            <div className="min-h-screen pt-20">
                <div className="max-w-2xl mx-auto px-4 py-12">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('becomeCreator.backToHome')}
                    </Link>

                    <div className="bg-hyt-card border border-hyt-border rounded-2xl p-8 text-center">
                        {existingRequest.status === 'PENDING' ? (
                            <>
                                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-8 h-8 text-yellow-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {t('becomeCreator.status.pendingTitle')}
                                </h2>
                                <p className="text-gray-400 mb-4">
                                    {t('becomeCreator.status.pendingDescription', { date: new Date(existingRequest.created_at).toLocaleDateString('fr-FR') })}
                                </p>
                                <p className="text-gray-500 text-sm">
                                    {t('becomeCreator.status.pendingHint')}
                                </p>
                            </>
                        ) : existingRequest.status === 'APPROVED' ? (
                            <>
                                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {t('becomeCreator.status.approvedTitle')}
                                </h2>
                                <p className="text-gray-400 mb-6">
                                    {t('becomeCreator.status.approvedDescription')}
                                </p>
                                <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
                                    <Store className="w-5 h-5" />
                                    {t('becomeCreator.status.goToDashboard')}
                                </Link>
                            </>
                        ) : existingRequest.status === 'REJECTED' ? (
                            <>
                                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                    <XCircle className="w-8 h-8 text-red-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {t('becomeCreator.status.rejectedTitle')}
                                </h2>
                                <p className="text-gray-400 mb-4">
                                    {t('becomeCreator.status.rejectedDescription')}
                                </p>
                                {existingRequest.rejection_reason && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
                                        <p className="text-sm text-red-400 font-medium mb-1">{t('becomeCreator.status.reason')} :</p>
                                        <p className="text-red-300">{existingRequest.rejection_reason}</p>
                                    </div>
                                )}
                                <p className="text-gray-500 text-sm mb-6">
                                    {t('becomeCreator.status.rejectedHint')}
                                </p>
                                <button
                                    onClick={() => setExistingRequest(null)}
                                    className="btn-primary inline-flex items-center gap-2"
                                >
                                    <Send className="w-5 h-5" />
                                    {t('becomeCreator.status.newRequest')}
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('becomeCreator.backToHome')}
                </Link>

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center mx-auto mb-6">
                        <Store className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="font-display text-4xl font-bold text-white mb-4">
                        {t('becomeCreator.title')}
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        {t('becomeCreator.subtitle')}
                    </p>
                </div>

                {/* Types de vendeurs */}
                <div className="grid md:grid-cols-3 gap-4 mb-12">
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{t('becomeCreator.types.nonAffiliated.title')}</h3>
                                <p className="text-xs text-gray-500">{t('becomeCreator.types.nonAffiliated.subtitle')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <Percent className="w-4 h-4 text-hyt-accent" />
                            <span className="text-2xl font-bold text-white">85%</span>
                            <span className="text-gray-400 text-sm">{t('becomeCreator.types.ofRevenue')}</span>
                        </div>
                        <p className="text-gray-500 text-sm">
                            {t('becomeCreator.types.commission', { percent: '15' })}
                        </p>
                    </div>

                    <div className="bg-hyt-card border border-hyt-accent/50 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-hyt-accent text-black text-xs font-bold rounded">
                            {t('becomeCreator.types.popular')}
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-hyt-accent/20 flex items-center justify-center">
                                <Star className="w-5 h-5 text-hyt-accent" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{t('becomeCreator.types.affiliated.title')}</h3>
                                <p className="text-xs text-gray-500">{t('becomeCreator.types.affiliated.subtitle')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <Percent className="w-4 h-4 text-hyt-accent" />
                            <span className="text-2xl font-bold text-hyt-accent">90%</span>
                            <span className="text-gray-400 text-sm">{t('becomeCreator.types.ofRevenue')}</span>
                        </div>
                        <p className="text-gray-500 text-sm">
                            {t('becomeCreator.types.commission', { percent: '10' })}
                        </p>
                    </div>

                    <div className="bg-hyt-card border border-purple-500/50 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{t('becomeCreator.types.hytStudio.title')}</h3>
                                <p className="text-xs text-gray-500">{t('becomeCreator.types.hytStudio.subtitle')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <Percent className="w-4 h-4 text-purple-400" />
                            <span className="text-2xl font-bold text-purple-400">100%</span>
                            <span className="text-gray-400 text-sm">{t('becomeCreator.types.forPlatform')}</span>
                        </div>
                        <p className="text-gray-500 text-sm">
                            {t('becomeCreator.types.hytStudio.description')}
                        </p>
                    </div>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Présentation */}
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            {t('becomeCreator.form.presentYourself')} *
                        </h3>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={t('becomeCreator.form.presentPlaceholder')}
                            rows={4}
                            className="input-field w-full resize-none"
                            required
                        />
                    </div>

                    {/* Portfolio */}
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            {t('becomeCreator.form.yourPortfolio')} *
                        </h3>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                {t('becomeCreator.form.portfolioUrlLabel')}
                            </label>
                            <div className="relative">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="url"
                                    value={portfolioUrl}
                                    onChange={(e) => setPortfolioUrl(e.target.value)}
                                    placeholder="https://votre-portfolio.com"
                                    className="input-field w-full pl-12"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                {t('becomeCreator.form.workDescriptionLabel')} *
                            </label>
                            <textarea
                                value={portfolioDescription}
                                onChange={(e) => setPortfolioDescription(e.target.value)}
                                placeholder={t('becomeCreator.form.workDescriptionPlaceholder')}
                                rows={4}
                                className="input-field w-full resize-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                {t('becomeCreator.form.experienceLabel')}
                            </label>
                            <textarea
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                placeholder={t('becomeCreator.form.experiencePlaceholder')}
                                rows={3}
                                className="input-field w-full resize-none"
                            />
                        </div>
                    </div>

                    {/* Réseaux sociaux */}
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            {t('becomeCreator.form.socialNetworks')}
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="relative">
                                <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="url"
                                    value={socialLinks.twitter}
                                    onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
                                    placeholder="Twitter / X"
                                    className="input-field w-full pl-12"
                                />
                            </div>
                            <div className="relative">
                                <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="url"
                                    value={socialLinks.instagram}
                                    onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
                                    placeholder="Instagram"
                                    className="input-field w-full pl-12"
                                />
                            </div>
                            <div className="relative">
                                <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="url"
                                    value={socialLinks.youtube}
                                    onChange={(e) => setSocialLinks(prev => ({ ...prev, youtube: e.target.value }))}
                                    placeholder="YouTube"
                                    className="input-field w-full pl-12"
                                />
                            </div>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="url"
                                    value={socialLinks.website}
                                    onChange={(e) => setSocialLinks(prev => ({ ...prev, website: e.target.value }))}
                                    placeholder={t('becomeCreator.form.website')}
                                    className="input-field w-full pl-12"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-hyt-accent/10 border border-hyt-accent/30 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-hyt-accent flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="text-hyt-accent font-medium mb-1">
                                    {t('becomeCreator.important.title')}
                                </p>
                                <p className="text-gray-400">
                                    {t('becomeCreator.important.description')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t('becomeCreator.form.sending')}
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                {t('becomeCreator.form.submit')}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}