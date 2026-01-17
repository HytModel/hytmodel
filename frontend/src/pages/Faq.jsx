import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    HelpCircle, ChevronDown, Search, ShoppingCart, CreditCard,
    Download, User, Mail, ArrowLeft, Palette,
    Gift, FileText, AlertTriangle, MessageCircle,
    ExternalLink, Globe, Star
} from 'lucide-react'
import { useTranslation } from '../context/LanguageContext'

// Composant FAQ Item
function FaqItem({ question, answer, isOpen, onClick }) {
    return (
        <div className="border border-hyt-border rounded-lg overflow-hidden">
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between p-4 text-left bg-hyt-card hover:bg-hyt-card/80 transition-colors"
            >
                <span className="font-medium text-white pr-4">{question}</span>
                <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="p-4 bg-hyt-darker text-gray-400 text-sm leading-relaxed border-t border-hyt-border whitespace-pre-line">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function Faq() {
    const { t } = useTranslation()
    const [searchQuery, setSearchQuery] = useState('')
    const [openItems, setOpenItems] = useState({})
    const [activeCategory, setActiveCategory] = useState('all')

    const toggleItem = (id) => {
        setOpenItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    // Catégories FAQ
    const categories = [
        { id: 'all', label: t('faq.categories.all'), icon: HelpCircle },
        { id: 'general', label: t('faq.categories.general'), icon: Globe },
        { id: 'account', label: t('faq.categories.account'), icon: User },
        { id: 'purchase', label: t('faq.categories.purchase'), icon: ShoppingCart },
        { id: 'download', label: t('faq.categories.download'), icon: Download },
        { id: 'creator', label: t('faq.categories.creator'), icon: Palette },
        { id: 'custom', label: t('faq.categories.custom'), icon: Star },
        { id: 'bundle', label: t('faq.categories.bundle'), icon: Gift },
        { id: 'payment', label: t('faq.categories.payment'), icon: CreditCard },
        { id: 'legal', label: t('faq.categories.legal'), icon: FileText },
    ]

    // Questions FAQ
    const faqItems = [
        // Général
        { id: 'general-1', category: 'general', question: t('faq.questions.general.whatIs.q'), answer: t('faq.questions.general.whatIs.a') },
        { id: 'general-2', category: 'general', question: t('faq.questions.general.productTypes.q'), answer: t('faq.questions.general.productTypes.a') },
        { id: 'general-3', category: 'general', question: t('faq.questions.general.whichGames.q'), answer: t('faq.questions.general.whichGames.a') },
        { id: 'general-4', category: 'general', question: t('faq.questions.general.languages.q'), answer: t('faq.questions.general.languages.a') },

        // Compte
        { id: 'account-1', category: 'account', question: t('faq.questions.account.create.q'), answer: t('faq.questions.account.create.a') },
        { id: 'account-2', category: 'account', question: t('faq.questions.account.forgotPassword.q'), answer: t('faq.questions.account.forgotPassword.a') },
        { id: 'account-3', category: 'account', question: t('faq.questions.account.modifyInfo.q'), answer: t('faq.questions.account.modifyInfo.a') },
        { id: 'account-4', category: 'account', question: t('faq.questions.account.delete.q'), answer: t('faq.questions.account.delete.a') },
        { id: 'account-5', category: 'account', question: t('faq.questions.account.suspended.q'), answer: t('faq.questions.account.suspended.a') },

        // Achats
        { id: 'purchase-1', category: 'purchase', question: t('faq.questions.purchase.howToBuy.q'), answer: t('faq.questions.purchase.howToBuy.a') },
        { id: 'purchase-2', category: 'purchase', question: t('faq.questions.purchase.paymentMethods.q'), answer: t('faq.questions.purchase.paymentMethods.a') },
        { id: 'purchase-3', category: 'purchase', question: t('faq.questions.purchase.paymentFailed.q'), answer: t('faq.questions.purchase.paymentFailed.a') },
        { id: 'purchase-4', category: 'purchase', question: t('faq.questions.purchase.invoice.q'), answer: t('faq.questions.purchase.invoice.a') },
        { id: 'purchase-5', category: 'purchase', question: t('faq.questions.purchase.promoCode.q'), answer: t('faq.questions.purchase.promoCode.a') },

        // Téléchargement
        { id: 'download-1', category: 'download', question: t('faq.questions.download.howTo.q'), answer: t('faq.questions.download.howTo.a') },
        { id: 'download-2', category: 'download', question: t('faq.questions.download.limit.q'), answer: t('faq.questions.download.limit.a') },
        { id: 'download-3', category: 'download', question: t('faq.questions.download.formats.q'), answer: t('faq.questions.download.formats.a') },
        { id: 'download-4', category: 'download', question: t('faq.questions.download.notWorking.q'), answer: t('faq.questions.download.notWorking.a') },
        { id: 'download-5', category: 'download', question: t('faq.questions.download.corrupted.q'), answer: t('faq.questions.download.corrupted.a') },

        // Créateurs
        { id: 'creator-1', category: 'creator', question: t('faq.questions.creator.becomeSeller.q'), answer: t('faq.questions.creator.becomeSeller.a') },
        { id: 'creator-2', category: 'creator', question: t('faq.questions.creator.commissions.q'), answer: t('faq.questions.creator.commissions.a') },
        { id: 'creator-3', category: 'creator', question: t('faq.questions.creator.uploadProduct.q'), answer: t('faq.questions.creator.uploadProduct.a') },
        { id: 'creator-4', category: 'creator', question: t('faq.questions.creator.whenPaid.q'), answer: t('faq.questions.creator.whenPaid.a') },
        { id: 'creator-5', category: 'creator', question: t('faq.questions.creator.becomeAffiliated.q'), answer: t('faq.questions.creator.becomeAffiliated.a') },
        { id: 'creator-6', category: 'creator', question: t('faq.questions.creator.aiProducts.q'), answer: t('faq.questions.creator.aiProducts.a') },

        // Sur mesure
        { id: 'custom-1', category: 'custom', question: t('faq.questions.custom.whatIs.q'), answer: t('faq.questions.custom.whatIs.a') },
        { id: 'custom-2', category: 'custom', question: t('faq.questions.custom.howToOrder.q'), answer: t('faq.questions.custom.howToOrder.a') },
        { id: 'custom-3', category: 'custom', question: t('faq.questions.custom.whoCanRespond.q'), answer: t('faq.questions.custom.whoCanRespond.a') },
        { id: 'custom-4', category: 'custom', question: t('faq.questions.custom.payment.q'), answer: t('faq.questions.custom.payment.a') },
        { id: 'custom-5', category: 'custom', question: t('faq.questions.custom.commission.q'), answer: t('faq.questions.custom.commission.a') },
        { id: 'custom-6', category: 'custom', question: t('faq.questions.custom.notSatisfied.q'), answer: t('faq.questions.custom.notSatisfied.a') },

        // Bundles
        { id: 'bundle-1', category: 'bundle', question: t('faq.questions.bundle.whatIs.q'), answer: t('faq.questions.bundle.whatIs.a') },
        { id: 'bundle-2', category: 'bundle', question: t('faq.questions.bundle.worthIt.q'), answer: t('faq.questions.bundle.worthIt.a') },
        { id: 'bundle-3', category: 'bundle', question: t('faq.questions.bundle.alreadyOwn.q'), answer: t('faq.questions.bundle.alreadyOwn.a') },
        { id: 'bundle-4', category: 'bundle', question: t('faq.questions.bundle.createBundle.q'), answer: t('faq.questions.bundle.createBundle.a') },

        // Paiements
        { id: 'payment-1', category: 'payment', question: t('faq.questions.payment.secure.q'), answer: t('faq.questions.payment.secure.a') },
        { id: 'payment-2', category: 'payment', question: t('faq.questions.payment.stripeConnect.q'), answer: t('faq.questions.payment.stripeConnect.a') },
        { id: 'payment-3', category: 'payment', question: t('faq.questions.payment.currency.q'), answer: t('faq.questions.payment.currency.a') },
        { id: 'payment-4', category: 'payment', question: t('faq.questions.payment.installments.q'), answer: t('faq.questions.payment.installments.a') },

        // Légal
        { id: 'legal-1', category: 'legal', question: t('faq.questions.legal.refund.q'), answer: t('faq.questions.legal.refund.a') },
        { id: 'legal-2', category: 'legal', question: t('faq.questions.legal.license.q'), answer: t('faq.questions.legal.license.a') },
        { id: 'legal-3', category: 'legal', question: t('faq.questions.legal.gdpr.q'), answer: t('faq.questions.legal.gdpr.a') },
        { id: 'legal-4', category: 'legal', question: t('faq.questions.legal.whereLegal.q'), answer: t('faq.questions.legal.whereLegal.a') },
        { id: 'legal-5', category: 'legal', question: t('faq.questions.legal.dispute.q'), answer: t('faq.questions.legal.dispute.a') },
    ]

    // Filtrer les FAQ
    const filteredFaq = faqItems.filter(item => {
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory
        const matchesSearch = searchQuery === '' ||
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('faq.backToHome')}
                </Link>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center mx-auto mb-6">
                        <HelpCircle className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="font-display text-4xl font-bold text-white mb-4">
                        {t('faq.title')}
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        {t('faq.subtitle')}
                    </p>
                </motion.div>

                {/* Recherche */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('faq.searchPlaceholder')}
                            className="input-field w-full pl-12 py-4 text-lg"
                        />
                    </div>
                </motion.div>

                {/* Catégories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap gap-2 mb-8"
                >
                    {categories.map((cat) => {
                        const Icon = cat.icon
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                    activeCategory === cat.id
                                        ? 'bg-hyt-accent text-black'
                                        : 'bg-hyt-card border border-hyt-border text-gray-400 hover:text-white hover:border-hyt-accent/50'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {cat.label}
                            </button>
                        )
                    })}
                </motion.div>

                {/* Compteur de résultats */}
                {searchQuery && (
                    <p className="text-gray-500 text-sm mb-4">
                        {t('faq.resultsCount', { count: filteredFaq.length })}
                    </p>
                )}

                {/* FAQ Items */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3 mb-12"
                >
                    {filteredFaq.length > 0 ? (
                        filteredFaq.map((item) => (
                            <FaqItem
                                key={item.id}
                                question={item.question}
                                answer={item.answer}
                                isOpen={openItems[item.id]}
                                onClick={() => toggleItem(item.id)}
                            />
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <p className="text-white font-medium mb-2">{t('faq.noResults')}</p>
                            <p className="text-gray-400 text-sm">{t('faq.noResultsHint')}</p>
                        </div>
                    )}
                </motion.div>

                {/* Contact Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-hyt-card border border-hyt-border rounded-xl p-8 text-center"
                >
                    <AlertTriangle className="w-12 h-12 text-hyt-accent mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">
                        {t('faq.needHelp.title')}
                    </h2>
                    <p className="text-gray-400 mb-6">
                        {t('faq.needHelp.description')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/contact"
                            className="btn-primary inline-flex items-center justify-center gap-2"
                        >
                            <Mail className="w-5 h-5" />
                            {t('faq.needHelp.contactUs')}
                        </Link>
                        <a
                            href="https://discord.gg/hytmodel"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary inline-flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            {t('faq.needHelp.joinDiscord')}
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}