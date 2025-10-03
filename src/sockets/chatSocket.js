import jwt from "jsonwebtoken";
import jwtConfig from "../config/jwtConfig.js";
import {
  createOrGetDirectConversation,
  sendMessage,
  markConversationAsRead,
  getConversationById,
} from "../services/chatService.js";

const connectedUsers = new Map();

const extractToken = (socket) => {
  const authToken = socket.handshake?.auth?.token;
  const queryToken = socket.handshake?.query?.token;
  const header = socket.handshake?.headers?.authorization;

  if (authToken) {
    return authToken;
  }

  if (queryToken) {
    return Array.isArray(queryToken) ? queryToken[0] : queryToken;
  }

  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.split(" ")[1];
  }

  return undefined;
};

const authenticateSocket = (socket, next) => {
  try {
    const token = extractToken(socket);

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const payload = jwt.verify(token, jwtConfig.secret);

    if (!payload?.id) {
      return next(new Error("Authentication error"));
    }

    socket.user = { id: payload.id };
    return next();
  } catch (error) {
    return next(new Error("Authentication error"));
  }
};

const emitError = (socket, message) => {
  socket.emit("chat:error", { message });
};

const getPeerIdFromConversation = (conversation, userId) => {
  if (!conversation) {
    return null;
  }

  return conversation.user1_id === userId
    ? conversation.user2_id
    : conversation.user1_id;
};

const registerChatHandlers = (io) => {
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const userId = socket.user.id;

    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId).add(socket.id);

    socket.join(`user:${userId}`);
    socket.emit("chat:connected", { userId });

    socket.on("chat:join-conversation", async (payload = {}, ack) => {
      try {
        const { conversationId, peerId } = payload;

        if (!conversationId && !peerId) {
          throw new Error("conversationId or peerId is required");
        }

        let targetConversationId = conversationId;
        let conversation;

        if (peerId && !targetConversationId) {
          conversation = await createOrGetDirectConversation(userId, peerId);
          targetConversationId = conversation.id;
        } else if (targetConversationId) {
          conversation = await getConversationById(targetConversationId, userId);
        }

        socket.join(`conversation:${targetConversationId}`);

        if (typeof ack === "function") {
          ack({
            success: true,
            data: {
              conversationId: targetConversationId,
              conversation,
            },
          });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({ success: false, message: error.message });
        }
        emitError(socket, error.message);
      }
    });

    socket.on("chat:leave-conversation", (payload = {}, ack) => {
      const { conversationId } = payload;
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
      if (typeof ack === "function") {
        ack({ success: true });
      }
    });

    socket.on("chat:send-message", async (payload = {}, ack) => {
      try {
        const { conversationId: incomingId, peerId, content, messageType } =
          payload;

        if (!incomingId && !peerId) {
          throw new Error("conversationId or peerId is required");
        }

        let conversationId = incomingId;

        if (peerId && !conversationId) {
          const conversation = await createOrGetDirectConversation(
            userId,
            peerId
          );
          conversationId = conversation.id;
          socket.join(`conversation:${conversationId}`);
        } else if (conversationId) {
          await getConversationById(conversationId, userId);
          socket.join(`conversation:${conversationId}`);
        }

        const result = await sendMessage(
          conversationId,
          userId,
          content,
          messageType
        );

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
          userId
        );

        if (peerIdToNotify) {
          io.to(`user:${peerIdToNotify}`).emit("chat:new-message", payloadData);
        }

        if (typeof ack === "function") {
          ack({ success: true, data: payloadData });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({ success: false, message: error.message });
        }
        emitError(socket, error.message);
      }
    });

    socket.on("chat:mark-read", async (payload = {}, ack) => {
      try {
        const { conversationId, messageId } = payload;

        if (!conversationId || !messageId) {
          throw new Error("conversationId and messageId are required");
        }

        const result = await markConversationAsRead(
          conversationId,
          userId,
          messageId
        );

        const peerIdToNotify = getPeerIdFromConversation(
          result.conversation,
          userId
        );

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

        if (peerIdToNotify) {
          io.to(`user:${peerIdToNotify}`).emit(
            "chat:read-receipt",
            eventPayload
          );
        }

        if (typeof ack === "function") {
          ack({ success: true, data: result });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({ success: false, message: error.message });
        }
        emitError(socket, error.message);
      }
    });

    socket.on("disconnect", () => {
      const sockets = connectedUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (!sockets.size) {
          connectedUsers.delete(userId);
        }
      }
    });
  });
};

export default registerChatHandlers;
