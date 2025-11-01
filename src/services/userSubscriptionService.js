import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import UserSubscriptionPlan from "../models/userSubscriptionPlans.js";
import UserSubscription, {
  SUBSCRIPTION_STATUSES,
} from "../models/userSubscriptions.js";
import Payment from "../models/payments.js";
import User from "../models/user.js";

// Centralized premium features granted to any active subscription
const PREMIUM_FEATURES = {
  max_daily_reminders: 20,
  priority_support: true,
  export_history: true,
  max_followed_contests: 100,
};

// Get all active subscription plans
export const getAllPlans = async () => {
  try {
    const plans = await UserSubscriptionPlan.find({
      status: "active",
    }).sort({ display_order: 1, price: 1 });

    const plansWithFeatures = plans.map((plan) => ({
      ...plan.toObject(),
      features: { ...PREMIUM_FEATURES },
    }));

    return {
      success: true,
      data: plansWithFeatures,
    };
  } catch (error) {
    console.error("Get all plans error:", error);
    return {
      success: false,
      message: "Failed to get subscription plans",
    };
  }
};

// Get plan by ID with features
export const getPlanById = async (planId) => {
  try {
    const plan = await UserSubscriptionPlan.findById(planId);
    if (!plan) {
      return {
        success: false,
        message: "Plan not found",
      };
    }

    return {
      success: true,
      data: {
        ...plan.toObject(),
        features: { ...PREMIUM_FEATURES },
      },
    };
  } catch (error) {
    console.error("Get plan by ID error:", error);
    return {
      success: false,
      message: "Failed to get plan",
    };
  }
};

// Get user's current subscription
export const getUserSubscription = async (userId) => {
  try {
    const subscription = await UserSubscription.findOne({
      user_id: userId,
      status: SUBSCRIPTION_STATUSES.ACTIVE,
    })
      .populate("plan_id", "name description price billing_cycle")
      .sort({ created_at: -1 });

    if (!subscription) {
      return {
        success: true,
        data: null,
        message: "No active subscription",
      };
    }

    return {
      success: true,
      data: {
        ...subscription.toObject(),
        plan: {
          ...subscription.plan_id.toObject(),
          features: subscription.features || { ...PREMIUM_FEATURES },
        },
      },
    };
  } catch (error) {
    console.error("Get user subscription error:", error);
    return {
      success: false,
      message: "Failed to get subscription",
    };
  }
};

// Get user's subscription history
export const getUserSubscriptionHistory = async (userId) => {
  try {
    const subscriptions = await UserSubscription.find({
      user_id: userId,
    })
      .populate("plan_id", "name description price billing_cycle")
      .sort({ created_at: -1 });

    return {
      success: true,
      data: subscriptions,
    };
  } catch (error) {
    console.error("Get user subscription history error:", error);
    return {
      success: false,
      message: "Failed to get subscription history",
    };
  }
};

