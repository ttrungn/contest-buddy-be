import { v4 as uuidv4 } from "uuid";
import ChatConversations, {
  CONVERSATION_TYPES,
} from "../models/chatConversations.js";
import ChatMessages, { MESSAGE_TYPES } from "../models/chatMessages.js";
import db from "../models/index.js";

const ensureConversationAccess = async (conversationId, userId) => {
  const conversation = await ChatConversations.findOne({ id: conversationId });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  if (conversation.user1_id !== userId && conversation.user2_id !== userId) {
    throw new Error("Access denied for this conversation");
  }

  return conversation;
};

export const createOrGetDirectConversation = async (userId, peerId) => {
  if (!peerId) {
    throw new Error("Peer ID is required");
  }

  if (userId === peerId) {
    throw new Error("Cannot create conversation with yourself");
  }

  const peer = await db.User.findOne({ id: peerId });
  if (!peer) {
    throw new Error("Peer user not found");
  }

  const sortedIds = [userId, peerId].sort();

  let conversation = await ChatConversations.findOne({
    user1_id: sortedIds[0],
    user2_id: sortedIds[1],
  });

  if (!conversation) {
    conversation = await ChatConversations.create({
      id: uuidv4(),
      user1_id: sortedIds[0],
      user2_id: sortedIds[1],
      type: CONVERSATION_TYPES.DIRECT,
      last_activity: new Date(),
    });
  }

  return conversation.toObject ? conversation.toObject() : conversation;
};

export const getConversationsForUser = async (userId) => {
  const conversations = await ChatConversations.find({
    $or: [{ user1_id: userId }, { user2_id: userId }],
  })
    .sort({ last_activity: -1 })
    .lean();

  if (!conversations.length) {
    return [];
  }

  const participantIds = new Set();
  conversations.forEach((conversation) => {
    const peerId =
      conversation.user1_id === userId
        ? conversation.user2_id
        : conversation.user1_id;
    participantIds.add(peerId);
  });

  const users = await db.User.find({ id: { $in: Array.from(participantIds) } })
    .select("id full_name username email avatar_url")
    .lean();

  const usersById = new Map(users.map((user) => [user.id, user]));

  const conversationsWithMeta = await Promise.all(
    conversations.map(async (conversation) => {
      const lastMessage = await ChatMessages.findOne({
        conversation_id: conversation.id,
      })
        .sort({ created_at: -1 })
        .lean();

      const peerId =
        conversation.user1_id === userId
          ? conversation.user2_id
          : conversation.user1_id;

      return {
        ...conversation,
        peer: usersById.get(peerId) || null,
        last_message: lastMessage || null,
      };
    })
  );

  return conversationsWithMeta;
};

export const getMessagesForConversation = async (
  conversationId,
  userId,
  { limit = 50, before } = {}
) => {
  await ensureConversationAccess(conversationId, userId);

  const query = { conversation_id: conversationId };
  if (before) {
    query.created_at = { $lt: new Date(before) };
  }

  const messages = await ChatMessages.find(query)
    .sort({ created_at: -1 })
    .limit(Number(limit) || 50)
    .lean();

  return messages.reverse();
};

export const sendMessage = async (
  conversationId,
  senderId,
  content,
  messageType = MESSAGE_TYPES.TEXT
) => {
  if (!content || !content.trim()) {
    throw new Error("Message content is required");
  }

  if (!Object.values(MESSAGE_TYPES).includes(messageType)) {
    throw new Error("Invalid message type");
  }

  const conversation = await ensureConversationAccess(conversationId, senderId);

  const message = await ChatMessages.create({
    id: uuidv4(),
    conversation_id: conversationId,
    sender_id: senderId,
    content: content.trim(),
    message_type: messageType,
    created_at: new Date(),
  });

  const updatePayload = { last_activity: message.created_at };

  if (conversation.user1_id === senderId) {
    updatePayload.last_read_msg_user1_id = message.id;
  } else {
    updatePayload.last_read_msg_user2_id = message.id;
  }

  const updatedConversation = await ChatConversations.findOneAndUpdate(
    { id: conversationId },
    updatePayload,
    { new: true }
  ).lean();

  return { message: message.toObject(), conversation: updatedConversation };
};

export const markConversationAsRead = async (
  conversationId,
  userId,
  messageId
) => {
  const conversation = await ensureConversationAccess(conversationId, userId);

  const message = await ChatMessages.findOne({
    id: messageId,
    conversation_id: conversationId,
  });

  if (!message) {
    throw new Error("Message not found");
  }

  const updatePayload = {};

  if (conversation.user1_id === userId) {
    updatePayload.last_read_msg_user1_id = messageId;
  } else {
    updatePayload.last_read_msg_user2_id = messageId;
  }

  const updatedConversation = await ChatConversations.findOneAndUpdate(
    { id: conversationId },
    updatePayload,
    { new: true }
  ).lean();

  return {
    message: message.toObject ? message.toObject() : message,
    conversation: updatedConversation,
  };
};

export const getConversationById = async (conversationId, userId) => {
  const conversation = await ensureConversationAccess(conversationId, userId);
  return conversation.toObject();
};
