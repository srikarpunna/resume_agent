import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
} from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import DescriptionIcon from "@mui/icons-material/Description";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import FindReplaceIcon from "@mui/icons-material/FindReplace";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const FeatureCard = ({ icon, title, description }) => {
  return (
    <Card variant="outlined" className="h-full">
      <CardContent className="flex flex-col h-full p-6">
        <Box className="text-primary-main mb-4">{icon}</Box>
        <Typography variant="h6" className="font-bold mb-2">
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary" className="flex-grow">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <Box className="pb-10">
      {/* Hero Section */}
      <Paper className="bg-gradient-to-r from-blue-100 to-purple-100 p-8 rounded-lg mb-8">
        <Box className="max-w-2xl mx-auto text-center">
          <Typography variant="h3" component="h1" className="font-bold mb-4">
            Optimize Your Resume with AI
          </Typography>
          <Typography variant="h6" className="mb-6 text-gray-700">
            Use Google's Gemini AI to tailor your resume for specific job
            descriptions and increase your chances of landing interviews.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<LaunchIcon />}
            onClick={() => navigate("/optimize")}
            className="py-3 px-6"
          >
            Get Started
          </Button>

          <Box className="flex items-center justify-center mt-4">
            <SmartToyIcon className="mr-2 text-purple-700" />
            <Typography variant="body2" className="text-purple-700 font-medium">
              Powered by Google Gemini AI
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Features Section */}
      <Typography
        variant="h4"
        component="h2"
        className="font-bold mb-6 text-center"
      >
        How It Works
      </Typography>

      <Grid container spacing={3} className="mb-10">
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard
            icon={<DescriptionIcon fontSize="large" />}
            title="Upload Resume"
            description="Upload your existing resume in PDF or DOCX format. Our AI will extract and analyze your information."
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard
            icon={<AnalyticsIcon fontSize="large" />}
            title="Add Job Description"
            description="Paste the job description you're applying for. The AI will identify key requirements and skills."
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard
            icon={<FindReplaceIcon fontSize="large" />}
            title="Optimize Content"
            description="Our AI analyzes the match between your resume and job requirements, then optimizes your content accordingly."
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FeatureCard
            icon={<CloudDownloadIcon fontSize="large" />}
            title="Download Result"
            description="Review the optimized resume, provide feedback if needed, and download the final version as a PDF."
          />
        </Grid>
      </Grid>

      {/* CTA Section */}
      <Box className="text-center mt-10">
        <Typography variant="h5" className="font-bold mb-4">
          Ready to optimize your job applications?
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate("/optimize")}
          className="px-6"
        >
          Optimize My Resume
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;
