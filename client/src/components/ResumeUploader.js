import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Typography,
  Paper,
  Button,
  LinearProgress,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteIcon from "@mui/icons-material/Delete";

import { uploadResume } from "../api";
import { useResumeContext } from "../context/ResumeContext";

const ResumeUploader = () => {
  const { uploadedResume, setUploadedResume, setError } = useResumeContext();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      // Check if we have a file
      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // Check file type
        const acceptedTypes = [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!acceptedTypes.includes(file.type)) {
          setUploadError("Please upload a PDF or DOCX file only");
          return;
        }

        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          setUploadError("File size exceeds 5MB limit");
          return;
        }

        setIsUploading(true);
        setUploadError(null);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        try {
          // Upload the file
          const resumeData = await uploadResume(file);

          // Update context with uploaded file info
          setUploadedResume({
            file,
            filename: resumeData.filename,
            text: resumeData.text,
            parsedData: null,
          });

          // Complete progress bar
          clearInterval(progressInterval);
          setUploadProgress(100);

          // Reset upload state after a delay
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 500);
        } catch (error) {
          clearInterval(progressInterval);
          setIsUploading(false);
          setUploadProgress(0);
          setUploadError(
            error.response?.data?.message || "Error uploading file"
          );
          setError("Failed to upload resume");
        }
      }
    },
    [setUploadedResume, setError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    disabled: isUploading || !!uploadedResume.file,
  });

  const removeFile = useCallback(() => {
    setUploadedResume({
      file: null,
      filename: "",
      text: "",
      parsedData: null,
    });
    setUploadError(null);
  }, [setUploadedResume]);

  return (
    <Paper className="p-4">
      <Typography variant="h6" className="mb-4">
        Upload Your Resume
      </Typography>

      {uploadError && (
        <Alert severity="error" className="mb-4">
          {uploadError}
        </Alert>
      )}

      {!uploadedResume.file ? (
        <Box
          {...getRootProps()}
          className={`drop-zone p-6 cursor-pointer ${
            isDragActive ? "border-primary-main bg-blue-50" : ""
          }`}
        >
          <input {...getInputProps()} />
          <Box className="flex flex-col items-center">
            <CloudUploadIcon className="text-gray-400 mb-2" fontSize="large" />
            <Typography variant="body1" className="mb-1 text-center">
              {isDragActive
                ? "Drop your resume here"
                : "Drag & drop your resume here, or click to select"}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              className="text-center"
            >
              Supports PDF and DOCX files (max 5MB)
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box className="p-4 border rounded-md bg-gray-50">
          <Box className="flex items-center">
            <InsertDriveFileIcon className="mr-2 text-primary-main" />
            <Box className="flex-grow">
              <Typography variant="body1" className="font-medium">
                {uploadedResume.file.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {(uploadedResume.file.size / 1024).toFixed(2)} KB
              </Typography>
            </Box>
            <Button
              startIcon={<DeleteIcon />}
              color="error"
              onClick={removeFile}
              disabled={isUploading}
            >
              Remove
            </Button>
          </Box>
        </Box>
      )}

      {isUploading && (
        <Box className="mt-4">
          <Box className="flex items-center mb-1">
            <Typography variant="body2" className="mr-2">
              Uploading...
            </Typography>
            <CircularProgress size={16} thickness={4} />
          </Box>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}
    </Paper>
  );
};

export default ResumeUploader;