// Create subscription purchase (returns payment link)
export const createSubscriptionPurchase = async (userId, planId) => {
  try {
    // Validate user exists
    const user = await User.findOne({ id: userId });
    if (!user) {
      return {
        success: false,
        message: "User not found",
        statusCode: 404,
      };
    }

    // Validate plan exists and is active
    const plan = await UserSubscriptionPlan.findById(planId);
    if (!plan) {
      return {
        success: false,
        message: "Plan not found",
        statusCode: 404,
      };
    }

    if (plan.status !== "active") {
      return {
        success: false,
        message: "Plan is not available",
        statusCode: 400,
      };
    }

    // Check if user already has active subscription
    const existingSubscription = await UserSubscription.findOne({
      user_id: userId,
      status: SUBSCRIPTION_STATUSES.ACTIVE,
    });

    if (existingSubscription) {
      return {
        success: false,
        message: "You already have an active subscription",
        statusCode: 400,
      };
    }

    // Calculate end date based on plan duration
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.duration_months);

    // Import PayOS service dynamically
    const payosService = await import("./paymentService.js");

    // Create order for payment tracking
    const orderNumber = Date.now().toString();

    // Prepare payment data
    const paymentData = {
      amount: plan.price,
      description: `Subscription: ${plan.name}`,
      orderCode: orderNumber,
      userId: userId,
      planId: planId.toString(),
      type: "subscription",
    };

    // Create payment URL using subscription-specific function
    const paymentResult = await payosService.createSubscriptionPaymentUrl(
      userId,
      {
        amount: plan.price,
        description: `Subscription: ${plan.name}`,
        orderCode: orderNumber,
      }
    );

    if (!paymentResult.success) {
      return {
        success: false,
        message: paymentResult.message || "Failed to create payment",
        statusCode: 500,
      };
    }

    // Extract payment response data
    const paymentResponse = paymentResult.result;
    const orderCode =
      paymentResult.orderCode || paymentResponse.orderCode || orderNumber;

    // Create pending subscription
    const subscription = new UserSubscription({
      user_id: userId,
      plan_id: planId,
      status: SUBSCRIPTION_STATUSES.PENDING,
      start_date: startDate,
      end_date: endDate,
      amount_paid: plan.price,
      currency: plan.currency,
      payment_id: orderCode.toString(), // Store orderCode as payment_id for webhook matching
      // snapshot premium features at purchase time
      features: { ...PREMIUM_FEATURES },
    });

    await subscription.save();

    return {
      success: true,
      statusCode: 201,
      message: "Subscription created successfully",
      data: {
        subscription_id: subscription._id,
        payment_url:
          paymentResponse.checkoutUrl ||
          paymentResponse.paymentLink ||
          paymentResponse.url,
        qr_code: paymentResponse.qrCode || paymentResponse.qr,
        order_code: orderCode,
        amount: plan.price,
        plan_name: plan.name,
        expiry_date: endDate,
      },
    };
  } catch (error) {
    console.error("Create subscription purchase error:", error);
    return {
      success: false,
      message: "Failed to create subscription purchase",
      error: error.message,
      statusCode: 500,
    };
  }
};

// Activate subscription after successful payment
export const activateSubscription = async (orderCode, transactionId) => {
  try {
    // Find payment by order code
    const payment = await Payment.findOne({
      "payosInfo.orderCode": orderCode,
    });

    if (!payment) {
      console.error("Payment not found for order code:", orderCode);
      return {
        success: false,
        message: "Payment not found",
      };
    }

    // Check payment status
    if (payment.status === "pending") {
      // Update payment status
      await Payment.findOneAndUpdate(
        { "payosInfo.orderCode": orderCode },
        {
          status: "paid",
          transaction_id: transactionId,
          payment_date: new Date(),
        }
      );

      // Find and activate subscription
      const subscription = await UserSubscription.findOne({
        payment_id: payment.id,
        status: SUBSCRIPTION_STATUSES.PENDING,
      });

      if (subscription) {
        subscription.status = SUBSCRIPTION_STATUSES.ACTIVE;
        await subscription.save();

        return {
          success: true,
          message: "Subscription activated successfully",
          data: subscription,
        };
      }

      return {
        success: false,
        message: "Subscription not found",
      };
    }

    return {
      success: true,
      message: "Payment already processed",
    };
  } catch (error) {
    console.error("Activate subscription error:", error);
    return {
      success: false,
      message: "Failed to activate subscription",
      error: error.message,
    };
  }
};

// Cancel subscription
export const cancelSubscription = async (
  userId,
  subscriptionId,
  reason = null
) => {
  try {
    const subscription = await UserSubscription.findOne({
      _id: subscriptionId,
      user_id: userId,
    });

    if (!subscription) {
      return {
        success: false,
        message: "Subscription not found",
        statusCode: 404,
      };
    }

    if (subscription.status !== SUBSCRIPTION_STATUSES.ACTIVE) {
      return {
        success: false,
        message: "Only active subscriptions can be cancelled",
        statusCode: 400,
      };
    }

    subscription.status = SUBSCRIPTION_STATUSES.CANCELLED;
    subscription.cancelled_at = new Date();
    subscription.cancelled_reason = reason || "User cancelled";
    await subscription.save();

    return {
      success: true,
      message: "Subscription cancelled successfully",
      data: subscription,
    };
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return {
      success: false,
      message: "Failed to cancel subscription",
      error: error.message,
      statusCode: 500,
    };
  }
};

