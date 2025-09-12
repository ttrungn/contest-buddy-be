import jwt from "jsonwebtoken";
import db from "../models/index.js";
import jwtConfig from "../config/jwtConfig.js";

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    try {
      const decoded = jwt.verify(token, jwtConfig.secret);

      // Find user
      const user = await db.User.findOne({ id: decoded.id });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Attach user to request
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
      };

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Middleware to check if user is verified
const isVerified = async (req, res, next) => {
  try {
    const user = await db.User.findOne({ id: req.user.id });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified",
      });
    }

    next();
  } catch (error) {
    console.error("Verification middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export { verifyToken, isVerified };
