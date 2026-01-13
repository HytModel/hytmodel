import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    User, Camera, Mail, Lock, Shield, Smartphone,
    Link as LinkIcon, Save, Loader2, Check, X, Copy,
    Eye, EyeOff, AlertTriangle, QrCode, Key, Trash2,
    ExternalLink, LogOut, Monitor, Globe, ChevronDown
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/LanguageContext'
import { profileAPI } from '../services/api'
import toast from 'react-hot-toast'

// Icônes sociales
const DiscordIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
)

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
)

// Drapeaux pour les langues
const FlagFR = () => (
    <svg className="w-5 h-5 rounded-sm" viewBox="0 0 640 480">
        <path fill="#fff" d="M0 0h640v480H0z"/>
        <path fill="#00267f" d="M0 0h213.3v480H0z"/>
        <path fill="#f31830" d="M426.7 0H640v480H426.7z"/>
    </svg>
)

const FlagEN = () => (
    <svg className="w-5 h-5 rounded-sm" viewBox="0 0 640 480">
        <path fill="#012169" d="M0 0h640v480H0z"/>
        <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-178L0 64V0h75z"/>
        <path fill="#C8102E" d="m424 281 216 159v40L369 281h55zm-184 20 6 35L54 480H0l240-179zM640 0v3L391 191l2-44L590 0h50zM0 0l239 176h-60L0 42V0z"/>
        <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z"/>
        <path fill="#C8102E" d="M0 193v96h640v-96H0zM273 0v480h96V0h-96z"/>
    </svg>
)

const languages = [
    { code: 'fr', name: 'Français', flag: FlagFR },
    { code: 'en', name: 'English', flag: FlagEN }
]

