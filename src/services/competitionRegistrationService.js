import CompetitionParticipants, {
  PARTICIPANT_STATUSES,
  PAYMENT_STATUSES,
  SUBMISSION_STATUSES,
} from "../models/competitionParticipants.js";
import Competitions from "../models/competitions.js";
import Teams from "../models/teams.js";
import TeamMembers, { MEMBER_STATUSES } from "../models/teamMembers.js";
import { v4 as uuidv4 } from "uuid";

// Register for competition
const registerForCompetition = async (competitionId, registrationData) => {
  try {
    const { userId, teamId } = registrationData;

    // Validate that either userId or teamId is provided, but not both
    if (!userId && !teamId) {
      return {
        success: false,
        message: "userId hoặc teamId phải được cung cấp",
      };
    }

    if (userId && teamId) {
      return {
        success: false,
        message: "Không thể đăng ký với cả userId và teamId",
      };
    }

    // Verify competition exists
    const competition = await Competitions.findOne({
      id: competitionId,
    });
    if (!competition) {
      return {
        success: false,
        message: "Không tìm thấy cuộc thi",
      };
    }

    // Individual registration
    if (userId) {
      // Check if user is already registered for this competition
      const existingParticipant = await CompetitionParticipants.findOne({
        competition_id: competitionId,
        user_id: userId,
      });

      if (existingParticipant) {
        return {
          success: false,
          message: "Người dùng đã đăng ký tham gia cuộc thi này",
        };
      }

      // Create new participant record
      const participant = new CompetitionParticipants({
        id: uuidv4(),
        competition_id: competitionId,
        user_id: userId,
        team_id: null,
        registration_date: new Date(),
        status: PARTICIPANT_STATUSES.REGISTERED,
        payment_status: PAYMENT_STATUSES.NOT_REQUIRED,
        submission_status: SUBMISSION_STATUSES.NOT_STARTED,
      });

      await participant.save();

      return {
        success: true,
        message: `Đăng ký tham gia cuộc thi ${competition.name} thành công`,
        data: {
          participantId: participant.id,
          userId: userId,
          teamId: null,
          registrationDate: participant.registration_date,
          status: participant.status,
        },
      };
    }

    // Team registration
    if (teamId) {
      // Verify team exists
      const team = await Teams.findOne({ id: teamId });
      if (!team) {
        return {
          success: false,
          message: "Không tìm thấy nhóm",
        };
      }

      // Get all active team members
      const teamMembers = await TeamMembers.find({
        team_id: teamId,
        status: MEMBER_STATUSES.ACTIVE,
      });

      if (teamMembers.length === 0) {
        return {
          success: false,
          message: "Không có thành viên nào trong nhóm",
        };
      }

      if (teamMembers.length > competition.maxParticipantsPerTeam) {
        return {
          success: false,
          message: `Số lượng thành viên trong nhóm (${competition.maxParticipantsPerTeam}) vượt quá giới hạn cho phép`,
        };
      }

      // Check if any team member is already registered for this competition
      const memberIds = teamMembers.map((member) => member.user_id);
      const existingParticipants = await CompetitionParticipants.find({
        competition_id: competitionId,
        user_id: { $in: memberIds },
      });

      if (existingParticipants.length > 0) {
        const conflictingUsers = existingParticipants.map((p) => p.user_id);
        return {
          success: false,
          message: `Có thành viên trong nhóm đã đăng ký tham gia cuộc thi này`,
          conflictingUsers: conflictingUsers,
        };
      }

      // Register all team members
      const participants = teamMembers.map((member) => ({
        id: uuidv4(),
        competition_id: competitionId,
        user_id: member.user_id,
        team_id: teamId,
        registration_date: new Date(),
        status: PARTICIPANT_STATUSES.REGISTERED,
        payment_status: PAYMENT_STATUSES.NOT_REQUIRED,
        submission_status: SUBMISSION_STATUSES.NOT_STARTED,
      }));

      const savedParticipants = await CompetitionParticipants.insertMany(
        participants
      );

      return {
        success: true,
        message: `Đăng ký thành công ${teamMembers.length} thành viên trong nhóm cho cuộc thi`,
        data: {
          teamId: teamId,
          teamName: team.name,
          registeredMembers: savedParticipants.length,
          memberDetails: savedParticipants.map((p) => ({
            participantId: p.id,
            userId: p.user_id,
            registrationDate: p.registration_date,
            status: p.status,
          })),
        },
      };
    }
  } catch (error) {
    console.error("Lỗi đăng ký cuộc thi:", error);
    return {
      success: false,
      message: "Đăng ký tham gia cuộc thi không thành công",
      error: error.message,
    };
  }
};

