import mongoose from "mongoose";

// Define team statuses
export const TEAM_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  COMPLETED: "completed",
  DISQUALIFIED: "disqualified",
};

const TeamsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  avatar_url: {
    type: String,
  },
  leader_id: {
    type: String,
    required: true,
    ref: "users",
  },
  competition_id: {
    type: String,
    ref: "competitions",
  },
  max_members: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    required: true,
  },
  updated_at: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(TEAM_STATUSES),
  },
});

export default mongoose.model("teams", TeamsSchema);
