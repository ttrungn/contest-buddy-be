import {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  getPlansByStatus,
  getPlanWithFeatures,
  updatePlanStatus,
  PLAN_STATUSES,
} from "../services/plansService.js";

// Create new plan
const handleCreatePlan = async (req, res) => {
  try {
    const { name, description, price_amount, currency, status } = req.body;

    // Validate required fields
    if (!name || price_amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, price_amount",
      });
    }

    // Validate price_amount
    if (typeof price_amount !== "number" || price_amount < 0) {
      return res.status(400).json({
        success: false,
        message: "price_amount must be a non-negative number",
      });
    }

    // Validate status if provided
    if (status && !Object.values(PLAN_STATUSES).includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${Object.values(
          PLAN_STATUSES
        ).join(", ")}`,
      });
    }

    const result = await createPlan({
      name,
      description,
      price_amount,
      currency,
      status,
    });

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error in handleCreatePlan:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get all plans
const handleGetAllPlans = async (req, res) => {
  try {
    const {
      page,
      limit,
      status,
      search,
      sortBy,
      sortOrder,
      minPrice,
      maxPrice,
      currency,
    } = req.query;

    // Validate status if provided
    if (status && !Object.values(PLAN_STATUSES).includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${Object.values(
          PLAN_STATUSES
        ).join(", ")}`,
      });
    }

    const result = await getAllPlans({
      page,
      limit,
      status,
      search,
      sortBy,
      sortOrder,
      minPrice,
      maxPrice,
      currency,
    });

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error in handleGetAllPlans:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get plan by ID
const handleGetPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    const result = await getPlanById(id);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error("Error in handleGetPlanById:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update plan
const handleUpdatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    // Validate price_amount if provided
    if (updateData.price_amount !== undefined) {
      if (
        typeof updateData.price_amount !== "number" ||
        updateData.price_amount < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "price_amount must be a non-negative number",
        });
      }
    }

    // Validate status if provided
    if (
      updateData.status &&
      !Object.values(PLAN_STATUSES).includes(updateData.status)
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${Object.values(
          PLAN_STATUSES
        ).join(", ")}`,
      });
    }

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.created_at;

    const result = await updatePlan(id, updateData);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error in handleUpdatePlan:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete plan
const handleDeletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    const result = await deletePlan(id);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error in handleDeletePlan:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get plans by status
const handleGetPlansByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const result = await getPlansByStatus(status);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error in handleGetPlansByStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get plan with features
const handleGetPlanWithFeatures = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    const result = await getPlanWithFeatures(id);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(404).json(result);
    }
  } catch (error) {
    console.error("Error in handleGetPlanWithFeatures:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update plan status
const handleUpdatePlanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const result = await updatePlanStatus(id, status);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Error in handleUpdatePlanStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  handleCreatePlan,
  handleGetAllPlans,
  handleGetPlanById,
  handleUpdatePlan,
  handleDeletePlan,
  handleGetPlansByStatus,
  handleGetPlanWithFeatures,
  handleUpdatePlanStatus,
};
