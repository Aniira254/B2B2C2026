const { verifyAccessToken } = require('../utils/jwt');
const { findUserById } = require('../models/userModel');
const { getDistributorByUserId } = require('../models/roleModel');

/**
 * Authenticate JWT token middleware
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyAccessToken(token);

    // Check if user still exists and is active
    const user = await findUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated.',
      });
    }

    // Attach user info to request
    req.user = {
      userId: user.id,
      email: user.email,
      userType: user.user_type,
      firstName: user.first_name,
      lastName: user.last_name,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid token.',
    });
  }
};

/**
 * Check if user has required role(s)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};

/**
 * Check if distributor is approved
 */
const checkDistributorApproval = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Only check for distributors
    if (req.user.userType !== 'distributor') {
      return next();
    }

    const distributor = await getDistributorByUserId(req.user.userId);

    if (!distributor) {
      return res.status(404).json({
        success: false,
        message: 'Distributor profile not found.',
      });
    }

    if (distributor.approval_status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your distributor account is pending approval.',
        approvalStatus: 'pending',
      });
    }

    if (distributor.approval_status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your distributor account has been rejected.',
        approvalStatus: 'rejected',
        rejectionReason: distributor.rejection_reason,
      });
    }

    // Attach distributor info to request
    req.distributor = distributor;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking distributor approval status.',
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    const user = await findUserById(decoded.userId);

    if (user && user.is_active) {
      req.user = {
        userId: user.id,
        email: user.email,
        userType: user.user_type,
        firstName: user.first_name,
        lastName: user.last_name,
      };
    }

    next();
  } catch (error) {
    // Continue without user info if token is invalid
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  checkDistributorApproval,
  optionalAuthenticate,
};
