import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/connectDB.js";
import viewEngine from "./config/viewEngine.js";
import initWebRoutes from "./routes/web.js";

dotenv.config();

export const createApp = () => {
  const app = express();
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:5173",
  ].filter(Boolean);

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());

  viewEngine(app);
  initWebRoutes(app);

  return { app, allowedOrigins };
};

export const initializeApp = async () => {
  await connectDB();
};

export default createApp;
