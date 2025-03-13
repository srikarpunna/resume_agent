import React, { createContext, useContext, useState } from "react";
import config from "../utils/config";

// Create context
const ResumeContext = createContext();

// Custom hook to use the resume context
export const useResumeContext = () => useContext(ResumeContext);

// Provider component
export const ResumeProvider = ({ children }) => {
  // State for uploaded resume
  const [uploadedResume, setUploadedResume] = useState({
    file: null,
    filename: "",
    text: "",
    parsedData: null,
  });

  // State for job description
  const [jobDescription, setJobDescription] = useState("");
  const [parsedJobData, setParsedJobData] = useState(null);

  // State for analysis results
  const [matchAnalysis, setMatchAnalysis] = useState(null);
  const [optimizedResume, setOptimizedResume] = useState(null);

  // Processing state
  const [processingStage, setProcessingStage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Mock data toggle
  const [useMockData, setUseMockData] = useState(config.useMockApi);

  // Feedback
  const [userFeedback, setUserFeedback] = useState("");
  const [feedbackApplied, setFeedbackApplied] = useState(false);

  // Reset state
  const resetState = () => {
    setUploadedResume({
      file: null,
      filename: "",
      text: "",
      parsedData: null,
    });
    setJobDescription("");
    setParsedJobData(null);
    setMatchAnalysis(null);
    setOptimizedResume(null);
    setProcessingStage("");
    setIsProcessing(false);
    setError(null);
    setUserFeedback("");
    setFeedbackApplied(false);
  };

  // Values to be provided by the context
  const value = {
    uploadedResume,
    setUploadedResume,
    jobDescription,
    setJobDescription,
    parsedJobData,
    setParsedJobData,
    matchAnalysis,
    setMatchAnalysis,
    optimizedResume,
    setOptimizedResume,
    processingStage,
    setProcessingStage,
    isProcessing,
    setIsProcessing,
    error,
    setError,
    userFeedback,
    setUserFeedback,
    feedbackApplied,
    setFeedbackApplied,
    useMockData,
    setUseMockData,
    resetState,
  };

  return (
    <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>
  );
};
