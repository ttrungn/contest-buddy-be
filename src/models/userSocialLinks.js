import mongoose from "mongoose";

const UserSocialLinksSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    ref: "users",
  },
  github: {
    type: String,
  },
  linkedin: {
    type: String,
  },
  personal: {
    type: String,
  },
});

// Set user_id as the primary key
UserSocialLinksSchema.index({ user_id: 1 }, { unique: true });

export default mongoose.model("user_social_links", UserSocialLinksSchema);
