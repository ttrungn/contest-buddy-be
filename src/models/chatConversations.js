import mongoose from "mongoose";

// Define conversation types
export const CONVERSATION_TYPES = {
  DIRECT: "direct",
  GROUP: "group",
};

const ChatConversationsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  user1_id: {
    type: String,
    required: true,
    ref: "users",
  },
  user2_id: {
    type: String,
    required: true,
    ref: "users",
  },
  type: {
    type: String,
    required: true,
    enum: Object.values(CONVERSATION_TYPES),
  },
  last_read_msg_user1_id: {
    type: String,
    ref: "chat_messages",
  },
  last_read_msg_user2_id: {
    type: String,
    ref: "chat_messages",
  },
  last_activity: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export default mongoose.model("chat_conversations", ChatConversationsSchema);
