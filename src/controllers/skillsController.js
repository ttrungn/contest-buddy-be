import {
  createSkill,
  getSkillById,
  getAllSkills,
  updateSkill,
  deleteSkill,
  getSkillsByCategory,
  searchSkills,
} from "../services/skillsService.js";

// Create a new skill
export const handleCreateSkill = async (req, res) => {
  try {
    const skillData = req.body;
    const skill = await createSkill(skillData);
    
    res.status(201).json({
      status: "success",
      message: "Skill created successfully",
      data: skill,
    });
  } catch (error) {
    console.error("Error creating skill:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to create skill",
    });
  }
};

// Get skill by ID
export const handleGetSkillById = async (req, res) => {
  try {
    const { skillId } = req.params;
    const skill = await getSkillById(skillId);
    
    if (!skill) {
      return res.status(404).json({
        status: "error",
        message: "Skill not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: skill,
    });
  } catch (error) {
    console.error("Error getting skill:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to get skill",
    });
  }
};

// Get all skills
export const handleGetAllSkillsNew = async (req, res) => {
  try {
    const { page = 1, limit = 50, category, search } = req.query;
    
    let skills;
    if (search) {
      skills = await searchSkills(search, {
        page: parseInt(page),
        limit: parseInt(limit),
      });
    } else if (category) {
      skills = await getSkillsByCategory(category, {
        page: parseInt(page),
        limit: parseInt(limit),
      });
    } else {
      skills = await getAllSkills({
        page: parseInt(page),
        limit: parseInt(limit),
      });
    }

    res.status(200).json({
      status: "success",
      data: skills.data,
      pagination: skills.pagination,
    });
  } catch (error) {
    console.error("Error getting skills:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to get skills",
    });
  }
};

// Update skill
export const handleUpdateSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const updateData = req.body;
    
    const skill = await updateSkill(skillId, updateData);
    
    if (!skill) {
      return res.status(404).json({
        status: "error",
        message: "Skill not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Skill updated successfully",
      data: skill,
    });
  } catch (error) {
    console.error("Error updating skill:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to update skill",
    });
  }
};

// Delete skill
export const handleDeleteSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    
    const result = await deleteSkill(skillId);
    
    if (!result) {
      return res.status(404).json({
        status: "error",
        message: "Skill not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Skill deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting skill:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to delete skill",
    });
  }
};

// Get skills by category
export const handleGetSkillsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const skills = await getSkillsByCategory(category, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      status: "success",
      data: skills.data,
      pagination: skills.pagination,
    });
  } catch (error) {
    console.error("Error getting skills by category:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to get skills by category",
    });
  }
};

// Search skills
export const handleSearchSkills = async (req, res) => {
  try {
    const { q } = req.query;
    const { page = 1, limit = 50 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        status: "error",
        message: "Search query is required",
      });
    }

    const skills = await searchSkills(q, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      status: "success",
      data: skills.data,
      pagination: skills.pagination,
    });
  } catch (error) {
    console.error("Error searching skills:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to search skills",
    });
  }
};