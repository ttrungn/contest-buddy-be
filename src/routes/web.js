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
import {
  isAdmin,
  isAdminOrOrganizer,
  isOrganizer,
} from "../middleware/roleMiddleware.js";
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
  handleGetCustomerProfiles,
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
import {
  handleCreateDirectConversation,
  handleGetUserConversations,
  handleGetConversationById,
  handleGetConversationMessages,
  handleSendMessage,
  handleMarkConversationAsRead,
} from "../controllers/chatController.js";
import {
  handleCreateTeam,
  handleGetTeamById,
  handleUpdateTeam,
  handleDeleteTeam,
  handleGetTeamMembers,
  handleRemoveTeamMember,
  handleGetUserTeams,
  handleChangeTeamMemberRole,
} from "../controllers/teamController.js";
import {
  handleCreateInvitation,
  handleGetInvitationById,
  handleGetTeamInvitations,
  handleGetUserInvitations,
  handleAcceptInvitation,
  handleRejectInvitation,
  handleCancelInvitation,
} from "../controllers/teamInvitationController.js";
import {
  handleCreateCompetition,
  handleGetCompetitionById,
  handleGetAllCompetitions,
  handleUpdateCompetition,
  handleDeleteCompetition,
  handleGetCompetitionsByCategory,
  handleGetCompetitionsByStatus,
  handleGetFeaturedCompetitions,
  handleGetCompetitionsByUserId,
  handleGetCompetitionParticipants,
  handleGetCompetitionConstants,
} from "../controllers/competitionsController.js";
import {
  handleCreateSkill,
  handleGetSkillById,
  handleGetAllSkillsNew,
  handleUpdateSkill,
  handleDeleteSkill,
  handleGetSkillsByCategory,
  handleSearchSkills,
} from "../controllers/skillsController.js";
import {
  handleCreatePlan,
  handleGetAllPlans,
  handleGetPlanById,
  handleUpdatePlan,
  handleDeletePlan,
  handleGetPlansByStatus,
  handleGetPlanWithFeatures,
  handleUpdatePlanStatus,
} from "../controllers/plansController.js";
import {
  handleRegisterForCompetition,
  handleCheckParticipantRegistration,
  handleGetUserParticipatedCompetitions,
} from "../controllers/competitionRegistrationController.js";

let router = express.Router();

