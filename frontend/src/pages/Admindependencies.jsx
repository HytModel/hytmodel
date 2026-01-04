import React, { useState, useEffect, useRef } from 'react'
import {
    Link2, Plus, Search, Loader2, Trash2, Edit2, X, Check,
    ExternalLink, Image as ImageIcon, AlertCircle, Filter,
    CheckCircle, XCircle, Clock, Gamepad2
} from 'lucide-react'
import { dependenciesAPI, gamesAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function AdminDependencies() {
    const [activeTab, setActiveTab] = useState('dependencies') // dependencies, proposals
    const [dependencies, setDependencies] = useState([])
    const [proposals, setProposals] = useState([])
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterGameId, setFilterGameId] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [pendingCount, setPendingCount] = useState(0)

    // Modal state
    const [showModal, setShowModal] = useState(false)
    const [editingDep, setEditingDep] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        websiteUrl: '',
        gameId: ''
    })
    const [logoFile, setLogoFile] = useState(null)
    const [logoPreview, setLogoPreview] = useState(null)
    const [saving, setSaving] = useState(false)

    const fileInputRef = useRef(null)

    useEffect(() => {
        loadGames()
        loadPendingCount()
    }, [])

    useEffect(() => {
        if (activeTab === 'dependencies') {
            loadDependencies()
        } else {
            loadProposals()
        }
    }, [activeTab, filterGameId, filterStatus])

    const loadGames = async () => {
        try {
            const { data } = await gamesAPI.getAll()
            setGames(data.games || data || [])
        } catch (error) {
            console.error('Failed to load games:', error)
        }
    }

    const loadDependencies = async () => {
        setLoading(true)
        try {
            const { data } = await dependenciesAPI.adminGetAll(filterGameId || null)
            setDependencies(data.dependencies || [])
        } catch (error) {
            console.error('Failed to load dependencies:', error)
            toast.error('Erreur de chargement')
        } finally {
            setLoading(false)
        }
    }

    const loadProposals = async () => {
        setLoading(true)
        try {
            const { data } = await dependenciesAPI.getProposals(filterStatus || null)
            setProposals(data.proposals || [])
        } catch (error) {
            console.error('Failed to load proposals:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadPendingCount = async () => {
        try {
            const { data } = await dependenciesAPI.getPendingCount()
            setPendingCount(data.count || 0)
        } catch (error) {
            console.error('Failed to load pending count:', error)
        }
    }

    const openCreateModal = () => {
        setEditingDep(null)
        setFormData({ name: '', description: '', websiteUrl: '', gameId: filterGameId || '' })
        setLogoFile(null)
        setLogoPreview(null)
        setShowModal(true)
    }

    const openEditModal = (dep) => {
        setEditingDep(dep)
        setFormData({
            name: dep.name,
            description: dep.description || '',
            websiteUrl: dep.website_url || '',
            gameId: dep.game_id
        })
        setLogoFile(null)
        setLogoPreview(dep.logo_url ? `http://localhost:3001${dep.logo_url}` : null)
        setShowModal(true)
    }

    const handleLogoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Logo trop volumineux (max 2MB)')
                return
            }
            setLogoFile(file)
            setLogoPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast.error('Nom requis')
            return
        }

        if (!formData.gameId) {
            toast.error('Jeu requis')
            return
        }

        setSaving(true)
        try {
            const fd = new FormData()
            fd.append('name', formData.name.trim())
            fd.append('description', formData.description)
            fd.append('websiteUrl', formData.websiteUrl)
            fd.append('gameId', formData.gameId)
            if (logoFile) {
                fd.append('logo', logoFile)
            }

            if (editingDep) {
                await dependenciesAPI.update(editingDep.id, fd)
                toast.success('Dépendance mise à jour')
            } else {
                await dependenciesAPI.create(fd)
                toast.success('Dépendance créée')
            }

            setShowModal(false)
            loadDependencies()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cette dépendance ? Les produits liés perdront cette association.')) return

        try {
            await dependenciesAPI.delete(id)
            toast.success('Dépendance supprimée')
            loadDependencies()
        } catch (error) {
            toast.error('Erreur')
        }
    }

    const handleApproveProposal = async (id) => {
        try {
            await dependenciesAPI.approveProposal(id)
            toast.success('Proposition approuvée')
            loadProposals()
            loadPendingCount()
            loadDependencies()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        }
    }

    const handleRejectProposal = async (id) => {
        const reason = prompt('Raison du refus (optionnel):')
        try {
            await dependenciesAPI.rejectProposal(id, reason)
            toast.success('Proposition refusée')
            loadProposals()
            loadPendingCount()
        } catch (error) {
            toast.error('Erreur')
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Link2 className="w-7 h-7 text-hyt-accent" />
                        Dépendances
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Gérez les dépendances disponibles pour les produits
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-hyt-border">
                <button
                    onClick={() => setActiveTab('dependencies')}
                    className={`px-4 py-3 font-medium transition-colors relative ${
                        activeTab === 'dependencies'
                            ? 'text-hyt-accent'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Dépendances
                    {activeTab === 'dependencies' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('proposals')}
                    className={`px-4 py-3 font-medium transition-colors relative flex items-center gap-2 ${
                        activeTab === 'proposals'
                            ? 'text-hyt-accent'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    Propositions
                    {pendingCount > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-orange-500 text-white rounded-full">
                            {pendingCount}
                        </span>
                    )}
                    {activeTab === 'proposals' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                    )}
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                        value={filterGameId}
                        onChange={(e) => setFilterGameId(e.target.value)}
                        className="input-field"
                    >
                        <option value="">Tous les jeux</option>
                        {games.map(game => (
                            <option key={game.id} value={game.id}>{game.name}</option>
                        ))}
                    </select>
                </div>

                {activeTab === 'proposals' && (
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="input-field"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="PENDING">En attente</option>
                        <option value="APPROVED">Approuvées</option>
                        <option value="REJECTED">Refusées</option>
                    </select>
                )}

                {activeTab === 'dependencies' && (
                    <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 ml-auto">
                        <Plus className="w-4 h-4" />
                        Nouvelle dépendance
                    </button>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-hyt-accent animate-spin" />
                </div>
            ) : activeTab === 'dependencies' ? (
                /* Dependencies List */
                <div className="grid gap-4">
                    {dependencies.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Aucune dépendance</p>
                        </div>
                    ) : (
                        dependencies.map(dep => (
                            <div
                                key={dep.id}
                                className={`flex items-center gap-4 p-4 bg-hyt-card border rounded-xl ${
                                    dep.is_active ? 'border-hyt-border' : 'border-red-500/30 opacity-60'
                                }`}
                            >
                                {/* Logo */}
                                <div className="w-14 h-14 rounded-xl bg-hyt-dark flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {dep.logo_url ? (
                                        <img
                                            src={`http://localhost:3001${dep.logo_url}`}
                                            alt={dep.name}
                                            className="w-full h-full object-contain p-1"
                                        />
                                    ) : (
                                        <Link2 className="w-6 h-6 text-gray-500" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-white">{dep.name}</h3>
                                        <span className="px-2 py-0.5 text-xs bg-hyt-border text-gray-400 rounded">
                                            {dep.game_name}
                                        </span>
                                        {!dep.is_active && (
                                            <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
                                                Désactivée
                                            </span>
                                        )}
                                    </div>
                                    {dep.description && (
                                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">{dep.description}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Utilisée par {dep.usage_count || 0} produit(s)
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {dep.website_url && (
                                        <a
                                            href={dep.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => openEditModal(dep)}
                                        className="p-2 text-gray-400 hover:text-hyt-accent transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(dep.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                /* Proposals List */
                <div className="grid gap-4">
                    {proposals.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Aucune proposition</p>
                        </div>
                    ) : (
                        proposals.map(prop => (
                            <div
                                key={prop.id}
                                className="flex items-center gap-4 p-4 bg-hyt-card border border-hyt-border rounded-xl"
                            >
                                {/* Logo */}
                                <div className="w-14 h-14 rounded-xl bg-hyt-dark flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {prop.logo_url ? (
                                        <img
                                            src={`http://localhost:3001${prop.logo_url}`}
                                            alt={prop.name}
                                            className="w-full h-full object-contain p-1"
                                        />
                                    ) : (
                                        <Link2 className="w-6 h-6 text-gray-500" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-white">{prop.name}</h3>
                                        <span className="px-2 py-0.5 text-xs bg-hyt-border text-gray-400 rounded">
                                            {prop.game_name}
                                        </span>
                                        <span className={`px-2 py-0.5 text-xs rounded ${
                                            prop.status === 'PENDING' ? 'bg-orange-500/20 text-orange-400' :
                                                prop.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                                    'bg-red-500/20 text-red-400'
                                        }`}>
                                            {prop.status === 'PENDING' ? 'En attente' :
                                                prop.status === 'APPROVED' ? 'Approuvée' : 'Refusée'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Proposée par <span className="text-white">{prop.proposed_by_username}</span>
                                    </p>
                                    {prop.rejection_reason && (
                                        <p className="text-xs text-red-400 mt-1">
                                            Raison: {prop.rejection_reason}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                {prop.status === 'PENDING' && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleApproveProposal(prop.id)}
                                            className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                                            title="Approuver"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleRejectProposal(prop.id)}
                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Refuser"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal Create/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-hyt-card border border-hyt-border rounded-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-4 border-b border-hyt-border">
                            <h3 className="text-lg font-bold text-white">
                                {editingDep ? 'Modifier la dépendance' : 'Nouvelle dépendance'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {/* Logo */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Logo</label>
                                <div className="flex items-center gap-4">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-20 h-20 rounded-xl bg-hyt-dark border-2 border-dashed border-hyt-border hover:border-hyt-accent/50 flex items-center justify-center cursor-pointer overflow-hidden"
                                    >
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-gray-500" />
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        <p>Cliquez pour uploader</p>
                                        <p className="text-xs">PNG, JPG, SVG (max 2MB)</p>
                                    </div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                            </div>

                            {/* Nom */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Nom *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Fabric, Forge, OptiFine..."
                                    className="input-field w-full"
                                    required
                                />
                            </div>

                            {/* Jeu */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Jeu *</label>
                                <select
                                    value={formData.gameId}
                                    onChange={(e) => setFormData({ ...formData, gameId: e.target.value })}
                                    className="input-field w-full"
                                    required
                                >
                                    <option value="">Sélectionner un jeu</option>
                                    {games.map(game => (
                                        <option key={game.id} value={game.id}>{game.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Description courte..."
                                    rows={2}
                                    className="input-field w-full resize-none"
                                />
                            </div>

                            {/* Site web */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Site web</label>
                                <input
                                    type="url"
                                    value={formData.websiteUrl}
                                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                                    placeholder="https://..."
                                    className="input-field w-full"
                                />
                            </div>

                            {/* Boutons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-ghost flex-1"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {editingDep ? 'Mettre à jour' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}