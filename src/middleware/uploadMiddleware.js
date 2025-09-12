import multer from "multer";
import path from "path";

// Cấu hình lưu trữ file trong memory
const storage = multer.memoryStorage();

// Kiểm tra file type
const fileFilter = (req, file, cb) => {
  // Chấp nhận các loại hình ảnh phổ biến
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file hình ảnh: jpeg, jpg, png, gif, webp"));
  }
};

// Giới hạn kích thước file (5MB)
const limits = {
  fileSize: 5 * 1024 * 1024,
};

// Middleware upload file
const uploadSingle = multer({
  storage,
  fileFilter,
  limits,
}).fields([
  { name: "avatar", maxCount: 1 },
  { name: "image", maxCount: 1 },
]); // Chấp nhận cả 'avatar' và 'image'

// Middleware xử lý lỗi upload
const handleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Lỗi từ multer
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File quá lớn. Giới hạn 5MB.",
        });
      }
      return res.status(400).json({
        success: false,
        message: `Lỗi upload: ${err.message}`,
      });
    } else if (err) {
      // Lỗi khác
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // Xử lý để tương thích với code cũ (req.file)
    if (req.files) {
      // Ưu tiên lấy file từ field 'image' cho projects
      if (req.files["image"] && req.files["image"][0]) {
        req.file = req.files["image"][0];
      }
      // Nếu không có image, lấy từ avatar
      else if (req.files["avatar"] && req.files["avatar"][0]) {
        req.file = req.files["avatar"][0];
      }
    }

    // Không có lỗi, tiếp tục
    next();
  });
};

export { handleUpload };
