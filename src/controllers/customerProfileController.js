import {
  getCustomerProfileByUserId,
  updateCustomerProfile,
  updateCustomerAvatar,
  getCustomerProfileById,
} from "../services/customerProfileService.js";

// Get customer profile
const handleGetCustomerProfile = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;

    // Get customer profile
    const result = await getCustomerProfileByUserId(userId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        profile: result.profile,
      });
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error("Get customer profile controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update customer profile
const handleUpdateCustomerProfile = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;

    // Get profile data from request body
    const profileData = req.body;

    // Update customer profile
    const result = await updateCustomerProfile(userId, profileData);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Update customer profile controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update customer avatar
const handleUpdateCustomerAvatar = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Update avatar
    const result = await updateCustomerAvatar(userId, req.file);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Update avatar controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get customer profile by ID (public)
const handleGetCustomerProfileById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get customer profile
    const result = await getCustomerProfileById(userId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        profile: result.profile,
      });
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error("Get customer profile by ID controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export {
  handleGetCustomerProfile,
  handleUpdateCustomerProfile,
  handleUpdateCustomerAvatar,
  handleGetCustomerProfileById,
};
