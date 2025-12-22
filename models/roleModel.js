const pool = require('../config/database');

/**
 * Create retail customer profile
 */
const createRetailCustomer = async (userId, customerData = {}) => {
  const {
    shippingAddress,
    billingAddress,
    city,
    state,
    zipCode,
    country,
  } = customerData;

  const query = `
    INSERT INTO retail_customers (
      user_id, shipping_address, billing_address, city, state, zip_code, country
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const values = [
    userId,
    shippingAddress || null,
    billingAddress || null,
    city || null,
    state || null,
    zipCode || null,
    country || null,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Create distributor profile (pending approval)
 */
const createDistributor = async (userId, distributorData) => {
  const {
    companyName,
    businessRegistrationNumber,
    taxId,
    businessAddress,
    city,
    state,
    zipCode,
    country,
  } = distributorData;

  const query = `
    INSERT INTO distributors (
      user_id, company_name, business_registration_number, tax_id,
      business_address, city, state, zip_code, country, approval_status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
    RETURNING *
  `;

  const values = [
    userId,
    companyName,
    businessRegistrationNumber || null,
    taxId || null,
    businessAddress,
    city || null,
    state || null,
    zipCode || null,
    country || null,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Get distributor by user ID
 */
const getDistributorByUserId = async (userId) => {
  const query = `
    SELECT * FROM distributors
    WHERE user_id = $1
  `;

  try {
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Update distributor approval status
 */
const updateDistributorApproval = async (distributorId, status, approvedBy, rejectionReason = null) => {
  const query = `
    UPDATE distributors
    SET 
      approval_status = $1,
      approved_by = $2,
      approved_at = CURRENT_TIMESTAMP,
      rejection_reason = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *
  `;

  const values = [status, approvedBy, rejectionReason, distributorId];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Get all pending distributor approvals
 */
const getPendingDistributors = async () => {
  const query = `
    SELECT 
      d.*,
      u.email,
      u.first_name,
      u.last_name,
      u.phone
    FROM distributors d
    JOIN users u ON d.user_id = u.id
    WHERE d.approval_status = 'pending'
    ORDER BY d.created_at DESC
  `;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

/**
 * Create sales representative profile
 */
const createSalesRep = async (userId, salesRepData) => {
  const { employeeId, department, territory, managerId, hireDate } = salesRepData;

  const query = `
    INSERT INTO sales_representatives (
      user_id, employee_id, department, territory, manager_id, hire_date
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [
    userId,
    employeeId,
    department || null,
    territory || null,
    managerId || null,
    hireDate || new Date(),
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new Error('Employee ID already exists');
    }
    throw error;
  }
};

module.exports = {
  createRetailCustomer,
  createDistributor,
  getDistributorByUserId,
  updateDistributorApproval,
  getPendingDistributors,
  createSalesRep,
};
