import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiGrid, FiUsers, FiList, FiTag, FiFlag, FiAlertCircle, FiArrowLeft
} from 'react-icons/fi';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/listings', label: 'Listings', icon: FiList },
  { to: '/admin/categories', label: 'Categories', icon: FiTag },
  { to: '/admin/reports', label: 'Reports', icon: FiFlag },
  { to: '/admin/claims', label: 'Claims', icon: FiAlertCircle },
];

const AdminLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-dark-800">
      {/* Admin Header */}
      <header className="bg-dark-700/80 backdrop-blur-sm border-b border-dark-600/50 sticky top-0 z-30">
        <div className="container-custom h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg text-dark-400 hover:text-dark-50 hover:bg-dark-600/50 transition-all"
              aria-label="Back to site"
            >
              <FiArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-black text-xs">
                F
              </div>
              <span className="font-bold text-dark-50">FindIt</span>
              <span className="text-dark-500">/</span>
              <span className="text-primary-400 font-semibold text-sm">Admin Panel</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-56 bg-dark-700/50 border-r border-dark-600/50 hidden md:flex flex-col p-4 sticky top-16 h-[calc(100vh-4rem)]">
          <nav className="flex flex-col gap-1">
            {adminLinks.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                      : 'text-dark-400 hover:text-dark-50 hover:bg-dark-600/50'
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
