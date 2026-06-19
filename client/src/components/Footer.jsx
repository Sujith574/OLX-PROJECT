import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiHeart } from 'react-icons/fi';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-dark-700/50 bg-dark-800/50 mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-black text-sm">
                F
              </div>
              <span className="text-lg font-extrabold gradient-text">FindIt</span>
            </Link>
            <p className="text-dark-400 text-sm leading-relaxed">
              Campus Lost & Found Portal — Helping reunite students with their belongings since 2024.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-dark-200 font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/browse', label: 'Browse Items' },
                { to: '/add-listing', label: 'Post Item' },
                { to: '/about', label: 'About' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-dark-200 font-semibold mb-4 text-sm uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2">
              {['Electronics', 'Wallets', 'ID Cards', 'Keys', 'Bags', 'Books'].map((cat) => (
                <li key={cat}>
                  <Link to={`/browse?category=${cat}`} className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-dark-200 font-semibold mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-2">
              {[
                { to: '/contact', label: 'Contact Us' },
                { to: '/about', label: 'How It Works' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-dark-700/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-dark-500 text-sm flex items-center gap-1">
            © {year} FindIt. Made with <FiHeart className="text-error" size={14} /> for campuses.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-dark-500 hover:text-primary-400 transition-colors" aria-label="GitHub">
              <FiGithub size={18} />
            </a>
            <a href="#" className="text-dark-500 hover:text-primary-400 transition-colors" aria-label="Twitter">
              <FiTwitter size={18} />
            </a>
            <a href="#" className="text-dark-500 hover:text-primary-400 transition-colors" aria-label="LinkedIn">
              <FiLinkedin size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
