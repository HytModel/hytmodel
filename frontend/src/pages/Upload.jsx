import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Upload as UploadIcon, X, Image, Film, FileArchive,
    DollarSign, Tag, Gamepad2, Loader2, Star, Trash2,
    Plus, Youtube, Check, AlertCircle
} from 'lucide-react'
import { modelsAPI, gamesAPI, categoriesAPI, tagsAPI, versionsAPI, modelImagesAPI } from '../services/api'
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
    const [images, setImages] = useState([]) // { file, preview, isPrimary }
    const [primaryImageIndex, setPrimaryImageIndex] = useState(0)

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
        fetchTags()
    }, [])

    useEffect(() => {
        if (gameId) {
            fetchCategories()
            fetchVersions()
        } else {
            setCategories([])
            setVersions([])
            setCategoryId('')
        }
    }, [gameId])

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
            setTags(data.tags || data || [])
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

        // Valider chaque image
        const validImages = []
        let hasError = false

        const processFiles = async () => {
            for (const file of files) {
                // Vérifier le poids (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`${file.name} est trop lourd (max 5MB)`)
                    hasError = true
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
            // Si on supprime l'image principale, définir la première comme principale
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
            // 1. Upload du produit
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

            // 2. Upload des images si présentes
            if (images.length > 0) {
                const imageFormData = new FormData()

                // Ajouter l'image principale en premier
                const primaryImage = images.find(img => img.isPrimary)
                if (primaryImage) {
                    imageFormData.append('images', primaryImage.file)
                }

                // Ajouter les autres images
                images.forEach(img => {
                    if (!img.isPrimary) {
                        imageFormData.append('images', img.file)
                    }
                })

                await modelImagesAPI.upload(modelId, imageFormData)
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
                            {/* Images existantes */}
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

                                    {/* Badge principale */}
                                    {img.isPrimary && (
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-hyt-accent text-black text-xs font-bold rounded">
                                            <Star className="w-3 h-3 inline mr-1" />
                                            Principale
                                        </div>
                                    )}

                                    {/* Bouton supprimer */}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeImage(index) }}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    {/* Overlay si non principale */}
                                    {!img.isPrimary && (
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-xs font-medium">
                                                Définir comme principale
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Bouton ajouter */}
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
                    {tags.length > 0 && (
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
            </div>
        </div>
    )
}