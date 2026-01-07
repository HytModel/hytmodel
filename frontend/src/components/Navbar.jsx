import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useTranslation } from '../context/LanguageContext'
import {
    Menu, X, ShoppingCart, User, LogOut, Settings,
    LayoutDashboard, Package, ChevronDown,
    Upload, FileText, MessageCircle, ExternalLink,
    Bell, Check, CheckCheck, Trash2, AlertTriangle,
    CheckCircle, Info, XCircle, PenTool, Globe
} from 'lucide-react'
import { notificationsAPI } from '../services/api'

// Icônes selon le type de notification
const NOTIFICATION_ICONS = {
    REPORT_RESOLVED: AlertTriangle,
    REPORT_DISMISSED: CheckCircle,
    REPORT_REVIEWED: Info,
    PRODUCT_APPROVED: CheckCircle,
    PRODUCT_REJECTED: XCircle,
    PRODUCT_UPDATE: Package,
    SALE: Package,
    default: Bell
}

const NOTIFICATION_COLORS = {
    REPORT_RESOLVED: 'text-orange-500 bg-orange-500/20',
    REPORT_DISMISSED: 'text-green-500 bg-green-500/20',
    REPORT_REVIEWED: 'text-blue-500 bg-blue-500/20',
    PRODUCT_APPROVED: 'text-green-500 bg-green-500/20',
    PRODUCT_REJECTED: 'text-red-500 bg-red-500/20',
    PRODUCT_UPDATE: 'text-blue-500 bg-blue-500/20',
    SALE: 'text-hyt-accent bg-hyt-accent/20',
    default: 'text-gray-400 bg-gray-500/20'
}

