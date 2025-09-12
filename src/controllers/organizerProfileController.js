import {
  getOrganizerProfileByUserId,
  updateOrganizerProfile,
  updateOrganizerAvatar,
} from "../services/organizerProfileService.js";

// Get organizer profile
const handleGetOrganizerProfile = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;

    // Get organizer profile
    const result = await getOrganizerProfileByUserId(userId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        profile: result.profile,
      });
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error("Get organizer profile controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update organizer profile
const handleUpdateOrganizerProfile = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;

    // Get profile data from request body
    const profileData = req.body;

    // Update organizer profile
    const result = await updateOrganizerProfile(userId, profileData);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Update organizer profile controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update organizer avatar
const handleUpdateOrganizerAvatar = async (req, res) => {
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
    const result = await updateOrganizerAvatar(userId, req.file);

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

// Get organizer profile by ID (public)
const handleGetOrganizerProfileById = async (req, res) => {
  try {
    const { organizerId } = req.params;

    // Find organizer by ID
    const organizer = await import("../models/index.js").then((module) =>
      module.default.Organizers.findOne({ id: organizerId })
    );

    if (!organizer) {
      return res.status(404).json({
        success: false,
        message: "Organizer not found",
      });
    }

    // Get public profile data
    const profileData = {
      organizerId: organizer.id,
      name: organizer.name,
      email: organizer.email,
      avatar_url: organizer.avatar_url,
      description: organizer.description,
      address: organizer.address,
      phone: organizer.phone,
      website: organizer.website,
    };

    return res.status(200).json({
      success: true,
      profile: profileData,
    });
  } catch (error) {
    console.error("Get organizer profile by ID controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export {
  handleGetOrganizerProfile,
  handleUpdateOrganizerProfile,
  handleUpdateOrganizerAvatar,
  handleGetOrganizerProfileById,
};
