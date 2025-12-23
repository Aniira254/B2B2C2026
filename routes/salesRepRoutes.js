const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
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
} = require('../controllers/salesRepController');

// All routes require authentication as sales rep
router.use(authenticate);
router.use(authorize(['sales_representative']));

// Profile
router.get('/profile', getProfile);

// Leave Management
router.post('/leave', applyLeave);
router.get('/leave', getLeaveRequests);
router.patch('/leave/:leaveId/cancel', cancelLeave);

// Announcements
router.get('/announcements', getAnnouncements);

// Suggestions
router.post('/suggestions', submitSuggestion);
router.get('/suggestions', getSuggestions);

// Metrics
router.get('/metrics', getMetrics);

// Reports
router.post('/reports', submitReport);
router.get('/reports', getReports);

// Tasks
router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.patch('/tasks/:taskId', updateTask);
router.delete('/tasks/:taskId', deleteTask);

// Messaging
router.get('/messages/conversations', getConversations);
router.get('/messages/:conversationId', getMessages);
router.post('/messages/:conversationId', sendMessage);

module.exports = router;
