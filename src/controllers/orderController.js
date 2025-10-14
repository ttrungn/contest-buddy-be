import { createNewCompetitionOrder } from "../services/orderService.js";

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

export { handleCreateNewCompetitionOrder };
