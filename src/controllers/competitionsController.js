import {
  createCompetition,
  getCompetitionById,
  getAllCompetitions,
  updateCompetition,
  deleteCompetition,
  getCompetitionsByCategory,
  getCompetitionsByStatus,
  getFeaturedCompetitions,
  getCompetitionParticipants,
  getCompetitionConstants,
} from "../services/competitionsService.js";

// Create a new competition
export const handleCreateCompetition = async (req, res) => {
  try {
    const competitionData = req.body;
    const userId = req.user?.id; // Get userId from authenticated user

    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    const competition = await createCompetition(competitionData, userId);

    res.status(201).json({
      status: "success",
      message: "Competition created successfully",
      data: competition,
    });
  } catch (error) {
    console.error("Error creating competition:", error);

    // Handle specific error types
    if (error.message.includes("not registered as an organizer")) {
      return res.status(403).json({
        status: "error",
        message: "Only registered organizers can create competitions",
      });
    }

    if (
      error.message.includes("not found") ||
      error.message.includes("not active")
    ) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    res.status(500).json({
      status: "error",
      message: error.message || "Failed to create competition",
    });
  }
};

// Get competition by ID
export const handleGetCompetitionById = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const competition = await getCompetitionById(competitionId);

    if (!competition) {
      return res.status(404).json({
        status: "error",
        message: "Competition not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: competition,
    });
  } catch (error) {
    console.error("Error getting competition:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to get competition",
    });
  }
};

// Get all competitions
export const handleGetAllCompetitions = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, featured } = req.query;
    const filters = {};

    if (category) filters.category = category;
    if (status) filters.status = status;
    if (featured) filters.featured = featured === "true";

    const competitions = await getAllCompetitions(filters, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      status: "success",
      data: competitions.data,
      pagination: competitions.pagination,
    });
  } catch (error) {
    console.error("Error getting competitions:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to get competitions",
    });
  }
};

// Update competition
export const handleUpdateCompetition = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const updateData = req.body;
    const userId = req.user?.id; // Get userId from authenticated user
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    const competition = await updateCompetition(
      competitionId,
      updateData,
      userId
    );

    if (!competition) {
      return res.status(404).json({
        status: "error",
        message: "Competition not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Competition updated successfully",
      data: competition,
    });
  } catch (error) {
    console.error("Error updating competition:", error);

    // Handle specific error types
    if (error.message.includes("Not authorized")) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to update this competition",
      });
    }

    if (
      error.message.includes("not found") ||
      error.message.includes("not active")
    ) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    res.status(500).json({
      status: "error",
      message: error.message || "Failed to update competition",
    });
  }
};

// Delete competition
export const handleDeleteCompetition = async (req, res) => {
  try {
    const { competitionId } = req.params;

    const result = await deleteCompetition(competitionId);

    if (!result) {
      return res.status(404).json({
        status: "error",
        message: "Competition not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Competition deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting competition:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to delete competition",
    });
  }
};

// Get competitions by category
export const handleGetCompetitionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const competitions = await getCompetitionsByCategory(category, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      status: "success",
      data: competitions.data,
      pagination: competitions.pagination,
    });
  } catch (error) {
    console.error("Error getting competitions by category:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to get competitions by category",
    });
  }
};

// Get competitions by status
export const handleGetCompetitionsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const competitions = await getCompetitionsByStatus(status, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      status: "success",
      data: competitions.data,
      pagination: competitions.pagination,
    });
  } catch (error) {
    console.error("Error getting competitions by status:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to get competitions by status",
    });
  }
};

// Get featured competitions
export const handleGetFeaturedCompetitions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const competitions = await getFeaturedCompetitions({
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      status: "success",
      data: competitions.data,
      pagination: competitions.pagination,
    });
  } catch (error) {
    console.error("Error getting featured competitions:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to get featured competitions",
    });
  }
};

// Get competition participants
export const handleGetCompetitionParticipants = async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const participants = await getCompetitionParticipants(competitionId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      status: "success",
      data: participants.data,
      pagination: participants.pagination,
    });
  } catch (error) {
    console.error("Error getting competition participants:", error);

    if (error.message.includes("Competition not found")) {
      return res.status(404).json({
        status: "error",
        message: "Competition not found",
      });
    }

    res.status(500).json({
      status: "error",
      message: error.message || "Failed to get competition participants",
    });
  }
};

// Get competition constants (categories, levels, statuses)
export const handleGetCompetitionConstants = async (req, res) => {
  try {
    const constants = await getCompetitionConstants();

    res.status(200).json({
      status: "success",
      data: constants,
    });
  } catch (error) {
    console.error("Error getting competition constants:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to get competition constants",
    });
  }
};
