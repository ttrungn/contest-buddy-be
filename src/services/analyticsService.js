import User from "../models/user.js";
import Organizer from "../models/organizers.js";
import Order, { ORDER_STATUSES } from "../models/order.js";
import OrderDetail from "../models/orderDetails.js";
import Competition from "../models/competitions.js";
import Plan from "../models/plans.js";

/**
 * Get new users/organizers statistics by custom time range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} Statistics object with user and organizer counts
 */
export const getNewUsersByTimeRange = async (startDate, endDate) => {
  try {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    // Get all users created in the time range
    const totalUsers = await User.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });

    // Get organizers by joining with User table
    const organizerUsers = await Organizer.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "owner_user_id",
          foreignField: "id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $match: {
          "user.createdAt": { $gte: start, $lte: end },
        },
      },
      { $count: "total" },
    ]);

    const newOrganizers =
      organizerUsers.length > 0 ? organizerUsers[0].total : 0;
    const newUsers = totalUsers - newOrganizers;

    return {
      success: true,
      data: {
        startDate: start,
        endDate: end,
        newUsers,
        newOrganizers,
        total: totalUsers,
      },
    };
  } catch (error) {
    console.error("Get new users by time range error:", error);
    return {
      success: false,
      message: "Failed to get user statistics",
      error: error.message,
    };
  }
};

/**
 * Get new users/organizers by week/month in a specific year
 * @param {Number} year - Year to analyze
 * @param {String} groupBy - 'week' | 'month'
 * @returns {Object} Statistics grouped by period
 */
export const getNewUsersByPeriodInYear = async (year, groupBy = "month") => {
  try {
    const startDate = new Date(year, 0, 1, 0, 0, 0, 0);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    let groupStage;
    let allPeriods = [];

    if (groupBy === "week") {
      groupStage = {
        $group: {
          _id: { $week: "$createdAt" },
          week: { $first: { $week: "$createdAt" } },
          count: { $sum: 1 },
        },
      };
      // Create all 53 weeks (0-52)
      for (let i = 0; i <= 52; i++) {
        allPeriods.push(i);
      }
    } else {
      // month
      groupStage = {
        $group: {
          _id: { $month: "$createdAt" },
          month: { $first: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      };
      // Create all 12 months (1-12)
      for (let i = 1; i <= 12; i++) {
        allPeriods.push(i);
      }
    }

    // Get total users by period
    const totalUserStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      groupStage,
      { $sort: { _id: 1 } },
    ]);

    // Get organizers by period (joining with User table)
    const organizerGroupStage =
      groupBy === "week"
        ? {
            $group: {
              _id: { $week: "$user.createdAt" },
              week: { $first: { $week: "$user.createdAt" } },
              count: { $sum: 1 },
            },
          }
        : {
            $group: {
              _id: { $month: "$user.createdAt" },
              month: { $first: { $month: "$user.createdAt" } },
              count: { $sum: 1 },
            },
          };

    const organizerStats = await Organizer.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "owner_user_id",
          foreignField: "id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $match: {
          "user.createdAt": { $gte: startDate, $lte: endDate },
        },
      },
      organizerGroupStage,
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing periods with count = 0
    const fillMissingPeriods = (stats, periods, periodKey) => {
      const statsMap = new Map(stats.map((s) => [s._id, s]));
      return periods.map((period) => {
        const existing = statsMap.get(period);
        if (existing) {
          return existing;
        }
        return {
          _id: period,
          [periodKey]: period,
          count: 0,
        };
      });
    };

    const periodKey = groupBy === "week" ? "week" : "month";
    const filledTotalUserStats = fillMissingPeriods(
      totalUserStats,
      allPeriods,
      periodKey
    );
    const filledOrganizerStats = fillMissingPeriods(
      organizerStats,
      allPeriods,
      periodKey
    );

    // Calculate real users (total users - organizers) for each period
    const filledUserStats = filledTotalUserStats.map((total, index) => {
      const organizers = filledOrganizerStats[index].count;
      return {
        ...total,
        count: total.count - organizers,
      };
    });

    return {
      success: true,
      data: {
        year,
        groupBy,
        users: filledUserStats,
        organizers: filledOrganizerStats,
      },
    };
  } catch (error) {
    console.error("Get new users by period in year error:", error);
    return {
      success: false,
      message: "Failed to get user statistics by period",
      error: error.message,
    };
  }
};

