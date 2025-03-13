import React from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import DeleteIcon from "@mui/icons-material/Delete";

import { useResumeContext } from "../context/ResumeContext";

const JobDescriptionInput = () => {
  const { jobDescription, setJobDescription, uploadedResume, isProcessing } =
    useResumeContext();

  return (
    <Paper className="p-4">
      <Box className="flex items-center mb-4">
        <WorkIcon className="mr-2 text-primary-main" />
        <Typography variant="h6">Job Description</Typography>
      </Box>

      {!uploadedResume.file && (
        <Alert severity="info" className="mb-4">
          Upload your resume first before adding a job description
        </Alert>
      )}

      <TextField
        label="Paste the job description here"
        multiline
        rows={8}
        fullWidth
        variant="outlined"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        disabled={!uploadedResume.file || isProcessing}
        placeholder="Copy and paste the complete job description from the job posting..."
        className="mb-3"
      />

      {jobDescription && (
        <Box className="flex justify-end">
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => setJobDescription("")}
            disabled={isProcessing}
          >
            Clear
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default JobDescriptionInput;
