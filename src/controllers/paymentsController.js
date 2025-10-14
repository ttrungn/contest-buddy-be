import {
  createPaymentUrl,
  processWebhook,
} from "../services/paymentService.js";

export const handleCreatePaymentUrl = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { orderId } = req.body;
    const result = await createPaymentUrl(userId, orderId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Payment URL created successfully",
        data: result.result,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Create payment URL controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    const result = await processWebhook(webhookData);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Webhook controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
