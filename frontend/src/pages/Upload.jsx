import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Upload as UploadIcon, X, FileUp, Image, Tag,
    Gamepad2, FolderOpen, DollarSign, FileText, Check
} from 'lucide-react'
import { modelsAPI, gamesAPI, categoriesAPI, tagsAPI, versionsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { LoadingButton } from '../components/Loading'
import toast from 'react-hot-toast'

export default function Upload() {
    const navigate = useNavigate()
    const { isCreator } = useAuth()
    const fileInputRef = useRef(null)

    const [loading, setLoading] = useState(false)
    const [games, setGames] = useState([])
    const [categories, setCategories] = useState([])
    const [allTags, setAllTags] = useState([])
    const [versions, setVersions] = useState([])

    // Form data
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [gameId, setGameId] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [selectedTags, setSelectedTags] = useState([])
    const [selectedVersions, setSelectedVersions] = useState([])
    const [file, setFile] = useState(null)

    useEffect(() => {
        if (!isCreator()) {
            toast.error('Vous devez être créateur pour uploader des modèles')
            navigate('/dashboard')
            return
        }

        fetchData()
    }, [])

    useEffect(() => {
        if (gameId) {
            fetchCategoriesAndVersions()
        } else {
            setCategories([])
            setVersions([])
            setCategoryId('')
            setSelectedVersions([])
        }
    }, [gameId])

    const fetchData = async () => {
        try {
            const [gamesRes, tagsRes] = await Promise.all([
                gamesAPI.getAll(),
                tagsAPI.getAll()
            ])
            setGames(gamesRes.data.games || gamesRes.data || [])
            setAllTags(tagsRes.data.tags || tagsRes.data || [])
        } catch (error) {
            console.error('Failed to fetch data:', error)
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

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            // Check file size (max 100MB)
            if (selectedFile.size > 100 * 1024 * 1024) {
                toast.error('Le fichier est trop volumineux (max 100MB)')
                return
            }
            setFile(selectedFile)
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

        if (!file) {
            toast.error('Veuillez sélectionner un fichier')
            return
        }

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

        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('title', title.trim())
            formData.append('description', description.trim())
            formData.append('price', Math.round(parseFloat(price) * 100)) // Convert to cents
            formData.append('gameId', gameId)
            if (categoryId) formData.append('categoryId', categoryId)
            formData.append('tagIds', JSON.stringify(selectedTags))
            formData.append('versionIds', JSON.stringify(selectedVersions))

            await modelsAPI.uploadDetailed(formData)
            toast.success('Modèle uploadé avec succès ! Il sera visible après validation.')
            navigate('/dashboard')
        } catch (error) {
            console.error('Upload failed:', error)
            toast.error(error.response?.data?.error || 'Erreur lors de l\'upload')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="font-display text-3xl font-bold text-white mb-2">
                        Uploader un modèle
                    </h1>
                    <p className="text-gray-400">
                        Partagez votre création avec la communauté
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Upload */}
                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                        <label className="block text-sm font-medium text-white mb-4">
                            <FileUp className="w-5 h-5 inline mr-2" />
                            Fichier du modèle *
                        </label>

                        {!file ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-hyt-border rounded-xl p-12 text-center cursor-pointer hover:border-hyt-accent/50 transition-colors"
                            >
                                <UploadIcon className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                                <p className="text-white font-medium mb-2">
                                    Cliquez pour sélectionner un fichier
                                </p>
                                <p className="text-gray-500 text-sm">
                                    ZIP, RAR, 7Z, FBX, OBJ... (max 100MB)
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-hyt-dark rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-hyt-accent/20 flex items-center justify-center">
                                        <Check className="w-5 h-5 text-hyt-accent" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{file.name}</p>
                                        <p className="text-gray-500 text-sm">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFile(null)}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                            accept=".zip,.rar,.7z,.fbx,.obj,.blend,.max,.c4d"
                        />
                    </div>

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
                                placeholder="Ex: Voiture de sport HD"
                                className="input-field w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Décrivez votre modèle..."
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

                    {/* Submit */}
                    <div className="flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="btn-ghost"
                        >
                            Annuler
                        </button>
                        <LoadingButton
                            type="submit"
                            loading={loading}
                            className="btn-primary"
                        >
                            <UploadIcon className="w-5 h-5 mr-2" />
                            Uploader le modèle
                        </LoadingButton>
                    </div>
                </form>
            </div>
        </div>
    )
}