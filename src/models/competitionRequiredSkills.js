import mongoose from "mongoose";

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