/**
 * Get new users/organizers statistics by year
 * @param {Number} startYear - Starting year (optional)
 * @param {Number} endYear - Ending year (optional, defaults to current year)
 * @returns {Object} Statistics grouped by year
 */
export const getNewUsersByYear = async (startYear, endYear) => {
  try {
    const currentYear = new Date().getFullYear();
    const start = startYear || 2020;
    const end = endYear || currentYear;

    // Get total users by year
    const totalUserStats = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(start, 0, 1),
            $lte: new Date(end, 11, 31, 23, 59, 59, 999),
          },
        },
      },
      {
        $group: {
          _id: { $year: "$createdAt" },
          year: { $first: { $year: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get organizers by year (joining with User table)
    const organizerStats = await Organizer.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "owner_user_id",
          foreignField: "id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $match: {
          "user.createdAt": {
            $gte: new Date(start, 0, 1),
            $lte: new Date(end, 11, 31, 23, 59, 59, 999),
          },
        },
      },
      {
        $group: {
          _id: { $year: "$user.createdAt" },
          year: { $first: { $year: "$user.createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing years with count = 0
    const allYears = [];
    for (let y = start; y <= end; y++) {
      allYears.push(y);
    }

    const fillMissingYears = (stats) => {
      const statsMap = new Map(stats.map((s) => [s._id, s]));
      return allYears.map((year) => {
        const existing = statsMap.get(year);
        if (existing) {
          return existing;
        }
        return {
          _id: year,
          year: year,
          count: 0,
        };
      });
    };

    const filledTotalUserStats = fillMissingYears(totalUserStats);
    const filledOrganizerStats = fillMissingYears(organizerStats);

    // Calculate real users (total users - organizers) for each year
    const filledUserStats = filledTotalUserStats.map((total, index) => {
      const organizers = filledOrganizerStats[index].count;
      return {
        ...total,
        count: total.count - organizers,
      };
    });

    return {
      success: true,
      data: {
        startYear: start,
        endYear: end,
        users: filledUserStats,
        organizers: filledOrganizerStats,
      },
    };
  } catch (error) {
    console.error("Get new users by year error:", error);
    return {
      success: false,
      message: "Failed to get user statistics by year",
      error: error.message,
    };
  }
};

/**
 * Get revenue statistics by custom time range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} Revenue statistics
 */
export const getRevenueByTimeRange = async (startDate, endDate) => {
  try {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: ORDER_STATUSES.COMPLETED,
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total_amount" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    const stats =
      result.length > 0
        ? result[0]
        : {
            totalRevenue: 0,
            totalOrders: 0,
          };

    return {
      success: true,
      data: {
        startDate: start,
        endDate: end,
        totalRevenue: stats.totalRevenue || 0,
        totalOrders: stats.totalOrders || 0,
      },
    };
  } catch (error) {
    console.error("Get revenue by time range error:", error);
    return {
      success: false,
      message: "Failed to get revenue statistics",
      error: error.message,
    };
  }
};

/**
 * Get revenue statistics by week/month in a specific year
 * @param {Number} year - Year to analyze
 * @param {String} groupBy - 'week' | 'month'
 * @returns {Object} Revenue grouped by period
 */
export const getRevenueByPeriodInYear = async (year, groupBy = "month") => {
  try {
    const startDate = new Date(year, 0, 1, 0, 0, 0, 0);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    let groupStage;
    let allPeriods = [];

    if (groupBy === "week") {
      groupStage = {
        $group: {
          _id: { $week: "$createdAt" },
          week: { $first: { $week: "$createdAt" } },
          totalRevenue: { $sum: "$total_amount" },
          totalOrders: { $sum: 1 },
        },
      };
      // Create all 53 weeks (0-52)
      for (let i = 0; i <= 52; i++) {
        allPeriods.push(i);
      }
    } else {
      // month
      groupStage = {
        $group: {
          _id: { $month: "$createdAt" },
          month: { $first: { $month: "$createdAt" } },
          totalRevenue: { $sum: "$total_amount" },
          totalOrders: { $sum: 1 },
        },
      };
      // Create all 12 months (1-12)
      for (let i = 1; i <= 12; i++) {
        allPeriods.push(i);
      }
    }

    const revenueStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: ORDER_STATUSES.COMPLETED,
        },
      },
      groupStage,
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing periods with zeros
    const periodKey = groupBy === "week" ? "week" : "month";
    const statsMap = new Map(revenueStats.map((s) => [s._id, s]));
    const filledStats = allPeriods.map((period) => {
      const existing = statsMap.get(period);
      if (existing) {
        return existing;
      }
      return {
        _id: period,
        [periodKey]: period,
        totalRevenue: 0,
        totalOrders: 0,
      };
    });

    // Calculate totals
    const totals = filledStats.reduce(
      (acc, item) => ({
        totalRevenue: acc.totalRevenue + (item.totalRevenue || 0),
        totalOrders: acc.totalOrders + (item.totalOrders || 0),
      }),
      { totalRevenue: 0, totalOrders: 0 }
    );

    return {
      success: true,
      data: {
        year,
        groupBy,
        periods: filledStats,
        summary: {
          totalRevenue: totals.totalRevenue,
          totalOrders: totals.totalOrders,
        },
      },
    };
  } catch (error) {
    console.error("Get revenue by period in year error:", error);
    return {
      success: false,
      message: "Failed to get revenue statistics by period",
      error: error.message,
    };
  }
};

/**
 * Get revenue statistics by year
 * @param {Number} startYear - Starting year (optional)
 * @param {Number} endYear - Ending year (optional, defaults to current year)
 * @returns {Object} Revenue grouped by year
 */
export const getRevenueByYear = async (startYear, endYear) => {
  try {
    const currentYear = new Date().getFullYear();
    const start = startYear || 2020;
    const end = endYear || currentYear;

    const revenueStats = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(start, 0, 1),
            $lte: new Date(end, 11, 31, 23, 59, 59, 999),
          },
          status: ORDER_STATUSES.COMPLETED,
        },
      },
      {
        $group: {
          _id: { $year: "$createdAt" },
          year: { $first: { $year: "$createdAt" } },
          totalRevenue: { $sum: "$total_amount" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing years with zeros
    const allYears = [];
    for (let y = start; y <= end; y++) {
      allYears.push(y);
    }

    const statsMap = new Map(revenueStats.map((s) => [s._id, s]));
    const filledStats = allYears.map((year) => {
      const existing = statsMap.get(year);
      if (existing) {
        return existing;
      }
      return {
        _id: year,
        year: year,
        totalRevenue: 0,
        totalOrders: 0,
      };
    });

    // Calculate grand totals
    const totals = filledStats.reduce(
      (acc, item) => ({
        totalRevenue: acc.totalRevenue + (item.totalRevenue || 0),
        totalOrders: acc.totalOrders + (item.totalOrders || 0),
      }),
      { totalRevenue: 0, totalOrders: 0 }
    );

    return {
      success: true,
      data: {
        startYear: start,
        endYear: end,
        years: filledStats,
        summary: {
          totalRevenue: totals.totalRevenue,
          totalOrders: totals.totalOrders,
        },
      },
    };
  } catch (error) {
    console.error("Get revenue by year error:", error);
    return {
      success: false,
      message: "Failed to get revenue statistics by year",
      error: error.message,
    };
  }
};

/**
 * Get plan purchase statistics by custom time range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} Statistics object with plan purchases
 */
export const getPlanPurchasesByTimeRange = async (startDate, endDate) => {
  try {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    // Get the collection name for competitions
    const competitionCollectionName = Competition.collection.collectionName;

    // Aggregate plan purchases from order details grouped by plan
    const result = await OrderDetail.aggregate([
      {
        $lookup: {
          from: competitionCollectionName,
          localField: "product_id",
          foreignField: "id",
          as: "competition",
        },
      },
      { $unwind: { path: "$competition", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "plans",
          localField: "competition.plan_id",
          foreignField: "id",
          as: "plan",
        },
      },
      { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $match: {
          "order.createdAt": { $gte: start, $lte: end },
          "order.status": ORDER_STATUSES.COMPLETED,
          product_source_schema: competitionCollectionName,
        },
      },
      {
        $group: {
          _id: "$competition.plan_id",
          planId: { $first: "$competition.plan_id" },
          planName: { $first: { $ifNull: ["$plan.name", "Unknown Plan"] } },
          totalPurchased: { $sum: "$quantity" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { totalPurchased: -1 } },
    ]);

    // Calculate totals
    const totals = result.reduce(
      (acc, item) => ({
        totalPlansPurchased:
          acc.totalPlansPurchased + (item.totalPurchased || 0),
        totalOrders: acc.totalOrders + (item.totalOrders || 0),
      }),
      { totalPlansPurchased: 0, totalOrders: 0 }
    );

    return {
      success: true,
      data: {
        startDate: start,
        endDate: end,
        totalPlansPurchased: totals.totalPlansPurchased,
        totalOrders: totals.totalOrders,
        totalPlanTypes: result.length,
        planBreakdown: result,
      },
    };
  } catch (error) {
    console.error("Get plan purchases by time range error:", error);
    return {
      success: false,
      message: "Failed to get plan purchase statistics",
      error: error.message,
    };
  }
};

/**
 * Get plan purchase statistics by week/month in a specific year
 * @param {Number} year - Year to analyze
 * @param {String} groupBy - 'week' | 'month'
 * @returns {Object} Statistics grouped by period
 */
export const getPlanPurchasesByPeriodInYear = async (
  year,
  groupBy = "month"
) => {
  try {
    const startDate = new Date(year, 0, 1, 0, 0, 0, 0);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

    // Get the collection name for competitions
    const competitionCollectionName = Competition.collection.collectionName;

    let groupStage;
    let allPeriods = [];

    if (groupBy === "week") {
      groupStage = {
        $group: {
          _id: { $week: "$order.createdAt" },
          week: { $first: { $week: "$order.createdAt" } },
          totalPlansPurchased: { $sum: "$quantity" },
          totalOrders: { $sum: 1 },
        },
      };
      // Create all 53 weeks (0-52)
      for (let i = 0; i <= 52; i++) {
        allPeriods.push(i);
      }
    } else {
      // month
      groupStage = {
        $group: {
          _id: { $month: "$order.createdAt" },
          month: { $first: { $month: "$order.createdAt" } },
          totalPlansPurchased: { $sum: "$quantity" },
          totalOrders: { $sum: 1 },
        },
      };
      // Create all 12 months (1-12)
      for (let i = 1; i <= 12; i++) {
        allPeriods.push(i);
      }
    }

    const planStats = await OrderDetail.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $match: {
          "order.createdAt": { $gte: startDate, $lte: endDate },
          "order.status": ORDER_STATUSES.COMPLETED,
          product_source_schema: competitionCollectionName,
        },
      },
      groupStage,
      { $sort: { _id: 1 } },
    ]);

    // Get plan breakdown for the entire year
    const planBreakdown = await OrderDetail.aggregate([
      {
        $lookup: {
          from: competitionCollectionName,
          localField: "product_id",
          foreignField: "id",
          as: "competition",
        },
      },
      { $unwind: { path: "$competition", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "plans",
          localField: "competition.plan_id",
          foreignField: "id",
          as: "plan",
        },
      },
      { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $match: {
          "order.createdAt": { $gte: startDate, $lte: endDate },
          "order.status": ORDER_STATUSES.COMPLETED,
          product_source_schema: competitionCollectionName,
        },
      },
      {
        $group: {
          _id: "$competition.plan_id",
          planId: { $first: "$competition.plan_id" },
          planName: { $first: { $ifNull: ["$plan.name", "Unknown Plan"] } },
          totalPurchased: { $sum: "$quantity" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { totalPurchased: -1 } },
    ]);

    // Fill in missing periods with zeros
    const periodKey = groupBy === "week" ? "week" : "month";
    const statsMap = new Map(planStats.map((s) => [s._id, s]));
    const filledStats = allPeriods.map((period) => {
      const existing = statsMap.get(period);
      if (existing) {
        return existing;
      }
      return {
        _id: period,
        [periodKey]: period,
        totalPlansPurchased: 0,
        totalOrders: 0,
      };
    });

    // Calculate totals
    const totals = filledStats.reduce(
      (acc, item) => ({
        totalPlansPurchased:
          acc.totalPlansPurchased + (item.totalPlansPurchased || 0),
        totalOrders: acc.totalOrders + (item.totalOrders || 0),
      }),
      { totalPlansPurchased: 0, totalOrders: 0 }
    );

    return {
      success: true,
      data: {
        year,
        groupBy,
        periods: filledStats,
        summary: {
          totalPlansPurchased: totals.totalPlansPurchased,
          totalOrders: totals.totalOrders,
          totalPlanTypes: planBreakdown.length,
        },
        planBreakdown: planBreakdown,
      },
    };
  } catch (error) {
    console.error("Get plan purchases by period in year error:", error);
    return {
      success: false,
      message: "Failed to get plan purchase statistics by period",
      error: error.message,
    };
  }
};

/**
 * Get plan purchase statistics by year
 * @param {Number} startYear - Starting year (optional)
 * @param {Number} endYear - Ending year (optional, defaults to current year)
 * @returns {Object} Statistics grouped by year
 */
export const getPlanPurchasesByYear = async (startYear, endYear) => {
  try {
    const currentYear = new Date().getFullYear();
    const start = startYear || 2020;
    const end = endYear || currentYear;

    // Get the collection name for competitions
    const competitionCollectionName = Competition.collection.collectionName;

    const planStats = await OrderDetail.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $match: {
          "order.createdAt": {
            $gte: new Date(start, 0, 1),
            $lte: new Date(end, 11, 31, 23, 59, 59, 999),
          },
          "order.status": ORDER_STATUSES.COMPLETED,
          product_source_schema: competitionCollectionName,
        },
      },
      {
        $group: {
          _id: { $year: "$order.createdAt" },
          year: { $first: { $year: "$order.createdAt" } },
          totalPlansPurchased: { $sum: "$quantity" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get plan breakdown for the entire period
    const planBreakdown = await OrderDetail.aggregate([
      {
        $lookup: {
          from: competitionCollectionName,
          localField: "product_id",
          foreignField: "id",
          as: "competition",
        },
      },
      { $unwind: { path: "$competition", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "plans",
          localField: "competition.plan_id",
          foreignField: "id",
          as: "plan",
        },
      },
      { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "orders",
          localField: "order_id",
          foreignField: "id",
          as: "order",
        },
      },
      { $unwind: "$order" },
      {
        $match: {
          "order.createdAt": {
            $gte: new Date(start, 0, 1),
            $lte: new Date(end, 11, 31, 23, 59, 59, 999),
          },
          "order.status": ORDER_STATUSES.COMPLETED,
          product_source_schema: competitionCollectionName,
        },
      },
      {
        $group: {
          _id: "$competition.plan_id",
          planId: { $first: "$competition.plan_id" },
          planName: { $first: { $ifNull: ["$plan.name", "Unknown Plan"] } },
          totalPurchased: { $sum: "$quantity" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { totalPurchased: -1 } },
    ]);

    // Fill in missing years with zeros
    const allYears = [];
    for (let y = start; y <= end; y++) {
      allYears.push(y);
    }

    const statsMap = new Map(planStats.map((s) => [s._id, s]));
    const filledStats = allYears.map((year) => {
      const existing = statsMap.get(year);
      if (existing) {
        return existing;
      }
      return {
        _id: year,
        year: year,
        totalPlansPurchased: 0,
        totalOrders: 0,
      };
    });

    // Calculate grand totals
    const totals = filledStats.reduce(
      (acc, item) => ({
        totalPlansPurchased:
          acc.totalPlansPurchased + (item.totalPlansPurchased || 0),
        totalOrders: acc.totalOrders + (item.totalOrders || 0),
      }),
      { totalPlansPurchased: 0, totalOrders: 0 }
    );

    return {
      success: true,
      data: {
        startYear: start,
        endYear: end,
        years: filledStats,
        summary: {
          totalPlansPurchased: totals.totalPlansPurchased,
          totalOrders: totals.totalOrders,
          totalPlanTypes: planBreakdown.length,
        },
        planBreakdown: planBreakdown,
      },
    };
  } catch (error) {
    console.error("Get plan purchases by year error:", error);
    return {
      success: false,
      message: "Failed to get plan purchase statistics by year",
      error: error.message,
    };
  }
};
