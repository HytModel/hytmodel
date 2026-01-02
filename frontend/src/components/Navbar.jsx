import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import {
    Menu, X, ShoppingCart, User, LogOut, Settings,
    LayoutDashboard, Package, ChevronDown,
    Upload, FileText
} from 'lucide-react'

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const { user, isAuthenticated, logout, isCreator, isStaff, isAdmin } = useAuth()
    const { itemCount } = useCart()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
        setUserMenuOpen(false)
    }

    const navLinks = [
        { to: '/models', label: 'Produits' },
        { to: '/games', label: 'Jeux' },
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
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
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
                        ))}

                        {isAuthenticated ? (
                            <>
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