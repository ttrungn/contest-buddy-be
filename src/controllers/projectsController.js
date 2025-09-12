import {
  getUserProjects,
  addUserProject,
  updateUserProject,
  deleteUserProject,
  getProjectById,
} from "../services/projectsService.js";

// Get all projects of a user
const handleGetUserProjects = async (req, res) => {
  try {
    // Get user ID from auth middleware or params
    const userId = req.params.userId || req.user.id;

    // Get user projects
    const result = await getUserProjects(userId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Get user projects controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Add a project to user
const handleAddUserProject = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;

    // Get project data from request body
    const projectData = req.body;

    // Get image file if uploaded
    const imageFile = req.file;

    // Add user project
    const result = await addUserProject(userId, projectData, imageFile);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Add user project controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update a user project
const handleUpdateUserProject = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;

    // Get project ID from params
    const { projectId } = req.params;

    // Get project data from request body
    const projectData = req.body;

    // Get image file if uploaded
    const imageFile = req.file;

    // Update user project
    const result = await updateUserProject(
      userId,
      projectId,
      projectData,
      imageFile
    );

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Update user project controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete a user project
const handleDeleteUserProject = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;

    // Get project ID from params
    const { projectId } = req.params;

    // Delete user project
    const result = await deleteUserProject(userId, projectId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Delete user project controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get a specific project by ID
const handleGetProjectById = async (req, res) => {
  try {
    // Get project ID from params
    const { projectId } = req.params;

    // Get project
    const result = await getProjectById(projectId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error("Get project by ID controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Các hàm liên quan đến featured đã bị loại bỏ vì model mới không có trường này

export {
  handleGetUserProjects,
  handleAddUserProject,
  handleUpdateUserProject,
  handleDeleteUserProject,
  handleGetProjectById,
};
