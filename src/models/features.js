import mongoose from "mongoose";

const FeaturesSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
});

// Set key as the primary key
FeaturesSchema.index({ key: 1 }, { unique: true });

export default mongoose.model("features", FeaturesSchema);
