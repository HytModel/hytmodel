import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    ShoppingCart, Download, Star, Eye, Calendar, User,
    Tag, Gamepad2, FolderOpen, Check, ArrowLeft, Share2,
    ChevronLeft, ChevronRight, Youtube, X, ZoomIn, AlertTriangle, Flag,
    Package, ChevronDown, Link2, ExternalLink, AlertCircle, Gift
} from 'lucide-react'
import { modelsAPI, modelImagesAPI, modelFileVersionsAPI, versionsAPI, dependenciesAPI, checkoutAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useTranslation } from '../context/LanguageContext'
import Loading, { LoadingButton } from '../components/Loading'
import ReportProductModal from '../components/ReportProductModal'
import toast from 'react-hot-toast'

function ImageModal({ image, onClose, onPrev, onNext, hasPrev, hasNext }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft' && hasPrev) onPrev()
            if (e.key === 'ArrowRight' && hasNext) onNext()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onClose, onPrev, onNext, hasPrev, hasNext])

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
                <X className="w-6 h-6" />
            </button>

            {hasPrev && (
                <button
                    onClick={onPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
            )}

            {hasNext && (
                <button
                    onClick={onNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                >
                    <ChevronRight className="w-8 h-8" />
                </button>
            )}

            <img
                src={image}
                alt="Full size"
                className="max-w-full max-h-full object-contain"
            />
        </div>
    )
}

