/**
 * Centralized export of all prompt generator functions
 * This makes it easy to import prompts from one location
 */

const generateAnalyzeResumePrompt = require('./analyzeResume');
const generateAnalyzeJobPrompt = require('./analyzeJob');
const generateMatchResumeJobPrompt = require('./matchResumeJob');
const generateOptimizeResumePrompt = require('./optimizeResume');
const generateProcessFeedbackPrompt = require('./processFeedback');

module.exports = {
  generateAnalyzeResumePrompt,
  generateAnalyzeJobPrompt,
  generateMatchResumeJobPrompt,
  generateOptimizeResumePrompt,
  generateProcessFeedbackPrompt
}; 