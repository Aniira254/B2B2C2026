const express = require('express');
const router = express.Router();

/**
 * API Index - Available routes
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'B2B2C Ecommerce API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        registerDistributor: 'POST /api/auth/register/distributor',
        login: 'POST /api/auth/login',
        refreshToken: 'POST /api/auth/refresh-token',
        logout: 'POST /api/auth/logout',
        logoutAll: 'POST /api/auth/logout-all (Protected)',
        passwordResetRequest: 'POST /api/auth/password-reset-request',
        passwordReset: 'POST /api/auth/password-reset',
        getProfile: 'GET /api/auth/profile (Protected)',
        updateProfile: 'PUT /api/auth/profile (Protected)',
        changePassword: 'POST /api/auth/change-password (Protected)',
      },
      distributors: {
        getPending: 'GET /api/distributors/pending (Sales Rep only)',
        updateApproval: 'PUT /api/distributors/:distributorId/approval (Sales Rep only)',
        getStatus: 'GET /api/distributors/status (Distributor only)',
      },
      products: {
        getAll: 'GET /api/products (Public, dual pricing)',
        getById: 'GET /api/products/:id (Public, dual pricing)',
        getCategories: 'GET /api/products/categories (Public)',
        getImages: 'GET /api/products/:id/images (Public)',
        create: 'POST /api/products (Sales Rep only)',
        update: 'PUT /api/products/:id (Sales Rep only)',
        delete: 'DELETE /api/products/:id (Sales Rep only)',
        updateStock: 'PATCH /api/products/:id/stock (Sales Rep only)',
        addImage: 'POST /api/products/:id/images (Sales Rep only)',
        updateImage: 'PUT /api/products/images/:imageId (Sales Rep only)',
        deleteImage: 'DELETE /api/products/images/:imageId (Sales Rep only)',
        setPrimaryImage: 'PUT /api/products/:id/images/:imageId/primary (Sales Rep only)',
        reorderImages: 'POST /api/products/images/reorder (Sales Rep only)',
      },
    },
  });
});

module.exports = router;
