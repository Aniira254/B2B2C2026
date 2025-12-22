const { body } = require('express-validator');

/**
 * Product creation validation
 */
const createProductValidation = [
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ max: 100 })
    .withMessage('SKU must not exceed 100 characters'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 255 })
    .withMessage('Product name must not exceed 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must not exceed 100 characters'),
  body('retailPrice')
    .isFloat({ min: 0 })
    .withMessage('Retail price must be a positive number'),
  body('distributorPrice')
    .isFloat({ min: 0 })
    .withMessage('Distributor price must be a positive number'),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('isOnSale')
    .optional()
    .isBoolean()
    .withMessage('isOnSale must be a boolean'),
  body('isNewArrival')
    .optional()
    .isBoolean()
    .withMessage('isNewArrival must be a boolean'),
  body('isSpecialOffer')
    .optional()
    .isBoolean()
    .withMessage('isSpecialOffer must be a boolean'),
  body('saleDiscountPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Sale discount percentage must be between 0 and 100'),
];

/**
 * Product update validation
 */
const updateProductValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Product name must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must not exceed 100 characters'),
  body('retailPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Retail price must be a positive number'),
  body('distributorPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Distributor price must be a positive number'),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('isOnSale')
    .optional()
    .isBoolean()
    .withMessage('isOnSale must be a boolean'),
  body('isNewArrival')
    .optional()
    .isBoolean()
    .withMessage('isNewArrival must be a boolean'),
  body('isSpecialOffer')
    .optional()
    .isBoolean()
    .withMessage('isSpecialOffer must be a boolean'),
  body('saleDiscountPercentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Sale discount percentage must be between 0 and 100'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

/**
 * Product image validation
 */
const addImageValidation = [
  body('imageUrl')
    .trim()
    .notEmpty()
    .withMessage('Image URL is required')
    .isURL()
    .withMessage('Must be a valid URL'),
  body('altText')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Alt text must not exceed 255 characters'),
  body('isPrimary')
    .optional()
    .isBoolean()
    .withMessage('isPrimary must be a boolean'),
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer'),
];

/**
 * Stock update validation
 */
const updateStockValidation = [
  body('quantity')
    .isInt()
    .withMessage('Quantity must be an integer'),
];

module.exports = {
  createProductValidation,
  updateProductValidation,
  addImageValidation,
  updateStockValidation,
};
