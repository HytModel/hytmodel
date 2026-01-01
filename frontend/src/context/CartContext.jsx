import React, { createContext, useContext, useState, useEffect } from 'react'
import { cartAPI } from '../services/api'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext()

export function CartProvider({ children }) {
    const [items, setItems] = useState([])
    const [total, setTotal] = useState('0.00')
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()

    // Charger le panier quand l'utilisateur se connecte
    useEffect(() => {
        if (user) {
            fetchCart()
        } else {
            setItems([])
            setTotal('0.00')
        }
    }, [user])

    // Récupérer le panier depuis l'API
    const fetchCart = async () => {
        try {
            setLoading(true)
            const { data } = await cartAPI.get()
            setItems(data.items || [])
            setTotal(data.total || '0.00')
        } catch (error) {
            console.error('Erreur chargement panier:', error)
        } finally {
            setLoading(false)
        }
    }

    // Ajouter un modèle au panier
    const addToCart = async (modelId) => {
        if (!user) {
            toast.error('Connectez-vous pour ajouter au panier')
            return false
        }

        try {
            await cartAPI.add(modelId)
            await fetchCart()
            toast.success('Ajouté au panier !')
            return true
        } catch (error) {
            const message = error.response?.data?.error || 'Erreur lors de l\'ajout'
            toast.error(message)
            return false
        }
    }

    // Retirer un modèle du panier
    const removeFromCart = async (modelId) => {
        try {
            await cartAPI.remove(modelId)
            await fetchCart()
            toast.success('Retiré du panier')
            return true
        } catch (error) {
            toast.error('Erreur lors de la suppression')
            return false
        }
    }

    // Vider le panier
    const clearCart = async () => {
        try {
            await cartAPI.clear()
            setItems([])
            setTotal('0.00')
            toast.success('Panier vidé')
            return true
        } catch (error) {
            toast.error('Erreur lors du vidage')
            return false
        }
    }

    // Vérifier si un modèle est dans le panier
    const isInCart = (modelId) => {
        return items.some(item => item.id === modelId)
    }

    // Nombre d'articles
    const itemCount = items.length

    return (
        <CartContext.Provider value={{
            items,
            total,
            loading,
            itemCount,
            addToCart,
            removeFromCart,
            clearCart,
            isInCart,
            fetchCart
        }}>
            {children}
        </CartContext.Provider>
    )
}

// Hook pour utiliser le context facilement
export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within CartProvider')
    }
    return context
}