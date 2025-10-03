import { v4 as uuidv4 } from "uuid";
import Teams, { TEAM_STATUSES } from "../models/teams.js";
import TeamMembers, {
  TEAM_ROLES,
  MEMBER_STATUSES,
} from "../models/teamMembers.js";

/**
 * Create a new team
 * @param {Object} teamData - Team data
 * @param {String} userId - User ID of the team leader
 * @returns {Object} Created team
 */
export const createTeam = async (teamData, userId) => {
  try {
    const teamId = uuidv4();
    const now = new Date();

    // Create the team
    const team = await Teams.create({
      id: teamId,
      name: teamData.name,
      description: teamData.description,
      avatar_url: teamData.avatar_url || null,
      leader_id: userId,
      competition_id: teamData.competition_id || null,
      max_members: teamData.max_members || 5,
      created_at: now,
      updated_at: now,
      status: TEAM_STATUSES.ACTIVE,
    });

    // Add the creator as a team member with leader role
    const teamMemberId = uuidv4();
    await TeamMembers.create({
      id: teamMemberId,
      team_id: teamId,
      user_id: userId,
      role: TEAM_ROLES.LEADER,
      joined_at: now,
      status: MEMBER_STATUSES.ACTIVE,
    });

    return team;
  } catch (error) {
    throw new Error(`Failed to create team: ${error.message}`);
  }
};

/**
 * Get team by ID
 * @param {String} teamId - Team ID
 * @returns {Object} Team
 */
export const getTeamById = async (teamId) => {
  try {
    const team = await Teams.findOne({ id: teamId });
    if (!team) {
      throw new Error("Team not found");
    }
    return team;
  } catch (error) {
    throw new Error(`Failed to get team: ${error.message}`);
  }
};

/**
 * Update team information
 * @param {String} teamId - Team ID
 * @param {Object} teamData - Team data to update
 * @param {String} userId - User ID of the requester (must be team leader)
 * @returns {Object} Updated team
 */
export const updateTeam = async (teamId, teamData, userId) => {
  try {
    // Check if team exists
    const team = await Teams.findOne({ id: teamId });
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if user is the team leader
    if (team.leader_id !== userId) {
      throw new Error("Only team leader can update team information");
    }

    // Update team
    const updatedTeam = await Teams.findOneAndUpdate(
      { id: teamId },
      {
        ...teamData,
        updated_at: new Date(),
      },
      { new: true }
    );

    return updatedTeam;
  } catch (error) {
    throw new Error(`Failed to update team: ${error.message}`);
  }
};

/**
 * Delete a team
 * @param {String} teamId - Team ID
 * @param {String} userId - User ID of the requester (must be team leader)
 * @returns {Boolean} Success status
 */
export const deleteTeam = async (teamId, userId) => {
  try {
    // Check if team exists
    const team = await Teams.findOne({ id: teamId });
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if user is the team leader
    if (team.leader_id !== userId) {
      throw new Error("Only team leader can delete the team");
    }

    // Delete team members first
    await TeamMembers.deleteMany({ team_id: teamId });

    // Delete team
    await Teams.deleteOne({ id: teamId });

    return true;
  } catch (error) {
    throw new Error(`Failed to delete team: ${error.message}`);
  }
};

/**
 * Get all members of a team
 * @param {String} teamId - Team ID
 * @returns {Array} Team members
 */
export const getTeamMembers = async (teamId) => {
  try {
    // Check if team exists
    const team = await Teams.findOne({ id: teamId });
    if (!team) {
      throw new Error("Team not found");
    }

    // Get team members
    const members = await TeamMembers.find({ team_id: teamId }).populate({
      path: "user_id",
      model: "User",
      localField: "user_id",
      foreignField: "id",
      justOne: true,
    });

    // Transform the response to use 'user' instead of 'user_id'
    const transformedMembers = members.map((member) => {
      const memberObj = member.toObject();
      memberObj.user = memberObj.user_id;
      delete memberObj.user_id;
      return memberObj;
    });

    return transformedMembers;
  } catch (error) {
    throw new Error(`Failed to get team members: ${error.message}`);
  }
};

