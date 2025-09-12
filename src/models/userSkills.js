import mongoose from "mongoose";
import { SKILL_CATEGORIES } from "./skills.js";

// Define skill levels as constants
export const SKILL_LEVELS = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
  EXPERT: "expert",
};

const UserSkillsSchema = new mongoose.Schema({
  id: {
    type: Number,
    autoIncrement: true,
  },
  user_id: {
    type: String,
    required: true,
    ref: "User",
  },
  skill_name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: Object.values(SKILL_CATEGORIES),
  },
  level: {
    type: String,
    required: true,
    enum: Object.values(SKILL_LEVELS),
  },
  experience_years: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("UserSkills", UserSkillsSchema);
