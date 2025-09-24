import {
  createInvitation,
  getInvitationById,
  getTeamInvitations,
  getUserInvitations,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
} from "../services/teamInvitationService.js";

/**
 * Handle create invitation request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleCreateInvitation = async (req, res) => {
  try {
    const { teamId, inviteeId, message } = req.body;
    const inviterId = req.user.id;

    // Validate required fields
    if (!teamId || !inviteeId) {
      return res.status(400).json({
        success: false,
        message: "Team ID and invitee ID are required",
      });
    }

    const invitation = await createInvitation(
      teamId,
      inviterId,
      inviteeId,
      message
    );

    return res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      data: invitation,
    });
  } catch (error) {
    return res
      .status(
        error.message.includes("not found") ||
          error.message.includes("already a team member")
          ? 400
          : 500
      )
      .json({
        success: false,
        message: error.message,
      });
  }
};

/**
 * Handle get invitation by ID request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleGetInvitationById = async (req, res) => {
  try {
    const { invitationId } = req.params;

    const invitation = await getInvitationById(invitationId);

    return res.status(200).json({
      success: true,
      data: invitation,
    });
  } catch (error) {
    return res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Handle get team invitations request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleGetTeamInvitations = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const invitations = await getTeamInvitations(teamId, userId);

    return res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    return res
      .status(
        error.message.includes("not found")
          ? 404
          : error.message.includes("Only team members")
          ? 403
          : 500
      )
      .json({
        success: false,
        message: error.message,
      });
  }
};

/**
 * Handle get user invitations request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleGetUserInvitations = async (req, res) => {
  try {
    const userId = req.user.id;

    const invitations = await getUserInvitations(userId);

    return res.status(200).json({
      success: true,
      data: invitations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Handle accept invitation request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleAcceptInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id;

    const teamMember = await acceptInvitation(invitationId, userId);

    return res.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
      data: teamMember,
    });
  } catch (error) {
    return res
      .status(
        error.message.includes("not found")
          ? 404
          : error.message.includes("Only the invited user")
          ? 403
          : 400
      )
      .json({
        success: false,
        message: error.message,
      });
  }
};

/**
 * Handle reject invitation request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleRejectInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id;

    const invitation = await rejectInvitation(invitationId, userId);

    return res.status(200).json({
      success: true,
      message: "Invitation rejected successfully",
      data: invitation,
    });
  } catch (error) {
    return res
      .status(
        error.message.includes("not found")
          ? 404
          : error.message.includes("Only the invited user")
          ? 403
          : 400
      )
      .json({
        success: false,
        message: error.message,
      });
  }
};

/**
 * Handle cancel invitation request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleCancelInvitation = async (req, res) => {
  try {
    const { invitationId } = req.params;
    const userId = req.user.id;

    const invitation = await cancelInvitation(invitationId, userId);

    return res.status(200).json({
      success: true,
      message: "Invitation cancelled successfully",
      data: invitation,
    });
  } catch (error) {
    return res
      .status(
        error.message.includes("not found")
          ? 404
          : error.message.includes("Only the inviter or team leader")
          ? 403
          : 400
      )
      .json({
        success: false,
        message: error.message,
      });
  }
};
