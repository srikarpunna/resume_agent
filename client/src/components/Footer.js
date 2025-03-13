import React from "react";
import { Box, Container, Typography, Link, Divider } from "@mui/material";

const Footer = () => {
  return (
    <Box className="mt-auto py-6 bg-gray-100">
      <Container maxWidth="lg">
        <Divider className="mb-6" />
        <Box className="flex flex-col md:flex-row justify-between items-center">
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} Resume Optimizer. All rights
            reserved.
          </Typography>
          <Box className="mt-2 md:mt-0">
            <Link href="#" color="inherit" className="mx-2 text-sm">
              Privacy Policy
            </Link>
            <Link href="#" color="inherit" className="mx-2 text-sm">
              Terms of Service
            </Link>
            <Link href="#" color="inherit" className="mx-2 text-sm">
              Contact Us
            </Link>
          </Box>
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          className="mt-2 block text-center"
        >
          Powered by Google Gemini API. This application optimizes resumes for
          job applications.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
