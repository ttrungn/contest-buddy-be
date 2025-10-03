import {
  getCustomerProfileByUserId,
  updateCustomerProfile,
  updateCustomerAvatar,
  getCustomerProfileById,
  getCustomerProfiles,
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

// Get customer profiles with filtering
const handleGetCustomerProfiles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      city,
      region,
      country,
      school,
      study_field,
      min_rating,
      max_rating,
      is_verified,
      join_date_from,
      join_date_to,
      skill_name,
      skill_level,
    } = req.query;

    // Build filters object
    const filters = {};
    if (search) filters.search = search;
    if (city) filters.city = city;
    if (region) filters.region = region;
    if (country) filters.country = country;
    if (school) filters.school = school;
    if (study_field) filters.study_field = study_field;
    if (min_rating) filters.min_rating = min_rating;
    if (max_rating) filters.max_rating = max_rating;
    if (is_verified !== undefined) filters.is_verified = is_verified;
    if (join_date_from) filters.join_date_from = join_date_from;
    if (join_date_to) filters.join_date_to = join_date_to;
    if (skill_name) filters.skill_name = skill_name;
    if (skill_level) filters.skill_level = skill_level;

    // Get customer profiles
    const result = await getCustomerProfiles(filters, { page, limit });

    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Get customer profiles controller error:", error);
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
  handleGetCustomerProfiles,
};
