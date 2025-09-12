import { registerOrganizer } from "../services/organizerService.js";
import cloudinaryService from "../services/cloudinaryService.js";

// Register new organizer
const handleRegisterOrganizer = async (req, res) => {
  try {
    const { user, organizer } = req.body;

    // Validate required user fields
    const requiredUserFields = ["username", "password", "full_name", "email"];

    const missingUserFields = requiredUserFields.filter(
      (field) => !user?.[field]
    );

    if (missingUserFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required user fields: ${missingUserFields.join(
          ", "
        )}`,
      });
    }

    // Validate required organizer fields
    const requiredOrganizerFields = ["name", "email"];

    const missingOrganizerFields = requiredOrganizerFields.filter(
      (field) => !organizer?.[field]
    );

    if (missingOrganizerFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required organizer fields: ${missingOrganizerFields.join(
          ", "
        )}`,
      });
    }

    // Handle avatar upload if file is provided
    let avatarUrl = null;
    if (req.file) {
      const uploadResult = await cloudinaryService.uploadImage(req.file);
      if (uploadResult.success) {
        avatarUrl = uploadResult.imageUrl;
      } else {
        console.error("Avatar upload failed:", uploadResult.message);
      }
    }

    // Add avatar URL to organizer data if upload was successful
    if (avatarUrl) {
      organizer.avatar_url = avatarUrl;
    }

    // Register organizer
    const result = await registerOrganizer(user, organizer);

    if (result.success) {
      // Set refresh token in HTTP-only cookie
      if (result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }

      return res.status(201).json({
        success: true,
        message: result.message,
        userId: result.userId,
        organizerId: result.organizerId,
        accessToken: result.accessToken,
        needsVerification: result.needsVerification,
        emailSent: result.emailSent,
        avatar_url: avatarUrl,
      });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Organizer registration controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export { handleRegisterOrganizer };
