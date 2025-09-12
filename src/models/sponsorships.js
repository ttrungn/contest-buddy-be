import mongoose from "mongoose";

// Define sponsorship types
export const SPONSORSHIP_TYPES = {
  FINANCIAL: "financial",
  IN_KIND: "in_kind",
  MEDIA: "media",
  VENUE: "venue",
  OTHER: "other",
};

// Define sponsorship statuses
export const SPONSORSHIP_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PAID: "paid",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

const SponsorshipsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  management_id: {
    type: String,
    required: true,
    ref: "competition_management",
  },
  sponsor: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(SPONSORSHIP_TYPES),
  },
  benefits: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(SPONSORSHIP_STATUSES),
  },
  contract_date: {
    type: Date,
    required: true,
  },
});

export default mongoose.model("sponsorships", SponsorshipsSchema);
