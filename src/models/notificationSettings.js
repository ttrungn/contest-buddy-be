import mongoose from "mongoose";

// Define reminder timing options
export const REMINDER_TIMINGS = {
  ONE_HOUR: "1-hour",
  THREE_HOURS: "3-hours",
  ONE_DAY: "1-day",
  THREE_DAYS: "3-days",
  ONE_WEEK: "1-week",
};

const NotificationSettingsSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    ref: "users",
  },
  email_notifications: {
    type: Boolean,
    default: true,
  },
  push_notifications: {
    type: Boolean,
    default: true,
  },
  reminder_timings: {
    type: [
      {
        type: String,
        enum: Object.values(REMINDER_TIMINGS),
      },
    ],
    default: [REMINDER_TIMINGS.ONE_DAY],
  },
  competition_updates: {
    type: Boolean,
    default: true,
  },
  collaboration_requests: {
    type: Boolean,
    default: true,
  },
  achievement_sharing: {
    type: Boolean,
    default: false,
  },
});

// Set user_id as the primary key
NotificationSettingsSchema.index({ user_id: 1 }, { unique: true });

export default mongoose.model(
  "notification_settings",
  NotificationSettingsSchema
);
