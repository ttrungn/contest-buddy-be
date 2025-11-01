import {
  getNewUsersByTimeRange,
  getNewUsersByPeriodInYear,
  getNewUsersByYear,
  getRevenueByTimeRange,
  getRevenueByPeriodInYear,
  getRevenueByYear,
  getPlanPurchasesByTimeRange,
  getPlanPurchasesByPeriodInYear,
  getPlanPurchasesByYear,
} from "../services/analyticsService.js";

/**
 * Get new users/organizers statistics by custom time range
 * GET /api/analytics/users/time-range?startDate=2025-01-01&endDate=2025-12-31
 */
export const handleGetNewUsersByTimeRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const result = await getNewUsersByTimeRange(startDate, endDate);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "User statistics retrieved successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Get new users by time range controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get new users/organizers by day/week/month in a specific year
 * GET /api/analytics/users/period?year=2025&groupBy=month
 */
export const handleGetNewUsersByPeriodInYear = async (req, res) => {
  try {
    const { year, groupBy = "month" } = req.query;

    if (!year) {
      return res.status(400).json({
        success: false,
        message: "Year is required",
      });
    }

    if (!["week", "month"].includes(groupBy)) {
      return res.status(400).json({
        success: false,
        message: "groupBy must be 'week' or 'month'",
      });
    }

    const result = await getNewUsersByPeriodInYear(parseInt(year), groupBy);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "User statistics by period retrieved successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Get new users by period controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get new users/organizers statistics by year
 * GET /api/analytics/users/year?startYear=2020&endYear=2025
 */
export const handleGetNewUsersByYear = async (req, res) => {
  try {
    const { startYear, endYear } = req.query;

    const result = await getNewUsersByYear(
      startYear ? parseInt(startYear) : undefined,
      endYear ? parseInt(endYear) : undefined
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "User statistics by year retrieved successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Get new users by year controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get revenue statistics by custom time range
 * GET /api/analytics/revenue/time-range?startDate=2025-01-01&endDate=2025-12-31
 */
export const handleGetRevenueByTimeRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const result = await getRevenueByTimeRange(startDate, endDate);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Revenue statistics retrieved successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Get revenue by time range controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get revenue statistics by day/week/month in a specific year
 * GET /api/analytics/revenue/period?year=2025&groupBy=month
 */
export const handleGetRevenueByPeriodInYear = async (req, res) => {
  try {
    const { year, groupBy = "month" } = req.query;

    if (!year) {
      return res.status(400).json({
        success: false,
        message: "Year is required",
      });
    }

    if (!["week", "month"].includes(groupBy)) {
      return res.status(400).json({
        success: false,
        message: "groupBy must be 'week' or 'month'",
      });
    }

    const result = await getRevenueByPeriodInYear(parseInt(year), groupBy);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Revenue statistics by period retrieved successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Get revenue by period controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get revenue statistics by year
 * GET /api/analytics/revenue/year?startYear=2020&endYear=2025
 */
export const handleGetRevenueByYear = async (req, res) => {
  try {
    const { startYear, endYear } = req.query;

    const result = await getRevenueByYear(
      startYear ? parseInt(startYear) : undefined,
      endYear ? parseInt(endYear) : undefined
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Revenue statistics by year retrieved successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Get revenue by year controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get plan purchases statistics by custom time range
 * GET /api/analytics/plans/time-range?startDate=2025-01-01&endDate=2025-12-31
 */
export const handleGetPlanPurchasesByTimeRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required",
      });
    }

    const result = await getPlanPurchasesByTimeRange(startDate, endDate);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Plan purchase statistics retrieved successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Get plan purchases by time range controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get plan purchases statistics by week/month in a specific year
 * GET /api/analytics/plans/period?year=2025&groupBy=month
 */
export const handleGetPlanPurchasesByPeriodInYear = async (req, res) => {
  try {
    const { year, groupBy = "month" } = req.query;

    if (!year) {
      return res.status(400).json({
        success: false,
        message: "Year is required",
      });
    }

    if (!["week", "month"].includes(groupBy)) {
      return res.status(400).json({
        success: false,
        message: "groupBy must be 'week' or 'month'",
      });
    }

    const result = await getPlanPurchasesByPeriodInYear(
      parseInt(year),
      groupBy
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Plan purchase statistics by period retrieved successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Get plan purchases by period controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get plan purchases statistics by year
 * GET /api/analytics/plans/year?startYear=2020&endYear=2025
 */
export const handleGetPlanPurchasesByYear = async (req, res) => {
  try {
    const { startYear, endYear } = req.query;

    const result = await getPlanPurchasesByYear(
      startYear ? parseInt(startYear) : undefined,
      endYear ? parseInt(endYear) : undefined
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Plan purchase statistics by year retrieved successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Get plan purchases by year controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
