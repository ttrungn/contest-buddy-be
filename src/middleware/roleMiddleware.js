import { userHasRole } from "../services/roleService.js";
import { ROLE_NAMES } from "../models/roles.js";

// Middleware to check if user has a specific role
const hasRole = (roleName) => {
  return async (req, res, next) => {
    try {
      // User ID should be available from auth middleware
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const hasRequiredRole = await userHasRole(userId, roleName);

      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          message: `Access denied. ${roleName} role required`,
        });
      }

      next();
    } catch (error) {
      console.error("Role middleware error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
};

// Middleware to check if user is an admin
const isAdmin = hasRole(ROLE_NAMES.ADMIN);

// Middleware to check if user is an organizer
const isOrganizer = hasRole(ROLE_NAMES.ORGANIZER);

// Middleware to check if user is a customer/regular user
const isCustomer = hasRole(ROLE_NAMES.CUSTOMER);

// Middleware to check if user is an admin or organizer
const isAdminOrOrganizer = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const isUserAdmin = await userHasRole(userId, ROLE_NAMES.ADMIN);
    const isUserOrganizer = await userHasRole(userId, ROLE_NAMES.ORGANIZER);

    if (!isUserAdmin && !isUserOrganizer) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin or Organizer role required",
      });
    }

    next();
  } catch (error) {
    console.error("Role middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export { hasRole, isAdmin, isOrganizer, isCustomer, isAdminOrOrganizer };
