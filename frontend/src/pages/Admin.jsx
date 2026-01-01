import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Users,
    Package,
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    Ban,
    UserCheck,
    Trash2,
    Eye,
    Search,
    Filter,
    ChevronRight,
    Loader2,
    BarChart3,
    Gamepad2,
    Tag,
    Layers
} from 'lucide-react'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'

// Composant Stats Card
function StatCard({ title, value, icon: Icon, color, trend }) {
    return (
        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-400 text-sm mb-1">{title}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {trend > 0 ? '+' : ''}{trend}% vs mois dernier
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    )
}

// Dashboard Overview
function AdminOverview() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            const { data } = await adminAPI.getDashboardStats()
            setStats(data)
        } catch (error) {
            console.error('Failed to load stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Vue d'ensemble</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Revenus totaux"
                    value={`${((stats?.totalRevenue || 0) / 100).toFixed(2)} €`}
                    icon={DollarSign}
                    color="bg-green-500/20 text-green-500"
                />
                <StatCard
                    title="Commission plateforme"
                    value={`${((stats?.platformCommission || 0) / 100).toFixed(2)} €`}
                    icon={TrendingUp}
                    color="bg-hyt-accent/20 text-hyt-accent"
                />
                <StatCard
                    title="Ventes"
                    value={stats?.salesCount || 0}
                    icon={Package}
                    color="bg-hyt-purple/20 text-hyt-purple"
                />
                <StatCard
                    title="Vendeurs actifs"
                    value={stats?.sellersCount || 0}
                    icon={Users}
                    color="bg-yellow-500/20 text-yellow-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Actions rapides</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            to="/admin/pending"
                            className="flex items-center gap-3 p-4 bg-hyt-dark rounded-lg hover:bg-hyt-dark/70 transition-colors"
                        >
                            <Clock className="w-5 h-5 text-yellow-500" />
                            <span className="text-white">Modèles en attente</span>
                        </Link>
                        <Link
                            to="/admin/users"
                            className="flex items-center gap-3 p-4 bg-hyt-dark rounded-lg hover:bg-hyt-dark/70 transition-colors"
                        >
                            <Users className="w-5 h-5 text-hyt-accent" />
                            <span className="text-white">Utilisateurs</span>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Activité récente</h3>
                    <p className="text-gray-400">Aucune activité récente</p>
                </div>
            </div>
        </div>
    )
}

