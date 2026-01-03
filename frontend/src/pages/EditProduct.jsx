import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    ArrowLeft, Save, Loader2, Package, FileText,
    DollarSign, Gamepad2, Tag, Image, Trash2,
    Plus, Youtube, Star, X, AlertCircle, AlertTriangle
} from 'lucide-react'
import { modelsAPI, gamesAPI, categoriesAPI, tagsAPI, versionsAPI, modelImagesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'

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
    const [existingImages, setExistingImages] = useState([]) // Images déjà uploadées
    const [newImages, setNewImages] = useState([]) // Nouvelles images à uploader
    const [imagesToDelete, setImagesToDelete] = useState([]) // IDs des images à supprimer
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
            fetchTags() // Charger les tags quand le jeu change
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
            const allTags = data.tags || data || []
            // Filtrer: tags du jeu sélectionné + tags globaux (sans game_id)
            const filteredTags = allTags.filter(tag =>
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