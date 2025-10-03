import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp, initializeApp } from "./app.js";
import registerChatHandlers from "./sockets/chatSocket.js";

const { app, allowedOrigin } = createApp();

// Kết nối MongoDB và khởi tạo dữ liệu cần thiết
initializeApp();

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigin,
    credentials: true,
  },
});

app.set("io", io);
registerChatHandlers(io);

const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`🚀 Backend Nodejs is running on port: ${port}`);
});
