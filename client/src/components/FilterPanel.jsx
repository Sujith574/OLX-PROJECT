import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../services/categoryService';
import { FiFilter, FiX } from 'react-icons/fi';

const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await getCategories()).data,
    staleTime: Infinity,
  });

  const categories = catData?.categories || [];

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v && v !== 'all');

  return (
    <div className="glass-card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-dark-100 flex items-center gap-2">
          <FiFilter size={16} className="text-primary-400" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-error hover:text-error/80 transition-colors"
            id="clear-filters-btn"
          >
            <FiX size={13} /> Clear
          </button>
        )}
      </div>

      {/* Type */}
      <div>
        <label className="label">Type</label>
        <select
          value={filters.type || 'all'}
          onChange={(e) => handleChange('type', e.target.value === 'all' ? '' : e.target.value)}
          className="input"
          id="filter-type"
        >
          <option value="all">All Types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="label">Category</label>
        <select
          value={filters.category || 'all'}
          onChange={(e) => handleChange('category', e.target.value === 'all' ? '' : e.target.value)}
          className="input"
          id="filter-category"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="label">Status</label>
        <select
          value={filters.status || 'all'}
          onChange={(e) => handleChange('status', e.target.value === 'all' ? '' : e.target.value)}
          className="input"
          id="filter-status"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="claimed">Claimed</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Sort */}
      <div>
        <label className="label">Sort By</label>
        <select
          value={filters.sort || '-createdAt'}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="input"
          id="filter-sort"
        >
          <option value="-createdAt">Latest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="-views">Most Viewed</option>
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
