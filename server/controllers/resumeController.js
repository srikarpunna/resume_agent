const path = require("path");
const fs = require("fs");
const config = require("../config/default");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");
const { createTempDirectory } = require("../utils/fileUtils");

// Ensure upload directories exist
createTempDirectory();

/**
 * Upload and process a resume file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.uploadResume = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: "No files were uploaded" });
    }

    const resumeFile = req.files.resume;
    const fileExtension = path.extname(resumeFile.name).toLowerCase();

    // Check if file type is supported
    if (![".pdf", ".docx"].includes(fileExtension)) {
      return res
        .status(400)
        .json({ message: "Only PDF and DOCX files are supported" });
    }

    // Create unique filename
    const uniqueFilename = `${Date.now()}-${resumeFile.name}`;
    const uploadPath = path.join(config.uploadDir, uniqueFilename);

    // Move file to upload directory
    await resumeFile.mv(uploadPath);

    // Parse the resume content
    let resumeText = "";

    if (fileExtension === ".pdf") {
      const dataBuffer = fs.readFileSync(uploadPath);
      const pdfData = await pdfParse(dataBuffer);
      resumeText = pdfData.text;
    } else if (fileExtension === ".docx") {
      const result = await mammoth.extractRawText({ path: uploadPath });
      resumeText = result.value;
    }

    // Return the file information and text content
    res.json({
      filename: uniqueFilename,
      originalName: resumeFile.name,
      filePath: uploadPath,
      fileType: fileExtension.substring(1), // Remove the dot
      text: resumeText,
    });
  } catch (error) {
    console.error("Error in resume upload:", error);
    res
      .status(500)
      .json({ message: "Error uploading file", error: error.message });
  }
};

/**
 * Get a specific resume file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getResume = (req, res) => {
  try {
    const filePath = path.join(config.uploadDir, req.params.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error("Error retrieving file:", error);
    res
      .status(500)
      .json({ message: "Error retrieving file", error: error.message });
  }
};

/**
 * Delete a specific resume file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteResume = (req, res) => {
  try {
    const filePath = path.join(config.uploadDir, req.params.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    fs.unlinkSync(filePath);
    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res
      .status(500)
      .json({ message: "Error deleting file", error: error.message });
  }
};
