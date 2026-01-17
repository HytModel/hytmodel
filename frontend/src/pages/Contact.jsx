import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Mail, MessageSquare, Send, Loader2, ArrowLeft,
    MapPin, Clock, ExternalLink, MessageCircle, HelpCircle
} from 'lucide-react'
import { useTranslation } from '../context/LanguageContext'
import toast from 'react-hot-toast'

export default function Contact() {
    const { t } = useTranslation()
    const [sending, setSending] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
            toast.error(t('contact.errors.requiredFields'))
            return
        }

        setSending(true)

        try {
            // Simuler l'envoi - À remplacer par ton API
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Option 1: Envoyer via ton backend
            // await contactAPI.send(formData)

            // Option 2: Ouvrir le client email
            const mailtoLink = `mailto:contact@hytmodel.com?subject=${encodeURIComponent(formData.subject || 'Contact depuis HytModel')}&body=${encodeURIComponent(`Nom: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`
            window.location.href = mailtoLink

            toast.success(t('contact.success'))
            setFormData({ name: '', email: '', subject: '', message: '' })
        } catch (error) {
            toast.error(t('contact.errors.sendFailed'))
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('contact.backToHome')}
                </Link>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="font-display text-4xl font-bold text-white mb-4">
                        {t('contact.title')}
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        {t('contact.subtitle')}
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Formulaire */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2"
                    >
                        <form onSubmit={handleSubmit} className="bg-hyt-card border border-hyt-border rounded-xl p-6 space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        {t('contact.form.name')} *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder={t('contact.form.namePlaceholder')}
                                        className="input-field w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        {t('contact.form.email')} *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder={t('contact.form.emailPlaceholder')}
                                        className="input-field w-full"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    {t('contact.form.subject')}
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder={t('contact.form.subjectPlaceholder')}
                                    className="input-field w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    {t('contact.form.message')} *
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder={t('contact.form.messagePlaceholder')}
                                    rows={6}
                                    className="input-field w-full resize-none"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={sending}
                                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {t('contact.form.sending')}
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        {t('contact.form.send')}
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* Sidebar - Infos de contact */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Email */}
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-hyt-accent/20 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-hyt-accent" />
                                </div>
                                <h3 className="font-semibold text-white">{t('contact.info.email')}</h3>
                            </div>
                            <a
                                href="mailto:contact@hytmodel.com"
                                className="text-hyt-accent hover:underline"
                            >
                                contact@hytmodel.com
                            </a>
                        </div>

                        {/* Discord */}
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-[#5865F2]/20 flex items-center justify-center">
                                    <MessageCircle className="w-5 h-5 text-[#5865F2]" />
                                </div>
                                <h3 className="font-semibold text-white">Discord</h3>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">
                                {t('contact.info.discordDesc')}
                            </p>
                            <a
                                href="https://discord.gg/hytmodel"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[#5865F2] hover:underline"
                            >
                                {t('contact.info.joinDiscord')}
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>

                        {/* Horaires */}
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-green-400" />
                                </div>
                                <h3 className="font-semibold text-white">{t('contact.info.responseTime')}</h3>
                            </div>
                            <p className="text-gray-400 text-sm">
                                {t('contact.info.responseTimeDesc')}
                            </p>
                        </div>

                        {/* Aide */}
                        <div className="bg-hyt-accent/10 border border-hyt-accent/30 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <HelpCircle className="w-5 h-5 text-hyt-accent" />
                                <h3 className="font-semibold text-white">{t('contact.info.needHelp')}</h3>
                            </div>
                            <p className="text-gray-400 text-sm mb-3">
                                {t('contact.info.needHelpDesc')}
                            </p>
                            <Link
                                to="/help"
                                className="text-hyt-accent hover:underline text-sm"
                            >
                                {t('contact.info.viewFaq')} →
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}