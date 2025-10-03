import mongoose from "mongoose";

// Define competition categories
export const COMPETITION_CATEGORIES = {
  HACKATHON: "hackathon",
  DATATHON: "datathon",
  DESIGNATHON: "designathon",
  BUSINESS_CASE: "business_case",
  CODING_CONTEST: "coding_contest",
  OTHER: "other",
};

// Define competition levels
export const COMPETITION_LEVELS = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
  ALL_LEVELS: "all_levels",
};

// Define competition statuses
export const COMPETITION_STATUSES = {
  DRAFT: "draft",
  PUBLISHED: "published",
  REGISTRATION_OPEN: "registration_open",
  REGISTRATION_CLOSED: "registration_closed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const CompetitionsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: Object.values(COMPETITION_CATEGORIES),
  },
  plan_id: {
    type: String,
    required: true,
    ref: "plans",
  },
  organizer_id: {
    type: String,
    ref: "organizers",
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  registration_deadline: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  prize_pool_text: {
    type: String,
  },
  participants_count: {
    type: Number,
    default: 0,
  },
  max_participants: {
    type: Number,
  },
  isRegisteredAsTeam: {
    type: Boolean,
    default: false,
  },
  maxParticipantsPerTeam: {
    type: Number,
    default: 1,
  },
  level: {
    type: String,
    required: true,
    enum: Object.values(COMPETITION_LEVELS),
  },
  image_url: {
    type: String,
  },
  website: {
    type: String,
  },
  rules: {
    type: String,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(COMPETITION_STATUSES),
  },
});

export default mongoose.model("competitions", CompetitionsSchema);
