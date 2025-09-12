import express from "express";
import {
  handleRegister,
  handleLogin,
  handleVerifyToken,
  handleVerifyEmailToken,
  handleResendVerificationEmail,
  handleForgotPassword,
  handleResetPasswordWithToken,
  handleChangePassword,
  handleRefreshToken,
} from "../controllers/authController.js";
import { verifyToken, isVerified } from "../middleware/authMiddleware.js";
import { isAdmin, isAdminOrOrganizer } from "../middleware/roleMiddleware.js";
import { handleUpload } from "../middleware/uploadMiddleware.js";
import {
  getAllRoles,
  getUserRolesController,
  assignRole,
  removeRole,
} from "../controllers/roleController.js";
import { handleRegisterOrganizer } from "../controllers/organizerController.js";
import {
  handleGetOrganizerProfile,
  handleUpdateOrganizerProfile,
  handleUpdateOrganizerAvatar,
  handleGetOrganizerProfileById,
} from "../controllers/organizerProfileController.js";
import {
  handleGetCustomerProfile,
  handleUpdateCustomerProfile,
  handleUpdateCustomerAvatar,
  handleGetCustomerProfileById,
} from "../controllers/customerProfileController.js";
import {
  handleGetUserSkills,
  handleAddUserSkill,
  handleUpdateUserSkill,
  handleDeleteUserSkill,
  handleGetAllSkills,
} from "../controllers/userSkillsController.js";
import {
  handleGetUserAchievements,
  handleAddUserAchievement,
  handleUpdateUserAchievement,
  handleDeleteUserAchievement,
  handleGetAchievementById,
} from "../controllers/achievementsController.js";
import {
  handleGetUserProjects,
  handleAddUserProject,
  handleUpdateUserProject,
  handleDeleteUserProject,
  handleGetProjectById,
} from "../controllers/projectsController.js";

let router = express.Router();

let initWebRoutes = (app) => {
  // Authentication routes
  router.post("/api/auth/register", handleRegister);
  router.post(
    "/api/auth/register/organizer",
    handleUpload,
    handleRegisterOrganizer
  );
  router.post("/api/auth/login", handleLogin);
  router.post("/api/auth/verify-token", handleVerifyToken);
  router.post("/api/auth/verify-email", handleVerifyEmailToken);
  router.post("/api/auth/resend-verification", handleResendVerificationEmail);
  router.post("/api/auth/forgot-password", handleForgotPassword);
  router.post("/api/auth/reset-password", handleResetPasswordWithToken);
  router.post("/api/auth/refresh-token", handleRefreshToken);

  // Protected routes
  router.post("/api/auth/change-password", verifyToken, handleChangePassword);

  // Role management routes
  router.get("/api/roles", verifyToken, isAdmin, getAllRoles);
  router.get(
    "/api/roles/user/:userId",
    verifyToken,
    isAdminOrOrganizer,
    getUserRolesController
  );
  router.post("/api/roles/assign", verifyToken, isAdmin, assignRole);
  router.post("/api/roles/remove", verifyToken, isAdmin, removeRole);

  // Organizer profile routes
  router.get(
    "/api/organizer/profile",
    verifyToken,
    isVerified,
    isAdminOrOrganizer,
    handleGetOrganizerProfile
  );
  router.put(
    "/api/organizer/profile",
    verifyToken,
    isVerified,
    isAdminOrOrganizer,
    handleUpdateOrganizerProfile
  );
  router.post(
    "/api/organizer/avatar",
    verifyToken,
    isVerified,
    isAdminOrOrganizer,
    handleUpload,
    handleUpdateOrganizerAvatar
  );
  router.get("/api/organizer/:organizerId", handleGetOrganizerProfileById);

  // Customer profile routes
  router.get(
    "/api/customer/profile",
    verifyToken,
    isVerified,
    handleGetCustomerProfile
  );
  router.put(
    "/api/customer/profile",
    verifyToken,
    isVerified,
    handleUpdateCustomerProfile
  );
  router.post(
    "/api/customer/avatar",
    verifyToken,
    isVerified,
    handleUpload,
    handleUpdateCustomerAvatar
  );
  router.get("/api/customer/:userId", handleGetCustomerProfileById);

  // User skills routes
  router.get("/api/skills", handleGetAllSkills);
  router.get("/api/user/skills", verifyToken, handleGetUserSkills);
  router.get("/api/user/:userId/skills", handleGetUserSkills);
  router.post("/api/user/skills", verifyToken, isVerified, handleAddUserSkill);
  router.put(
    "/api/user/skills/:skillId",
    verifyToken,
    isVerified,
    handleUpdateUserSkill
  );
  router.delete(
    "/api/user/skills/:skillId",
    verifyToken,
    isVerified,
    handleDeleteUserSkill
  );

  // User achievements routes
  router.get("/api/user/achievements", verifyToken, handleGetUserAchievements);
  router.get("/api/user/:userId/achievements", handleGetUserAchievements);
  router.get("/api/achievements/:achievementId", handleGetAchievementById);
  router.post(
    "/api/user/achievements",
    verifyToken,
    isVerified,
    handleAddUserAchievement
  );
  router.put(
    "/api/user/achievements/:achievementId",
    verifyToken,
    isVerified,
    handleUpdateUserAchievement
  );
  router.delete(
    "/api/user/achievements/:achievementId",
    verifyToken,
    isVerified,
    handleDeleteUserAchievement
  );

  // User projects routes
  router.get("/api/user/projects", verifyToken, handleGetUserProjects);
  router.get("/api/user/:userId/projects", handleGetUserProjects);
  router.get("/api/projects/:projectId", handleGetProjectById);
  router.post(
    "/api/user/projects",
    verifyToken,
    isVerified,
    handleUpload,
    handleAddUserProject
  );
  router.put(
    "/api/user/projects/:projectId",
    verifyToken,
    isVerified,
    handleUpload,
    handleUpdateUserProject
  );
  router.delete(
    "/api/user/projects/:projectId",
    verifyToken,
    isVerified,
    handleDeleteUserProject
  );

  return app.use("/", router);
};

export default initWebRoutes;
