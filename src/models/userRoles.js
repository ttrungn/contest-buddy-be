import mongoose from "mongoose";

const UserRolesSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    ref: "users",
  },
  role_id: {
    type: Number,
    required: true,
    ref: "roles",
  },
});

// Set compound primary key
UserRolesSchema.index({ user_id: 1, role_id: 1 }, { unique: true });

// Explicitly specify collection name as "user_roles"
export default mongoose.model("UserRoles", UserRolesSchema, "user_roles");
