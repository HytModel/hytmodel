import React, { useState, useEffect } from 'react'
import {
    Package, Plus, Edit2, Trash2, X, Search, Check,
    Percent, DollarSign, Calendar, Eye, EyeOff,
    AlertTriangle, Gift, ShoppingBag, Loader2
} from 'lucide-react'
import { bundlesAPI, modelsAPI } from '../services/api.js'
import { useTranslation } from '../context/LanguageContext'
import toast from 'react-hot-toast'

export default function BundleManager() {
    const { t } = useTranslation()
    const [bundles, setBundles] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingBundle, setEditingBundle] = useState(null)

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discount_type: 'PERCENT',
        discount_value: 10,
        product_ids: [],
        starts_at: '',
        ends_at: ''
    })

    // Products selection
    const [myProducts, setMyProducts] = useState([])
    const [productSearch, setProductSearch] = useState('')
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadBundles()
    }, [])

    const loadBundles = async () => {
        try {
            const { data } = await bundlesAPI.getMy()
            setBundles(data.bundles || [])
        } catch (error) {
            console.error('Failed to load bundles:', error)
            toast.error(t('bundles.errors.loadFailed'))
        } finally {
            setLoading(false)
        }
    }

    const loadMyProducts = async () => {
        setLoadingProducts(true)
        try {
            const { data } = await modelsAPI.getMyProducts()
            setMyProducts(data.models?.filter(m => m.status === 'APPROVED') || [])
        } catch (error) {
            console.error('Failed to load products:', error)
        } finally {
            setLoadingProducts(false)
        }
    }

    const openCreateModal = () => {
        setEditingBundle(null)
        setFormData({
            title: '',
            description: '',
            discount_type: 'PERCENT',
            discount_value: 10,
            product_ids: [],
            starts_at: '',
            ends_at: ''
        })
        loadMyProducts()
        setShowModal(true)
    }

    const openEditModal = (bundle) => {
        setEditingBundle(bundle)
        setFormData({
            title: bundle.title,
            description: bundle.description || '',
            discount_type: bundle.discount_type,
            discount_value: parseFloat(bundle.discount_value),
            product_ids: bundle.items?.map(i => i.id) || [],
            starts_at: bundle.starts_at ? bundle.starts_at.split('T')[0] : '',
            ends_at: bundle.ends_at ? bundle.ends_at.split('T')[0] : ''
        })
        loadMyProducts()
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.product_ids.length < 2) {
            toast.error(t('bundles.errors.minProducts'))
            return
        }

        // Calculer le prix estimé
        const selectedProducts = myProducts.filter(p => formData.product_ids.includes(p.id))
        const originalPrice = selectedProducts.reduce((sum, p) => sum + parseFloat(p.price), 0)
        let finalPrice

        if (formData.discount_type === 'PERCENT') {
            finalPrice = originalPrice * (1 - formData.discount_value / 100)
        } else {
            finalPrice = originalPrice - formData.discount_value
        }

        if (finalPrice < 5) {
            toast.error(t('bundles.errors.minPrice', { price: finalPrice.toFixed(2) }))
            return
        }

        setSaving(true)
        try {
            if (editingBundle) {
                await bundlesAPI.update(editingBundle.id, formData)
                toast.success(t('bundles.success.updated'))
            } else {
                await bundlesAPI.create(formData)
                toast.success(t('bundles.success.created'))
            }
            setShowModal(false)
            loadBundles()
        } catch (error) {
            toast.error(error.response?.data?.error || t('bundles.errors.generic'))
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (bundleId) => {
        if (!confirm(t('bundles.confirmDelete'))) return

        try {
            await bundlesAPI.delete(bundleId)
            toast.success(t('bundles.success.deleted'))
            loadBundles()
        } catch (error) {
            toast.error(t('bundles.errors.deleteFailed'))
        }
    }

    const handleToggleActive = async (bundle) => {
        try {
            await bundlesAPI.update(bundle.id, { is_active: !bundle.is_active })
            toast.success(bundle.is_active ? t('bundles.success.deactivated') : t('bundles.success.activated'))
            loadBundles()
        } catch (error) {
            toast.error(t('bundles.errors.generic'))
        }
    }

    const toggleProduct = (productId) => {
        setFormData(prev => ({
            ...prev,
            product_ids: prev.product_ids.includes(productId)
                ? prev.product_ids.filter(id => id !== productId)
                : [...prev.product_ids, productId]
        }))
    }

    // Calculer le prix en temps réel
    const calculatePrices = () => {
        const selectedProducts = myProducts.filter(p => formData.product_ids.includes(p.id))
        const originalPrice = selectedProducts.reduce((sum, p) => sum + parseFloat(p.price), 0)
        let finalPrice

        if (formData.discount_type === 'PERCENT') {
            finalPrice = originalPrice * (1 - formData.discount_value / 100)
        } else {
            finalPrice = originalPrice - formData.discount_value
        }

        return {
            original: originalPrice,
            final: Math.max(finalPrice, 0),
            savings: originalPrice - Math.max(finalPrice, 0),
            isValid: finalPrice >= 5
        }
    }

    const prices = calculatePrices()

    const filteredProducts = myProducts.filter(p =>
        p.title.toLowerCase().includes(productSearch.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-hyt-accent" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Gift className="w-6 h-6 text-hyt-accent" />
                        {t('bundles.title')}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {t('bundles.subtitle')}
                    </p>
                </div>
                <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    {t('bundles.createBundle')}
                </button>
            </div>

            {/* Liste des bundles */}
            {bundles.length === 0 ? (
                <div className="bg-hyt-card border border-hyt-border rounded-xl p-12 text-center">
                    <Gift className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">{t('bundles.empty.title')}</h3>
                    <p className="text-gray-400 mb-6">
                        {t('bundles.empty.description')}
                    </p>
                    <button onClick={openCreateModal} className="btn-primary">
                        {t('bundles.empty.cta')}
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {bundles.map(bundle => (
                        <div key={bundle.id} className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-white">{bundle.title}</h3>
                                        {bundle.is_active ? (
                                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                                                {t('bundles.status.active')}
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded-full">
                                                {t('bundles.status.inactive')}
                                            </span>
                                        )}
                                    </div>

                                    {bundle.description && (
                                        <p className="text-gray-400 text-sm mb-3">{bundle.description}</p>
                                    )}

                                    {/* Produits inclus */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {bundle.items?.map(item => (
                                            <div key={item.id} className="flex items-center gap-2 px-3 py-1 bg-hyt-dark rounded-lg">
                                                {item.thumbnail_url && (
                                                    <img
                                                        src={`http://localhost:3001${item.thumbnail_url}`}
                                                        alt={item.title}
                                                        className="w-6 h-6 rounded object-cover"
                                                    />
                                                )}
                                                <span className="text-sm text-gray-300">{item.title}</span>
                                                <span className="text-xs text-gray-500">{parseFloat(item.price).toFixed(2)}€</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Prix et remise */}
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <span className="text-gray-500 text-sm line-through">
                                                {parseFloat(bundle.original_price).toFixed(2)}€
                                            </span>
                                            <span className="ml-2 text-2xl font-bold text-hyt-accent">
                                                {parseFloat(bundle.final_price).toFixed(2)}€
                                            </span>
                                        </div>
                                        <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium">
                                            {bundle.discount_type === 'PERCENT'
                                                ? `-${bundle.discount_value}%`
                                                : `-${parseFloat(bundle.discount_value).toFixed(2)}€`
                                            }
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {t('bundles.stats', { products: bundle.item_count, sales: bundle.sales_count || 0 })}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleActive(bundle)}
                                        className="p-2 text-gray-400 hover:text-white transition-colors"
                                        title={bundle.is_active ? t('bundles.actions.deactivate') : t('bundles.actions.activate')}
                                    >
                                        {bundle.is_active ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => openEditModal(bundle)}
                                        className="p-2 text-gray-400 hover:text-hyt-accent transition-colors"
                                        title={t('bundles.actions.edit')}
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(bundle.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        title={t('bundles.actions.delete')}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Création/Edition */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-hyt-card border border-hyt-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-hyt-border">
                            <h3 className="text-xl font-bold text-white">
                                {editingBundle ? t('bundles.modal.editTitle') : t('bundles.modal.createTitle')}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Titre */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    {t('bundles.form.titleLabel')} *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder={t('bundles.form.titlePlaceholder')}
                                    className="input-field w-full"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    {t('bundles.form.descriptionLabel')}
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder={t('bundles.form.descriptionPlaceholder')}
                                    className="input-field w-full resize-none"
                                    rows={3}
                                />
                            </div>

                            {/* Type et valeur de remise */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        {t('bundles.form.discountTypeLabel')} *
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, discount_type: 'PERCENT' }))}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                                                formData.discount_type === 'PERCENT'
                                                    ? 'border-hyt-accent bg-hyt-accent/10 text-hyt-accent'
                                                    : 'border-hyt-border text-gray-400 hover:border-gray-500'
                                            }`}
                                        >
                                            <Percent className="w-5 h-5" />
                                            {t('bundles.form.discountPercent')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, discount_type: 'FIXED' }))}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                                                formData.discount_type === 'FIXED'
                                                    ? 'border-hyt-accent bg-hyt-accent/10 text-hyt-accent'
                                                    : 'border-hyt-border text-gray-400 hover:border-gray-500'
                                            }`}
                                        >
                                            <DollarSign className="w-5 h-5" />
                                            {t('bundles.form.discountFixed')}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        {t('bundles.form.discountValueLabel')} *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.discount_value}
                                            onChange={(e) => setFormData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                                            min="1"
                                            max={formData.discount_type === 'PERCENT' ? 99 : 1000}
                                            step={formData.discount_type === 'PERCENT' ? 1 : 0.5}
                                            className="input-field w-full pr-10"
                                            required
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                                            {formData.discount_type === 'PERCENT' ? '%' : '€'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Sélection des produits */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    {t('bundles.form.productsLabel')} *
                                </label>

                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        placeholder={t('bundles.form.searchPlaceholder')}
                                        className="input-field w-full pl-10"
                                    />
                                </div>

                                <div className="border border-hyt-border rounded-lg max-h-60 overflow-y-auto">
                                    {loadingProducts ? (
                                        <div className="p-4 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-hyt-accent mx-auto" />
                                        </div>
                                    ) : filteredProducts.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">
                                            {t('bundles.form.noProducts')}
                                        </div>
                                    ) : (
                                        filteredProducts.map(product => (
                                            <div
                                                key={product.id}
                                                onClick={() => toggleProduct(product.id)}
                                                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                                                    formData.product_ids.includes(product.id)
                                                        ? 'bg-hyt-accent/10'
                                                        : 'hover:bg-hyt-dark'
                                                }`}
                                            >
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                                                    formData.product_ids.includes(product.id)
                                                        ? 'border-hyt-accent bg-hyt-accent'
                                                        : 'border-gray-500'
                                                }`}>
                                                    {formData.product_ids.includes(product.id) && (
                                                        <Check className="w-3 h-3 text-black" />
                                                    )}
                                                </div>
                                                {product.thumbnail_url && (
                                                    <img
                                                        src={`http://localhost:3001${product.thumbnail_url}`}
                                                        alt={product.title}
                                                        className="w-10 h-10 rounded object-cover"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium truncate">{product.title}</p>
                                                    <p className="text-sm text-gray-500">{product.game_name}</p>
                                                </div>
                                                <span className="text-hyt-accent font-medium">
                                                    {parseFloat(product.price).toFixed(2)}€
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <p className="text-sm text-gray-500 mt-2">
                                    {t('bundles.form.selectedCount', { count: formData.product_ids.length })}
                                </p>
                            </div>

                            {/* Aperçu des prix */}
                            {formData.product_ids.length >= 2 && (
                                <div className={`p-4 rounded-lg border ${prices.isValid ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-gray-400 text-sm">{t('bundles.preview.originalPrice')}</p>
                                            <p className="text-lg text-white line-through">{prices.original.toFixed(2)}€</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">{t('bundles.preview.savings')}</p>
                                            <p className="text-lg text-green-400">-{prices.savings.toFixed(2)}€</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-sm">{t('bundles.preview.finalPrice')}</p>
                                            <p className={`text-2xl font-bold ${prices.isValid ? 'text-hyt-accent' : 'text-red-500'}`}>
                                                {prices.final.toFixed(2)}€
                                            </p>
                                        </div>
                                    </div>

                                    {!prices.isValid && (
                                        <div className="flex items-center gap-2 mt-3 text-red-400 text-sm">
                                            <AlertTriangle className="w-4 h-4" />
                                            {t('bundles.preview.minPriceWarning')}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Dates optionnelles */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        {t('bundles.form.startDate')}
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.starts_at}
                                        onChange={(e) => setFormData(prev => ({ ...prev, starts_at: e.target.value }))}
                                        className="input-field w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        {t('bundles.form.endDate')}
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.ends_at}
                                        onChange={(e) => setFormData(prev => ({ ...prev, ends_at: e.target.value }))}
                                        className="input-field w-full"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-hyt-border">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || formData.product_ids.length < 2 || !prices.isValid}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Gift className="w-5 h-5" />
                                            {editingBundle ? t('bundles.form.update') : t('bundles.form.create')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}