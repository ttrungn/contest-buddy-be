import mongoose from "mongoose";

const CompetitionSettingsSchema = new mongoose.Schema({
  management_id: {
    type: String,
    required: true,
    ref: "competition_management",
  },
  allow_late_registration: {
    type: Boolean,
    default: false,
  },
  auto_approve_registrations: {
    type: Boolean,
    default: false,
  },
  max_participants: {
    type: Number,
  },
  email_notifications: {
    type: Boolean,
    default: true,
  },
  public_leaderboard: {
    type: Boolean,
    default: true,
  },
  allow_team_registration: {
    type: Boolean,
    default: true,
  },
  max_team_size: {
    type: Number,
  },
});

// Set management_id as the primary key
CompetitionSettingsSchema.index({ management_id: 1 }, { unique: true });

export default mongoose.model(
  "competition_settings",
  CompetitionSettingsSchema
);
