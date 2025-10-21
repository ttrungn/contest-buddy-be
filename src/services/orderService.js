import Order, { ORDER_STATUSES } from "../models/order.js";
import OrderDetail from "../models/orderDetails.js";
import { v4 as uuidv4 } from "uuid";
import User from "../models/user.js";
import Competitions from "../models/competitions.js";
import Plans from "../models/plans.js";
import Organizers from "../models/organizers.js";
import { createPaymentUrl } from "./paymentService.js";

const generateUniqueId = () => {
  return uuidv4();
};

const generateSequentialOrderNumber = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const datePrefix = `${year}${month}${day}`;

  const latestOrder = await Order.findOne({
    order_number: { $regex: `^${datePrefix}` },
  }).sort({ order_number: -1 });

  let sequence = 1;
  if (latestOrder && latestOrder.order_number) {
    const sequencePart = latestOrder.order_number.substring(8);
    const lastSequence = parseInt(sequencePart);
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }

  const paddedSequence = String(sequence).padStart(5, "0");
  return `${datePrefix}${paddedSequence}`;
};

export const createNewCompetitionOrder = async (userId, competitionId) => {
  try {
    const user = await User.findOne({ id: userId });
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const organizer = await Organizers.findOne({ owner_user_id: userId });
    if (!organizer) {
      return {
        success: false,
        message: "Organizer not found",
      };
    }

    const competition = await Competitions.findOne({
      id: competitionId,
      organizer_id: organizer.id,
      isDeleted: false,
    });
    if (!competition) {
      return {
        success: false,
        message: "Competition not found",
      };
    }

    const plan = await Plans.findOne({ id: competition.plan_id });
    if (!plan) {
      return {
        success: false,
        message: "Plan not found",
      };
    }

    const quantity = 1;
    const discount = 0;
    const unitPrice = plan.price_amount;
    const totalPrice = unitPrice * quantity;
    const finalPrice = totalPrice - discount;

    const newOrder = new Order({
      id: generateUniqueId(),
      order_number: await generateSequentialOrderNumber(),
      user_id: user.id,
      total_amount: finalPrice,
      status: ORDER_STATUSES.PENDING,
      notes: `Order for competition ${competition.title}`,
    });
    await newOrder.save();

    const newOrderDetail = new OrderDetail({
      id: generateUniqueId(),
      order_id: newOrder.id,
      product_id: competition.id,
      product_source_schema: competition.collection.name,
      product_description: `Registration for competition: ${competition.title}`,
      quantity: quantity,
      unit_price: unitPrice,
      discount_per_item: discount,
      total_price: totalPrice,
      final_price: finalPrice,
    });
    await newOrderDetail.save();

    var paymentInfo = await createPaymentUrl(userId, newOrder.id);

    return {
      success: true,
      order: paymentInfo,
    };
  } catch (error) {
    console.error("Create competition order error:", error);
    return {
      success: false,
      message: "Failed to create competition order",
    };
  }
};

export const getOrdersByUserId = async (userId, filter = {}, options = {}) => {
  try {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const user = await User.findOne({ id: userId });
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const orders = await Order.find({ user_id: user.id })
      .sort({ order_date: -1 })
      .skip(skip)
      .limit(limit);
    return {
      success: true,
      orders: orders,
    };
  } catch (error) {
    console.error("Get orders by user ID error:", error);
    return {
      success: false,
      message: "Failed to retrieve orders",
    };
  }
};

export const getOrderDetailsByOrderId = async (userId, orderId) => {
  try {
    const order = await Order.findOne({ id: orderId, user_id: userId });
    if (!order) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    const orderDetails = await OrderDetail.find({ order_id: orderId });
    let additionalInfo = {};
    if (orderDetails.length > 0) {
      const firstDetail = orderDetails[0];
      if (firstDetail.product_source_schema === Competitions.collection.name) {
        additionalInfo.competition = await Competitions.findOne({
          id: firstDetail.product_id,
        });
      }
    }

    return {
      success: true,
      orderDetails:
        orderDetails.length > 0
          ? { order, orderDetails, additionalInfo }
          : null,
    };
  } catch (error) {
    console.error("Get order details by order ID error:", error);
    return {
      success: false,
      message: "Failed to retrieve order details",
    };
  }
};
