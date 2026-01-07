import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft, PenTool, Upload, X, Euro, Calendar,
    Gamepad2, FolderOpen, FileText, Loader2, AlertCircle
} from 'lucide-react'
import { customOrdersAPI, gamesAPI, categoriesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function NewCustomRequest() {
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)
    const [games, setGames] = useState([])
    const [categories, setCategories] = useState([])

    const [form, setForm] = useState({
        title: '',
        description: '',
        budget_min: '',
        budget_max: '',
        deadline: '',
        game_id: '',
        category_id: ''
    })

    const [attachments, setAttachments] = useState([])

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/custom-orders/new' } })
            return
        }
        loadOptions()
    }, [isAuthenticated])

    const loadOptions = async () => {
        try {
            const [gamesRes, categoriesRes] = await Promise.all([
                gamesAPI.getAll(),
                categoriesAPI.getAll()
            ])
            setGames(gamesRes.data.games || [])
            setCategories(categoriesRes.data.categories || [])
        } catch (error) {
            console.error('Failed to load options:', error)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files)
        const maxSize = 50 * 1024 * 1024 // 50MB

        const validFiles = files.filter(file => {
            if (file.size > maxSize) {
                toast.error(`${file.name} est trop volumineux (max 50MB)`)
                return false
            }
            return true
        })

        if (attachments.length + validFiles.length > 5) {
            toast.error('Maximum 5 fichiers autorisés')
            return
        }

        setAttachments(prev => [...prev, ...validFiles])
    }

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!form.title.trim() || !form.description.trim()) {
            toast.error('Titre et description requis')
            return
        }

        if (form.description.length < 50) {
            toast.error('La description doit faire au moins 50 caractères')
            return
        }

        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('title', form.title)
            formData.append('description', form.description)
            if (form.budget_min) formData.append('budget_min', form.budget_min)
            if (form.budget_max) formData.append('budget_max', form.budget_max)
            if (form.deadline) formData.append('deadline', form.deadline)
            if (form.game_id) formData.append('game_id', form.game_id)
            if (form.category_id) formData.append('category_id', form.category_id)

            attachments.forEach(file => {
                formData.append('attachments', file)
            })

            const { data } = await customOrdersAPI.createRequest(formData)

            toast.success('Demande envoyée ! Elle sera examinée par notre équipe.')
            navigate(`/custom-orders/requests/${data.request.id}`)
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur lors de la création')
        } finally {
            setLoading(false)
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    return (
        <div className="min-h-screen bg-hyt-dark pt-20 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link
                        to="/custom-orders"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour
                    </Link>

                    <h1 className="text-3xl font-display font-bold text-white mb-2">
                        Nouvelle demande sur mesure
                    </h1>
                    <p className="text-gray-400">
                        Décrivez votre projet pour recevoir des offres de nos créateurs
                    </p>
                </motion.div>

                {/* Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8"
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="text-blue-400 font-medium mb-1">À savoir</p>
                            <ul className="text-gray-400 space-y-1">
                                <li>• Votre demande sera examinée par notre équipe avant publication</li>
                                <li>• Les créateurs affiliés pourront ensuite vous faire des offres</li>
                                <li>• Paiement en 2 fois : 50% à l'acceptation, 50% à la livraison</li>
                                <li>• En cas d'annulation, seuls 50% de l'acompte sont remboursés</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Titre */}
                    <div className="card">
                        <label className="block text-sm font-medium text-white mb-2">
                            Titre de votre demande *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Ex: Interface de menu FiveM moderne"
                            className="input-field w-full"
                            maxLength={255}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="card">
                        <label className="block text-sm font-medium text-white mb-2">
                            Description détaillée *
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Décrivez en détail ce que vous souhaitez : fonctionnalités, style visuel, références, etc."
                            className="input-field w-full h-40 resize-none"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            {form.description.length}/50 caractères minimum
                        </p>
                    </div>

                    {/* Budget et deadline */}
                    <div className="card">
                        <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                            <Euro className="w-5 h-5 text-hyt-accent" />
                            Budget et délai
                        </h3>

                        <div className="grid sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    Budget minimum (€)
                                </label>
                                <input
                                    type="number"
                                    name="budget_min"
                                    value={form.budget_min}
                                    onChange={handleChange}
                                    placeholder="50"
                                    min="0"
                                    className="input-field w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    Budget maximum (€)
                                </label>
                                <input
                                    type="number"
                                    name="budget_max"
                                    value={form.budget_max}
                                    onChange={handleChange}
                                    placeholder="200"
                                    min="0"
                                    className="input-field w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    Date limite souhaitée
                                </label>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={form.deadline}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="input-field w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Catégories */}
                    <div className="card">
                        <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                            <FolderOpen className="w-5 h-5 text-hyt-accent" />
                            Catégorie
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    Jeu concerné
                                </label>
                                <select
                                    name="game_id"
                                    value={form.game_id}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                >
                                    <option value="">Sélectionner un jeu</option>
                                    {games.map(game => (
                                        <option key={game.id} value={game.id}>{game.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    Type de produit
                                </label>
                                <select
                                    name="category_id"
                                    value={form.category_id}
                                    onChange={handleChange}
                                    className="input-field w-full"
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Pièces jointes */}
                    <div className="card">
                        <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-hyt-accent" />
                            Pièces jointes (optionnel)
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Ajoutez des images de référence, maquettes, ou tout document utile (max 5 fichiers, 50MB chacun)
                        </p>

                        <div className="space-y-3">
                            {/* Upload zone */}
                            <label className="block border-2 border-dashed border-hyt-border rounded-xl p-6 text-center cursor-pointer hover:border-hyt-accent/50 transition-colors">
                                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">
                                    Cliquez ou glissez des fichiers ici
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                    JPG, PNG, GIF, PDF, ZIP, RAR
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png,.gif,.pdf,.zip,.rar,.doc,.docx"
                                />
                            </label>

                            {/* Liste des fichiers */}
                            {attachments.length > 0 && (
                                <div className="space-y-2">
                                    {attachments.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-hyt-dark rounded-lg"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-white text-sm truncate">{file.name}</p>
                                                    <p className="text-gray-500 text-xs">{formatFileSize(file.size)}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(index)}
                                                className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Link
                            to="/custom-orders"
                            className="btn-ghost flex-1 text-center"
                        >
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={loading || !form.title || form.description.length < 50}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <PenTool className="w-5 h-5" />
                            )}
                            Envoyer ma demande
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    )
}