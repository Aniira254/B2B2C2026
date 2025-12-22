const { getPendingDistributors, updateDistributorApproval, getDistributorByUserId } = require('../models/roleModel');
const { findUserById } = require('../models/userModel');
const { sendDistributorApprovalEmail } = require('../utils/email');

/**
 * Get all pending distributor approvals (Admin only)
 */
const getPendingApprovals = async (req, res) => {
  try {
    const pendingDistributors = await getPendingDistributors();

    res.json({
      success: true,
      data: pendingDistributors,
      count: pendingDistributors.length,
    });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending approvals',
    });
  }
};

/**
 * Approve or reject distributor (Admin only)
 */
const updateApprovalStatus = async (req, res) => {
  try {
    const { distributorId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected"',
      });
    }

    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting a distributor',
      });
    }

    // Update distributor status
    const updatedDistributor = await updateDistributorApproval(
      distributorId,
      status,
      req.user.userId,
      rejectionReason
    );

    if (!updatedDistributor) {
      return res.status(404).json({
        success: false,
        message: 'Distributor not found',
      });
    }

    // Get user details for email
    const user = await findUserById(updatedDistributor.user_id);

    // Send approval/rejection email
    if (user) {
      sendDistributorApprovalEmail(
        user.email,
        `${user.first_name} ${user.last_name}`,
        status === 'approved',
        rejectionReason
      ).catch(err => {
        console.error('Failed to send approval email:', err);
      });
    }

    res.json({
      success: true,
      message: `Distributor ${status} successfully`,
      data: updatedDistributor,
    });
  } catch (error) {
    console.error('Update approval status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update approval status',
    });
  }
};

/**
 * Get distributor status (for distributor to check their own status)
 */
const getDistributorStatus = async (req, res) => {
  try {
    const distributor = await getDistributorByUserId(req.user.userId);

    if (!distributor) {
      return res.status(404).json({
        success: false,
        message: 'Distributor profile not found',
      });
    }

    res.json({
      success: true,
      data: {
        approvalStatus: distributor.approval_status,
        rejectionReason: distributor.rejection_reason,
        approvedAt: distributor.approved_at,
        companyName: distributor.company_name,
      },
    });
  } catch (error) {
    console.error('Get distributor status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch distributor status',
    });
  }
};

module.exports = {
  getPendingApprovals,
  updateApprovalStatus,
  getDistributorStatus,
};
