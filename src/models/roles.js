import mongoose from "mongoose";

// Define role names as constants
export const ROLE_NAMES = {
  ORGANIZER: "organizer",
  CUSTOMER: "customer",
  ADMIN: "admin",
};

const RolesSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      autoIncrement: true,
    },
    name: {
      type: String,
      unique: true,
      required: true,
      enum: Object.values(ROLE_NAMES),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Explicitly specify collection name as "roles"
export default mongoose.model("Roles", RolesSchema, "roles");
