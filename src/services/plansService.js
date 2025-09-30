import crypto from "crypto";
import db from "../models/index.js";
import { PLAN_STATUSES } from "../models/plans.js";

// Helper function to generate unique ID
const generateUniqueId = () => {
  return crypto.randomBytes(16).toString("hex");
};

// Create a new plan
const createPlan = async (planData) => {
  try {
    // Check if Plan model exists
    if (!db.Plans) {
      console.error("❌ Plans model not found in db object");
      console.log("Available models:", Object.keys(db));
      return {
        success: false,
        message: "Plans model not available",
      };
    }

    // Check if plan name already exists
    const existingPlan = await db.Plans.findOne({ name: planData.name });
    if (existingPlan) {
      return {
        success: false,
        message: "Plan name already exists",
      };
    }

    // Create new plan
    const newPlan = await db.Plans.create({
      id: generateUniqueId(),
      name: planData.name,
      description: planData.description || "",
      price_amount: planData.price_amount,
      currency: planData.currency || "VND",
      status: planData.status || PLAN_STATUSES.ACTIVE,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return {
      success: true,
      message: "Plan created successfully",
      data: newPlan,
    };
  } catch (error) {
    console.error("Error creating plan:", error);
    return {
      success: false,
      message: "Failed to create plan",
      error: error.message,
    };
  }
};

// Get all plans with pagination and filtering
const getAllPlans = async (options = {}) => {
  try {
    if (!db.Plans) {
      return {
        success: false,
        message: "Plans model not available",
      };
    }

    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = "created_at",
      sortOrder = "desc",
      minPrice,
      maxPrice,
      currency,
    } = options;

    // Build filter object
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice !== undefined) {
      filter.price_amount = {
        ...filter.price_amount,
        $gte: parseFloat(minPrice),
      };
    }

    if (maxPrice !== undefined) {
      filter.price_amount = {
        ...filter.price_amount,
        $lte: parseFloat(maxPrice),
      };
    }

    if (currency) {
      filter.currency = currency;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const plans = await db.Plans.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCount = await db.Plans.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: plans,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching plans:", error);
    return {
      success: false,
      message: "Failed to fetch plans",
      error: error.message,
    };
  }
};

// Get plan by ID
const getPlanById = async (planId) => {
  try {
    if (!db.Plans) {
      return {
        success: false,
        message: "Plans model not available",
      };
    }

    const plan = await db.Plans.findOne({ id: planId });

    if (!plan) {
      return {
        success: false,
        message: "Plan not found",
      };
    }

    return {
      success: true,
      data: plan,
    };
  } catch (error) {
    console.error("Error fetching plan:", error);
    return {
      success: false,
      message: "Failed to fetch plan",
      error: error.message,
    };
  }
};

// Update plan
const updatePlan = async (planId, updateData) => {
  try {
    if (!db.Plans) {
      return {
        success: false,
        message: "Plans model not available",
      };
    }

    // Check if plan exists
    const existingPlan = await db.Plans.findOne({ id: planId });
    if (!existingPlan) {
      return {
        success: false,
        message: "Plan not found",
      };
    }

    // Check if new name already exists (if name is being updated)
    if (updateData.name && updateData.name !== existingPlan.name) {
      const nameExists = await db.Plans.findOne({
        name: updateData.name,
        id: { $ne: planId },
      });
      if (nameExists) {
        return {
          success: false,
          message: "Plan name already exists",
        };
      }
    }

    // Update plan
    const updatedPlan = await db.Plans.findOneAndUpdate(
      { id: planId },
      {
        ...updateData,
        updated_at: new Date(),
      },
      { new: true }
    );

    return {
      success: true,
      message: "Plan updated successfully",
      data: updatedPlan,
    };
  } catch (error) {
    console.error("Error updating plan:", error);
    return {
      success: false,
      message: "Failed to update plan",
      error: error.message,
    };
  }
};

// Delete plan
const deletePlan = async (planId) => {
  try {
    if (!db.Plans) {
      return {
        success: false,
        message: "Plans model not available",
      };
    }

    // Check if plan exists
    const existingPlan = await db.Plans.findOne({ id: planId });
    if (!existingPlan) {
      return {
        success: false,
        message: "Plan not found",
      };
    }

    // Check if plan has associated features (optional constraint)
    if (db.PlanFeatures) {
      const hasFeatures = await db.PlanFeatures.findOne({ plan_id: planId });
      if (hasFeatures) {
        return {
          success: false,
          message:
            "Cannot delete plan with associated features. Remove features first.",
        };
      }
    }

    // Delete plan
    await db.Plans.findOneAndDelete({ id: planId });

    return {
      success: true,
      message: "Plan deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting plan:", error);
    return {
      success: false,
      message: "Failed to delete plan",
      error: error.message,
    };
  }
};

// Get plans by status
const getPlansByStatus = async (status) => {
  try {
    if (!db.Plans) {
      return {
        success: false,
        message: "Plans model not available",
      };
    }

    if (!Object.values(PLAN_STATUSES).includes(status)) {
      return {
        success: false,
        message: "Invalid plan status",
      };
    }

    const plans = await db.Plans.find({ status }).sort({ created_at: -1 });

    return {
      success: true,
      data: plans,
    };
  } catch (error) {
    console.error("Error fetching plans by status:", error);
    return {
      success: false,
      message: "Failed to fetch plans by status",
      error: error.message,
    };
  }
};

// Get plan with features
const getPlanWithFeatures = async (planId) => {
  try {
    if (!db.Plans || !db.PlanFeatures || !db.Features) {
      return {
        success: false,
        message: "Required models not available",
      };
    }

    const plan = await db.Plans.findOne({ id: planId });
    if (!plan) {
      return {
        success: false,
        message: "Plan not found",
      };
    }

    // Get plan features with feature details
    const planFeatures = await db.PlanFeatures.find({ plan_id: planId });

    const featuresWithDetails = await Promise.all(
      planFeatures.map(async (pf) => {
        const feature = await db.Features.findOne({ key: pf.feature_key });
        return {
          feature_key: pf.feature_key,
          feature_name: feature?.name || "Unknown Feature",
          feature_description: feature?.description || "",
          value: pf.value,
        };
      })
    );

    return {
      success: true,
      data: {
        ...plan.toObject(),
        features: featuresWithDetails,
      },
    };
  } catch (error) {
    console.error("Error fetching plan with features:", error);
    return {
      success: false,
      message: "Failed to fetch plan with features",
      error: error.message,
    };
  }
};

// Update plan status
const updatePlanStatus = async (planId, status) => {
  try {
    if (!db.Plans) {
      return {
        success: false,
        message: "Plans model not available",
      };
    }

    if (!Object.values(PLAN_STATUSES).includes(status)) {
      return {
        success: false,
        message: "Invalid plan status",
      };
    }

    const updatedPlan = await db.Plans.findOneAndUpdate(
      { id: planId },
      {
        status,
        updated_at: new Date(),
      },
      { new: true }
    );

    if (!updatedPlan) {
      return {
        success: false,
        message: "Plan not found",
      };
    }

    return {
      success: true,
      message: "Plan status updated successfully",
      data: updatedPlan,
    };
  } catch (error) {
    console.error("Error updating plan status:", error);
    return {
      success: false,
      message: "Failed to update plan status",
      error: error.message,
    };
  }
};

export {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  getPlansByStatus,
  getPlanWithFeatures,
  updatePlanStatus,
  PLAN_STATUSES,
};
