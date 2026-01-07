import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { XCircle, ShoppingCart, ArrowRight, RefreshCw } from 'lucide-react'
import { useTranslation } from '../context/LanguageContext'

export default function Cancel() {
    const { t } = useTranslation()

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-xl w-full text-center"
            >
                {/* Cancel Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/20 mb-6"
                >
                    <XCircle className="w-12 h-12 text-red-500" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                        {t('cancel.title')}
                    </h1>
                    <p className="text-gray-400 text-lg mb-8">
                        {t('cancel.description')}
                    </p>
                </motion.div>

                {/* Info Box */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-hyt-card border border-hyt-border rounded-2xl p-6 mb-8"
                >
                    <h2 className="text-lg font-semibold text-white mb-3">
                        {t('cancel.problemTitle')}
                    </h2>
                    <p className="text-gray-400 text-sm">
                        {t('cancel.problemDescription')}
                    </p>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <Link
                        to="/cart"
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {t('cancel.backToCart')}
                    </Link>
                    <Link
                        to="/models"
                        className="btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                        {t('cancel.continueShopping')}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>

                {/* Retry hint */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-8 text-sm text-gray-500 flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    {t('cancel.retryHint')}
                </motion.p>
            </motion.div>
        </div>
    )
}