// Langues disponibles
const LANGUAGES = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' }
]

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [notifMenuOpen, setNotifMenuOpen] = useState(false)
    const [langMenuOpen, setLangMenuOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const { user, isAuthenticated, logout, isCreator, isStaff, isAdmin } = useAuth()
    const { itemCount } = useCart()
    const { t, language, setLanguage } = useTranslation()
    const navigate = useNavigate()
    const notifRef = useRef(null)
    const langRef = useRef(null)

    // Charger les notifications
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications()
            // Rafraîchir toutes les 30 secondes
            const interval = setInterval(fetchNotifications, 30000)
            return () => clearInterval(interval)
        }
    }, [isAuthenticated])

    // Fermer le menu si on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setNotifMenuOpen(false)
            }
            if (langRef.current && !langRef.current.contains(event.target)) {
                setLangMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchNotifications = async () => {
        try {
            const { data } = await notificationsAPI.getAll()
            setNotifications(data.notifications || [])
            setUnreadCount(data.unreadCount || 0)
        } catch (error) {
            console.error('Failed to fetch notifications:', error)
        }
    }

    const handleMarkAsRead = async (id) => {
        try {
            await notificationsAPI.markAsRead(id)
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Failed to mark as read:', error)
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsAPI.markAllAsRead()
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error('Failed to mark all as read:', error)
        }
    }

    const handleDeleteNotification = async (id) => {
        try {
            await notificationsAPI.delete(id)
            setNotifications(prev => prev.filter(n => n.id !== id))
        } catch (error) {
            console.error('Failed to delete notification:', error)
        }
    }

    const formatTimeAgo = (date) => {
        const now = new Date()
        const diff = now - new Date(date)
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return t('nav.timeAgo.now')
        if (minutes < 60) return t('nav.timeAgo.minutes', { count: minutes })
        if (hours < 24) return t('nav.timeAgo.hours', { count: hours })
        return t('nav.timeAgo.days', { count: days })
    }

    const handleLogout = () => {
        logout()
        navigate('/')
        setUserMenuOpen(false)
    }

    const handleLanguageChange = (langCode) => {
        setLanguage(langCode)
        setLangMenuOpen(false)
    }

    const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0]

    const navLinks = [
        { to: '/models', label: t('nav.products'), external: false },
        { to: '/custom-orders', label: t('nav.customOrders'), external: false, icon: PenTool },
        { to: 'https://discord.gg/3VJQZ6sjRR', label: 'Discord', external: true },
    ]

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-hyt-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <img
                            src="/logo_navbar.png"
                            alt="HytModel"
                            className="h-12 w-auto group-hover:opacity-80 transition-opacity"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(link => (
                            link.external ? (
                                <a
                                    key={link.to}
                                    href={link.to}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-400 hover:text-white hover:bg-hyt-card"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    {link.label}
                                </a>
                            ) : (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                            isActive
                                                ? 'text-hyt-accent bg-hyt-accent/10'
                                                : 'text-gray-400 hover:text-white hover:bg-hyt-card'
                                        }`
                                    }
                                >
                                    {link.icon && <link.icon className="w-4 h-4" />}
                                    {link.label}
                                </NavLink>
                            )
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Language Selector */}
                        <div className="relative" ref={langRef}>
                            <button
                                onClick={() => {
                                    setLangMenuOpen(!langMenuOpen)
                                    setUserMenuOpen(false)
                                    setNotifMenuOpen(false)
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-hyt-card"
                            >
                                <Globe className="w-4 h-4" />
                                <span className="text-sm">{currentLang.flag}</span>
                                <ChevronDown className={`w-3 h-3 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {langMenuOpen && (
                                <div className="absolute right-0 mt-2 w-40 py-2 bg-hyt-card border border-hyt-border rounded-xl shadow-xl animate-fade-in">
                                    {LANGUAGES.map(lang => (
                                        <button
                                            key={lang.code}
                                            onClick={() => handleLanguageChange(lang.code)}
                                            className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                                                language === lang.code
                                                    ? 'text-hyt-accent bg-hyt-accent/10'
                                                    : 'text-gray-300 hover:bg-hyt-border/50 hover:text-white'
                                            }`}
                                        >
                                            <span>{lang.flag}</span>
                                            <span>{lang.label}</span>
                                            {language === lang.code && <Check className="w-4 h-4 ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {isAuthenticated ? (
                            <>
                                {/* Upload Button for Creators */}
                                {isCreator() && (
                                    <Link
                                        to="/upload"
                                        className="flex items-center gap-2 px-4 py-2 text-hyt-accent border border-hyt-accent/30 rounded-lg hover:bg-hyt-accent/10 transition-all"
                                    >
                                        <Upload className="w-4 h-4" />
                                        <span className="font-medium">{t('nav.upload')}</span>
                                    </Link>
                                )}

                                {/* Notifications */}
                                <div className="relative" ref={notifRef}>
                                    <button
                                        onClick={() => {
                                            setNotifMenuOpen(!notifMenuOpen)
                                            setUserMenuOpen(false)
                                            setLangMenuOpen(false)
                                        }}
                                        className="relative p-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Notifications Dropdown */}
                                    {notifMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-80 bg-hyt-card border border-hyt-border rounded-xl shadow-xl animate-fade-in overflow-hidden">
                                            {/* Header */}
                                            <div className="flex items-center justify-between px-4 py-3 border-b border-hyt-border">
                                                <h3 className="font-semibold text-white">{t('nav.notifications')}</h3>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={handleMarkAllAsRead}
                                                        className="text-xs text-hyt-accent hover:underline flex items-center gap-1"
                                                    >
                                                        <CheckCheck className="w-3 h-3" />
                                                        {t('nav.markAllRead')}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Notifications List */}
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="px-4 py-8 text-center">
                                                        <Bell className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                                                        <p className="text-gray-500 text-sm">{t('nav.noNotifications')}</p>
                                                    </div>
                                                ) : (
                                                    notifications.slice(0, 10).map((notif) => {
                                                        const Icon = NOTIFICATION_ICONS[notif.type] || NOTIFICATION_ICONS.default
                                                        const colorClass = NOTIFICATION_COLORS[notif.type] || NOTIFICATION_COLORS.default

                                                        // Extraire le lien depuis data si disponible
                                                        const notifLink = notif.data?.link || null

                                                        const handleNotifClick = () => {
                                                            if (!notif.is_read) {
                                                                handleMarkAsRead(notif.id)
                                                            }
                                                            if (notifLink) {
                                                                setNotifMenuOpen(false)
                                                                navigate(notifLink)
                                                            }
                                                        }

                                                        return (
                                                            <div
                                                                key={notif.id}
                                                                onClick={notifLink ? handleNotifClick : undefined}
                                                                className={`px-4 py-3 border-b border-hyt-border/50 hover:bg-hyt-dark/50 transition-colors ${
                                                                    !notif.is_read ? 'bg-hyt-accent/5' : ''
                                                                } ${notifLink ? 'cursor-pointer' : ''}`}
                                                            >
                                                                <div className="flex gap-3">
                                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                                                        <Icon className="w-4 h-4" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-white">
                                                                            {notif.title}
                                                                        </p>
                                                                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                                                                            {notif.message}
                                                                        </p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <p className="text-xs text-gray-500">
                                                                                {formatTimeAgo(notif.created_at)}
                                                                            </p>
                                                                            {notifLink && (
                                                                                <span className="text-xs text-hyt-accent flex items-center gap-1">
                                                                                    <ExternalLink className="w-3 h-3" />
                                                                                    {t('nav.view')}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                                                                        {!notif.is_read && (
                                                                            <button
                                                                                onClick={() => handleMarkAsRead(notif.id)}
                                                                                className="p-1 text-gray-500 hover:text-hyt-accent transition-colors"
                                                                                title={t('nav.markAsRead')}
                                                                            >
                                                                                <Check className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={() => handleDeleteNotification(notif.id)}
                                                                            className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                                                                            title={t('nav.delete')}
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                )}
                                            </div>

                                            {/* Footer */}
                                            {notifications.length > 10 && (
                                                <div className="px-4 py-2 border-t border-hyt-border text-center">
                                                    <Link
                                                        to="/notifications"
                                                        onClick={() => setNotifMenuOpen(false)}
                                                        className="text-sm text-hyt-accent hover:underline"
                                                    >
                                                        {t('nav.viewAllNotifications')}
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Cart */}
                                <Link to="/cart" className="relative p-2 text-gray-400 hover:text-white transition-colors">
                                    <ShoppingCart className="w-5 h-5" />
                                    {itemCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold bg-hyt-accent text-hyt-dark rounded-full">
                                            {itemCount}
                                        </span>
                                    )}
                                </Link>

                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setUserMenuOpen(!userMenuOpen)
                                            setNotifMenuOpen(false)
                                            setLangMenuOpen(false)
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-hyt-card transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center">
                                            {user?.avatar_url ? (
                                                <img
                                                    src={`http://localhost:3001${user.avatar_url}`}
                                                    alt={user.username}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm font-bold text-white">
                                                    {user?.username?.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-white">{user?.display_name || user?.username}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 py-2 bg-hyt-card border border-hyt-border rounded-xl shadow-xl animate-fade-in">
                                            {/* Header avec avatar */}
                                            <div className="px-4 py-3 border-b border-hyt-border">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center flex-shrink-0">
                                                        {user?.avatar_url ? (
                                                            <img
                                                                src={`http://localhost:3001${user.avatar_url}`}
                                                                alt={user.username}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-lg font-bold text-white">
                                                                {user?.username?.charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-white truncate">{user?.display_name || user?.username}</p>
                                                        <p className="text-xs text-gray-500 truncate">@{user?.username}</p>
                                                    </div>
                                                </div>
                                                <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-hyt-accent/10 text-hyt-accent rounded-full">
                                                    {user?.role}
                                                </span>
                                            </div>

                                            <div className="py-2">
                                                {/* Mon Profil */}
                                                <Link
                                                    to="/profile"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-hyt-border/50 hover:text-white transition-colors"
                                                >
                                                    <User className="w-4 h-4" />
                                                    {t('nav.myProfile')}
                                                </Link>

                                                {/* Dashboard - Seulement pour Créateurs et Staff */}
                                                {(isCreator() || isStaff()) && (
                                                    <Link
                                                        to="/dashboard"
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-hyt-border/50 hover:text-white transition-colors"
                                                    >
                                                        <LayoutDashboard className="w-4 h-4" />
                                                        {t('nav.dashboard')}
                                                    </Link>
                                                )}

                                                {/* Ma boutique - Seulement pour les Créateurs */}
                                                {isCreator() && (
                                                    <Link
                                                        to={`/seller/${user?.username}`}
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-hyt-border/50 hover:text-white transition-colors"
                                                    >
                                                        <Package className="w-4 h-4" />
                                                        {t('nav.myShop')}
                                                    </Link>
                                                )}

                                                {/* Devenir créateur - Seulement pour les utilisateurs non-créateurs */}
                                                {!isCreator() && !isStaff() && (
                                                    <Link
                                                        to="/become-creator"
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-hyt-accent hover:bg-hyt-accent/10 transition-colors"
                                                    >
                                                        <Upload className="w-4 h-4" />
                                                        {t('nav.becomeCreator')}
                                                    </Link>
                                                )}

                                                <Link
                                                    to="/purchases"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-hyt-border/50 hover:text-white transition-colors"
                                                >
                                                    <ShoppingCart className="w-4 h-4" />
                                                    {t('nav.myPurchases')}
                                                </Link>

                                                {/* Commandes sur mesure - AJOUTÉ */}
                                                <Link
                                                    to="/custom-orders"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-hyt-border/50 hover:text-white transition-colors"
                                                >
                                                    <PenTool className="w-4 h-4" />
                                                    {t('nav.customOrders')}
                                                </Link>

                                                <Link
                                                    to="/invoices"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-hyt-border/50 hover:text-white transition-colors"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    {t('nav.invoices')}
                                                </Link>

                                                {isStaff() && (
                                                    <Link
                                                        to="/admin"
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-hyt-border/50 hover:text-white transition-colors"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                        {t('nav.administration')}
                                                    </Link>
                                                )}
                                            </div>

                                            <div className="border-t border-hyt-border pt-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    {t('nav.logout')}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-ghost">
                                    {t('nav.login')}
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    {t('nav.register')}
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-400 hover:text-white"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-hyt-card border-t border-hyt-border animate-fade-in">
                    <div className="px-4 py-4 space-y-2">
                        {/* Language Selector Mobile */}
                        <div className="flex items-center justify-between px-4 py-3 bg-hyt-dark rounded-lg mb-2">
                            <span className="text-sm text-gray-400 flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                {t('nav.language')}
                            </span>
                            <div className="flex gap-2">
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang.code)}
                                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                            language === lang.code
                                                ? 'bg-hyt-accent text-black'
                                                : 'bg-hyt-border text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {lang.flag} {lang.code.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {navLinks.map(link => (
                            link.external ? (
                                <a
                                    key={link.to}
                                    href={link.to}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all text-gray-400 hover:text-white hover:bg-hyt-border/50"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    {link.label}
                                </a>
                            ) : (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                                            isActive
                                                ? 'text-hyt-accent bg-hyt-accent/10'
                                                : 'text-gray-400 hover:text-white hover:bg-hyt-border/50'
                                        }`
                                    }
                                >
                                    {link.icon && <link.icon className="w-4 h-4" />}
                                    {link.label}
                                </NavLink>
                            )
                        ))}

                        {isAuthenticated ? (
                            <>
                                {/* Header utilisateur mobile */}
                                <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-hyt-dark rounded-lg">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center flex-shrink-0">
                                        {user?.avatar_url ? (
                                            <img
                                                src={`http://localhost:3001${user.avatar_url}`}
                                                alt={user.username}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xl font-bold text-white">
                                                {user?.username?.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-white truncate">{user?.display_name || user?.username}</p>
                                        <p className="text-sm text-gray-500 truncate">@{user?.username}</p>
                                    </div>
                                </div>

                                {/* Mon Profil Mobile */}
                                <Link
                                    to="/profile"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-hyt-border/50"
                                >
                                    <User className="w-4 h-4" />
                                    {t('nav.myProfile')}
                                </Link>

                                {/* Notifications Mobile */}
                                <Link
                                    to="/notifications"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-hyt-border/50"
                                >
                                    <span className="flex items-center gap-2">
                                        <Bell className="w-4 h-4" />
                                        {t('nav.notifications')}
                                    </span>
                                    {unreadCount > 0 && (
                                        <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>

                                <Link
                                    to="/cart"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-hyt-border/50"
                                >
                                    <span className="flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4" />
                                        {t('nav.cart')}
                                    </span>
                                    {itemCount > 0 && (
                                        <span className="px-2 py-0.5 text-xs font-bold bg-hyt-accent text-hyt-dark rounded-full">
                                            {itemCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Dashboard Mobile - Seulement pour Créateurs et Staff */}
                                {(isCreator() || isStaff()) && (
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-hyt-border/50"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        {t('nav.dashboard')}
                                    </Link>
                                )}

                                {/* Ma boutique Mobile - Seulement pour les Créateurs */}
                                {isCreator() && (
                                    <Link
                                        to={`/seller/${user?.username}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-hyt-border/50"
                                    >
                                        <Package className="w-4 h-4" />
                                        {t('nav.myShop')}
                                    </Link>
                                )}

                                {/* Devenir créateur Mobile - Seulement pour les non-créateurs */}
                                {!isCreator() && !isStaff() && (
                                    <Link
                                        to="/become-creator"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-2 px-4 py-3 text-hyt-accent hover:bg-hyt-accent/10 rounded-lg"
                                    >
                                        <Upload className="w-4 h-4" />
                                        {t('nav.becomeCreator')}
                                    </Link>
                                )}

                                <Link
                                    to="/purchases"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-hyt-border/50"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    {t('nav.myPurchases')}
                                </Link>

                                {/* Commandes sur mesure Mobile - AJOUTÉ */}
                                <Link
                                    to="/custom-orders"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-hyt-border/50"
                                >
                                    <PenTool className="w-4 h-4" />
                                    {t('nav.customOrders')}
                                </Link>

                                <Link
                                    to="/invoices"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-hyt-border/50"
                                >
                                    <FileText className="w-4 h-4" />
                                    {t('nav.invoices')}
                                </Link>

                                {isStaff() && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-hyt-border/50"
                                    >
                                        <Settings className="w-4 h-4" />
                                        {t('nav.administration')}
                                    </Link>
                                )}

                                <button
                                    onClick={() => {
                                        handleLogout()
                                        setMobileMenuOpen(false)
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-left text-red-400 rounded-lg hover:bg-red-500/10"
                                >
                                    <LogOut className="w-4 h-4" />
                                    {t('nav.logout')}
                                </button>
                            </>
                        ) : (
                            <div className="pt-4 space-y-2 border-t border-hyt-border">
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full text-center btn-secondary"
                                >
                                    {t('nav.login')}
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full text-center btn-primary"
                                >
                                    {t('nav.register')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}