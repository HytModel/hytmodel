import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Shield, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/LanguageContext'
import toast from 'react-hot-toast'

export default function Login() {
    const { t } = useTranslation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    // États pour la 2FA
    const [requires2FA, setRequires2FA] = useState(false)
    const [totpCode, setTotpCode] = useState('')

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email || !password) {
            toast.error(t('login.errors.fillAllFields'))
            return
        }

        // Si 2FA requis, vérifier le code
        if (requires2FA && !totpCode) {
            toast.error(t('login.errors.enter2FACode'))
            return
        }

        setLoading(true)

        try {
            const result = await login(email, password, totpCode || undefined)

            // Si le serveur demande la 2FA
            if (result?.requires2FA) {
                setRequires2FA(true)
                setLoading(false)
                return
            }

            if (result?.success) {
                navigate('/')
            }
        } catch (error) {
            console.error('Login error:', error)
            toast.error(t('login.errors.loginFailed'))
        } finally {
            setLoading(false)
        }
    }

    const handleBack = () => {
        setRequires2FA(false)
        setTotpCode('')
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20">
            <div className="absolute inset-0 mesh-bg" />

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <img src="/logo.png" alt="HytModel" className="h-12 w-auto" />
                    </Link>
                    <h1 className="font-display text-3xl font-bold text-white mb-2">
                        {requires2FA ? t('login.twoFA.title') : t('login.title')}
                    </h1>
                    <p className="text-gray-500">
                        {requires2FA
                            ? t('login.twoFA.subtitle')
                            : t('login.subtitle')
                        }
                    </p>
                </div>

                <div className="card">
                    {requires2FA ? (
                        /* Formulaire 2FA */
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {t('common.back')}
                            </button>

                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-hyt-accent/20 flex items-center justify-center">
                                    <Shield className="w-8 h-8 text-hyt-accent" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    {t('login.twoFA.codeLabel')}
                                </label>
                                <input
                                    type="text"
                                    value={totpCode}
                                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="input-field w-full text-center text-2xl tracking-[0.5em] font-mono"
                                    maxLength={6}
                                    autoFocus
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    {t('login.twoFA.codeHint')}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || totpCode.length !== 6}
                                className="btn-primary w-full py-3 flex items-center justify-center"
                            >
                                {loading ? (
                                    <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    t('login.twoFA.verify')
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center">
                                {t('login.twoFA.backupCodeHint')}
                            </p>
                        </form>
                    ) : (
                        /* Formulaire de connexion normal */
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    {t('login.email')}
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t('login.emailPlaceholder')}
                                        className="input-field pl-12 w-full"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    {t('login.password')}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="input-field pl-12 pr-12 w-full"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-3 flex items-center justify-center"
                            >
                                {loading ? (
                                    <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    t('login.submit')
                                )}
                            </button>
                        </form>
                    )}

                    {!requires2FA && (
                        <div className="mt-6 text-center">
                            <p className="text-gray-400">
                                {t('login.noAccount')}{' '}
                                <Link to="/register" className="text-hyt-accent font-medium hover:underline">
                                    {t('login.createAccount')}
                                </Link>
                            </p>
                        </div>
                    )}

                    {/* OAuth Buttons */}
                    {!requires2FA && (
                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-hyt-border"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-hyt-card text-gray-500">{t('login.orContinueWith')}</span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                {/* Discord */}
                                <a
                                    href="http://localhost:3001/api/auth/discord"
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg font-medium transition-colors"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                                    </svg>
                                    Discord
                                </a>

                                {/* Google */}
                                <a
                                    href="http://localhost:3001/api/auth/google"
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-100 text-gray-800 rounded-lg font-medium transition-colors"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    Google
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}