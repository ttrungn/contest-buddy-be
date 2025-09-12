import UserSkills, { SKILL_LEVELS } from "../models/userSkills.js";
import Skills, { SKILL_CATEGORIES } from "../models/skills.js";
import crypto from "crypto";

// Get all skills of a user
const getUserSkills = async (userId) => {
  try {
    const userSkills = await UserSkills.find({ user_id: userId });

    return {
      success: true,
      skills: userSkills,
    };
  } catch (error) {
    console.error("Get user skills error:", error);
    return {
      success: false,
      message: "Failed to get user skills",
      error: error.message,
    };
  }
};

// Add a skill to user
const addUserSkill = async (userId, skillData) => {
  try {
    // Validate skill data
    if (!skillData.skill_name || !skillData.category || !skillData.level) {
      return {
        success: false,
        message: "Skill name, category, and level are required",
      };
    }

    // Validate category
    if (!Object.values(SKILL_CATEGORIES).includes(skillData.category)) {
      return {
        success: false,
        message: "Invalid skill category",
        validCategories: Object.values(SKILL_CATEGORIES),
      };
    }

    // Validate level
    if (!Object.values(SKILL_LEVELS).includes(skillData.level)) {
      return {
        success: false,
        message: "Invalid skill level",
        validLevels: Object.values(SKILL_LEVELS),
      };
    }

    // Check if skill already exists for this user
    const existingSkill = await UserSkills.findOne({
      user_id: userId,
      skill_name: skillData.skill_name,
    });

    if (existingSkill) {
      return {
        success: false,
        message: "User already has this skill",
      };
    }

    // Create new skill
    const newSkill = new UserSkills({
      user_id: userId,
      skill_name: skillData.skill_name,
      category: skillData.category,
      level: skillData.level,
      experience_years: skillData.experience_years || 0,
    });

    await newSkill.save();

    // Check if skill exists in skills collection, if not add it
    const skillExists = await Skills.findOne({ name: skillData.skill_name });

    if (!skillExists) {
      const newSkillEntry = new Skills({
        name: skillData.skill_name,
        category: skillData.category,
      });

      await newSkillEntry.save();
    }

    return {
      success: true,
      message: "Skill added successfully",
      skill: newSkill,
    };
  } catch (error) {
    console.error("Add user skill error:", error);
    return {
      success: false,
      message: "Failed to add user skill",
      error: error.message,
    };
  }
};

// Update a user skill
const updateUserSkill = async (userId, skillId, skillData) => {
  try {
    // Find the skill
    const skill = await UserSkills.findOne({
      _id: skillId,
      user_id: userId,
    });

    if (!skill) {
      return {
        success: false,
        message: "Skill not found or not owned by user",
      };
    }

    // Validate category if provided
    if (
      skillData.category &&
      !Object.values(SKILL_CATEGORIES).includes(skillData.category)
    ) {
      return {
        success: false,
        message: "Invalid skill category",
        validCategories: Object.values(SKILL_CATEGORIES),
      };
    }

    // Validate level if provided
    if (
      skillData.level &&
      !Object.values(SKILL_LEVELS).includes(skillData.level)
    ) {
      return {
        success: false,
        message: "Invalid skill level",
        validLevels: Object.values(SKILL_LEVELS),
      };
    }

    // Update skill
    if (skillData.skill_name) skill.skill_name = skillData.skill_name;
    if (skillData.category) skill.category = skillData.category;
    if (skillData.level) skill.level = skillData.level;
    if (skillData.experience_years !== undefined)
      skill.experience_years = skillData.experience_years;

    await skill.save();

    return {
      success: true,
      message: "Skill updated successfully",
      skill,
    };
  } catch (error) {
    console.error("Update user skill error:", error);
    return {
      success: false,
      message: "Failed to update user skill",
      error: error.message,
    };
  }
};

// Delete a user skill
const deleteUserSkill = async (userId, skillId) => {
  try {
    // Find and delete the skill
    const result = await UserSkills.deleteOne({
      _id: skillId,
      user_id: userId,
    });

    if (result.deletedCount === 0) {
      return {
        success: false,
        message: "Skill not found or not owned by user",
      };
    }

    return {
      success: true,
      message: "Skill deleted successfully",
    };
  } catch (error) {
    console.error("Delete user skill error:", error);
    return {
      success: false,
      message: "Failed to delete user skill",
      error: error.message,
    };
  }
};

// Get all available skills
const getAllSkills = async () => {
  try {
    const skills = await Skills.find();

    return {
      success: true,
      skills,
    };
  } catch (error) {
    console.error("Get all skills error:", error);
    return {
      success: false,
      message: "Failed to get all skills",
      error: error.message,
    };
  }
};

export {
  getUserSkills,
  addUserSkill,
  updateUserSkill,
  deleteUserSkill,
  getAllSkills,
};
