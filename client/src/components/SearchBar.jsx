import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin } from 'react-icons/fi';

const SearchBar = ({ initialSearch = '', initialLocation = '', onSearch, large = false }) => {
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ search, location });
    } else {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (location.trim()) params.set('location', location.trim());
      navigate(`/browse?${params.toString()}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex gap-2 ${large ? 'flex-col sm:flex-row' : 'flex-row'} w-full`}
      role="search"
    >
      <div className="relative flex-1">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for lost or found items..."
          className={`input pl-11 ${large ? 'py-4 text-base' : ''}`}
          id="search-input"
          aria-label="Search items"
        />
      </div>

      {large && (
        <div className="relative sm:w-56">
          <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location..."
            className="input pl-11 py-4 text-base"
            id="location-input"
            aria-label="Filter by location"
          />
        </div>
      )}

      <button
        type="submit"
        className={`btn btn-primary flex-shrink-0 ${large ? 'py-4 px-8 text-base' : ''}`}
        id="search-submit-btn"
      >
        <FiSearch size={18} />
        {large && <span>Search</span>}
      </button>
    </form>
  );
};

export default SearchBar;
