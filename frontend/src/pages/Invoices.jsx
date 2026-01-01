import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    FileText,
    Download,
    Calendar,
    Euro,
    Search,
    Receipt,
    Loader2,
    ArrowUpRight,
    ArrowDownLeft
} from 'lucide-react'
import { invoicesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Invoices() {
    const { isCreator } = useAuth()
    const [buyerInvoices, setBuyerInvoices] = useState([])
    const [sellerInvoices, setSellerInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('buyer')
    const [downloading, setDownloading] = useState(null)

    useEffect(() => {
        loadInvoices()
    }, [])

    const loadInvoices = async () => {
        try {
            // Charger les factures acheteur
            const buyerRes = await invoicesAPI.getMine()
            setBuyerInvoices(buyerRes.data.invoices || [])

            // Charger les factures vendeur si créateur
            if (isCreator()) {
                try {
                    const sellerRes = await invoicesAPI.getSellerInvoices()
                    setSellerInvoices(sellerRes.data.invoices || [])
                } catch (e) {
                    console.log('No seller invoices')
                }
            }
        } catch (error) {
            console.error('Failed to load invoices:', error)
            toast.error('Erreur lors du chargement des factures')
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async (invoiceId, type = 'buyer') => {
        setDownloading(invoiceId)
        try {
            let response
            if (type === 'seller') {
                response = await invoicesAPI.downloadSeller(invoiceId)
            } else {
                response = await invoicesAPI.download(invoiceId)
            }

            // Créer un blob et télécharger
            const blob = new Blob([response.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `facture-${invoiceId}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast.success('Facture téléchargée')
        } catch (error) {
            console.error('Download failed:', error)
            toast.error('Erreur lors du téléchargement')
        } finally {
            setDownloading(null)
        }
    }

    const currentInvoices = activeTab === 'buyer' ? buyerInvoices : sellerInvoices

    const totalBuyer = buyerInvoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0) / 100
    const totalSeller = sellerInvoices.reduce((sum, inv) => sum + Number(inv.net_amount || 0), 0) / 100

    return (
        <div className="min-h-screen bg-hyt-dark py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-display font-bold text-white mb-2">
                        Mes Factures
                    </h1>
                    <p className="text-gray-400">
                        Consultez et téléchargez vos factures
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
                >
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-500/20 rounded-lg">
                                <ArrowUpRight className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{totalBuyer.toFixed(2)} €</p>
                                <p className="text-sm text-gray-400">{buyerInvoices.length} factures d'achat</p>
                            </div>
                        </div>
                    </div>

                    {isCreator() && (
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-500/20 rounded-lg">
                                    <ArrowDownLeft className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{totalSeller.toFixed(2)} €</p>
                                    <p className="text-sm text-gray-400">{sellerInvoices.length} notes de paiement</p>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Tabs */}
                {isCreator() && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-2 mb-6"
                    >
                        <button
                            onClick={() => setActiveTab('buyer')}
                            className={`px-6 py-3 rounded-lg font-medium transition-all ${
                                activeTab === 'buyer'
                                    ? 'bg-hyt-accent text-black'
                                    : 'bg-hyt-card text-gray-400 hover:text-white'
                            }`}
                        >
              <span className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" />
                Mes achats
              </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('seller')}
                            className={`px-6 py-3 rounded-lg font-medium transition-all ${
                                activeTab === 'seller'
                                    ? 'bg-green-500 text-black'
                                    : 'bg-hyt-card text-gray-400 hover:text-white'
                            }`}
                        >
              <span className="flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4" />
                Mes ventes
              </span>
                        </button>
                    </motion.div>
                )}

                {/* Invoices List */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-hyt-card border border-hyt-border rounded-xl p-6 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-hyt-dark rounded-lg" />
                                    <div className="flex-1">
                                        <div className="h-5 bg-hyt-dark rounded w-1/3 mb-2" />
                                        <div className="h-4 bg-hyt-dark rounded w-1/4" />
                                    </div>
                                    <div className="h-10 bg-hyt-dark rounded w-32" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : currentInvoices.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <Receipt className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                            Aucune facture
                        </h3>
                        <p className="text-gray-400">
                            {activeTab === 'buyer'
                                ? "Vous n'avez pas encore effectué d'achat"
                                : "Vous n'avez pas encore réalisé de vente"
                            }
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                    >
                        {currentInvoices.map((invoice, index) => (
                            <motion.div
                                key={invoice.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * index }}
                                className="bg-hyt-card border border-hyt-border rounded-xl p-6 hover:border-hyt-accent/30 transition-colors"
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        activeTab === 'buyer' ? 'bg-hyt-accent/20' : 'bg-green-500/20'
                                    }`}>
                                        <FileText className={`w-6 h-6 ${
                                            activeTab === 'buyer' ? 'text-hyt-accent' : 'text-green-500'
                                        }`} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-white">
                                            {invoice.invoice_number}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                          {new Date(invoice.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                          })}
                      </span>
                                            <span className="flex items-center gap-1">
                        <Euro className="w-4 h-4" />
                                                {activeTab === 'buyer'
                                                    ? `${(Number(invoice.total_amount) / 100).toFixed(2)} €`
                                                    : `${(Number(invoice.net_amount) / 100).toFixed(2)} € net`
                                                }
                      </span>
                                            {activeTab === 'seller' && (
                                                <span className="text-gray-500">
                          (Brut: {(Number(invoice.gross_amount) / 100).toFixed(2)} € - Commission: {(Number(invoice.commission_amount) / 100).toFixed(2)} €)
                        </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Download */}
                                    <button
                                        onClick={() => handleDownload(invoice.id, activeTab)}
                                        disabled={downloading === invoice.id}
                                        className="btn-primary py-2 px-4 flex items-center gap-2"
                                    >
                                        {downloading === invoice.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Download className="w-4 h-4" />
                                        )}
                                        Télécharger PDF
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    )
}