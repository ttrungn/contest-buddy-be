import mongoose from "mongoose";
import * as subscriptionService from "../services/userSubscriptionService.js";
import { SUBSCRIPTION_STATUSES } from "../models/userSubscriptions.js";

// Get all subscription plans
export const getAllPlans = async (req, res) => {
  try {
    const result = await subscriptionService.getAllPlans();

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Get plans successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Get all plans controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get plan by ID
export const getPlanById = async (req, res) => {
  try {
    const { planId } = req.params;
    const result = await subscriptionService.getPlanById(planId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Get plan successfully",
        data: result.data,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Get plan by ID controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get user's current subscription
export const getUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await subscriptionService.getUserSubscription(userId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message || "Get subscription successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Get user subscription controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get user's subscription history
export const getUserSubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await subscriptionService.getUserSubscriptionHistory(userId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Get subscription history successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Get user subscription history controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Purchase subscription
export const purchaseSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan_id } = req.body;

    if (!plan_id) {
      return res.status(400).json({
        success: false,
        message: "Plan ID is required",
      });
    }

    const result = await subscriptionService.createSubscriptionPurchase(
      userId,
      plan_id
    );

    if (result.success) {
      return res.status(result.statusCode || 201).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      return res.status(result.statusCode || 400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Purchase subscription controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscription_id } = req.params;
    const { reason } = req.body;

    const result = await subscriptionService.cancelSubscription(
      userId,
      subscription_id,
      reason
    );

    if (result.success) {
      return res.status(result.statusCode || 200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      return res.status(result.statusCode || 400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Cancel subscription controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Check feature access
export const checkFeatureAccess = async (req, res) => {
  try {
    const userId = req.user.id;
    const { feature_key } = req.params;

    if (!feature_key) {
      return res.status(400).json({
        success: false,
        message: "Feature key is required",
      });
    }

    const result = await subscriptionService.checkFeatureAccess(
      userId,
      feature_key
    );

    return res.status(200).json({
      success: true,
      hasAccess: result.hasAccess,
      message: result.message || "Feature access checked",
      value: result.value || null,
    });
  } catch (error) {
    console.error("Check feature access controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Subscription dashboard metrics (admin)
export const getSubscriptionDashboard = async (req, res) => {
  try {
    const { start_date, end_date, status, plan_id } = req.query;

    const filters = {};

    if (start_date) {
      const parsedStartDate = new Date(start_date);
      if (Number.isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid start_date",
        });
      }
      filters.startDate = parsedStartDate;
    }

    if (end_date) {
      const parsedEndDate = new Date(end_date);
      if (Number.isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid end_date",
        });
      }
      filters.endDate = parsedEndDate;
    }

    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate > filters.endDate
    ) {
      return res.status(400).json({
        success: false,
        message: "start_date must be before end_date",
      });
    }

    if (status) {
      const normalizedStatus = status.toLowerCase();
      if (!Object.values(SUBSCRIPTION_STATUSES).includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status filter",
        });
      }
      filters.status = normalizedStatus;
    }

    if (plan_id) {
      if (!mongoose.Types.ObjectId.isValid(plan_id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid plan_id",
        });
      }
      filters.planId = plan_id;
    }

    const result = await subscriptionService.getSubscriptionDashboardMetrics(
      filters
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Get subscription dashboard metrics successfully",
        data: result.data,
      });
    }

    return res.status(500).json({
      success: false,
      message: result.message || "Failed to get subscription dashboard metrics",
    });
  } catch (error) {
    console.error("Get subscription dashboard controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
