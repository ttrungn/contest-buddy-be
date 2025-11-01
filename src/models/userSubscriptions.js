import mongoose from "mongoose";

// Subscription statuses
export const SUBSCRIPTION_STATUSES = {
  ACTIVE: "active",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
  PENDING: "pending",
};

const UserSubscriptionSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      ref: "User",
      required: true,
    },
    plan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserSubscriptionPlan",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUSES),
      default: SUBSCRIPTION_STATUSES.PENDING,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    amount_paid: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "VND",
    },
    payment_id: {
      type: String,
      ref: "Payment",
    },
    auto_renew: {
      type: Boolean,
      default: false,
    },
    cancelled_at: {
      type: Date,
    },
    cancelled_reason: {
      type: String,
    },
    // Snapshot of features granted at purchase time
    features: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "user_subscriptions",
  }
);

// Indexes
UserSubscriptionSchema.index({ user_id: 1 });
UserSubscriptionSchema.index({ status: 1 });
UserSubscriptionSchema.index({ end_date: 1 });
UserSubscriptionSchema.index({ user_id: 1, status: 1 });

// Virtual to check if subscription is active
UserSubscriptionSchema.virtual("isActive").get(function () {
  const now = new Date();
  return (
    this.status === SUBSCRIPTION_STATUSES.ACTIVE &&
    this.start_date <= now &&
    this.end_date >= now
  );
});

export default mongoose.model("UserSubscription", UserSubscriptionSchema);
