import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiPlus, FiUser, FiLogOut, FiMenu, FiX,
  FiGrid, FiShield, FiMessageCircle, FiHome
} from 'react-icons/fi';
import useAuthStore from '../store/authStore';
import NotificationBell from './NotificationBell';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: FiHome },
    { to: '/browse', label: 'Browse', icon: FiSearch },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-dark-800/95 backdrop-blur-md border-b border-dark-700/50 shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-glow-primary group-hover:scale-110 transition-transform">
              F
            </div>
            <span className="text-lg font-extrabold gradient-text">FindIt</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === to
                    ? 'text-primary-400 bg-primary-500/10'
                    : 'text-dark-300 hover:text-dark-50 hover:bg-dark-700/50'
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              to="/about"
              className="px-4 py-2 rounded-lg text-sm font-medium text-dark-300 hover:text-dark-50 hover:bg-dark-700/50 transition-all duration-200"
            >
              About
            </Link>
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/add-listing" className="btn btn-primary btn-sm gap-1.5">
                  <FiPlus size={16} />
                  Post Item
                </Link>

                <Link to="/messages" className="p-2 rounded-lg text-dark-400 hover:text-dark-50 hover:bg-dark-700/50 transition-all">
                  <FiMessageCircle size={20} />
                </Link>

                <NotificationBell />

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-dark-700/50 transition-all"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover border-2 border-primary-500/50" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 glass-card p-2 border border-dark-600/50"
                      >
                        <div className="px-3 py-2 border-b border-dark-600/50 mb-1">
                          <p className="text-sm font-semibold text-dark-50 truncate">{user?.name}</p>
                          <p className="text-xs text-dark-400 truncate">{user?.email}</p>
                        </div>

                        <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-dark-300 hover:text-dark-50 hover:bg-dark-600/50 transition-all">
                          <FiUser size={16} /> Dashboard
                        </Link>

                        {user?.role === 'admin' && (
                          <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-primary-400 hover:bg-primary-500/10 transition-all">
                            <FiShield size={16} /> Admin Panel
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-error hover:bg-error/10 transition-all mt-1"
                        >
                          <FiLogOut size={16} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-dark-400 hover:text-dark-50 hover:bg-dark-700/50"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-dark-700/50 bg-dark-800/98 backdrop-blur-md"
          >
            <div className="container-custom py-4 flex flex-col gap-2">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-300 hover:text-dark-50 hover:bg-dark-700/50 transition-all">
                  <Icon size={18} /> {label}
                </Link>
              ))}

              <div className="border-t border-dark-700/50 my-2" />

              {isAuthenticated ? (
                <>
                  <Link to="/add-listing" className="btn btn-primary gap-2 w-full justify-center">
                    <FiPlus size={18} /> Post Item
                  </Link>
                  <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-300 hover:text-dark-50 hover:bg-dark-700/50">
                    <FiUser size={18} /> Dashboard
                  </Link>
                  <Link to="/messages" className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-300 hover:text-dark-50 hover:bg-dark-700/50">
                    <FiMessageCircle size={18} /> Messages
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-primary-400 hover:bg-primary-500/10">
                      <FiShield size={18} /> Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-error hover:bg-error/10 text-left">
                    <FiLogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login" className="btn btn-outline flex-1 justify-center">Login</Link>
                  <Link to="/register" className="btn btn-primary flex-1 justify-center">Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
