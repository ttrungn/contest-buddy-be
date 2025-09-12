import mongoose from "mongoose";

// Define team roles
export const TEAM_ROLES = {
  LEADER: "leader",
  MEMBER: "member",
};

// Define member statuses
export const MEMBER_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  LEFT: "left",
  REMOVED: "removed",
};

const TeamMembersSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  team_id: {
    type: String,
    required: true,
    ref: "teams",
  },
  user_id: {
    type: String,
    required: true,
    ref: "users",
  },
  role: {
    type: String,
    required: true,
    enum: Object.values(TEAM_ROLES),
  },
  joined_at: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(MEMBER_STATUSES),
  },
});

export default mongoose.model("team_members", TeamMembersSchema);
