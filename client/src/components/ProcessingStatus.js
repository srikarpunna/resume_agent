import React from "react";
import {
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useResumeContext } from "../context/ResumeContext";

// Define the steps in the resume optimization process
const steps = [
  "Analyzing Resume",
  "Analyzing Job Description",
  "Matching Resume to Job",
  "Optimizing Resume",
  "Ready for Review",
];

const ProcessingStatus = () => {
  const { processingStage, isProcessing, error, resetState } =
    useResumeContext();

  // Map processing stage to step index
  const getActiveStep = () => {
    switch (processingStage) {
      case "analyzing-resume":
        return 0;
      case "analyzing-job":
        return 1;
      case "matching":
        return 2;
      case "optimizing":
        return 3;
      case "complete":
        return 4;
      default:
        return -1;
    }
  };

  const activeStep = getActiveStep();

  // Show nothing if we haven't started processing yet
  if (activeStep === -1 && !error) {
    return null;
  }

  return (
    <Paper className="p-4 mb-6">
      <Typography variant="h6" className="mb-4">
        Processing Status
      </Typography>

      {error ? (
        <Box>
          <Alert
            severity="error"
            className="mb-4"
            action={
              <Button color="inherit" size="small" onClick={resetState}>
                Try Again
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      ) : (
        <>
          <Stepper activeStep={activeStep} alternativeLabel className="mb-4">
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {isProcessing && (
            <Box className="flex items-center justify-center py-2">
              <CircularProgress size={20} className="mr-2" />
              <Typography variant="body2" color="textSecondary">
                {activeStep >= 0 && activeStep < steps.length
                  ? `Processing: ${steps[activeStep]}`
                  : "Processing..."}
              </Typography>
            </Box>
          )}

          {activeStep === 4 && !isProcessing && (
            <Alert severity="success">
              Resume optimization complete! Review the results below.
            </Alert>
          )}
        </>
      )}
    </Paper>
  );
};

export default ProcessingStatus;
