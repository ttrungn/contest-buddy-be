import { v4 as uuidv4 } from "uuid";
import TeamInvitations, {
  INVITATION_STATUSES,
} from "../models/teamInvitations.js";
import TeamMembers, {
  TEAM_ROLES,
  MEMBER_STATUSES,
} from "../models/teamMembers.js";
import Teams from "../models/teams.js";

/**
 * Create a team invitation
 * @param {String} teamId - Team ID
 * @param {String} inviterId - User ID of the inviter
 * @param {String} inviteeId - User ID of the invitee
 * @param {String} message - Invitation message
 * @returns {Object} Created invitation
 */
export const createInvitation = async (
  teamId,
  inviterId,
  inviteeId,
  message
) => {
  try {
    // Check if team exists
    const team = await Teams.findOne({ id: teamId });
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if inviter is a team member
    const inviterMember = await TeamMembers.findOne({
      team_id: teamId,
      user_id: inviterId,
      status: MEMBER_STATUSES.ACTIVE,
    });

    if (!inviterMember) {
      throw new Error("Only team members can send invitations");
    }

    // Check if invitee is already a team member
    const existingMember = await TeamMembers.findOne({
      team_id: teamId,
      user_id: inviteeId,
      status: MEMBER_STATUSES.ACTIVE,
    });

    if (existingMember) {
      throw new Error("User is already a team member");
    }

    // Check if there's already a pending invitation
    const existingInvitation = await TeamInvitations.findOne({
      team_id: teamId,
      invitee_id: inviteeId,
      status: INVITATION_STATUSES.PENDING,
    });

    if (existingInvitation) {
      throw new Error("There is already a pending invitation for this user");
    }

    // Check if team is at max capacity
    const activeMembers = await TeamMembers.countDocuments({
      team_id: teamId,
      status: MEMBER_STATUSES.ACTIVE,
    });

    if (activeMembers >= team.max_members) {
      throw new Error("Team has reached maximum member capacity");
    }

    // Create invitation
    const invitation = await TeamInvitations.create({
      id: uuidv4(),
      team_id: teamId,
      inviter_id: inviterId,
      invitee_id: inviteeId,
      message: message || "You have been invited to join our team!",
      created_at: new Date(),
      status: INVITATION_STATUSES.PENDING,
    });

    return invitation;
  } catch (error) {
    throw new Error(`Failed to create invitation: ${error.message}`);
  }
};

/**
 * Get invitation by ID
 * @param {String} invitationId - Invitation ID
 * @returns {Object} Invitation
 */
export const getInvitationById = async (invitationId) => {
  try {
    const invitation = await TeamInvitations.findOne({ id: invitationId });
    if (!invitation) {
      throw new Error("Invitation not found");
    }
    return invitation;
  } catch (error) {
    throw new Error(`Failed to get invitation: ${error.message}`);
  }
};

/**
 * Get all invitations for a team
 * @param {String} teamId - Team ID
 * @param {String} requesterId - User ID of the requester (must be team member)
 * @returns {Array} Invitations
 */
export const getTeamInvitations = async (teamId, requesterId) => {
  try {
    // Check if team exists
    const team = await Teams.findOne({ id: teamId });
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if requester is a team member
    const requesterMember = await TeamMembers.findOne({
      team_id: teamId,
      user_id: requesterId,
      status: MEMBER_STATUSES.ACTIVE,
    });

    if (!requesterMember) {
      throw new Error("Only team members can view team invitations");
    }

    // Get invitations
    const invitations = await TeamInvitations.find({ team_id: teamId });
    return invitations;
  } catch (error) {
    throw new Error(`Failed to get team invitations: ${error.message}`);
  }
};

/**
 * Get all invitations for a user
 * @param {String} userId - User ID
 * @returns {Array} Invitations
 */
export const getUserInvitations = async (userId) => {
  try {
    const invitations = await TeamInvitations.find({
      invitee_id: userId,
      status: INVITATION_STATUSES.PENDING,
    });
    return invitations;
  } catch (error) {
    throw new Error(`Failed to get user invitations: ${error.message}`);
  }
};

/**
 * Accept a team invitation
 * @param {String} invitationId - Invitation ID
 * @param {String} userId - User ID of the invitee
 * @returns {Object} Created team member
 */
