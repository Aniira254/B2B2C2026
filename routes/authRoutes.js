const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  requestPasswordReset,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  validate,
  registrationValidation,
  distributorRegistrationValidation,
  loginValidation,
  passwordResetRequestValidation,
  passwordResetValidation,
  profileUpdateValidation,
} = require('../utils/validation');
const { body } = require('express-validator');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (customer, distributor, or sales rep)
 * @access  Public
 */
router.post(
  '/register',
  validate(registrationValidation),
  asyncHandler(register)
);

/**
 * @route   POST /api/auth/register/distributor
 * @desc    Register new distributor with additional info
 * @access  Public
 */
router.post(
  '/register/distributor',
  validate(distributorRegistrationValidation),
  asyncHandler(register)
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT tokens
 * @access  Public
 */
router.post(
  '/login',
  validate(loginValidation),
  asyncHandler(login)
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post(
  '/refresh-token',
  validate([
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  ]),
  asyncHandler(refreshToken)
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (revoke refresh token)
 * @access  Public
 */
router.post('/logout', asyncHandler(logout));

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post('/logout-all', authenticate, asyncHandler(logoutAll));

/**
 * @route   POST /api/auth/password-reset-request
 * @desc    Request password reset (sends email with reset link)
 * @access  Public
 */
router.post(
  '/password-reset-request',
  validate(passwordResetRequestValidation),
  asyncHandler(requestPasswordReset)
);

/**
 * @route   POST /api/auth/password-reset
 * @desc    Reset password using token from email
 * @access  Public
 */
router.post(
  '/password-reset',
  validate(passwordResetValidation),
  asyncHandler(resetPassword)
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, asyncHandler(getProfile));

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authenticate,
  validate(profileUpdateValidation),
  asyncHandler(updateProfile)
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  validate([
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long'),
  ]),
  asyncHandler(changePassword)
);

module.exports = router;
