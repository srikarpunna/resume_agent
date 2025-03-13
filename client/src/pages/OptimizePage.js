import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Divider,
  LinearProgress,
  Alert,
  Chip,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import BugReportIcon from "@mui/icons-material/BugReport";

// Components
import ResumeUploader from "../components/ResumeUploader";
import JobDescriptionInput from "../components/JobDescriptionInput";
import ProcessingStatus from "../components/ProcessingStatus";

// API
import {
  analyzeResume,
  analyzeJob,
  matchResumeJob,
  optimizeResume,
} from "../api";

// Config
import config from "../utils/config";

// Context
import { useResumeContext } from "../context/ResumeContext";

const OptimizePage = () => {
  const navigate = useNavigate();
  const {
    uploadedResume,
    setUploadedResume,
    jobDescription,
    parsedJobData,
    setParsedJobData,
    setMatchAnalysis,
    setOptimizedResume,
    processingStage,
    setProcessingStage,
    isProcessing,
    setIsProcessing,
    error,
    setError,
  } = useResumeContext();

  const handleOptimizeResume = async () => {
    if (
      !uploadedResume.text ||
      !jobDescription ||
      jobDescription.trim().length < 50
    ) {
      setError("Please upload a resume and enter a complete job description");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Analyze Resume (moved from useEffect to here)
      setProcessingStage("analyzing-resume");
      const parsedResumeData = await analyzeResume(uploadedResume.text);

      // Update resume state with parsed data
      setUploadedResume((prev) => ({
        ...prev,
        parsedData: parsedResumeData,
      }));

      // Step 2: Analyze Job Description
      setProcessingStage("analyzing-job");
      const jobData = await analyzeJob(jobDescription);
      setParsedJobData(jobData);

      // Step 3: Match Resume to Job
      setProcessingStage("matching");
      const matchResult = await matchResumeJob(parsedResumeData, jobData);
      setMatchAnalysis(matchResult);

      // Step 4: Optimize Resume
      setProcessingStage("optimizing");
      const optimizedResult = await optimizeResume(
        parsedResumeData,
        jobData,
        matchResult
      );
      setOptimizedResume(optimizedResult);

      // Complete
      setProcessingStage("complete");

      // Navigate to results page
      navigate("/results");
    } catch (error) {
      console.error("Error optimizing resume:", error);
      setError("Failed to optimize resume. Please try again.");
      setProcessingStage("");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" className="font-bold mb-2">
        Resume Optimization
        {config.useMockApi && (
          <Chip 
            icon={<BugReportIcon />} 
            label="DEMO MODE" 
            size="small" 
            color="warning" 
            className="ml-2"
          />
        )}
      </Typography>
      <Typography variant="body1" color="textSecondary" className="mb-6">
        Upload your resume and paste a job description to get an AI-optimized
        version tailored for the position.
        {config.useMockApi && (
          <Box className="mt-2 text-amber-500 text-sm">
            <strong>Note:</strong> Currently running in demo mode with mock data. API calls are simulated.
          </Box>
        )}
      </Typography>

      <ProcessingStatus />

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <ResumeUploader />
        </Grid>
        <Grid item xs={12} md={6}>
          <JobDescriptionInput />
        </Grid>
      </Grid>

      <Box className="mt-6 mb-4">
        <Divider />
      </Box>

      {!uploadedResume.file && (
        <Alert severity="info" className="mb-4">
          Please upload your resume to get started.
        </Alert>
      )}

      {uploadedResume.file &&
        (!jobDescription || jobDescription.trim().length < 50) && (
          <Alert severity="info" className="mb-4">
            Please enter a complete job description (at least 50 characters).
          </Alert>
        )}

      <Box className="flex justify-center">
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AutoFixHighIcon />}
          onClick={handleOptimizeResume}
          disabled={
            isProcessing ||
            !uploadedResume.text ||
            !jobDescription ||
            jobDescription.trim().length < 50
          }
          className="px-6"
        >
          {isProcessing ? "Processing..." : "Optimize Resume"}
        </Button>
        
        {config.useMockApi && (
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            onClick={async () => {
              setIsProcessing(true);
              // Set some dummy data
              if (!uploadedResume.text) {
                const dummyText = "This is a dummy resume text for testing.";
                setUploadedResume(prev => ({...prev, text: dummyText}));
              }
              
              // Load mock data directly
              const parsedResumeData = await analyzeResume("");
              setUploadedResume(prev => ({...prev, parsedData: parsedResumeData}));
              
              const jobData = await analyzeJob("This is a dummy job description for testing purposes, at least 50 characters.");
              setParsedJobData(jobData);
              
              const matchResult = await matchResumeJob(parsedResumeData, jobData);
              setMatchAnalysis(matchResult);
              
              const optimizedResult = await optimizeResume(parsedResumeData, jobData, matchResult);
              setOptimizedResume(optimizedResult);
              
              setIsProcessing(false);
              navigate("/results");
            }}
            className="ml-4 px-6"
          >
            Test Results (Demo)
          </Button>
        )}
      </Box>

      {isProcessing && (
        <Box className="mt-4">
          <LinearProgress />
        </Box>
      )}
    </Box>
  );
};

export default OptimizePage;
