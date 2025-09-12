import mongoose from "mongoose";

// Define finance types
export const FINANCE_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
  SPONSORSHIP: "sponsorship",
  PRIZE: "prize",
};

// Define finance statuses
export const FINANCE_STATUSES = {
  PENDING: "pending",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

const FinanceEntriesSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  management_id: {
    type: String,
    required: true,
    ref: "competition_management",
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(FINANCE_TYPES),
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  occurred_at: {
    type: Date,
    required: true,
  },
  source: {
    type: String,
  },
  receipt_url: {
    type: String,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(FINANCE_STATUSES),
  },
});

export default mongoose.model("finance_entries", FinanceEntriesSchema);
