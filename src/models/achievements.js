import mongoose from "mongoose";

const AchievementsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
    ref: "users",
  },
  competition_name: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
  award: {
    type: String,
    required: true,
  },
  achieved_at: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
});

export default mongoose.model("achievements", AchievementsSchema);
