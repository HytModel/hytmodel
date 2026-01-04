import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    ArrowLeft, Save, Loader2, Package, FileText,
    DollarSign, Gamepad2, Tag, Image, Trash2,
    Plus, Youtube, Star, X, AlertCircle, AlertTriangle,
    Upload, Check, Calendar, FileArchive, ChevronDown, ChevronUp,
    Layers, Link2, Search, ExternalLink
} from 'lucide-react'
import { modelsAPI, gamesAPI, categoriesAPI, tagsAPI, versionsAPI, modelImagesAPI, modelFileVersionsAPI, dependenciesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'

// ============ COMPOSANT GESTION DES VERSIONS DE FICHIERS ============
function FileVersionsManager({ modelId, gameId }) {
    const [versions, setVersions] = useState([])
    const [gameVersions, setGameVersions] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingVersion, setEditingVersion] = useState(null)
    const [expandedVersion, setExpandedVersion] = useState(null)
    const [processing, setProcessing] = useState(null)

    // Form state
    const [versionNumber, setVersionNumber] = useState('')
    const [changelog, setChangelog] = useState('')
    const [file, setFile] = useState(null)
    const [compatibleVersions, setCompatibleVersions] = useState([])
    const [isLatest, setIsLatest] = useState(true)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        loadData()
    }, [modelId, gameId])

    const loadData = async () => {
        setLoading(true)
        try {
            const [versionsRes, gameVersionsRes] = await Promise.all([
                modelFileVersionsAPI.getByModel(modelId),
                gameId ? versionsAPI.getByGame(gameId) : Promise.resolve({ data: { versions: [] } })
            ])
            setVersions(versionsRes.data.versions || [])
            setGameVersions(gameVersionsRes.data.versions || [])
        } catch (error) {
            console.error('Failed to load versions:', error)
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingVersion(null)
        setVersionNumber('')
        setChangelog('')
        setFile(null)
        setCompatibleVersions([])
        setIsLatest(true)
        setShowModal(true)
    }

    const openEditModal = (version) => {
        setEditingVersion(version)
        setVersionNumber(version.version_number)
        setChangelog(version.changelog || '')
        setCompatibleVersions(version.compatible_versions?.map(v => v.id) || [])
        setIsLatest(version.is_latest)
        setFile(null)
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!versionNumber.trim()) {
            toast.error('Numéro de version requis')
            return
        }

        if (!editingVersion && !file) {
            toast.error('Fichier requis')
            return
        }

        setUploading(true)
        try {
            if (editingVersion) {
                await modelFileVersionsAPI.update(modelId, editingVersion.id, {
                    changelog,
                    compatibleVersions,
                    isLatest
                })
                toast.success('Version mise à jour')
            } else {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('versionNumber', versionNumber.trim())
                formData.append('changelog', changelog)
                formData.append('compatibleVersions', JSON.stringify(compatibleVersions))
                formData.append('isLatest', isLatest)

                await modelFileVersionsAPI.create(modelId, formData)
                toast.success('Version ajoutée')
            }

            setShowModal(false)
            loadData()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setUploading(false)
        }
    }

    const handleSetLatest = async (versionId) => {
        setProcessing(versionId)
        try {
            await modelFileVersionsAPI.setLatest(modelId, versionId)
            toast.success('Version principale mise à jour')
            loadData()
        } catch (error) {
            toast.error('Erreur')
        } finally {
            setProcessing(null)
        }
    }

    const handleDelete = async (versionId) => {
        if (!confirm('Supprimer cette version ? Cette action est irréversible.')) return

        setProcessing(versionId)
        try {
            await modelFileVersionsAPI.delete(modelId, versionId)
            toast.success('Version supprimée')
            loadData()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setProcessing(null)
        }
    }

    const toggleGameVersion = (versionId) => {
        setCompatibleVersions(prev =>
            prev.includes(versionId)
                ? prev.filter(id => id !== versionId)
                : [...prev, versionId]
        )
    }

    const formatFileSize = (bytes) => {
        if (!bytes) return ''
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-hyt-accent animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Layers className="w-5 h-5 text-hyt-accent" />
                        Versions du fichier
                    </h3>
                    <p className="text-sm text-gray-400">
                        Gérez les différentes versions de votre ressource
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nouvelle version
                </button>
            </div>

            {/* Liste des versions */}
            {versions.length === 0 ? (
                <div className="bg-hyt-dark border border-dashed border-hyt-border rounded-xl p-8 text-center">
                    <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-white font-medium">Aucune version</p>
                    <p className="text-gray-400 text-sm mt-1">
                        Ajoutez votre première version de fichier
                    </p>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="btn-primary mt-4"
                    >
                        <Plus className="w-4 h-4 inline mr-2" />
                        Ajouter une version
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {versions.map((version) => (
                        <div
                            key={version.id}
                            className={`bg-hyt-dark border rounded-xl overflow-hidden transition-colors ${
                                version.is_latest ? 'border-hyt-accent/50' : 'border-hyt-border'
                            }`}
                        >
                            {/* Header de la version */}
                            <div
                                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-hyt-card/30"
                                onClick={() => setExpandedVersion(expandedVersion === version.id ? null : version.id)}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    version.is_latest ? 'bg-hyt-accent/20' : 'bg-hyt-border'
                                }`}>
                                    <Package className={`w-5 h-5 ${version.is_latest ? 'text-hyt-accent' : 'text-gray-400'}`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-white">
                                            v{version.version_number}
                                        </span>
                                        {version.is_latest && (
                                            <span className="px-2 py-0.5 bg-hyt-accent/20 text-hyt-accent text-xs rounded-full flex items-center gap-1">
                                                <Star className="w-3 h-3" />
                                                Principale
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(version.created_at).toLocaleDateString('fr-FR')}
                                        </span>
                                        {version.file_size && (
                                            <span className="flex items-center gap-1">
                                                <FileArchive className="w-3 h-3" />
                                                {formatFileSize(version.file_size)}
                                            </span>
                                        )}
                                        <span className="text-gray-500">
                                            {version.download_count || 0} téléchargements
                                        </span>
                                    </div>
                                </div>

                                {/* Versions compatibles preview */}
                                {version.compatible_versions?.length > 0 && (
                                    <div className="hidden sm:flex items-center gap-1">
                                        {version.compatible_versions.slice(0, 2).map(cv => (
                                            <span key={cv.id} className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                                                {cv.version}
                                            </span>
                                        ))}
                                        {version.compatible_versions.length > 2 && (
                                            <span className="text-gray-500 text-xs">
                                                +{version.compatible_versions.length - 2}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {expandedVersion === version.id ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </div>

                            {/* Détails expandus */}
                            {expandedVersion === version.id && (
                                <div className="border-t border-hyt-border p-4 space-y-4">
                                    {/* Changelog */}
                                    {version.changelog && (
                                        <div>
                                            <p className="text-sm text-gray-400 mb-1">Notes de version :</p>
                                            <p className="text-gray-300 text-sm bg-hyt-card p-3 rounded-lg whitespace-pre-wrap">
                                                {version.changelog}
                                            </p>
                                        </div>
                                    )}

                                    {/* Versions compatibles */}
                                    {version.compatible_versions?.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-400 mb-2">Compatible avec :</p>
                                            <div className="flex flex-wrap gap-2">
                                                {version.compatible_versions.map(cv => (
                                                    <span
                                                        key={cv.id}
                                                        className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg"
                                                    >
                                                        {cv.version}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-hyt-border">
                                        {!version.is_latest && (
                                            <button
                                                type="button"
                                                onClick={() => handleSetLatest(version.id)}
                                                disabled={processing === version.id}
                                                className="btn-ghost text-sm flex items-center gap-1"
                                            >
                                                {processing === version.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Star className="w-4 h-4" />
                                                )}
                                                Définir comme principale
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(version)}
                                            className="btn-ghost text-sm"
                                        >
                                            Modifier
                                        </button>
                                        {version.is_latest ? (
                                            <span className="text-xs text-gray-500 italic px-2">
                                                Version principale non supprimable
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(version.id)}
                                                disabled={processing === version.id}
                                                className="btn-ghost text-sm text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                                            >
                                                Supprimer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal d'ajout/édition */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-hyt-card border border-hyt-border rounded-xl w-full max-w-lg my-8">
                        <div className="flex items-center justify-between p-4 border-b border-hyt-border">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Package className="w-5 h-5 text-hyt-accent" />
                                {editingVersion ? 'Modifier la version' : 'Nouvelle version'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Numéro de version */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    Numéro de version *
                                </label>
                                <input
                                    type="text"
                                    value={versionNumber}
                                    onChange={(e) => setVersionNumber(e.target.value)}
                                    placeholder="Ex: 1.0.0, 2.1.3..."
                                    className="input-field w-full"
                                    disabled={!!editingVersion}
                                />
                            </div>

                            {/* Fichier (seulement en création) */}
                            {!editingVersion && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">
                                        Fichier *
                                    </label>
                                    <div className="border-2 border-dashed border-hyt-border rounded-xl p-6 text-center hover:border-hyt-accent/50 transition-colors">
                                        <input
                                            type="file"
                                            accept=".zip,.rar,.7z,.tar,.gz"
                                            onChange={(e) => setFile(e.target.files[0])}
                                            className="hidden"
                                            id="version-file-input"
                                        />
                                        <label htmlFor="version-file-input" className="cursor-pointer">
                                            {file ? (
                                                <div className="flex items-center justify-center gap-2 text-hyt-accent">
                                                    <FileArchive className="w-6 h-6" />
                                                    <span>{file.name}</span>
                                                    <span className="text-gray-500">
                                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                    </span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                                                    <p className="text-gray-400">Cliquez pour sélectionner</p>
                                                    <p className="text-gray-500 text-xs mt-1">ZIP, RAR, 7Z (max 500MB)</p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Versions du jeu compatibles */}
                            {gameVersions.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm text-gray-400">
                                            Versions du jeu compatibles
                                        </label>
                                        <div className="flex gap-2 text-xs">
                                            <button
                                                type="button"
                                                onClick={() => setCompatibleVersions(gameVersions.map(v => v.id))}
                                                className="text-hyt-accent hover:underline"
                                            >
                                                Tout
                                            </button>
                                            <span className="text-gray-600">|</span>
                                            <button
                                                type="button"
                                                onClick={() => setCompatibleVersions([])}
                                                className="text-gray-400 hover:underline"
                                            >
                                                Aucun
                                            </button>
                                        </div>
                                    </div>
                                    <div className="max-h-32 overflow-y-auto border border-hyt-border rounded-lg p-2 space-y-1">
                                        {gameVersions.map(gv => (
                                            <label
                                                key={gv.id}
                                                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                                    compatibleVersions.includes(gv.id)
                                                        ? 'bg-hyt-accent/20 text-hyt-accent'
                                                        : 'hover:bg-hyt-dark text-gray-300'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={compatibleVersions.includes(gv.id)}
                                                    onChange={() => toggleGameVersion(gv.id)}
                                                    className="sr-only"
                                                />
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                                    compatibleVersions.includes(gv.id)
                                                        ? 'bg-hyt-accent border-hyt-accent'
                                                        : 'border-gray-500'
                                                }`}>
                                                    {compatibleVersions.includes(gv.id) && (
                                                        <Check className="w-3 h-3 text-black" />
                                                    )}
                                                </div>
                                                <span>{gv.version}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Changelog */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    Notes de version (changelog)
                                </label>
                                <textarea
                                    value={changelog}
                                    onChange={(e) => setChangelog(e.target.value)}
                                    placeholder="Décrivez les changements de cette version..."
                                    rows={3}
                                    className="input-field w-full resize-none"
                                />
                            </div>

                            {/* Version principale */}
                            {editingVersion?.is_latest ? (
                                <div className="flex items-center gap-3 p-3 bg-hyt-dark rounded-lg opacity-60">
                                    <div className="w-5 h-5 rounded border flex items-center justify-center bg-hyt-accent border-hyt-accent">
                                        <Check className="w-3 h-3 text-black" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Version principale</p>
                                        <p className="text-gray-500 text-xs">Impossible de retirer le statut principal. Définissez d'abord une autre version comme principale.</p>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex items-center gap-3 p-3 bg-hyt-dark rounded-lg cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isLatest}
                                        onChange={(e) => setIsLatest(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                        isLatest ? 'bg-hyt-accent border-hyt-accent' : 'border-gray-500'
                                    }`}>
                                        {isLatest && <Check className="w-3 h-3 text-black" />}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">Version principale</p>
                                        <p className="text-gray-500 text-xs">Cette version sera téléchargée par défaut</p>
                                    </div>
                                </label>
                            )}

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
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={uploading}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4" />
                                    )}
                                    {editingVersion ? 'Mettre à jour' : 'Ajouter'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ============ COMPOSANT GESTION DES DÉPENDANCES ============
function DependenciesManager({ modelId, gameId, gameName }) {
    const [dependencies, setDependencies] = useState([])
    const [availableDeps, setAvailableDeps] = useState([])
    const [availableProducts, setAvailableProducts] = useState([]) // Liste des produits pour dropdown
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [activeTab, setActiveTab] = useState('predefined')

    const [selectedDep, setSelectedDep] = useState(null)
    const [depSearchQuery, setDepSearchQuery] = useState('') // Recherche dépendances prédéfinies
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [productVersions, setProductVersions] = useState([]) // Versions du produit sélectionné
    const [selectedVersion, setSelectedVersion] = useState(null) // Version sélectionnée
    const [loadingVersions, setLoadingVersions] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [proposalName, setProposalName] = useState('')
    const [proposalLogo, setProposalLogo] = useState(null)

    const [versionInfo, setVersionInfo] = useState('')
    const [isRequired, setIsRequired] = useState(true)
    const [note, setNote] = useState('')
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        if (modelId) loadDependencies()
    }, [modelId])

    useEffect(() => {
        if (gameId) {
            loadAvailableDeps()
            loadAvailableProducts()
        }
    }, [gameId])

    // Charger les versions quand un produit est sélectionné
    useEffect(() => {
        if (selectedProduct) {
            loadProductVersions(selectedProduct)
        } else {
            setProductVersions([])
            setSelectedVersion(null)
        }
    }, [selectedProduct])

    const loadDependencies = async () => {
        setLoading(true)
        try {
            const { data } = await dependenciesAPI.getByModel(modelId)
            setDependencies(data.dependencies || [])
        } catch (error) {
            console.error('Failed to load dependencies:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadAvailableDeps = async () => {
        console.log('Loading deps for gameId:', gameId) // DEBUG
        try {
            const { data } = await dependenciesAPI.getAll(gameId)
            console.log('Deps loaded:', data) // DEBUG
            setAvailableDeps(data.dependencies || [])
        } catch (error) {
            console.error('Failed to load available deps:', error)
        }
    }

    const loadProductVersions = async (productId) => {
        setLoadingVersions(true)
        try {
            const { data } = await modelFileVersionsAPI.getByModel(productId)
            setProductVersions(data.versions || data || [])
            // Sélectionner la dernière version par défaut (null = dernière)
            setSelectedVersion(null)
        } catch (error) {
            console.error('Failed to load product versions:', error)
            setProductVersions([])
        } finally {
            setLoadingVersions(false)
        }
    }

    const loadAvailableProducts = async () => {
        try {
            const { data } = await dependenciesAPI.searchProducts({
                gameId,
                excludeModelId: modelId
            })
            setAvailableProducts(data.products || [])
        } catch (error) {
            console.error('Failed to load available products:', error)
        }
    }

    const handleSearchProducts = async (query) => {
        setSearchQuery(query)
        if (query.length < 2) {
            setSearchResults([])
            return
        }

        setSearching(true)
        try {
            const { data } = await dependenciesAPI.searchProducts({
                q: query,
                gameId,
                excludeModelId: modelId
            })
            const existingProductIds = dependencies.filter(d => d.product_id).map(d => d.product_id)
            setSearchResults(data.products.filter(p => !existingProductIds.includes(p.id)))
        } catch (error) {
            console.error('Search failed:', error)
        } finally {
            setSearching(false)
        }
    }

    const handleAddDependency = async () => {
        setAdding(true)
        try {
            if (activeTab === 'predefined' && selectedDep) {
                await dependenciesAPI.addToModel(modelId, {
                    dependencyId: selectedDep,
                    versionInfo: versionInfo || null,
                    isRequired,
                    note: note || null
                })
            } else if (activeTab === 'product' && selectedProduct) {
                // Construire versionInfo avec la version sélectionnée
                let finalVersionInfo = versionInfo
                if (selectedVersion) {
                    const version = productVersions.find(v => v.id === selectedVersion)
                    if (version) {
                        finalVersionInfo = version.version_name || `v${version.version_number}`
                    }
                } else if (productVersions.length > 0) {
                    // "Dernière version" sélectionnée
                    finalVersionInfo = versionInfo || 'Dernière version'
                }

                await dependenciesAPI.addToModel(modelId, {
                    productDependencyId: selectedProduct,
                    productVersionId: selectedVersion || null, // ID de la version spécifique
                    versionInfo: finalVersionInfo || null,
                    isRequired,
                    note: note || null
                })
            } else if (activeTab === 'propose' && proposalName) {
                const formData = new FormData()
                formData.append('name', proposalName)
                formData.append('gameId', gameId)
                if (proposalLogo) formData.append('logo', proposalLogo)
                await dependenciesAPI.propose(formData)
                toast.success('Proposition envoyée !')
                closeModal()
                return
            } else {
                toast.error('Sélectionnez une dépendance')
                setAdding(false)
                return
            }

            toast.success('Dépendance ajoutée')
            closeModal()
            loadDependencies()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setAdding(false)
        }
    }

    const handleRemoveDependency = async (linkId) => {
        if (!confirm('Supprimer cette dépendance ?')) return
        try {
            await dependenciesAPI.removeFromModel(modelId, linkId)
            toast.success('Dépendance supprimée')
            loadDependencies()
        } catch (error) {
            toast.error('Erreur')
        }
    }

    const closeModal = () => {
        setShowModal(false)
        setSelectedDep(null)
        setDepSearchQuery('')
        setSelectedProduct(null)
        setProductVersions([])
        setSelectedVersion(null)
        setSearchQuery('')
        setSearchResults([])
        setProposalName('')
        setProposalLogo(null)
        setVersionInfo('')
        setIsRequired(true)
        setNote('')
        setActiveTab('predefined')
    }

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-hyt-accent animate-spin" />
            </div>
        )
    }

    // Filtrer les dépendances et produits déjà ajoutés
    const existingDepIds = dependencies.filter(d => d.dep_id).map(d => d.dep_id)
    const existingProductIds = dependencies.filter(d => d.product_id).map(d => d.product_id)

    // Filtrer les dépendances prédéfinies (exclure déjà ajoutées + recherche)
    const filteredAvailableDeps = availableDeps
        .filter(d => !existingDepIds.includes(d.id))
        .filter(d => !depSearchQuery || d.name.toLowerCase().includes(depSearchQuery.toLowerCase()))

    const filteredAvailableProducts = availableProducts.filter(p => !existingProductIds.includes(p.id))

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Link2 className="w-5 h-5 text-hyt-accent" />
                        Dépendances
                    </h3>
                    <p className="text-sm text-gray-400">Produits ou ressources requis pour votre produit</p>
                </div>
                <button type="button" onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Ajouter
                </button>
            </div>

            {/* Message jeu lié */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm text-blue-400 flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    Les dépendances sont liées au jeu <span className="font-semibold text-white">{gameName || 'sélectionné'}</span>
                </p>
            </div>

            {dependencies.length === 0 ? (
                <div className="bg-hyt-dark border border-dashed border-hyt-border rounded-xl p-6 text-center">
                    <Link2 className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">Aucune dépendance</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {dependencies.map((dep) => (
                        <div key={dep.id} className="flex items-center gap-4 p-3 bg-hyt-dark border border-hyt-border rounded-lg">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-hyt-card flex-shrink-0 flex items-center justify-center">
                                {dep.dep_logo ? (
                                    <img src={`http://localhost:3001${dep.dep_logo}`} alt={dep.dep_name} className="w-full h-full object-contain p-1" />
                                ) : dep.product_thumbnail ? (
                                    <img src={`http://localhost:3001${dep.product_thumbnail}`} alt={dep.product_title} className="w-full h-full object-cover" />
                                ) : (
                                    <Package className="w-6 h-6 text-gray-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-white">{dep.dep_name || dep.product_title}</span>
                                    <span className={`px-2 py-0.5 text-xs rounded ${dep.is_required ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {dep.is_required ? 'Requis' : 'Recommandé'}
                                    </span>
                                    {dep.product_id && <span className="px-2 py-0.5 text-xs bg-hyt-accent/20 text-hyt-accent rounded">Produit du site</span>}
                                </div>
                                {dep.version_info && <p className="text-sm text-gray-400">Version: {dep.version_info}</p>}
                                {dep.product_creator && <p className="text-xs text-gray-500">par {dep.product_creator}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                                {dep.product_id && (
                                    <a href={`/models/${dep.product_id}`} target="_blank" className="p-2 text-gray-400 hover:text-white">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                                <button type="button" onClick={() => handleRemoveDependency(dep.id)} className="p-2 text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-hyt-card border border-hyt-border rounded-xl w-full max-w-lg my-8">
                        <div className="flex items-center justify-between p-4 border-b border-hyt-border">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Link2 className="w-5 h-5 text-hyt-accent" />
                                Ajouter une dépendance
                            </h3>
                            <button type="button" onClick={closeModal} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        {/* Info jeu */}
                        <div className="px-4 pt-4">
                            <div className="bg-hyt-dark rounded-lg p-3 flex items-center gap-2">
                                <Gamepad2 className="w-4 h-4 text-hyt-accent" />
                                <span className="text-sm text-gray-400">Jeu :</span>
                                <span className="text-sm font-medium text-white">{gameName}</span>
                            </div>
                        </div>

                        <div className="flex border-b border-hyt-border mt-4">
                            <button type="button" onClick={() => { setActiveTab('predefined'); setSelectedDep(null); setSelectedProduct(null) }}
                                    className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'predefined' ? 'text-hyt-accent border-b-2 border-hyt-accent' : 'text-gray-400'}`}>
                                Prédéfinies
                            </button>
                            <button type="button" onClick={() => { setActiveTab('product'); setSelectedDep(null); setSelectedProduct(null) }}
                                    className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'product' ? 'text-hyt-accent border-b-2 border-hyt-accent' : 'text-gray-400'}`}>
                                Produit du site
                            </button>
                            <button type="button" onClick={() => { setActiveTab('propose'); setSelectedDep(null); setSelectedProduct(null) }}
                                    className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'propose' ? 'text-hyt-accent border-b-2 border-hyt-accent' : 'text-gray-400'}`}>
                                Proposer
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {activeTab === 'predefined' && (
                                <div className="space-y-3">
                                    <label className="block text-sm text-gray-400">Sélectionner une dépendance</label>

                                    {filteredAvailableDeps.length === 0 && availableDeps.length === 0 ? (
                                        <div className="text-center py-4 text-gray-500 bg-hyt-dark rounded-lg">
                                            <Link2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p>Aucune dépendance disponible pour ce jeu</p>
                                            <p className="text-sm mt-1">Proposez-en une dans l'onglet "Proposer"</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Recherche */}
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input
                                                    type="text"
                                                    value={depSearchQuery}
                                                    onChange={(e) => setDepSearchQuery(e.target.value)}
                                                    placeholder="Rechercher une dépendance..."
                                                    className="input-field w-full pl-10"
                                                />
                                                {depSearchQuery && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setDepSearchQuery('')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Liste des dépendances avec icônes */}
                                            <div className="max-h-60 overflow-y-auto space-y-2 border border-hyt-border rounded-lg p-2 bg-hyt-dark/50">
                                                {filteredAvailableDeps.length === 0 ? (
                                                    <div className="text-center py-4 text-gray-500">
                                                        <p>Aucune dépendance trouvée pour "{depSearchQuery}"</p>
                                                    </div>
                                                ) : (
                                                    filteredAvailableDeps.map(dep => (
                                                        <button
                                                            key={dep.id}
                                                            type="button"
                                                            onClick={() => setSelectedDep(dep.id)}
                                                            className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                                                                selectedDep === dep.id
                                                                    ? 'border-hyt-accent bg-hyt-accent/10'
                                                                    : 'border-transparent hover:border-hyt-border hover:bg-hyt-dark'
                                                            }`}
                                                        >
                                                            {/* Logo */}
                                                            <div className="w-10 h-10 rounded-lg bg-hyt-card flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                {dep.logo_url ? (
                                                                    <img
                                                                        src={`http://localhost:3001${dep.logo_url}`}
                                                                        alt={dep.name}
                                                                        className="w-full h-full object-contain p-1"
                                                                    />
                                                                ) : (
                                                                    <Link2 className="w-5 h-5 text-gray-500" />
                                                                )}
                                                            </div>

                                                            {/* Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-white truncate">{dep.name}</p>
                                                                {dep.description && (
                                                                    <p className="text-xs text-gray-500 truncate">{dep.description}</p>
                                                                )}
                                                            </div>

                                                            {/* Check */}
                                                            {selectedDep === dep.id && (
                                                                <div className="w-6 h-6 rounded-full bg-hyt-accent flex items-center justify-center flex-shrink-0">
                                                                    <Check className="w-4 h-4 text-black" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))
                                                )}
                                            </div>

                                            {/* Dépendance sélectionnée */}
                                            {selectedDep && (
                                                <div className="p-3 bg-hyt-accent/10 border border-hyt-accent/30 rounded-lg flex items-center gap-3">
                                                    {(() => {
                                                        const dep = availableDeps.find(d => d.id === selectedDep)
                                                        if (!dep) return null
                                                        return (
                                                            <>
                                                                <div className="w-10 h-10 rounded-lg bg-hyt-card flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                    {dep.logo_url ? (
                                                                        <img src={`http://localhost:3001${dep.logo_url}`} alt={dep.name} className="w-full h-full object-contain p-1" />
                                                                    ) : (
                                                                        <Link2 className="w-5 h-5 text-gray-500" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-white">{dep.name}</p>
                                                                    {dep.description && <p className="text-xs text-gray-400">{dep.description}</p>}
                                                                </div>
                                                                <button type="button" onClick={() => setSelectedDep(null)} className="p-1 text-gray-400 hover:text-white">
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )
                                                    })()}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {activeTab === 'product' && (
                                <div className="space-y-3">
                                    <label className="block text-sm text-gray-400">Sélectionner un produit du site</label>

                                    {filteredAvailableProducts.length === 0 && availableProducts.length === 0 ? (
                                        <div className="text-center py-4 text-gray-500 bg-hyt-dark rounded-lg">
                                            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p>Aucun autre produit disponible pour ce jeu</p>
                                        </div>
                                    ) : !selectedProduct ? (
                                        <>
                                            {/* Recherche */}
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Rechercher un produit..."
                                                    className="input-field w-full pl-10"
                                                />
                                                {searchQuery && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSearchQuery('')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Liste des produits avec images */}
                                            <div className="max-h-60 overflow-y-auto space-y-2 border border-hyt-border rounded-lg p-2 bg-hyt-dark/50">
                                                {(() => {
                                                    const filtered = filteredAvailableProducts.filter(p =>
                                                        !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                        p.creator_username?.toLowerCase().includes(searchQuery.toLowerCase())
                                                    )

                                                    if (filtered.length === 0) {
                                                        return (
                                                            <div className="text-center py-4 text-gray-500">
                                                                <p>Aucun produit trouvé {searchQuery && `pour "${searchQuery}"`}</p>
                                                            </div>
                                                        )
                                                    }

                                                    return filtered.map(product => (
                                                        <button
                                                            key={product.id}
                                                            type="button"
                                                            onClick={() => setSelectedProduct(product.id)}
                                                            className="w-full flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-hyt-border hover:bg-hyt-dark text-left transition-all"
                                                        >
                                                            {/* Thumbnail */}
                                                            <div className="w-12 h-12 rounded-lg bg-hyt-card overflow-hidden flex-shrink-0">
                                                                {product.thumbnail_url ? (
                                                                    <img
                                                                        src={`http://localhost:3001${product.thumbnail_url}`}
                                                                        alt={product.title}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Package className="w-5 h-5 text-gray-500" />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-white truncate">{product.title}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    par {product.creator_username} • {parseFloat(product.price).toFixed(2)}€
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ))
                                                })()}
                                            </div>
                                        </>
                                    ) : (
                                        /* Produit sélectionné - Afficher versions */
                                        <div className="space-y-4">
                                            {/* Aperçu produit sélectionné */}
                                            <div className="p-3 bg-hyt-accent/10 border border-hyt-accent/30 rounded-lg flex items-center gap-3">
                                                {(() => {
                                                    const product = filteredAvailableProducts.find(p => p.id === selectedProduct) || availableProducts.find(p => p.id === selectedProduct)
                                                    if (!product) return <span className="text-white">Produit sélectionné</span>
                                                    return (
                                                        <>
                                                            <div className="w-14 h-14 rounded-lg bg-hyt-dark overflow-hidden flex-shrink-0">
                                                                {product.thumbnail_url ? (
                                                                    <img src={`http://localhost:3001${product.thumbnail_url}`} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center">
                                                                        <Package className="w-6 h-6 text-gray-500" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-white">{product.title}</p>
                                                                <p className="text-sm text-gray-400">par {product.creator_username}</p>
                                                                <p className="text-xs text-hyt-accent">{parseFloat(product.price).toFixed(2)}€</p>
                                                            </div>
                                                            <button type="button" onClick={() => { setSelectedProduct(null); setSelectedVersion(null); }} className="p-2 text-gray-400 hover:text-white hover:bg-hyt-dark rounded-lg">
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        </>
                                                    )
                                                })()}
                                            </div>

                                            {/* Sélection de version */}
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                                                    <Layers className="w-4 h-4" />
                                                    Sélectionner une version
                                                </label>

                                                {loadingVersions ? (
                                                    <div className="flex items-center justify-center gap-2 text-gray-500 py-6 bg-hyt-dark rounded-lg">
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        <span>Chargement des versions...</span>
                                                    </div>
                                                ) : productVersions.length === 0 ? (
                                                    <div className="text-center py-4 bg-hyt-dark rounded-lg">
                                                        <Layers className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                                                        <p className="text-gray-400">Aucune version disponible</p>
                                                        <p className="text-xs text-gray-500 mt-1">La dernière version sera utilisée par défaut</p>
                                                    </div>
                                                ) : (
                                                    <div className="max-h-48 overflow-y-auto space-y-2 border border-hyt-border rounded-lg p-2 bg-hyt-dark/50">
                                                        {/* Option: Dernière version (par défaut) */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedVersion(null)}
                                                            className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                                                                selectedVersion === null
                                                                    ? 'border-hyt-accent bg-hyt-accent/10'
                                                                    : 'border-transparent hover:border-hyt-border hover:bg-hyt-dark'
                                                            }`}
                                                        >
                                                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                                                <Layers className="w-5 h-5 text-green-400" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-medium text-white">Dernière version</p>
                                                                <p className="text-xs text-gray-500">Toujours à jour automatiquement</p>
                                                            </div>
                                                            {selectedVersion === null && (
                                                                <div className="w-6 h-6 rounded-full bg-hyt-accent flex items-center justify-center flex-shrink-0">
                                                                    <Check className="w-4 h-4 text-black" />
                                                                </div>
                                                            )}
                                                        </button>

                                                        {/* Liste des versions */}
                                                        {productVersions.map((version, index) => (
                                                            <button
                                                                key={version.id}
                                                                type="button"
                                                                onClick={() => setSelectedVersion(version.id)}
                                                                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                                                                    selectedVersion === version.id
                                                                        ? 'border-hyt-accent bg-hyt-accent/10'
                                                                        : 'border-transparent hover:border-hyt-border hover:bg-hyt-dark'
                                                                }`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                                    index === 0 ? 'bg-blue-500/20' : 'bg-hyt-card'
                                                                }`}>
                                                                    <span className={`text-sm font-bold ${index === 0 ? 'text-blue-400' : 'text-gray-400'}`}>
                                                                        v{version.version_number || index + 1}
                                                                    </span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="font-medium text-white">
                                                                            {version.version_name || `Version ${version.version_number || index + 1}`}
                                                                        </p>
                                                                        {index === 0 && (
                                                                            <span className="px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
                                                                                Actuelle
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-gray-500">
                                                                        {new Date(version.created_at).toLocaleDateString('fr-FR')}
                                                                        {version.changelog && ` • ${version.changelog.substring(0, 30)}...`}
                                                                    </p>
                                                                </div>
                                                                {selectedVersion === version.id && (
                                                                    <div className="w-6 h-6 rounded-full bg-hyt-accent flex items-center justify-center flex-shrink-0">
                                                                        <Check className="w-4 h-4 text-black" />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'propose' && (
                                <>
                                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                        <p className="text-sm text-blue-400">Proposez une nouvelle dépendance. Elle sera examinée par notre équipe.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Nom *</label>
                                        <input type="text" value={proposalName} onChange={(e) => setProposalName(e.target.value)} placeholder="Ex: Fabric, Forge..." className="input-field w-full" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Logo (optionnel)</label>
                                        <input type="file" accept="image/*" onChange={(e) => setProposalLogo(e.target.files[0])} className="input-field w-full" />
                                    </div>
                                </>
                            )}

                            {activeTab !== 'propose' && (selectedDep || selectedProduct) && (
                                <>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Version requise (optionnel)</label>
                                        <input type="text" value={versionInfo} onChange={(e) => setVersionInfo(e.target.value)} placeholder="Ex: 1.20+..." className="input-field w-full" />
                                    </div>
                                    <div className="flex gap-3">
                                        <button type="button" onClick={() => setIsRequired(true)} className={`flex-1 p-3 rounded-lg border ${isRequired ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-hyt-border text-gray-400'}`}>
                                            <p className="font-medium">Requis</p>
                                        </button>
                                        <button type="button" onClick={() => setIsRequired(false)} className={`flex-1 p-3 rounded-lg border ${!isRequired ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400' : 'border-hyt-border text-gray-400'}`}>
                                            <p className="font-medium">Recommandé</p>
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Note (optionnel)</label>
                                        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Info supplémentaire..." className="input-field w-full" />
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="btn-ghost flex-1">Annuler</button>
                                <button type="button" onClick={handleAddDependency} disabled={adding || (activeTab === 'predefined' && !selectedDep) || (activeTab === 'product' && !selectedProduct) || (activeTab === 'propose' && !proposalName)}
                                        className="btn-primary flex-1 flex items-center justify-center gap-2">
                                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    {activeTab === 'propose' ? 'Proposer' : 'Ajouter'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ============ COMPOSANT PRINCIPAL ============
export default function EditProduct() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const imageInputRef = useRef(null)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [product, setProduct] = useState(null)

    // Form data
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [gameId, setGameId] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [selectedTags, setSelectedTags] = useState([])
    const [selectedVersions, setSelectedVersions] = useState([])
    const [youtubeUrl, setYoutubeUrl] = useState('')

    // Images
    const [existingImages, setExistingImages] = useState([])
    const [newImages, setNewImages] = useState([])
    const [imagesToDelete, setImagesToDelete] = useState([])
    const [uploadingImages, setUploadingImages] = useState(false)

    // Options
    const [games, setGames] = useState([])
    const [categories, setCategories] = useState([])
    const [allTags, setAllTags] = useState([])
    const [versions, setVersions] = useState([])

    useEffect(() => {
        fetchProduct()
        fetchOptions()
    }, [id])

    useEffect(() => {
        if (gameId) {
            fetchCategoriesAndVersions()
            fetchTags()
        } else {
            setCategories([])
            setVersions([])
            setAllTags([])
        }
    }, [gameId])

    const fetchProduct = async () => {
        try {
            const { data } = await modelsAPI.getById(id)
            const model = data.model || data

            // Vérifier que l'utilisateur est le propriétaire
            if (model.creator_id !== user?.id) {
                toast.error('Vous n\'êtes pas autorisé à modifier ce produit')
                navigate('/dashboard/models')
                return
            }

            setProduct(model)
            setTitle(model.title || '')
            setDescription(model.description || '')
            setPrice(parseFloat(model.price).toString())
            setGameId(model.game_id || '')
            setCategoryId(model.category_id || '')
            setSelectedTags(model.tags?.map(t => t.id) || [])
            setSelectedVersions(model.versions?.map(v => v.id) || [])
            setYoutubeUrl(model.youtube_url || '')

            // Charger les images existantes
            await fetchExistingImages()
        } catch (error) {
            console.error('Failed to fetch product:', error)
            toast.error('Produit non trouvé')
            navigate('/dashboard/models')
        } finally {
            setLoading(false)
        }
    }

    const fetchExistingImages = async () => {
        try {
            const { data } = await modelImagesAPI.getByModel(id)
            setExistingImages(data.images || [])
        } catch (error) {
            console.error('Failed to fetch images:', error)
        }
    }

    const fetchOptions = async () => {
        try {
            const gamesRes = await gamesAPI.getAll()
            setGames(gamesRes.data.games || gamesRes.data || [])
        } catch (error) {
            console.error('Failed to fetch options:', error)
        }
    }

    const fetchCategoriesAndVersions = async () => {
        try {
            const [categoriesRes, versionsRes] = await Promise.all([
                categoriesAPI.getByGame(gameId),
                versionsAPI.getByGame(gameId)
            ])
            setCategories(categoriesRes.data.categories || categoriesRes.data || [])
            setVersions(versionsRes.data.versions || versionsRes.data || [])
        } catch (error) {
            console.error('Failed to fetch categories/versions:', error)
        }
    }

    const fetchTags = async () => {
        try {
            const { data } = await tagsAPI.getAll()
            const allTagsList = data.tags || data || []
            // Filtrer: tags du jeu sélectionné + tags globaux (sans game_id)
            const filteredTags = allTagsList.filter(tag =>
                !tag.game_id || tag.game_id === gameId
            )
            setAllTags(filteredTags)
        } catch (error) {
            console.error('Failed to fetch tags:', error)
        }
    }

    // Image handling avec validation de taille
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files)
        const totalImages = existingImages.length - imagesToDelete.length + newImages.length + files.length

        if (totalImages > 10) {
            toast.error('Maximum 10 images autorisées')
            return
        }

        const processFiles = async () => {
            const validImages = []

            for (const file of files) {
                // Vérifier le poids (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`${file.name} est trop lourd (max 5MB)`)
                    continue
                }

                // Vérifier les dimensions
                const isValid = await new Promise((resolve) => {
                    const img = new window.Image()
                    img.onload = () => {
                        URL.revokeObjectURL(img.src)
                        if (img.width < 400 || img.height < 400) {
                            toast.error(`${file.name} est trop petit (minimum 400x400 pixels)`)
                            resolve(false)
                        } else {
                            resolve(true)
                        }
                    }
                    img.onerror = () => {
                        toast.error(`${file.name} n'est pas une image valide`)
                        resolve(false)
                    }
                    img.src = URL.createObjectURL(file)
                })

                if (isValid) {
                    validImages.push({
                        file,
                        preview: URL.createObjectURL(file),
                        isPrimary: existingImages.length === 0 && newImages.length === 0 && validImages.length === 0
                    })
                }
            }

            if (validImages.length > 0) {
                setNewImages(prev => [...prev, ...validImages])
            }
        }

        processFiles()
    }

    const removeExistingImage = (imageId) => {
        setImagesToDelete(prev => [...prev, imageId])
    }

    const restoreExistingImage = (imageId) => {
        setImagesToDelete(prev => prev.filter(id => id !== imageId))
    }

    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index))
    }

    const setPrimaryExistingImage = async (imageId) => {
        try {
            await modelImagesAPI.setPrimary(imageId)
            await fetchExistingImages()
            toast.success('Image principale mise à jour')
        } catch (error) {
            toast.error('Erreur lors de la mise à jour')
        }
    }

    // YouTube URL validation
    const getYoutubeVideoId = (url) => {
        if (!url) return null
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        const match = url.match(regex)
        return match ? match[1] : null
    }

    const isValidYoutubeUrl = (url) => {
        return !url || getYoutubeVideoId(url) !== null
    }

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!title.trim()) {
            toast.error('Veuillez entrer un titre')
            return
        }

        if (!price || parseFloat(price) < 5) {
            toast.error('Le prix minimum est de 5€')
            return
        }

        if (!gameId) {
            toast.error('Veuillez sélectionner un jeu')
            return
        }

        if (youtubeUrl && !isValidYoutubeUrl(youtubeUrl)) {
            toast.error('URL YouTube invalide')
            return
        }

        setSaving(true)

        try {
            // 1. Mettre à jour le produit
            await modelsAPI.update(id, {
                title: title.trim(),
                description: description.trim(),
                price: parseFloat(price),
                gameId,
                categoryId: categoryId || null,
                tagIds: selectedTags,
                versionIds: selectedVersions,
                youtubeUrl: youtubeUrl || null
            })

            // 2. Supprimer les images marquées pour suppression
            for (const imageId of imagesToDelete) {
                try {
                    await modelImagesAPI.delete(imageId)
                } catch (error) {
                    console.error('Failed to delete image:', error)
                }
            }

            // 3. Upload des nouvelles images
            if (newImages.length > 0) {
                setUploadingImages(true)
                const imageFormData = new FormData()
                newImages.forEach(img => {
                    imageFormData.append('images', img.file)
                })
                await modelImagesAPI.upload(id, imageFormData)
            }

            toast.success('Produit mis à jour ! Il sera visible après validation.')
            navigate('/dashboard/models')
        } catch (error) {
            console.error('Update failed:', error)
            toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour')
        } finally {
            setSaving(false)
            setUploadingImages(false)
        }
    }

    if (loading) {
        return <Loading fullScreen />
    }

    if (!product) {
        return null
    }

    const totalImagesCount = existingImages.length - imagesToDelete.length + newImages.length

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/dashboard/models"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour à mes produits
                    </Link>
                    <h1 className="font-display text-3xl font-bold text-white mb-2">
                        Modifier le produit
                    </h1>
                    <p className="text-gray-400">
                        Modifiez les informations de votre produit
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Versions de fichiers */}
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                        <FileVersionsManager modelId={id} gameId={gameId} />
                    </div>

                    {/* Images de galerie */}
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Image className="w-5 h-5" />
                            Images du produit
                            <span className="text-sm text-gray-400 font-normal">
                                ({totalImagesCount}/10)
                            </span>
                        </h3>

                        <p className="text-gray-400 text-sm mb-2">
                            Cliquez sur une image pour la définir comme image principale.
                        </p>
                        <div className="bg-hyt-dark/50 border border-hyt-border rounded-lg p-3 mb-4">
                            <p className="text-xs text-gray-500">
                                <span className="text-hyt-accent font-medium">📐 Recommandations :</span> Format carré ou 4:3,
                                dimensions idéales <span className="text-white">1200x1200 px</span> ou <span className="text-white">1200x900 px</span>.
                                Minimum 400x400 px, maximum 5 MB par image.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {/* Images existantes */}
                            {existingImages.map((img) => {
                                const isDeleted = imagesToDelete.includes(img.id)
                                return (
                                    <div
                                        key={img.id}
                                        onClick={() => !isDeleted && setPrimaryExistingImage(img.id)}
                                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ${
                                            isDeleted
                                                ? 'opacity-50 grayscale'
                                                : img.is_primary
                                                    ? 'ring-2 ring-hyt-accent'
                                                    : 'hover:ring-2 hover:ring-hyt-accent/50'
                                        }`}
                                    >
                                        <img
                                            src={`http://localhost:3001${img.image_url}`}
                                            alt="Product image"
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Badge principale */}
                                        {img.is_primary && !isDeleted && (
                                            <div className="absolute top-2 left-2 px-2 py-1 bg-hyt-accent text-black text-xs font-bold rounded">
                                                <Star className="w-3 h-3 inline mr-1" />
                                                Principale
                                            </div>
                                        )}

                                        {/* Badge supprimé */}
                                        {isDeleted && (
                                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); restoreExistingImage(img.id) }}
                                                    className="px-3 py-1 bg-white text-black text-xs font-bold rounded"
                                                >
                                                    Restaurer
                                                </button>
                                            </div>
                                        )}

                                        {/* Bouton supprimer */}
                                        {!isDeleted && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); removeExistingImage(img.id) }}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )
                            })}

                            {/* Nouvelles images */}
                            {newImages.map((img, index) => (
                                <div
                                    key={`new-${index}`}
                                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group ring-2 ring-green-500"
                                >
                                    <img
                                        src={img.preview}
                                        alt={`New image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Badge nouvelle */}
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                                        Nouvelle
                                    </div>

                                    {/* Bouton supprimer */}
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {/* Bouton ajouter */}
                            {totalImagesCount < 10 && (
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click()}
                                    className="aspect-square rounded-lg border-2 border-dashed border-hyt-border hover:border-hyt-accent/50 flex flex-col items-center justify-center gap-2 transition-colors"
                                >
                                    <Plus className="w-8 h-8 text-gray-500" />
                                    <span className="text-xs text-gray-500">Ajouter</span>
                                </button>
                            )}
                        </div>

                        <input
                            ref={imageInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                    </div>

                    {/* Informations */}
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Informations
                        </h3>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Titre *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Pack de textures HD"
                                className="input-field w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Décrivez votre produit..."
                                rows={4}
                                className="input-field w-full resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">
                                <DollarSign className="w-4 h-4 inline mr-1" />
                                Prix (€) * <span className="text-xs text-gray-500">(minimum 5€)</span>
                            </label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="5.00"
                                min="5"
                                step="0.01"
                                className="input-field w-full"
                                required
                            />
                        </div>
                    </div>

                    {/* Vidéo YouTube */}
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Youtube className="w-5 h-5 text-red-500" />
                            Vidéo YouTube
                            <span className="text-sm text-gray-400 font-normal">(optionnel)</span>
                        </h3>

                        <input
                            type="url"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className={`input-field w-full ${
                                youtubeUrl && !isValidYoutubeUrl(youtubeUrl)
                                    ? 'border-red-500 focus:ring-red-500'
                                    : ''
                            }`}
                        />

                        {youtubeUrl && !isValidYoutubeUrl(youtubeUrl) && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                URL YouTube invalide
                            </p>
                        )}

                        {youtubeUrl && isValidYoutubeUrl(youtubeUrl) && getYoutubeVideoId(youtubeUrl) && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-400 mb-2">Aperçu :</p>
                                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${getYoutubeVideoId(youtubeUrl)}`}
                                        className="w-full h-full"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Jeu & Catégorie */}
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Gamepad2 className="w-5 h-5" />
                            Jeu & Catégorie
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Jeu *</label>
                                <select
                                    value={gameId}
                                    onChange={(e) => setGameId(e.target.value)}
                                    className="input-field w-full"
                                    required
                                >
                                    <option value="">Sélectionner un jeu</option>
                                    {games.map(game => (
                                        <option key={game.id} value={game.id}>{game.name}</option>
                                    ))}
                                </select>
                            </div>

                            {categories.length > 0 && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Catégorie</label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="input-field w-full"
                                    >
                                        <option value="">Sélectionner une catégorie</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {versions.length > 0 && (
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    Versions compatibles
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {versions.map(version => (
                                        <button
                                            key={version.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedVersions(prev =>
                                                    prev.includes(version.id)
                                                        ? prev.filter(id => id !== version.id)
                                                        : [...prev, version.id]
                                                )
                                            }}
                                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                                selectedVersions.includes(version.id)
                                                    ? 'bg-hyt-accent text-white'
                                                    : 'bg-hyt-dark text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {version.name || version.version}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tags - afficher seulement si un jeu est sélectionné */}
                    {gameId && allTags.length > 0 && (
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                                <Tag className="w-5 h-5" />
                                Tags
                            </h3>

                            <div className="flex flex-wrap gap-2">
                                {allTags.map(tag => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedTags(prev =>
                                                prev.includes(tag.id)
                                                    ? prev.filter(id => id !== tag.id)
                                                    : [...prev, tag.id]
                                            )
                                        }}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                            selectedTags.includes(tag.id)
                                                ? 'bg-hyt-accent text-white'
                                                : 'bg-hyt-dark text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dépendances - afficher seulement si un jeu est sélectionné */}
                    {gameId && (
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                            <DependenciesManager modelId={id} gameId={gameId} gameName={games.find(g => g.id === gameId)?.name} />
                        </div>
                    )}

                    {/* Warning revalidation */}
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-orange-500">Revalidation requise</h4>
                                <p className="text-sm text-orange-400/80 mt-1">
                                    Toute modification de votre produit nécessitera une nouvelle validation par notre équipe.
                                    Votre produit sera temporairement masqué jusqu'à son approbation.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/models')}
                            className="btn-ghost"
                        >
                            Annuler
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {uploadingImages ? 'Upload des images...' : 'Enregistrement...'}
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Enregistrer et soumettre
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}