import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FiArrowRight, FiSearch, FiPlus, FiCheckCircle, FiUsers, FiPackage, FiTrendingUp } from 'react-icons/fi';
import { getFeaturedItems } from '../services/itemService';
import SearchBar from '../components/SearchBar';
import ItemCard from '../components/ItemCard';
import Spinner from '../components/ui/Spinner';

const CATEGORIES = [
  { name: 'Electronics', icon: '💻' }, { name: 'Wallets', icon: '👛' },
  { name: 'ID Cards', icon: '🪪' }, { name: 'Keys', icon: '🔑' },
  { name: 'Bags', icon: '🎒' }, { name: 'Books', icon: '📚' },
  { name: 'Clothing', icon: '👕' }, { name: 'Documents', icon: '📄' },
  { name: 'Pets', icon: '🐾' }, { name: 'Other', icon: '📦' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', college: 'IIT Delhi', text: 'Found my wallet with all cards intact! The QR verification made the handover so smooth.', avatar: 'P' },
  { name: 'Rahul Verma', college: 'NIT Trichy', text: 'Posted my lost laptop and got a claim within 2 hours. Incredibly fast community.', avatar: 'R' },
  { name: 'Anjali Singh', college: 'BITS Pilani', text: 'The claim system with proof of ownership is genius. No fake claims at all!', avatar: 'A' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Report the Item', desc: 'Post a lost or found item with a photo, description, and location in under 2 minutes.', icon: FiPlus, color: 'text-primary-400' },
  { step: '02', title: 'Search & Match', desc: 'Our search system connects people. Browse listings or let the community find you.', icon: FiSearch, color: 'text-accent-400' },
  { step: '03', title: 'Verify & Claim', desc: 'Submit proof of ownership. Get a QR code upon approval for a safe handover.', icon: FiCheckCircle, color: 'text-success' },
];

const Home = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['featured-items'],
    queryFn: async () => (await getFeaturedItems()).data,
  });

  const stats = data?.stats || {};
  const lostItems = data?.lostItems || [];
  const foundItems = data?.foundItems || [];

  return (
    <div className="overflow-x-hidden">
      {/* ====== HERO ====== */}
      <section className="relative min-h-screen flex items-center hero-bg pt-16">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-900/20 rounded-full blur-3xl" />
        </div>

        <div className="container-custom relative z-10 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6">
                🎓 Built for Campus Communities
              </span>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-dark-50 leading-tight mb-6">
                Lost Something?
                <br />
                <span className="gradient-text">FindIt.</span>
              </h1>

              <p className="text-lg text-dark-300 max-w-xl mx-auto leading-relaxed mb-10">
                The smartest Lost & Found portal for college campuses. Report, search, and recover — with verified claims and real-time notifications.
              </p>

              <div className="max-w-2xl mx-auto mb-10">
                <SearchBar large />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/browse" className="btn btn-primary btn-lg gap-2">
                  Browse Items <FiArrowRight size={18} />
                </Link>
                <Link to="/add-listing" className="btn btn-outline btn-lg gap-2">
                  <FiPlus size={18} /> Post Item
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dark-500">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-dark-500 to-transparent" />
        </div>
      </section>

      {/* ====== STATS ====== */}
      <section className="py-12 bg-dark-700/30 border-y border-dark-600/30">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: FiPackage, label: 'Total Items', value: stats.totalItems || 0, color: 'text-primary-400' },
              { icon: FiSearch, label: 'Items Lost', value: stats.lostItems || 0, color: 'text-error' },
              { icon: FiCheckCircle, label: 'Items Found', value: stats.foundItems || 0, color: 'text-success' },
              { icon: FiTrendingUp, label: 'Resolved', value: stats.resolvedItems || 0, color: 'text-accent-400' },
            ].map(({ icon: Icon, label, value, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center"
              >
                <Icon className={`mx-auto mb-2 ${color}`} size={24} />
                <p className={`text-3xl font-extrabold ${color}`}>{value.toLocaleString()}</p>
                <p className="text-dark-400 text-sm">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CATEGORIES ====== */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-dark-50 mb-2">Browse by Category</h2>
            <p className="text-dark-400">Find items by what you're looking for</p>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-3">
            {CATEGORIES.map(({ name, icon }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={`/browse?category=${name}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-dark-700/50 border border-dark-600/30 hover:border-primary-500/40 hover:bg-primary-500/10 transition-all group"
                  id={`cat-${name.toLowerCase().replace(' ', '-')}`}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
                  <span className="text-xs text-dark-400 group-hover:text-primary-300 transition-colors font-medium text-center leading-tight">
                    {name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FEATURED LOST ITEMS ====== */}
      <section className="section bg-dark-700/20">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-dark-50">🔴 Recently Lost</h2>
              <p className="text-dark-400 text-sm mt-1">Help someone find what they're missing</p>
            </div>
            <Link to="/browse?type=lost" className="btn btn-outline btn-sm gap-1">
              View All <FiArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {lostItems.slice(0, 6).map((item, i) => (
                <ItemCard key={item._id} item={item} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ====== FEATURED FOUND ITEMS ====== */}
      <section className="section">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-dark-50">🟢 Recently Found</h2>
              <p className="text-dark-400 text-sm mt-1">Is one of these yours?</p>
            </div>
            <Link to="/browse?type=found" className="btn btn-outline btn-sm gap-1">
              View All <FiArrowRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {foundItems.slice(0, 6).map((item, i) => (
                <ItemCard key={item._id} item={item} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="section bg-dark-700/20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-50 mb-2">How FindIt Works</h2>
            <p className="text-dark-400">Three simple steps to reunite with your belongings</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon, color }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-8 text-center relative"
              >
                <div className="absolute top-4 right-4 text-4xl font-black text-dark-700 select-none">{step}</div>
                <div className={`w-14 h-14 rounded-2xl bg-dark-600/50 border border-dark-500/30 flex items-center justify-center mx-auto mb-5 ${color}`}>
                  <Icon size={26} />
                </div>
                <h3 className="text-lg font-bold text-dark-50 mb-3">{title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIALS ====== */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-dark-50 mb-2">What Students Say</h2>
            <p className="text-dark-400">Real stories from our campus community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, college, text, avatar }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <p className="text-dark-300 text-sm leading-relaxed mb-5 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-dark-100 font-semibold text-sm">{name}</p>
                    <p className="text-dark-500 text-xs">{college}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="section">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)' }}
          >
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 0%, transparent 60%), radial-gradient(circle at 70% 50%, white 0%, transparent 60%)' }} />
            <div className="relative z-10 text-center py-16 px-8">
              <h2 className="text-3xl font-extrabold text-white mb-4">
                Lost or Found Something Today?
              </h2>
              <p className="text-white/80 mb-8 max-w-md mx-auto">
                Don't wait — post now and help your campus community recover lost items.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/add-listing?type=lost" className="btn btn-lg bg-white text-primary-600 hover:bg-white/90 font-bold">
                  🔴 Report Lost Item
                </Link>
                <Link to="/add-listing?type=found" className="btn btn-lg bg-dark-900/40 text-white border border-white/20 hover:bg-dark-900/60">
                  🟢 Report Found Item
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
