import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import {
    Menu, X, ShoppingCart, User, LogOut, Settings,
    LayoutDashboard, Package, ChevronDown,
    Upload, FileText, MessageCircle, ExternalLink,
    Bell, Check, CheckCheck, Trash2, AlertTriangle,
    CheckCircle, Info, XCircle
} from 'lucide-react'
import { notificationsAPI } from '../services/api'

// Icônes selon le type de notification
const NOTIFICATION_ICONS = {
    REPORT_RESOLVED: AlertTriangle,
    REPORT_DISMISSED: CheckCircle,
    REPORT_REVIEWED: Info,
    PRODUCT_APPROVED: CheckCircle,
    PRODUCT_REJECTED: XCircle,
    SALE: Package,
    default: Bell
}

const NOTIFICATION_COLORS = {
    REPORT_RESOLVED: 'text-orange-500 bg-orange-500/20',
    REPORT_DISMISSED: 'text-green-500 bg-green-500/20',
    REPORT_REVIEWED: 'text-blue-500 bg-blue-500/20',
    PRODUCT_APPROVED: 'text-green-500 bg-green-500/20',
    PRODUCT_REJECTED: 'text-red-500 bg-red-500/20',
    SALE: 'text-hyt-accent bg-hyt-accent/20',
    default: 'text-gray-400 bg-gray-500/20'
}

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [notifMenuOpen, setNotifMenuOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const { user, isAuthenticated, logout, isCreator, isStaff, isAdmin } = useAuth()
    const { itemCount } = useCart()
    const navigate = useNavigate()
    const notifRef = useRef(null)

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

        if (minutes < 1) return "À l'instant"
        if (minutes < 60) return `Il y a ${minutes}m`
        if (hours < 24) return `Il y a ${hours}h`
        return `Il y a ${days}j`
    }

    const handleLogout = () => {
        logout()
        navigate('/')
        setUserMenuOpen(false)
    }

    const navLinks = [
        { to: '/models', label: 'Produits', external: false },
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
                                        `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                            isActive
                                                ? 'text-hyt-accent bg-hyt-accent/10'
                                                : 'text-gray-400 hover:text-white hover:bg-hyt-card'
                                        }`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            )
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                {/* Upload Button for Creators */}
                                {isCreator() && (
                                    <Link
                                        to="/upload"
                                        className="flex items-center gap-2 px-4 py-2 text-hyt-accent border border-hyt-accent/30 rounded-lg hover:bg-hyt-accent/10 transition-all"
                                    >
                                        <Upload className="w-4 h-4" />
                                        <span className="font-medium">Upload</span>
                                    </Link>
                                )}

                                {/* Notifications */}
                                <div className="relative" ref={notifRef}>
                                    <button
                                        onClick={() => {
                                            setNotifMenuOpen(!notifMenuOpen)
                                            setUserMenuOpen(false)
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
                                                <h3 className="font-semibold text-white">Notifications</h3>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={handleMarkAllAsRead}
                                                        className="text-xs text-hyt-accent hover:underline flex items-center gap-1"
                                                    >
                                                        <CheckCheck className="w-3 h-3" />
                                                        Tout marquer lu
                                                    </button>
                                                )}
                                            </div>

                                            {/* Notifications List */}
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="px-4 py-8 text-center">
                                                        <Bell className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                                                        <p className="text-gray-500 text-sm">Aucune notification</p>
                                                    </div>
                                                ) : (
                                                    notifications.slice(0, 10).map((notif) => {
                                                        const Icon = NOTIFICATION_ICONS[notif.type] || NOTIFICATION_ICONS.default
                                                        const colorClass = NOTIFICATION_COLORS[notif.type] || NOTIFICATION_COLORS.default

                                                        return (
                                                            <div
                                                                key={notif.id}
                                                                className={`px-4 py-3 border-b border-hyt-border/50 hover:bg-hyt-dark/50 transition-colors ${
                                                                    !notif.is_read ? 'bg-hyt-accent/5' : ''
                                                                }`}
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
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            {formatTimeAgo(notif.created_at)}
                                                                        </p>
                                                                    </div>
                                                                    <div className="flex flex-col gap-1">
                                                                        {!notif.is_read && (
                                                                            <button
                                                                                onClick={() => handleMarkAsRead(notif.id)}
                                                                                className="p-1 text-gray-500 hover:text-hyt-accent transition-colors"
                                                                                title="Marquer comme lu"
                                                                            >
                                                                                <Check className="w-4 h-4" />
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={() => handleDeleteNotification(notif.id)}
                                                                            className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                                                                            title="Supprimer"
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
                                                        Voir toutes les notifications
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
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-hyt-card transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center">
                                            <span className="text-sm font-bold text-white">
                                                {user?.username?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-white">{user?.username}</span>
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown */}
                                    {userMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-56 py-2 bg-hyt-card border border-hyt-border rounded-xl shadow-xl animate-fade-in">
                                            <div className="px-4 py-2 border-b border-hyt-border">
                                                <p className="text-sm font-medium text-white">{user?.username}</p>
                                                <p className="text-xs text-gray-500">{user?.email}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-hyt-accent/10 text-hyt-accent rounded-full">
                                                    {user?.role}
                                                </span>
                                            </div>

                                            <div className="py-2">
                                                {/* Dashboard - Seulement pour Créateurs et Staff */}
                                                {(isCreator() || isStaff()) && (
                                                    <Link
                                                        to="/dashboard"
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-hyt-border/50 hover:text-white transition-colors"
                                                    >
                                                        <LayoutDashboard className="w-4 h-4" />
                                                        Dashboard
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
                                                        Devenir créateur
                                                    </Link>
                                                )}

                                                <Link
                                                    to="/purchases"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-hyt-border/50 hover:text-white transition-colors"
                                                >
                                                    <Package className="w-4 h-4" />
                                                    Mes achats
                                                </Link>

                                                <Link
                                                    to="/invoices"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-hyt-border/50 hover:text-white transition-colors"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    Factures
                                                </Link>

                                                {isStaff() && (
                                                    <Link
                                                        to="/admin"
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-hyt-border/50 hover:text-white transition-colors"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                        Administration
                                                    </Link>
                                                )}
                                            </div>

                                            <div className="border-t border-hyt-border pt-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Déconnexion
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-ghost">
                                    Connexion
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Inscription
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
                                        `block px-4 py-3 rounded-lg font-medium transition-all ${
                                            isActive
                                                ? 'text-hyt-accent bg-hyt-accent/10'
                                                : 'text-gray-400 hover:text-white hover:bg-hyt-border/50'
                                        }`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            )
                        ))}

                        {isAuthenticated ? (
                            <>
                                {/* Notifications Mobile */}
                                <Link
                                    to="/notifications"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-between px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-hyt-border/50"
                                >
                                    <span className="flex items-center gap-2">
                                        <Bell className="w-4 h-4" />
                                        Notifications
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
                                    <span>Panier</span>
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
                                        className="block px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-hyt-border/50"
                                    >
                                        Dashboard
                                    </Link>
                                )}

                                {/* Devenir créateur Mobile - Seulement pour les non-créateurs */}
                                {!isCreator() && !isStaff() && (
                                    <Link
                                        to="/become-creator"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-3 text-hyt-accent hover:bg-hyt-accent/10 rounded-lg"
                                    >
                                        Devenir créateur
                                    </Link>
                                )}

                                <Link
                                    to="/purchases"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-hyt-border/50"
                                >
                                    Mes achats
                                </Link>

                                <Link
                                    to="/invoices"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-hyt-border/50"
                                >
                                    Factures
                                </Link>

                                {isStaff() && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-4 py-3 text-gray-400 hover:text-white rounded-lg hover:bg-hyt-border/50"
                                    >
                                        Administration
                                    </Link>
                                )}

                                <button
                                    onClick={() => {
                                        handleLogout()
                                        setMobileMenuOpen(false)
                                    }}
                                    className="w-full px-4 py-3 text-left text-red-400 rounded-lg hover:bg-red-500/10"
                                >
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <div className="pt-4 space-y-2 border-t border-hyt-border">
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full text-center btn-secondary"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block w-full text-center btn-primary"
                                >
                                    Inscription
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}