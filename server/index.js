const express = require("express");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
const resumeRoutes = require("./routes/resumeRoutes");
const geminiRoutes = require("./routes/geminiRoutes");
const { createTempDirectory, cleanTempFiles } = require("./utils/fileUtils");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', process.env.CLIENT_URL || 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json({ limit: "10mb" })); // Increase JSON payload limit
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "uploads/temp"),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  })
);

// Create upload directories if they don't exist
createTempDirectory();

// API Routes
app.use("/api/resumes", resumeRoutes);
app.use("/api/gemini", geminiRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    message: "Server error",
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// Schedule regular cleanup of temp files (older than 6 hours)
setInterval(() => {
  console.log("Running scheduled cleanup of temporary files");
  cleanTempFiles(6);
}, 60 * 60 * 1000); // Every hour

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  // Set static folder with absolute path
  const clientBuildPath = path.resolve(__dirname, "../client/build");
  console.log("Serving static files from:", clientBuildPath);
  
  app.use(express.static(clientBuildPath));

  app.get("*", (req, res) => {
    const indexHtmlPath = path.resolve(clientBuildPath, "index.html");
    console.log("Serving index.html from:", indexHtmlPath);
    res.sendFile(indexHtmlPath);
  });
}

// Print key environment variables (except secrets)
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT: ${PORT}`);
console.log(
  `Gemini API key configured: ${Boolean(process.env.GEMINI_API_KEY)}`
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
