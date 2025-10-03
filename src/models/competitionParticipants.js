import mongoose from "mongoose";

// Define participant statuses
export const PARTICIPANT_STATUSES = {
  REGISTERED: "registered",
  APPROVED: "approved",
  REJECTED: "rejected",
  WAITLISTED: "waitlisted",
  WITHDRAWN: "withdrawn",
  DISQUALIFIED: "disqualified",
  COMPLETED: "completed",
};

// Define payment statuses
export const PAYMENT_STATUSES = {
  NOT_REQUIRED: "not_required",
  PENDING: "pending",
  PAID: "paid",
  REFUNDED: "refunded",
  FAILED: "failed",
};

// Define submission statuses
export const SUBMISSION_STATUSES = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  SUBMITTED: "submitted",
  LATE: "late",
  EVALUATED: "evaluated",
  REJECTED: "rejected",
};

const CompetitionParticipantsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  competition_id: {
    type: String,
    required: true,
    ref: "competitions",
  },
  user_id: {
    type: String,
    required: true,
    ref: "users",
  },
  team_id: {
    type: String,
    ref: "teams",
  },
  registration_date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(PARTICIPANT_STATUSES),
  },
  payment_status: {
    type: String,
    required: true,
    enum: Object.values(PAYMENT_STATUSES),
  },
  submission_status: {
    type: String,
    required: true,
    enum: Object.values(SUBMISSION_STATUSES),
  },
  score: {
    type: Number,
  },
  rank: {
    type: Number,
  },
  notes: {
    type: String,
  },
});

export default mongoose.model(
  "competition_participants",
  CompetitionParticipantsSchema
);
