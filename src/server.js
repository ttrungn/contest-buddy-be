import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/connectDB.js";
import viewEngine from "./config/viewEngine.js";
import initWebRoutes from "./routes/web.js";

dotenv.config(); // Load biến môi trường từ .env

let app = express();
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);
app.set("trust proxy", 1);
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);

viewEngine(app);
initWebRoutes(app);

// Kết nối MongoDB và khởi tạo dữ liệu cần thiết
const initializeApp = async () => {
  await connectDB();
};

initializeApp();

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 Backend Nodejs is running on port: ${port}`);
});
