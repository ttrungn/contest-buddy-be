import mongoose from "mongoose";

// Define skill categories as constants
export const SKILL_CATEGORIES = {
  TECHNICAL: "technical",
  DESIGN: "design",
  SOFT: "soft",
  LANGUAGE: "language",
  OTHER: "other",
};

const SkillsSchema = new mongoose.Schema({
  id: {
    type: Number,
    autoIncrement: true,
  },
  name: {
    type: String,
    unique: true,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: Object.values(SKILL_CATEGORIES),
  },
});

export default mongoose.model("skills", SkillsSchema);
