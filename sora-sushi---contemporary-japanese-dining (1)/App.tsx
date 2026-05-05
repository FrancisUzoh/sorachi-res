
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Calendar, MapPin, Clock, Instagram, Facebook, Share2, Menu as MenuIcon, X, ChefHat, AlertCircle } from 'lucide-react';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MenuPage from './pages/Menu';
import AboutPage from './pages/About';
import SpacePage from './pages/Space';
import HoursPage from './pages/Hours';
import ReservationPage from './pages/Reservation';
import PremiumPage from './pages/Premium';
import AIConcierge from './components/AIConcierge';
import NotificationCenter from './components/NotificationCenter';
import WordPressPage from './components/WordPressPage';
import Footer from './components/Footer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Blog from './pages/Blog';
import PostDetail from './pages/PostDetail';
import PageDetail from './pages/PageDetail';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import CustomCursor from './components/CustomCursor';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [showWpWarning, setShowWpWarning] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'failed'>('checking');

  useEffect(() => {
    // Check if WordPress is configured (directly or via known default)
    const wpUrl = import.meta.env.VITE_WORDPRESS_API_URL || 'https://sorasuchi.ct.ws';
    const isWpConfigured = !!import.meta.env.VITE_WORDPRESS_API_URL;
    
    // Only show warning if absolutely no URL is available (rare since we have a default)
    setShowWpWarning(!isWpConfigured && !wpUrl);

    // Diagnostic ping to backend
    fetch('/api/ping')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log('Backend Ping Success:', data);
        setBackendStatus('connected');
      })
      .catch(err => {
        console.error('Backend Ping Failed:', err);
        setBackendStatus('failed');
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0a] selection:bg-emerald-500/30">
        <CustomCursor />
        {/* Diagnostic Status */}
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
          {backendStatus === 'failed' && (
            <div className="bg-red-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-xl border border-white/20 flex items-center gap-2">
              <AlertCircle size={12} />
              <span>Backend Unreachable</span>
            </div>
          )}
          {backendStatus === 'connected' && (
            <div className="bg-emerald-500/20 backdrop-blur-md text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-emerald-500/30 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>Backend Connected</span>
            </div>
          )}
        </div>

        {showWpWarning && (
          <div className="fixed top-0 left-0 w-full z-[100] bg-emerald-600 text-white text-center py-2 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-lg">
            <AlertCircle size={14} />
            <span>WordPress API URL missing. Set VITE_WORDPRESS_API_URL in Settings to enable dynamic content.</span>
            <button onClick={() => setShowWpWarning(false)} className="ml-4 hover:opacity-70"><X size={14} /></button>
          </div>
        )}
        <Navbar user={user} />
        <main className={`pt-24 pb-32 ${showWpWarning ? 'mt-8' : ''}`}>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/about" element={<WordPressPage slug="about" fallback={<AboutPage />} />} />
            <Route path="/space" element={<WordPressPage slug="space" fallback={<SpacePage />} />} />
            <Route path="/hours" element={<WordPressPage slug="hours" fallback={<HoursPage />} />} />
            <Route path="/reservation" element={<ReservationPage user={user} />} />
            <Route path="/premium" element={<PremiumPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<PostDetail />} />
            <Route path="/page/:slug" element={<PageDetail />} />
          </Routes>
        </main>
        
        {/* Floating AI Chef Assistance */}
        <AIConcierge />

        <Footer />
      </div>
    </Router>
  );
};

export default App;
