import mongoose from "mongoose";

// Define message types
export const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  FILE: "file",
  SYSTEM: "system",
};

const ChatMessagesSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  conversation_id: {
    type: String,
    required: true,
    ref: "chat_conversations",
  },
  sender_id: {
    type: String,
    required: true,
    ref: "users",
  },
  content: {
    type: String,
    required: true,
  },
  message_type: {
    type: String,
    required: true,
    enum: Object.values(MESSAGE_TYPES),
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export default mongoose.model("chat_messages", ChatMessagesSchema);
