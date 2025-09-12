import mongoose from "mongoose";

const CompetitionTagsSchema = new mongoose.Schema({
  competition_id: {
    type: String,
    required: true,
    ref: "competitions",
  },
  tag: {
    type: String,
    required: true,
  },
});

// Set compound primary key
CompetitionTagsSchema.index({ competition_id: 1, tag: 1 }, { unique: true });

export default mongoose.model("competition_tags", CompetitionTagsSchema);
