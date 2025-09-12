import {
  getUserSkills,
  addUserSkill,
  updateUserSkill,
  deleteUserSkill,
  getAllSkills,
} from "../services/userSkillsService.js";

// Get all skills of a user
const handleGetUserSkills = async (req, res) => {
  try {
    // Get user ID from auth middleware or params
    const userId = req.params.userId || req.user.id;

    // Get user skills
    const result = await getUserSkills(userId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Get user skills controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Add a skill to user
const handleAddUserSkill = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;

    // Get skill data from request body
    const skillData = req.body;

    // Add user skill
    const result = await addUserSkill(userId, skillData);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Add user skill controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update a user skill
const handleUpdateUserSkill = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;

    // Get skill ID from params
    const { skillId } = req.params;

    // Get skill data from request body
    const skillData = req.body;

    // Update user skill
    const result = await updateUserSkill(userId, skillId, skillData);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Update user skill controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete a user skill
const handleDeleteUserSkill = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;

    // Get skill ID from params
    const { skillId } = req.params;

    // Delete user skill
    const result = await deleteUserSkill(userId, skillId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Delete user skill controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all available skills
const handleGetAllSkills = async (req, res) => {
  try {
    // Get all skills
    const result = await getAllSkills();

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Get all skills controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export {
  handleGetUserSkills,
  handleAddUserSkill,
  handleUpdateUserSkill,
  handleDeleteUserSkill,
  handleGetAllSkills,
};
