const express = require('express');
const router = express.Router();
const {
  createNewProduct,
  getAllProducts,
  getProduct,
  updateProductDetails,
  deleteProductById,
  getProductCategories,
  updateProductStock,
  addImageToProduct,
  getImages,
  updateImage,
  deleteImage,
  setImageAsPrimary,
  reorderProductImages,
} = require('../controllers/productController');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validate } = require('../utils/validation');
const {
  createProductValidation,
  updateProductValidation,
  addImageValidation,
  updateStockValidation,
} = require('../utils/productValidation');
const { body } = require('express-validator');

// ============================================
// PUBLIC ROUTES (with optional authentication for pricing)
// ============================================

/**
 * @route   GET /api/products
 * @desc    Get all products with filters and search
 * @access  Public (pricing adapts based on auth)
 * @query   category, isOnSale, isNewArrival, isSpecialOffer, minPrice, maxPrice, search, page, limit
 */
router.get('/', optionalAuthenticate, asyncHandler(getAllProducts));

/**
 * @route   GET /api/products/categories
 * @desc    Get all product categories
 * @access  Public
 */
router.get('/categories', asyncHandler(getProductCategories));

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID with role-based pricing
 * @access  Public (pricing adapts based on auth)
 */
router.get('/:id', optionalAuthenticate, asyncHandler(getProduct));

/**
 * @route   GET /api/products/:id/images
 * @desc    Get all images for a product
 * @access  Public
 */
router.get('/:id/images', asyncHandler(getImages));

// ============================================
// ADMIN ROUTES (Sales Representatives only)
// ============================================

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private (Sales Rep only)
 */
router.post(
  '/',
  authenticate,
  authorize('sales_representative'),
  validate(createProductValidation),
  asyncHandler(createNewProduct)
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product details
 * @access  Private (Sales Rep only)
 */
router.put(
  '/:id',
  authenticate,
  authorize('sales_representative'),
  validate(updateProductValidation),
  asyncHandler(updateProductDetails)
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (soft delete)
 * @access  Private (Sales Rep only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('sales_representative'),
  asyncHandler(deleteProductById)
);

/**
 * @route   PATCH /api/products/:id/stock
 * @desc    Update product stock quantity
 * @access  Private (Sales Rep only)
 */
router.patch(
  '/:id/stock',
  authenticate,
  authorize('sales_representative'),
  validate(updateStockValidation),
  asyncHandler(updateProductStock)
);

// ============================================
// IMAGE MANAGEMENT ROUTES (Admin only)
// ============================================

/**
 * @route   POST /api/products/:id/images
 * @desc    Add image to product
 * @access  Private (Sales Rep only)
 */
router.post(
  '/:id/images',
  authenticate,
  authorize('sales_representative'),
  validate(addImageValidation),
  asyncHandler(addImageToProduct)
);

/**
 * @route   PUT /api/products/:id/images/:imageId/primary
 * @desc    Set image as primary
 * @access  Private (Sales Rep only)
 */
router.put(
  '/:id/images/:imageId/primary',
  authenticate,
  authorize('sales_representative'),
  asyncHandler(setImageAsPrimary)
);

/**
 * @route   PUT /api/products/images/:imageId
 * @desc    Update product image
 * @access  Private (Sales Rep only)
 */
router.put(
  '/images/:imageId',
  authenticate,
  authorize('sales_representative'),
  asyncHandler(updateImage)
);

/**
 * @route   DELETE /api/products/images/:imageId
 * @desc    Delete product image
 * @access  Private (Sales Rep only)
 */
router.delete(
  '/images/:imageId',
  authenticate,
  authorize('sales_representative'),
  asyncHandler(deleteImage)
);

/**
 * @route   POST /api/products/images/reorder
 * @desc    Reorder product images
 * @access  Private (Sales Rep only)
 */
router.post(
  '/images/reorder',
  authenticate,
  authorize('sales_representative'),
  validate([
    body('imageOrders')
      .isArray()
      .withMessage('imageOrders must be an array'),
  ]),
  asyncHandler(reorderProductImages)
);

module.exports = router;
