import mongoose from "mongoose";

const ProjectsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
    ref: "users",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  image_url: {
    type: String,
  },
  project_url: {
    type: String,
  },
  github_url: {
    type: String,
  },
  created_at: {
    type: Date,
    required: true,
  },
});

export default mongoose.model("projects", ProjectsSchema);
