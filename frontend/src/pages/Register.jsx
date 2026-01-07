import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/LanguageContext'
import { LoadingButton } from '../components/Loading'
import toast from 'react-hot-toast'

export default function Register() {
    const { t } = useTranslation()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [acceptTerms, setAcceptTerms] = useState(false)
    const [loading, setLoading] = useState(false)

    const { register } = useAuth()
    const navigate = useNavigate()

    const passwordRequirements = [
        { text: t('register.requirements.minLength'), valid: password.length >= 8 },
        { text: t('register.requirements.uppercase'), valid: /[A-Z]/.test(password) },
        { text: t('register.requirements.number'), valid: /[0-9]/.test(password) },
    ]

    const isPasswordValid = passwordRequirements.every(req => req.valid)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!username || !email || !password) {
            toast.error(t('register.errors.fillAllFields'))
            return
        }

        if (password !== confirmPassword) {
            toast.error(t('register.errors.passwordMismatch'))
            return
        }

        if (!isPasswordValid) {
            toast.error(t('register.errors.passwordInvalid'))
            return
        }

        if (!acceptTerms) {
            toast.error(t('register.errors.acceptTerms'))
            return
        }

        setLoading(true)

        try {
            await register(username, email, password)
            toast.success(t('register.success'))
            navigate('/')
        } catch (error) {
            const message = error.response?.data?.error || t('register.errors.registerFailed')
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20">
            {/* Background */}
            <div className="absolute inset-0 mesh-bg" />

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-hyt-accent to-hyt-purple flex items-center justify-center shadow-glow">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                    </Link>
                    <h1 className="font-display text-3xl font-bold text-white mb-2">
                        {t('register.title')}
                    </h1>
                    <p className="text-gray-500">
                        {t('register.subtitle')}
                    </p>
                </div>

                {/* Form */}
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                {t('register.username')}
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder={t('register.usernamePlaceholder')}
                                    className="input-field pl-12"
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                {t('register.email')}
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('register.emailPlaceholder')}
                                    className="input-field pl-12"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                {t('register.password')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field pl-12 pr-12"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password Requirements */}
                            {password && (
                                <div className="mt-3 space-y-1">
                                    {passwordRequirements.map((req, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center gap-2 text-xs ${
                                                req.valid ? 'text-hyt-success' : 'text-gray-500'
                                            }`}
                                        >
                                            <Check className={`w-3 h-3 ${req.valid ? 'opacity-100' : 'opacity-30'}`} />
                                            {req.text}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                {t('register.confirmPassword')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field pl-12"
                                    autoComplete="new-password"
                                />
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="mt-1 text-xs text-red-400">
                                    {t('register.errors.passwordMismatch')}
                                </p>
                            )}
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={acceptTerms}
                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-hyt-border bg-hyt-darker text-hyt-accent focus:ring-hyt-accent focus:ring-offset-0"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-400">
                                {t('register.acceptTerms.prefix')}{' '}
                                <Link to="/terms" className="text-hyt-accent hover:underline">
                                    {t('register.acceptTerms.terms')}
                                </Link>{' '}
                                {t('register.acceptTerms.and')}{' '}
                                <Link to="/privacy" className="text-hyt-accent hover:underline">
                                    {t('register.acceptTerms.privacy')}
                                </Link>
                            </label>
                        </div>

                        {/* Submit */}
                        <LoadingButton
                            type="submit"
                            loading={loading}
                            className="btn-primary w-full py-3"
                        >
                            {t('register.submit')}
                        </LoadingButton>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-hyt-border" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-hyt-card text-gray-500">{t('register.or')}</span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <p className="text-center text-gray-400">
                        {t('register.hasAccount')}{' '}
                        <Link to="/login" className="text-hyt-accent font-medium hover:underline">
                            {t('register.login')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}