// Composant d'affichage des dépendances
function DependenciesSection({ modelId }) {
    const { t } = useTranslation()
    const [dependencies, setDependencies] = useState([])
    const [loading, setLoading] = useState(true)
    const { cart } = useCart()

    useEffect(() => {
        loadDependencies()
    }, [modelId])

    const loadDependencies = async () => {
        try {
            const { data } = await dependenciesAPI.getByModel(modelId)
            setDependencies(data.dependencies || [])
        } catch (error) {
            console.error('Failed to load dependencies:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="mb-6">
                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    {t('modelDetail.dependencies.title')}
                </h3>
                <div className="animate-pulse bg-hyt-darker rounded-lg h-20"></div>
            </div>
        )
    }

    if (dependencies.length === 0) {
        return null
    }

    const requiredDeps = dependencies.filter(d => d.is_required)
    const recommendedDeps = dependencies.filter(d => !d.is_required)

    const checkProductInCart = (productId) => {
        return cart?.some(item => item.model_id === productId)
    }

    return (
        <div className="mb-6">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-hyt-accent" />
                {t('modelDetail.dependencies.title')}
                <span className="text-xs text-gray-500 font-normal">({dependencies.length})</span>
            </h3>

            <div className="space-y-3">
                {/* Dépendances requises */}
                {requiredDeps.length > 0 && (
                    <div>
                        <p className="text-xs text-red-400 font-medium mb-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {t('modelDetail.dependencies.requiredFor')}
                        </p>
                        <div className="space-y-2">
                            {requiredDeps.map(dep => (
                                <DependencyItem
                                    key={dep.id}
                                    dep={dep}
                                    isRequired={true}
                                    inCart={dep.product_id ? checkProductInCart(dep.product_id) : false}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Dépendances recommandées */}
                {recommendedDeps.length > 0 && (
                    <div>
                        <p className="text-xs text-yellow-400 font-medium mb-2">{t('modelDetail.dependencies.recommended')}</p>
                        <div className="space-y-2">
                            {recommendedDeps.map(dep => (
                                <DependencyItem
                                    key={dep.id}
                                    dep={dep}
                                    isRequired={false}
                                    inCart={dep.product_id ? checkProductInCart(dep.product_id) : false}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// Item de dépendance individuel
function DependencyItem({ dep, isRequired, inCart }) {
    const { t } = useTranslation()
    const isPredefined = !!dep.dependency_id
    const isProduct = !!dep.product_id

    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${
            isRequired
                ? 'bg-red-500/5 border-red-500/20'
                : 'bg-yellow-500/5 border-yellow-500/20'
        }`}>
            {/* Logo/Thumbnail */}
            <div className="w-12 h-12 rounded-lg bg-hyt-card flex items-center justify-center overflow-hidden flex-shrink-0">
                {dep.dep_logo ? (
                    <img
                        src={`http://localhost:3001${dep.dep_logo}`}
                        alt={dep.dep_name}
                        className="w-full h-full object-contain p-1"
                    />
                ) : dep.product_thumbnail ? (
                    <img
                        src={dep.product_thumbnail.startsWith('http') ? dep.product_thumbnail : `http://localhost:3001${dep.product_thumbnail}`}
                        alt={dep.product_title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Link2 className="w-5 h-5 text-gray-500" />
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-white">
                        {dep.dep_name || dep.product_title}
                    </span>
                    {isProduct && (
                        <span className="px-1.5 py-0.5 text-xs bg-hyt-accent/20 text-hyt-accent rounded">
                            {t('modelDetail.dependencies.siteProduct')}
                        </span>
                    )}
                    {inCart && (
                        <span className="px-1.5 py-0.5 text-xs bg-green-500/20 text-green-400 rounded flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {t('modelDetail.dependencies.inCart')}
                        </span>
                    )}
                </div>

                {dep.version_info && (
                    <p className="text-xs text-gray-500">{t('modelDetail.dependencies.version')}: {dep.version_info}</p>
                )}

                {dep.product_creator && (
                    <p className="text-xs text-gray-500">{t('common.by')} {dep.product_creator}</p>
                )}

                {dep.note && (
                    <p className="text-xs text-gray-400 italic mt-1">{dep.note}</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {isPredefined && dep.dep_website && (
                    <a
                        href={dep.dep_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-white hover:bg-hyt-dark rounded-lg transition-colors"
                        title={t('modelDetail.dependencies.officialSite')}
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                )}

                {isProduct && (
                    <Link
                        to={`/models/${dep.product_id}`}
                        className="px-3 py-1.5 text-sm bg-hyt-accent/20 text-hyt-accent hover:bg-hyt-accent/30 rounded-lg transition-colors"
                    >
                        {t('modelDetail.dependencies.view')}
                    </Link>
                )}
            </div>
        </div>
    )
}

// Composant de sélection de version pour le téléchargement
function DownloadSection({ modelId, gameId, onDownloadStart, onDownloadEnd }) {
    const { t } = useTranslation()
    const [fileVersions, setFileVersions] = useState([])
    const [gameVersions, setGameVersions] = useState([])
    const [selectedVersion, setSelectedVersion] = useState(null)
    const [filterGameVersion, setFilterGameVersion] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        loadData()
    }, [modelId, gameId])

    useEffect(() => {
        if (filterGameVersion) {
            loadFilteredVersions()
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
            setFileVersions(loadedVersions)
            setGameVersions(gameVersionsRes.data.versions || [])
            if (loadedVersions.length > 0) {
                const latestVersion = loadedVersions.find(v => v.is_latest) || loadedVersions[0]
                setSelectedVersion(latestVersion)
            }
        } catch (error) {
            console.error('Failed to load versions:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadVersions = async () => {
        try {
            const { data } = await modelFileVersionsAPI.getByModel(modelId)
            setFileVersions(data.versions || [])
        } catch (error) {
            console.error('Failed to load versions:', error)
        }
    }

    const loadFilteredVersions = async () => {
        try {
            const { data } = await modelFileVersionsAPI.getByModel(modelId, filterGameVersion)
            setFileVersions(data.versions || [])

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
        // Déterminer quelle version télécharger
        let versionToDownload = selectedVersion

        // Si pas de version sélectionnée mais une seule existe, la prendre
        if (!versionToDownload && fileVersions.length === 1) {
            versionToDownload = fileVersions[0]
        }

        // Si pas de version sélectionnée mais plusieurs existent, prendre la latest ou la première
        if (!versionToDownload && fileVersions.length > 0) {
            versionToDownload = fileVersions.find(v => v.is_latest) || fileVersions[0]
        }

        // Si toujours pas de version et qu'il y en a plusieurs, demander de sélectionner
        if (!versionToDownload && fileVersions.length > 1) {
            toast.error(t('modelDetail.download.errors.selectVersion'))
            return
        }

        // Si aucune version du tout, télécharger le fichier legacy
        if (!versionToDownload && fileVersions.length === 0) {
            // Téléchargement legacy sans version
            setDownloading(true)
            onDownloadStart?.()
            try {
                const response = await modelsAPI.download(modelId)
                const url = window.URL.createObjectURL(new Blob([response.data]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', 'download.zip')
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)
                toast.success(t('modelDetail.download.success'))
            } catch (error) {
                toast.error(error.response?.data?.error || t('modelDetail.download.errors.failed'))
            } finally {
                setDownloading(false)
                onDownloadEnd?.()
            }
            return
        }

        setDownloading(true)
        onDownloadStart?.()

        try {
            const response = await modelFileVersionsAPI.download(modelId, versionToDownload.id)

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', versionToDownload.file_name || 'download.zip')
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

            toast.success(t('modelDetail.download.success'))
        } catch (error) {
            toast.error(error.response?.data?.error || t('modelDetail.download.errors.failed'))
        } finally {
            setDownloading(false)
            onDownloadEnd?.()
        }
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
            <div className="animate-pulse">
                <div className="h-12 bg-hyt-dark rounded-lg mb-3"></div>
                <div className="h-12 bg-hyt-accent/20 rounded-lg"></div>
            </div>
        )
    }

// Si aucune version ou une seule version → bouton direct sans liste
    if (fileVersions.length <= 1) {
        return (
            <LoadingButton
                onClick={handleDownload}
                loading={downloading}
                className="btn-primary w-full flex items-center justify-center gap-2"
            >
                <Download className="w-5 h-5" />
                {t('modelDetail.download.button')}
                {selectedVersion && ` v${selectedVersion.version_number}`}
            </LoadingButton>
        )
    }

    return (
        <div className="space-y-3">
            {fileVersions.length > 0 && (
                <div>
                    <label className="block text-xs text-gray-500 mb-2">
                        {t('modelDetail.download.availableVersions')}
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {fileVersions.map(version => (
                            <button
                                key={version.id}
                                onClick={() => setSelectedVersion(version)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                                    selectedVersion?.id === version.id
                                        ? 'bg-hyt-accent/10 border-hyt-accent'
                                        : 'bg-hyt-dark border-hyt-border hover:border-hyt-accent/50'
                                }`}
                            >
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    selectedVersion?.id === version.id
                                        ? 'bg-hyt-accent text-black'
                                        : 'border-2 border-gray-500'
                                }`}>
                                    {selectedVersion?.id === version.id && (
                                        <Check className="w-3 h-3" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-white">
                                            v{version.version_number}
                                        </span>
                                        {version.is_latest && (
                                            <span className="px-1.5 py-0.5 bg-hyt-accent/20 text-hyt-accent text-xs rounded">
                                                {t('modelDetail.download.latest')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                        <span>{new Date(version.created_at).toLocaleDateString('fr-FR')}</span>
                                        {version.file_size > 0 && (
                                            <span>• {formatFileSize(version.file_size)}</span>
                                        )}
                                    </div>
                                    {version.compatible_versions?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {version.compatible_versions.slice(0, 3).map(cv => (
                                                <span
                                                    key={cv.id}
                                                    className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded"
                                                >
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
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {gameVersions.length > 0 && fileVersions.some(v => v.compatible_versions?.length > 0) && (
                <div>
                    <label className="block text-xs text-gray-500 mb-1">
                        {t('modelDetail.download.filterByGameVersion')}
                    </label>
                    <select
                        value={filterGameVersion}
                        onChange={(e) => setFilterGameVersion(e.target.value)}
                        className="input-field w-full text-sm"
                    >
                        <option value="">{t('modelDetail.download.allVersions')}</option>
                        {gameVersions.map(gv => (
                            <option key={gv.id} value={gv.id}>{gv.version}</option>
                        ))}
                    </select>
                </div>
            )}

            {selectedVersion?.compatible_versions?.length > 0 && (
                <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-xs text-green-400 mb-1">{t('modelDetail.download.compatibleWith')} :</p>
                    <div className="flex flex-wrap gap-1">
                        {selectedVersion.compatible_versions.map(cv => (
                            <span key={cv.id} className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded">
                                {cv.version}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <LoadingButton
                onClick={handleDownload}
                loading={downloading}
                disabled={!selectedVersion}
                className="btn-primary w-full flex items-center justify-center gap-2"
            >
                <Download className="w-5 h-5" />
                {t('modelDetail.download.button')} {selectedVersion ? `v${selectedVersion.version_number}` : ''}
            </LoadingButton>
        </div>
    )
}

export default function ModelDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const { addToCart, isInCart } = useCart()
    const { t } = useTranslation()

    const [model, setModel] = useState(null)
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [claimingFree, setClaimingFree] = useState(false)
    const [userRating, setUserRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [showImageModal, setShowImageModal] = useState(false)
    const [showReportModal, setShowReportModal] = useState(false)
    const [hasPurchased, setHasPurchased] = useState(false)

    const inCart = model ? isInCart(model.id) : false

    // Check if product is free
    const isFree = model ? parseFloat(model.price) === 0 : false

    useEffect(() => {
        fetchModel()
        fetchImages()
    }, [id, isAuthenticated])

    const fetchModel = async () => {
        try {
            const { data } = await modelsAPI.getById(id)
            setModel(data.model)

            if (isAuthenticated) {
                try {
                    const purchaseRes = await modelsAPI.checkPurchase(id)
                    setHasPurchased(purchaseRes.data.hasPurchased || false)
                } catch (err) {
                    setHasPurchased(false)
                }
            }
        } catch (error) {
            console.error('Failed to fetch model:', error)
            toast.error(t('modelDetail.errors.notFound'))
            navigate('/models')
        } finally {
            setLoading(false)
        }
    }

    const fetchImages = async () => {
        try {
            const { data } = await modelImagesAPI.getByModel(id)
            setImages(data.images || [])
        } catch (error) {
            console.error('Failed to fetch images:', error)
        }
    }

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/models/${id}` } })
            return
        }
        await addToCart(model.id)
    }

    // Handle free product claim
    const handleGetFree = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/models/${id}` } })
            return
        }

        setClaimingFree(true)
        try {
            await checkoutAPI.claimFree(model.id)
            toast.success(t('modelDetail.download.success'))
            setHasPurchased(true)
            // Refresh model data
            fetchModel()
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.error?.includes('déjà')) {
                // Already owned - just update state
                setHasPurchased(true)
                fetchModel()
            } else {
                toast.error(error.response?.data?.error || t('common.error'))
            }
        } finally {
            setClaimingFree(false)
        }
    }

    const handleRate = async (rating) => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/models/${id}` } })
            return
        }

        try {
            await modelsAPI.rate(id, rating)
            setUserRating(rating)
            toast.success(t('modelDetail.rating.success'))
            fetchModel()
        } catch (error) {
            const message = error.response?.data?.error || t('modelDetail.rating.error')
            toast.error(message)
        }
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success(t('modelDetail.share.success'))
    }

    const handleReport = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/models/${id}` } })
            return
        }
        setShowReportModal(true)
    }

    const getYoutubeVideoId = (url) => {
        if (!url) return null
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        const match = url.match(regex)
        return match ? match[1] : null
    }

    const getImageUrl = (img) => {
        if (img.image_url?.startsWith('http')) return img.image_url
        return `http://localhost:3001${img.image_url}`
    }

    const formatNumber = (num) => {
        if (!num && num !== 0) return '0'
        return num.toLocaleString('fr-FR')
    }

    const allImages = images.length > 0
        ? images
        : model?.thumbnail_url
            ? [{ image_url: model.thumbnail_url, is_primary: true }]
            : []

    const currentImage = allImages[selectedImageIndex]

    if (loading) {
        return <Loading fullScreen />
    }

    if (!model) {
        return null
    }

    const isOwner = user?.id === model.creator_id
    const youtubeVideoId = getYoutubeVideoId(model.youtube_url)

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link
                    to="/models"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('modelDetail.backToProducts')}
                </Link>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left - Images */}
                    <div>
                        {/* Image principale */}
                        <div
                            onClick={() => allImages.length > 0 && setShowImageModal(true)}
                            className="aspect-square bg-hyt-card rounded-2xl overflow-hidden border border-hyt-border relative cursor-zoom-in group"
                        >
                            {currentImage ? (
                                <>
                                    <img
                                        src={getImageUrl(currentImage)}
                                        alt={model.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                        <ZoomIn className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-hyt-accent/10 to-hyt-purple/10">
                                    <span className="text-8xl font-bold text-hyt-accent/30">3D</span>
                                </div>
                            )}

                            {/* Badge Gratuit */}
                            {isFree && (
                                <div className="absolute top-4 left-4 px-4 py-2 bg-green-500 text-white font-bold rounded-lg flex items-center gap-2 shadow-lg">
                                    <Gift className="w-5 h-5" />
                                    {t('common.free')}
                                </div>
                            )}

                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)
                                        }}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1)
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                                {allImages.map((img, index) => (
                                    <button
                                        key={img.id || index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                                            selectedImageIndex === index
                                                ? 'border-hyt-accent'
                                                : 'border-transparent hover:border-hyt-accent/50'
                                        }`}
                                    >
                                        <img
                                            src={getImageUrl(img)}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* YouTube Video */}
                        {youtubeVideoId && (
                            <div className="mt-6">
                                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                                    <Youtube className="w-5 h-5 text-red-500" />
                                    {t('modelDetail.youtube.title')}
                                </h3>
                                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                                        className="w-full h-full"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="card text-center">
                                <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                                    <Star className="w-5 h-5 fill-current" />
                                    <span className="font-bold text-lg">
                                        {model.rating_avg ? parseFloat(model.rating_avg).toFixed(1) : '-'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">{formatNumber(model.rating_count || 0)} {t('modelDetail.stats.reviews')}</p>
                            </div>
                            <div className="card text-center">
                                <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                                    <Eye className="w-5 h-5" />
                                    <span className="font-bold text-lg">{formatNumber(model.view_count || model.views || 0)}</span>
                                </div>
                                <p className="text-xs text-gray-500">{t('modelDetail.stats.views')}</p>
                            </div>
                            <div className="card text-center">
                                <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                                    <Download className="w-5 h-5" />
                                    <span className="font-bold text-lg">{formatNumber(model.download_count || model.downloads || 0)}</span>
                                </div>
                                <p className="text-xs text-gray-500">{t('modelDetail.stats.downloads')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right - Info */}
                    <div>
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {model.game_name && (
                                <span className="badge flex items-center gap-1.5">
                                    <Gamepad2 className="w-3.5 h-3.5" />
                                    {model.game_name}
                                </span>
                            )}
                            {model.category_name && (
                                <span className="badge badge-purple flex items-center gap-1.5">
                                    <FolderOpen className="w-3.5 h-3.5" />
                                    {model.category_name}
                                </span>
                            )}
                            {isFree && (
                                <span className="badge bg-green-500/20 text-green-400 flex items-center gap-1.5">
                                    <Gift className="w-3.5 h-3.5" />
                                    {t('common.freeProduct')}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="font-display text-4xl font-bold text-white mb-4">
                            {model.title}
                        </h1>

                        {/* Creator */}
                        <Link
                            to={`/seller/${model.creator_username}`}
                            className="flex items-center gap-3 mb-6 group cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-hyt-accent transition-colors">
                                {model.creator_avatar_url ? (
                                    <img
                                        src={model.creator_avatar_url.startsWith('http') ? model.creator_avatar_url : `http://localhost:3001${model.creator_avatar_url}`}
                                        alt={model.creator_display_name || model.creator_username}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center">
                                        <span className="text-lg font-bold text-white">
                                            {(model.creator_display_name || model.creator_username)?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-white group-hover:text-hyt-accent transition-colors">
                                    {model.creator_display_name || model.creator_username || t('modelDetail.creator')}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(model.created_at).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </Link>

                        {/* Description */}
                        {model.description && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-white mb-2">{t('modelDetail.description')}</h3>
                                <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{model.description}</p>
                            </div>
                        )}

                        {/* Tags */}
                        {model.tags && model.tags.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    {t('modelDetail.tags')}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {model.tags.map((tag) => (
                                        <span key={tag.id} className="px-3 py-1 bg-hyt-darker text-gray-400 rounded-full text-sm">
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Dépendances */}
                        <DependenciesSection modelId={model.id} />

                        {/* Versions compatibles du jeu */}
                        {model.versions && model.versions.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-white mb-2">{t('modelDetail.compatibleVersions')}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {model.versions.map((version) => (
                                        <span key={version.id} className="px-3 py-1 bg-hyt-success/10 text-hyt-success rounded-full text-sm">
                                            {version.version}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Price & Actions */}
                        <div className="card mt-8">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-gray-400">{t('modelDetail.price')}</span>
                                {isFree ? (
                                    <div className="text-right">
                                        <span className="font-display text-4xl font-bold text-green-400">
                                            {t('modelDetail.free')}
                                        </span>
                                        <p className="text-sm text-green-400/70 mt-1">
                                            {t('common.freeProduct')}
                                        </p>
                                    </div>
                                ) : (
                                    <span className="font-display text-4xl font-bold text-white">
                                        {parseFloat(model.price).toFixed(2)}€
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3">
                                {isOwner ? (
                                    <Link to={`/dashboard/models/${model.id}/edit`} className="btn-secondary w-full text-center block">
                                        {t('modelDetail.editProduct')}
                                    </Link>
                                ) : hasPurchased ? (
                                    <>
                                        <DownloadSection
                                            modelId={model.id}
                                            gameId={model.game_id}
                                            onDownloadStart={() => setDownloading(true)}
                                            onDownloadEnd={() => setDownloading(false)}
                                        />

                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleShare}
                                                className="btn-ghost flex-1 flex items-center justify-center gap-2"
                                            >
                                                <Share2 className="w-5 h-5" />
                                                {t('modelDetail.share.button')}
                                            </button>

                                            <button
                                                onClick={handleReport}
                                                className="btn-ghost flex-1 flex items-center justify-center gap-2 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                            >
                                                <Flag className="w-5 h-5" />
                                                {t('modelDetail.report')}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Free product: Get for free button */}
                                        {isFree ? (
                                            <LoadingButton
                                                onClick={handleGetFree}
                                                loading={claimingFree}
                                                className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white transition-colors"
                                            >
                                                <Gift className="w-5 h-5" />
                                                {t('modelDetail.getForFree')}
                                            </LoadingButton>
                                        ) : (
                                            /* Paid product: Add to cart button */
                                            <button
                                                onClick={handleAddToCart}
                                                disabled={inCart}
                                                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                                                    inCart
                                                        ? 'bg-hyt-success text-white cursor-default'
                                                        : 'btn-primary'
                                                }`}
                                            >
                                                {inCart ? (
                                                    <>
                                                        <Check className="w-5 h-5" />
                                                        {t('modelDetail.inCart')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="w-5 h-5" />
                                                        {t('modelDetail.addToCart')}
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleShare}
                                                className="btn-ghost flex-1 flex items-center justify-center gap-2"
                                            >
                                                <Share2 className="w-5 h-5" />
                                                {t('modelDetail.share.button')}
                                            </button>

                                            <button
                                                onClick={handleReport}
                                                className="btn-ghost flex-1 flex items-center justify-center gap-2 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                            >
                                                <Flag className="w-5 h-5" />
                                                {t('modelDetail.report')}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Rating - uniquement si acheté */}
                        {isAuthenticated && !isOwner && hasPurchased && (
                            <div className="card mt-4">
                                <h3 className="font-semibold text-white mb-3">{t('modelDetail.rating.title')}</h3>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => handleRate(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-8 h-8 transition-colors ${
                                                    star <= (hoverRating || userRating)
                                                        ? 'text-yellow-500 fill-yellow-500'
                                                        : 'text-gray-600'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {showImageModal && currentImage && (
                <ImageModal
                    image={getImageUrl(currentImage)}
                    onClose={() => setShowImageModal(false)}
                    onPrev={() => setSelectedImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1)}
                    onNext={() => setSelectedImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1)}
                    hasPrev={allImages.length > 1}
                    hasNext={allImages.length > 1}
                />
            )}

            {/* Report Modal */}
            <ReportProductModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                modelId={model?.id}
                modelTitle={model?.title}
                hasPurchased={hasPurchased}
            />
        </div>
    )
}