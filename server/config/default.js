require("dotenv").config();

module.exports = {
  port: process.env.PORT || 5001,
  geminiApiKey: process.env.GEMINI_API_KEY,
  clientUrl:
    process.env.NODE_ENV === "production"
      ? process.env.CLIENT_URL
      : "http://localhost:3000",
  uploadDir: process.env.UPLOAD_DIR || "server/uploads",
  maxFileSize: 5 * 1024 * 1024, // 5MB
};
