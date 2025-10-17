import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import db from "../models/index.js";
import jwtConfig from "../config/jwtConfig.js";
import { assignRoleToUser, getUserRoles, ROLE_NAMES } from "./roleService.js";

// Helper function to generate unique ID
const generateUniqueId = () => {
  return crypto.randomBytes(16).toString("hex");
};

// Helper function to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Helper function to generate tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });

  const refreshToken = jwt.sign({ id: userId }, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

// Helper function to send email
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

// Register new user
const register = async (userData) => {
  try {
    // Check if User model exists
    if (!db.User) {
      console.error("❌ User model not found in db object");
      console.log("Available models:", Object.keys(db));
      return {
        success: false,
        message: "Registration failed: Database model not available",
      };
    }

    // Check if email already exists
    const existingEmail = await db.User.findOne({ email: userData.email });
    if (existingEmail) {
      return {
        success: false,
        message: "Email already in use",
      };
    }

    // Check if username already exists
    const existingUsername = await db.User.findOne({
      username: userData.username,
    });
    if (existingUsername) {
      return {
        success: false,
        message: "Username already taken",
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const newUser = await db.User.create({
      id: generateUniqueId(),
      username: userData.username,
      password: hashedPassword,
      full_name: userData.full_name,
      email: userData.email,
      school: userData.school,
      city: userData.city,
      region: userData.region,
      country: userData.country,
      study_field: userData.study_field,
      join_date: new Date(),
      verification_token: verificationToken,
      verification_token_expires: verificationTokenExpires,
    });

    // Assign default role (user/customer)
    // Get role by name
    const defaultRole = await db.Roles.findOne({ name: ROLE_NAMES.CUSTOMER });

    if (defaultRole) {
      await assignRoleToUser(newUser.id, defaultRole.id);
    } else {
      console.error("Default role not found");
    }

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailSent = await sendEmail(
      userData.email,
      "Verify Your Email",
      `<p>Please click the link below to verify your email:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>`
    );

    return {
      success: true,
      message: "User registered successfully",
      emailSent,
      userId: newUser.id,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: "Registration failed",
      error: error.message,
    };
  }
};

// Login user
const login = async (email, password) => {
  try {
    // Check if User model exists
    if (!db.User) {
      console.error("❌ User model not found in db object");
      console.log("Available models:", Object.keys(db));
      return {
        success: false,
        message: "Login failed: Database model not available",
      };
    }

    // Find user by email
    const user = await db.User.findOne({ email });
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid password",
      };
    }

    // Check if email is verified
    if (!user.is_verified) {
      return {
        success: false,
        message: "Email not verified",
        needsVerification: true,
        userId: user.id,
      };
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Save refresh token to database
    user.refresh_token = refreshToken;
    await user.save();

    // Get user roles
    const userRoles = await getUserRoles(user.id);
    const roleNames = userRoles.map((role) => role.name);

    // Return user data and tokens
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar_url: user.avatar_url,
      full_name: user.full_name,
      roles: roleNames,
    };

    return {
      success: true,
      message: "Login successful",
      user: userData,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "Login failed",
      error: error.message,
    };
  }
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    return {
      success: true,
      userId: decoded.id,
    };
  } catch (error) {
    return {
      success: false,
      message: "Invalid or expired token",
    };
  }
};

// Verify email with token
const verifyEmailToken = async (token) => {
  try {
    const user = await db.User.findOne({
      verification_token: token,
      verification_token_expires: { $gt: Date.now() },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid or expired verification token",
      };
    }

    // Update user verification status
    user.is_verified = true;
    user.verification_token = undefined;
    user.verification_token_expires = undefined;
    await user.save();

    return {
      success: true,
      message: "Email verified successfully",
    };
  } catch (error) {
    console.error("Email verification error:", error);
    return {
      success: false,
      message: "Email verification failed",
      error: error.message,
    };
  }
};

// Resend verification email
const resendVerificationEmail = async (email) => {
  try {
    const user = await db.User.findOne({ email });
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (user.is_verified) {
      return {
        success: false,
        message: "Email already verified",
      };
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    user.verification_token = verificationToken;
    user.verification_token_expires = verificationTokenExpires;
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailSent = await sendEmail(
      user.email,
      "Verify Your Email",
      `<p>Please click the link below to verify your email:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>`
    );

    return {
      success: true,
      message: "Verification email sent",
      emailSent,
    };
  } catch (error) {
    console.error("Resend verification error:", error);
    return {
      success: false,
      message: "Failed to resend verification email",
      error: error.message,
    };
  }
};

// Forgot password
const forgotPassword = async (email) => {
  try {
    const user = await db.User.findOne({ email });
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    user.reset_password_token = resetToken;
    user.reset_password_token_expires = resetTokenExpires;
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const emailSent = await sendEmail(
      user.email,
      "Reset Your Password",
      `<p>You requested a password reset. Please click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>`
    );

    return {
      success: true,
      message: "Password reset email sent",
      emailSent,
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      success: false,
      message: "Failed to process forgot password request",
      error: error.message,
    };
  }
};

// Reset password with token
const resetPasswordWithToken = async (token, newPassword) => {
  try {
    const user = await db.User.findOne({
      reset_password_token: token,
      reset_password_token_expires: { $gt: Date.now() },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid or expired reset token",
      };
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    user.password = hashedPassword;
    user.reset_password_token = undefined;
    user.reset_password_token_expires = undefined;
    await user.save();

    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      message: "Failed to reset password",
      error: error.message,
    };
  }
};

// Change password (when user is logged in)
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await db.User.findOne({ id: userId });
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Current password is incorrect",
      };
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error) {
    console.error("Change password error:", error);
    return {
      success: false,
      message: "Failed to change password",
      error: error.message,
    };
  }
};

// Refresh token
const refreshToken = async (token) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(token, jwtConfig.refreshSecret);

    // Find user with matching refresh token
    const user = await db.User.findOne({
      id: decoded.id,
      refresh_token: token,
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid refresh token",
      };
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id
    );

    // Update refresh token in database
    user.refresh_token = newRefreshToken;
    await user.save();

    return {
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    console.error("Refresh token error:", error);
    return {
      success: false,
      message: "Invalid or expired refresh token",
      error: error.message,
    };
  }
};

export {
  register,
  login,
  verifyToken,
  verifyEmailToken,
  resendVerificationEmail,
  forgotPassword,
  resetPasswordWithToken,
  changePassword,
  refreshToken,
  generateTokens,
};
