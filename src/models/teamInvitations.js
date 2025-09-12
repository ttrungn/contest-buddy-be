import mongoose from "mongoose";

// Define invitation statuses
export const INVITATION_STATUSES = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
};

const TeamInvitationsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  team_id: {
    type: String,
    required: true,
    ref: "teams",
  },
  inviter_id: {
    type: String,
    required: true,
    ref: "users",
  },
  invitee_id: {
    type: String,
    required: true,
    ref: "users",
  },
  message: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(INVITATION_STATUSES),
  },
});

export default mongoose.model("team_invitations", TeamInvitationsSchema);
