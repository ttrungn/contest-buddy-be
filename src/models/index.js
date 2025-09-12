import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = {};
const basename = path.basename(__filename);

// 🔹 Tạo URL kết nối MongoDB từ biến môi trường `.env`
const mongoURI = process.env.MONGO_URI;

// 🔹 Kết nối MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const dbConnection = mongoose.connection;

dbConnection.on("error", (err) => {
  console.error("❌ MongoDB Connection Error:", err);
});

dbConnection.once("open", () => {
  console.log("✅ MongoDB Connected Successfully!");
});

// 🔹 Import tất cả model trong thư mục `models`
const modelFiles = fs
  .readdirSync(__dirname)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  );

for (const file of modelFiles) {
  try {
    const modelModule = await import(path.join(__dirname, file));
    const model = modelModule.default;
    if (model && model.modelName) {
      // Store model with both the exact modelName and a capitalized version for consistency
      db[model.modelName] = model;

      // Also store with capitalized name for consistent access
      const capitalizedName =
        model.modelName.charAt(0).toUpperCase() + model.modelName.slice(1);
      db[capitalizedName] = model;
    } else {
      console.error(`Model in ${file} has no modelName property:`, model);
    }
  } catch (error) {
    console.error(`Error importing model ${file}:`, error);
  }
}

db.mongoose = mongoose;
db.connection = dbConnection;

export default db;
