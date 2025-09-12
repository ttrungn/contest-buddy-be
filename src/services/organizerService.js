import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import db from "../models/index.js";
import { assignRoleToUser, getRoleByName } from "./roleService.js";
import { ROLE_NAMES } from "../models/roles.js";
import { generateTokens } from "./authService.js";

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

// Helper function to generate unique ID
const generateUniqueId = () => {
  return crypto.randomBytes(16).toString("hex");
};

// Helper function to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Register new organizer
const registerOrganizer = async (userData, organizerData) => {
  try {
    // Check if User model exists
    if (!db.User || !db.Roles || !db.Organizers) {
      console.error("❌ Required models not found in db object");
      console.log("Available models:", Object.keys(db));
      return {
        success: false,
        message: "Registration failed: Database models not available",
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

    // Check if organizer name already exists
    const existingOrganizerName = await db.Organizers.findOne({
      name: organizerData.name,
    });
    if (existingOrganizerName) {
      return {
        success: false,
        message: "Organizer name already taken",
      };
    }

    // Check if organizer email already exists
    const existingOrganizerEmail = await db.Organizers.findOne({
      email: organizerData.email,
    });
    if (existingOrganizerEmail) {
      return {
        success: false,
        message: "Organizer email already in use",
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user ID
    const userId = generateUniqueId();

    // Create new user
    const newUser = await db.User.create({
      id: userId,
      username: userData.username,
      password: hashedPassword,
      full_name: userData.full_name,
      email: userData.email,
      join_date: new Date(),
      verification_token: verificationToken,
      verification_token_expires: verificationTokenExpires,
      is_verified: false, // Require email verification
    });

    // Create new organizer with updated model fields
    const newOrganizer = await db.Organizers.create({
      id: generateUniqueId(),
      name: organizerData.name,
      email: organizerData.email || userData.email,
      avatar_url: organizerData.avatar_url,
      description: organizerData.description || "",
      address: organizerData.address || "",
      phone: organizerData.phone || "",
      website: organizerData.website || "",
      owner_user_id: userId,
    });

    // Assign ONLY organizer role (no customer role)
    const organizerRole = await getRoleByName(ROLE_NAMES.ORGANIZER);
    if (organizerRole) {
      await assignRoleToUser(userId, organizerRole.id);
    } else {
      console.error("Organizer role not found");
    }

    // Note: We're not assigning customer role anymore
    // Each user will have only one role

    // Generate tokens for immediate login
    const { accessToken, refreshToken } = generateTokens(userId);

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailSent = await sendEmail(
      userData.email,
      "Verify Your Email for Organizer Account",
      `<p>Hello ${userData.full_name},</p>
      <p>Thank you for registering as an organizer. Please click the link below to verify your email:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      <p>Once verified, you'll have full access to organizer features.</p>`
    );

    return {
      success: true,
      message: "Organizer registered successfully",
      userId: newUser.id,
      organizerId: newOrganizer.id,
      accessToken,
      refreshToken,
      needsVerification: true,
      emailSent,
    };
  } catch (error) {
    console.error("Organizer registration error:", error);
    return {
      success: false,
      message: "Registration failed",
      error: error.message,
    };
  }
};

export { registerOrganizer };
