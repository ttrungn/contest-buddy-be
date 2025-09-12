import mongoose from "mongoose";

const PlanFeaturesSchema = new mongoose.Schema({
  plan_id: {
    type: String,
    required: true,
    ref: "plans",
  },
  feature_key: {
    type: String,
    required: true,
    ref: "features",
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    // This field stores a snapshot in the format: {"type":"...","data":...}
  },
});

// Set compound primary key
PlanFeaturesSchema.index({ plan_id: 1, feature_key: 1 }, { unique: true });

export default mongoose.model("plan_features", PlanFeaturesSchema);
