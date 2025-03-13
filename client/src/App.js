import React from "react";
import { Routes, Route } from "react-router-dom";
import { Box, Container } from "@mui/material";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import HomePage from "./pages/HomePage";
import OptimizePage from "./pages/OptimizePage";
import ResultsPage from "./pages/ResultsPage";
import NotFoundPage from "./pages/NotFoundPage";

// Context
import { ResumeProvider } from "./context/ResumeContext";

function App() {
  return (
    <ResumeProvider>
      <Box className="flex flex-col min-h-screen">
        <Header />
        <Container className="flex-grow my-8" maxWidth="lg">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/optimize" element={<OptimizePage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Container>
        <Footer />
      </Box>
    </ResumeProvider>
  );
}

export default App;
