import UserSubscriptionPlan, {
  USER_SUBSCRIPTION_PLAN_STATUSES,
  BILLING_CYCLES,
} from "../models/userSubscriptionPlans.js";

export const createPlan = async (planData) => {
  try {
    const { name, price, billing_cycle, duration_months } = planData;

    if (!name || price === undefined || !billing_cycle || !duration_months) {
      return {
        success: false,
        message:
          "Missing required fields: name, price, billing_cycle, duration_months",
        statusCode: 400,
      };
    }

    if (!Object.values(BILLING_CYCLES).includes(billing_cycle)) {
      return {
        success: false,
        message: `Invalid billing_cycle. Must be one of: ${Object.values(
          BILLING_CYCLES
        ).join(", ")}`,
        statusCode: 400,
      };
    }

    if (
      planData.status &&
      !Object.values(USER_SUBSCRIPTION_PLAN_STATUSES).includes(planData.status)
    ) {
      return {
        success: false,
        message: `Invalid status. Must be one of: ${Object.values(
          USER_SUBSCRIPTION_PLAN_STATUSES
        ).join(", ")}`,
        statusCode: 400,
      };
    }

    const existing = await UserSubscriptionPlan.findOne({ name: name.trim() });
    if (existing) {
      return { success: false, message: "Plan name already exists" };
    }

    const plan = await UserSubscriptionPlan.create({
      name: name.trim(),
      description: planData.description || "",
      price,
      currency: planData.currency || "VND",
      billing_cycle,
      duration_months,
      status: planData.status || USER_SUBSCRIPTION_PLAN_STATUSES.ACTIVE,
      popular: Boolean(planData.popular) || false,
      display_order:
        typeof planData.display_order === "number" ? planData.display_order : 0,
    });

    return {
      success: true,
      message: "Plan created successfully",
      data: plan,
    };
  } catch (error) {
    console.error("createPlan error:", error);
    return {
      success: false,
      message: "Failed to create plan",
      statusCode: 500,
    };
  }
};

export const updatePlan = async (planId, updateData) => {
  try {
    if (!planId) {
      return {
        success: false,
        message: "Plan ID is required",
        statusCode: 400,
      };
    }

    if (updateData.billing_cycle) {
      if (!Object.values(BILLING_CYCLES).includes(updateData.billing_cycle)) {
        return {
          success: false,
          message: `Invalid billing_cycle. Must be one of: ${Object.values(
            BILLING_CYCLES
          ).join(", ")}`,
          statusCode: 400,
        };
      }
    }

    if (updateData.status) {
      if (
        !Object.values(USER_SUBSCRIPTION_PLAN_STATUSES).includes(
          updateData.status
        )
      ) {
        return {
          success: false,
          message: `Invalid status. Must be one of: ${Object.values(
            USER_SUBSCRIPTION_PLAN_STATUSES
          ).join(", ")}`,
          statusCode: 400,
        };
      }
    }

    if (updateData.name) {
      const exists = await UserSubscriptionPlan.findOne({
        name: updateData.name.trim(),
        _id: { $ne: planId },
      });
      if (exists) {
        return { success: false, message: "Plan name already exists" };
      }
    }

    const updated = await UserSubscriptionPlan.findByIdAndUpdate(
      planId,
      {
        ...updateData,
        ...(updateData.name ? { name: updateData.name.trim() } : {}),
      },
      { new: true }
    );

    if (!updated) {
      return { success: false, message: "Plan not found", statusCode: 404 };
    }

    return {
      success: true,
      message: "Plan updated successfully",
      data: updated,
    };
  } catch (error) {
    console.error("updatePlan error:", error);
    return {
      success: false,
      message: "Failed to update plan",
      statusCode: 500,
    };
  }
};

export const deletePlan = async (planId) => {
  try {
    if (!planId) {
      return {
        success: false,
        message: "Plan ID is required",
        statusCode: 400,
      };
    }

    const deleted = await UserSubscriptionPlan.findByIdAndDelete(planId);
    if (!deleted) {
      return { success: false, message: "Plan not found", statusCode: 404 };
    }

    return { success: true, message: "Plan deleted successfully" };
  } catch (error) {
    console.error("deletePlan error:", error);
    return {
      success: false,
      message: "Failed to delete plan",
      statusCode: 500,
    };
  }
};

export const updatePlanStatus = async (planId, status) => {
  try {
    if (!Object.values(USER_SUBSCRIPTION_PLAN_STATUSES).includes(status)) {
      return {
        success: false,
        message: `Invalid status. Must be one of: ${Object.values(
          USER_SUBSCRIPTION_PLAN_STATUSES
        ).join(", ")}`,
        statusCode: 400,
      };
    }

    const updated = await UserSubscriptionPlan.findByIdAndUpdate(
      planId,
      { status },
      { new: true }
    );

    if (!updated) {
      return { success: false, message: "Plan not found", statusCode: 404 };
    }

    return {
      success: true,
      message: "Plan status updated successfully",
      data: updated,
    };
  } catch (error) {
    console.error("updatePlanStatus error:", error);
    return {
      success: false,
      message: "Failed to update plan status",
      statusCode: 500,
    };
  }
};