// Pending Models
function PendingModels() {
    const [models, setModels] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(null)

    useEffect(() => {
        loadPendingModels()
    }, [])

    const loadPendingModels = async () => {
        try {
            const { data } = await adminAPI.getPendingModels()
            setModels(data || [])
        } catch (error) {
            console.error('Failed to load pending models:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (modelId) => {
        setProcessing(modelId)
        try {
            await adminAPI.approveModel(modelId)
            toast.success('Modèle approuvé')
            loadPendingModels()
        } catch (error) {
            toast.error('Erreur lors de l\'approbation')
        } finally {
            setProcessing(null)
        }
    }

    const handleReject = async (modelId) => {
        setProcessing(modelId)
        try {
            await adminAPI.rejectModel(modelId)
            toast.success('Modèle rejeté')
            loadPendingModels()
        } catch (error) {
            toast.error('Erreur lors du rejet')
        } finally {
            setProcessing(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Modèles en attente</h2>

            {models.length === 0 ? (
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-white font-medium">Aucun modèle en attente</p>
                    <p className="text-gray-400 text-sm mt-1">Tous les modèles ont été traités</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {models.map((model) => (
                        <div
                            key={model.id}
                            className="bg-hyt-card border border-hyt-border rounded-xl p-4 flex items-center gap-4"
                        >
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-hyt-dark flex-shrink-0">
                                {model.thumbnail_url ? (
                                    <img
                                        src={model.thumbnail_url}
                                        alt={model.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        <Package className="w-8 h-8" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-medium truncate">{model.title}</h3>
                                <p className="text-gray-400 text-sm">Par {model.creator_username}</p>
                                <p className="text-hyt-accent font-medium">
                                    {(model.price / 100).toFixed(2)} €
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    to={`/models/${model.id}`}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <Eye className="w-5 h-5" />
                                </Link>
                                <button
                                    onClick={() => handleApprove(model.id)}
                                    disabled={processing === model.id}
                                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {processing === model.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4" />
                                    )}
                                    Approuver
                                </button>
                                <button
                                    onClick={() => handleReject(model.id)}
                                    disabled={processing === model.id}
                                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Rejeter
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// Users Management
function UsersManagement() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('')

    useEffect(() => {
        loadUsers()
    }, [roleFilter])

    const loadUsers = async () => {
        try {
            const { data } = await adminAPI.getUsers({
                role: roleFilter || undefined,
                search: searchQuery || undefined
            })
            setUsers(data.users || data || [])
        } catch (error) {
            console.error('Failed to load users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        loadUsers()
    }

    const handleBan = async (userId, isBanned) => {
        try {
            if (isBanned) {
                await adminAPI.unbanUser(userId)
                toast.success('Utilisateur débanni')
            } else {
                await adminAPI.banUser(userId)
                toast.success('Utilisateur banni')
            }
            loadUsers()
        } catch (error) {
            toast.error('Erreur')
        }
    }

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminAPI.setRole(userId, newRole)
            toast.success('Rôle modifié')
            loadUsers()
        } catch (error) {
            toast.error('Erreur lors du changement de rôle')
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Gestion des utilisateurs</h2>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-12 w-full"
                        />
                    </div>
                </form>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="input-field w-full sm:w-48"
                >
                    <option value="">Tous les rôles</option>
                    <option value="USER">User</option>
                    <option value="CREATOR">Creator</option>
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>

            {/* Users List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-hyt-border">
                            <th className="text-left py-4 px-4 text-gray-400 font-medium">Utilisateur</th>
                            <th className="text-left py-4 px-4 text-gray-400 font-medium">Email</th>
                            <th className="text-left py-4 px-4 text-gray-400 font-medium">Rôle</th>
                            <th className="text-left py-4 px-4 text-gray-400 font-medium">Inscription</th>
                            <th className="text-right py-4 px-4 text-gray-400 font-medium">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b border-hyt-border/50 hover:bg-hyt-dark/30">
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center">
                                                <span className="text-sm font-bold text-white">
                                                    {user.username?.charAt(0).toUpperCase()}
                                                </span>
                                        </div>
                                        <span className="text-white font-medium">{user.username}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-gray-400">{user.email}</td>
                                <td className="py-4 px-4">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="bg-hyt-dark border border-hyt-border rounded-lg px-3 py-1 text-white text-sm"
                                    >
                                        <option value="USER">User</option>
                                        <option value="CREATOR">Creator</option>
                                        <option value="STAFF">Staff</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </td>
                                <td className="py-4 px-4 text-gray-400">
                                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <button
                                        onClick={() => handleBan(user.id, user.is_banned)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                            user.is_banned
                                                ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                                                : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                                        }`}
                                    >
                                        {user.is_banned ? 'Débannir' : 'Bannir'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

// Main Admin Component
export default function Admin() {
    const location = useLocation()

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { path: '/admin/pending', icon: Clock, label: 'En attente' },
        { path: '/admin/users', icon: Users, label: 'Utilisateurs' },
        { path: '/admin/sellers', icon: BarChart3, label: 'Vendeurs' },
        { path: '/admin/models', icon: Package, label: 'Modèles' },
    ]

    return (
        <div className="min-h-screen bg-hyt-dark pt-20">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <motion.aside
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:w-64 flex-shrink-0"
                    >
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-4 sticky top-24">
                            <h2 className="text-lg font-bold text-white mb-4 px-2">Administration</h2>
                            <nav className="space-y-1">
                                {navItems.map((item) => {
                                    const isActive = item.exact
                                        ? location.pathname === item.path
                                        : location.pathname.startsWith(item.path) && location.pathname !== '/admin'

                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                                isActive || (item.exact && location.pathname === '/admin')
                                                    ? 'bg-hyt-accent/20 text-hyt-accent'
                                                    : 'text-gray-400 hover:text-white hover:bg-hyt-dark/50'
                                            }`}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.label}</span>
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>
                    </motion.aside>

                    {/* Main Content */}
                    <motion.main
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex-1 min-w-0"
                    >
                        <Routes>
                            <Route index element={<AdminOverview />} />
                            <Route path="pending" element={<PendingModels />} />
                            <Route path="users" element={<UsersManagement />} />
                            <Route path="sellers" element={<div className="text-white">Stats vendeurs - à implémenter</div>} />
                            <Route path="models" element={<div className="text-white">Top modèles - à implémenter</div>} />
                        </Routes>
                    </motion.main>
                </div>
            </div>
        </div>
    )
}