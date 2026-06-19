import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiCalendar, FiEye } from 'react-icons/fi';
import { format } from 'date-fns';
import Badge from './ui/Badge';

const ItemCard = ({ item, index = 0 }) => {
  const placeholderImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.title)}&background=6366f1&color=fff&size=400&bold=true`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="glass-card-hover overflow-hidden group"
    >
      <Link to={`/items/${item._id}`} id={`item-card-${item._id}`}>
        {/* Image */}
        <div className="relative h-44 overflow-hidden bg-dark-700">
          <img
            src={item.imageUrl || placeholderImg}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { e.target.src = placeholderImg; }}
          />

          {/* Overlay badges */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            <Badge variant={item.type}>{item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}</Badge>
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant={item.status}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Badge>
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-800/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <p className="text-xs text-primary-400 font-medium mb-1 flex items-center gap-1">
            <span>{item.category?.icon}</span> {item.category?.name}
          </p>

          {/* Title */}
          <h3 className="font-semibold text-dark-50 text-sm leading-snug mb-3 line-clamp-2 group-hover:text-primary-300 transition-colors">
            {item.title}
          </h3>

          {/* Meta */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-dark-400 text-xs">
              <FiMapPin size={12} className="flex-shrink-0" />
              <span className="truncate">{item.location?.address || 'Location not specified'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-dark-400 text-xs">
              <FiCalendar size={12} className="flex-shrink-0" />
              <span>
                {item.dateLostOrFound
                  ? format(new Date(item.dateLostOrFound), 'MMM d, yyyy')
                  : 'Date not specified'}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-3 border-t border-dark-600/40 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {item.userId?.avatar ? (
                <img src={item.userId.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 text-xs font-bold">
                  {item.userId?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <span className="text-dark-500 text-xs truncate max-w-[80px]">{item.userId?.name || 'User'}</span>
            </div>
            <div className="flex items-center gap-1 text-dark-600 text-xs">
              <FiEye size={11} />
              <span>{item.views || 0}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ItemCard;
