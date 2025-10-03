import Skills from "../models/skills.js";

// Create a new skill
export const createSkill = async (skillData) => {
  try {
    const skill = new Skills(skillData);
    await skill.save();
    return skill;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Skill with this name already exists");
    }
    throw new Error(`Failed to create skill: ${error.message}`);
  }
};

// Get skill by ID
export const getSkillById = async (skillId) => {
  try {
    const skill = await Skills.findById(skillId);
    return skill;
  } catch (error) {
    throw new Error(`Failed to get skill: ${error.message}`);
  }
};

// Get all skills with pagination and filters
export const getAllSkills = async (options = {}) => {
  try {
    const { page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const skills = await Skills.find({})
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Skills.countDocuments({});
    const totalPages = Math.ceil(total / limit);

    return {
      data: skills,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get skills: ${error.message}`);
  }
};

// Update skill
export const updateSkill = async (skillId, updateData) => {
  try {
    const skill = await Skills.findByIdAndUpdate(
      skillId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    return skill;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("Skill with this name already exists");
    }
    throw new Error(`Failed to update skill: ${error.message}`);
  }
};

// Delete skill
export const deleteSkill = async (skillId) => {
  try {
    const result = await Skills.findByIdAndDelete(skillId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete skill: ${error.message}`);
  }
};

// Get skills by category
export const getSkillsByCategory = async (category, options = {}) => {
  try {
    const { page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const skills = await Skills.find({ category })
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Skills.countDocuments({ category });
    const totalPages = Math.ceil(total / limit);

    return {
      data: skills,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get skills by category: ${error.message}`);
  }
};

// Search skills by name
export const searchSkills = async (searchTerm, options = {}) => {
  try {
    const { page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const searchFilter = {
      name: { $regex: searchTerm, $options: 'i' }
    };

    const skills = await Skills.find(searchFilter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Skills.countDocuments(searchFilter);
    const totalPages = Math.ceil(total / limit);

    return {
      data: skills,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    throw new Error(`Failed to search skills: ${error.message}`);
  }
};

// Get skill categories (returns distinct categories)
export const getSkillCategories = async () => {
  try {
    const categories = await Skills.distinct('category');
    return categories;
  } catch (error) {
    throw new Error(`Failed to get skill categories: ${error.message}`);
  }
};

// Get skills count by category
export const getSkillsCountByCategory = async () => {
  try {
    const counts = await Skills.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return counts.map(item => ({
      category: item._id,
      count: item.count
    }));
  } catch (error) {
    throw new Error(`Failed to get skills count by category: ${error.message}`);
  }
};