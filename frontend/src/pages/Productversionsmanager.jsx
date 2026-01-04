import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Package, Plus, Upload, Trash2, Star, Edit2, X, Loader2,
    Check, Download, Calendar, FileArchive, ChevronDown, ChevronUp,
    AlertCircle, Layers, CheckCircle
} from 'lucide-react'
import { modelFileVersionsAPI, versionsAPI } from '../services/api'
import toast from 'react-hot-toast'

// Modal d'ajout/édition de version
function VersionModal({ isOpen, onClose, modelId, gameId, editingVersion, onSuccess }) {
    const [versionNumber, setVersionNumber] = useState('')
    const [changelog, setChangelog] = useState('')
    const [file, setFile] = useState(null)
    const [compatibleVersions, setCompatibleVersions] = useState([])
    const [isLatest, setIsLatest] = useState(true)
    const [loading, setLoading] = useState(false)
    const [gameVersions, setGameVersions] = useState([])
    const [loadingGameVersions, setLoadingGameVersions] = useState(false)

    useEffect(() => {
        if (isOpen && gameId) {
            loadGameVersions()
        }
    }, [isOpen, gameId])

    useEffect(() => {
        if (editingVersion) {
            setVersionNumber(editingVersion.version_number)
            setChangelog(editingVersion.changelog || '')
            setCompatibleVersions(editingVersion.compatible_versions?.map(v => v.id) || [])
            setIsLatest(editingVersion.is_latest)
        } else {
            setVersionNumber('')
            setChangelog('')
            setFile(null)
            setCompatibleVersions([])
            setIsLatest(true)
        }
    }, [editingVersion, isOpen])

    const loadGameVersions = async () => {
        setLoadingGameVersions(true)
        try {
            const { data } = await versionsAPI.getByGame(gameId)
            setGameVersions(data.versions || [])
        } catch (error) {
            console.error('Failed to load game versions:', error)
        } finally {
            setLoadingGameVersions(false)
        }
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

        setLoading(true)
        try {
            if (editingVersion) {
                // Modification
                await modelFileVersionsAPI.update(modelId, editingVersion.id, {
                    changelog,
                    compatibleVersions,
                    isLatest
                })
                toast.success('Version mise à jour')
            } else {
                // Création
                const formData = new FormData()
                formData.append('file', file)
                formData.append('versionNumber', versionNumber.trim())
                formData.append('changelog', changelog)
                formData.append('compatibleVersions', JSON.stringify(compatibleVersions))
                formData.append('isLatest', isLatest)

                await modelFileVersionsAPI.create(modelId, formData)
                toast.success('Version ajoutée')
            }

            onSuccess()
            onClose()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setLoading(false)
        }
    }

    const toggleGameVersion = (versionId) => {
        setCompatibleVersions(prev =>
            prev.includes(versionId)
                ? prev.filter(id => id !== versionId)
                : [...prev, versionId]
        )
    }

    const selectAllVersions = () => {
        setCompatibleVersions(gameVersions.map(v => v.id))
    }

    const clearAllVersions = () => {
        setCompatibleVersions([])
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-hyt-card border border-hyt-border rounded-xl w-full max-w-lg my-8"
            >
                <div className="flex items-center justify-between p-4 border-b border-hyt-border">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-hyt-accent" />
                        {editingVersion ? 'Modifier la version' : 'Nouvelle version'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Numéro de version */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            Numéro de version *
                        </label>
                        <input
                            type="text"
                            value={versionNumber}
                            onChange={(e) => setVersionNumber(e.target.value)}
                            placeholder="Ex: 1.0.0, 2.1.3, v3.0..."
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
                                    id="version-file"
                                />
                                <label htmlFor="version-file" className="cursor-pointer">
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
                                            <p className="text-gray-400">
                                                Cliquez pour sélectionner un fichier
                                            </p>
                                            <p className="text-gray-500 text-xs mt-1">
                                                ZIP, RAR, 7Z, TAR, GZ (max 500MB)
                                            </p>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Versions du jeu compatibles */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-gray-400">
                                Versions du jeu compatibles
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={selectAllVersions}
                                    className="text-xs text-hyt-accent hover:underline"
                                >
                                    Tout sélectionner
                                </button>
                                <span className="text-gray-600">|</span>
                                <button
                                    type="button"
                                    onClick={clearAllVersions}
                                    className="text-xs text-gray-400 hover:underline"
                                >
                                    Effacer
                                </button>
                            </div>
                        </div>

                        {loadingGameVersions ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-hyt-accent" />
                            </div>
                        ) : gameVersions.length === 0 ? (
                            <p className="text-gray-500 text-sm py-2">
                                Aucune version de jeu disponible
                            </p>
                        ) : (
                            <div className="max-h-40 overflow-y-auto border border-hyt-border rounded-lg p-2 space-y-1">
                                {gameVersions.map(version => (
                                    <label
                                        key={version.id}
                                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                                            compatibleVersions.includes(version.id)
                                                ? 'bg-hyt-accent/20 text-hyt-accent'
                                                : 'hover:bg-hyt-dark text-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={compatibleVersions.includes(version.id)}
                                            onChange={() => toggleGameVersion(version.id)}
                                            className="sr-only"
                                        />
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                            compatibleVersions.includes(version.id)
                                                ? 'bg-hyt-accent border-hyt-accent'
                                                : 'border-gray-500'
                                        }`}>
                                            {compatibleVersions.includes(version.id) && (
                                                <Check className="w-3 h-3 text-black" />
                                            )}
                                        </div>
                                        <span>{version.version}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            {compatibleVersions.length} version(s) sélectionnée(s)
                        </p>
                    </div>

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
                            <p className="text-gray-500 text-xs">
                                Cette version sera téléchargée par défaut
                            </p>
                        </div>
                    </label>

                    {/* Boutons */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn-ghost flex-1">
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4" />
                            )}
                            {editingVersion ? 'Mettre à jour' : 'Ajouter'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

// Composant principal de gestion des versions
export default function ProductVersionsManager({ modelId, gameId }) {
    const [versions, setVersions] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingVersion, setEditingVersion] = useState(null)
    const [expandedVersion, setExpandedVersion] = useState(null)
    const [processing, setProcessing] = useState(null)

    useEffect(() => {
        if (modelId) {
            loadVersions()
        }
    }, [modelId])

    const loadVersions = async () => {
        setLoading(true)
        try {
            const { data } = await modelFileVersionsAPI.getByModel(modelId)
            setVersions(data.versions || [])
        } catch (error) {
            console.error('Failed to load versions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSetLatest = async (versionId) => {
        setProcessing(versionId)
        try {
            await modelFileVersionsAPI.setLatest(modelId, versionId)
            toast.success('Version définie comme principale')
            loadVersions()
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
            loadVersions()
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur')
        } finally {
            setProcessing(null)
        }
    }

    const openEditModal = (version) => {
        setEditingVersion(version)
        setModalOpen(true)
    }

    const openCreateModal = () => {
        setEditingVersion(null)
        setModalOpen(true)
    }

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B'
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
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-hyt-accent" />
                    Versions du fichier
                </h3>
                <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nouvelle version
                </button>
            </div>

            {/* Liste des versions */}
            {versions.length === 0 ? (
                <div className="bg-hyt-dark border border-hyt-border rounded-xl p-8 text-center">
                    <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-white font-medium">Aucune version</p>
                    <p className="text-gray-400 text-sm mt-1">
                        Ajoutez la première version de votre fichier
                    </p>
                    <button onClick={openCreateModal} className="btn-primary mt-4">
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
                                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-hyt-card/50"
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
                                        <span className="flex items-center gap-1">
                                            <FileArchive className="w-3 h-3" />
                                            {formatFileSize(version.file_size)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Download className="w-3 h-3" />
                                            {version.download_count} téléchargements
                                        </span>
                                    </div>
                                </div>

                                {/* Versions compatibles */}
                                {version.compatible_versions?.length > 0 && (
                                    <div className="hidden sm:flex items-center gap-1 flex-wrap max-w-xs">
                                        {version.compatible_versions.slice(0, 3).map(cv => (
                                            <span key={cv.id} className="px-2 py-0.5 bg-hyt-border text-gray-300 text-xs rounded">
                                                {cv.version}
                                            </span>
                                        ))}
                                        {version.compatible_versions.length > 3 && (
                                            <span className="text-gray-500 text-xs">
                                                +{version.compatible_versions.length - 3}
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
                            <AnimatePresence>
                                {expandedVersion === version.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-hyt-border"
                                    >
                                        <div className="p-4 space-y-4">
                                            {/* Changelog */}
                                            {version.changelog && (
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">Notes de version :</p>
                                                    <p className="text-gray-300 text-sm bg-hyt-card p-3 rounded-lg whitespace-pre-wrap">
                                                        {version.changelog}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Versions compatibles détaillées */}
                                            {version.compatible_versions?.length > 0 && (
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-2">Versions du jeu compatibles :</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {version.compatible_versions.map(cv => (
                                                            <span
                                                                key={cv.id}
                                                                className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg flex items-center gap-1"
                                                            >
                                                                <CheckCircle className="w-3 h-3" />
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
                                                    onClick={() => openEditModal(version)}
                                                    className="btn-ghost text-sm flex items-center gap-1"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Modifier
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(version.id)}
                                                    disabled={processing === version.id || versions.length <= 1}
                                                    className="btn-ghost text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    {processing === version.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <VersionModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false)
                    setEditingVersion(null)
                }}
                modelId={modelId}
                gameId={gameId}
                editingVersion={editingVersion}
                onSuccess={loadVersions}
            />
        </div>
    )
}