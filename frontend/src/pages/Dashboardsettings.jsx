import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Settings, CreditCard, CheckCircle, XCircle, Clock,
    ExternalLink, Loader2, ArrowLeft, Shield, Bell,
    User, Store, ChevronRight, AlertTriangle, Wallet,
    RefreshCw, Building, FileText
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/LanguageContext'
import { stripeAPI } from '../services/api'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'

export default function DashboardSettings() {
    const { user, refreshUser } = useAuth()
    const { t } = useTranslation()
    const [loading, setLoading] = useState(true)
    const [connectingStripe, setConnectingStripe] = useState(false)
    const [openingDashboard, setOpeningDashboard] = useState(false)
    const [refreshingStatus, setRefreshingStatus] = useState(false)

    // Statut Stripe
    const [stripeStatus, setStripeStatus] = useState({
        connected: false,
        onboarded: false,
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false
    })

    useEffect(() => {
        fetchStripeStatus()
    }, [])

    const fetchStripeStatus = async () => {
        try {
            if (user?.stripe_account_id) {
                const { data } = await stripeAPI.getConnectStatus()
                setStripeStatus({
                    connected: data.connected || false,
                    onboarded: data.onboarded || false,
                    charges_enabled: data.charges_enabled || false,
                    payouts_enabled: data.payouts_enabled || false,
                    details_submitted: data.details_submitted || false
                })
            }
        } catch (error) {
            console.error('Failed to fetch Stripe status:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRefreshStatus = async () => {
        setRefreshingStatus(true)
        try {
            await fetchStripeStatus()
            await refreshUser()
            toast.success(t('dashboardSettings.toast.statusUpdated'))
        } catch (error) {
            toast.error(t('dashboardSettings.toast.updateError'))
        } finally {
            setRefreshingStatus(false)
        }
    }

    const handleConnectStripe = async () => {
        setConnectingStripe(true)
        try {
            const { data } = await stripeAPI.createConnectAccount()
            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            toast.error(t('dashboardSettings.toast.stripeConnectError'))
        } finally {
            setConnectingStripe(false)
        }
    }

    const handleOpenStripeDashboard = async () => {
        setOpeningDashboard(true)
        try {
            const { data } = await stripeAPI.getDashboardLink()
            if (data.url) {
                window.open(data.url, '_blank')
            }
        } catch (error) {
            toast.error(t('dashboardSettings.toast.dashboardError'))
        } finally {
            setOpeningDashboard(false)
        }
    }

    if (loading) {
        return <Loading fullScreen />
    }

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/dashboard" className="p-2 rounded-lg bg-hyt-card hover:bg-hyt-border transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
                            <Settings className="w-7 h-7 text-hyt-accent" />
                            {t('dashboardSettings.title')}
                        </h1>
                        <p className="text-gray-500">{t('dashboardSettings.subtitle')}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Section Stripe Connect */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                    <CreditCard className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">{t('dashboardSettings.stripe.title')}</h2>
                                    <p className="text-sm text-gray-500">{t('dashboardSettings.stripe.subtitle')}</p>
                                </div>
                            </div>

                            {user?.stripe_account_id && (
                                <button
                                    onClick={handleRefreshStatus}
                                    disabled={refreshingStatus}
                                    className="p-2 rounded-lg bg-hyt-darker hover:bg-hyt-border transition-colors"
                                    title={t('dashboardSettings.stripe.refreshStatus')}
                                >
                                    <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshingStatus ? 'animate-spin' : ''}`} />
                                </button>
                            )}
                        </div>

                        {/* Pas de compte Stripe */}
                        {!user?.stripe_account_id ? (
                            <div className="bg-hyt-darker rounded-xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-white mb-1">{t('dashboardSettings.stripe.notConnected.title')}</h3>
                                        <p className="text-gray-400 text-sm mb-4">
                                            {t('dashboardSettings.stripe.notConnected.description')}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                {t('dashboardSettings.stripe.notConnected.feature1')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                {t('dashboardSettings.stripe.notConnected.feature2')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                {t('dashboardSettings.stripe.notConnected.feature3')}
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleConnectStripe}
                                            disabled={connectingStripe}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            {connectingStripe ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <CreditCard className="w-4 h-4" />
                                            )}
                                            {connectingStripe ? t('dashboardSettings.stripe.connecting') : t('dashboardSettings.stripe.connect')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Statut du compte */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                    <div className={`p-4 rounded-xl ${stripeStatus.details_submitted ? 'bg-green-500/10 border border-green-500/30' : 'bg-hyt-darker'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {stripeStatus.details_submitted ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-gray-500" />
                                            )}
                                            <span className="font-medium text-white">{t('dashboardSettings.stripe.status.information')}</span>
                                        </div>
                                        <p className={`text-sm ${stripeStatus.details_submitted ? 'text-green-400' : 'text-gray-500'}`}>
                                            {stripeStatus.details_submitted ? t('dashboardSettings.stripe.status.completed') : t('dashboardSettings.stripe.status.pending')}
                                        </p>
                                    </div>

                                    <div className={`p-4 rounded-xl ${stripeStatus.charges_enabled ? 'bg-green-500/10 border border-green-500/30' : 'bg-hyt-darker'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {stripeStatus.charges_enabled ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-gray-500" />
                                            )}
                                            <span className="font-medium text-white">{t('dashboardSettings.stripe.status.payments')}</span>
                                        </div>
                                        <p className={`text-sm ${stripeStatus.charges_enabled ? 'text-green-400' : 'text-gray-500'}`}>
                                            {stripeStatus.charges_enabled ? t('dashboardSettings.stripe.status.enabled') : t('dashboardSettings.stripe.status.disabled')}
                                        </p>
                                    </div>

                                    <div className={`p-4 rounded-xl ${stripeStatus.payouts_enabled ? 'bg-green-500/10 border border-green-500/30' : 'bg-hyt-darker'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {stripeStatus.payouts_enabled ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-gray-500" />
                                            )}
                                            <span className="font-medium text-white">{t('dashboardSettings.stripe.status.payouts')}</span>
                                        </div>
                                        <p className={`text-sm ${stripeStatus.payouts_enabled ? 'text-green-400' : 'text-gray-500'}`}>
                                            {stripeStatus.payouts_enabled ? t('dashboardSettings.stripe.status.enabled') : t('dashboardSettings.stripe.status.disabled')}
                                        </p>
                                    </div>
                                </div>

                                {/* Message de statut global */}
                                {stripeStatus.onboarded ? (
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-green-400">{t('dashboardSettings.stripe.configured.title')}</p>
                                                <p className="text-sm text-gray-400">
                                                    {t('dashboardSettings.stripe.configured.description')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-6 h-6 text-orange-500 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="font-medium text-orange-400">{t('dashboardSettings.stripe.incomplete.title')}</p>
                                                <p className="text-sm text-gray-400">
                                                    {t('dashboardSettings.stripe.incomplete.description')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleConnectStripe}
                                                disabled={connectingStripe}
                                                className="btn-primary text-sm"
                                            >
                                                {connectingStripe ? t('common.loading') : t('dashboardSettings.stripe.continue')}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Infos compte */}
                                <div className="bg-hyt-darker rounded-xl p-4 mb-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">{t('dashboardSettings.stripe.accountId')}</p>
                                            <p className="font-mono text-white">{user.stripe_account_id}</p>
                                        </div>
                                        {stripeStatus.onboarded && (
                                            <button
                                                onClick={handleOpenStripeDashboard}
                                                disabled={openingDashboard}
                                                className="btn-ghost flex items-center gap-2"
                                            >
                                                {openingDashboard ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <ExternalLink className="w-4 h-4" />
                                                )}
                                                {t('dashboardSettings.stripe.dashboard')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Actions rapides */}
                                {stripeStatus.onboarded && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button
                                            onClick={handleOpenStripeDashboard}
                                            disabled={openingDashboard}
                                            className="flex items-center gap-4 p-4 rounded-xl bg-hyt-darker hover:bg-hyt-border transition-colors text-left"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <Wallet className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-white">{t('dashboardSettings.stripe.actions.viewPayments')}</p>
                                                <p className="text-sm text-gray-500">{t('dashboardSettings.stripe.actions.viewPaymentsDesc')}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-500" />
                                        </button>

                                        <button
                                            onClick={handleOpenStripeDashboard}
                                            disabled={openingDashboard}
                                            className="flex items-center gap-4 p-4 rounded-xl bg-hyt-darker hover:bg-hyt-border transition-colors text-left"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                                <Building className="w-5 h-5 text-purple-400" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-white">{t('dashboardSettings.stripe.actions.bankInfo')}</p>
                                                <p className="text-sm text-gray-500">{t('dashboardSettings.stripe.actions.bankInfoDesc')}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-500" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Section Commission */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">{t('dashboardSettings.commission.title')}</h2>
                                <p className="text-sm text-gray-500">{t('dashboardSettings.commission.subtitle')}</p>
                            </div>
                        </div>

                        <div className="bg-hyt-darker rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-400">{t('dashboardSettings.commission.accountType')}</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    user?.creator_type === 'HYTSTUDIO' ? 'bg-purple-500/20 text-purple-400' :
                                        user?.creator_type === 'AFFILIATED' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-gray-500/20 text-gray-400'
                                }`}>
                                    {user?.creator_type === 'HYTSTUDIO' ? 'HytStudio' :
                                        user?.creator_type === 'AFFILIATED' ? t('dashboardSettings.commission.types.affiliated') : t('dashboardSettings.commission.types.standard')}
                                </span>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-400">{t('dashboardSettings.commission.rate')}</span>
                                <span className="text-2xl font-bold text-white">
                                    {user?.creator_type === 'HYTSTUDIO' ? '0%' :
                                        user?.creator_type === 'AFFILIATED' ? '10%' : '15%'}
                                </span>
                            </div>

                            <p className="text-sm text-gray-500">
                                {user?.creator_type === 'HYTSTUDIO'
                                    ? t('dashboardSettings.commission.descriptions.hytstudio')
                                    : user?.creator_type === 'AFFILIATED'
                                        ? t('dashboardSettings.commission.descriptions.affiliated')
                                        : t('dashboardSettings.commission.descriptions.standard')}
                            </p>
                        </div>
                    </div>

                    {/* Liens rapides */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-white mb-4">{t('dashboardSettings.otherSettings.title')}</h2>

                        <div className="space-y-2">
                            <Link
                                to="/profile"
                                className="flex items-center gap-4 p-4 rounded-xl bg-hyt-darker hover:bg-hyt-border transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-hyt-accent/10 flex items-center justify-center">
                                    <User className="w-5 h-5 text-hyt-accent" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-white">{t('dashboardSettings.otherSettings.profile.title')}</p>
                                    <p className="text-sm text-gray-500">{t('dashboardSettings.otherSettings.profile.description')}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                            </Link>

                            <Link
                                to={`/seller/${user?.username}`}
                                className="flex items-center gap-4 p-4 rounded-xl bg-hyt-darker hover:bg-hyt-border transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                    <Store className="w-5 h-5 text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-white">{t('dashboardSettings.otherSettings.store.title')}</p>
                                    <p className="text-sm text-gray-500">{t('dashboardSettings.otherSettings.store.description')}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                            </Link>

                            <Link
                                to="/invoices"
                                className="flex items-center gap-4 p-4 rounded-xl bg-hyt-darker hover:bg-hyt-border transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-white">{t('dashboardSettings.otherSettings.invoices.title')}</p>
                                    <p className="text-sm text-gray-500">{t('dashboardSettings.otherSettings.invoices.description')}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}