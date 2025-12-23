const pool = require('../config/database');

/**
 * Get sales rep profile
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await pool.query(
      `SELECT 
        u.id, u.email, u.first_name, u.last_name, u.phone,
        sr.employee_id, sr.department, sr.territory, sr.hire_date,
        m.first_name as manager_first_name, m.last_name as manager_last_name
      FROM users u
      JOIN sales_representatives sr ON u.id = sr.user_id
      LEFT JOIN sales_representatives mgr ON sr.manager_id = mgr.id
      LEFT JOIN users m ON mgr.user_id = m.id
      WHERE u.id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales rep profile not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to get profile' });
  }
};

/**
 * Apply for leave
 */
const applyLeave = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { leaveType, startDate, endDate, reason } = req.body;
    
    // Get sales rep ID
    const repResult = await pool.query(
      'SELECT id FROM sales_representatives WHERE user_id = $1',
      [userId]
    );
    
    if (repResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales rep not found' });
    }
    
    const salesRepId = repResult.rows[0].id;
    
    // Create leave request
    const result = await pool.query(
      `INSERT INTO leave_requests (sales_rep_id, leave_type, start_date, end_date, reason, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [salesRepId, leaveType, startDate, endDate, reason]
    );
    
    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ success: false, message: 'Failed to apply for leave' });
  }
};

/**
 * Get leave requests
 */
const getLeaveRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await pool.query(
      `SELECT lr.*, 
        u.first_name as approved_by_first_name,
        u.last_name as approved_by_last_name
      FROM leave_requests lr
      JOIN sales_representatives sr ON lr.sales_rep_id = sr.id
      LEFT JOIN users u ON lr.approved_by = u.id
      WHERE sr.user_id = $1
      ORDER BY lr.created_at DESC`,
      [userId]
    );
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ success: false, message: 'Failed to get leave requests' });
  }
};

/**
 * Cancel leave request
 */
const cancelLeave = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { leaveId } = req.params;
    
    const result = await pool.query(
      `UPDATE leave_requests lr
       SET status = 'cancelled'
       FROM sales_representatives sr
       WHERE lr.id = $1 
       AND lr.sales_rep_id = sr.id 
       AND sr.user_id = $2
       AND lr.status = 'pending'
       RETURNING lr.*`,
      [leaveId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Leave request not found or cannot be cancelled' 
      });
    }
    
    res.json({
      success: true,
      message: 'Leave request cancelled successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel leave' });
  }
};

/**
 * Get announcements
 */
const getAnnouncements = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sa.*, u.first_name, u.last_name
       FROM sales_rep_announcements sa
       LEFT JOIN users u ON sa.created_by = u.id
       ORDER BY sa.created_at DESC
       LIMIT 50`
    );
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ success: false, message: 'Failed to get announcements' });
  }
};

/**
 * Submit suggestion
 */
const submitSuggestion = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, category, visibility } = req.body;
    
    // Get sales rep ID
    const repResult = await pool.query(
      'SELECT id FROM sales_representatives WHERE user_id = $1',
      [userId]
    );
    
    if (repResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales rep not found' });
    }
    
    const salesRepId = repResult.rows[0].id;
    
    const result = await pool.query(
      `INSERT INTO suggestions (sales_rep_id, title, description, category, visibility)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [salesRepId, title, description, category, visibility || 'anonymous']
    );
    
    res.status(201).json({
      success: true,
      message: 'Suggestion submitted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Submit suggestion error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit suggestion' });
  }
};

/**
 * Get suggestions
 */
const getSuggestions = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await pool.query(
      `SELECT s.*, 
        CASE 
          WHEN s.visibility = 'revealed' THEN u.first_name || ' ' || u.last_name
          ELSE 'Anonymous'
        END as submitted_by
      FROM suggestions s
      JOIN sales_representatives sr ON s.sales_rep_id = sr.id
      LEFT JOIN users u ON sr.user_id = u.id
      WHERE sr.user_id = $1
      ORDER BY s.created_at DESC`,
      [userId]
    );
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ success: false, message: 'Failed to get suggestions' });
  }
};

/**
 * Get performance metrics
 */
const getMetrics = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get sales rep ID
    const repResult = await pool.query(
      'SELECT id FROM sales_representatives WHERE user_id = $1',
      [userId]
    );
    
    if (repResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales rep not found' });
    }
    
    const salesRepId = repResult.rows[0].id;
    
    // Get metrics
    const metrics = await pool.query(
      `SELECT 
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_revenue,
        COUNT(DISTINCT o.user_id) as unique_customers,
        COUNT(CASE WHEN o.order_status = 'delivered' THEN 1 END) as completed_orders,
        AVG(o.total_amount) as average_order_value
      FROM orders o
      WHERE o.sales_rep_id = $1
      AND o.created_at >= date_trunc('month', CURRENT_DATE)`,
      [salesRepId]
    );
    
    const leaveStats = await pool.query(
      `SELECT 
        COUNT(*) as total_leaves,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_leaves,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_leaves
      FROM leave_requests
      WHERE sales_rep_id = $1
      AND created_at >= date_trunc('year', CURRENT_DATE)`,
      [salesRepId]
    );
    
    res.json({
      success: true,
      data: {
        sales: metrics.rows[0],
        leaves: leaveStats.rows[0]
      }
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ success: false, message: 'Failed to get metrics' });
  }
};

module.exports = {
  getProfile,
  applyLeave,
  getLeaveRequests,
  cancelLeave,
  getAnnouncements,
  submitSuggestion,
  getSuggestions,
  getMetrics
};
