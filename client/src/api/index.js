import axios from "axios";
import config from "../utils/config";
import * as mockApi from "./mockApi";

// Only import and use the real API if we're not using mocks
const useRealApi = !config.useMockApi;

// Create axios instance with base URL
const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Real API implementations
const realApiImplementations = {
  // Resume API calls
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append("resume", file);
  
    const response = await axios.post(`${config.apiBaseUrl}/resumes/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  
    return response.data;
  },
  
  getResume: async (filename) => {
    const response = await api.get(`/resumes/${filename}`);
    return response.data;
  },
  
  deleteResume: async (filename) => {
    const response = await api.delete(`/resumes/${filename}`);
    return response.data;
  },
  
  // Gemini API calls
  analyzeResume: async (resumeText) => {
    const response = await api.post("/gemini/analyze-resume", { resumeText });
    return response.data;
  },
  
  analyzeJob: async (jobDescription) => {
    const response = await api.post("/gemini/analyze-job", { jobDescription });
    return response.data;
  },
  
  matchResumeJob: async (resumeData, jobData) => {
    const response = await api.post("/gemini/match-resume-job", {
      resumeData,
      jobData,
    });
    return response.data;
  },
  
  optimizeResume: async (resumeData, jobData, matchAnalysis) => {
    const response = await api.post("/gemini/optimize-resume", {
      resumeData,
      jobData,
      matchAnalysis,
    });
    return response.data;
  },
  
  processFeedback: async (feedback, currentResume) => {
    const response = await api.post("/gemini/process-feedback", {
      feedback,
      currentResume,
    });
    return response.data;
  },
};

// Export the appropriate API implementation based on configuration
const selectedApi = useRealApi ? realApiImplementations : mockApi;

// Export all API functions
export const {
  uploadResume,
  getResume,
  deleteResume,
  analyzeResume,
  analyzeJob,
  matchResumeJob,
  optimizeResume,
  processFeedback
} = selectedApi;

// For debugging - log which API implementation is being used
console.log(`Using ${useRealApi ? 'REAL' : 'MOCK'} API implementation`);
