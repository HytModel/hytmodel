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
import Profile from './pages/Profile'
import SellerProfile from './pages/SellerProfile'
import OAuthCallback from './pages/OAuthCallback'
import BundleDetail from './pages/BundleDetail'

// Pages protégées
import Dashboard from './pages/Dashboard'
import Cart from './pages/Cart'
import Upload from './pages/Upload'
import Purchases from './pages/Purchases'
import Invoices from './pages/Invoices'
import Admin from './pages/Admin.jsx'
import CheckoutSuccess from './pages/CheckoutSuccess'
import Cancel from './pages/Cancel'
import NotFound from './pages/NotFound'
import MyProducts from './pages/MyProducts'
import EditProduct from './pages/EditProduct'
import BecomeCreator from './pages/BecomeCreator'

// Commandes sur mesure
import CustomOrders from './pages/CustomOrders'
import NewCustomRequest from './pages/NewCustomRequest'
import CustomRequestDetail from './pages/CustomRequestDetail'
import CustomOrderConversation from "./pages/Customorderconversation.jsx";
import CustomOrderDetail from './pages/Customorderdetail.jsx'

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
                    <Route path="/become-creator" element={<BecomeCreator />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/seller/:username" element={<SellerProfile />} />
                    <Route path="/bundles/:id" element={<BundleDetail />} />

                    {/* Auth (invités seulement) */}
                    <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                    <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                    <Route path="/oauth-callback" element={<OAuthCallback />} />

                    {/* Pages protégées (connecté requis) */}
                    <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
                    <Route path="/dashboard/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
                    <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />

                    {/* Commandes sur mesure - ORDRE IMPORTANT : routes spécifiques AVANT routes avec :id */}
                    <Route path="/custom-orders" element={<ProtectedRoute><CustomOrders /></ProtectedRoute>} />
                    <Route path="/custom-orders/new" element={<ProtectedRoute><NewCustomRequest /></ProtectedRoute>} />
                    <Route path="/custom-orders/requests/:id" element={<ProtectedRoute><CustomRequestDetail /></ProtectedRoute>} />
                    <Route path="/custom-orders/conversation/:id" element={<ProtectedRoute><CustomOrderConversation /></ProtectedRoute>} />
                    <Route path="/custom-orders/orders/:id" element={<ProtectedRoute><CustomOrderDetail /></ProtectedRoute>} />

                    {/* Checkout Success - toutes les variantes */}
                    <Route path="/checkout/success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
                    <Route path="/success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
                    <Route path="/stripe/success" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />

                    {/* Cancel */}
                    <Route path="/cancel" element={<ProtectedRoute><Cancel /></ProtectedRoute>} />
                    <Route path="/stripe/cancel" element={<ProtectedRoute><Cancel /></ProtectedRoute>} />

                    {/* Créateurs */}
                    <Route path="/upload" element={<CreatorRoute><Upload /></CreatorRoute>} />
                    <Route path="/dashboard/models" element={<CreatorRoute><MyProducts /></CreatorRoute>} />
                    <Route path="/dashboard/models/:id/edit" element={<CreatorRoute><EditProduct /></CreatorRoute>} />

                    {/* Admin - avec /* pour les sous-routes */}
                    <Route path="/admin/*" element={<AdminRoute><Admin /></AdminRoute>} />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>

            <Footer />
        </div>
    )
}