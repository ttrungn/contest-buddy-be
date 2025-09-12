import UserSocialLinks from "../models/userSocialLinks.js";
import User from "../models/user.js";
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

    // Find social links
    const socialLinks = await UserSocialLinks.findOne({ user_id: userId });

    // Prepare public profile data
    const profileData = {
      userId: user.id,
      username: user.username,
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
    console.error("Get public customer profile error:", error);
    return {
      success: false,
      message: "Failed to get customer profile",
      error: error.message,
    };
  }
};

export {
  getCustomerProfileByUserId,
  updateCustomerProfile,
  updateCustomerAvatar,
  getCustomerProfileById,
};
