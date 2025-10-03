import UserSocialLinks from "../models/userSocialLinks.js";
import UserSkills from "../models/userSkills.js";
import UserRoles from "../models/userRoles.js";
import User from "../models/user.js";
import Achievements from "../models/achievements.js";
import Projects from "../models/projects.js";
import cloudinaryService from "./cloudinaryService.js";

// Get customer profile by user ID
const getCustomerProfileByUserId = async (userId) => {
  try {
    // Find user by ID
    const user = await User.findOne({ id: userId });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Find social links
    const socialLinks = await UserSocialLinks.findOne({ user_id: userId });

    // Prepare profile data
    const profileData = {
      userId: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      bio: user.bio,
      school: user.school,
      city: user.city,
      region: user.region,
      country: user.country,
      study_field: user.study_field,
      join_date: user.join_date,
      rating: user.rating,
      social_links: socialLinks
        ? {
            github: socialLinks.github || "",
            linkedin: socialLinks.linkedin || "",
            personal: socialLinks.personal || "",
          }
        : {
            github: "",
            linkedin: "",
            personal: "",
          },
    };

    return {
      success: true,
      profile: profileData,
    };
  } catch (error) {
    console.error("Get customer profile error:", error);
    return {
      success: false,
      message: "Failed to get customer profile",
      error: error.message,
    };
  }
};

// Update customer profile
const updateCustomerProfile = async (userId, profileData) => {
  try {
    // Find user by ID
    const user = await User.findOne({ id: userId });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Update user data
    if (profileData.full_name !== undefined)
      user.full_name = profileData.full_name;
    if (profileData.email !== undefined) user.email = profileData.email;
    if (profileData.bio !== undefined) user.bio = profileData.bio;
    if (profileData.school !== undefined) user.school = profileData.school;
    if (profileData.city !== undefined) user.city = profileData.city;
    if (profileData.region !== undefined) user.region = profileData.region;
    if (profileData.country !== undefined) user.country = profileData.country;
    if (profileData.study_field !== undefined)
      user.study_field = profileData.study_field;

    await user.save();

    // Update social links if provided
    if (profileData.social_links) {
      let socialLinks = await UserSocialLinks.findOne({ user_id: userId });

      if (!socialLinks) {
        // Create new social links if not exists
        socialLinks = new UserSocialLinks({
          user_id: userId,
        });
      }

      // Update social links
      if (profileData.social_links.github !== undefined)
        socialLinks.github = profileData.social_links.github;
      if (profileData.social_links.linkedin !== undefined)
        socialLinks.linkedin = profileData.social_links.linkedin;
      if (profileData.social_links.personal !== undefined)
        socialLinks.personal = profileData.social_links.personal;

      await socialLinks.save();
    }

    return {
      success: true,
      message: "Customer profile updated successfully",
    };
  } catch (error) {
    console.error("Update customer profile error:", error);
    return {
      success: false,
      message: "Failed to update customer profile",
      error: error.message,
    };
  }
};

// Update customer avatar
const updateCustomerAvatar = async (userId, file) => {
  try {
    // Find user by ID
    const user = await User.findOne({ id: userId });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Upload new avatar to Cloudinary
    const uploadResult = await cloudinaryService.uploadImage(file);

    if (!uploadResult.success) {
      return {
        success: false,
        message: "Failed to upload avatar",
        error: uploadResult.message,
      };
    }

    // Delete old avatar if exists
    if (user.avatar_url) {
      const publicId = user.avatar_url.split("/").pop().split(".")[0];
      if (publicId) {
        await cloudinaryService.deleteImage(`avatars/${publicId}`);
      }
    }

    // Update avatar URL
    user.avatar_url = uploadResult.imageUrl;
    await user.save();

    return {
      success: true,
      message: "Avatar updated successfully",
      avatar_url: uploadResult.imageUrl,
    };
  } catch (error) {
    console.error("Update avatar error:", error);
    return {
      success: false,
      message: "Failed to update avatar",
      error: error.message,
    };
  }
};

// Get customer profile by ID (public)
const getCustomerProfileById = async (userId) => {
  try {
    // Find user by ID
    const user = await User.findOne({ id: userId });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Get user skills
    const userSkills = await UserSkills.find({ user_id: userId });

    // Get user achievements
    const userAchievements = await Achievements.find({ user_id: userId }).sort({
      achieved_at: -1,
    });

    // Get user projects
    const userProjects = await Projects.find({ user_id: userId }).sort({
      created_at: -1,
    });

    // Get social links
    const socialLinks = await UserSocialLinks.findOne({ user_id: userId });

    // Prepare public profile data with populated skills and social links
    const profileData = {
      userId: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
      avatar_url: user.avatar_url,
      bio: user.bio,
      school: user.school,
      city: user.city,
      region: user.region,
      country: user.country,
      study_field: user.study_field,
      join_date: user.join_date,
      rating: user.rating,
      is_verified: user.is_verified,
      skills: userSkills.map((skill) => ({
        id: skill.id,
        skill_name: skill.skill_name,
        category: skill.category,
        level: skill.level,
        experience_years: skill.experience_years,
      })),
      achievements: userAchievements.map((achievement) => ({
        id: achievement.id,
        competition_name: achievement.competition_name,
        position: achievement.position,
        award: achievement.award,
        achieved_at: achievement.achieved_at,
        category: achievement.category,
        description: achievement.description,
      })),
      projects: userProjects.map((project) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        category: project.category,
        tags: project.tags,
        image_url: project.image_url,
        project_url: project.project_url,
        github_url: project.github_url,
        created_at: project.created_at,
      })),
      social_links: socialLinks
        ? {
            github: socialLinks.github || "",
            linkedin: socialLinks.linkedin || "",
            personal: socialLinks.personal || "",
          }
        : {
            github: "",
            linkedin: "",
            personal: "",
          },
    };

    return {
      success: true,
      profile: profileData,
    };
  } catch (error) {
    console.error("Get public customer profile error:", error);
    return {
      success: false,
      message: "Failed to get customer profile",
      error: error.message,
    };
  }
};

