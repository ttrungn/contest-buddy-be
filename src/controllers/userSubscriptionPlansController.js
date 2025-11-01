import {
  createPlan,
  updatePlan,
  deletePlan,
  updatePlanStatus,
} from "../services/userSubscriptionPlansService.js";

// Admin: create user subscription plan
export const handleCreateUserSubscriptionPlan = async (req, res) => {
  try {
    const result = await createPlan(req.body);
    return res.status(result.statusCode || (result.success ? 201 : 400)).json({
      success: !!result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("handleCreateUserSubscriptionPlan error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Admin: update user subscription plan
export const handleUpdateUserSubscriptionPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const result = await updatePlan(planId, req.body);
    return res.status(result.statusCode || (result.success ? 200 : 400)).json({
      success: !!result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("handleUpdateUserSubscriptionPlan error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Admin: delete user subscription plan
export const handleDeleteUserSubscriptionPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const result = await deletePlan(planId);
    return res.status(result.statusCode || (result.success ? 200 : 400)).json({
      success: !!result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("handleDeleteUserSubscriptionPlan error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Admin: update plan status
export const handleUpdateUserSubscriptionPlanStatus = async (req, res) => {
  try {
    const { planId } = req.params;
    const { status } = req.body;
    const result = await updatePlanStatus(planId, status);
    return res.status(result.statusCode || (result.success ? 200 : 400)).json({
      success: !!result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("handleUpdateUserSubscriptionPlanStatus error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
