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

const getPeerIdFromConversation = (conversation, userId) => {
  if (!conversation) {
    return null;
  }

  return conversation.user1_id === userId
    ? conversation.user2_id
    : conversation.user1_id;
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

    const io = req.app.get("io");
    if (io) {
      const payloadData = {
        conversationId,
        ...result,
      };

      io.to(`conversation:${conversationId}`).emit(
        "chat:new-message",
        payloadData
      );

      const peerIdToNotify = getPeerIdFromConversation(
        result.conversation,
        senderId
      );

      if (peerIdToNotify) {
        io.to(`user:${peerIdToNotify}`).emit(
          "chat:new-message",
          payloadData
        );
      }
    }

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

    const io = req.app.get("io");
    if (io) {
      const eventPayload = {
        conversationId,
        userId,
        messageId,
        conversation: result.conversation,
      };

      io.to(`conversation:${conversationId}`).emit(
        "chat:read-receipt",
        eventPayload
      );

      const peerIdToNotify = getPeerIdFromConversation(
        result.conversation,
        userId
      );

      if (peerIdToNotify) {
        io.to(`user:${peerIdToNotify}`).emit(
          "chat:read-receipt",
          eventPayload
        );
      }
    }

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
