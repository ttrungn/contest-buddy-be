import Achievements from "../models/achievements.js";
import crypto from "crypto";

// Generate unique ID
const generateUniqueId = () => {
  return crypto.randomBytes(16).toString("hex");
};

// Get all achievements of a user
const getUserAchievements = async (userId) => {
  try {
    const achievements = await Achievements.find({ user_id: userId }).sort({
      achieved_at: -1,
    }); // Sort by achieved_at in descending order

    return {
      success: true,
      achievements,
    };
  } catch (error) {
    console.error("Get user achievements error:", error);
    return {
      success: false,
      message: "Failed to get user achievements",
      error: error.message,
    };
  }
};

// Add an achievement to user
const addUserAchievement = async (userId, achievementData) => {
  try {
    // Validate achievement data
    if (
      !achievementData.competition_name ||
      !achievementData.position ||
      !achievementData.award ||
      !achievementData.achieved_at ||
      !achievementData.category
    ) {
      return {
        success: false,
        message:
          "Competition name, position, award, achieved date, and category are required",
      };
    }

    // Create new achievement
    const newAchievement = new Achievements({
      id: generateUniqueId(),
      user_id: userId,
      competition_name: achievementData.competition_name,
      position: achievementData.position,
      award: achievementData.award,
      achieved_at: new Date(achievementData.achieved_at),
      category: achievementData.category,
      description: achievementData.description || "",
    });

    await newAchievement.save();

    return {
      success: true,
      message: "Achievement added successfully",
      achievement: newAchievement,
    };
  } catch (error) {
    console.error("Add user achievement error:", error);
    return {
      success: false,
      message: "Failed to add user achievement",
      error: error.message,
    };
  }
};

// Update a user achievement
const updateUserAchievement = async (
  userId,
  achievementId,
  achievementData
) => {
  try {
    // Find the achievement
    const achievement = await Achievements.findOne({
      id: achievementId,
      user_id: userId,
    });

    if (!achievement) {
      return {
        success: false,
        message: "Achievement not found or not owned by user",
      };
    }

    // Update achievement
    if (achievementData.competition_name)
      achievement.competition_name = achievementData.competition_name;
    if (achievementData.position)
      achievement.position = achievementData.position;
    if (achievementData.award) achievement.award = achievementData.award;
    if (achievementData.achieved_at)
      achievement.achieved_at = new Date(achievementData.achieved_at);
    if (achievementData.category)
      achievement.category = achievementData.category;
    if (achievementData.description !== undefined)
      achievement.description = achievementData.description;

    await achievement.save();

    return {
      success: true,
      message: "Achievement updated successfully",
      achievement,
    };
  } catch (error) {
    console.error("Update user achievement error:", error);
    return {
      success: false,
      message: "Failed to update user achievement",
      error: error.message,
    };
  }
};

// Delete a user achievement
const deleteUserAchievement = async (userId, achievementId) => {
  try {
    // Find and delete the achievement
    const result = await Achievements.deleteOne({
      id: achievementId,
      user_id: userId,
    });

    if (result.deletedCount === 0) {
      return {
        success: false,
        message: "Achievement not found or not owned by user",
      };
    }

    return {
      success: true,
      message: "Achievement deleted successfully",
    };
  } catch (error) {
    console.error("Delete user achievement error:", error);
    return {
      success: false,
      message: "Failed to delete user achievement",
      error: error.message,
    };
  }
};

// Get a specific achievement by ID
const getAchievementById = async (achievementId) => {
  try {
    const achievement = await Achievements.findOne({ id: achievementId });

    if (!achievement) {
      return {
        success: false,
        message: "Achievement not found",
      };
    }

    return {
      success: true,
      achievement,
    };
  } catch (error) {
    console.error("Get achievement by ID error:", error);
    return {
      success: false,
      message: "Failed to get achievement",
      error: error.message,
    };
  }
};

export {
  getUserAchievements,
  addUserAchievement,
  updateUserAchievement,
  deleteUserAchievement,
  getAchievementById,
};
