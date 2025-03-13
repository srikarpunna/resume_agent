/**
 * Enhanced text utilities for ATS resume processing
 */

/**
 * Extract JSON from text with advanced error handling and cleanup
 * @param {string} text - The text that may contain JSON
 * @returns {Object|null} - The parsed JSON object or null if extraction fails
 */
const extractJsonFromText = (text) => {
  if (!text) {
    console.error("Empty text provided to extractJsonFromText");
    return null;
  }

  console.log(
    `Attempting to extract JSON from text (length ${text.length} characters)`
  );

  try {
    // First attempt: direct JSON parse if the text is already clean JSON
    if (text.trim().startsWith("{") && text.trim().endsWith("}")) {
      try {
        return JSON.parse(text);
      } catch (error) {
        console.log("Direct JSON parse failed, trying extraction methods");
      }
    }

    // Second attempt: extract JSON from markdown code block
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      const codeBlockContent = codeBlockMatch[1].trim();
      try {
        return JSON.parse(codeBlockContent);
      } catch (blockError) {
        console.log("JSON extraction from code block failed");
      }
    }

    // Third attempt: find the bounds of potential JSON content
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const potentialJson = text.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(potentialJson);
      } catch (boundError) {
        console.log(
          `JSON extraction with boundaries failed: ${boundError.message}`
        );
      }
    }

    // Fourth attempt: aggressive cleaning and fixing
    return extractWithCleaning(text);
  } catch (error) {
    console.error("Error in extractJsonFromText:", error);
    return null;
  }
};

/**
 * Attempt more aggressive cleaning and fixing of JSON text
 * @param {string} text - Text to clean and extract JSON from
 * @returns {Object|null} - Parsed JSON or null
 */
const extractWithCleaning = (text) => {
  try {
    // Remove non-printable characters and normalize whitespace
    let cleanedText = text
      .replace(/[\x00-\x1F\x7F-\x9F]/g, "") // Remove control characters
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width characters
      .replace(/\r?\n/g, " ") // Normalize newlines to spaces
      .replace(/\s+/g, " "); // Normalize multiple spaces

    // Try to find JSON bounds
    const firstBrace = cleanedText.indexOf("{");
    const lastBrace = cleanedText.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanedText = cleanedText.substring(firstBrace, lastBrace + 1);

      // Normalize whitespace around JSON structural elements
      cleanedText = cleanedText
        .replace(/\s*([{}\[\],:])\s*/g, (match, p1) => {
          if (p1 === ":") return ": ";
          if (p1 === ",") return ", ";
          return p1;
        })
        // Remove trailing commas in arrays and objects
        .replace(/,\s*([}\]])/g, "$1")
        // Convert single quotes to double quotes for keys
        .replace(/([{,])\s*'([^']+)'\s*:/g, '$1"$2":');

      // Fix unbalanced structure if needed
      const openBraces = (cleanedText.match(/{/g) || []).length;
      const closeBraces = (cleanedText.match(/}/g) || []).length;
      const openBrackets = (cleanedText.match(/\[/g) || []).length;
      const closeBrackets = (cleanedText.match(/\]/g) || []).length;

      if (openBraces > closeBraces) {
        cleanedText += "}".repeat(openBraces - closeBraces);
      }

      if (openBrackets > closeBrackets) {
        // This is a simplified approach - in reality this is very difficult to fix correctly
        cleanedText = cleanedText.replace(/\[\s*(?=\}|$)/g, "[]");
      }

      try {
        return JSON.parse(cleanedText);
      } catch (cleanError) {
        console.log(`Cleaning attempt failed: ${cleanError.message}`);
      }
    }

    return null;
  } catch (error) {
    console.error("Error in extractWithCleaning:", error);
    return null;
  }
};

/**
 * Clean and normalize text for processing
 * @param {string} text - Input text
 * @returns {string} - Cleaned text
 */
const cleanText = (text) => {
  if (!text) return "";

  return text
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim(); // Remove leading/trailing whitespace
};

