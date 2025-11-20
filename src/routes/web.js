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
import { handleListUserEvents } from "../controllers/calendarEventsController.js";
import {
  handleGetNotificationSettings,
  handleUpdateNotificationSettings,
} from "../controllers/notificationSettingsController.js";
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
  handleGetCompetitionsWithTopPlans,
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
  handleUpdatePlanStatus,
} from "../controllers/plansController.js";
import {
  handleRegisterForCompetition,
  handleCheckParticipantRegistration,
  handleGetUserParticipatedCompetitions,
} from "../controllers/competitionRegistrationController.js";
import {
  handleCreateNewCompetitionOrder,
  handleGetOrdersByUserId,
  handleGetOrderDetailsByOrderId,
} from "../controllers/orderController.js";
import {
  handleCreatePaymentUrl,
  handleWebhook,
} from "../controllers/paymentsController.js";
import {
  getAllPlans,
  getPlanById,
  getUserSubscription,
  getUserSubscriptionHistory,
  purchaseSubscription,
  cancelSubscription,
  checkFeatureAccess,
  getSubscriptionDashboard,
} from "../controllers/userSubscriptionController.js";
import {
  handleCreateUserSubscriptionPlan,
  handleUpdateUserSubscriptionPlan,
  handleDeleteUserSubscriptionPlan,
  handleUpdateUserSubscriptionPlanStatus,
} from "../controllers/userSubscriptionPlansController.js";
import {
  handleGetNewUsersByTimeRange,
  handleGetNewUsersByPeriodInYear,
  handleGetNewUsersByYear,
  handleGetRevenueByTimeRange,
  handleGetRevenueByPeriodInYear,
  handleGetRevenueByYear,
  handleGetPlanPurchasesByTimeRange,
  handleGetPlanPurchasesByPeriodInYear,
  handleGetPlanPurchasesByYear,
} from "../controllers/analyticsController.js";
import { handleTriggerCompetitionEmailJob } from "../controllers/jobsController.js";

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
  router.get("/api/orders", verifyToken, isVerified, handleGetOrdersByUserId);
  router.get(
    "/api/orders/:orderId",
    verifyToken,
    isVerified,
    handleGetOrderDetailsByOrderId
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

  // Calendar events routes
  router.get(
    "/api/calendar/events",
    verifyToken,
    isVerified,
    handleListUserEvents
  );

  // Notification settings routes
  router.get(
    "/api/notifications/settings",
    verifyToken,
    isVerified,
    handleGetNotificationSettings
  );
  router.put(
    "/api/notifications/settings",
    verifyToken,
    isVerified,
    handleUpdateNotificationSettings
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
  router.get("/api/competitions/banners", handleGetCompetitionsWithTopPlans);
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

  // Order routes
  router.post(
    "/api/orders/competition",
    verifyToken,
    isVerified,
    isOrganizer,
    handleCreateNewCompetitionOrder
  );

  // Payment routes
  router.post(
    "/api/payments/create-url",
    verifyToken,
    isVerified,
    handleCreatePaymentUrl
  );
  router.post("/api/payments/webhook", handleWebhook);

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

  // User Subscription routes
  router.get("/api/user-subscriptions/plans", getAllPlans);
  router.get("/api/user-subscriptions/plans/:planId", getPlanById);
  router.post(
    "/api/user-subscriptions/plans",
    verifyToken,
    isVerified,
    isAdmin,
    handleCreateUserSubscriptionPlan
  );
  router.put(
    "/api/user-subscriptions/plans/:planId",
    verifyToken,
    isVerified,
    isAdmin,
    handleUpdateUserSubscriptionPlan
  );
  router.patch(
    "/api/user-subscriptions/plans/:planId/status",
    verifyToken,
    isVerified,
    isAdmin,
    handleUpdateUserSubscriptionPlanStatus
  );
  router.delete(
    "/api/user-subscriptions/plans/:planId",
    verifyToken,
    isVerified,
    isAdmin,
    handleDeleteUserSubscriptionPlan
  );
  router.get(
    "/api/user-subscriptions/current",
    verifyToken,
    isVerified,
    getUserSubscription
  );
  router.get(
    "/api/user-subscriptions/history",
    verifyToken,
    isVerified,
    getUserSubscriptionHistory
  );
  router.get(
    "/api/user-subscriptions/dashboard",
    verifyToken,
    isVerified,
    isAdmin,
    getSubscriptionDashboard
  );
  router.post(
    "/api/user-subscriptions/purchase",
    verifyToken,
    isVerified,
    purchaseSubscription
  );
  router.post(
    "/api/user-subscriptions/:subscription_id/cancel",
    verifyToken,
    isVerified,
    cancelSubscription
  );
  router.get(
    "/api/user-subscriptions/features/:feature_key/check",
    verifyToken,
    isVerified,
    checkFeatureAccess
  );

  // Analytics routes (Admin only)
  // User/Organizer statistics
  router.get(
    "/api/analytics/users/time-range",
    // verifyToken,
    // isVerified,
    // isAdmin,
    handleGetNewUsersByTimeRange
  );
  router.get(
    "/api/analytics/users/period",
    // verifyToken,
    // isVerified,
    // isAdmin,
    handleGetNewUsersByPeriodInYear
  );
  router.get(
    "/api/analytics/users/year",
    // verifyToken,
    // isVerified,
    // isAdmin,
    handleGetNewUsersByYear
  );

  // Revenue statistics
  router.get(
    "/api/analytics/revenue/time-range",
    // verifyToken,
    // isVerified,
    // isAdmin,
    handleGetRevenueByTimeRange
  );
  router.get(
    "/api/analytics/revenue/period",
    // verifyToken,
    // isVerified,
    // isAdmin,
    handleGetRevenueByPeriodInYear
  );
  router.get(
    "/api/analytics/revenue/year",
    // verifyToken,
    // isVerified,
    // isAdmin,
    handleGetRevenueByYear
  );

  // Plan purchase analytics routes
  router.get(
    "/api/analytics/plans/time-range",
    // verifyToken,
    // isVerified,
    // isAdmin,
    handleGetPlanPurchasesByTimeRange
  );
  router.get(
    "/api/analytics/plans/period",
    // verifyToken,
    // isVerified,
    // isAdmin,
    handleGetPlanPurchasesByPeriodInYear
  );
  router.get(
    "/api/analytics/plans/year",
    // verifyToken,
    // isVerified,
    // isAdmin,
    handleGetPlanPurchasesByYear
  );

  // Jobs/Cron routes (Admin only - for manual testing)
  router.post(
    "/api/jobs/competition-email/trigger",
    verifyToken,
    isVerified,
    isAdmin,
    handleTriggerCompetitionEmailJob
  );

  return app.use("/", router);
};

export default initWebRoutes;
