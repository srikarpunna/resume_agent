import React from "react";
import { Link } from "react-router-dom";
import { Box, Typography, Button, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HomeIcon from "@mui/icons-material/Home";

const NotFoundPage = () => {
  return (
    <Box className="flex flex-col items-center justify-center py-12">
      <Paper className="p-8 text-center max-w-md w-full">
        <ErrorOutlineIcon
          className="text-red-500 mb-4"
          style={{ fontSize: 70 }}
        />
        <Typography variant="h4" component="h1" className="font-bold mb-2">
          Page Not Found
        </Typography>
        <Typography variant="body1" className="mb-6 text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          color="primary"
          startIcon={<HomeIcon />}
        >
          Go to Home Page
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFoundPage;
