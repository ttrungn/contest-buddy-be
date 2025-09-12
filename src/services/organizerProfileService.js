import db from "../models/index.js";
import cloudinaryService from "./cloudinaryService.js";

// Get organizer profile by user ID
const getOrganizerProfileByUserId = async (userId) => {
  try {
    // Find organizer by owner_user_id
    const organizer = await db.Organizers.findOne({ owner_user_id: userId });

    if (!organizer) {
      return {
        success: false,
        message: "Organizer profile not found",
      };
    }

    // Get user info
    const user = await db.User.findOne({ id: userId });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Combine user and organizer data
    const profileData = {
      userId: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      organizerId: organizer.id,
      organizerName: organizer.name,
      organizerEmail: organizer.email,
      avatar_url: organizer.avatar_url,
      description: organizer.description,
      address: organizer.address,
      phone: organizer.phone,
      website: organizer.website,
    };

    return {
      success: true,
      profile: profileData,
    };
  } catch (error) {
    console.error("Get organizer profile error:", error);
    return {
      success: false,
      message: "Failed to get organizer profile",
      error: error.message,
    };
  }
};

// Update organizer profile
const updateOrganizerProfile = async (userId, profileData) => {
  try {
    // Find organizer by owner_user_id
    const organizer = await db.Organizers.findOne({ owner_user_id: userId });

    if (!organizer) {
      return {
        success: false,
        message: "Organizer profile not found",
      };
    }

    // Update organizer data
    if (profileData.name) organizer.name = profileData.name;
    if (profileData.email) organizer.email = profileData.email;
    if (profileData.description !== undefined)
      organizer.description = profileData.description;
    if (profileData.address !== undefined)
      organizer.address = profileData.address;
    if (profileData.phone !== undefined) organizer.phone = profileData.phone;
    if (profileData.website !== undefined)
      organizer.website = profileData.website;

    await organizer.save();

    // Update user data if provided
    if (profileData.full_name || profileData.email) {
      const user = await db.User.findOne({ id: userId });

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      if (profileData.full_name) user.full_name = profileData.full_name;
      if (profileData.email) user.email = profileData.email;

      await user.save();
    }

    return {
      success: true,
      message: "Organizer profile updated successfully",
      organizerId: organizer.id,
    };
  } catch (error) {
    console.error("Update organizer profile error:", error);
    return {
      success: false,
      message: "Failed to update organizer profile",
      error: error.message,
    };
  }
};

// Update organizer avatar
const updateOrganizerAvatar = async (userId, file) => {
  try {
    // Find organizer by owner_user_id
    const organizer = await db.Organizers.findOne({ owner_user_id: userId });

    if (!organizer) {
      return {
        success: false,
        message: "Organizer profile not found",
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
    if (organizer.avatar_url) {
      const publicId = organizer.avatar_url.split("/").pop().split(".")[0];
      if (publicId) {
        await cloudinaryService.deleteImage(`avatars/${publicId}`);
      }
    }

    // Update avatar URL
    organizer.avatar_url = uploadResult.imageUrl;
    await organizer.save();

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

export {
  getOrganizerProfileByUserId,
  updateOrganizerProfile,
  updateOrganizerAvatar,
};
