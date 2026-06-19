import React from 'react';
import { motion } from 'framer-motion';
import { FiTarget, FiUsers, FiShield, FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const About = () => (
  <div className="pt-20 pb-10 min-h-screen">
    <div className="container-custom max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
        <span className="text-5xl mb-4 block">🔍</span>
        <h1 className="text-4xl font-extrabold gradient-text mb-4">About FindIt</h1>
        <p className="text-dark-300 text-lg leading-relaxed max-w-2xl mx-auto">
          FindIt is a campus-specific Lost & Found portal built to help students, faculty, and staff
          quickly report and recover lost belongings — making campuses more connected and caring.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {[
          { icon: FiTarget, title: 'Our Mission', desc: 'To create a trusted, efficient, and verified system that reconnects people with their lost belongings.', color: 'text-primary-400' },
          { icon: FiUsers, title: 'Community First', desc: 'Built for campus communities — students helping students, one item at a time.', color: 'text-accent-400' },
          { icon: FiShield, title: 'Secure & Verified', desc: 'JWT authentication, claim verification with QR codes, and proof of ownership ensure safety.', color: 'text-success' },
          { icon: FiHeart, title: 'Made with Care', desc: 'A B.Tech CSE major project built with real-world standards — production ready.', color: 'text-error' },
        ].map(({ icon: Icon, title, desc, color }, i) => (
          <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="glass-card p-6">
            <Icon className={`${color} mb-3`} size={24} />
            <h3 className="font-bold text-dark-100 mb-2">{title}</h3>
            <p className="text-dark-400 text-sm leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-8 text-center">
        <h2 className="text-2xl font-bold text-dark-50 mb-3">Tech Stack</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Socket.io', 'JWT', 'Cloudinary', 'Tailwind CSS', 'Framer Motion'].map((t) => (
            <span key={t} className="px-3 py-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-300 rounded-full text-sm">{t}</span>
          ))}
        </div>
        <div className="mt-6">
          <Link to="/browse" className="btn btn-primary">Explore FindIt</Link>
        </div>
      </div>
    </div>
  </div>
);

export default About;
