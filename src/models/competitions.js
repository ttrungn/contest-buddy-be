import mongoose from "mongoose";

// Define competition categories
export const COMPETITION_CATEGORIES = {
  HACKATHON: "Cuộc thi Hackathon",
  DATATHON: "Cuộc thi Dữ liệu (Datathon)",
  DESIGNATHON: "Cuộc thi Thiết kế (Designathon)",
  BUSINESS_CASE: "Giải pháp Kinh doanh",
  CODING_CONTEST: "Cuộc thi Lập trình",
  WEB_DEVELOPMENT: "Phát triển Web",
  MOBILE_APP: "Phát triển Ứng dụng Di động",
  AI_ML: "Trí tuệ nhân tạo & Học máy",
  DATA_SCIENCE: "Khoa học Dữ liệu",
  GAME_DEVELOPMENT: "Phát triển Trò chơi",
  CYBERSECURITY: "An ninh mạng",
  BLOCKCHAIN: "Công nghệ Blockchain",
  IOT: "Internet of Things (IoT)",
  ROBOTICS: "Công nghệ Robot",
  UI_UX_DESIGN: "Thiết kế Giao diện & Trải nghiệm người dùng (UI/UX)",
  GRAPHIC_DESIGN: "Thiết kế Đồ họa",
  VIDEO_EDITING: "Dựng & Biên tập Video",
  PHOTOGRAPHY: "Nhiếp ảnh",
  STARTUP_PITCH: "Khởi nghiệp & Gọi vốn (Startup Pitch)",
  INNOVATION: "Đổi mới sáng tạo",
  RESEARCH: "Nghiên cứu khoa học",
  ACADEMIC: "Học thuật / Giáo dục",
  OPEN_SOURCE: "Nguồn mở (Open Source)",
  SOCIAL_IMPACT: "Tác động xã hội",
  SUSTAINABILITY: "Phát triển bền vững",
  FINTECH: "Công nghệ tài chính (Fintech)",
  HEALTHTECH: "Công nghệ y tế (HealthTech)",
  EDTECH: "Công nghệ giáo dục (EdTech)",
  AGRITECH: "Công nghệ nông nghiệp (AgriTech)",
  DEVOPS: "DevOps / Tự động hóa triển khai",
  CLOUD_COMPUTING: "Điện toán đám mây (Cloud Computing)",
  OTHER: "Khác",
};

// Cấp độ cuộc thi
export const COMPETITION_LEVELS = {
  BEGINNER: "Người mới bắt đầu",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Nâng cao",
  ALL_LEVELS: "Mọi cấp độ",
};

// Trạng thái cuộc thi
export const COMPETITION_STATUSES = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đã công bố",
  REGISTRATION_OPEN: "Đang mở đăng ký",
  REGISTRATION_CLOSED: "Đã đóng đăng ký",
  IN_PROGRESS: "Đang diễn ra",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

const CompetitionsSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: Object.values(COMPETITION_CATEGORIES),
  },
  plan_id: {
    type: String,
    required: true,
    ref: "plans",
  },
  organizer_id: {
    type: String,
    ref: "organizers",
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  registration_deadline: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  prize_pool_text: {
    type: String,
  },
  participants_count: {
    type: Number,
    default: 0,
  },
  max_participants: {
    type: Number,
  },
  isRegisteredAsTeam: {
    type: Boolean,
    default: false,
  },
  maxParticipantsPerTeam: {
    type: Number,
    default: 1,
  },
  level: {
    type: String,
    required: true,
    enum: Object.values(COMPETITION_LEVELS),
  },
  image_url: {
    type: String,
  },
  website: {
    type: String,
  },
  rules: {
    type: String,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(COMPETITION_STATUSES),
  },
});

export default mongoose.model("competitions", CompetitionsSchema);
