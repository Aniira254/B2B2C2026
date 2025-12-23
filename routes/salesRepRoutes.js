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
  getMetrics
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

module.exports = router;
