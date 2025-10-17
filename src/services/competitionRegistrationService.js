import CompetitionParticipants, {
  PARTICIPANT_STATUSES,
  PAYMENT_STATUSES,
  SUBMISSION_STATUSES,
} from "../models/competitionParticipants.js";
import Competitions from "../models/competitions.js";
import Teams from "../models/teams.js";
import TeamMembers, { MEMBER_STATUSES } from "../models/teamMembers.js";
import { v4 as uuidv4 } from "uuid";
import CalendarEvents, { EVENT_TYPES } from "../models/calendarEvents.js";

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

    // Individual user registration (no team)
    if (userId && !teamId) {
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

      // Create new participant record for individual user
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

      // Auto-create a calendar event for the competition for this user if not exists
      const existingEvent = await CalendarEvents.findOne({
        user_id: userId,
        competition_id: competitionId,
        type: EVENT_TYPES.COMPETITION,
      }).lean();
      if (!existingEvent) {
        await CalendarEvents.create({
          id: uuidv4(),
          user_id: userId,
          competition_id: competitionId,
          title: competition.title,
          start_date: competition.start_date,
          end_date: competition.end_date,
          type: EVENT_TYPES.COMPETITION,
          description: competition.description || "",
          location: competition.location || "",
        });
      }

      // Update competition participants count
      await Competitions.updateOne(
        { id: competitionId },
        { $inc: { participants_count: 1 } }
      );

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

      // Update competition participants count with the number of team members
      await Competitions.updateOne(
        { id: competitionId },
        { $inc: { participants_count: savedParticipants.length } }
      );

      // Auto-create calendar events for each team member (idempotent)
      const bulkCalendarOps = participants.map((p) => ({
        updateOne: {
          filter: {
            user_id: p.user_id,
            competition_id: competitionId,
            type: EVENT_TYPES.COMPETITION,
          },
          update: {
            $setOnInsert: {
              id: uuidv4(),
              user_id: p.user_id,
              competition_id: competitionId,
              title: competition.title,
              start_date: competition.start_date,
              end_date: competition.end_date,
              type: EVENT_TYPES.COMPETITION,
              description: competition.description || "",
              location: competition.location || "",
            },
          },
          upsert: true,
        },
      }));
      if (bulkCalendarOps.length > 0) {
        await CalendarEvents.bulkWrite(bulkCalendarOps);
      }

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
    // Lấy thời gian hiện tại theo múi giờ Việt Nam
    const now = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
    );
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Get all participant records for the user
    const participantRecords = await CompetitionParticipants.find({
      user_id: userId,
    });

    if (participantRecords.length === 0) {
      return {
        success: true,
        data: [],
        message: "No competitions found for this user",
        upcomingDeadlines: {
          count: 0,
          message: "Không có deadline nào trong 7 ngày tới",
          note: "Bạn có thể yên tâm tập trung vào các cuộc thi hiện tại",
        },
        monthlyStats: {
          totalCompetitions: 0,
          upcomingDeadlines: 0,
          registered: 0,
          interested: 0,
          online: 0,
        },
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

    // Tìm các deadline sắp tới trong 7 ngày tới
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);

    const upcomingDeadlines = competitions.filter((comp) => {
      const deadline = new Date(comp.registration_deadline);
      return deadline > now && deadline <= nextWeek;
    });

    // Thống kê tháng hiện tại
    const thisMonthCompetitions = competitions.filter((comp) => {
      const startDate = new Date(comp.start_date);
      return (
        startDate.getMonth() === currentMonth &&
        startDate.getFullYear() === currentYear
      );
    });

    const thisMonthDeadlines = competitions.filter((comp) => {
      const deadline = new Date(comp.registration_deadline);
      return (
        deadline.getMonth() === currentMonth &&
        deadline.getFullYear() === currentYear
      );
    });

    const registeredCompetitions = participantRecords.filter(
      (p) => p.status === PARTICIPANT_STATUSES.REGISTERED
    ).length;

    const interestedCompetitions = participantRecords.filter(
      (p) => p.status === "INTERESTED" // Giả sử có trạng thái này, điều chỉnh nếu cần
    ).length;

    const onlineCompetitions = competitions.filter(
      (comp) => !comp.location || comp.location.toLowerCase().includes("online")
    ).length;

    return {
      success: true,
      data: participatedCompetitions,
      totalCompetitions: participatedCompetitions.length,
      upcomingDeadlines: {
        count: upcomingDeadlines.length,
        message:
          upcomingDeadlines.length > 0
            ? `${upcomingDeadlines.length} cuộc thi có deadline trong 7 ngày tới`
            : "Không có deadline nào trong 7 ngày tới",
        note:
          upcomingDeadlines.length > 0
            ? "Hãy chuẩn bị kỹ càng cho các cuộc thi sắp tới"
            : "Bạn có thể yên tâm tập trung vào các cuộc thi hiện tại",
        competitions: upcomingDeadlines.map((c) => ({
          id: c.id,
          title: c.title,
          deadline: c.registration_deadline,
        })),
      },
      monthlyStats: {
        totalCompetitions: thisMonthCompetitions.length,
        upcomingDeadlines: thisMonthDeadlines.length,
        registered: registeredCompetitions,
        interested: interestedCompetitions,
        online: onlineCompetitions,
      },
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
