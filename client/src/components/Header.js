import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <AppBar
      position="static"
      color="default"
      elevation={1}
      className="bg-white"
    >
      <Container maxWidth="lg">
        <Toolbar className="px-0">
          {/* Logo and Title */}
          <Box
            className="flex items-center"
            component={RouterLink}
            to="/"
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            <DescriptionIcon
              className="mr-2 text-primary-main"
              fontSize="large"
            />
            <Typography
              variant="h5"
              component="div"
              className="font-bold flex items-center"
            >
              Resume Optimizer
              <Box className="flex items-center ml-2 bg-purple-100 px-2 py-0.5 rounded-md">
                <SmartToyIcon
                  className="mr-1 text-purple-700"
                  fontSize="small"
                />
                <Typography
                  variant="caption"
                  className="text-purple-700 font-semibold"
                >
                  Gemini Powered
                </Typography>
              </Box>
            </Typography>
          </Box>

          {/* Navigation */}
          <Box className="ml-auto flex space-x-2">
            <Button
              component={RouterLink}
              to="/"
              color="inherit"
              className="font-medium"
            >
              Home
            </Button>
            <Button
              component={RouterLink}
              to="/optimize"
              variant="contained"
              color="primary"
              className={isMobile ? "px-2" : "px-4"}
            >
              {isMobile ? "Optimize" : "Optimize Resume"}
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
