import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layout
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Pages publiques
import Home from './pages/Home'
import Models from './pages/Models'
import ModelDetail from './pages/ModelDetail'
import Login from './pages/Login'
import Register from './pages/Register'

// Pages protégées
import Dashboard from './pages/Dashboard'
import Cart from './pages/Cart'
import Upload from './pages/Upload'
import Purchases from './pages/Purchases'
import Invoices from './pages/Invoices'
import Admin from './pages/Admin'
import Success from './pages/Success'
import Cancel from './pages/Cancel'
import NotFound from './pages/NotFound'

// Route protégée (connecté requis)
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return <div className="min-h-screen bg-hyt-dark" />
    if (!user) return <Navigate to="/login" />
    return children
}

// Route créateur (CREATOR, STAFF ou ADMIN)
function CreatorRoute({ children }) {
    const { user, loading, isCreator } = useAuth()
    if (loading) return <div className="min-h-screen bg-hyt-dark" />
    if (!user) return <Navigate to="/login" />
    if (!isCreator()) return <Navigate to="/" />
    return children
}

// Route admin (STAFF ou ADMIN)
function AdminRoute({ children }) {
    const { user, loading, isStaff } = useAuth()
    if (loading) return <div className="min-h-screen bg-hyt-dark" />
    if (!user) return <Navigate to="/login" />
    if (!isStaff()) return <Navigate to="/" />
    return children
}

// Route invité (non connecté uniquement)
function GuestRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return <div className="min-h-screen bg-hyt-dark" />
    if (user) return <Navigate to="/" />
    return children
}

export default function App() {
    return (
        <div className="min-h-screen bg-hyt-dark flex flex-col">
            <Navbar />

            <main className="flex-1">
                <Routes>
                    {/* Pages publiques */}
                    <Route path="/" element={<Home />} />
                    <Route path="/models" element={<Models />} />
                    <Route path="/models/:id" element={<ModelDetail />} />

                    {/* Auth (invités seulement) */}
                    <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                    <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

                    {/* Pages protégées (connecté requis) */}
                    <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
                    <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
                    <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
                    <Route path="/cancel" element={<ProtectedRoute><Cancel /></ProtectedRoute>} />

                    {/* Créateurs */}
                    <Route path="/upload" element={<CreatorRoute><Upload /></CreatorRoute>} />

                    {/* Admin */}
                    <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>

            <Footer />
        </div>
    )
}