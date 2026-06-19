import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiGrid, FiList, FiChevronLeft, FiChevronRight, FiSliders } from 'react-icons/fi';
import { getItems } from '../services/itemService';
import ItemCard from '../components/ItemCard';
import FilterPanel from '../components/FilterPanel';
import SearchBar from '../components/SearchBar';
import Spinner from '../components/ui/Spinner';

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || 'active',
    sort: searchParams.get('sort') || '-createdAt',
  });
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const queryParams = { ...filters, search, page, limit: 12 };
  Object.keys(queryParams).forEach((k) => { if (!queryParams[k] || queryParams[k] === 'all') delete queryParams[k]; });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['items', queryParams],
    queryFn: async () => (await getItems(queryParams)).data,
    keepPreviousData: true,
  });

  const items = data?.items || [];
  const totalPages = data?.pages || 1;
  const total = data?.total || 0;

  const handleSearch = ({ search: s, location: l }) => {
    setSearch(s);
    setPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters({ type: '', category: '', status: '', sort: '-createdAt' });
    setSearch('');
    setPage(1);
  };

  return (
    <div className="pt-20 pb-10 min-h-screen">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-6">
          <h1 className="page-title">Browse Listings</h1>
          <p className="page-subtitle">
            {total > 0 ? `${total} item${total !== 1 ? 's' : ''} found` : 'Search for lost and found items'}
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <SearchBar initialSearch={search} onSearch={handleSearch} />
        </div>

        <div className="flex gap-6">
          {/* Filter sidebar - desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterPanel filters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 glass-card p-3 px-4">
              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 btn btn-outline btn-sm"
                  id="toggle-filters-btn"
                >
                  <FiSliders size={15} />
                  Filters
                </button>
                <span className="text-dark-400 text-sm hidden sm:block">
                  {items.length} of {total} results
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary-500/20 text-primary-400' : 'text-dark-500 hover:text-dark-200'}`}
                  aria-label="Grid view"
                  id="grid-view-btn"
                >
                  <FiGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary-500/20 text-primary-400' : 'text-dark-500 hover:text-dark-200'}`}
                  aria-label="List view"
                  id="list-view-btn"
                >
                  <FiList size={18} />
                </button>
              </div>
            </div>

            {/* Mobile Filter Panel */}
            {showFilters && (
              <div className="lg:hidden mb-5">
                <FilterPanel filters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />
              </div>
            )}

            {/* Items */}
            {isLoading ? (
              <div className="flex justify-center py-20"><Spinner size="xl" /></div>
            ) : isError ? (
              <div className="glass-card p-12 text-center">
                <p className="text-error mb-3">Failed to load items.</p>
                <button onClick={handleReset} className="btn btn-outline btn-sm">Reset Filters</button>
              </div>
            ) : items.length === 0 ? (
              <div className="glass-card p-16 text-center">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="text-xl font-bold text-dark-200 mb-2">No items found</h3>
                <p className="text-dark-400 mb-5">Try different search terms or reset filters.</p>
                <button onClick={handleReset} className="btn btn-primary">Clear Filters</button>
              </div>
            ) : (
              <motion.div
                layout
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'flex flex-col gap-3'
                }
              >
                {items.map((item, i) => (
                  <ItemCard key={item._id} item={item} index={i} />
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-outline btn-sm"
                  id="prev-page-btn"
                >
                  <FiChevronLeft size={16} />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                          page === pageNum ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-dark-50 hover:bg-dark-600/50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-outline btn-sm"
                  id="next-page-btn"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;
