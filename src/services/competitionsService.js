import Competitions, {
  COMPETITION_CATEGORIES,
  COMPETITION_LEVELS,
  COMPETITION_PAYING_STATUSES,
  COMPETITION_STATUSES,
} from "../models/competitions.js";
import CompetitionTags from "../models/competitionTags.js";
import CompetitionRequiredSkills from "../models/competitionRequiredSkills.js";
import CompetitionParticipants from "../models/competitionParticipants.js";
import db from "../models/index.js";
import { v4 as uuidv4 } from "uuid";

// Create a new competition
export const createCompetition = async (competitionData, userId) => {
  try {
    // Extract competitionRequiredSkills and competitionTags from competitionData
    const {
      competitionRequiredSkills = [],
      competitionTags = [],
      ...mainCompetitionData
    } = competitionData;

    if (
      mainCompetitionData.maxParticipantsPerTeam &&
      !mainCompetitionData.isRegisteredAsTeam
    ) {
      throw new Error(
        "maxParticipantsPerTeam can only be set if isRegisteredAsTeam is true"
      );
    }

    if (
      mainCompetitionData.isRegisteredAsTeam &&
      (!mainCompetitionData.maxParticipantsPerTeam ||
        mainCompetitionData.maxParticipantsPerTeam < 1)
    ) {
      throw new Error(
        "maxParticipantsPerTeam must be at least 1 when isRegisteredAsTeam is true"
      );
    }

    // Generate unique ID if not provided
    if (!mainCompetitionData.id) {
      mainCompetitionData.id = uuidv4();
    }

    // Validate and set organizer_id from userId
    if (!userId) {
      throw new Error("User ID is required to create competition");
    }

    // Check if user exists and is an organizer
    if (!db.User || !db.Organizers) {
      throw new Error("Required models not available");
    }

    const user = await db.User.findOne({ id: userId });
    if (!user) {
      throw new Error("User not found");
    }

    const organizer = await db.Organizers.findOne({ owner_user_id: userId });
    if (!organizer) {
      throw new Error("User is not registered as an organizer");
    }

    // Set organizer_id from the found organizer
    mainCompetitionData.organizer_id = organizer.id;

    // Remove organizer_id from client data if it exists (security measure)
    delete mainCompetitionData.organizer_id_from_client;

    // Validate plan_id if provided
    if (mainCompetitionData.plan_id) {
      if (!db.Plans) {
        throw new Error("Plans model not available");
      }

      const plan = await db.Plans.findOne({ id: mainCompetitionData.plan_id });
      if (!plan) {
        throw new Error(
          `Plan with ID '${mainCompetitionData.plan_id}' not found`
        );
      }

      // Check if plan is active
      if (plan.status !== "active") {
        throw new Error(
          `Plan with ID '${mainCompetitionData.plan_id}' is not active`
        );
      }
    }

    // Set default values
    mainCompetitionData.participants_count =
      mainCompetitionData.participants_count || 0;
    mainCompetitionData.featured = mainCompetitionData.featured || false;

    const competition = new Competitions(mainCompetitionData);
    await competition.save();

    // Save competition tags
    if (competitionTags && competitionTags.length > 0) {
      const tagsToInsert = competitionTags.map((tag) => ({
        competition_id: competition.id,
        tag: tag.trim(),
      }));
      await CompetitionTags.insertMany(tagsToInsert);
    }

    // Save competition required skills
    if (competitionRequiredSkills && competitionRequiredSkills.length > 0) {
      const skillsToInsert = competitionRequiredSkills.map((skill) => ({
        competition_id: competition.id,
        name: skill.name,
        category: skill.category,
      }));
      await CompetitionRequiredSkills.insertMany(skillsToInsert);
    }

    // Return competition with tags and required skills populated
    const result = competition.toObject();
    result.competitionTags = competitionTags;
    result.competitionRequiredSkills = competitionRequiredSkills;

    return result;
  } catch (error) {
    throw new Error(`Failed to create competition: ${error.message}`);
  }
};

// Get competition by ID
export const getCompetitionById = async (competitionId) => {
  try {
    const competition = await Competitions.findOne({
      id: competitionId,
      isDeleted: false,
    });

    if (!competition) {
      return null;
    }

    // Manually populate plan and organizer data
    let planData = null;
    let organizerData = null;

    if (competition.plan_id && db.Plans) {
      planData = await db.Plans.findOne(
        { id: competition.plan_id },
        { name: 1, price_amount: 1, currency: 1, status: 1 }
      );
    }

    if (competition.organizer_id && db.Organizers) {
      organizerData = await db.Organizers.findOne(
        { id: competition.organizer_id },
        { organization_name: 1, email: 1, website: 1 }
      );
    }

    // Get competition tags
    const competitionTags = await CompetitionTags.find(
      { competition_id: competitionId },
      { tag: 1, _id: 0 }
    );

    // Get competition required skills
    const competitionRequiredSkills = await CompetitionRequiredSkills.find(
      { competition_id: competitionId },
      { name: 1, category: 1, _id: 0 }
    );

    // Convert to plain object and add populated data
    const result = competition.toObject();
    if (planData) result.plan = planData;
    if (organizerData) result.organizer = organizerData;

    // Add tags and required skills
    result.competitionTags = competitionTags.map((tag) => tag.tag);
    result.competitionRequiredSkills = competitionRequiredSkills;

    return result;
  } catch (error) {
    throw new Error(`Failed to get competition: ${error.message}`);
  }
};

