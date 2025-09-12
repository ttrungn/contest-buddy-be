import mongoose from "mongoose";

const OrganizersSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  avatar_url: {
    type: String,
  },
  description: {
    type: String,
  },
  address: {
    type: String,
  },
  phone: {
    type: String,
  },
  website: {
    type: String,
  },
  owner_user_id: {
    type: String,
    ref: "users",
  },
});

export default mongoose.model("organizers", OrganizersSchema);
