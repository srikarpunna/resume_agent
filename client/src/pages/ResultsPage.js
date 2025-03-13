import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Divider, Paper } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

// Components
import ResumeComparison from "../components/ResumeComparison";
import ResumeDownload from "../components/ResumeDownload";
import ProcessingStatus from "../components/ProcessingStatus";

// Context
import { useResumeContext } from "../context/ResumeContext";

const ResultsPage = () => {
  const navigate = useNavigate();
  const { uploadedResume, optimizedResume, resetState } = useResumeContext();

  // Redirect to optimize page if no optimized resume is available
  useEffect(() => {
    if (!optimizedResume) {
      navigate("/optimize");
    }
  }, [optimizedResume, navigate]);

  const handleStartOver = () => {
    resetState();
    navigate("/optimize");
  };

  if (!uploadedResume.parsedData || !optimizedResume) {
    return null;
  }

  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" component="h1" className="font-bold">
          Optimization Results
        </Typography>
        <Box className="flex gap-2">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/optimize")}
            variant="outlined"
          >
            Back
          </Button>
          <Button
            startIcon={<RestartAltIcon />}
            onClick={handleStartOver}
            color="secondary"
            variant="outlined"
          >
            Start Over
          </Button>
        </Box>
      </Box>

      <ProcessingStatus />

      {/* Resume Comparison */}
      <ResumeComparison />

      {/* Resume Download (positioned below comparison) */}
      <ResumeDownload />

      <Box className="mt-10 text-center">
        <Typography variant="h6" className="mb-4">
          Need to make another optimization?
        </Typography>
        <Button variant="contained" color="primary" onClick={handleStartOver}>
          Optimize Another Resume
        </Button>
      </Box>
    </Box>
  );
};

export default ResultsPage;
