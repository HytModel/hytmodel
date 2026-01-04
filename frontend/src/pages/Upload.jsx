import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Upload as UploadIcon, X, Image, Film, FileArchive,
    DollarSign, Tag, Gamepad2, Loader2, Star, Trash2,
    Plus, Youtube, Check, AlertCircle, Link2, Search,
    ExternalLink, Package, Layers
} from 'lucide-react'
import { modelsAPI, gamesAPI, categoriesAPI, tagsAPI, versionsAPI, modelImagesAPI, dependenciesAPI, modelFileVersionsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Upload() {
    const navigate = useNavigate()
    const { user, isCreator } = useAuth()
    const fileInputRef = useRef(null)
    const imageInputRef = useRef(null)

    // Form state
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [gameId, setGameId] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [selectedTags, setSelectedTags] = useState([])
    const [selectedVersions, setSelectedVersions] = useState([])
    const [youtubeUrl, setYoutubeUrl] = useState('')

    // Files
    const [file, setFile] = useState(null)
    const [images, setImages] = useState([])
    const [primaryImageIndex, setPrimaryImageIndex] = useState(0)

    // Dépendances
    const [selectedDependencies, setSelectedDependencies] = useState([])
    const [availableDeps, setAvailableDeps] = useState([])
    const [availableProducts, setAvailableProducts] = useState([])
    const [showDepModal, setShowDepModal] = useState(false)
    const [depActiveTab, setDepActiveTab] = useState('predefined')
    const [depSelectedItem, setDepSelectedItem] = useState(null)
    const [depSearchQuery, setDepSearchQuery] = useState('')
    const [productSearchQuery, setProductSearchQuery] = useState('')
    const [productVersions, setProductVersions] = useState([])
    const [selectedProductVersion, setSelectedProductVersion] = useState(null)
    const [loadingVersions, setLoadingVersions] = useState(false)
    const [depVersionInfo, setDepVersionInfo] = useState('')
    const [depIsRequired, setDepIsRequired] = useState(true)
    const [depNote, setDepNote] = useState('')
    const [proposalName, setProposalName] = useState('')
    const [proposalLogo, setProposalLogo] = useState(null)

    // Options
    const [games, setGames] = useState([])
    const [categories, setCategories] = useState([])
    const [tags, setTags] = useState([])
    const [versions, setVersions] = useState([])

    // UI state
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)

    useEffect(() => {
        if (!isCreator()) {
            toast.error('Vous devez être créateur pour ajouter des produits')
            navigate('/')
            return
        }
        fetchGames()
    }, [])

    useEffect(() => {
        if (gameId) {
            fetchCategories()
            fetchVersions()
            fetchTags()
            fetchAvailableDeps()
            fetchAvailableProducts()
        } else {
            setCategories([])
            setVersions([])
            setTags([])
            setAvailableDeps([])
            setAvailableProducts([])
            setCategoryId('')
            setSelectedTags([])
            setSelectedDependencies([])
        }
    }, [gameId])

    // Charger les versions quand un produit est sélectionné
    useEffect(() => {
        if (depSelectedItem && depActiveTab === 'product') {
            loadProductVersions(depSelectedItem.id)
        } else {
            setProductVersions([])
            setSelectedProductVersion(null)
        }
    }, [depSelectedItem, depActiveTab])

    const fetchGames = async () => {
        try {
            const { data } = await gamesAPI.getAll()
            setGames(data.games || data || [])
        } catch (error) {
            console.error('Failed to fetch games:', error)
        }
    }

    const fetchCategories = async () => {
        try {
            const { data } = await categoriesAPI.getByGame(gameId)
            setCategories(data.categories || data || [])
        } catch (error) {
            console.error('Failed to fetch categories:', error)
        }
    }

    const fetchTags = async () => {
        try {
            const { data } = await tagsAPI.getAll()
            const allTags = data.tags || data || []
            const filteredTags = allTags.filter(tag =>
                !tag.game_id || tag.game_id === gameId
            )
            setTags(filteredTags)
        } catch (error) {
            console.error('Failed to fetch tags:', error)
        }
    }

    const fetchVersions = async () => {
        try {
            const { data } = await versionsAPI.getByGame(gameId)
            setVersions(data.versions || data || [])
        } catch (error) {
            console.error('Failed to fetch versions:', error)
        }
    }

    const fetchAvailableDeps = async () => {
        try {
            const { data } = await dependenciesAPI.getAll(gameId)
            setAvailableDeps(data.dependencies || [])
        } catch (error) {
            console.error('Failed to fetch dependencies:', error)
        }
    }

    const fetchAvailableProducts = async () => {
        try {
            const { data } = await dependenciesAPI.searchProducts({ gameId })
            setAvailableProducts(data.products || [])
        } catch (error) {
            console.error('Failed to fetch products:', error)
        }
    }

    const loadProductVersions = async (productId) => {
        setLoadingVersions(true)
        try {
            const { data } = await modelFileVersionsAPI.getByModel(productId)
            setProductVersions(data.versions || data || [])
            setSelectedProductVersion(null)
        } catch (error) {
            console.error('Failed to load product versions:', error)
            setProductVersions([])
        } finally {
            setLoadingVersions(false)
        }
    }

    // Filtrer les dépendances prédéfinies
    const filteredAvailableDeps = availableDeps
        .filter(d => !selectedDependencies.some(sd => sd.type === 'dependency' && sd.id === d.id))
        .filter(d => !depSearchQuery || d.name.toLowerCase().includes(depSearchQuery.toLowerCase()))

    // Filtrer les produits
    const filteredAvailableProducts = availableProducts
        .filter(p => !selectedDependencies.some(sd => sd.type === 'product' && sd.id === p.id))
        .filter(p => !productSearchQuery || p.title.toLowerCase().includes(productSearchQuery.toLowerCase()))

    const handleAddDependency = async () => {
        if (depActiveTab === 'predefined' && depSelectedItem) {
            setSelectedDependencies(prev => [...prev, {
                type: 'dependency',
                id: depSelectedItem.id,
                name: depSelectedItem.name,
                logo_url: depSelectedItem.logo_url,
                versionInfo: depVersionInfo,
                isRequired: depIsRequired,
                note: depNote
            }])
            toast.success('Dépendance ajoutée')
        } else if (depActiveTab === 'product' && depSelectedItem) {
            let finalVersionInfo = depVersionInfo
            if (selectedProductVersion) {
                const version = productVersions.find(v => v.id === selectedProductVersion)
                if (version) {
                    finalVersionInfo = version.version_name || `v${version.version_number}`
                }
            } else if (productVersions.length > 0 && !depVersionInfo) {
                finalVersionInfo = 'Dernière version'
            }

            setSelectedDependencies(prev => [...prev, {
                type: 'product',
                id: depSelectedItem.id,
                name: depSelectedItem.title,
                thumbnail_url: depSelectedItem.thumbnail_url,
                creator: depSelectedItem.creator_username,
                price: depSelectedItem.price,
                versionId: selectedProductVersion,
                versionInfo: finalVersionInfo,
                isRequired: depIsRequired,
                note: depNote
            }])
            toast.success('Dépendance ajoutée')
        } else if (depActiveTab === 'propose' && proposalName) {
            try {
                const formData = new FormData()
                formData.append('name', proposalName)
                formData.append('gameId', gameId)
                if (proposalLogo) formData.append('logo', proposalLogo)
                await dependenciesAPI.propose(formData)
                toast.success('Proposition envoyée ! Elle sera examinée par l\'équipe.')
            } catch (error) {
                toast.error(error.response?.data?.error || 'Erreur')
                return
            }
        } else {
            toast.error('Sélectionnez une dépendance')
            return
        }

        closeDepModal()
    }

    const removeDependency = (index) => {
        setSelectedDependencies(prev => prev.filter((_, i) => i !== index))
    }

    const closeDepModal = () => {
        setShowDepModal(false)
        setDepSelectedItem(null)
        setDepSearchQuery('')
        setProductSearchQuery('')
        setProductVersions([])
        setSelectedProductVersion(null)
        setDepVersionInfo('')
        setDepIsRequired(true)
        setDepNote('')
        setProposalName('')
        setProposalLogo(null)
        setDepActiveTab('predefined')
    }

    // File handling
    const handleFileDrop = (e) => {
        e.preventDefault()
        setDragActive(false)
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) {
            setFile(droppedFile)
        }
    }

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            setFile(selectedFile)
        }
    }

    // Image handling avec validation de taille
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files)
        if (images.length + files.length > 10) {
            toast.error('Maximum 10 images autorisées')
            return
        }

        const validImages = []
        let hasError = false

        const processFiles = async () => {
            for (const file of files) {
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`${file.name} est trop lourd (max 5MB)`)
                    hasError = true
                    continue
                }

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
                        isPrimary: images.length === 0 && validImages.length === 0
                    })
                }
            }

            if (validImages.length > 0) {
                setImages(prev => [...prev, ...validImages])
            }
        }

        processFiles()
    }

    const removeImage = (index) => {
        setImages(prev => {
            const newImages = prev.filter((_, i) => i !== index)
            if (prev[index].isPrimary && newImages.length > 0) {
                newImages[0].isPrimary = true
                setPrimaryImageIndex(0)
            }
            return newImages
        })
    }

    const setPrimaryImage = (index) => {
        setImages(prev => prev.map((img, i) => ({
            ...img,
            isPrimary: i === index
        })))
        setPrimaryImageIndex(index)
    }

    const getYoutubeVideoId = (url) => {
        if (!url) return null
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        const match = url.match(regex)
        return match ? match[1] : null
    }

    const isValidYoutubeUrl = (url) => {
        return !url || getYoutubeVideoId(url) !== null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!file) {
            toast.error('Veuillez sélectionner un fichier')
            return
        }

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

        if (!categoryId) {
            toast.error('Veuillez sélectionner une catégorie')
            return
        }

        if (youtubeUrl && !isValidYoutubeUrl(youtubeUrl)) {
            toast.error('URL YouTube invalide')
            return
        }

        setUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('title', title.trim())
            formData.append('description', description.trim())
            formData.append('price', parseFloat(price))
            formData.append('gameId', gameId)
            formData.append('categoryId', categoryId)
            formData.append('tagIds', JSON.stringify(selectedTags))
            formData.append('versionIds', JSON.stringify(selectedVersions))
            if (youtubeUrl) {
                formData.append('youtubeUrl', youtubeUrl)
            }

            const { data } = await modelsAPI.uploadDetailed(formData)
            const modelId = data.model.id

            if (images.length > 0) {
                const imageFormData = new FormData()
                const primaryImage = images.find(img => img.isPrimary)
                if (primaryImage) {
                    imageFormData.append('images', primaryImage.file)
                }
                images.forEach(img => {
                    if (!img.isPrimary) {
                        imageFormData.append('images', img.file)
                    }
                })
                await modelImagesAPI.upload(modelId, imageFormData)
            }

            for (const dep of selectedDependencies) {
                try {
                    await dependenciesAPI.addToModel(modelId, {
                        dependencyId: dep.type === 'dependency' ? dep.id : null,
                        productDependencyId: dep.type === 'product' ? dep.id : null,
                        productVersionId: dep.versionId || null,
                        versionInfo: dep.versionInfo || null,
                        isRequired: dep.isRequired,
                        note: dep.note || null
                    })
                } catch (error) {
                    console.error('Failed to add dependency:', error)
                }
            }

            toast.success('Produit ajouté avec succès ! Il sera visible après validation.')
            navigate('/dashboard/models')
        } catch (error) {
            console.error('Upload failed:', error)
            toast.error(error.response?.data?.error || 'Erreur lors de l\'upload')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="font-display text-3xl font-bold text-white mb-2">
                        Ajouter un produit
                    </h1>
                    <p className="text-gray-400">
                        Partagez votre création avec la communauté
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Fichier principal */}
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FileArchive className="w-5 h-5" />
                            Fichier du produit *
                        </h3>

                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleFileDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                                dragActive
                                    ? 'border-hyt-accent bg-hyt-accent/10'
                                    : file
                                        ? 'border-green-500 bg-green-500/10'
                                        : 'border-hyt-border hover:border-hyt-accent/50'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileSelect}
                                className="hidden"
                                accept=".zip,.rar,.7z,.fbx,.obj,.blend"
                            />

                            {file ? (
                                <div className="flex items-center justify-center gap-3">
                                    <Check className="w-8 h-8 text-green-500" />
                                    <div className="text-left">
                                        <p className="text-white font-medium">{file.name}</p>
                                        <p className="text-sm text-gray-400">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setFile(null) }}
                                        className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <UploadIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                                    <p className="text-white font-medium mb-1">
                                        Glissez votre fichier ici
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        ou cliquez pour parcourir (.zip, .rar, .fbx, .obj, .blend)
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Images de galerie */}
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Image className="w-5 h-5" />
                            Images du produit
                            <span className="text-sm text-gray-400 font-normal">
                                ({images.length}/10)
                            </span>
                        </h3>

                        <p className="text-gray-400 text-sm mb-2">
                            Ajoutez jusqu'à 10 images. Cliquez sur une image pour la définir comme image principale.
                        </p>
                        <div className="bg-hyt-dark/50 border border-hyt-border rounded-lg p-3 mb-4">
                            <p className="text-xs text-gray-500">
                                <span className="text-hyt-accent font-medium">📐 Recommandations :</span> Format carré ou 4:3,
                                dimensions idéales <span className="text-white">1200x1200 px</span> ou <span className="text-white">1200x900 px</span>.
                                Minimum 400x400 px, maximum 5 MB par image.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {images.map((img, index) => (
                                <div
                                    key={index}
                                    onClick={() => setPrimaryImage(index)}
                                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ${
                                        img.isPrimary
                                            ? 'ring-2 ring-hyt-accent'
                                            : 'hover:ring-2 hover:ring-hyt-accent/50'
                                    }`}
                                >
                                    <img
                                        src={img.preview}
                                        alt={`Image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />

                                    {img.isPrimary && (
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-hyt-accent text-black text-xs font-bold rounded">
                                            <Star className="w-3 h-3 inline mr-1" />
                                            Principale
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeImage(index) }}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    {!img.isPrimary && (
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-medium">
                                                Définir comme principale
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {images.length < 10 && (
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
                            <Tag className="w-5 h-5" />
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

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Catégorie *</label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="input-field w-full"
                                    required
                                    disabled={!gameId}
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
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
                                            {version.version}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    {gameId && tags.length > 0 && (
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Tag className="w-5 h-5" />
                                Tags
                            </h3>

                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
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

                    {/* Dépendances */}
                    {gameId && (
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Link2 className="w-5 h-5 text-hyt-accent" />
                                        Dépendances
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        Produits ou ressources requis pour que votre produit fonctionne
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowDepModal(true)}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Ajouter
                                </button>
                            </div>

                            {selectedDependencies.length === 0 ? (
                                <div className="bg-hyt-dark border border-dashed border-hyt-border rounded-xl p-6 text-center">
                                    <Link2 className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                                    <p className="text-gray-400">Aucune dépendance</p>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Ajoutez des dépendances si votre produit en nécessite d'autres
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {selectedDependencies.map((dep, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4 p-3 bg-hyt-dark border border-hyt-border rounded-lg"
                                        >
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-hyt-card flex-shrink-0 flex items-center justify-center">
                                                {dep.logo_url ? (
                                                    <img src={`http://localhost:3001${dep.logo_url}`} alt={dep.name} className="w-full h-full object-contain p-1" />
                                                ) : dep.thumbnail_url ? (
                                                    <img src={`http://localhost:3001${dep.thumbnail_url}`} alt={dep.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-6 h-6 text-gray-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium text-white">{dep.name}</span>
                                                    <span className={`px-2 py-0.5 text-xs rounded ${
                                                        dep.isRequired ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                        {dep.isRequired ? 'Requis' : 'Recommandé'}
                                                    </span>
                                                    {dep.type === 'product' && (
                                                        <span className="px-2 py-0.5 text-xs bg-hyt-accent/20 text-hyt-accent rounded">
                                                            Produit du site
                                                        </span>
                                                    )}
                                                </div>
                                                {dep.versionInfo && (
                                                    <p className="text-sm text-gray-400">Version: {dep.versionInfo}</p>
                                                )}
                                                {dep.creator && (
                                                    <p className="text-xs text-gray-500">par {dep.creator}</p>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeDependency(index)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn-ghost"
                        >
                            Annuler
                        </button>

                        <button
                            type="submit"
                            disabled={uploading || !file}
                            className="btn-primary flex items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Upload en cours...
                                </>
                            ) : (
                                <>
                                    <UploadIcon className="w-5 h-5" />
                                    Ajouter le produit
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Modal Dépendances */}
                {showDepModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-hyt-card border border-hyt-border rounded-xl w-full max-w-lg my-8">
                            <div className="flex items-center justify-between p-4 border-b border-hyt-border">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Link2 className="w-5 h-5 text-hyt-accent" />
                                    Ajouter une dépendance
                                </h3>
                                <button type="button" onClick={closeDepModal} className="text-gray-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-hyt-border">
                                <button
                                    type="button"
                                    onClick={() => { setDepActiveTab('predefined'); setDepSelectedItem(null) }}
                                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                        depActiveTab === 'predefined' ? 'text-hyt-accent border-b-2 border-hyt-accent' : 'text-gray-400'
                                    }`}
                                >
                                    Prédéfinies
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setDepActiveTab('product'); setDepSelectedItem(null) }}
                                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                        depActiveTab === 'product' ? 'text-hyt-accent border-b-2 border-hyt-accent' : 'text-gray-400'
                                    }`}
                                >
                                    Produit du site
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setDepActiveTab('propose'); setDepSelectedItem(null) }}
                                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                        depActiveTab === 'propose' ? 'text-hyt-accent border-b-2 border-hyt-accent' : 'text-gray-400'
                                    }`}
                                >
                                    Proposer
                                </button>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Tab: Prédéfinies */}
                                {depActiveTab === 'predefined' && (
                                    <div className="space-y-3">
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

                                                {/* Liste des dépendances */}
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
                                                                onClick={() => setDepSelectedItem(dep)}
                                                                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                                                                    depSelectedItem?.id === dep.id
                                                                        ? 'border-hyt-accent bg-hyt-accent/10'
                                                                        : 'border-transparent hover:border-hyt-border hover:bg-hyt-dark'
                                                                }`}
                                                            >
                                                                <div className="w-10 h-10 rounded-lg bg-hyt-card flex items-center justify-center overflow-hidden flex-shrink-0">
                                                                    {dep.logo_url ? (
                                                                        <img src={`http://localhost:3001${dep.logo_url}`} alt={dep.name} className="w-full h-full object-contain p-1" />
                                                                    ) : (
                                                                        <Link2 className="w-5 h-5 text-gray-500" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium text-white truncate">{dep.name}</p>
                                                                    {dep.description && (
                                                                        <p className="text-xs text-gray-500 truncate">{dep.description}</p>
                                                                    )}
                                                                </div>
                                                                {depSelectedItem?.id === dep.id && (
                                                                    <div className="w-6 h-6 rounded-full bg-hyt-accent flex items-center justify-center flex-shrink-0">
                                                                        <Check className="w-4 h-4 text-black" />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        ))
                                                    )}
                                                </div>

                                                {/* Dépendance sélectionnée */}
                                                {depSelectedItem && depActiveTab === 'predefined' && (
                                                    <div className="p-3 bg-hyt-accent/10 border border-hyt-accent/30 rounded-lg flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-hyt-card flex items-center justify-center overflow-hidden flex-shrink-0">
                                                            {depSelectedItem.logo_url ? (
                                                                <img src={`http://localhost:3001${depSelectedItem.logo_url}`} alt={depSelectedItem.name} className="w-full h-full object-contain p-1" />
                                                            ) : (
                                                                <Link2 className="w-5 h-5 text-gray-500" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-white">{depSelectedItem.name}</p>
                                                            {depSelectedItem.description && <p className="text-xs text-gray-400">{depSelectedItem.description}</p>}
                                                        </div>
                                                        <button type="button" onClick={() => setDepSelectedItem(null)} className="p-1 text-gray-400 hover:text-white">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Tab: Produit du site */}
                                {depActiveTab === 'product' && (
                                    <div className="space-y-3">
                                        {filteredAvailableProducts.length === 0 && availableProducts.length === 0 ? (
                                            <div className="text-center py-4 text-gray-500 bg-hyt-dark rounded-lg">
                                                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                <p>Aucun autre produit disponible pour ce jeu</p>
                                            </div>
                                        ) : !depSelectedItem ? (
                                            <>
                                                {/* Recherche */}
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                    <input
                                                        type="text"
                                                        value={productSearchQuery}
                                                        onChange={(e) => setProductSearchQuery(e.target.value)}
                                                        placeholder="Rechercher un produit..."
                                                        className="input-field w-full pl-10"
                                                    />
                                                    {productSearchQuery && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setProductSearchQuery('')}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Liste des produits */}
                                                <div className="max-h-60 overflow-y-auto space-y-2 border border-hyt-border rounded-lg p-2 bg-hyt-dark/50">
                                                    {filteredAvailableProducts.length === 0 ? (
                                                        <div className="text-center py-4 text-gray-500">
                                                            <p>Aucun produit trouvé {productSearchQuery && `pour "${productSearchQuery}"`}</p>
                                                        </div>
                                                    ) : (
                                                        filteredAvailableProducts.map(product => (
                                                            <button
                                                                key={product.id}
                                                                type="button"
                                                                onClick={() => setDepSelectedItem(product)}
                                                                className="w-full flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-hyt-border hover:bg-hyt-dark text-left transition-all"
                                                            >
                                                                <div className="w-12 h-12 rounded-lg bg-hyt-card overflow-hidden flex-shrink-0">
                                                                    {product.thumbnail_url ? (
                                                                        <img src={`http://localhost:3001${product.thumbnail_url}`} alt={product.title} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                            <Package className="w-5 h-5 text-gray-500" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium text-white truncate">{product.title}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        par {product.creator_username} • {parseFloat(product.price).toFixed(2)}€
                                                                    </p>
                                                                </div>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            /* Produit sélectionné - Afficher versions */
                                            <div className="space-y-4">
                                                {/* Aperçu produit sélectionné */}
                                                <div className="p-3 bg-hyt-accent/10 border border-hyt-accent/30 rounded-lg flex items-center gap-3">
                                                    <div className="w-14 h-14 rounded-lg bg-hyt-dark overflow-hidden flex-shrink-0">
                                                        {depSelectedItem.thumbnail_url ? (
                                                            <img src={`http://localhost:3001${depSelectedItem.thumbnail_url}`} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="w-6 h-6 text-gray-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-white">{depSelectedItem.title}</p>
                                                        <p className="text-sm text-gray-400">par {depSelectedItem.creator_username}</p>
                                                        <p className="text-xs text-hyt-accent">{parseFloat(depSelectedItem.price).toFixed(2)}€</p>
                                                    </div>
                                                    <button type="button" onClick={() => { setDepSelectedItem(null); setSelectedProductVersion(null) }} className="p-2 text-gray-400 hover:text-white hover:bg-hyt-dark rounded-lg">
                                                        <X className="w-5 h-5" />
                                                    </button>
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
                                                            {/* Option: Dernière version */}
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedProductVersion(null)}
                                                                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                                                                    selectedProductVersion === null
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
                                                                {selectedProductVersion === null && (
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
                                                                    onClick={() => setSelectedProductVersion(version.id)}
                                                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                                                                        selectedProductVersion === version.id
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
                                                                        </p>
                                                                    </div>
                                                                    {selectedProductVersion === version.id && (
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

                                {/* Tab: Proposer */}
                                {depActiveTab === 'propose' && (
                                    <>
                                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                            <p className="text-sm text-blue-400">
                                                Proposez une nouvelle dépendance. Elle sera examinée par notre équipe avant d'être ajoutée.
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Nom de la dépendance *</label>
                                            <input
                                                type="text"
                                                value={proposalName}
                                                onChange={(e) => setProposalName(e.target.value)}
                                                placeholder="Ex: Fabric, Forge, OptiFine..."
                                                className="input-field w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Logo (optionnel)</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setProposalLogo(e.target.files[0])}
                                                className="input-field w-full"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Options communes */}
                                {depActiveTab !== 'propose' && depSelectedItem && (
                                    <>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Version requise (optionnel)</label>
                                            <input
                                                type="text"
                                                value={depVersionInfo}
                                                onChange={(e) => setDepVersionInfo(e.target.value)}
                                                placeholder="Ex: 1.20+, 2.0.0 minimum..."
                                                className="input-field w-full"
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setDepIsRequired(true)}
                                                className={`flex-1 p-3 rounded-lg border transition-colors ${
                                                    depIsRequired ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-hyt-border text-gray-400'
                                                }`}
                                            >
                                                <p className="font-medium">Requis</p>
                                                <p className="text-xs opacity-70">Obligatoire</p>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDepIsRequired(false)}
                                                className={`flex-1 p-3 rounded-lg border transition-colors ${
                                                    !depIsRequired ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400' : 'border-hyt-border text-gray-400'
                                                }`}
                                            >
                                                <p className="font-medium">Recommandé</p>
                                                <p className="text-xs opacity-70">Optionnel</p>
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Note (optionnel)</label>
                                            <input
                                                type="text"
                                                value={depNote}
                                                onChange={(e) => setDepNote(e.target.value)}
                                                placeholder="Information supplémentaire..."
                                                className="input-field w-full"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Boutons */}
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={closeDepModal} className="btn-ghost flex-1">
                                        Annuler
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAddDependency}
                                        disabled={(depActiveTab === 'predefined' && !depSelectedItem) || (depActiveTab === 'product' && !depSelectedItem) || (depActiveTab === 'propose' && !proposalName)}
                                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {depActiveTab === 'propose' ? 'Proposer' : 'Ajouter'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}