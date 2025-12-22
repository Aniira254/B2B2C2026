const pool = require('../config/database');

/**
 * Add image to product
 */
const addProductImage = async (productId, imageData) => {
  const { imageUrl, altText, isPrimary, displayOrder } = imageData;

  // If this is set as primary, unset other primary images for this product
  if (isPrimary) {
    await pool.query(
      'UPDATE product_images SET is_primary = false WHERE product_id = $1',
      [productId]
    );
  }

  const query = `
    INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [
    productId,
    imageUrl,
    altText || null,
    isPrimary || false,
    displayOrder || 0,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Get all images for a product
 */
const getProductImages = async (productId) => {
  const query = `
    SELECT * FROM product_images
    WHERE product_id = $1
    ORDER BY is_primary DESC, display_order, created_at
  `;

  try {
    const result = await pool.query(query, [productId]);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

/**
 * Get image by ID
 */
const getImageById = async (imageId) => {
  const query = `SELECT * FROM product_images WHERE id = $1`;

  try {
    const result = await pool.query(query, [imageId]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Update product image
 */
const updateProductImage = async (imageId, updates) => {
  const allowedFields = ['image_url', 'alt_text', 'is_primary', 'display_order'];
  const fields = [];
  const values = [];
  let paramCount = 1;

  // If updating to primary, get product_id first
  if (updates.is_primary === true) {
    const image = await getImageById(imageId);
    if (image) {
      await pool.query(
        'UPDATE product_images SET is_primary = false WHERE product_id = $1',
        [image.product_id]
      );
    }
  }

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

  values.push(imageId);

  const query = `
    UPDATE product_images
    SET ${fields.join(', ')}
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
 * Delete product image
 */
const deleteProductImage = async (imageId) => {
  const query = `DELETE FROM product_images WHERE id = $1 RETURNING *`;

  try {
    const result = await pool.query(query, [imageId]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Set primary image
 */
const setPrimaryImage = async (productId, imageId) => {
  // Unset all primary images for the product
  await pool.query(
    'UPDATE product_images SET is_primary = false WHERE product_id = $1',
    [productId]
  );

  // Set the specified image as primary
  const query = `
    UPDATE product_images
    SET is_primary = true
    WHERE id = $1 AND product_id = $2
    RETURNING *
  `;

  try {
    const result = await pool.query(query, [imageId, productId]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Reorder images
 */
const reorderImages = async (imageOrders) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const { imageId, displayOrder } of imageOrders) {
      await client.query(
        'UPDATE product_images SET display_order = $1 WHERE id = $2',
        [displayOrder, imageId]
      );
    }

    await client.query('COMMIT');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  addProductImage,
  getProductImages,
  getImageById,
  updateProductImage,
  deleteProductImage,
  setPrimaryImage,
  reorderImages,
};
