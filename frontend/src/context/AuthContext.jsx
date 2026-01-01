import React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Au démarrage : vérifie si un token existe
    useEffect(() => {
        const token = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser))
            } catch (e) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
            }
        }
        setLoading(false)
    }, [])

    // Inscription
    const register = async (username, email, password) => {
        try {
            const { data } = await authAPI.register({ username, email, password })
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            setUser(data.user)
            toast.success('Compte créé avec succès !')
            return { success: true }
        } catch (error) {
            const message = error.response?.data?.error || 'Erreur lors de l\'inscription'
            toast.error(message)
            return { success: false, error: message }
        }
    }

    // Connexion
    const login = async (email, password) => {
        try {
            const { data } = await authAPI.login({ email, password })
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            setUser(data.user)
            toast.success('Connexion réussie !')
            return { success: true }
        } catch (error) {
            const message = error.response?.data?.error || 'Email ou mot de passe incorrect'
            toast.error(message)
            return { success: false, error: message }
        }
    }

    // Déconnexion
    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        toast.success('Déconnexion réussie')
    }

    // Vérifications de rôle
    const isCreator = () => {
        return user && ['CREATOR', 'STAFF', 'ADMIN'].includes(user.role)
    }

    const isStaff = () => {
        return user && ['STAFF', 'ADMIN'].includes(user.role)
    }

    const isAdmin = () => {
        return user && user.role === 'ADMIN'
    }

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            register,
            login,
            logout,
            isCreator,
            isStaff,
            isAdmin
        }}>
            {children}
        </AuthContext.Provider>
    )
}

// Hook pour utiliser le context facilement
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}