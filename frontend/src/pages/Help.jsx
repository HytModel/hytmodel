import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    HelpCircle, ChevronDown, Search, ShoppingCart, CreditCard,
    Download, User, Shield, Mail, ArrowLeft, Package, Palette,
    RefreshCw, AlertTriangle, MessageCircle, ExternalLink
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
                        <div className="p-4 bg-hyt-darker text-gray-400 text-sm leading-relaxed border-t border-hyt-border">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function Help() {
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
        { id: 'all', label: t('help.categories.all'), icon: HelpCircle },
        { id: 'account', label: t('help.categories.account'), icon: User },
        { id: 'purchase', label: t('help.categories.purchase'), icon: ShoppingCart },
        { id: 'download', label: t('help.categories.download'), icon: Download },
        { id: 'creator', label: t('help.categories.creator'), icon: Palette },
        { id: 'payment', label: t('help.categories.payment'), icon: CreditCard },
    ]

    // Questions FAQ
    const faqItems = [
        // Compte
        {
            id: 'account-1',
            category: 'account',
            question: t('help.faq.account.createAccount.question'),
            answer: t('help.faq.account.createAccount.answer')
        },
        {
            id: 'account-2',
            category: 'account',
            question: t('help.faq.account.forgotPassword.question'),
            answer: t('help.faq.account.forgotPassword.answer')
        },
        {
            id: 'account-3',
            category: 'account',
            question: t('help.faq.account.changeEmail.question'),
            answer: t('help.faq.account.changeEmail.answer')
        },
        {
            id: 'account-4',
            category: 'account',
            question: t('help.faq.account.deleteAccount.question'),
            answer: t('help.faq.account.deleteAccount.answer')
        },
        // Achats
        {
            id: 'purchase-1',
            category: 'purchase',
            question: t('help.faq.purchase.howToBuy.question'),
            answer: t('help.faq.purchase.howToBuy.answer')
        },
        {
            id: 'purchase-2',
            category: 'purchase',
            question: t('help.faq.purchase.paymentMethods.question'),
            answer: t('help.faq.purchase.paymentMethods.answer')
        },
        {
            id: 'purchase-3',
            category: 'purchase',
            question: t('help.faq.purchase.refund.question'),
            answer: t('help.faq.purchase.refund.answer')
        },
        {
            id: 'purchase-4',
            category: 'purchase',
            question: t('help.faq.purchase.invoice.question'),
            answer: t('help.faq.purchase.invoice.answer')
        },
        // Téléchargement
        {
            id: 'download-1',
            category: 'download',
            question: t('help.faq.download.howToDownload.question'),
            answer: t('help.faq.download.howToDownload.answer')
        },
        {
            id: 'download-2',
            category: 'download',
            question: t('help.faq.download.downloadLimit.question'),
            answer: t('help.faq.download.downloadLimit.answer')
        },
        {
            id: 'download-3',
            category: 'download',
            question: t('help.faq.download.fileFormat.question'),
            answer: t('help.faq.download.fileFormat.answer')
        },
        {
            id: 'download-4',
            category: 'download',
            question: t('help.faq.download.cantDownload.question'),
            answer: t('help.faq.download.cantDownload.answer')
        },
        // Créateur
        {
            id: 'creator-1',
            category: 'creator',
            question: t('help.faq.creator.becomeCreator.question'),
            answer: t('help.faq.creator.becomeCreator.answer')
        },
        {
            id: 'creator-2',
            category: 'creator',
            question: t('help.faq.creator.commission.question'),
            answer: t('help.faq.creator.commission.answer')
        },
        {
            id: 'creator-3',
            category: 'creator',
            question: t('help.faq.creator.customOrders.question'),
            answer: t('help.faq.creator.customOrders.answer')
        },
        {
            id: 'creator-4',
            category: 'creator',
            question: t('help.faq.creator.uploadProduct.question'),
            answer: t('help.faq.creator.uploadProduct.answer')
        },
        // Paiement
        {
            id: 'payment-1',
            category: 'payment',
            question: t('help.faq.payment.whenPaid.question'),
            answer: t('help.faq.payment.whenPaid.answer')
        },
        {
            id: 'payment-2',
            category: 'payment',
            question: t('help.faq.payment.stripeConnect.question'),
            answer: t('help.faq.payment.stripeConnect.answer')
        },
        {
            id: 'payment-3',
            category: 'payment',
            question: t('help.faq.payment.paymentFailed.question'),
            answer: t('help.faq.payment.paymentFailed.answer')
        },
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
                    {t('help.backToHome')}
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
                        {t('help.title')}
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        {t('help.subtitle')}
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
                            placeholder={t('help.searchPlaceholder')}
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
                            <p className="text-gray-400">{t('help.noResults')}</p>
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
                        {t('help.stillNeedHelp.title')}
                    </h2>
                    <p className="text-gray-400 mb-6">
                        {t('help.stillNeedHelp.description')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/contact"
                            className="btn-primary inline-flex items-center justify-center gap-2"
                        >
                            <Mail className="w-5 h-5" />
                            {t('help.stillNeedHelp.contactUs')}
                        </Link>
                        <a
                            href="https://discord.gg/hytmodel"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary inline-flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-5 h-5" />
                            {t('help.stillNeedHelp.joinDiscord')}
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}