/**
 * Extract key information from text using regular expressions
 * @param {string} text - Text to extract information from
 * @param {Object} patterns - Object with named regex patterns
 * @returns {Object} - Object with extracted information
 */
const extractPatterns = (text, patterns) => {
  const result = {};

  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match && match[1]) {
      result[key] = match[1].trim();
    } else {
      result[key] = null;
    }
  }

  return result;
};

/**
 * Calculate ATS compatibility score for a resume against job requirements
 * @param {Object} resumeData - The parsed resume data
 * @param {Object} jobData - The parsed job requirements
 * @returns {Object} - ATS score and suggestions
 */
const calculateAtsScore = (resumeData, jobData) => {
  if (!resumeData || !jobData) {
    return {
      score: 0,
      matches: [],
      missingKeywords: [],
      suggestions: ["Incomplete data provided for ATS scoring"],
    };
  }

  // Extract all text from the resume for keyword matching
  const resumeText = JSON.stringify(resumeData).toLowerCase();

  // Collect all important keywords from the job data
  const mustHaveKeywords = jobData.keywords?.mustHave || [];
  const technicalSkills = jobData.requiredSkills?.technical || [];
  const domainSkills = jobData.requiredSkills?.domain || [];
  const tools = jobData.requiredSkills?.tools || [];
  const atsKeywords = jobData.atsKeywords || [];

  // Combine all keywords into a single array
  const allKeywords = [
    ...mustHaveKeywords,
    ...technicalSkills,
    ...domainSkills,
    ...tools,
    ...atsKeywords,
  ].filter(Boolean); // Remove any undefined or null values

  // Remove duplicates
  const uniqueKeywords = [...new Set(allKeywords)];

  // Find matches and missing keywords
  const matches = [];
  const missingKeywords = [];

  uniqueKeywords.forEach((keyword) => {
    if (resumeText.includes(keyword.toLowerCase())) {
      matches.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });

  // Calculate score as percentage of matching keywords
  const score =
    uniqueKeywords.length > 0
      ? Math.round((matches.length / uniqueKeywords.length) * 100)
      : 0;

  // Generate suggestions based on missing keywords
  const suggestions = [];

  if (missingKeywords.length > 0) {
    suggestions.push(
      `Add these missing keywords to improve ATS match: ${missingKeywords
        .slice(0, 5)
        .join(", ")}${missingKeywords.length > 5 ? "..." : ""}`
    );
  }

  if (score < 50) {
    suggestions.push(
      "Your resume needs significant keyword optimization for this job"
    );
  } else if (score < 75) {
    suggestions.push(
      "Your resume has moderate keyword match, but could use improvement"
    );
  } else {
    suggestions.push("Your resume has good keyword alignment with this job");
  }

  return {
    score,
    matches,
    missingKeywords,
    suggestions,
  };
};

/**
 * Generate ATS-friendly section titles and formatting recommendations
 * @returns {Object} - ATS formatting recommendations
 */
const getAtsFormattingRecommendations = () => {
  return {
    recommendedSectionTitles: {
      summary: ["Professional Summary", "Summary", "Profile"],
      experience: ["Work Experience", "Professional Experience", "Experience"],
      education: ["Education", "Academic Background"],
      skills: ["Skills", "Technical Skills", "Core Competencies"],
      certifications: ["Certifications", "Professional Certifications"],
    },
    formattingTips: [
      "Use standard section headings that ATS systems can easily recognize",
      "Avoid using tables, columns, headers/footers, or text boxes",
      "Use standard fonts like Arial, Calibri, or Times New Roman",
      "Save your resume as a .docx or .pdf file",
      "Include your name and contact information at the top of the document",
      "Use bullet points for listing responsibilities and achievements",
      "Incorporate exact keywords from the job description",
    ],
  };
};

// Export all functions
module.exports = {
  extractJsonFromText,
  calculateAtsScore,
  getAtsFormattingRecommendations,
  cleanText,
  extractPatterns,
};
