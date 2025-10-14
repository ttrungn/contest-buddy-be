import mongoose from "mongoose";

// Order detail schema
const OrderDetailSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    order_id: {
      type: String,
      required: true,
      ref: "Order",
    },
    product_id: {
      type: String,
      required: true,
    },
    product_source_schema: {
      type: String,
      required: true,
    },
    product_description: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0,
    },
    total_price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount_per_item: {
      type: Number,
      default: 0,
      min: 0,
    },
    final_price: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "orderDetails",
  }
);

// Indexes for better query performance
OrderDetailSchema.index({ order_id: 1 });
OrderDetailSchema.index({ product_id: 1 });
OrderDetailSchema.index({ order_id: 1, product_id: 1 });

// Method to calculate final price
OrderDetailSchema.methods.calculateFinalPrice = function () {
  this.total_price = this.quantity * this.unit_price;
  this.final_price =
    this.total_price + this.tax_per_item - this.discount_per_item;
  return this.final_price;
};

// Pre-save middleware to calculate final price
OrderDetailSchema.pre("save", function (next) {
  this.calculateFinalPrice();
  next();
});

const OrderDetail = mongoose.model("OrderDetail", OrderDetailSchema);

export default OrderDetail;