// Check if participant is registered for competition
const checkParticipantRegistration = async (competitionId, participantData) => {
  try {
    const { userId } = participantData;

    // Validate that userId is provided
    if (!userId) {
      return {
        success: false,
        message: "userId must be provided",
      };
    }

    // Verify competition exists
    const competition = await Competitions.findOne({
      id: competitionId,
    });
    if (!competition) {
      return {
        success: false,
        message: "Competition not found",
      };
    }

    // Check individual registration
    const existingParticipant = await CompetitionParticipants.findOne({
      competition_id: competitionId,
      user_id: userId,
    });

    return {
      success: true,
      isRegistered: !!existingParticipant,
      registrationType: "individual",
      data: existingParticipant
        ? {
            participantId: existingParticipant.id,
            registrationDate: existingParticipant.registration_date,
            status: existingParticipant.status,
            teamId: existingParticipant.team_id,
          }
        : null,
    };
  } catch (error) {
    console.error("Check participant registration error:", error);
    return {
      success: false,
      message: "Failed to check participant registration",
      error: error.message,
    };
  }
};

// Get all competitions that user has participated in
const getUserParticipatedCompetitions = async (userId) => {
  try {
    // Get all participant records for the user
    const participantRecords = await CompetitionParticipants.find({
      user_id: userId,
    });

    if (participantRecords.length === 0) {
      return {
        success: true,
        data: [],
        message: "No competitions found for this user",
      };
    }

    // Get unique competition IDs
    const competitionIds = [
      ...new Set(participantRecords.map((p) => p.competition_id)),
    ];

    // Get competition details
    const competitions = await Competitions.find({
      id: { $in: competitionIds },
    });

    // Combine competition data with participation details
    const participatedCompetitions = competitions.map((competition) => {
      const participationRecords = participantRecords.filter(
        (p) => p.competition_id === competition.id
      );

      // Get the latest participation record (in case of multiple registrations)
      const latestParticipation = participationRecords.reduce(
        (latest, current) => {
          return new Date(current.registration_date) >
            new Date(latest.registration_date)
            ? current
            : latest;
        }
      );

      return {
        competition: {
          id: competition.id,
          title: competition.title,
          description: competition.description,
          category: competition.category,
          level: competition.level,
          start_date: competition.start_date,
          end_date: competition.end_date,
          registration_deadline: competition.registration_deadline,
          location: competition.location,
          prize_pool_text: competition.prize_pool_text,
          participants_count: competition.participants_count,
          max_participants: competition.max_participants,
          image_url: competition.image_url,
          status: competition.status,
          featured: competition.featured,
        },
        participation: {
          participantId: latestParticipation.id,
          registrationDate: latestParticipation.registration_date,
          status: latestParticipation.status,
          paymentStatus: latestParticipation.payment_status,
          submissionStatus: latestParticipation.submission_status,
          teamId: latestParticipation.team_id,
          score: latestParticipation.score,
          rank: latestParticipation.rank,
        },
      };
    });

    // Sort by registration date (newest first)
    participatedCompetitions.sort(
      (a, b) =>
        new Date(b.participation.registrationDate) -
        new Date(a.participation.registrationDate)
    );

    return {
      success: true,
      data: participatedCompetitions,
      totalCompetitions: participatedCompetitions.length,
    };
  } catch (error) {
    console.error("Get user participated competitions error:", error);
    return {
      success: false,
      message: "Failed to get user participated competitions",
      error: error.message,
    };
  }
};

export {
  registerForCompetition,
  checkParticipantRegistration,
  getUserParticipatedCompetitions,
};
