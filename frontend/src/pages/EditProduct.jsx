import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
    ArrowLeft, Save, Loader2, Package, FileText,
    DollarSign, Gamepad2, Tag, Image, Trash2
} from 'lucide-react'
import { modelsAPI, gamesAPI, categoriesAPI, tagsAPI, versionsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Loading, { LoadingButton } from '../components/Loading'
import toast from 'react-hot-toast'

export default function EditProduct() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

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
        } else {
            setCategories([])
            setVersions([])
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
        } catch (error) {
            console.error('Failed to fetch product:', error)
            toast.error('Produit non trouvé')
            navigate('/dashboard/models')
        } finally {
            setLoading(false)
        }
    }

    const fetchOptions = async () => {
        try {
            const [gamesRes, tagsRes] = await Promise.all([
                gamesAPI.getAll(),
                tagsAPI.getAll()
            ])
            setGames(gamesRes.data.games || gamesRes.data || [])
            setAllTags(tagsRes.data.tags || tagsRes.data || [])
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

    const toggleTag = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        )
    }

    const toggleVersion = (versionId) => {
        setSelectedVersions(prev =>
            prev.includes(versionId)
                ? prev.filter(id => id !== versionId)
                : [...prev, versionId]
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!title.trim()) {
            toast.error('Veuillez entrer un titre')
            return
        }

        if (!price || parseFloat(price) < 0) {
            toast.error('Veuillez entrer un prix valide')
            return
        }

        if (!gameId) {
            toast.error('Veuillez sélectionner un jeu')
            return
        }

        setSaving(true)

        try {
            await modelsAPI.update(id, {
                title: title.trim(),
                description: description.trim(),
                price: parseFloat(price),
                gameId,
                categoryId: categoryId || null,
                tagIds: selectedTags,
                versionIds: selectedVersions
            })

            toast.success('Produit mis à jour ! Il sera visible après validation.')
            navigate('/dashboard/models')
        } catch (error) {
            console.error('Update failed:', error)
            toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <Loading fullScreen />
    }

    if (!product) {
        return null
    }

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

                {/* Thumbnail Preview */}
                {product.thumbnail_url && (
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 mb-6">
                        <label className="block text-sm font-medium text-white mb-4">
                            <Image className="w-5 h-5 inline mr-2" />
                            Image actuelle
                        </label>
                        <div className="w-40 h-40 rounded-lg overflow-hidden bg-hyt-dark">
                            <img
                                src={product.thumbnail_url}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
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
                                Prix (€) *
                            </label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                className="input-field w-full"
                                required
                            />
                        </div>
                    </div>

                    {/* Game & Category */}
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 space-y-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Gamepad2 className="w-5 h-5" />
                            Jeu & Catégorie
                        </h3>

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
                                            onClick={() => toggleVersion(version.id)}
                                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                                selectedVersions.includes(version.id)
                                                    ? 'bg-hyt-accent text-white'
                                                    : 'bg-hyt-dark text-gray-400 hover:text-white'
                                            }`}
                                        >
                                            {version.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    {allTags.length > 0 && (
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
                                        onClick={() => toggleTag(tag.id)}
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

                    {/* Warning */}
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                <Loader2 className="w-5 h-5 text-orange-500" />
                            </div>
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

                        <LoadingButton
                            type="submit"
                            loading={saving}
                            className="btn-primary"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            Enregistrer et soumettre à validation
                        </LoadingButton>
                    </div>
                </form>
            </div>
        </div>
    )
}