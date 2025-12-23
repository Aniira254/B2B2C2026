import api from './api';

export const distributorService = {
  // Get distributor status
  getStatus: async () => {
    const response = await api.get('/distributors/status');
    return response.data;
  },

  // Get dashboard stats (mock for now, will be implemented later)
  getDashboardStats: async () => {
    // This will be replaced with actual API call when backend endpoint is created
    return {
      success: true,
      data: {
        totalOrders: 0,
        pendingOrders: 0,
        totalSpent: 0,
        activeProducts: 0,
      },
    };
  },

  // Get recent orders (mock for now)
  getRecentOrders: async (limit = 5) => {
    // This will be replaced with actual API call
    return {
      success: true,
      data: {
        orders: [],
      },
    };
  },

  // Get announcements (mock for now)
  getAnnouncements: async () => {
    // This will be replaced with actual API call
    return {
      success: true,
      data: {
        announcements: [],
      },
    };
  },
};
