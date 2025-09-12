import mongoose from "mongoose";

// Define event types
export const EVENT_TYPES = {
  COMPETITION: "competition",
  DEADLINE: "deadline",
  MEETING: "meeting",
  PERSONAL: "personal",
  REMINDER: "reminder",
  OTHER: "other",
};

const CalendarEventsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
    ref: "users",
  },
  competition_id: {
    type: String,
    ref: "competitions",
  },
  title: {
    type: String,
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(EVENT_TYPES),
  },
  description: {
    type: String,
  },
  location: {
    type: String,
  },
  reminder_set: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("calendar_events", CalendarEventsSchema);
