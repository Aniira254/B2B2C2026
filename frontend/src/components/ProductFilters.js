import React, { useState } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import './ProductFilters.css';

const ProductFilters = ({ filters, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [localFilters, setLocalFilters] = useState(filters);

  const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports & Outdoors',
    'Books',
    'Toys & Games',
    'Health & Beauty',
    'Food & Beverages',
  ];

  const tags = [
    'on-sale',
    'new-arrivals',
    'special-offers',
    'best-seller',
    'eco-friendly',
    'premium',
    'clearance',
  ];

  const handleChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
  };

  const handleTagToggle = (tag) => {
    const currentTags = localFilters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    handleChange('tags', newTags);
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      category: '',
      minPrice: '',
      maxPrice: '',
      tags: [],
    };
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = () => {
    return (
      localFilters.category ||
      localFilters.minPrice ||
      localFilters.maxPrice ||
      (localFilters.tags && localFilters.tags.length > 0)
    );
  };

  return (
    <div className={`product-filters ${isOpen ? 'open' : 'closed'}`}>
      <div className="filters-header">
        <h3>
          <FaFilter /> Filters
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="btn-toggle"
          aria-label="Toggle filters"
        >
          {isOpen ? <FaTimes /> : <FaFilter />}
        </button>
      </div>

      {isOpen && (
        <div className="filters-content">
          <div className="filter-group">
            <label>Category</label>
            <select
              value={localFilters.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.minPrice}
                onChange={(e) => handleChange('minPrice', e.target.value)}
                min="0"
                step="0.01"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={localFilters.maxPrice}
                onChange={(e) => handleChange('maxPrice', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Tags</label>
            <div className="tags-list">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`tag-button ${
                    localFilters.tags?.includes(tag) ? 'active' : ''
                  }`}
                >
                  {tag.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-actions">
            <button onClick={applyFilters} className="btn btn-primary">
              Apply Filters
            </button>
            {hasActiveFilters() && (
              <button onClick={clearFilters} className="btn btn-secondary">
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
