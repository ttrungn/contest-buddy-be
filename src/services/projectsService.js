import Projects from "../models/projects.js";
import cloudinaryService from "./cloudinaryService.js";
import crypto from "crypto";

// Generate unique ID
const generateUniqueId = () => {
  return crypto.randomBytes(16).toString("hex");
};

// Get all projects of a user
const getUserProjects = async (userId) => {
  try {
    const projects = await Projects.find({ user_id: userId }).sort({
      created_at: -1,
    }); // Sort by created_at in descending order

    return {
      success: true,
      projects,
    };
  } catch (error) {
    console.error("Get user projects error:", error);
    return {
      success: false,
      message: "Failed to get user projects",
      error: error.message,
    };
  }
};

// Add a project to user
const addUserProject = async (userId, projectData, imageFile) => {
  try {
    // Validate project data
    if (
      !projectData.title ||
      !projectData.description ||
      !projectData.category
    ) {
      return {
        success: false,
        message: "Title, description, and category are required",
      };
    }

    let imageUrl = null;

    // Upload image if provided
    if (imageFile) {
      const uploadResult = await cloudinaryService.uploadImage(imageFile);

      if (uploadResult.success) {
        imageUrl = uploadResult.imageUrl;
      } else {
        console.error("Project image upload failed:", uploadResult.message);
      }
    }

    // Create new project
    const newProject = new Projects({
      id: generateUniqueId(),
      user_id: userId,
      title: projectData.title,
      description: projectData.description,
      category: projectData.category,
      tags: projectData.tags || [],
      image_url: imageUrl || projectData.image_url || null,
      project_url: projectData.project_url || null,
      github_url: projectData.github_url || null,
      created_at: new Date(),
    });

    await newProject.save();

    return {
      success: true,
      message: "Project added successfully",
      project: newProject,
    };
  } catch (error) {
    console.error("Add user project error:", error);
    return {
      success: false,
      message: "Failed to add user project",
      error: error.message,
    };
  }
};

// Update a user project
const updateUserProject = async (userId, projectId, projectData, imageFile) => {
  try {
    // Find the project
    const project = await Projects.findOne({
      id: projectId,
      user_id: userId,
    });

    if (!project) {
      return {
        success: false,
        message: "Project not found or not owned by user",
      };
    }

    let imageUrl = project.image_url;

    // Upload new image if provided
    if (imageFile) {
      const uploadResult = await cloudinaryService.uploadImage(imageFile);

      if (uploadResult.success) {
        // Delete old image if exists
        if (project.image_url) {
          const publicId = project.image_url.split("/").pop().split(".")[0];
          if (publicId) {
            await cloudinaryService.deleteImage(`avatars/${publicId}`);
          }
        }

        imageUrl = uploadResult.imageUrl;
      } else {
        console.error("Project image upload failed:", uploadResult.message);
      }
    }

    // Update project
    if (projectData.title) project.title = projectData.title;
    if (projectData.description) project.description = projectData.description;
    if (projectData.category) project.category = projectData.category;
    if (projectData.tags) project.tags = projectData.tags;
    if (imageUrl) project.image_url = imageUrl;
    if (projectData.project_url !== undefined)
      project.project_url = projectData.project_url;
    if (projectData.github_url !== undefined)
      project.github_url = projectData.github_url;

    await project.save();

    return {
      success: true,
      message: "Project updated successfully",
      project,
    };
  } catch (error) {
    console.error("Update user project error:", error);
    return {
      success: false,
      message: "Failed to update user project",
      error: error.message,
    };
  }
};

// Delete a user project
const deleteUserProject = async (userId, projectId) => {
  try {
    // Find the project
    const project = await Projects.findOne({
      id: projectId,
      user_id: userId,
    });

    if (!project) {
      return {
        success: false,
        message: "Project not found or not owned by user",
      };
    }

    // Delete image if exists
    if (project.image_url) {
      const publicId = project.image_url.split("/").pop().split(".")[0];
      if (publicId) {
        await cloudinaryService.deleteImage(`avatars/${publicId}`);
      }
    }

    // Delete the project
    await Projects.deleteOne({ id: projectId, user_id: userId });

    return {
      success: true,
      message: "Project deleted successfully",
    };
  } catch (error) {
    console.error("Delete user project error:", error);
    return {
      success: false,
      message: "Failed to delete user project",
      error: error.message,
    };
  }
};

// Get a specific project by ID
const getProjectById = async (projectId) => {
  try {
    const project = await Projects.findOne({ id: projectId });

    if (!project) {
      return {
        success: false,
        message: "Project not found",
      };
    }

    return {
      success: true,
      project,
    };
  } catch (error) {
    console.error("Get project by ID error:", error);
    return {
      success: false,
      message: "Failed to get project",
      error: error.message,
    };
  }
};

// Các hàm liên quan đến featured đã bị loại bỏ vì model mới không có trường này

export {
  getUserProjects,
  addUserProject,
  updateUserProject,
  deleteUserProject,
  getProjectById,
};
