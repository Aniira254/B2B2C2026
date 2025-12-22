const pool = require('../config/database');

/**
 * Create a new product
 */
const createProduct = async (productData) => {
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
  } = productData;

  const query = `
    INSERT INTO products (
      sku, name, description, category, retail_price, distributor_price,
      stock_quantity, is_on_sale, is_new_arrival, is_special_offer,
      sale_discount_percentage, is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
    RETURNING *
  `;

  const values = [
    sku,
    name,
    description || null,
    category || null,
    retailPrice,
    distributorPrice,
    stockQuantity || 0,
    isOnSale || false,
    isNewArrival || false,
    isSpecialOffer || false,
    saleDiscountPercentage || null,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new Error('SKU already exists');
    }
    throw error;
  }
};

/**
 * Get all products with optional filters
 */
const getProducts = async (filters = {}) => {
  const {
    category,
    isOnSale,
    isNewArrival,
    isSpecialOffer,
    minPrice,
    maxPrice,
    searchTerm,
    isActive,
    limit = 50,
    offset = 0,
  } = filters;

  let query = `
    SELECT 
      p.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', pi.id,
            'imageUrl', pi.image_url,
            'altText', pi.alt_text,
            'isPrimary', pi.is_primary,
            'displayOrder', pi.display_order
          ) ORDER BY pi.is_primary DESC, pi.display_order
        ) FILTER (WHERE pi.id IS NOT NULL),
        '[]'
      ) as images
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    WHERE 1=1
  `;

  const values = [];
  let paramCount = 1;

  // Add filters
  if (category) {
    query += ` AND p.category = $${paramCount}`;
    values.push(category);
    paramCount++;
  }

  if (isOnSale !== undefined) {
    query += ` AND p.is_on_sale = $${paramCount}`;
    values.push(isOnSale);
    paramCount++;
  }

  if (isNewArrival !== undefined) {
    query += ` AND p.is_new_arrival = $${paramCount}`;
    values.push(isNewArrival);
    paramCount++;
  }

  if (isSpecialOffer !== undefined) {
    query += ` AND p.is_special_offer = $${paramCount}`;
    values.push(isSpecialOffer);
    paramCount++;
  }

  if (isActive !== undefined) {
    query += ` AND p.is_active = $${paramCount}`;
    values.push(isActive);
    paramCount++;
  }

  if (minPrice !== undefined) {
    query += ` AND p.retail_price >= $${paramCount}`;
    values.push(minPrice);
    paramCount++;
  }

  if (maxPrice !== undefined) {
    query += ` AND p.retail_price <= $${paramCount}`;
    values.push(maxPrice);
    paramCount++;
  }

  if (searchTerm) {
    query += ` AND (
      p.name ILIKE $${paramCount} OR 
      p.description ILIKE $${paramCount} OR 
      p.category ILIKE $${paramCount} OR
      p.sku ILIKE $${paramCount}
    )`;
    values.push(`%${searchTerm}%`);
    paramCount++;
  }

  query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  values.push(limit, offset);

  try {
    const result = await pool.query(query, values);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) FROM products p WHERE 1=1`;
    const countValues = [];
    let countParamCount = 1;

    if (category) {
      countQuery += ` AND p.category = $${countParamCount}`;
      countValues.push(category);
      countParamCount++;
    }

    if (isOnSale !== undefined) {
      countQuery += ` AND p.is_on_sale = $${countParamCount}`;
      countValues.push(isOnSale);
      countParamCount++;
    }

    if (isNewArrival !== undefined) {
      countQuery += ` AND p.is_new_arrival = $${countParamCount}`;
      countValues.push(isNewArrival);
      countParamCount++;
    }

    if (isSpecialOffer !== undefined) {
      countQuery += ` AND p.is_special_offer = $${countParamCount}`;
      countValues.push(isSpecialOffer);
      countParamCount++;
    }

    if (isActive !== undefined) {
      countQuery += ` AND p.is_active = $${countParamCount}`;
      countValues.push(isActive);
      countParamCount++;
    }

    if (minPrice !== undefined) {
      countQuery += ` AND p.retail_price >= $${countParamCount}`;
      countValues.push(minPrice);
      countParamCount++;
    }

    if (maxPrice !== undefined) {
      countQuery += ` AND p.retail_price <= $${countParamCount}`;
      countValues.push(maxPrice);
      countParamCount++;
    }

    if (searchTerm) {
      countQuery += ` AND (
        p.name ILIKE $${countParamCount} OR 
        p.description ILIKE $${countParamCount} OR 
        p.category ILIKE $${countParamCount} OR
        p.sku ILIKE $${countParamCount}
      )`;
      countValues.push(`%${searchTerm}%`);
      countParamCount++;
    }

    const countResult = await pool.query(countQuery, countValues);
    
    return {
      products: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit,
      offset,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get product by ID
 */
const getProductById = async (productId) => {
  const query = `
    SELECT 
      p.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', pi.id,
            'imageUrl', pi.image_url,
            'altText', pi.alt_text,
            'isPrimary', pi.is_primary,
            'displayOrder', pi.display_order
          ) ORDER BY pi.is_primary DESC, pi.display_order
        ) FILTER (WHERE pi.id IS NOT NULL),
        '[]'
      ) as images
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    WHERE p.id = $1
    GROUP BY p.id
  `;

  try {
    const result = await pool.query(query, [productId]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Get product by SKU
 */
const getProductBySku = async (sku) => {
  const query = `
    SELECT 
      p.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', pi.id,
            'imageUrl', pi.image_url,
            'altText', pi.alt_text,
            'isPrimary', pi.is_primary,
            'displayOrder', pi.display_order
          ) ORDER BY pi.is_primary DESC, pi.display_order
        ) FILTER (WHERE pi.id IS NOT NULL),
        '[]'
      ) as images
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    WHERE p.sku = $1
    GROUP BY p.id
  `;

  try {
    const result = await pool.query(query, [sku]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Update product
 */
const updateProduct = async (productId, updates) => {
  const allowedFields = [
    'name',
    'description',
    'category',
    'retail_price',
    'distributor_price',
    'stock_quantity',
    'is_on_sale',
    'is_new_arrival',
    'is_special_offer',
    'sale_discount_percentage',
    'is_active',
  ];

  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key) && updates[key] !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    }
  });

  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  values.push(productId);

  const query = `
    UPDATE products
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount}
    RETURNING *
  `;

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Delete product (soft delete - set inactive)
 */
const deleteProduct = async (productId) => {
  const query = `
    UPDATE products
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, is_active
  `;

  try {
    const result = await pool.query(query, [productId]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Hard delete product (permanent)
 */
const hardDeleteProduct = async (productId) => {
  const query = `DELETE FROM products WHERE id = $1 RETURNING id`;

  try {
    const result = await pool.query(query, [productId]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Get product categories
 */
const getCategories = async () => {
  const query = `
    SELECT DISTINCT category, COUNT(*) as product_count
    FROM products
    WHERE category IS NOT NULL AND is_active = true
    GROUP BY category
    ORDER BY category
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

/**
 * Update stock quantity
 */
const updateStock = async (productId, quantity) => {
  const query = `
    UPDATE products
    SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, stock_quantity
  `;

  try {
    const result = await pool.query(query, [quantity, productId]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getProductBySku,
  updateProduct,
  deleteProduct,
  hardDeleteProduct,
  getCategories,
  updateStock,
};
