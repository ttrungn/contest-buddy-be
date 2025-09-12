import db from "../models/index.js";
import { ROLE_NAMES } from "../models/roles.js";

// Get role by name
const getRoleByName = async (roleName) => {
  try {
    // Check if Roles model exists
    if (!db.Roles) {
      console.error("❌ Roles model not found in db object");
      console.log("Available models:", Object.keys(db));
      return null;
    }

    const role = await db.Roles.findOne({ name: roleName });
    return role;
  } catch (error) {
    console.error("Error getting role by name:", error);
    throw error;
  }
};

// Assign role to user
const assignRoleToUser = async (userId, roleId) => {
  try {
    // Check if UserRoles model exists
    if (!db.UserRoles) {
      console.error("❌ UserRoles model not found in db object");
      console.log("Available models:", Object.keys(db));
      return {
        success: false,
        message: "Failed to assign role: Database model not available",
      };
    }

    // Check if user already has this role
    const existingRole = await db.UserRoles.findOne({
      user_id: userId,
      role_id: roleId,
    });

    if (existingRole) {
      return {
        success: true,
        message: "User already has this role",
      };
    }

    // Assign role to user
    await db.UserRoles.create({
      user_id: userId,
      role_id: roleId,
    });

    return {
      success: true,
      message: "Role assigned successfully",
    };
  } catch (error) {
    console.error("Error assigning role to user:", error);
    return {
      success: false,
      message: "Failed to assign role",
      error: error.message,
    };
  }
};

// Get user roles
const getUserRoles = async (userId) => {
  try {
    // First find the user roles without populate
    const userRoles = await db.UserRoles.find({ user_id: userId });

    // Get the role IDs as numbers
    const roleIds = userRoles.map((ur) => ur.role_id);

    // Fetch the roles directly using the numeric IDs
    const roles = await db.Roles.find({ id: { $in: roleIds } });

    return roles;
  } catch (error) {
    console.error("Error getting user roles:", error);
    throw error;
  }
};

// Check if user has role
const userHasRole = async (userId, roleName) => {
  try {
    const role = await getRoleByName(roleName);

    if (!role) {
      return false;
    }

    const userRole = await db.UserRoles.findOne({
      user_id: userId,
      role_id: role.id,
    });

    return !!userRole;
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
};

// Remove role from user
const removeRoleFromUser = async (userId, roleId) => {
  try {
    await db.UserRoles.deleteOne({
      user_id: userId,
      role_id: roleId,
    });

    return {
      success: true,
      message: "Role removed successfully",
    };
  } catch (error) {
    console.error("Error removing role from user:", error);
    return {
      success: false,
      message: "Failed to remove role",
      error: error.message,
    };
  }
};

export {
  getRoleByName,
  assignRoleToUser,
  getUserRoles,
  userHasRole,
  removeRoleFromUser,
  ROLE_NAMES,
};