export const acceptInvitation = async (invitationId, userId) => {
  try {
    // Get invitation
    const invitation = await TeamInvitations.findOne({ id: invitationId });
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Check if user is the invitee
    if (invitation.invitee_id !== userId) {
      throw new Error("Only the invited user can accept this invitation");
    }

    // Check if invitation is pending
    if (invitation.status !== INVITATION_STATUSES.PENDING) {
      throw new Error(`Invitation is already ${invitation.status}`);
    }

    // Check if team exists
    const team = await Teams.findOne({ id: invitation.team_id });
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if team is at max capacity
    const activeMembers = await TeamMembers.countDocuments({
      team_id: invitation.team_id,
      status: MEMBER_STATUSES.ACTIVE,
    });

    if (activeMembers >= team.max_members) {
      // Update invitation status to expired
      await TeamInvitations.findOneAndUpdate(
        { id: invitationId },
        { status: INVITATION_STATUSES.EXPIRED },
        { new: true }
      );

      throw new Error("Team has reached maximum member capacity");
    }

    // Check if user is already a team member
    const existingMember = await TeamMembers.findOne({
      team_id: invitation.team_id,
      user_id: userId,
    });

    if (existingMember && existingMember.status === MEMBER_STATUSES.ACTIVE) {
      throw new Error("User is already a team member");
    }

    // If user was previously a member but left/removed, update their status
    if (existingMember) {
      const updatedMember = await TeamMembers.findOneAndUpdate(
        { team_id: invitation.team_id, user_id: userId },
        { status: MEMBER_STATUSES.ACTIVE, joined_at: new Date() },
        { new: true }
      );

      // Update invitation status
      await TeamInvitations.findOneAndUpdate(
        { id: invitationId },
        { status: INVITATION_STATUSES.ACCEPTED },
        { new: true }
      );

      return updatedMember;
    }

    // Create new team member
    const teamMember = await TeamMembers.create({
      id: uuidv4(),
      team_id: invitation.team_id,
      user_id: userId,
      role: TEAM_ROLES.MEMBER,
      joined_at: new Date(),
      status: MEMBER_STATUSES.ACTIVE,
    });

    // Update invitation status
    await TeamInvitations.findOneAndUpdate(
      { id: invitationId },
      { status: INVITATION_STATUSES.ACCEPTED },
      { new: true }
    );

    return teamMember;
  } catch (error) {
    throw new Error(`Failed to accept invitation: ${error.message}`);
  }
};

/**
 * Reject a team invitation
 * @param {String} invitationId - Invitation ID
 * @param {String} userId - User ID of the invitee
 * @returns {Object} Updated invitation
 */
export const rejectInvitation = async (invitationId, userId) => {
  try {
    // Get invitation
    const invitation = await TeamInvitations.findOne({ id: invitationId });
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Check if user is the invitee
    if (invitation.invitee_id !== userId) {
      throw new Error("Only the invited user can reject this invitation");
    }

    // Check if invitation is pending
    if (invitation.status !== INVITATION_STATUSES.PENDING) {
      throw new Error(`Invitation is already ${invitation.status}`);
    }

    // Update invitation status
    const updatedInvitation = await TeamInvitations.findOneAndUpdate(
      { id: invitationId },
      { status: INVITATION_STATUSES.REJECTED },
      { new: true }
    );

    return updatedInvitation;
  } catch (error) {
    throw new Error(`Failed to reject invitation: ${error.message}`);
  }
};

/**
 * Cancel a team invitation
 * @param {String} invitationId - Invitation ID
 * @param {String} userId - User ID of the requester (must be inviter or team leader)
 * @returns {Object} Updated invitation
 */
export const cancelInvitation = async (invitationId, userId) => {
  try {
    // Get invitation
    const invitation = await TeamInvitations.findOne({ id: invitationId });
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    // Get team
    const team = await Teams.findOne({ id: invitation.team_id });
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if user is the inviter or team leader
    if (invitation.inviter_id !== userId && team.leader_id !== userId) {
      throw new Error(
        "Only the inviter or team leader can cancel this invitation"
      );
    }

    // Check if invitation is pending
    if (invitation.status !== INVITATION_STATUSES.PENDING) {
      throw new Error(`Invitation is already ${invitation.status}`);
    }

    // Update invitation status
    const updatedInvitation = await TeamInvitations.findOneAndUpdate(
      { id: invitationId },
      { status: INVITATION_STATUSES.CANCELLED },
      { new: true }
    );

    return updatedInvitation;
  } catch (error) {
    throw new Error(`Failed to cancel invitation: ${error.message}`);
  }
};
