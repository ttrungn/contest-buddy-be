import {
  getUserAchievements,
  addUserAchievement,
  updateUserAchievement,
  deleteUserAchievement,
  getAchievementById,
} from "../services/achievementsService.js";

// Get all achievements of a user
const handleGetUserAchievements = async (req, res) => {
  try {
    // Get user ID from auth middleware or params
    const userId = req.params.userId || req.user.id;

    // Get user achievements
    const result = await getUserAchievements(userId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Get user achievements controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Add an achievement to user
const handleAddUserAchievement = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;

    // Get achievement data from request body
    const achievementData = req.body;

    // Add user achievement
    const result = await addUserAchievement(userId, achievementData);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Add user achievement controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update a user achievement
const handleUpdateUserAchievement = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;

    // Get achievement ID from params
    const { achievementId } = req.params;

    // Get achievement data from request body
    const achievementData = req.body;

    // Update user achievement
    const result = await updateUserAchievement(
      userId,
      achievementId,
      achievementData
    );

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Update user achievement controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete a user achievement
const handleDeleteUserAchievement = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;

    // Get achievement ID from params
    const { achievementId } = req.params;

    // Delete user achievement
    const result = await deleteUserAchievement(userId, achievementId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Delete user achievement controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get a specific achievement by ID
const handleGetAchievementById = async (req, res) => {
  try {
    // Get achievement ID from params
    const { achievementId } = req.params;

    // Get achievement
    const result = await getAchievementById(achievementId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error("Get achievement by ID controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export {
  handleGetUserAchievements,
  handleAddUserAchievement,
  handleUpdateUserAchievement,
  handleDeleteUserAchievement,
  handleGetAchievementById,
};