// Get all competitions with pagination and filters
export const getAllCompetitions = async (filters = {}, options = {}) => {
  try {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const competitions = await Competitions.find({
      ...filters,
      isDeleted: false,
    })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Competitions.countDocuments({
      ...filters,
      isDeleted: false,
    });
    const totalPages = Math.ceil(total / limit);

    // Populate tags and required skills for each competition
    const competitionsWithDetails = await Promise.all(
      competitions.map(async (competition) => {
        const competitionObj = competition.toObject();

        // Get competition tags
        const competitionTags = await CompetitionTags.find(
          { competition_id: competition.id },
          { tag: 1, _id: 0 }
        );

        // Get competition required skills
        const competitionRequiredSkills = await CompetitionRequiredSkills.find(
          { competition_id: competition.id },
          { name: 1, category: 1, _id: 0 }
        );

        // Add tags and required skills
        competitionObj.competitionTags = competitionTags.map((tag) => tag.tag);
        competitionObj.competitionRequiredSkills = competitionRequiredSkills;

        return competitionObj;
      })
    );

    return {
      data: competitionsWithDetails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get competitions: ${error.message}`);
  }
};

// Update competition
export const updateCompetition = async (competitionId, updateData, userId) => {
  try {
    // Extract competitionRequiredSkills and competitionTags from updateData
    const { competitionRequiredSkills, competitionTags, ...mainUpdateData } =
      updateData;

    // Check if competition exists first
    const existingCompetition = await Competitions.findOne({
      id: competitionId,
    });
    if (!existingCompetition) {
      throw new Error("Competition not found");
    }

    // Validate user authorization (organizer of the competition or admin)
    if (userId) {
      if (!db.User || !db.Organizers) {
        throw new Error("Required models not available");
      }

      const user = await db.User.findOne({ id: userId });
      if (!user) {
        throw new Error("User not found");
      }

      // Check if user is admin (allow all updates)
      const userRoles = await db.UserRoles.find({ user_id: userId });
      const isAdmin = userRoles.some((role) => role.role_id === 1); // Assuming role_id 1 is admin

      console.log("DEBUG - Update Competition Authorization:");
      console.log("userId:", userId);
      console.log("isAdmin:", isAdmin);
      console.log(
        "existingCompetition.organizer_id:",
        existingCompetition.organizer_id
      );

      if (!isAdmin) {
        // If not admin, check if user is the organizer of this competition
        const organizer = await db.Organizers.findOne({
          owner_user_id: userId,
        });
        console.log("organizer found:", organizer);
        console.log("organizer.id:", organizer?.id);

        if (!organizer || organizer.id !== existingCompetition.organizer_id) {
          throw new Error("Not authorized to update this competition");
        }
      }
    }

    // Remove organizer_id from update data (cannot be changed)
    delete mainUpdateData.organizer_id;

    // Validate team-related fields
    if (
      mainUpdateData.maxParticipantsPerTeam &&
      !mainUpdateData.isRegisteredAsTeam
    ) {
      throw new Error(
        "maxParticipantsPerTeam can only be set if isRegisteredAsTeam is true"
      );
    }

    if (
      mainUpdateData.isRegisteredAsTeam &&
      (!mainUpdateData.maxParticipantsPerTeam ||
        mainUpdateData.maxParticipantsPerTeam < 1)
    ) {
      throw new Error(
        "maxParticipantsPerTeam must be at least 1 when isRegisteredAsTeam is true"
      );
    }

    // Validate plan_id if being updated
    if (mainUpdateData.plan_id) {
      if (!db.Plans) {
        throw new Error("Plans model not available");
      }

      const plan = await db.Plans.findOne({ id: mainUpdateData.plan_id });
      if (!plan) {
        throw new Error(`Plan with ID '${mainUpdateData.plan_id}' not found`);
      }

      // Check if plan is active
      if (plan.status !== "active") {
        throw new Error(
          `Plan with ID '${mainUpdateData.plan_id}' is not active`
        );
      }
    }

    const competition = await Competitions.findOneAndUpdate(
      { id: competitionId },
      { $set: mainUpdateData },
      { new: true, runValidators: true }
    );

    if (!competition) {
      return null;
    }

    // Update competition tags if provided
    if (competitionTags !== undefined) {
      // Remove existing tags
      await CompetitionTags.deleteMany({ competition_id: competitionId });

      // Add new tags
      if (competitionTags && competitionTags.length > 0) {
        const tagsToInsert = competitionTags.map((tag) => ({
          competition_id: competitionId,
          tag: tag.trim(),
        }));
        await CompetitionTags.insertMany(tagsToInsert);
      }
    }

    // Update competition required skills if provided
    if (competitionRequiredSkills !== undefined) {
      // Remove existing required skills
      await CompetitionRequiredSkills.deleteMany({
        competition_id: competitionId,
      });

      // Add new required skills
      if (competitionRequiredSkills && competitionRequiredSkills.length > 0) {
        const skillsToInsert = competitionRequiredSkills.map((skill) => ({
          competition_id: competitionId,
          name: skill.name,
          category: skill.category,
        }));
        await CompetitionRequiredSkills.insertMany(skillsToInsert);
      }
    }

    // Manually populate plan and organizer data
    const result = competition.toObject();

    if (competition.plan_id && db.Plans) {
      const planData = await db.Plans.findOne(
        { id: competition.plan_id },
        { name: 1, price_amount: 1, currency: 1, status: 1 }
      );
      if (planData) result.plan = planData;
    }

    if (competition.organizer_id && db.Organizers) {
      const organizerData = await db.Organizers.findOne(
        { id: competition.organizer_id },
        { organization_name: 1, email: 1, website: 1 }
      );
      if (organizerData) result.organizer = organizerData;
    }

    // Get updated competition tags
    const updatedCompetitionTags = await CompetitionTags.find(
      { competition_id: competitionId },
      { tag: 1, _id: 0 }
    );

    // Get updated competition required skills
    const updatedCompetitionRequiredSkills =
      await CompetitionRequiredSkills.find(
        { competition_id: competitionId },
        { name: 1, category: 1, _id: 0 }
      );

    // Add tags and required skills to result
    result.competitionTags = updatedCompetitionTags.map((tag) => tag.tag);
    result.competitionRequiredSkills = updatedCompetitionRequiredSkills;

    return result;
  } catch (error) {
    throw new Error(`Failed to update competition: ${error.message}`);
  }
};

// Delete competition
export const deleteCompetition = async (competitionId) => {
  try {
    const result = await Competitions.findOneAndUpdate(
      { id: competitionId },
      { isDeleted: true },
      { new: true }
    );
    return result;
  } catch (error) {
    throw new Error(`Failed to delete competition: ${error.message}`);
  }
};

// Get competitions by category
export const getCompetitionsByCategory = async (category, options = {}) => {
  try {
    return await getAllCompetitions({ category }, options);
  } catch (error) {
    throw new Error(`Failed to get competitions by category: ${error.message}`);
  }
};

// Get competitions by status
export const getCompetitionsByStatus = async (status, options = {}) => {
  try {
    return await getAllCompetitions({ status }, options);
  } catch (error) {
    throw new Error(`Failed to get competitions by status: ${error.message}`);
  }
};

// Get featured competitions
export const getFeaturedCompetitions = async (options = {}) => {
  try {
    return await getAllCompetitions({ featured: true }, options);
  } catch (error) {
    throw new Error(`Failed to get featured competitions: ${error.message}`);
  }
};

// Get competitions by user ID (organizer competitions)
export const getCompetitionsByUserId = async (userId, options = {}) => {
  try {
    // Find the organizer record for this user
    if (!db.Organizers) {
      throw new Error("Organizers model not available");
    }

    const organizer = await db.Organizers.findOne({ owner_user_id: userId });
    if (!organizer) {
      // User is not an organizer, return empty result
      return {
        data: [],
        pagination: {
          page: parseInt(options.page || 1),
          limit: parseInt(options.limit || 10),
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    return await getAllCompetitions({ organizer_id: organizer.id }, options);
  } catch (error) {
    throw new Error(`Failed to get competitions by user: ${error.message}`);
  }
};

// Get competition participants by competition ID
export const getCompetitionParticipants = async (
  competitionId,
  options = {}
) => {
  try {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    // First, check if the competition exists
    const competition = await Competitions.findOne({ id: competitionId });
    if (!competition) {
      throw new Error("Competition not found");
    }

    // Get participants for this competition directly
    const participants = await CompetitionParticipants.find({
      competition_id: competitionId,
    })
      .sort({ registration_date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CompetitionParticipants.countDocuments({
      competition_id: competitionId,
    });
    const totalPages = Math.ceil(total / limit);

    // Populate user data for each participant
    const participantsWithUserData = await Promise.all(
      participants.map(async (participant) => {
        const participantObj = participant.toObject();

        // Get user information
        if (db.User) {
          const user = await db.User.findOne(
            { id: participant.user_id },
            {
              id: 1,
              email: 1,
              full_name: 1,
              username: 1,
              avatar_url: 1,
              bio: 1,
              city: 1,
              country: 1,
              rating: 1,
            }
          );
          if (user) {
            participantObj.user = user;
          }
        }

        return participantObj;
      })
    );

    return {
      data: participantsWithUserData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get competition participants: ${error.message}`);
  }
};

// Get competition constants (categories, levels, statuses)
export const getCompetitionConstants = async () => {
  try {
    return {
      categories: COMPETITION_CATEGORIES,
      levels: COMPETITION_LEVELS,
      statuses: COMPETITION_STATUSES,
      paying_statuses: COMPETITION_PAYING_STATUSES,
    };
  } catch (error) {
    throw new Error(`Failed to get competition constants: ${error.message}`);
  }
};
