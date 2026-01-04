import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Download, Package, ChevronDown, Check, Loader2, Calendar,
    FileArchive, Star, Filter, X, CheckCircle, AlertCircle
} from 'lucide-react'
import { modelFileVersionsAPI, versionsAPI } from '../services/api'
import toast from 'react-hot-toast'

// Sélecteur de version pour le téléchargement
export default function DownloadVersionSelector({ modelId, gameId, onDownload }) {
    const [versions, setVersions] = useState([])
    const [gameVersions, setGameVersions] = useState([])
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [selectedVersion, setSelectedVersion] = useState(null)
    const [filterGameVersion, setFilterGameVersion] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)

    useEffect(() => {
        loadData()
    }, [modelId, gameId])

    useEffect(() => {
        if (filterGameVersion) {
            filterByGameVersion()
        } else {
            loadVersions()
        }
    }, [filterGameVersion])

    const loadData = async () => {
        setLoading(true)
        try {
            const [versionsRes, gameVersionsRes] = await Promise.all([
                modelFileVersionsAPI.getByModel(modelId),
                gameId ? versionsAPI.getByGame(gameId) : Promise.resolve({ data: { versions: [] } })
            ])

            const loadedVersions = versionsRes.data.versions || []
            setVersions(loadedVersions)
            setGameVersions(gameVersionsRes.data.versions || [])

            // Sélectionner la version principale par défaut
            const latestVersion = loadedVersions.find(v => v.is_latest) || loadedVersions[0]
            setSelectedVersion(latestVersion)
        } catch (error) {
            console.error('Failed to load versions:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadVersions = async () => {
        try {
            const { data } = await modelFileVersionsAPI.getByModel(modelId)
            setVersions(data.versions || [])
        } catch (error) {
            console.error('Failed to load versions:', error)
        }
    }

    const filterByGameVersion = async () => {
        try {
            const { data } = await modelFileVersionsAPI.getByModel(modelId, filterGameVersion)
            setVersions(data.versions || [])

            // Resélectionner une version compatible
            if (data.versions?.length > 0) {
                const latestCompatible = data.versions.find(v => v.is_latest) || data.versions[0]
                setSelectedVersion(latestCompatible)
            } else {
                setSelectedVersion(null)
            }
        } catch (error) {
            console.error('Failed to filter versions:', error)
        }
    }

    const handleDownload = async () => {
        if (!selectedVersion) {
            toast.error('Sélectionnez une version')
            return
        }

        setDownloading(true)
        try {
            if (onDownload) {
                await onDownload(selectedVersion.id)
            } else {
                const response = await modelFileVersionsAPI.download(modelId, selectedVersion.id)

                // Créer un lien de téléchargement
                const url = window.URL.createObjectURL(new Blob([response.data]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', selectedVersion.file_name || 'download.zip')
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)

                toast.success('Téléchargement démarré')
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erreur de téléchargement')
        } finally {
            setDownloading(false)
        }
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
            <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 text-hyt-accent animate-spin" />
            </div>
        )
    }

    // Si une seule version, afficher simplement le bouton de téléchargement
    if (versions.length <= 1 && !gameVersions.length) {
        return (
            <button
                onClick={handleDownload}
                disabled={downloading || !selectedVersion}
                className="btn-primary w-full flex items-center justify-center gap-2"
            >
                {downloading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Download className="w-5 h-5" />
                )}
                Télécharger
            </button>
        )
    }

    return (
        <div className="space-y-3">
            {/* Filtre par version du jeu */}
            {gameVersions.length > 0 && (
                <div>
                    <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1">
                        <Filter className="w-4 h-4" />
                        Filtrer par version du jeu
                    </label>
                    <select
                        value={filterGameVersion}
                        onChange={(e) => setFilterGameVersion(e.target.value)}
                        className="input-field w-full"
                    >
                        <option value="">Toutes les versions</option>
                        {gameVersions.map(gv => (
                            <option key={gv.id} value={gv.id}>{gv.version}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Sélecteur de version du fichier */}
            <div className="relative">
                <label className="block text-sm text-gray-400 mb-2">
                    Version du fichier
                </label>

                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full flex items-center justify-between p-3 bg-hyt-dark border border-hyt-border rounded-lg hover:border-hyt-accent/50 transition-colors"
                >
                    {selectedVersion ? (
                        <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-hyt-accent" />
                            <div className="text-left">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-white">
                                        v{selectedVersion.version_number}
                                    </span>
                                    {selectedVersion.is_latest && (
                                        <span className="px-1.5 py-0.5 bg-hyt-accent/20 text-hyt-accent text-xs rounded">
                                            Dernière
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500">
                                    {formatFileSize(selectedVersion.file_size)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-gray-400">Sélectionner une version</span>
                    )}
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown des versions */}
                <AnimatePresence>
                    {showDropdown && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-20 w-full mt-2 bg-hyt-card border border-hyt-border rounded-lg shadow-xl max-h-64 overflow-y-auto"
                        >
                            {versions.length === 0 ? (
                                <div className="p-4 text-center text-gray-400">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>Aucune version compatible</p>
                                    {filterGameVersion && (
                                        <button
                                            onClick={() => setFilterGameVersion('')}
                                            className="mt-2 text-hyt-accent text-sm hover:underline"
                                        >
                                            Voir toutes les versions
                                        </button>
                                    )}
                                </div>
                            ) : (
                                versions.map(version => (
                                    <button
                                        key={version.id}
                                        onClick={() => {
                                            setSelectedVersion(version)
                                            setShowDropdown(false)
                                        }}
                                        className={`w-full flex items-start gap-3 p-3 hover:bg-hyt-dark transition-colors text-left ${
                                            selectedVersion?.id === version.id ? 'bg-hyt-accent/10' : ''
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                                            selectedVersion?.id === version.id
                                                ? 'bg-hyt-accent text-black'
                                                : 'border border-gray-500'
                                        }`}>
                                            {selectedVersion?.id === version.id && (
                                                <Check className="w-3 h-3" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-white">
                                                    v{version.version_number}
                                                </span>
                                                {version.is_latest && (
                                                    <span className="px-1.5 py-0.5 bg-hyt-accent/20 text-hyt-accent text-xs rounded flex items-center gap-1">
                                                        <Star className="w-3 h-3" />
                                                        Dernière
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(version.created_at).toLocaleDateString('fr-FR')}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FileArchive className="w-3 h-3" />
                                                    {formatFileSize(version.file_size)}
                                                </span>
                                            </div>

                                            {/* Versions compatibles */}
                                            {version.compatible_versions?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {version.compatible_versions.slice(0, 5).map(cv => (
                                                        <span
                                                            key={cv.id}
                                                            className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded"
                                                        >
                                                            {cv.version}
                                                        </span>
                                                    ))}
                                                    {version.compatible_versions.length > 5 && (
                                                        <span className="text-gray-500 text-xs">
                                                            +{version.compatible_versions.length - 5}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Changelog preview */}
                                            {version.changelog && (
                                                <p className="text-gray-500 text-xs mt-1 truncate">
                                                    {version.changelog}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Infos version sélectionnée */}
            {selectedVersion?.compatible_versions?.length > 0 && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-xs text-green-400 font-medium mb-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Compatible avec :
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {selectedVersion.compatible_versions.map(cv => (
                            <span key={cv.id} className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded">
                                {cv.version}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Bouton de téléchargement */}
            <button
                onClick={handleDownload}
                disabled={downloading || !selectedVersion}
                className="btn-primary w-full flex items-center justify-center gap-2"
            >
                {downloading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Download className="w-5 h-5" />
                )}
                Télécharger v{selectedVersion?.version_number || '...'}
            </button>
        </div>
    )
}

// Composant simplifié pour afficher juste la liste des versions (sans téléchargement)
export function VersionsList({ modelId }) {
    const [versions, setVersions] = useState([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        loadVersions()
    }, [modelId])

    const loadVersions = async () => {
        try {
            const { data } = await modelFileVersionsAPI.getByModel(modelId)
            setVersions(data.versions || [])
        } catch (error) {
            console.error('Failed to load versions:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return null
    if (versions.length <= 1) return null

    return (
        <div className="mt-4">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
            >
                <Package className="w-4 h-4" />
                {versions.length} versions disponibles
                <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-2 space-y-2 overflow-hidden"
                    >
                        {versions.map(version => (
                            <div
                                key={version.id}
                                className={`flex items-center justify-between p-2 rounded-lg ${
                                    version.is_latest ? 'bg-hyt-accent/10 border border-hyt-accent/30' : 'bg-hyt-dark'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-white">v{version.version_number}</span>
                                    {version.is_latest && (
                                        <span className="text-xs text-hyt-accent">Dernière</span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(version.created_at).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}