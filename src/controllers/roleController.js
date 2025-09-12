import {
  assignRoleToUser,
  getUserRoles,
  removeRoleFromUser,
  getRoleByName,
} from "../services/roleService.js";
import db from "../models/index.js";

// Get all roles
const getAllRoles = async (req, res) => {
  try {
    const roles = await db.Roles.find();

    return res.status(200).json({
      success: true,
      roles,
    });
  } catch (error) {
    console.error("Get all roles error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get user roles
const getUserRolesController = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const roles = await getUserRoles(userId);

    return res.status(200).json({
      success: true,
      roles,
    });
  } catch (error) {
    console.error("Get user roles error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Assign role to user (admin only)
const assignRole = async (req, res) => {
  try {
    const { userId, roleName } = req.body;

    if (!userId || !roleName) {
      return res.status(400).json({
        success: false,
        message: "User ID and role name are required",
      });
    }

    // Get role by name
    const role = await getRoleByName(roleName);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Check if user exists
    const user = await db.User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Assign role to user
    const result = await assignRoleToUser(userId, role.id);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Assign role error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Remove role from user (admin only)
const removeRole = async (req, res) => {
  try {
    const { userId, roleName } = req.body;

    if (!userId || !roleName) {
      return res.status(400).json({
        success: false,
        message: "User ID and role name are required",
      });
    }

    // Get role by name
    const role = await getRoleByName(roleName);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Check if user exists
    const user = await db.User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove role from user
    const result = await removeRoleFromUser(userId, role.id);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Remove role error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export { getAllRoles, getUserRolesController, assignRole, removeRole };
