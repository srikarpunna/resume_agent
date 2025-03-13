const express = require("express");
const router = express.Router();
const geminiController = require("../controllers/geminiController");

// Document Analyzer Agent Endpoint
router.post("/analyze-resume", geminiController.analyzeResume);

// Job Description Analyzer Agent Endpoint
router.post("/analyze-job", geminiController.analyzeJob);

// Resume-Job Matcher Agent Endpoint
router.post("/match-resume-job", geminiController.matchResumeJob);

// Enhancement Agent Endpoint
router.post("/optimize-resume", geminiController.optimizeResume);

// Feedback Interpreter Agent Endpoint
router.post("/process-feedback", geminiController.processFeedback);

module.exports = router;
