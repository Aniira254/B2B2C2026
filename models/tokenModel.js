const pool = require('../config/database');

/**
 * Store refresh token
 */
const storeRefreshToken = async (userId, refreshToken, expiresAt) => {
  const query = `
    INSERT INTO refresh_tokens (user_id, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, token, expires_at, created_at
  `;

  try {
    const result = await pool.query(query, [userId, refreshToken, expiresAt]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Find refresh token
 */
const findRefreshToken = async (token) => {
  const query = `
    SELECT * FROM refresh_tokens
    WHERE token = $1 AND expires_at > NOW() AND revoked = false
  `;

  try {
    const result = await pool.query(query, [token]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Revoke refresh token
 */
const revokeRefreshToken = async (token) => {
  const query = `
    UPDATE refresh_tokens
    SET revoked = true
    WHERE token = $1
    RETURNING id
  `;

  try {
    const result = await pool.query(query, [token]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Revoke all user tokens
 */
const revokeAllUserTokens = async (userId) => {
  const query = `
    UPDATE refresh_tokens
    SET revoked = true
    WHERE user_id = $1 AND revoked = false
    RETURNING count(*) as revoked_count
  `;

  try {
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Clean up expired tokens
 */
const cleanupExpiredTokens = async () => {
  const query = `
    DELETE FROM refresh_tokens
    WHERE expires_at < NOW() OR (revoked = true AND created_at < NOW() - INTERVAL '30 days')
  `;

  try {
    const result = await pool.query(query);
    return result.rowCount;
  } catch (error) {
    throw error;
  }
};

/**
 * Store password reset token
 */
const storePasswordResetToken = async (userId, token, expiresAt) => {
  const query = `
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id) 
    DO UPDATE SET token = $2, expires_at = $3, used = false, created_at = CURRENT_TIMESTAMP
    RETURNING id, user_id, token, expires_at
  `;

  try {
    const result = await pool.query(query, [userId, token, expiresAt]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Find password reset token
 */
const findPasswordResetToken = async (token) => {
  const query = `
    SELECT * FROM password_reset_tokens
    WHERE token = $1 AND expires_at > NOW() AND used = false
  `;

  try {
    const result = await pool.query(query, [token]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark password reset token as used
 */
const markPasswordResetTokenUsed = async (token) => {
  const query = `
    UPDATE password_reset_tokens
    SET used = true
    WHERE token = $1
    RETURNING id
  `;

  try {
    const result = await pool.query(query, [token]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

module.exports = {
  storeRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  cleanupExpiredTokens,
  storePasswordResetToken,
  findPasswordResetToken,
  markPasswordResetTokenUsed,
};
