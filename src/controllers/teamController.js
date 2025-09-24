import {
  createTeam,
  getTeamById,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  removeTeamMember,
  getUserTeams,
  changeTeamMemberRole,
} from "../services/teamService.js";

/**
 * Handle create team request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleCreateTeam = async (req, res) => {
  try {
    const userId = req.user.id;
    const teamData = req.body;

    // Validate required fields
    if (!teamData.name || !teamData.description) {
      return res.status(400).json({
        success: false,
        message: "Team name and description are required",
      });
    }

    const team = await createTeam(teamData, userId);

    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: team,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Handle get team by ID request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleGetTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await getTeamById(teamId);

    return res.status(200).json({
      success: true,
      data: team,
    });
  } catch (error) {
    return res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Handle update team request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleUpdateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;
    const teamData = req.body;

    const updatedTeam = await updateTeam(teamId, teamData, userId);

    return res.status(200).json({
      success: true,
      message: "Team updated successfully",
      data: updatedTeam,
    });
  } catch (error) {
    return res
      .status(
        error.message.includes("not found")
          ? 404
          : error.message.includes("Only team leader")
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
 * Handle delete team request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleDeleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    await deleteTeam(teamId, userId);

    return res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    return res
      .status(
        error.message.includes("not found")
          ? 404
          : error.message.includes("Only team leader")
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
 * Handle get team members request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleGetTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;

    const members = await getTeamMembers(teamId);

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    return res.status(error.message.includes("not found") ? 404 : 500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Handle remove team member request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleRemoveTeamMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const requesterId = req.user.id;

    await removeTeamMember(teamId, memberId, requesterId);

    return res.status(200).json({
      success: true,
      message: "Team member removed successfully",
    });
  } catch (error) {
    return res
      .status(
        error.message.includes("not found")
          ? 404
          : error.message.includes("Only team leader")
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
 * Handle get user teams request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleGetUserTeams = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const teams = await getUserTeams(userId);

    return res.status(200).json({
      success: true,
      data: teams,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Handle change team member role request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleChangeTeamMemberRole = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const { role } = req.body;
    const requesterId = req.user.id;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    const updatedMember = await changeTeamMemberRole(
      teamId,
      memberId,
      role,
      requesterId
    );

    return res.status(200).json({
      success: true,
      message: "Team member role updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    return res
      .status(
        error.message.includes("not found")
          ? 404
          : error.message.includes("Only team leader")
          ? 403
          : 500
      )
      .json({
        success: false,
        message: error.message,
      });
  }
};
