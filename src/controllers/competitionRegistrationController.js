import {
  registerForCompetition,
  checkParticipantRegistration,
  getUserParticipatedCompetitions,
} from "../services/competitionRegistrationService.js";

// Register for competition
const handleRegisterForCompetition = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { teamId } = req.body;
    const userId = req.user ? req.user.id : null; // Get user ID from auth token

    // Validate input
    if (!competitionId) {
      return res.status(400).json({
        success: false,
        message: "Competition ID is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Register for competition
    const result = await registerForCompetition(competitionId, {
      userId,
      teamId,
    });

    if (result.success) {
      return res.status(201).json(result);
    } else {
      // Check for specific error types
      if (result.message.includes("already registered")) {
        return res.status(409).json(result); // Conflict
      }
      if (result.message.includes("not found")) {
        return res.status(404).json(result); // Not Found
      }
      return res.status(400).json(result); // Bad Request
    }
  } catch (error) {
    console.error("Register for competition controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Check if participant is registered for competition
const handleCheckParticipantRegistration = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const userId = req.user ? req.user.id : null; // Get user ID from auth token

    // Validate input
    if (!competitionId) {
      return res.status(400).json({
        success: false,
        message: "Competition ID is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Check participant registration
    const result = await checkParticipantRegistration(competitionId, {
      userId,
    });

    if (result.success) {
      if (result.isRegistered) {
        // Return 200 OK if registered
        return res.status(200).json(result);
      } else {
        // Return 404 Not Found if not registered
        return res.status(404).json({
          success: true,
          isRegistered: false,
          message: "Participant not registered for this competition",
        });
      }
    } else {
      // Check for specific error types
      if (result.message.includes("not found")) {
        return res.status(404).json(result); // Not Found
      }
      return res.status(400).json(result); // Bad Request
    }
  } catch (error) {
    console.error("Check participant registration controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all competitions that current user participated in
const handleGetUserParticipatedCompetitions = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null; // Get user ID from auth token

    // Validate authentication
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get user participated competitions
    const result = await getUserParticipatedCompetitions(userId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(500).json(result);
    }
  } catch (error) {
    console.error(
      "Get user participated competitions controller error:",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export {
  handleRegisterForCompetition,
  handleCheckParticipantRegistration,
  handleGetUserParticipatedCompetitions,
};
