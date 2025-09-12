import mongoose from "mongoose";

// Define plan statuses
export const PLAN_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
};

const PlansSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    unique: true,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  price_amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "VND",
  },
  status: {
    type: String,
    enum: Object.values(PLAN_STATUSES),
    default: PLAN_STATUSES.ACTIVE,
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

export default mongoose.model("plans", PlansSchema);
