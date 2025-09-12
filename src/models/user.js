import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      primary: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    avatar_url: {
      type: String,
    },
    bio: {
      type: String,
      default: "",
    },
    school: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    region: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    study_field: {
      type: String,
      default: "",
    },
    join_date: {
      type: Date,
      required: true,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    verification_token: {
      type: String,
    },
    verification_token_expires: {
      type: Date,
    },
    reset_password_token: {
      type: String,
    },
    reset_password_token_expires: {
      type: Date,
    },
    refresh_token: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0.0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);
export default User;
