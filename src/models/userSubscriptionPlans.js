import mongoose from "mongoose";

// Plan statuses for user subscription plans
export const USER_SUBSCRIPTION_PLAN_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
};

// Billing cycle types
export const BILLING_CYCLES = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
};

const UserSubscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "VND",
    },
    billing_cycle: {
      type: String,
      enum: Object.values(BILLING_CYCLES),
      required: true,
    },
    duration_months: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: Object.values(USER_SUBSCRIPTION_PLAN_STATUSES),
      default: USER_SUBSCRIPTION_PLAN_STATUSES.ACTIVE,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    display_order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "user_subscription_plans",
  }
);

export default mongoose.model(
  "UserSubscriptionPlan",
  UserSubscriptionPlanSchema
);
