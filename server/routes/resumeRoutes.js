const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const config = require("../config/default");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");
const resumeController = require("../controllers/resumeController");

// Handle resume upload
router.post("/upload", resumeController.uploadResume);

// Get uploaded resume
router.get("/:filename", resumeController.getResume);

// Delete resume
router.delete("/:filename", resumeController.deleteResume);

module.exports = router;
