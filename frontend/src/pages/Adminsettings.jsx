import React, { useState, useEffect, useRef } from 'react'
import {
    Tag, FolderOpen, Gamepad2, Plus, Pencil, Trash2, X,
    Loader2, Upload, Image, Check, AlertTriangle, Search, Layers, Link2,
    ExternalLink, Filter
} from 'lucide-react'
import { tagsAPI, categoriesAPI, gamesAPI, versionsAPI, dependenciesAPI } from '../services/api'
import toast from 'react-hot-toast'

// ============ MODAL GÉNÉRIQUE ============
function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-hyt-card border border-hyt-border rounded-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b border-hyt-border">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    )
}

// ============ GESTION DES DÉPENDANCES ============
function DependenciesManager() {
    const [games, setGames] = useState([])
    const [dependencies, setDependencies] = useState([])
    const [selectedGame, setSelectedGame] = useState('')
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingDep, setEditingDep] = useState(null)
    const [formData, setFormData] = useState({ name: '', description: '', websiteUrl: '' })
    const [logoFile, setLogoFile] = useState(null)
    const [logoPreview, setLogoPreview] = useState(null)
    const [saving, setSaving] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const fileInputRef = useRef(null)

    useEffect(() => {
        fetchGames()
    }, [])

    useEffect(() => {
        if (selectedGame) {
            fetchDependencies(selectedGame)
        } else {
            setDependencies([])
        }
    }, [selectedGame])

    const fetchGames = async () => {
        try {
            const { data } = await gamesAPI.getAll()
            const gamesList = data.games || data || []
            setGames(gamesList)
            if (gamesList.length > 0) {
                setSelectedGame(gamesList[0].id)
            }
        } catch (error) {
            toast.error('Erreur lors du chargement des jeux')
        } finally {
            setLoading(false)
        }
    }

    const fetchDependencies = async (gameId) => {
        try {
            const { data } = await dependenciesAPI.adminGetAll(gameId)
            setDependencies(data.dependencies || [])
        } catch (error) {
            console.error('Error fetching dependencies:', error)
            setDependencies([])
        }
    }

    const openCreateModal = () => {
        if (!selectedGame) {
            toast.error('Sélectionnez un jeu d\'abord')
            return
        }
        setEditingDep(null)
        setFormData({ name: '', description: '', websiteUrl: '' })
        setLogoFile(null)
        setLogoPreview(null)
        setModalOpen(true)
    }

    const openEditModal = (dep) => {
        setEditingDep(dep)
        setFormData({
            name: dep.name,
            description: dep.description || '',
            websiteUrl: dep.website_url || ''
        })
        setLogoFile(null)
        setLogoPreview(dep.logo_url ? `http://localhost:3001${dep.logo_url}` : null)
        setModalOpen(true)
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

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error('Le nom est requis')
            return
        }

        setSaving(true)
        try {
            const fd = new FormData()
            fd.append('name', formData.name.trim())
            fd.append('description', formData.description)
            fd.append('websiteUrl', formData.websiteUrl)
            fd.append('gameId', selectedGame)
            if (logoFile) {
                fd.append('logo', logoFile)
            }

            if (editingDep) {
                await dependenciesAPI.update(editingDep.id, fd)
                toast.success('Dépendance modifiée')
            } else {
                await dependenciesAPI.create(fd)
                toast.success('Dépendance créée')
            }
            setModalOpen(false)
            fetchDependencies(selectedGame)
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (dep) => {
        if (!confirm(`Supprimer la dépendance "${dep.name}" ?`)) return

        try {
            await dependenciesAPI.delete(dep.id)
            toast.success('Dépendance supprimée')
            fetchDependencies(selectedGame)
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        }
    }

    const handleToggleActive = async (dep) => {
        try {
            const fd = new FormData()
            fd.append('isActive', !dep.is_active)
            await dependenciesAPI.update(dep.id, fd)
            toast.success(dep.is_active ? 'Dépendance désactivée' : 'Dépendance activée')
            fetchDependencies(selectedGame)
        } catch (error) {
            toast.error('Erreur')
        }
    }

    const selectedGameName = games.find(g => g.id === selectedGame)?.name || ''

    const filteredDeps = dependencies.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-4">
            {/* Sélecteur de jeu */}
            <div className="bg-hyt-dark rounded-xl p-4 border border-hyt-border">
                <label className="block text-sm text-gray-400 mb-2">
                    Sélectionnez un jeu pour gérer ses dépendances
                </label>
                <div className="flex gap-3">
                    <select
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        className="input-field flex-1"
                    >
                        <option value="">-- Choisir un jeu --</option>
                        {games.map(game => (
                            <option key={game.id} value={game.id}>{game.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={openCreateModal}
                        disabled={!selectedGame}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvelle dépendance
                    </button>
                </div>
            </div>

            {/* Recherche */}
            {selectedGame && dependencies.length > 0 && (
                <div className="relative max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une dépendance..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-10 w-full text-sm"
                    />
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-hyt-accent animate-spin" />
                </div>
            ) : !selectedGame ? (
                <div className="text-center py-12 text-gray-400">
                    <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez un jeu pour voir ses dépendances</p>
                </div>
            ) : filteredDeps.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{searchQuery ? 'Aucune dépendance trouvée' : `Aucune dépendance pour ${selectedGameName}`}</p>
                    <button onClick={openCreateModal} className="mt-4 btn-ghost">
                        <Plus className="w-4 h-4 inline mr-2" />
                        Créer une dépendance
                    </button>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filteredDeps.map((dep) => (
                        <div
                            key={dep.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border ${
                                dep.is_active
                                    ? 'bg-hyt-dark border-hyt-border'
                                    : 'bg-red-500/5 border-red-500/30 opacity-60'
                            }`}
                        >
                            {/* Logo */}
                            <div className="w-14 h-14 rounded-xl bg-hyt-card flex items-center justify-center overflow-hidden flex-shrink-0">
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
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-white">{dep.name}</span>
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
                                        title="Site web"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                                <button
                                    onClick={() => handleToggleActive(dep)}
                                    className={`p-2 transition-colors ${
                                        dep.is_active
                                            ? 'text-gray-400 hover:text-yellow-500'
                                            : 'text-green-500 hover:text-green-400'
                                    }`}
                                    title={dep.is_active ? 'Désactiver' : 'Activer'}
                                >
                                    {dep.is_active ? (
                                        <X className="w-4 h-4" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                </button>
                                <button
                                    onClick={() => openEditModal(dep)}
                                    className="p-2 text-gray-400 hover:text-hyt-accent transition-colors"
                                    title="Modifier"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(dep)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Supprimer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Dépendance */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingDep ? 'Modifier la dépendance' : 'Nouvelle dépendance'}
            >
                <div className="space-y-4">
                    {/* Logo */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Logo (optionnel)</label>
                        <div className="flex items-center gap-4">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-20 h-20 rounded-xl bg-hyt-dark border-2 border-dashed border-hyt-border hover:border-hyt-accent/50 flex items-center justify-center cursor-pointer overflow-hidden"
                            >
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                                ) : (
                                    <Image className="w-8 h-8 text-gray-500" />
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
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Courte description..."
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

                    {/* Jeu */}
                    <div className="bg-hyt-dark rounded-lg p-3">
                        <p className="text-sm text-gray-400">
                            Jeu : <span className="text-white font-medium">{selectedGameName}</span>
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1">
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {editingDep ? 'Modifier' : 'Créer'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ============ GESTION DES TAGS ============
function TagsManager() {
    const [games, setGames] = useState([])
    const [tags, setTags] = useState([])
    const [selectedGame, setSelectedGame] = useState('')
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingTag, setEditingTag] = useState(null)
    const [tagName, setTagName] = useState('')
    const [saving, setSaving] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchGames()
    }, [])

    useEffect(() => {
        if (selectedGame) {
            fetchTags(selectedGame)
        } else {
            setTags([])
        }
    }, [selectedGame])

    const fetchGames = async () => {
        try {
            const { data } = await gamesAPI.getAll()
            const gamesList = data.games || data || []
            setGames(gamesList)
            if (gamesList.length > 0) {
                setSelectedGame(gamesList[0].id)
            }
        } catch (error) {
            toast.error('Erreur lors du chargement des jeux')
        } finally {
            setLoading(false)
        }
    }

    const fetchTags = async (gameId) => {
        try {
            const { data } = await tagsAPI.getByGame(gameId)
            setTags(data.tags || data || [])
        } catch (error) {
            console.error('Error fetching tags:', error)
            setTags([])
        }
    }

    const openCreateModal = () => {
        if (!selectedGame) {
            toast.error('Sélectionnez un jeu d\'abord')
            return
        }
        setEditingTag(null)
        setTagName('')
        setModalOpen(true)
    }

    const openEditModal = (tag) => {
        setEditingTag(tag)
        setTagName(tag.name)
        setModalOpen(true)
    }

    const handleSave = async () => {
        if (!tagName.trim()) {
            toast.error('Le nom est requis')
            return
        }

        setSaving(true)
        try {
            if (editingTag) {
                await tagsAPI.update(editingTag.id, {
                    name: tagName.trim(),
                    gameId: selectedGame
                })
                toast.success('Tag modifié')
            } else {
                await tagsAPI.create({
                    name: tagName.trim(),
                    gameId: selectedGame
                })
                toast.success('Tag créé')
            }
            setModalOpen(false)
            fetchTags(selectedGame)
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (tag) => {
        if (!confirm(`Supprimer le tag "${tag.name}" ?`)) return

        try {
            await tagsAPI.delete(tag.id)
            toast.success('Tag supprimé')
            fetchTags(selectedGame)
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        }
    }

    const selectedGameName = games.find(g => g.id === selectedGame)?.name || ''

    const filteredTags = tags.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-4">
            {/* Sélecteur de jeu */}
            <div className="bg-hyt-dark rounded-xl p-4 border border-hyt-border">
                <label className="block text-sm text-gray-400 mb-2">
                    Sélectionnez un jeu pour gérer ses tags
                </label>
                <div className="flex gap-3">
                    <select
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        className="input-field flex-1"
                    >
                        <option value="">-- Choisir un jeu --</option>
                        {games.map(game => (
                            <option key={game.id} value={game.id}>{game.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={openCreateModal}
                        disabled={!selectedGame}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" />
                        Nouveau tag
                    </button>
                </div>
            </div>

            {/* Recherche */}
            {selectedGame && tags.length > 0 && (
                <div className="relative max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un tag..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-10 w-full text-sm"
                    />
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-hyt-accent animate-spin" />
                </div>
            ) : !selectedGame ? (
                <div className="text-center py-12 text-gray-400">
                    <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez un jeu pour voir ses tags</p>
                </div>
            ) : filteredTags.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{searchQuery ? 'Aucun tag trouvé' : `Aucun tag pour ${selectedGameName}`}</p>
                    {!searchQuery && (
                        <button
                            onClick={openCreateModal}
                            className="mt-4 text-hyt-accent hover:underline"
                        >
                            Créer le premier tag
                        </button>
                    )}
                </div>
            ) : (
                <div>
                    <p className="text-sm text-gray-500 mb-3">
                        {filteredTags.length} tag{filteredTags.length > 1 ? 's' : ''} pour <span className="text-white">{selectedGameName}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {filteredTags.map(tag => (
                            <div
                                key={tag.id}
                                className="group flex items-center gap-2 px-3 py-2 bg-hyt-dark rounded-lg border border-hyt-border hover:border-hyt-accent/50 transition-colors"
                            >
                                <Tag className="w-4 h-4 text-hyt-purple" />
                                <span className="text-white">{tag.name}</span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(tag)}
                                        className="p-1 text-gray-400 hover:text-hyt-accent"
                                    >
                                        <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tag)}
                                        className="p-1 text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingTag ? 'Modifier le tag' : `Nouveau tag pour ${selectedGameName}`}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Nom du tag</label>
                        <input
                            type="text"
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
                            placeholder="Ex: HD, Animé, Optimisé..."
                            className="input-field w-full"
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="btn-ghost flex-1"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {editingTag ? 'Modifier' : 'Créer'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ============ GESTION DES CATÉGORIES ============
function CategoriesManager() {
    const [games, setGames] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedGame, setSelectedGame] = useState('')
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [categoryName, setCategoryName] = useState('')
    const [categorySlug, setCategorySlug] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchGames()
    }, [])

    useEffect(() => {
        if (selectedGame) {
            fetchCategories(selectedGame)
        } else {
            setCategories([])
        }
    }, [selectedGame])

    const fetchGames = async () => {
        try {
            const { data } = await gamesAPI.getAll()
            const gamesList = data.games || data || []
            setGames(gamesList)
            // Sélectionner le premier jeu par défaut
            if (gamesList.length > 0) {
                setSelectedGame(gamesList[0].id)
            }
        } catch (error) {
            toast.error('Erreur lors du chargement des jeux')
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async (gameId) => {
        try {
            const { data } = await categoriesAPI.getByGame(gameId)
            setCategories(data.categories || data || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
            setCategories([])
        }
    }

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
    }

    const openCreateModal = () => {
        if (!selectedGame) {
            toast.error('Sélectionnez un jeu d\'abord')
            return
        }
        setEditingCategory(null)
        setCategoryName('')
        setCategorySlug('')
        setModalOpen(true)
    }

    const openEditModal = (cat) => {
        setEditingCategory(cat)
        setCategoryName(cat.name)
        setCategorySlug(cat.slug)
        setModalOpen(true)
    }

    const handleNameChange = (value) => {
        setCategoryName(value)
        if (!editingCategory) {
            setCategorySlug(generateSlug(value))
        }
    }

    const handleSave = async () => {
        if (!categoryName.trim()) {
            toast.error('Le nom est requis')
            return
        }

        setSaving(true)
        try {
            if (editingCategory) {
                await categoriesAPI.update(editingCategory.id, {
                    name: categoryName.trim(),
                    slug: categorySlug.trim() || generateSlug(categoryName),
                    gameId: selectedGame
                })
                toast.success('Catégorie modifiée')
            } else {
                await categoriesAPI.create({
                    name: categoryName.trim(),
                    slug: categorySlug.trim() || generateSlug(categoryName),
                    gameId: selectedGame
                })
                toast.success('Catégorie créée')
            }
            setModalOpen(false)
            fetchCategories(selectedGame)
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (cat) => {
        if (!confirm(`Supprimer la catégorie "${cat.name}" ?`)) return

        try {
            await categoriesAPI.delete(cat.id)
            toast.success('Catégorie supprimée')
            fetchCategories(selectedGame)
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        }
    }

    const selectedGameName = games.find(g => g.id === selectedGame)?.name || ''

    return (
        <div className="space-y-4">
            {/* Sélecteur de jeu */}
            <div className="bg-hyt-dark rounded-xl p-4 border border-hyt-border">
                <label className="block text-sm text-gray-400 mb-2">
                    Sélectionnez un jeu pour gérer ses catégories
                </label>
                <div className="flex gap-3">
                    <select
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        className="input-field flex-1"
                    >
                        <option value="">-- Choisir un jeu --</option>
                        {games.map(game => (
                            <option key={game.id} value={game.id}>{game.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={openCreateModal}
                        disabled={!selectedGame}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvelle catégorie
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-hyt-accent animate-spin" />
                </div>
            ) : !selectedGame ? (
                <div className="text-center py-12 text-gray-400">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez un jeu pour voir ses catégories</p>
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune catégorie pour {selectedGameName}</p>
                    <button
                        onClick={openCreateModal}
                        className="mt-4 text-hyt-accent hover:underline"
                    >
                        Créer la première catégorie
                    </button>
                </div>
            ) : (
                <div className="grid gap-3">
                    <p className="text-sm text-gray-500">
                        {categories.length} catégorie{categories.length > 1 ? 's' : ''} pour <span className="text-white">{selectedGameName}</span>
                    </p>
                    {categories.map(cat => (
                        <div
                            key={cat.id}
                            className="flex items-center justify-between p-4 bg-hyt-dark rounded-lg border border-hyt-border hover:border-hyt-accent/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-hyt-accent/20 flex items-center justify-center">
                                    <FolderOpen className="w-5 h-5 text-hyt-accent" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">{cat.name}</p>
                                    <p className="text-gray-500 text-sm">/{cat.slug}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openEditModal(cat)}
                                    className="p-2 text-gray-400 hover:text-hyt-accent transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(cat)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingCategory ? 'Modifier la catégorie' : `Nouvelle catégorie pour ${selectedGameName}`}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Nom</label>
                        <input
                            type="text"
                            value={categoryName}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Ex: Véhicules, Bâtiments..."
                            className="input-field w-full"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Slug (URL)</label>
                        <input
                            type="text"
                            value={categorySlug}
                            onChange={(e) => setCategorySlug(e.target.value)}
                            placeholder="vehicules"
                            className="input-field w-full"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1">
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {editingCategory ? 'Modifier' : 'Créer'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ============ GESTION DES VERSIONS ============
function VersionsManager() {
    const [games, setGames] = useState([])
    const [versions, setVersions] = useState([])
    const [selectedGame, setSelectedGame] = useState('')
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingVersion, setEditingVersion] = useState(null)
    const [versionName, setVersionName] = useState('')
    const [saving, setSaving] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchGames()
    }, [])

    useEffect(() => {
        if (selectedGame) {
            fetchVersions(selectedGame)
        } else {
            setVersions([])
        }
    }, [selectedGame])

    const fetchGames = async () => {
        try {
            const { data } = await gamesAPI.getAll()
            const gamesList = data.games || data || []
            setGames(gamesList)
            if (gamesList.length > 0) {
                setSelectedGame(gamesList[0].id)
            }
        } catch (error) {
            toast.error('Erreur lors du chargement des jeux')
        } finally {
            setLoading(false)
        }
    }

    const fetchVersions = async (gameId) => {
        try {
            const { data } = await versionsAPI.getByGame(gameId)
            setVersions(data.versions || data || [])
        } catch (error) {
            console.error('Error fetching versions:', error)
            setVersions([])
        }
    }

    const openCreateModal = () => {
        if (!selectedGame) {
            toast.error('Sélectionnez un jeu d\'abord')
            return
        }
        setEditingVersion(null)
        setVersionName('')
        setModalOpen(true)
    }

    const openEditModal = (version) => {
        setEditingVersion(version)
        setVersionName(version.version)
        setModalOpen(true)
    }

    const handleSave = async () => {
        if (!versionName.trim()) {
            toast.error('La version est requise')
            return
        }

        setSaving(true)
        try {
            if (editingVersion) {
                await versionsAPI.update(editingVersion.id, {
                    version: versionName.trim(),
                    gameId: selectedGame
                })
                toast.success('Version modifiée')
            } else {
                await versionsAPI.create({
                    version: versionName.trim(),
                    gameId: selectedGame
                })
                toast.success('Version créée')
            }
            setModalOpen(false)
            fetchVersions(selectedGame)
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (version) => {
        if (!confirm(`Supprimer la version "${version.version}" ?`)) return

        try {
            await versionsAPI.delete(version.id)
            toast.success('Version supprimée')
            fetchVersions(selectedGame)
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        }
    }

    const selectedGameName = games.find(g => g.id === selectedGame)?.name || ''

    const filteredVersions = versions.filter(v =>
        v.version.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Trier les versions (les plus récentes en premier)
    const sortedVersions = [...filteredVersions].sort((a, b) => {
        // Essayer de trier numériquement si possible
        const aNum = parseFloat(a.version.replace(/[^\d.]/g, ''))
        const bNum = parseFloat(b.version.replace(/[^\d.]/g, ''))
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return bNum - aNum
        }
        return b.version.localeCompare(a.version)
    })

    return (
        <div className="space-y-4">
            {/* Sélecteur de jeu */}
            <div className="bg-hyt-dark rounded-xl p-4 border border-hyt-border">
                <label className="block text-sm text-gray-400 mb-2">
                    Sélectionnez un jeu pour gérer ses versions
                </label>
                <div className="flex gap-3">
                    <select
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        className="input-field flex-1"
                    >
                        <option value="">-- Choisir un jeu --</option>
                        {games.map(game => (
                            <option key={game.id} value={game.id}>{game.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={openCreateModal}
                        disabled={!selectedGame}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvelle version
                    </button>
                </div>
            </div>

            {/* Recherche */}
            {selectedGame && versions.length > 0 && (
                <div className="relative max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une version..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-10 w-full text-sm"
                    />
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-hyt-accent animate-spin" />
                </div>
            ) : !selectedGame ? (
                <div className="text-center py-12 text-gray-400">
                    <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez un jeu pour voir ses versions</p>
                </div>
            ) : sortedVersions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{searchQuery ? 'Aucune version trouvée' : `Aucune version pour ${selectedGameName}`}</p>
                    {!searchQuery && (
                        <button
                            onClick={openCreateModal}
                            className="mt-4 text-hyt-accent hover:underline"
                        >
                            Créer la première version
                        </button>
                    )}
                </div>
            ) : (
                <div>
                    <p className="text-sm text-gray-500 mb-3">
                        {sortedVersions.length} version{sortedVersions.length > 1 ? 's' : ''} pour <span className="text-white">{selectedGameName}</span>
                    </p>
                    <div className="grid gap-2">
                        {sortedVersions.map(version => (
                            <div
                                key={version.id}
                                className="flex items-center justify-between p-3 bg-hyt-dark rounded-lg border border-hyt-border hover:border-hyt-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-hyt-accent/20 flex items-center justify-center">
                                        <Layers className="w-5 h-5 text-hyt-accent" />
                                    </div>
                                    <span className="text-white font-medium">{version.version}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditModal(version)}
                                        className="p-2 text-gray-400 hover:text-hyt-accent transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(version)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingVersion ? 'Modifier la version' : `Nouvelle version pour ${selectedGameName}`}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Version</label>
                        <input
                            type="text"
                            value={versionName}
                            onChange={(e) => setVersionName(e.target.value)}
                            placeholder="Ex: 1.20.4, b3258, ESX 1.9..."
                            className="input-field w-full"
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Entrez le numéro ou nom de la version du jeu
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="btn-ghost flex-1"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {editingVersion ? 'Modifier' : 'Créer'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ============ GESTION DES JEUX ============
function GamesManager() {
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingGame, setEditingGame] = useState(null)
    const [gameName, setGameName] = useState('')
    const [gameSlug, setGameSlug] = useState('')
    const [iconFile, setIconFile] = useState(null)
    const [bannerFile, setBannerFile] = useState(null)
    const [iconPreview, setIconPreview] = useState(null)
    const [bannerPreview, setBannerPreview] = useState(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchGames()
    }, [])

    const fetchGames = async () => {
        try {
            const { data } = await gamesAPI.getAll()
            setGames(data.games || data || [])
        } catch (error) {
            toast.error('Erreur lors du chargement')
        } finally {
            setLoading(false)
        }
    }

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
    }

    const openCreateModal = () => {
        setEditingGame(null)
        setGameName('')
        setGameSlug('')
        setIconFile(null)
        setBannerFile(null)
        setIconPreview(null)
        setBannerPreview(null)
        setModalOpen(true)
    }

    const openEditModal = (game) => {
        setEditingGame(game)
        setGameName(game.name)
        setGameSlug(game.slug)
        setIconFile(null)
        setBannerFile(null)
        setIconPreview(game.icon_url)
        setBannerPreview(game.banner_url)
        setModalOpen(true)
    }

    const handleNameChange = (value) => {
        setGameName(value)
        if (!editingGame) {
            setGameSlug(generateSlug(value))
        }
    }

    const handleIconChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setIconFile(file)
            setIconPreview(URL.createObjectURL(file))
        }
    }

    const handleBannerChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setBannerFile(file)
            setBannerPreview(URL.createObjectURL(file))
        }
    }

    const handleSave = async () => {
        if (!gameName.trim()) {
            toast.error('Le nom est requis')
            return
        }

        setSaving(true)
        try {
            const formData = new FormData()
            formData.append('name', gameName.trim())
            formData.append('slug', gameSlug.trim() || generateSlug(gameName))
            if (iconFile) formData.append('icon', iconFile)
            if (bannerFile) formData.append('banner', bannerFile)

            if (editingGame) {
                await gamesAPI.update(editingGame.id, formData)
                toast.success('Jeu modifié')
            } else {
                await gamesAPI.create(formData)
                toast.success('Jeu créé')
            }
            setModalOpen(false)
            fetchGames()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (game) => {
        if (!confirm(`Supprimer le jeu "${game.name}" ? Cela peut affecter les produits associés.`)) return

        try {
            await gamesAPI.delete(game.id)
            toast.success('Jeu supprimé')
            fetchGames()
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        }
    }

    const getImageUrl = (url) => {
        if (!url) return null
        if (url.startsWith('http')) return url
        return `http://localhost:3001${url}`
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nouveau jeu
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-hyt-accent animate-spin" />
                </div>
            ) : games.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    Aucun jeu créé
                </div>
            ) : (
                <div className="grid gap-4">
                    {games.map(game => (
                        <div
                            key={game.id}
                            className="flex items-center gap-4 p-4 bg-hyt-dark rounded-xl border border-hyt-border hover:border-hyt-accent/50 transition-colors"
                        >
                            {/* Icon */}
                            <div className="w-16 h-16 rounded-xl bg-hyt-card flex items-center justify-center overflow-hidden flex-shrink-0">
                                {game.icon_url ? (
                                    <img
                                        src={getImageUrl(game.icon_url)}
                                        alt={game.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Gamepad2 className="w-8 h-8 text-gray-500" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium">{game.name}</p>
                                <p className="text-gray-500 text-sm">/{game.slug}</p>
                                <div className="flex gap-2 mt-1">
                                    {game.icon_url && (
                                        <span className="text-xs text-green-500 flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Logo
                                        </span>
                                    )}
                                    {game.banner_url && (
                                        <span className="text-xs text-green-500 flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Bannière
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Banner preview */}
                            {game.banner_url && (
                                <div className="hidden md:block w-32 h-16 rounded-lg overflow-hidden">
                                    <img
                                        src={getImageUrl(game.banner_url)}
                                        alt={`${game.name} banner`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openEditModal(game)}
                                    className="p-2 text-gray-400 hover:text-hyt-accent transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(game)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Jeu */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingGame ? 'Modifier le jeu' : 'Nouveau jeu'}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Nom du jeu</label>
                        <input
                            type="text"
                            value={gameName}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Ex: FiveM, Minecraft..."
                            className="input-field w-full"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Slug (URL)</label>
                        <input
                            type="text"
                            value={gameSlug}
                            onChange={(e) => setGameSlug(e.target.value)}
                            placeholder="fivem"
                            className="input-field w-full"
                        />
                    </div>

                    {/* Icon Upload */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Logo / Icône (carré, 200x200 recommandé)
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-xl bg-hyt-dark border-2 border-dashed border-hyt-border flex items-center justify-center overflow-hidden">
                                {iconPreview ? (
                                    <img src={iconPreview} alt="Icon preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Image className="w-8 h-8 text-gray-500" />
                                )}
                            </div>
                            <label className="btn-ghost cursor-pointer flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Choisir
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleIconChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Banner Upload */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Bannière (1920x400 recommandé)
                        </label>
                        <div className="space-y-2">
                            <div className="w-full h-24 rounded-xl bg-hyt-dark border-2 border-dashed border-hyt-border flex items-center justify-center overflow-hidden">
                                {bannerPreview ? (
                                    <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <Image className="w-8 h-8 mx-auto mb-1" />
                                        <span className="text-xs">Bannière</span>
                                    </div>
                                )}
                            </div>
                            <label className="btn-ghost cursor-pointer flex items-center justify-center gap-2 w-full">
                                <Upload className="w-4 h-4" />
                                Choisir une bannière
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBannerChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1">
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {editingGame ? 'Modifier' : 'Créer'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ============ COMPOSANT PRINCIPAL ============
export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState('games')

    const tabs = [
        { id: 'games', label: 'Jeux', icon: Gamepad2 },
        { id: 'categories', label: 'Catégories', icon: FolderOpen },
        { id: 'tags', label: 'Tags', icon: Tag },
        { id: 'versions', label: 'Versions', icon: Layers },
        { id: 'dependencies', label: 'Dépendances', icon: Link2 }
    ]

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Paramètres</h2>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-hyt-border overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'text-hyt-accent'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-hyt-accent" />
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                {activeTab === 'games' && <GamesManager />}
                {activeTab === 'categories' && <CategoriesManager />}
                {activeTab === 'tags' && <TagsManager />}
                {activeTab === 'versions' && <VersionsManager />}
                {activeTab === 'dependencies' && <DependenciesManager />}
            </div>
        </div>
    )
}