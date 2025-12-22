const express = require('express');
const router = express.Router();
const {
  getPendingApprovals,
  updateApprovalStatus,
  getDistributorStatus,
} = require('../controllers/distributorController');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validate } = require('../utils/validation');
const { body } = require('express-validator');

/**
 * @route   GET /api/distributors/pending
 * @desc    Get all pending distributor approvals
 * @access  Private (Sales Rep only)
 */
router.get(
  '/pending',
  authenticate,
  authorize('sales_representative'),
  asyncHandler(getPendingApprovals)
);

/**
 * @route   PUT /api/distributors/:distributorId/approval
 * @desc    Approve or reject distributor
 * @access  Private (Sales Rep only)
 */
router.put(
  '/:distributorId/approval',
  authenticate,
  authorize('sales_representative'),
  validate([
    body('status')
      .isIn(['approved', 'rejected'])
      .withMessage('Status must be either approved or rejected'),
    body('rejectionReason')
      .if(body('status').equals('rejected'))
      .notEmpty()
      .withMessage('Rejection reason is required when rejecting'),
  ]),
  asyncHandler(updateApprovalStatus)
);

/**
 * @route   GET /api/distributors/status
 * @desc    Get distributor's own approval status
 * @access  Private (Distributor only)
 */
router.get(
  '/status',
  authenticate,
  authorize('distributor'),
  asyncHandler(getDistributorStatus)
);

module.exports = router;
