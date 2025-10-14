import mongoose from "mongoose";

// Payment status enum
export const PAYMENT_STATUSES = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
};

// Payment method enum
export const PAYMENT_METHODS = {
  CREDIT_CARD: "credit_card",
  BANK_TRANSFER: "bank_transfer",
  E_WALLET: "e_wallet",
};

// Payment schema
const PaymentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    order_id: {
      type: String,
      ref: "Order",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUSES),
      default: PAYMENT_STATUSES.PENDING,
    },
    payment_method: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      required: true,
    },
    transaction_id: {
      type: String,
      unique: true,
      sparse: true,
    },
    payment_date: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "payments",
  }
);

// Indexes for better query performance
PaymentSchema.index({ order: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ transaction_id: 1 });

// Method to mark payment as successful
PaymentSchema.methods.markAsPaid = function () {
  this.status = PAYMENT_STATUSES.PAID;
  this.payment_date = new Date();
  return this.save();
};

// Method to mark payment as failed
PaymentSchema.methods.markAsFailed = function () {
  this.status = PAYMENT_STATUSES.FAILED;
  return this.save();
};

const Payment = mongoose.model("Payment", PaymentSchema);

export default Payment;
