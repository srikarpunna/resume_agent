import React from "react";
import { Box, Typography, Chip } from "@mui/material";

// Debug helper to visualize special characters
const debugCharCodes = (str) => {
  if (!str) return "";
  return Array.from(str)
    .map((char) => char.charCodeAt(0).toString(16))
    .join(" ");
};

// Enhanced helper function to clean content of ALL special characters
const cleanContent = (content) => {
  if (!content) return "";
  return (
    content
      // Remove ALL non-alphanumeric characters at the beginning of lines
      .replace(/^[^\w\s]*/gm, "")
      // Remove all non-visible characters and special bullets
      .replace(
        /[\u0000-\u001F\u007F-\u009F\u2000-\u200F\u2028-\u202F\u205F-\u206F\uFFFD]/g,
        ""
      )
      .replace(
        /[•\u2022\u2023\u2043\u2024\u2025\u2043\u2044\u2045\u00B7\u25E6\u2219]/g,
        ""
      ) // Remove special bullet characters
      .replace(/^[\s]*[•\-\*"']\s*/gm, "") // Remove any bullet points or quotes at start of lines
      .trim()
  );
};

// Enhanced helper function to clean line content
const cleanLine = (line) => {
  if (!line) return "";

  // More aggressive cleaning for the specific Unicode character issue
  // First remove any non-alphanumeric character at the beginning
  let cleaned = line.replace(/^[^\w\s]+/, "");

  // Then apply standard cleaning
  cleaned = cleaned
    // Remove all non-visible characters and special bullets
    .replace(
      /[\u0000-\u001F\u007F-\u009F\u2000-\u200F\u2028-\u202F\u205F-\u206F\uFFFD]/g,
      ""
    )
    .replace(
      /[•\u2022\u2023\u2043\u2024\u2025\u2043\u2044\u2045\u00B7\u25E6\u2219]/g,
      ""
    ) // Remove special bullet characters
    .replace(/^[\s]*[•\-\*"']\s*/, "") // Remove any bullet points or quotes at start of line
    .trim();

  return cleaned;
};

// Helper function to identify differences between original and optimized content
const getContentDifference = (original, optimized) => {
  if (!original || !optimized) return { hasChanges: false, content: optimized };

  const cleanOriginal = cleanContent(original);
  const cleanOptimized = cleanContent(optimized);

  // For simple string comparison
  if (typeof original === "string" && typeof optimized === "string") {
    return {
      hasChanges: cleanOriginal !== cleanOptimized,
      content: cleanOptimized,
    };
  }

  return { hasChanges: false, content: cleanOptimized };
};

/**
 * SummarySection component that renders different types of summaries with their original format
 */
const SummarySection = ({ summary, originalSummary, isOptimized = false }) => {
  if (!summary) return null;

  // Clean the content before comparison
  const cleanSummaryContent = cleanContent(summary.content);
  const cleanOriginalContent = cleanContent(originalSummary?.content);

  const { hasChanges } = originalSummary
    ? getContentDifference(cleanOriginalContent, cleanSummaryContent)
    : { hasChanges: false };

  const shouldHighlight = isOptimized && hasChanges;

  const renderContent = () => {
    switch (summary.format) {
      case "bullets":
        return (
          <Box component="ul" className="list-none pl-4">
            {summary.content.split("\n").map((line, index) => {
              // Aggressively clean any non-standard characters at the beginning
              let processedLine = line;

              // First replace any box or Unicode replacement characters
              processedLine = processedLine.replace(
                /^[\uFFFD\u25A1\u2B1C\u2B1B]?\s*/,
                ""
              );

              // Then replace any bullet character
              processedLine = processedLine.replace(
                /^[•\u2022\u25E6\u2219]?\s*/,
                ""
              );

              // Finally clean the line
              const cleanedLine = cleanLine(processedLine);

              if (!cleanedLine) return null;

              return (
                <Box
                  key={index}
                  component="li"
                  className={`flex items-start ${
                    shouldHighlight ? "highlight-optimized" : ""
                  }`}
                >
                  <Typography variant="body2" className="mr-2">
                    •
                  </Typography>
                  <Typography variant="body2">{cleanedLine}</Typography>
                </Box>
              );
            })}
          </Box>
        );

      case "mixed":
        return (
          <Box>
            {summary.content.split("\n").map((line, index) => {
              const cleanedLine = cleanLine(line);
              if (!cleanedLine) return null;

              // Check if the original line had a bullet point or quote
              const isBullet =
                /^[\s]*[•\-\*\u2022\u2023\u2043\u2024\u2025\u2043\u2044\u2045\u00B7"']/u.test(
                  line
                );

              if (isBullet) {
                return (
                  <Box
                    key={index}
                    className={`flex items-start ${
                      shouldHighlight ? "highlight-optimized" : ""
                    }`}
                  >
                    <Typography variant="body2" className="mr-2">
                      •
                    </Typography>
                    <Typography variant="body2">{cleanedLine}</Typography>
                  </Box>
                );
              }

              return (
                <Typography
                  key={index}
                  variant="body2"
                  className={`${shouldHighlight ? "highlight-optimized" : ""}`}
                >
                  {cleanedLine}
                </Typography>
              );
            })}
          </Box>
        );

      default: // paragraph
        return (
          <Typography
            variant="body2"
            className={`whitespace-pre-line ${
              shouldHighlight ? "highlight-optimized" : ""
            }`}
          >
            {cleanContent(summary.content)}
          </Typography>
        );
    }
  };

  return (
    <Box className="mb-4">
      <Typography
        variant="subtitle1"
        className={`font-bold mb-1 ${
          shouldHighlight ? "text-primary-main" : ""
        }`}
      >
        {summary.heading}
        {shouldHighlight && (
          <Chip
            label="Optimized"
            size="small"
            color="primary"
            className="ml-2"
          />
        )}
      </Typography>
      {renderContent()}
    </Box>
  );
};

export default SummarySection;