// Get customer profiles with filtering and pagination
const getCustomerProfiles = async (filters = {}, options = {}) => {
  try {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    // Build query filters
    const query = {};

    // Text search filters
    if (filters.search) {
      query.$or = [
        { full_name: { $regex: filters.search, $options: "i" } },
        { username: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
      ];
    }

    // Location filters
    if (filters.city) {
      query.city = { $regex: filters.city, $options: "i" };
    }
    if (filters.region) {
      query.region = { $regex: filters.region, $options: "i" };
    }
    if (filters.country) {
      query.country = { $regex: filters.country, $options: "i" };
    }

    // Education filters
    if (filters.school) {
      query.school = { $regex: filters.school, $options: "i" };
    }
    if (filters.study_field) {
      query.study_field = { $regex: filters.study_field, $options: "i" };
    }

    // Rating filter
    if (filters.min_rating) {
      query.rating = { $gte: parseFloat(filters.min_rating) };
    }
    if (filters.max_rating) {
      query.rating = { ...query.rating, $lte: parseFloat(filters.max_rating) };
    }

    // Verification status filter
    if (filters.is_verified !== undefined) {
      query.is_verified = filters.is_verified === "true";
    }

    // Date range filters
    if (filters.join_date_from) {
      query.join_date = { $gte: new Date(filters.join_date_from) };
    }
    if (filters.join_date_to) {
      query.join_date = {
        ...query.join_date,
        $lte: new Date(filters.join_date_to),
      };
    }

    // Skill-based filtering
    let userIds = [];
    if (filters.skill_name || filters.skill_category || filters.skill_level) {
      const skillQuery = {};
      if (filters.skill_name) {
        skillQuery.skill_name = { $regex: filters.skill_name, $options: "i" };
      }
      if (filters.skill_category) {
        skillQuery.category = filters.skill_category;
      }
      if (filters.skill_level) {
        skillQuery.level = filters.skill_level;
      }

      const usersWithSkills = await UserSkills.find(skillQuery, { user_id: 1 });
      userIds = usersWithSkills.map((skill) => skill.user_id);

      if (userIds.length === 0) {
        // No users found with matching skills
        return {
          success: true,
          data: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        };
      }

      query.id = { $in: userIds };
    }

    // Filter by role_id = 3 (customer role)
    const usersWithCustomerRole = await UserRoles.find(
      { role_id: 3 },
      { user_id: 1 }
    );
    const customerUserIds = usersWithCustomerRole.map(
      (userRole) => userRole.user_id
    );

    if (customerUserIds.length === 0) {
      // No users found with customer role
      return {
        success: true,
        data: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    // Combine skill-based and role-based filters
    if (userIds.length > 0) {
      // If skill filtering was applied, find intersection of skill users and customer role users
      const intersectedUserIds = userIds.filter((id) =>
        customerUserIds.includes(id)
      );
      query.id = { $in: intersectedUserIds };
    } else {
      // If no skill filtering, just use customer role users
      query.id = { $in: customerUserIds };
    }

    // Execute query with pagination
    const users = await User.find(query, {
      password: 0, // Exclude sensitive fields
      verification_token: 0,
      verification_token_expires: 0,
      reset_password_token: 0,
      reset_password_token_expires: 0,
      refresh_token: 0,
    })
      .sort({ join_date: -1 }) // Sort by newest first
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Populate user skills and social media for each user
    const profilesData = await Promise.all(
      users.map(async (user) => {
        // Get user skills
        const userSkills = await UserSkills.find({ user_id: user.id });

        // Get user achievements
        const userAchievements = await Achievements.find({
          user_id: user.id,
        }).sort({ achieved_at: -1 });

        // Get social links
        const socialLinks = await UserSocialLinks.findOne({ user_id: user.id });

        return {
          userId: user.id,
          username: user.username,
          full_name: user.full_name,
          email: user.email,
          avatar_url: user.avatar_url,
          bio: user.bio,
          school: user.school,
          city: user.city,
          region: user.region,
          country: user.country,
          study_field: user.study_field,
          join_date: user.join_date,
          rating: user.rating,
          is_verified: user.is_verified,
          skills: userSkills.map((skill) => ({
            id: skill.id,
            skill_name: skill.skill_name,
            category: skill.category,
            level: skill.level,
            experience_years: skill.experience_years,
          })),
          achievements: userAchievements.map((achievement) => ({
            id: achievement.id,
            competition_name: achievement.competition_name,
            position: achievement.position,
            award: achievement.award,
          })),
          social_links: socialLinks
            ? {
                github: socialLinks.github || "",
                linkedin: socialLinks.linkedin || "",
                personal: socialLinks.personal || "",
              }
            : {
                github: "",
                linkedin: "",
                personal: "",
              },
        };
      })
    );

    return {
      success: true,
      data: profilesData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Get customer profiles error:", error);
    return {
      success: false,
      message: "Failed to get customer profiles",
      error: error.message,
    };
  }
};

export {
  getCustomerProfileByUserId,
  updateCustomerProfile,
  updateCustomerAvatar,
  getCustomerProfileById,
  getCustomerProfiles,
};
