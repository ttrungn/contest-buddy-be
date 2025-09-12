import mongoose from "mongoose";

// Define management statuses
export const MANAGEMENT_STATUSES = {
  PLANNING: "planning",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ARCHIVED: "archived",
};

const CompetitionManagementSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  competition_id: {
    type: String,
    required: true,
    ref: "competitions",
  },
  organizer_id: {
    type: String,
    required: true,
    ref: "organizers",
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(MANAGEMENT_STATUSES),
  },
  created_at: {
    type: Date,
    required: true,
  },
  updated_at: {
    type: Date,
    required: true,
  },
});

export default mongoose.model(
  "competition_management",
  CompetitionManagementSchema
);
