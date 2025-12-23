import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import { FaSearch } from 'react-icons/fa';
import './ProductList.css';

const ProductList = ({ specialSection }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    tags: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalPages: 1,
  });

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page, specialSection, search]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        ...filters,
      };

      // Add special section tag filter
      if (specialSection) {
        params.tags = [specialSection, ...(params.tags || [])];
      }

      const response = await productService.getProducts(params);
      setProducts(response.data.products);
      setPagination({
        ...pagination,
        totalPages: response.data.totalPages,
      });
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    loadProducts();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getSectionTitle = () => {
    if (specialSection === 'on-sale') return 'On Sale';
    if (specialSection === 'new-arrivals') return 'New Arrivals';
    if (specialSection === 'special-offers') return 'Special Offers';
    return 'All Products';
  };

  return (
    <div className="product-list">
      <div className="product-list-header">
        <h1>{getSectionTitle()}</h1>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <FaSearch />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      <div className="product-content">
        <ProductFilters filters={filters} onFilterChange={handleFilterChange} />

        <div className="products-main">
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : products.length > 0 ? (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="btn btn-secondary"
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="btn btn-secondary"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>No products found</p>
              <p className="empty-subtitle">Try adjusting your filters or search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
