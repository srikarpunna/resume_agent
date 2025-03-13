import axios from "axios";
import config from "../utils/config";
import * as mockApi from "./mockApi";

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

// Create dynamic proxy functions that check config.useMockApi each time
export const uploadResume = async (file) => {
  return config.useMockApi ? mockApi.uploadResume(file) : realApiImplementations.uploadResume(file);
};

export const getResume = async (filename) => {
  return config.useMockApi ? mockApi.getResume(filename) : realApiImplementations.getResume(filename);
};

export const deleteResume = async (filename) => {
  return config.useMockApi ? mockApi.deleteResume(filename) : realApiImplementations.deleteResume(filename);
};

export const analyzeResume = async (resumeText) => {
  return config.useMockApi ? mockApi.analyzeResume(resumeText) : realApiImplementations.analyzeResume(resumeText);
};

export const analyzeJob = async (jobDescription) => {
  return config.useMockApi ? mockApi.analyzeJob(jobDescription) : realApiImplementations.analyzeJob(jobDescription);
};

export const matchResumeJob = async (resumeData, jobData) => {
  return config.useMockApi ? mockApi.matchResumeJob(resumeData, jobData) : realApiImplementations.matchResumeJob(resumeData, jobData);
};

export const optimizeResume = async (resumeData, jobData, matchAnalysis) => {
  return config.useMockApi ? mockApi.optimizeResume(resumeData, jobData, matchAnalysis) : realApiImplementations.optimizeResume(resumeData, jobData, matchAnalysis);
};

export const processFeedback = async (feedback, currentResume) => {
  return config.useMockApi ? mockApi.processFeedback(feedback, currentResume) : realApiImplementations.processFeedback(feedback, currentResume);
};
