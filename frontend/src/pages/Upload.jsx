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
                gamesAPI.list(),
                tagsAPI.list()
            ])
            setGames(gamesRes.data.games || [])
            setAllTags(tagsRes.data.tags || [])
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
            setCategories(categoriesRes.data.categories || [])
            setVersions(versionsRes.data.versions || [])
        } catch (error) {
            console.error('Failed to fetch categories/versions:', error)
        }
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            if (selectedFile.size > 50 * 1024 * 1024) {
                toast.error('Le fichier ne doit pas dépasser 50 MB')
                return
            }
            setFile(selectedFile)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) {
            if (droppedFile.size > 50 * 1024 * 1024) {
                toast.error('Le fichier ne doit pas dépasser 50 MB')
                return
            }
            setFile(droppedFile)
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

        if (!title || !price || !gameId || !categoryId || !file) {
            toast.error('Veuillez remplir tous les champs obligatoires')
            return
        }

        if (parseFloat(price) < 5) {
            toast.error('Le prix minimum est de 5€')
            return
        }

        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('title', title)
            formData.append('description', description)
            formData.append('price', price)
            formData.append('gameId', gameId)
            formData.append('categoryId', categoryId)
            formData.append('tagIds', JSON.stringify(selectedTags))
            formData.append('versionIds', JSON.stringify(selectedVersions))
            formData.append('file', file)

            await modelsAPI.uploadDetailed(formData)

            toast.success('Modèle uploadé avec succès ! Il sera vérifié par notre équipe.')
            navigate('/dashboard')
        } catch (error) {
            const message = error.response?.data?.error || 'Erreur lors de l\'upload'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    const gameTags = gameId
        ? allTags.filter(t => t.game_id === gameId || !t.game_id)
        : allTags.filter(t => !t.game_id)

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center shadow-glow">
                        <UploadIcon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="font-display text-3xl font-bold text-white mb-2">
                        Uploader un modèle
                    </h1>
                    <p className="text-gray-500">
                        Partagez votre création avec la communauté
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Upload */}
                    <div className="card">
                        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <FileUp className="w-5 h-5 text-hyt-accent" />
                            Fichier du modèle
                        </h2>

                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                                file
                                    ? 'border-hyt-success bg-hyt-success/5'
                                    : 'border-hyt-border hover:border-hyt-accent/50'
                            }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".zip,.rar,.7z,.fbx,.obj,.blend"
                            />

                            {file ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-hyt-success/10 flex items-center justify-center">
                                        <Check className="w-6 h-6 text-hyt-success" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-white">{file.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setFile(null)
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-400"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <FileUp className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                                    <p className="text-white mb-2">
                                        Glissez votre fichier ici ou cliquez pour sélectionner
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        ZIP, RAR, 7Z, FBX, OBJ, BLEND (max 50 MB)
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="card">
                        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-hyt-accent" />
                            Informations
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Titre *
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Nom de votre modèle"
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Décrivez votre modèle..."
                                    rows={4}
                                    className="input-field resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    <DollarSign className="w-4 h-4 inline mr-1" />
                                    Prix (€) *
                                </label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="5.00"
                                    min="5"
                                    step="0.01"
                                    className="input-field"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Prix minimum : 5€</p>
                            </div>
                        </div>
                    </div>

                    {/* Game & Category */}
                    <div className="card">
                        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <Gamepad2 className="w-5 h-5 text-hyt-accent" />
                            Jeu et catégorie
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Jeu *
                                </label>
                                <select
                                    value={gameId}
                                    onChange={(e) => setGameId(e.target.value)}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Sélectionner un jeu</option>
                                    {games.map(game => (
                                        <option key={game.id} value={game.id}>{game.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Catégorie *
                                </label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="input-field"
                                    required
                                    disabled={!gameId}
                                >
                                    <option value="">
                                        {gameId ? 'Sélectionner une catégorie' : 'Sélectionnez d\'abord un jeu'}
                                    </option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    {gameTags.length > 0 && (
                        <div className="card">
                            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Tag className="w-5 h-5 text-hyt-accent" />
                                Tags
                            </h2>

                            <div className="flex flex-wrap gap-2">
                                {gameTags.map(tag => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => toggleTag(tag.id)}
                                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                                            selectedTags.includes(tag.id)
                                                ? 'bg-hyt-accent text-hyt-dark'
                                                : 'bg-hyt-darker text-gray-400 hover:text-white border border-hyt-border'
                                        }`}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Versions */}
                    {versions.length > 0 && (
                        <div className="card">
                            <h2 className="font-semibold text-white mb-4">
                                Versions compatibles
                            </h2>

                            <div className="flex flex-wrap gap-2">
                                {versions.map(version => (
                                    <button
                                        key={version.id}
                                        type="button"
                                        onClick={() => toggleVersion(version.id)}
                                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                                            selectedVersions.includes(version.id)
                                                ? 'bg-hyt-success text-white'
                                                : 'bg-hyt-darker text-gray-400 hover:text-white border border-hyt-border'
                                        }`}
                                    >
                                        {version.version}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <LoadingButton
                        type="submit"
                        loading={loading}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        Publier le modèle
                    </LoadingButton>

                    <p className="text-center text-sm text-gray-500">
                        En publiant, vous acceptez nos{' '}
                        <a href="/terms" className="text-hyt-accent hover:underline">conditions d'utilisation</a>
                    </p>
                </form>
            </div>
        </div>
    )
}