// Check if user has feature access
export const checkFeatureAccess = async (userId, featureKey) => {
  try {
    const subscription = await UserSubscription.findOne({
      user_id: userId,
      status: SUBSCRIPTION_STATUSES.ACTIVE,
    });

    if (!subscription) {
      return {
        hasAccess: false,
        message: "No active subscription",
      };
    }

    const features = subscription.features || { ...PREMIUM_FEATURES };
    const value = features?.[featureKey];

    if (value === undefined || value === null || value === false) {
      return { hasAccess: false, message: "Feature not included in your plan" };
    }

    return { hasAccess: true, value };
  } catch (error) {
    console.error("Check feature access error:", error);
    return {
      hasAccess: false,
      message: "Error checking feature access",
    };
  }
};

// Dashboard metrics for subscriptions
export const getSubscriptionDashboardMetrics = async (filters = {}) => {
  try {
    const { startDate, endDate, status, planId } = filters;

    const matchStage = {};

    if (status) {
      matchStage.status = status;
    }

    if (planId) {
      matchStage.plan_id = new mongoose.Types.ObjectId(planId);
    }

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        matchStage.createdAt.$gte = startDate;
      }
      if (endDate) {
        matchStage.createdAt.$lte = endDate;
      }
    }

    const pipeline = [];

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push(
      {
        $group: {
          _id: "$plan_id",
          totalSubscriptions: { $sum: 1 },
          activeSubscriptions: {
            $sum: {
              $cond: [{ $eq: ["$status", SUBSCRIPTION_STATUSES.ACTIVE] }, 1, 0],
            },
          },
          cancelledSubscriptions: {
            $sum: {
              $cond: [
                { $eq: ["$status", SUBSCRIPTION_STATUSES.CANCELLED] },
                1,
                0,
              ],
            },
          },
          expiredSubscriptions: {
            $sum: {
              $cond: [
                { $eq: ["$status", SUBSCRIPTION_STATUSES.EXPIRED] },
                1,
                0,
              ],
            },
          },
          pendingSubscriptions: {
            $sum: {
              $cond: [
                { $eq: ["$status", SUBSCRIPTION_STATUSES.PENDING] },
                1,
                0,
              ],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$status",
                    [
                      SUBSCRIPTION_STATUSES.ACTIVE,
                      SUBSCRIPTION_STATUSES.CANCELLED,
                      SUBSCRIPTION_STATUSES.EXPIRED,
                    ],
                  ],
                },
                "$amount_paid",
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "user_subscription_plans",
          localField: "_id",
          foreignField: "_id",
          as: "plan",
        },
      },
      {
        $unwind: {
          path: "$plan",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          plan_id: { $toString: "$_id" },
          plan_name: "$plan.name",
          plan_price: "$plan.price",
          plan_currency: "$plan.currency",
          billing_cycle: "$plan.billing_cycle",
          duration_months: "$plan.duration_months",
          totalSubscriptions: 1,
          activeSubscriptions: 1,
          cancelledSubscriptions: 1,
          expiredSubscriptions: 1,
          pendingSubscriptions: 1,
          totalRevenue: 1,
        },
      },
      {
        $sort: {
          totalRevenue: -1,
          totalSubscriptions: -1,
        },
      }
    );

    const planMetrics = await UserSubscription.aggregate(pipeline);

    const summary = planMetrics.reduce(
      (acc, plan) => {
        acc.totalRevenue += plan.totalRevenue || 0;
        acc.totalSubscriptions += plan.totalSubscriptions || 0;
        acc.activeSubscriptions += plan.activeSubscriptions || 0;
        acc.cancelledSubscriptions += plan.cancelledSubscriptions || 0;
        acc.expiredSubscriptions += plan.expiredSubscriptions || 0;
        acc.pendingSubscriptions += plan.pendingSubscriptions || 0;
        return acc;
      },
      {
        totalRevenue: 0,
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        cancelledSubscriptions: 0,
        expiredSubscriptions: 0,
        pendingSubscriptions: 0,
      }
    );

    return {
      success: true,
      data: {
        summary,
        plans: planMetrics,
      },
    };
  } catch (error) {
    console.error("Get subscription dashboard metrics error:", error);
    return {
      success: false,
      message: "Failed to compute subscription dashboard metrics",
      error: error.message,
    };
  }
};
