import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp, initializeApp } from "./app.js";
import registerChatHandlers from "./sockets/chatSocket.js";
import { startReminderScheduler } from "./services/reminderScheduler.js";
import { startCompetitionEmailJob } from "./jobs/competitionEmailJob.js";

const { app, allowedOrigins } = createApp();

// Kết nối MongoDB và khởi tạo dữ liệu cần thiết
initializeApp();

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);
registerChatHandlers(io);

// Start reminder scheduler
const stopScheduler = startReminderScheduler(io);

// Start competition email job (runs every Monday and Wednesday at 7:00 AM)
startCompetitionEmailJob();

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`🚀 Backend Nodejs is running on port: ${port}`);
});
