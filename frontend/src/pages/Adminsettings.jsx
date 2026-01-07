import React, { useState, useEffect, useRef } from 'react'
import {
    Tag, FolderOpen, Gamepad2, Plus, Pencil, Trash2, X,
    Loader2, Upload, Image, Check, AlertTriangle, Search, Layers, Link2,
    ExternalLink, Filter
} from 'lucide-react'
import { tagsAPI, categoriesAPI, gamesAPI, versionsAPI, dependenciesAPI } from '../services/api'
import { useTranslation } from '../context/LanguageContext'
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
    const { t } = useTranslation()
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
            toast.error(t('settings.errors.loadGames'))
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
            toast.error(t('settings.errors.selectGameFirst'))
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
                toast.error(t('settings.errors.logoTooLarge'))
                return
            }
            setLogoFile(file)
            setLogoPreview(URL.createObjectURL(file))
        }
    }

    const handleSave = async () => {
        if (!formData.name.trim()) {
            toast.error(t('settings.errors.nameRequired'))
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
                toast.success(t('settings.success.dependencyModified'))
            } else {
                await dependenciesAPI.create(fd)
                toast.success(t('settings.success.dependencyCreated'))
            }
            setModalOpen(false)
            fetchDependencies(selectedGame)
        } catch (error) {
            toast.error(error.response?.data?.error || t('settings.errors.generic'))
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (dep) => {
        if (!confirm(t('settings.confirmDelete.dependency', { name: dep.name }))) return

        try {
            await dependenciesAPI.delete(dep.id)
            toast.success(t('settings.success.dependencyDeleted'))
            fetchDependencies(selectedGame)
        } catch (error) {
            toast.error(t('settings.errors.deleteFailed'))
        }
    }

    const handleToggleActive = async (dep) => {
        try {
            const fd = new FormData()
            fd.append('isActive', !dep.is_active)
            await dependenciesAPI.update(dep.id, fd)
            toast.success(dep.is_active ? t('settings.success.dependencyDisabled') : t('settings.success.dependencyEnabled'))
            fetchDependencies(selectedGame)
        } catch (error) {
            toast.error(t('settings.errors.generic'))
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
                    {t('settings.dependencies.selectGame')}
                </label>
                <div className="flex gap-3">
                    <select
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        className="input-field flex-1"
                    >
                        <option value="">{t('settings.chooseGame')}</option>
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
                        {t('settings.dependencies.new')}
                    </button>
                </div>
            </div>

            {/* Recherche */}
            {selectedGame && dependencies.length > 0 && (
                <div className="relative max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('settings.dependencies.searchPlaceholder')}
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
                    <p>{t('settings.dependencies.selectGameToView')}</p>
                </div>
            ) : filteredDeps.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <Link2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{searchQuery ? t('settings.dependencies.noFound') : t('settings.dependencies.noneForGame', { game: selectedGameName })}</p>
                    <button onClick={openCreateModal} className="mt-4 btn-ghost">
                        <Plus className="w-4 h-4 inline mr-2" />
                        {t('settings.dependencies.create')}
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
                                            {t('settings.dependencies.disabled')}
                                        </span>
                                    )}
                                </div>
                                {dep.description && (
                                    <p className="text-sm text-gray-400 mt-1 line-clamp-1">{dep.description}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('settings.dependencies.usedBy', { count: dep.usage_count || 0 })}
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
                                        title={t('settings.dependencies.website')}
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
                                    title={dep.is_active ? t('settings.actions.disable') : t('settings.actions.enable')}
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
                                    title={t('settings.actions.edit')}
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(dep)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title={t('settings.actions.delete')}
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
                title={editingDep ? t('settings.dependencies.editTitle') : t('settings.dependencies.newTitle')}
            >
                <div className="space-y-4">
                    {/* Logo */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">{t('settings.dependencies.logoOptional')}</label>
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
                                <p>{t('settings.clickToUpload')}</p>
                                <p className="text-xs">{t('settings.imageFormats')}</p>
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
                        <label className="block text-sm text-gray-400 mb-2">{t('settings.fields.name')} *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={t('settings.dependencies.namePlaceholder')}
                            className="input-field w-full"
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">{t('settings.fields.description')}</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder={t('settings.fields.shortDescription')}
                            rows={2}
                            className="input-field w-full resize-none"
                        />
                    </div>

                    {/* Site web */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">{t('settings.fields.website')}</label>
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
                            {t('settings.fields.game')} : <span className="text-white font-medium">{selectedGameName}</span>
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1">
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {editingDep ? t('settings.actions.edit') : t('settings.actions.create')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ============ GESTION DES TAGS ============
function TagsManager() {
    const { t } = useTranslation()
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
            toast.error(t('settings.errors.loadGames'))
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
            toast.error(t('settings.errors.selectGameFirst'))
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
            toast.error(t('settings.errors.nameRequired'))
            return
        }

        setSaving(true)
        try {
            if (editingTag) {
                await tagsAPI.update(editingTag.id, {
                    name: tagName.trim(),
                    gameId: selectedGame
                })
                toast.success(t('settings.success.tagModified'))
            } else {
                await tagsAPI.create({
                    name: tagName.trim(),
                    gameId: selectedGame
                })
                toast.success(t('settings.success.tagCreated'))
            }
            setModalOpen(false)
            fetchTags(selectedGame)
        } catch (error) {
            toast.error(error.response?.data?.error || t('settings.errors.generic'))
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (tag) => {
        if (!confirm(t('settings.confirmDelete.tag', { name: tag.name }))) return

        try {
            await tagsAPI.delete(tag.id)
            toast.success(t('settings.success.tagDeleted'))
            fetchTags(selectedGame)
        } catch (error) {
            toast.error(t('settings.errors.deleteFailed'))
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
                    {t('settings.tags.selectGame')}
                </label>
                <div className="flex gap-3">
                    <select
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        className="input-field flex-1"
                    >
                        <option value="">{t('settings.chooseGame')}</option>
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
                        {t('settings.tags.new')}
                    </button>
                </div>
            </div>

            {/* Recherche */}
            {selectedGame && tags.length > 0 && (
                <div className="relative max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('settings.tags.searchPlaceholder')}
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
                    <p>{t('settings.tags.selectGameToView')}</p>
                </div>
            ) : filteredTags.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{searchQuery ? t('settings.tags.noFound') : t('settings.tags.noneForGame', { game: selectedGameName })}</p>
                    {!searchQuery && (
                        <button
                            onClick={openCreateModal}
                            className="mt-4 text-hyt-accent hover:underline"
                        >
                            {t('settings.tags.createFirst')}
                        </button>
                    )}
                </div>
            ) : (
                <div>
                    <p className="text-sm text-gray-500 mb-3">
                        {t('settings.tags.countForGame', { count: filteredTags.length, game: selectedGameName })}
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
                title={editingTag ? t('settings.tags.editTitle') : t('settings.tags.newTitleFor', { game: selectedGameName })}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">{t('settings.tags.nameLabel')}</label>
                        <input
                            type="text"
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
                            placeholder={t('settings.tags.namePlaceholder')}
                            className="input-field w-full"
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="btn-ghost flex-1"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {editingTag ? t('settings.actions.edit') : t('settings.actions.create')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ============ GESTION DES CATÉGORIES ============
function CategoriesManager() {
    const { t } = useTranslation()
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
            toast.error(t('settings.errors.loadGames'))
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
            toast.error(t('settings.errors.selectGameFirst'))
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
            toast.error(t('settings.errors.nameRequired'))
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
                toast.success(t('settings.success.categoryModified'))
            } else {
                await categoriesAPI.create({
                    name: categoryName.trim(),
                    slug: categorySlug.trim() || generateSlug(categoryName),
                    gameId: selectedGame
                })
                toast.success(t('settings.success.categoryCreated'))
            }
            setModalOpen(false)
            fetchCategories(selectedGame)
        } catch (error) {
            toast.error(error.response?.data?.error || t('settings.errors.generic'))
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (cat) => {
        if (!confirm(t('settings.confirmDelete.category', { name: cat.name }))) return

        try {
            await categoriesAPI.delete(cat.id)
            toast.success(t('settings.success.categoryDeleted'))
            fetchCategories(selectedGame)
        } catch (error) {
            toast.error(t('settings.errors.deleteFailed'))
        }
    }

    const selectedGameName = games.find(g => g.id === selectedGame)?.name || ''

    return (
        <div className="space-y-4">
            {/* Sélecteur de jeu */}
            <div className="bg-hyt-dark rounded-xl p-4 border border-hyt-border">
                <label className="block text-sm text-gray-400 mb-2">
                    {t('settings.categories.selectGame')}
                </label>
                <div className="flex gap-3">
                    <select
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        className="input-field flex-1"
                    >
                        <option value="">{t('settings.chooseGame')}</option>
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
                        {t('settings.categories.new')}
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
                    <p>{t('settings.categories.selectGameToView')}</p>
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('settings.categories.noneForGame', { game: selectedGameName })}</p>
                    <button
                        onClick={openCreateModal}
                        className="mt-4 text-hyt-accent hover:underline"
                    >
                        {t('settings.categories.createFirst')}
                    </button>
                </div>
            ) : (
                <div className="grid gap-3">
                    <p className="text-sm text-gray-500">
                        {t('settings.categories.countForGame', { count: categories.length, game: selectedGameName })}
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
                title={editingCategory ? t('settings.categories.editTitle') : t('settings.categories.newTitleFor', { game: selectedGameName })}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">{t('settings.fields.name')}</label>
                        <input
                            type="text"
                            value={categoryName}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder={t('settings.categories.namePlaceholder')}
                            className="input-field w-full"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">{t('settings.fields.slug')}</label>
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
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {editingCategory ? t('settings.actions.edit') : t('settings.actions.create')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ============ GESTION DES VERSIONS ============
function VersionsManager() {
    const { t } = useTranslation()
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
            toast.error(t('settings.errors.loadGames'))
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
            toast.error(t('settings.errors.selectGameFirst'))
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
            toast.error(t('settings.errors.versionRequired'))
            return
        }

        setSaving(true)
        try {
            if (editingVersion) {
                await versionsAPI.update(editingVersion.id, {
                    version: versionName.trim(),
                    gameId: selectedGame
                })
                toast.success(t('settings.success.versionModified'))
            } else {
                await versionsAPI.create({
                    version: versionName.trim(),
                    gameId: selectedGame
                })
                toast.success(t('settings.success.versionCreated'))
            }
            setModalOpen(false)
            fetchVersions(selectedGame)
        } catch (error) {
            toast.error(error.response?.data?.error || t('settings.errors.generic'))
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (version) => {
        if (!confirm(t('settings.confirmDelete.version', { name: version.version }))) return

        try {
            await versionsAPI.delete(version.id)
            toast.success(t('settings.success.versionDeleted'))
            fetchVersions(selectedGame)
        } catch (error) {
            toast.error(t('settings.errors.deleteFailed'))
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
                    {t('settings.versions.selectGame')}
                </label>
                <div className="flex gap-3">
                    <select
                        value={selectedGame}
                        onChange={(e) => setSelectedGame(e.target.value)}
                        className="input-field flex-1"
                    >
                        <option value="">{t('settings.chooseGame')}</option>
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
                        {t('settings.versions.new')}
                    </button>
                </div>
            </div>

            {/* Recherche */}
            {selectedGame && versions.length > 0 && (
                <div className="relative max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('settings.versions.searchPlaceholder')}
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
                    <p>{t('settings.versions.selectGameToView')}</p>
                </div>
            ) : sortedVersions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{searchQuery ? t('settings.versions.noFound') : t('settings.versions.noneForGame', { game: selectedGameName })}</p>
                    {!searchQuery && (
                        <button
                            onClick={openCreateModal}
                            className="mt-4 text-hyt-accent hover:underline"
                        >
                            {t('settings.versions.createFirst')}
                        </button>
                    )}
                </div>
            ) : (
                <div>
                    <p className="text-sm text-gray-500 mb-3">
                        {t('settings.versions.countForGame', { count: sortedVersions.length, game: selectedGameName })}
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
                title={editingVersion ? t('settings.versions.editTitle') : t('settings.versions.newTitleFor', { game: selectedGameName })}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">{t('settings.versions.versionLabel')}</label>
                        <input
                            type="text"
                            value={versionName}
                            onChange={(e) => setVersionName(e.target.value)}
                            placeholder={t('settings.versions.versionPlaceholder')}
                            className="input-field w-full"
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {t('settings.versions.versionHint')}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setModalOpen(false)}
                            className="btn-ghost flex-1"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {editingVersion ? t('settings.actions.edit') : t('settings.actions.create')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ============ GESTION DES JEUX ============
function GamesManager() {
    const { t } = useTranslation()
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
            toast.error(t('settings.errors.loadFailed'))
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
            toast.error(t('settings.errors.nameRequired'))
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
                toast.success(t('settings.success.gameModified'))
            } else {
                await gamesAPI.create(formData)
                toast.success(t('settings.success.gameCreated'))
            }
            setModalOpen(false)
            fetchGames()
        } catch (error) {
            toast.error(error.response?.data?.error || t('settings.errors.generic'))
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (game) => {
        if (!confirm(t('settings.confirmDelete.game', { name: game.name }))) return

        try {
            await gamesAPI.delete(game.id)
            toast.success(t('settings.success.gameDeleted'))
            fetchGames()
        } catch (error) {
            toast.error(t('settings.errors.deleteFailed'))
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
                    {t('settings.games.new')}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-hyt-accent animate-spin" />
                </div>
            ) : games.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    {t('settings.games.noGames')}
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
                                            <Check className="w-3 h-3" /> {t('settings.games.banner')}
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
                title={editingGame ? t('settings.games.editTitle') : t('settings.games.newTitle')}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">{t('settings.games.nameLabel')}</label>
                        <input
                            type="text"
                            value={gameName}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder={t('settings.games.namePlaceholder')}
                            className="input-field w-full"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">{t('settings.fields.slug')}</label>
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
                            {t('settings.games.iconLabel')}
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
                                {t('settings.choose')}
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
                            {t('settings.games.bannerLabel')}
                        </label>
                        <div className="space-y-2">
                            <div className="w-full h-24 rounded-xl bg-hyt-dark border-2 border-dashed border-hyt-border flex items-center justify-center overflow-hidden">
                                {bannerPreview ? (
                                    <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <Image className="w-8 h-8 mx-auto mb-1" />
                                        <span className="text-xs">{t('settings.games.banner')}</span>
                                    </div>
                                )}
                            </div>
                            <label className="btn-ghost cursor-pointer flex items-center justify-center gap-2 w-full">
                                <Upload className="w-4 h-4" />
                                {t('settings.games.chooseBanner')}
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
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {editingGame ? t('settings.actions.edit') : t('settings.actions.create')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

// ============ COMPOSANT PRINCIPAL ============
export default function AdminSettings() {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('games')

    const tabs = [
        { id: 'games', label: t('settings.tabs.games'), icon: Gamepad2 },
        { id: 'categories', label: t('settings.tabs.categories'), icon: FolderOpen },
        { id: 'tags', label: t('settings.tabs.tags'), icon: Tag },
        { id: 'versions', label: t('settings.tabs.versions'), icon: Layers },
        { id: 'dependencies', label: t('settings.tabs.dependencies'), icon: Link2 }
    ]

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">{t('settings.title')}</h2>

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