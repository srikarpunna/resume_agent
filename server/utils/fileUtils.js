const fs = require("fs");
const path = require("path");
const config = require("../config/default");

/**
 * Create temporary and upload directories if they don't exist
 */
exports.createTempDirectory = () => {
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync(config.uploadDir)) {
    fs.mkdirSync(config.uploadDir, { recursive: true });
  }

  // Create temp directory inside uploads
  const tempDir = path.join(config.uploadDir, "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
};

/**
 * Clean temporary files that are older than a specified time
 * @param {number} maxAgeMs - Maximum age of files in milliseconds before they are cleaned
 */
exports.cleanTempFiles = (maxAgeMs = 24 * 60 * 60 * 1000) => {
  // Default 24 hours
  const tempDir = path.join(config.uploadDir, "temp");
  if (!fs.existsSync(tempDir)) return;

  const files = fs.readdirSync(tempDir);
  const now = Date.now();

  files.forEach((file) => {
    const filePath = path.join(tempDir, file);

    try {
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.mtimeMs;

      if (fileAge > maxAgeMs) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned old temp file: ${file}`);
      }
    } catch (error) {
      console.error(`Error cleaning temp file ${file}:`, error);
    }
  });
};