let initWebRoutes = (app) => {
  // Health check route
  router.get("/api/health", (req, res) => {
    res.status(200).json({ status: "success", message: "API is healthy" });
  });

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
  router.get(
    "/api/organizer/competitions",
    verifyToken,
    isVerified,
    handleGetCompetitionsByUserId
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
  router.get("/api/customers", handleGetCustomerProfiles);

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

  // Chat routes
  router.post(
    "/api/chat/conversations/direct",
    verifyToken,
    isVerified,
    handleCreateDirectConversation
  );
  router.get(
    "/api/chat/conversations",
    verifyToken,
    isVerified,
    handleGetUserConversations
  );
  router.get(
    "/api/chat/conversations/:conversationId",
    verifyToken,
    isVerified,
    handleGetConversationById
  );
  router.get(
    "/api/chat/conversations/:conversationId/messages",
    verifyToken,
    isVerified,
    handleGetConversationMessages
  );
  router.post(
    "/api/chat/conversations/:conversationId/messages",
    verifyToken,
    isVerified,
    handleSendMessage
  );
  router.post(
    "/api/chat/conversations/:conversationId/read",
    verifyToken,
    isVerified,
    handleMarkConversationAsRead
  );

  // Team routes
  router.post("/api/teams", verifyToken, isVerified, handleCreateTeam);
  router.get("/api/teams/:teamId", handleGetTeamById);
  router.put("/api/teams/:teamId", verifyToken, isVerified, handleUpdateTeam);
  router.delete(
    "/api/teams/:teamId",
    verifyToken,
    isVerified,
    handleDeleteTeam
  );
  router.get("/api/teams/:teamId/members", handleGetTeamMembers);
  router.delete(
    "/api/teams/:teamId/members/:memberId",
    verifyToken,
    isVerified,
    handleRemoveTeamMember
  );
  router.put(
    "/api/teams/:teamId/members/:memberId/role",
    verifyToken,
    isVerified,
    handleChangeTeamMemberRole
  );
  router.get("/api/user/teams", verifyToken, handleGetUserTeams);
  router.get("/api/user/:userId/teams", handleGetUserTeams);

  // Team invitation routes
  router.post(
    "/api/team-invitations",
    verifyToken,
    isVerified,
    handleCreateInvitation
  );
  router.get("/api/team-invitations/:invitationId", handleGetInvitationById);
  router.get(
    "/api/teams/:teamId/invitations",
    verifyToken,
    isVerified,
    handleGetTeamInvitations
  );
  router.get("/api/user/invitations", verifyToken, handleGetUserInvitations);
  router.post(
    "/api/team-invitations/:invitationId/accept",
    verifyToken,
    isVerified,
    handleAcceptInvitation
  );
  router.post(
    "/api/team-invitations/:invitationId/reject",
    verifyToken,
    isVerified,
    handleRejectInvitation
  );
  router.post(
    "/api/team-invitations/:invitationId/cancel",
    verifyToken,
    isVerified,
    handleCancelInvitation
  );

  // Competition routes
  router.post(
    "/api/competitions",
    verifyToken,
    isVerified,
    isAdminOrOrganizer,
    handleCreateCompetition
  );
  router.get("/api/competitions/constants", handleGetCompetitionConstants);
  router.get("/api/competitions", handleGetAllCompetitions);
  router.get("/api/competitions/featured", handleGetFeaturedCompetitions);
  router.get(
    "/api/competitions/category/:category",
    handleGetCompetitionsByCategory
  );
  router.get("/api/competitions/status/:status", handleGetCompetitionsByStatus);
  router.get(
    "/api/user/competitions",
    verifyToken,
    isVerified,
    handleGetCompetitionsByUserId
  );
  router.get("/api/competitions/:competitionId", handleGetCompetitionById);
  router.get(
    "/api/competitions/:competitionId/participants",
    handleGetCompetitionParticipants
  );
  router.post(
    "/api/competitions/:competitionId/register",
    verifyToken,
    isVerified,
    handleRegisterForCompetition
  );
  router.head(
    "/api/competitions/:competitionId/participants/check",
    verifyToken,
    handleCheckParticipantRegistration
  );
  router.get(
    "/api/competitions/:competitionId/participants/check",
    verifyToken,
    handleCheckParticipantRegistration
  );
  router.get(
    "/api/user/participated-competitions",
    verifyToken,
    isVerified,
    handleGetUserParticipatedCompetitions
  );
  router.put(
    "/api/competitions/:competitionId",
    verifyToken,
    isVerified,
    isAdminOrOrganizer,
    handleUpdateCompetition
  );
  router.delete(
    "/api/competitions/:competitionId",
    verifyToken,
    isVerified,
    isAdminOrOrganizer,
    handleDeleteCompetition
  );

  // Skills routes (new CRUD endpoints)
  router.post(
    "/api/skills/create",
    verifyToken,
    isVerified,
    isAdmin,
    handleCreateSkill
  );
  router.get("/api/skills/all", handleGetAllSkillsNew);
  router.get("/api/skills/search", handleSearchSkills);
  router.get("/api/skills/category/:category", handleGetSkillsByCategory);
  router.get("/api/skills/:skillId", handleGetSkillById);
  router.put(
    "/api/skills/:skillId",
    verifyToken,
    isVerified,
    isAdmin,
    handleUpdateSkill
  );
  router.delete(
    "/api/skills/:skillId",
    verifyToken,
    isVerified,
    isAdmin,
    handleDeleteSkill
  );

  // Plans routes
  router.post("/api/plans", verifyToken, isVerified, isAdmin, handleCreatePlan);
  router.get("/api/plans", handleGetAllPlans);
  router.get("/api/plans/:id", handleGetPlanById);
  router.get("/api/plans/:id/features", handleGetPlanWithFeatures);
  router.get("/api/plans/status/:status", handleGetPlansByStatus);
  router.put(
    "/api/plans/:id",
    verifyToken,
    isVerified,
    isAdmin,
    handleUpdatePlan
  );
  router.patch(
    "/api/plans/:id/status",
    verifyToken,
    isVerified,
    isAdmin,
    handleUpdatePlanStatus
  );
  router.delete(
    "/api/plans/:id",
    verifyToken,
    isVerified,
    isAdmin,
    handleDeletePlan
  );

  return app.use("/", router);
};

export default initWebRoutes;
