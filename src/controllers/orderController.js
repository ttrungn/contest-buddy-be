import {
  createNewCompetitionOrder,
  getOrdersByUserId,
  getOrderDetailsByOrderId,
} from "../services/orderService.js";

const handleCreateNewCompetitionOrder = async (req, res) => {
  try {
    const { competitionId } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!competitionId) {
      return res.status(400).json({
        success: false,
        message: "Competition ID is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await createNewCompetitionOrder(userId, competitionId);

    if (result.success) {
      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: {
          order: result.order,
        },
      });
    } else {
      if (result.message.includes("not found")) {
        return res.status(404).json(result);
      }
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Create competition order controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const handleGetOrdersByUserId = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user ? req.user.id : null;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Assuming getOrdersByUserId is a service function that fetches orders
    const result = await getOrdersByUserId(
      userId,
      {},
      { page: page, limit: limit }
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Orders retrieved successfully",
        data: {
          orders: result.orders,
        },
      });
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Get orders by user ID controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const handleGetOrderDetailsByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user ? req.user.id : null;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await getOrderDetailsByOrderId(userId, orderId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Order details retrieved successfully",
        data: result.orderDetails,
      });
    } else {
      if (result.message.includes("not found")) {
        return res.status(404).json(result);
      }
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("Get order details by order ID controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export {
  handleCreateNewCompetitionOrder,
  handleGetOrdersByUserId,
  handleGetOrderDetailsByOrderId,
};
