import mongoose from "mongoose";
import { SKILL_CATEGORIES } from "./skills.js";

const CompetitionRequiredSkillsSchema = new mongoose.Schema({
  competition_id: {
    type: String,
    required: true,
    ref: "competitions",
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: Object.values(SKILL_CATEGORIES),
  },
});

// Set compound primary key
CompetitionRequiredSkillsSchema.index(
  { competition_id: 1, name: 1 },
  { unique: true }
);

export default mongoose.model(
  "competition_required_skills",
  CompetitionRequiredSkillsSchema
);
