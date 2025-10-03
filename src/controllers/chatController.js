import {
  createOrGetDirectConversation,
  getConversationsForUser,
  getMessagesForConversation,
  sendMessage,
  markConversationAsRead,
  getConversationById,
} from "../services/chatService.js";

const resolveStatusCode = (message) => {
  if (!message) return 500;
  const normalized = message.toLowerCase();
  if (normalized.includes("not found")) return 404;
  if (normalized.includes("access denied")) return 403;
  if (normalized.includes("invalid")) return 400;
  if (normalized.includes("required") || normalized.includes("cannot")) {
    return 400;
  }
  return 500;
};

export const handleCreateDirectConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { peerId } = req.body;

    const conversation = await createOrGetDirectConversation(userId, peerId);

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    const status = resolveStatusCode(error.message);
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const handleGetUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await getConversationsForUser(userId);

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    const status = resolveStatusCode(error.message);
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const handleGetConversationById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const conversation = await getConversationById(conversationId, userId);

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    const status = resolveStatusCode(error.message);
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const handleGetConversationMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { limit, before } = req.query;

    const messages = await getMessagesForConversation(conversationId, userId, {
      limit,
      before,
    });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    const status = resolveStatusCode(error.message);
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const handleSendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId } = req.params;
    const { content, messageType } = req.body;

    const result = await sendMessage(
      conversationId,
      senderId,
      content,
      messageType
    );

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const status = resolveStatusCode(error.message);
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export const handleMarkConversationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { messageId } = req.body;

    const result = await markConversationAsRead(
      conversationId,
      userId,
      messageId
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const status = resolveStatusCode(error.message);
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};
