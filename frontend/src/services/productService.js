import api from './api';

export const productService = {
  // Get all products
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  // Get product by ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  // Get products on sale
  getProductsOnSale: async (page = 1, limit = 12) => {
    const response = await api.get(`/products?isOnSale=true&page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get new arrivals
  getNewArrivals: async (page = 1, limit = 12) => {
    const response = await api.get(`/products?isNewArrival=true&page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get special offers
  getSpecialOffers: async (page = 1, limit = 12) => {
    const response = await api.get(`/products?isSpecialOffer=true&page=${page}&limit=${limit}`);
    return response.data;
  },
};
