import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
    ShoppingCart, Download, Star, Eye, Calendar, User,
    Tag, Gamepad2, FolderOpen, Check, ArrowLeft, Share2,
    ChevronLeft, ChevronRight, Youtube, X, ZoomIn
} from 'lucide-react'
import { modelsAPI, modelImagesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import Loading, { LoadingButton } from '../components/Loading'
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

export default function ModelDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const { addToCart, isInCart } = useCart()

    const [model, setModel] = useState(null)
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [userRating, setUserRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [showImageModal, setShowImageModal] = useState(false)

    const inCart = model ? isInCart(model.id) : false

    useEffect(() => {
        fetchModel()
        fetchImages()
    }, [id])

    const fetchModel = async () => {
        try {
            const { data } = await modelsAPI.getById(id)
            setModel(data.model)
        } catch (error) {
            console.error('Failed to fetch model:', error)
            toast.error('Produit non trouvé')
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

    const handleDownload = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/models/${id}` } })
            return
        }

        setDownloading(true)
        try {
            const response = await modelsAPI.download(id)
            const blob = new Blob([response.data])
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${model.title}.zip`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.success('Téléchargement démarré')
        } catch (error) {
            const message = error.response?.data?.error || 'Erreur lors du téléchargement'
            toast.error(message)
        } finally {
            setDownloading(false)
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
            toast.success('Note enregistrée')
            fetchModel()
        } catch (error) {
            const message = error.response?.data?.error || 'Erreur lors de la notation'
            toast.error(message)
        }
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success('Lien copié !')
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
                    Retour aux produits
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

                            {/* Navigation arrows */}
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
                                    Vidéo de présentation
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
                                <p className="text-xs text-gray-500">{model.rating_count || 0} avis</p>
                            </div>
                            <div className="card text-center">
                                <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                                    <Eye className="w-5 h-5" />
                                    <span className="font-bold text-lg">{model.views || 0}</span>
                                </div>
                                <p className="text-xs text-gray-500">Vues</p>
                            </div>
                            <div className="card text-center">
                                <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                                    <Download className="w-5 h-5" />
                                    <span className="font-bold text-lg">{model.downloads || 0}</span>
                                </div>
                                <p className="text-xs text-gray-500">Téléchargements</p>
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
                        </div>

                        {/* Title */}
                        <h1 className="font-display text-4xl font-bold text-white mb-4">
                            {model.title}
                        </h1>

                        {/* Creator */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center">
                                <span className="text-sm font-bold text-white">
                                    {model.creator_username?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-white">{model.creator_username || 'Créateur'}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(model.created_at).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        {model.description && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-white mb-2">Description</h3>
                                <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{model.description}</p>
                            </div>
                        )}

                        {/* Tags */}
                        {model.tags && model.tags.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    Tags
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

                        {/* Versions */}
                        {model.versions && model.versions.length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-white mb-2">Versions compatibles</h3>
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
                                <span className="text-gray-400">Prix</span>
                                <span className="font-display text-4xl font-bold text-white">
                                    {parseFloat(model.price).toFixed(2)}€
                                </span>
                            </div>

                            <div className="space-y-3">
                                {isOwner ? (
                                    <Link to={`/dashboard/models/${model.id}/edit`} className="btn-secondary w-full text-center block">
                                        Modifier mon produit
                                    </Link>
                                ) : (
                                    <>
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
                                                    Dans le panier
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart className="w-5 h-5" />
                                                    Ajouter au panier
                                                </>
                                            )}
                                        </button>

                                        <LoadingButton
                                            onClick={handleDownload}
                                            loading={downloading}
                                            className="btn-secondary w-full flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-5 h-5" />
                                            Télécharger
                                        </LoadingButton>
                                    </>
                                )}

                                <button
                                    onClick={handleShare}
                                    className="btn-ghost w-full flex items-center justify-center gap-2"
                                >
                                    <Share2 className="w-5 h-5" />
                                    Partager
                                </button>
                            </div>
                        </div>

                        {/* Rating */}
                        {isAuthenticated && !isOwner && (
                            <div className="card mt-4">
                                <h3 className="font-semibold text-white mb-3">Noter ce produit</h3>
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
        </div>
    )
}