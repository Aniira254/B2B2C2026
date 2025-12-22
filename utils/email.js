const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${userName},</p>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>B2B2C Platform Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send distributor approval notification
 */
const sendDistributorApprovalEmail = async (email, userName, isApproved, reason = null) => {
  const transporter = createTransporter();

  const subject = isApproved 
    ? 'Distributor Account Approved' 
    : 'Distributor Account Application Update';

  const message = isApproved
    ? `
      <p>Congratulations! Your distributor account has been approved.</p>
      <p>You can now log in and start placing orders at distributor prices.</p>
      <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Login Now
      </a>
    `
    : `
      <p>We regret to inform you that your distributor account application has been rejected.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>If you have any questions, please contact our support team.</p>
    `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${subject}</h2>
        <p>Hello ${userName},</p>
        ${message}
        <br>
        <p>Best regards,<br>B2B2C Platform Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send approval notification email');
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (email, userName, userType) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to B2B2C Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to B2B2C Platform!</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for registering as a ${userType.replace('_', ' ')}.</p>
        ${userType === 'distributor' ? '<p>Your account is currently pending approval. You will receive an email once your account has been reviewed.</p>' : ''}
        <p>You can log in to your account using the email address you registered with.</p>
        <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Go to Login
        </a>
        <br>
        <p>Best regards,<br>B2B2C Platform Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome emails, just log it
    return { success: false };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendDistributorApprovalEmail,
  sendWelcomeEmail,
};
