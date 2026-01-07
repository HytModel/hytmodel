import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/LanguageContext'
import { profileAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function OAuthCallback() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { refreshUser } = useAuth()
    const { t } = useTranslation()
    const [processing, setProcessing] = useState(true)

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token')
            const error = searchParams.get('error')

            if (error) {
                toast.error(decodeURIComponent(error))
                navigate('/login')
                return
            }

            if (token) {
                try {
                    // Stocker le token
                    localStorage.setItem('token', token)

                    // Décoder le token pour obtenir les infos de base
                    const payload = JSON.parse(atob(token.split('.')[1]))

                    // Récupérer le profil complet
                    const { data } = await profileAPI.get()

                    // Stocker l'utilisateur complet
                    const user = {
                        id: payload.id,
                        role: payload.role,
                        ...data
                    }
                    localStorage.setItem('user', JSON.stringify(user))

                    toast.success(t('oauthCallback.success'))

                    // Rafraîchir et rediriger
                    window.location.href = '/'
                } catch (e) {
                    console.error('OAuth callback error:', e)
                    toast.error(t('oauthCallback.error'))
                    localStorage.removeItem('token')
                    navigate('/login')
                }
            } else {
                navigate('/login')
            }

            setProcessing(false)
        }

        handleCallback()
    }, [searchParams, navigate, t])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-hyt-accent mx-auto mb-4" />
                <p className="text-white text-lg">{t('oauthCallback.loading')}</p>
            </div>
        </div>
    )
}