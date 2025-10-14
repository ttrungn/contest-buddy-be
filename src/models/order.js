import mongoose from "mongoose";

// Order status enum
export const ORDER_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

// Order schema
const OrderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    order_number: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: String,
      ref: "User",
      required: true,
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: "VND",
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUSES),
      default: ORDER_STATUSES.PENDING,
    },
    notes: {
      type: String,
    },
    order_date: {
      type: Date,
      default: Date.now,
    },
    completed_date: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "orders",
  }
);

// Indexes for better query performance
OrderSchema.index({ user: 1 });
OrderSchema.index({ order_number: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ order_date: -1 });

// Method to calculate order total
OrderSchema.methods.calculateTotal = function () {
  this.total_amount = this.subtotal + this.tax_amount - this.discount_amount;
  return this.total_amount;
};

// Pre-save middleware to calculate totals
OrderSchema.pre("save", function (next) {
  this.calculateTotal();
  next();
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;
