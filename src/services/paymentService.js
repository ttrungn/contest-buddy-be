import { PayOS } from "@payos/node";
import { v4 as uuidv4 } from "uuid";

// Models
import Order, { ORDER_STATUSES } from "../models/order.js";
import Payment, {
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
} from "../models/payments.js";
import User from "../models/user.js";
import OrderDetail from "../models/orderDetails.js";
import Competition, {
  COMPETITION_PAYING_STATUSES,
} from "../models/competitions.js";

// Initialize PayOS instance
const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

export const createPaymentUrl = async (userId, orderId) => {
  try {
    // Validate user exists
    const user = await User.findOne({ id: userId });
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Validate order exists and belongs to user
    const order = await Order.findOne({ id: orderId, user_id: userId });
    if (!order) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    // Prepare checkout request data
    const checkoutRequestData = {
      amount: Number(order.total_amount),
      description: `Order #${order.order_number}`,
      orderCode: Number(order.order_number),
      cancelUrl: process.env.PAYOS_CANCEL_URL,
      returnUrl: process.env.PAYOS_RETURN_URL,
      buyerName: user.full_name,
      buyerEmail: user.email,
      buyerPhone: user.phone,
      buyerAddress: user.address,
      expiredAt: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes from now
    };

    // Create payment request
    const response = await payos.paymentRequests.create(checkoutRequestData);

    return {
      success: true,
      result: response,
    };
  } catch (error) {
    console.error("Create payment URL error:", error);
    return {
      success: false,
      message: "Failed to create payment URL",
      error: error.message,
    };
  }
};

export const processWebhook = async (webhookData) => {
  try {
    // Verify webhook data
    const event = await payos.webhooks.verify(webhookData);
    const { orderCode, reference, amount } = event || {};

    // Handle initialization webhook (test case)
    if (orderCode === 123) {
      return {
        success: true,
        message: "Initialized Webhook Successfully",
      };
    }

    // Handle successful payment (code "00")
    if (event.code === "00") {
      // Find and update order
      const order = await Order.findOne({ order_number: orderCode });
      if (!order) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      order.status = ORDER_STATUSES.COMPLETED;
      await order.save();

      // Update competition paying status if applicable
      const orderDetails = await OrderDetail.find({ order_id: order.id });
      for (const detail of orderDetails) {
        if (detail.product_source_schema === Competition.collection.name) {
          const competition = await Competition.findOne({
            id: detail.product_id,
          });
          if (competition) {
            competition.paying_status = COMPETITION_PAYING_STATUSES.PAID;
            await competition.save();
          }
        }
      }

      // Create payment record
      const payment = new Payment({
        id: uuidv4(),
        order_id: order.id,
        amount: amount || order.total_amount,
        status: PAYMENT_STATUSES.PAID,
        payment_method: PAYMENT_METHODS.BANK_TRANSFER,
        transaction_id: reference,
        payment_date: new Date(),
        notes: `PayOS transaction: ${reference}`,
      });
      await payment.save();

      return {
        success: true,
        message: "Payment processed successfully",
      };
    }
    // Handle failed payment (any other code)
    else {
      // Find and update order
      const order = await Order.findOne({ order_number: orderCode });
      if (!order) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      order.status = ORDER_STATUSES.CANCELLED;
      await order.save();

      // Create failed payment record
      const payment = new Payment({
        id: uuidv4(),
        order_id: order.id,
        amount: amount || order.total_amount,
        status: PAYMENT_STATUSES.FAILED,
        payment_method: PAYMENT_METHODS.E_WALLET,
        transaction_id: reference,
        notes: `PayOS failed transaction: ${reference || "No transaction ID"}`,
      });
      await payment.save();

      return {
        success: true,
        message: "Payment failure processed",
      };
    }
  } catch (error) {
    console.error("Handle webhook error:", error);
    return {
      success: false,
      message: "Error processing webhook",
      error: error.message,
    };
  }
};
