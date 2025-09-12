import {
  register,
  login,
  verifyToken,
  verifyEmailToken,
  resendVerificationEmail,
  forgotPassword,
  resetPasswordWithToken,
  changePassword,
  refreshToken,
} from "../services/authService.js";

// Register new user
const handleRegister = async (req, res) => {
  try {
    const userData = req.body;

    // Validate required fields
    const requiredFields = [
      "username",
      "password",
      "full_name",
      "email",
      "school",
      "city",
      "region",
      "country",
      "study_field",
    ];

    const missingFields = requiredFields.filter((field) => !userData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const result = await register(userData);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Registration controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Login user
const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await login(email, password);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } else {
      return res.status(401).json(result);
    }
  } catch (error) {
    console.error("Login controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Verify JWT token
const handleVerifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const result = verifyToken(token);
    return res.status(result.success ? 200 : 401).json(result);
  } catch (error) {
    console.error("Verify token controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Verify email with token
const handleVerifyEmailToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const result = await verifyEmailToken(token);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Verify email token controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Resend verification email
const handleResendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await resendVerificationEmail(email);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Resend verification email controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Forgot password
const handleForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await forgotPassword(email);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Forgot password controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Reset password with token
const handleResetPasswordWithToken = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    const result = await resetPasswordWithToken(token, newPassword);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Reset password controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Change password (when user is logged in)
const handleChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const result = await changePassword(userId, currentPassword, newPassword);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Change password controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Refresh token
const handleRefreshToken = async (req, res) => {
  try {
    // Get refresh token from cookie or request body
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const result = await refreshToken(token);

    if (result.success) {
      // Update refresh token cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({
        success: true,
        accessToken: result.accessToken,
      });
    } else {
      // Clear invalid refresh token
      res.clearCookie("refreshToken");
      return res.status(401).json(result);
    }
  } catch (error) {
    console.error("Refresh token controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export {
  handleRegister,
  handleLogin,
  handleVerifyToken,
  handleVerifyEmailToken,
  handleResendVerificationEmail,
  handleForgotPassword,
  handleResetPasswordWithToken,
  handleChangePassword,
  handleRefreshToken,
};
