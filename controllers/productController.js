const {
  createProduct,
  getProducts,
  getProductById,
  getProductBySku,
  updateProduct,
  deleteProduct,
  getCategories,
  updateStock,
} = require('../models/productModel');
const {
  addProductImage,
  getProductImages,
  updateProductImage,
  deleteProductImage,
  setPrimaryImage,
  reorderImages,
} = require('../models/productImageModel');
const { getDistributorByUserId } = require('../models/roleModel');

/**
 * Apply pricing based on user role
 */
const applyPricingLogic = (product, userType, isDistributorApproved) => {
  const productCopy = { ...product };

  // Determine which price to show
  if (userType === 'distributor' && isDistributorApproved) {
    productCopy.price = productCopy.distributor_price;
    productCopy.priceType = 'distributor';
  } else {
    productCopy.price = productCopy.retail_price;
    productCopy.priceType = 'retail';
  }

  // Calculate final price if on sale
  if (productCopy.is_on_sale && productCopy.sale_discount_percentage) {
    const discount = (productCopy.price * productCopy.sale_discount_percentage) / 100;
    productCopy.finalPrice = (productCopy.price - discount).toFixed(2);
    productCopy.savings = discount.toFixed(2);
  } else {
    productCopy.finalPrice = productCopy.price;
    productCopy.savings = 0;
  }

  // Remove the other price for security (only admins should see both)
  if (userType !== 'sales_representative') {
    delete productCopy.retail_price;
    delete productCopy.distributor_price;
  }

  return productCopy;
};

/**
 * Create new product (Admin only)
 */
const createNewProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      description,
      category,
      retailPrice,
      distributorPrice,
      stockQuantity,
      isOnSale,
      isNewArrival,
      isSpecialOffer,
      saleDiscountPercentage,
    } = req.body;

    // Validate required fields
    if (!sku || !name || !retailPrice || !distributorPrice) {
      return res.status(400).json({
        success: false,
        message: 'SKU, name, retail price, and distributor price are required',
      });
    }

    const product = await createProduct({
      sku,
      name,
      description,
      category,
      retailPrice,
      distributorPrice,
      stockQuantity,
      isOnSale,
      isNewArrival,
      isSpecialOffer,
      saleDiscountPercentage,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product',
    });
  }
};

/**
 * Get all products with filters
 */
const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      isOnSale,
      isNewArrival,
      isSpecialOffer,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filters = {
      category,
      isOnSale: isOnSale === 'true' ? true : isOnSale === 'false' ? false : undefined,
      isNewArrival: isNewArrival === 'true' ? true : isNewArrival === 'false' ? false : undefined,
      isSpecialOffer: isSpecialOffer === 'true' ? true : isSpecialOffer === 'false' ? false : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      searchTerm: search,
      isActive: true, // Only show active products to public
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    };

    const result = await getProducts(filters);

    // Check if user is authenticated and get their role
    let userType = null;
    let isDistributorApproved = false;

    if (req.user) {
      userType = req.user.userType;

      // Check distributor approval status
      if (userType === 'distributor') {
        const distributor = await getDistributorByUserId(req.user.userId);
        isDistributorApproved = distributor?.approval_status === 'approved';
      }
    }

    // Apply pricing logic to each product
    const productsWithPricing = result.products.map((product) =>
      applyPricingLogic(product, userType, isDistributorApproved)
    );

    res.json({
      success: true,
      data: {
        products: productsWithPricing,
        pagination: {
          total: result.total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(result.total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};

/**
 * Get product by ID
 */
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if product is active (unless user is admin)
    if (!product.is_active && req.user?.userType !== 'sales_representative') {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Apply pricing logic
    let userType = null;
    let isDistributorApproved = false;

    if (req.user) {
      userType = req.user.userType;

      if (userType === 'distributor') {
        const distributor = await getDistributorByUserId(req.user.userId);
        isDistributorApproved = distributor?.approval_status === 'approved';
      }
    }

    const productWithPricing = applyPricingLogic(product, userType, isDistributorApproved);

    res.json({
      success: true,
      data: productWithPricing,
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
    });
  }
};

/**
 * Update product (Admin only)
 */
const updateProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};

    // Map request body to database fields
    const fieldMapping = {
      name: 'name',
      description: 'description',
      category: 'category',
      retailPrice: 'retail_price',
      distributorPrice: 'distributor_price',
      stockQuantity: 'stock_quantity',
      isOnSale: 'is_on_sale',
      isNewArrival: 'is_new_arrival',
      isSpecialOffer: 'is_special_offer',
      saleDiscountPercentage: 'sale_discount_percentage',
      isActive: 'is_active',
    };

    Object.keys(fieldMapping).forEach((key) => {
      if (req.body[key] !== undefined) {
        updates[fieldMapping[key]] = req.body[key];
      }
    });

    const product = await updateProduct(id, updates);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update product',
    });
  }
};

/**
 * Delete product (Admin only)
 */
const deleteProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await deleteProduct(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: product,
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
    });
  }
};

/**
 * Get all categories
 */
const getProductCategories = async (req, res) => {
  try {
    const categories = await getCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
    });
  }
};

/**
 * Update product stock (Admin only)
 */
const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required',
      });
    }

    const product = await updateStock(id, quantity);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: product,
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
    });
  }
};

/**
 * Add image to product (Admin only)
 */
const addImageToProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl, altText, isPrimary, displayOrder } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required',
      });
    }

    const image = await addProductImage(id, {
      imageUrl,
      altText,
      isPrimary,
      displayOrder,
    });

    res.status(201).json({
      success: true,
      message: 'Image added successfully',
      data: image,
    });
  } catch (error) {
    console.error('Add image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add image',
    });
  }
};

/**
 * Get product images
 */
const getImages = async (req, res) => {
  try {
    const { id } = req.params;

    const images = await getProductImages(id);

    res.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch images',
    });
  }
};

/**
 * Update product image (Admin only)
 */
const updateImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const updates = {};

    const allowedFields = ['imageUrl', 'altText', 'isPrimary', 'displayOrder'];
    const fieldMapping = {
      imageUrl: 'image_url',
      altText: 'alt_text',
      isPrimary: 'is_primary',
      displayOrder: 'display_order',
    };

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[fieldMapping[field]] = req.body[field];
      }
    });

    const image = await updateProductImage(imageId, updates);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    res.json({
      success: true,
      message: 'Image updated successfully',
      data: image,
    });
  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update image',
    });
  }
};

/**
 * Delete product image (Admin only)
 */
const deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const image = await deleteProductImage(imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: image,
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
    });
  }
};

/**
 * Set primary image (Admin only)
 */
const setImageAsPrimary = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const image = await setPrimaryImage(id, imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }

    res.json({
      success: true,
      message: 'Primary image set successfully',
      data: image,
    });
  } catch (error) {
    console.error('Set primary image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set primary image',
    });
  }
};

/**
 * Reorder images (Admin only)
 */
const reorderProductImages = async (req, res) => {
  try {
    const { imageOrders } = req.body;

    if (!Array.isArray(imageOrders)) {
      return res.status(400).json({
        success: false,
        message: 'imageOrders must be an array',
      });
    }

    await reorderImages(imageOrders);

    res.json({
      success: true,
      message: 'Images reordered successfully',
    });
  } catch (error) {
    console.error('Reorder images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder images',
    });
  }
};

module.exports = {
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
};
