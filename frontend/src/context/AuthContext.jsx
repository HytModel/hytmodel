import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, profileAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Au démarrage : vérifie si un token existe
    useEffect(() => {
        const initAuth = () => {
            try {
                const token = localStorage.getItem('token')
                const savedUser = localStorage.getItem('user')

                console.log('AuthContext init - token:', !!token, 'user:', !!savedUser)

                if (token && savedUser) {
                    const parsedUser = JSON.parse(savedUser)
                    console.log('Setting user:', parsedUser)
                    setUser(parsedUser)
                }
            } catch (e) {
                console.error('Error loading auth:', e)
                localStorage.removeItem('token')
                localStorage.removeItem('user')
            } finally {
                setLoading(false)
            }
        }

        initAuth()
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
    const login = async (email, password, totpCode = null) => {
        try {
            const { data } = await authAPI.login({ email, password, totpCode })

            // Si 2FA requis
            if (data.requires2FA) {
                return { success: false, requires2FA: true }
            }

            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
            setUser(data.user)
            toast.success('Connexion réussie !')

            // Rafraîchir pour récupérer les infos complètes si nécessaire
            if (!data.user.avatar_url && !data.user.display_name) {
                setTimeout(async () => {
                    try {
                        const { data: profileData } = await profileAPI.get()
                        const updatedUser = { ...data.user, ...profileData }
                        setUser(updatedUser)
                        localStorage.setItem('user', JSON.stringify(updatedUser))
                    } catch (e) {
                        console.error('Failed to fetch profile after login:', e)
                    }
                }, 100)
            }

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

    // Rafraîchir les infos utilisateur (après modif profil, avatar, etc.)
    const refreshUser = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const { data } = await profileAPI.get()

            // Mettre à jour le state et le localStorage
            const updatedUser = {
                ...user,
                ...data,
                // S'assurer que les champs importants sont présents
                avatar_url: data.avatar_url,
                display_name: data.display_name,
                bio: data.bio,
                website_url: data.website_url,
                social_discord: data.social_discord,
                social_twitter: data.social_twitter,
                social_youtube: data.social_youtube,
                two_factor_enabled: data.two_factor_enabled
            }

            setUser(updatedUser)
            localStorage.setItem('user', JSON.stringify(updatedUser))

            console.log('User refreshed:', updatedUser)
            return updatedUser
        } catch (error) {
            console.error('Failed to refresh user:', error)
            return null
        }
    }

    // Vérifications de rôle
    const isAuthenticated = !!user

    const isCreator = () => {
        return user && ['CREATOR', 'STAFF', 'ADMIN'].includes(user.role)
    }

    const isStaff = () => {
        return user && ['STAFF', 'ADMIN'].includes(user.role)
    }

    const isAdmin = () => {
        return user && user.role === 'ADMIN'
    }

    // Debug log
    useEffect(() => {
        console.log('AuthContext state - user:', user, 'loading:', loading, 'isAuthenticated:', isAuthenticated)
    }, [user, loading])

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated,
            register,
            login,
            logout,
            refreshUser,
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