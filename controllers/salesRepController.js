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

/**
 * Submit report
 */
const submitReport = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, reportType, description, period } = req.body;
    const filePath = req.file ? req.file.path : null;

    const repResult = await pool.query(
      'SELECT id FROM sales_representatives WHERE user_id = $1',
      [userId]
    );

    if (repResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales rep not found' });
    }

    const result = await pool.query(
      `INSERT INTO sales_reports 
        (sales_rep_id, title, report_type, description, period, file_path, status, submitted_date)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', CURRENT_TIMESTAMP)
      RETURNING *`,
      [repResult.rows[0].id, title, reportType, description, period, filePath]
    );

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Submit report error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit report' });
  }
};

/**
 * Get reports
 */
const getReports = async (req, res) => {
  try {
    const userId = req.user.userId;

    const repResult = await pool.query(
      'SELECT id FROM sales_representatives WHERE user_id = $1',
      [userId]
    );

    if (repResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales rep not found' });
    }

    const result = await pool.query(
      `SELECT r.*, u.first_name || ' ' || u.last_name as reviewed_by
      FROM sales_reports r
      LEFT JOIN users u ON r.reviewed_by_id = u.id
      WHERE r.sales_rep_id = $1
      ORDER BY r.submitted_date DESC`,
      [repResult.rows[0].id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, message: 'Failed to get reports' });
  }
};

/**
 * Get tasks
 */
const getTasks = async (req, res) => {
  try {
    const userId = req.user.userId;

    const repResult = await pool.query(
      'SELECT id FROM sales_representatives WHERE user_id = $1',
      [userId]
    );

    if (repResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales rep not found' });
    }

    const result = await pool.query(
      `SELECT * FROM sales_tasks
      WHERE sales_rep_id = $1
      ORDER BY 
        CASE status
          WHEN 'in_progress' THEN 1
          WHEN 'todo' THEN 2
          WHEN 'completed' THEN 3
        END,
        due_date ASC NULLS LAST,
        created_at DESC`,
      [repResult.rows[0].id]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ success: false, message: 'Failed to get tasks' });
  }
};

/**
 * Create task
 */
const createTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, priority, dueDate, status } = req.body;

    const repResult = await pool.query(
      'SELECT id FROM sales_representatives WHERE user_id = $1',
      [userId]
    );

    if (repResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales rep not found' });
    }

    const result = await pool.query(
      `INSERT INTO sales_tasks 
        (sales_rep_id, title, description, priority, due_date, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [repResult.rows[0].id, title, description || null, priority || 'medium', dueDate || null, status || 'todo']
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
};

/**
 * Update task
 */
const updateTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId } = req.params;
    const { title, description, priority, dueDate, status } = req.body;

    const repResult = await pool.query(
      'SELECT id FROM sales_representatives WHERE user_id = $1',
      [userId]
    );

    if (repResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales rep not found' });
    }

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (priority !== undefined) {
      fields.push(`priority = $${paramCount++}`);
      values.push(priority);
    }
    if (dueDate !== undefined) {
      fields.push(`due_date = $${paramCount++}`);
      values.push(dueDate);
    }
    if (status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(taskId, repResult.rows[0].id);

    const result = await pool.query(
      `UPDATE sales_tasks 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount++} AND sales_rep_id = $${paramCount}
      RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
};

/**
 * Delete task
 */
const deleteTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { taskId } = req.params;

    const repResult = await pool.query(
      'SELECT id FROM sales_representatives WHERE user_id = $1',
      [userId]
    );

    if (repResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sales rep not found' });
    }

    const result = await pool.query(
      `DELETE FROM sales_tasks 
      WHERE id = $1 AND sales_rep_id = $2
      RETURNING *`,
      [taskId, repResult.rows[0].id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
};

/**
 * Get conversations
 */
const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT DISTINCT 
        c.id,
        CASE 
          WHEN c.participant1_id = $1 THEN u2.first_name || ' ' || u2.last_name
          ELSE u1.first_name || ' ' || u1.last_name
        END as participant_name,
        CASE 
          WHEN c.participant1_id = $1 THEN r2.name
          ELSE r1.name
        END as participant_role,
        c.last_message_time,
        (SELECT message FROM messages WHERE conversation_id = c.id ORDER BY sent_at DESC LIMIT 1) as last_message,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND recipient_id = $1 AND is_read = false) as unread_count
      FROM conversations c
      JOIN users u1 ON c.participant1_id = u1.id
      JOIN users u2 ON c.participant2_id = u2.id
      LEFT JOIN user_roles ur1 ON u1.id = ur1.user_id
      LEFT JOIN user_roles ur2 ON u2.id = ur2.user_id
      LEFT JOIN roles r1 ON ur1.role_id = r1.id
      LEFT JOIN roles r2 ON ur2.role_id = r2.id
      WHERE c.participant1_id = $1 OR c.participant2_id = $1
      ORDER BY c.last_message_time DESC NULLS LAST`,
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: 'Failed to get conversations' });
  }
};

/**
 * Get messages
 */
const getMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;

    // Mark messages as read
    await pool.query(
      `UPDATE messages 
      SET is_read = true 
      WHERE conversation_id = $1 AND recipient_id = $2`,
      [conversationId, userId]
    );

    const result = await pool.query(
      `SELECT m.*, 
        u.first_name || ' ' || u.last_name as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.sent_at ASC`,
      [conversationId]
    );

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Failed to get messages' });
  }
};

/**
 * Send message
 */
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;
    const { message } = req.body;

    // Get conversation details
    const convResult = await pool.query(
      'SELECT * FROM conversations WHERE id = $1',
      [conversationId]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const conversation = convResult.rows[0];
    const recipientId = conversation.participant1_id === userId 
      ? conversation.participant2_id 
      : conversation.participant1_id;

    const result = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, recipient_id, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [conversationId, userId, recipientId, message]
    );

    // Update conversation last message time
    await pool.query(
      'UPDATE conversations SET last_message_time = CURRENT_TIMESTAMP WHERE id = $1',
      [conversationId]
    );

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
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
  getMetrics,
  submitReport,
  getReports,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getConversations,
  getMessages,
  sendMessage
};