/**
 * Remove a member from a team
 * @param {String} teamId - Team ID
 * @param {String} memberId - Member ID to remove
 * @param {String} requesterId - User ID of the requester (must be team leader or the member themselves)
 * @returns {Boolean} Success status
 */
export const removeTeamMember = async (teamId, memberId, requesterId) => {
  try {
    // Check if team exists
    const team = await Teams.findOne({ id: teamId });
    if (!team) {
      throw new Error("Team not found");
    }

    // Get the member to remove
    const member = await TeamMembers.findOne({
      team_id: teamId,
      user_id: memberId,
    });
    if (!member) {
      throw new Error("Team member not found");
    }

    // Check if requester is the team leader or the member themselves
    if (team.leader_id !== requesterId && memberId !== requesterId) {
      throw new Error(
        "Only team leader or the member themselves can remove a member"
      );
    }

    // If the member is the leader, they can't be removed
    if (member.role === TEAM_ROLES.LEADER) {
      throw new Error("Team leader cannot be removed from the team");
    }

    // Update member status to REMOVED or LEFT based on who initiated the action
    const newStatus =
      requesterId === memberId ? MEMBER_STATUSES.LEFT : MEMBER_STATUSES.REMOVED;

    await TeamMembers.findOneAndUpdate(
      { team_id: teamId, user_id: memberId },
      { status: newStatus },
      { new: true }
    );

    return true;
  } catch (error) {
    throw new Error(`Failed to remove team member: ${error.message}`);
  }
};

/**
 * Get all teams where user is a member
 * @param {String} userId - User ID
 * @returns {Array} Teams
 */
export const getUserTeams = async (userId) => {
  try {
    // Get all team IDs where user is a member
    const teamMemberships = await TeamMembers.find({
      user_id: userId,
      status: MEMBER_STATUSES.ACTIVE,
    });

    const teamIds = teamMemberships.map((membership) => membership.team_id);

    // Get all teams
    const teams = await Teams.find({ id: { $in: teamIds } });

    return teams;
  } catch (error) {
    throw new Error(`Failed to get user teams: ${error.message}`);
  }
};

/**
 * Change member role in a team
 * @param {String} teamId - Team ID
 * @param {String} memberId - Member ID to change role
 * @param {String} newRole - New role
 * @param {String} requesterId - User ID of the requester (must be team leader)
 * @returns {Object} Updated member
 */
export const changeTeamMemberRole = async (
  teamId,
  memberId,
  newRole,
  requesterId
) => {
  try {
    // Check if team exists
    const team = await Teams.findOne({ id: teamId });
    if (!team) {
      throw new Error("Team not found");
    }

    // Check if requester is the team leader
    if (team.leader_id !== requesterId) {
      throw new Error("Only team leader can change member roles");
    }

    // Check if new role is valid
    if (!Object.values(TEAM_ROLES).includes(newRole)) {
      throw new Error("Invalid role");
    }

    // Get the member
    const member = await TeamMembers.findOne({
      team_id: teamId,
      user_id: memberId,
    });
    if (!member) {
      throw new Error("Team member not found");
    }

    // If changing to leader, update the current leader first
    if (newRole === TEAM_ROLES.LEADER) {
      // Update current leader to member
      await TeamMembers.findOneAndUpdate(
        { team_id: teamId, user_id: team.leader_id },
        { role: TEAM_ROLES.MEMBER },
        { new: true }
      );

      // Update team leader
      await Teams.findOneAndUpdate(
        { id: teamId },
        { leader_id: memberId },
        { new: true }
      );
    }

    // Update member role
    const updatedMember = await TeamMembers.findOneAndUpdate(
      { team_id: teamId, user_id: memberId },
      { role: newRole },
      { new: true }
    );

    return updatedMember;
  } catch (error) {
    throw new Error(`Failed to change team member role: ${error.message}`);
  }
};