export default function Profile() {
    const navigate = useNavigate()
    const { user, refreshUser } = useAuth()
    const { t, language, setLanguage } = useTranslation()
    const avatarInputRef = useRef(null)

    // États du profil
    const [profile, setProfile] = useState({
        display_name: '',
        bio: '',
        website_url: '',
        social_discord: '',
        social_twitter: '',
        social_youtube: ''
    })
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [avatarFile, setAvatarFile] = useState(null)

    // États 2FA
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
    const [showSetup2FA, setShowSetup2FA] = useState(false)
    const [qrCode, setQrCode] = useState('')
    const [secret2FA, setSecret2FA] = useState('')
    const [verifyCode, setVerifyCode] = useState('')
    const [backupCodes, setBackupCodes] = useState([])
    const [showBackupCodes, setShowBackupCodes] = useState(false)

    // États OAuth
    const [connectedAccounts, setConnectedAccounts] = useState([])

    // États mot de passe
    const [showChangePassword, setShowChangePassword] = useState(false)
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    })
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    })

    // États sessions
    const [sessions, setSessions] = useState([])
    const [showSessions, setShowSessions] = useState(false)

    // États langue
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)

    // UI
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        loadProfile()
    }, [user])

    // Fermer le dropdown quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showLanguageDropdown && !e.target.closest('.language-dropdown')) {
                setShowLanguageDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showLanguageDropdown])

    const loadProfile = async () => {
        try {
            const { data } = await profileAPI.get()
            setProfile({
                display_name: data.display_name || '',
                bio: data.bio || '',
                website_url: data.website_url || '',
                social_discord: data.social_discord || '',
                social_twitter: data.social_twitter || '',
                social_youtube: data.social_youtube || ''
            })
            setAvatarPreview(data.avatar_url ? `http://localhost:3001${data.avatar_url}` : null)
            setTwoFactorEnabled(data.two_factor_enabled || false)
            setConnectedAccounts(data.oauth_accounts || [])
        } catch (error) {
            console.error('Failed to load profile:', error)
            toast.error(t('profile.errors.loadFailed'))
        } finally {
            setLoading(false)
        }
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            toast.error(t('profile.errors.avatarTooLarge'))
            return
        }

        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
    }

    const handleSaveProfile = async () => {
        setSaving(true)
        try {
            const formData = new FormData()
            formData.append('display_name', profile.display_name)
            formData.append('bio', profile.bio)
            formData.append('website_url', profile.website_url)
            formData.append('social_discord', profile.social_discord)
            formData.append('social_twitter', profile.social_twitter)
            formData.append('social_youtube', profile.social_youtube)

            if (avatarFile) {
                formData.append('avatar', avatarFile)
            }

            await profileAPI.update(formData)
            toast.success(t('profile.success.updated'))
            setAvatarFile(null)
            refreshUser?.()
        } catch (error) {
            toast.error(error.response?.data?.error || t('profile.errors.saveFailed'))
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            toast.error(t('profile.errors.passwordMismatch'))
            return
        }

        if (passwords.new.length < 8) {
            toast.error(t('profile.errors.passwordTooShort'))
            return
        }

        setSaving(true)
        try {
            await profileAPI.changePassword({
                currentPassword: passwords.current,
                newPassword: passwords.new
            })
            toast.success(t('profile.success.passwordChanged'))
            setPasswords({ current: '', new: '', confirm: '' })
            setShowChangePassword(false)
        } catch (error) {
            toast.error(error.response?.data?.error || t('profile.errors.passwordChangeFailed'))
        } finally {
            setSaving(false)
        }
    }

    // Language change
    const handleLanguageChange = (langCode) => {
        setLanguage(langCode)
        setShowLanguageDropdown(false)
        toast.success(langCode === 'fr' ? 'Langue changée en Français' : 'Language changed to English')
    }

    // 2FA Functions
    const handleSetup2FA = async () => {
        try {
            const { data } = await profileAPI.setup2FA()
            setQrCode(data.qrCode)
            setSecret2FA(data.secret)
            setShowSetup2FA(true)
        } catch (error) {
            toast.error(t('profile.errors.setup2FAFailed'))
        }
    }

    const handleVerify2FA = async () => {
        if (verifyCode.length !== 6) {
            toast.error(t('profile.errors.invalid2FACode'))
            return
        }

        try {
            const { data } = await profileAPI.verify2FA({ code: verifyCode })
            setBackupCodes(data.backupCodes)
            setShowBackupCodes(true)
            setTwoFactorEnabled(true)
            setShowSetup2FA(false)
            setVerifyCode('')
            toast.success(t('profile.success.twoFAEnabled'))
        } catch (error) {
            toast.error(error.response?.data?.error || t('profile.errors.invalidCode'))
        }
    }

    const handleDisable2FA = async () => {
        if (!confirm(t('profile.twoFA.confirmDisable'))) return

        try {
            await profileAPI.disable2FA()
            setTwoFactorEnabled(false)
            toast.success(t('profile.success.twoFADisabled'))
        } catch (error) {
            toast.error(t('profile.errors.disable2FAFailed'))
        }
    }

    const copyBackupCodes = () => {
        navigator.clipboard.writeText(backupCodes.join('\n'))
        toast.success(t('profile.success.codesCopied'))
    }

    // OAuth Functions
    const handleConnectOAuth = (provider) => {
        window.location.href = `http://localhost:3001/api/auth/${provider}`
    }

    const handleDisconnectOAuth = async (provider) => {
        if (!confirm(t('profile.connections.confirmDisconnect', { provider }))) return

        try {
            await profileAPI.disconnectOAuth(provider)
            setConnectedAccounts(prev => prev.filter(a => a.provider !== provider))
            toast.success(t('profile.success.accountDisconnected', { provider }))
        } catch (error) {
            toast.error(error.response?.data?.error || t('profile.errors.disconnectFailed'))
        }
    }

    // Sessions
    const loadSessions = async () => {
        try {
            const { data } = await profileAPI.getSessions()
            setSessions(data.sessions || [])
            setShowSessions(true)
        } catch (error) {
            toast.error(t('profile.errors.loadSessionsFailed'))
        }
    }

    const handleRevokeSession = async (sessionId) => {
        try {
            await profileAPI.revokeSession(sessionId)
            setSessions(prev => prev.filter(s => s.id !== sessionId))
            toast.success(t('profile.success.sessionRevoked'))
        } catch (error) {
            toast.error(t('profile.errors.revokeFailed'))
        }
    }

    const handleRevokeAllSessions = async () => {
        if (!confirm(t('profile.sessions.confirmRevokeAll'))) return

        try {
            await profileAPI.revokeAllSessions()
            toast.success(t('profile.success.allSessionsRevoked'))
            loadSessions()
        } catch (error) {
            toast.error(t('profile.errors.revokeFailed'))
        }
    }

    // Trouver la langue actuelle
    const currentLanguage = languages.find(l => l.code === language) || languages[0]

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-hyt-accent" />
            </div>
        )
    }

    return (
        <div className="min-h-screen pt-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="font-display text-3xl font-bold text-white mb-8">
                    {t('profile.title')}
                </h1>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-hyt-border">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-4 py-3 font-medium transition-colors ${
                            activeTab === 'profile'
                                ? 'text-hyt-accent border-b-2 border-hyt-accent'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <User className="w-4 h-4 inline mr-2" />
                        {t('profile.tabs.profile')}
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-4 py-3 font-medium transition-colors ${
                            activeTab === 'security'
                                ? 'text-hyt-accent border-b-2 border-hyt-accent'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <Shield className="w-4 h-4 inline mr-2" />
                        {t('profile.tabs.security')}
                    </button>
                    <button
                        onClick={() => setActiveTab('connections')}
                        className={`px-4 py-3 font-medium transition-colors ${
                            activeTab === 'connections'
                                ? 'text-hyt-accent border-b-2 border-hyt-accent'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <LinkIcon className="w-4 h-4 inline mr-2" />
                        {t('profile.tabs.connections')}
                    </button>
                </div>

                {/* Tab: Profil */}
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        {/* Avatar */}
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">{t('profile.avatar.title')}</h3>

                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-hyt-dark border-2 border-hyt-border">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-hyt-accent to-hyt-purple">
                                                <span className="text-3xl font-bold text-white">
                                                    {user?.username?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 p-2 bg-hyt-accent text-black rounded-full hover:bg-hyt-accent-dark transition-colors"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </div>
                                <div>
                                    <p className="text-white font-medium">{user?.username}</p>
                                    <p className="text-gray-500 text-sm">{user?.email}</p>
                                    <p className="text-gray-600 text-xs mt-1">{t('profile.avatar.hint')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Langue / Language */}
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5" />
                                {t('profile.language.title')}
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">{t('profile.language.subtitle')}</p>

                            <div className="relative language-dropdown">
                                <button
                                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                                    className="flex items-center justify-between w-full sm:w-64 px-4 py-3 bg-hyt-dark border border-hyt-border rounded-lg hover:border-hyt-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <currentLanguage.flag />
                                        <span className="text-white">{currentLanguage.name}</span>
                                    </div>
                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showLanguageDropdown && (
                                    <div className="absolute z-10 mt-2 w-full sm:w-64 bg-hyt-card border border-hyt-border rounded-lg shadow-xl overflow-hidden">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => handleLanguageChange(lang.code)}
                                                className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-hyt-dark transition-colors ${
                                                    language === lang.code ? 'bg-hyt-accent/10 text-hyt-accent' : 'text-white'
                                                }`}
                                            >
                                                <lang.flag />
                                                <span>{lang.name}</span>
                                                {language === lang.code && (
                                                    <Check className="w-4 h-4 ml-auto" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Informations */}
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-white">{t('profile.info.title')}</h3>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">{t('profile.info.displayName')}</label>
                                <input
                                    type="text"
                                    value={profile.display_name}
                                    onChange={(e) => setProfile(p => ({ ...p, display_name: e.target.value }))}
                                    placeholder={user?.username}
                                    className="input-field w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">{t('profile.info.bio')}</label>
                                <textarea
                                    value={profile.bio}
                                    onChange={(e) => setProfile(p => ({ ...p, bio: e.target.value }))}
                                    placeholder={t('profile.info.bioPlaceholder')}
                                    rows={3}
                                    className="input-field w-full resize-none"
                                    maxLength={500}
                                />
                                <p className="text-xs text-gray-600 mt-1">{profile.bio.length}/500</p>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">{t('profile.info.website')}</label>
                                <input
                                    type="url"
                                    value={profile.website_url}
                                    onChange={(e) => setProfile(p => ({ ...p, website_url: e.target.value }))}
                                    placeholder="https://..."
                                    className="input-field w-full"
                                />
                            </div>
                        </div>

                        {/* Réseaux sociaux */}
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-white">{t('profile.social.title')}</h3>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                                    <DiscordIcon /> Discord
                                </label>
                                <input
                                    type="text"
                                    value={profile.social_discord}
                                    onChange={(e) => setProfile(p => ({ ...p, social_discord: e.target.value }))}
                                    placeholder={t('profile.social.discordPlaceholder')}
                                    className="input-field w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                    Twitter / X
                                </label>
                                <input
                                    type="text"
                                    value={profile.social_twitter}
                                    onChange={(e) => setProfile(p => ({ ...p, social_twitter: e.target.value }))}
                                    placeholder="@username"
                                    className="input-field w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                    YouTube
                                </label>
                                <input
                                    type="text"
                                    value={profile.social_youtube}
                                    onChange={(e) => setProfile(p => ({ ...p, social_youtube: e.target.value }))}
                                    placeholder={t('profile.social.youtubePlaceholder')}
                                    className="input-field w-full"
                                />
                            </div>
                        </div>

                        {/* Bouton sauvegarder */}
                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="btn-primary flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {t('profile.save')}
                        </button>
                    </div>
                )}

                {/* Tab: Sécurité */}
                {activeTab === 'security' && (
                    <div className="space-y-6">
                        {/* Mot de passe */}
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Lock className="w-5 h-5" />
                                        {t('profile.password.title')}
                                    </h3>
                                    <p className="text-sm text-gray-500">{t('profile.password.subtitle')}</p>
                                </div>
                                <button
                                    onClick={() => setShowChangePassword(!showChangePassword)}
                                    className="btn-secondary"
                                >
                                    {t('common.edit')}
                                </button>
                            </div>

                            {showChangePassword && (
                                <div className="space-y-4 pt-4 border-t border-hyt-border">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">{t('profile.password.current')}</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.current ? 'text' : 'password'}
                                                value={passwords.current}
                                                onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                                                className="input-field w-full pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                            >
                                                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">{t('profile.password.new')}</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.new ? 'text' : 'password'}
                                                value={passwords.new}
                                                onChange={(e) => setPasswords(p => ({ ...p, new: e.target.value }))}
                                                className="input-field w-full pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                            >
                                                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">{t('profile.password.confirm')}</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                                                className="input-field w-full pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                            >
                                                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleChangePassword}
                                        disabled={saving || !passwords.current || !passwords.new || !passwords.confirm}
                                        className="btn-primary"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('profile.password.change')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 2FA */}
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Smartphone className="w-5 h-5" />
                                        {t('profile.twoFA.title')}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {twoFactorEnabled
                                            ? t('profile.twoFA.enabled')
                                            : t('profile.twoFA.disabled')
                                        }
                                    </p>
                                </div>
                                {twoFactorEnabled ? (
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm flex items-center gap-1">
                                            <Check className="w-4 h-4" />
                                            {t('profile.twoFA.active')}
                                        </span>
                                        <button onClick={handleDisable2FA} className="btn-ghost text-red-400 hover:text-red-500">
                                            {t('profile.twoFA.disable')}
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={handleSetup2FA} className="btn-primary">
                                        {t('profile.twoFA.enable')}
                                    </button>
                                )}
                            </div>

                            {/* Setup 2FA Modal */}
                            {showSetup2FA && (
                                <div className="mt-4 p-4 bg-hyt-dark rounded-lg border border-hyt-border">
                                    <h4 className="font-medium text-white mb-4">{t('profile.twoFA.setup.title')}</h4>

                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-shrink-0">
                                            <p className="text-sm text-gray-400 mb-2">{t('profile.twoFA.setup.step1')}</p>
                                            {qrCode && (
                                                <div className="bg-white p-3 rounded-lg inline-block">
                                                    <img src={qrCode} alt="QR Code 2FA" className="w-40 h-40" />
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-500 mt-2">
                                                {t('profile.twoFA.setup.orEnterCode')} <code className="bg-hyt-darker px-2 py-1 rounded text-hyt-accent">{secret2FA}</code>
                                            </p>
                                        </div>

                                        <div className="flex-1">
                                            <p className="text-sm text-gray-400 mb-2">{t('profile.twoFA.setup.step2')}</p>
                                            <input
                                                type="text"
                                                value={verifyCode}
                                                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="000000"
                                                className="input-field w-full text-center text-2xl tracking-widest"
                                                maxLength={6}
                                            />
                                            <div className="flex gap-2 mt-4">
                                                <button onClick={() => setShowSetup2FA(false)} className="btn-ghost flex-1">
                                                    {t('common.cancel')}
                                                </button>
                                                <button
                                                    onClick={handleVerify2FA}
                                                    disabled={verifyCode.length !== 6}
                                                    className="btn-primary flex-1"
                                                >
                                                    {t('profile.twoFA.setup.verify')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Backup codes modal */}
                            {showBackupCodes && (
                                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                                    <div className="bg-hyt-card border border-hyt-border rounded-xl p-6 max-w-md w-full">
                                        <div className="flex items-center gap-2 text-yellow-500 mb-4">
                                            <AlertTriangle className="w-6 h-6" />
                                            <h3 className="font-bold text-lg">{t('profile.twoFA.backup.title')}</h3>
                                        </div>

                                        <p className="text-gray-400 text-sm mb-4">
                                            {t('profile.twoFA.backup.description')}
                                        </p>

                                        <div className="bg-hyt-dark rounded-lg p-4 mb-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                {backupCodes.map((code, i) => (
                                                    <code key={i} className="text-hyt-accent text-sm">{code}</code>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button onClick={copyBackupCodes} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                                                <Copy className="w-4 h-4" />
                                                {t('profile.twoFA.backup.copy')}
                                            </button>
                                            <button onClick={() => setShowBackupCodes(false)} className="btn-primary flex-1">
                                                {t('profile.twoFA.backup.saved')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sessions actives */}
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Monitor className="w-5 h-5" />
                                        {t('profile.sessions.title')}
                                    </h3>
                                    <p className="text-sm text-gray-500">{t('profile.sessions.subtitle')}</p>
                                </div>
                                <button onClick={loadSessions} className="btn-secondary">
                                    {t('profile.sessions.view')}
                                </button>
                            </div>

                            {showSessions && sessions.length > 0 && (
                                <div className="space-y-3 pt-4 border-t border-hyt-border">
                                    {sessions.map(session => (
                                        <div key={session.id} className="flex items-center justify-between p-3 bg-hyt-dark rounded-lg">
                                            <div>
                                                <p className="text-white text-sm">{session.device_info || t('profile.sessions.unknownDevice')}</p>
                                                <p className="text-gray-500 text-xs">
                                                    {session.ip_address} • {t('profile.sessions.lastActive')}: {new Date(session.last_active).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                            {session.is_current ? (
                                                <span className="text-green-400 text-xs">{t('profile.sessions.current')}</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleRevokeSession(session.id)}
                                                    className="text-red-400 hover:text-red-500 p-2"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        onClick={handleRevokeAllSessions}
                                        className="text-red-400 hover:text-red-500 text-sm"
                                    >
                                        {t('profile.sessions.revokeAll')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab: Connexions */}
                {activeTab === 'connections' && (
                    <div className="space-y-6">
                        {/* Comptes liés */}
                        <div className="bg-hyt-card border border-hyt-border rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">{t('profile.connections.title')}</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {t('profile.connections.subtitle')}
                            </p>

                            <div className="space-y-4">
                                {/* Discord */}
                                <div className="flex items-center justify-between p-4 bg-hyt-dark rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center">
                                            <DiscordIcon />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Discord</p>
                                            {connectedAccounts.find(a => a.provider === 'discord') ? (
                                                <p className="text-sm text-gray-500">
                                                    {connectedAccounts.find(a => a.provider === 'discord')?.provider_username}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-500">{t('profile.connections.notConnected')}</p>
                                            )}
                                        </div>
                                    </div>
                                    {connectedAccounts.find(a => a.provider === 'discord') ? (
                                        <button
                                            onClick={() => handleDisconnectOAuth('discord')}
                                            className="text-red-400 hover:text-red-500"
                                        >
                                            {t('profile.connections.disconnect')}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleConnectOAuth('discord')}
                                            className="btn-secondary"
                                        >
                                            {t('profile.connections.connect')}
                                        </button>
                                    )}
                                </div>

                                {/* Google */}
                                <div className="flex items-center justify-between p-4 bg-hyt-dark rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                            <GoogleIcon />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">Google</p>
                                            {connectedAccounts.find(a => a.provider === 'google') ? (
                                                <p className="text-sm text-gray-500">
                                                    {connectedAccounts.find(a => a.provider === 'google')?.provider_email}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-500">{t('profile.connections.notConnected')}</p>
                                            )}
                                        </div>
                                    </div>
                                    {connectedAccounts.find(a => a.provider === 'google') ? (
                                        <button
                                            onClick={() => handleDisconnectOAuth('google')}
                                            className="text-red-400 hover:text-red-500"
                                        >
                                            {t('profile.connections.disconnect')}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleConnectOAuth('google')}
                                            className="btn-secondary"
                                        >
                                            {t('profile.connections.connect')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}