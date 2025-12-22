const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/password');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/email');
const { createUser, findUserByEmail, findUserById, updateUserProfile, updateUserPassword } = require('../models/userModel');
const { createRetailCustomer, createDistributor, createSalesRep } = require('../models/roleModel');
const {
  storeRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  storePasswordResetToken,
  findPasswordResetToken,
  markPasswordResetTokenUsed,
} = require('../models/tokenModel');
const crypto = require('crypto');

/**
 * Register a new user (retail customer, distributor, or sales rep)
 */
const register = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      userType,
      // Distributor specific fields
      companyName,
      businessRegistrationNumber,
      taxId,
      businessAddress,
      city,
      state,
      zipCode,
      country,
      // Sales rep specific fields
      employeeId,
      department,
      territory,
    } = req.body;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await createUser({
      email,
      passwordHash,
      userType,
      firstName,
      lastName,
      phone,
    });

    // Create role-specific profile
    let roleProfile = null;

    if (userType === 'retail_customer') {
      roleProfile = await createRetailCustomer(user.id, {
        shippingAddress: req.body.shippingAddress,
        billingAddress: req.body.billingAddress,
        city,
        state,
        zipCode,
        country,
      });
    } else if (userType === 'distributor') {
      if (!companyName || !businessAddress) {
        return res.status(400).json({
          success: false,
          message: 'Company name and business address are required for distributors',
        });
      }

      roleProfile = await createDistributor(user.id, {
        companyName,
        businessRegistrationNumber,
        taxId,
        businessAddress,
        city,
        state,
        zipCode,
        country,
      });
    } else if (userType === 'sales_representative') {
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is required for sales representatives',
        });
      }

      roleProfile = await createSalesRep(user.id, {
        employeeId,
        department,
        territory,
        managerId: req.body.managerId,
        hireDate: req.body.hireDate,
      });
    }

    // Send welcome email (don't wait for it)
    sendWelcomeEmail(email, `${firstName} ${lastName}`, userType).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    // Generate tokens
    const tokens = generateTokens(user);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await storeRefreshToken(user.id, tokens.refreshToken, expiresAt);

    res.status(201).json({
      success: true,
      message: userType === 'distributor' 
        ? 'Registration successful. Your account is pending approval.' 
        : 'Registration successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          userType: user.user_type,
        },
        roleProfile,
        tokens,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed',
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated',
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate tokens
    const tokens = generateTokens(user);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await storeRefreshToken(user.id, tokens.refreshToken, expiresAt);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          userType: user.user_type,
        },
        tokens,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if token exists in database and is not revoked
    const tokenRecord = await findRefreshToken(refreshToken);

    if (!tokenRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    // Get user
    const user = await findUserById(decoded.userId);

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive',
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Revoke old refresh token
    await revokeRefreshToken(refreshToken);

    // Store new refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await storeRefreshToken(user.id, tokens.refreshToken, expiresAt);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { tokens },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid refresh token',
    });
  }
};

/**
 * Logout user
 */
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
};

/**
 * Logout from all devices
 */
const logoutAll = async (req, res) => {
  try {
    await revokeAllUserTokens(req.user.userId);

    res.json({
      success: true,
      message: 'Logged out from all devices successfully',
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
};

/**
 * Request password reset
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await findUserByEmail(email);

    // Always return success message to prevent email enumeration
    const successMessage = 'If the email exists, a password reset link has been sent';

    if (!user) {
      return res.json({
        success: true,
        message: successMessage,
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await storePasswordResetToken(user.id, resetToken, expiresAt);

    // Send reset email
    await sendPasswordResetEmail(email, resetToken, `${user.first_name} ${user.last_name}`);

    res.json({
      success: true,
      message: successMessage,
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
    });
  }
};

/**
 * Reset password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    // Find and verify reset token
    const resetTokenRecord = await findPasswordResetToken(token);

    if (!resetTokenRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await updateUserPassword(resetTokenRecord.user_id, passwordHash);

    // Mark token as used
    await markPasswordResetTokenUsed(token);

    // Revoke all refresh tokens for security
    await revokeAllUserTokens(resetTokenRecord.user_id);

    res.json({
      success: true,
      message: 'Password reset successful. Please login with your new password.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
    });
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        userType: user.user_type,
        isActive: user.is_active,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
    });
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const updates = {};
    if (firstName !== undefined) updates.first_name = firstName;
    if (lastName !== undefined) updates.last_name = lastName;
    if (phone !== undefined) updates.phone = phone;

    const updatedUser = await updateUserProfile(req.user.userId, updates);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        phone: updatedUser.phone,
        userType: updatedUser.user_type,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile',
    });
  }
};

/**
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password hash
    const user = await findUserByEmail(req.user.email);

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await updateUserPassword(req.user.userId, passwordHash);

    // Revoke all refresh tokens for security
    await revokeAllUserTokens(req.user.userId);

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
    });
  }
};

module.exports = {
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
};
