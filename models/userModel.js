const pool = require('../config/database');

/**
 * Create a new user
 */
const createUser = async (userData) => {
  const { email, passwordHash, userType, firstName, lastName, phone } = userData;

  const query = `
    INSERT INTO users (email, password_hash, user_type, first_name, last_name, phone)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, email, user_type, first_name, last_name, phone, is_active, created_at
  `;

  const values = [email, passwordHash, userType, firstName, lastName, phone];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      throw new Error('Email already exists');
    }
    throw error;
  }
};

/**
 * Find user by email
 */
const findUserByEmail = async (email) => {
  const query = `
    SELECT id, email, password_hash, user_type, first_name, last_name, phone, is_active, created_at
    FROM users
    WHERE email = $1
  `;

  try {
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Find user by ID
 */
const findUserById = async (userId) => {
  const query = `
    SELECT id, email, user_type, first_name, last_name, phone, is_active, created_at, updated_at
    FROM users
    WHERE id = $1
  `;

  try {
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, updates) => {
  const allowedFields = ['first_name', 'last_name', 'phone'];
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

  values.push(userId);

  const query = `
    UPDATE users
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount}
    RETURNING id, email, user_type, first_name, last_name, phone, updated_at
  `;

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Update user password
 */
const updateUserPassword = async (userId, newPasswordHash) => {
  const query = `
    UPDATE users
    SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id
  `;

  try {
    const result = await pool.query(query, [newPasswordHash, userId]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Deactivate user account
 */
const deactivateUser = async (userId) => {
  const query = `
    UPDATE users
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, is_active
  `;

  try {
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile,
  updateUserPassword,
  deactivateUser,
};
