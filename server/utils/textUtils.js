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
    console.log("Attempting aggressive JSON cleaning...");

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

      // Log portion of JSON before cleaning for diagnostic purposes
      if (cleanedText.length > 200) {
        console.log(
          "Sample of JSON before cleaning:",
          cleanedText.substring(0, 100) +
            "..." +
            cleanedText.substring(cleanedText.length - 100)
        );
      }

      // Normalize whitespace around JSON structural elements
      cleanedText = cleanedText
        .replace(/\s*([{}\[\],:])\s*/g, (match, p1) => {
          if (p1 === ":") return ": ";
          if (p1 === ",") return ", ";
          return p1;
        })
        // Remove trailing commas in arrays and objects
        .replace(/,\s*([}\]])/g, "$1")
        // Fix common issue with arrays - trailing comma after last element
        .replace(/,(\s*\])/g, "$1")
        // Fix missing commas between array elements that are objects
        .replace(/}(\s*){/g, "}, $1{")
        // Fix missing commas between array elements that are strings/numbers
        .replace(/"(\s*)["{[](?!:)/g, '", $1')
        // Convert single quotes to double quotes for keys and string values
        .replace(/([{,]\s*)'([^']+)'\s*:/g, '$1"$2":')
        .replace(/:\s*'([^']*)'/g, ': "$1"');

      // Fix unbalanced structure if needed
      const openBraces = (cleanedText.match(/{/g) || []).length;
      const closeBraces = (cleanedText.match(/}/g) || []).length;
      const openBrackets = (cleanedText.match(/\[/g) || []).length;
      const closeBrackets = (cleanedText.match(/\]/g) || []).length;

      console.log(
        `JSON structure check - Braces: ${openBraces}/${closeBraces}, Brackets: ${openBrackets}/${closeBrackets}, Quotes: ${
          (cleanedText.match(/"/g) || []).length
        }`
      );

      // Fix unbalanced braces/brackets
      if (openBraces > closeBraces) {
        cleanedText += "}".repeat(openBraces - closeBraces);
      }

      if (openBrackets > closeBrackets) {
        // Attempt to fix unclosed arrays
        // First try to find arrays that should be closed
        let fixedText = cleanedText;
        let unclosedArrays = openBrackets - closeBrackets;

        // Use a regex to find potential unclosed arrays
        const arrayRegex = /\[[^\]]*(?=\}|$)/g;
        let match;
        let matchCount = 0;

        while (
          (match = arrayRegex.exec(fixedText)) !== null &&
          matchCount < unclosedArrays
        ) {
          const pos = match.index + match[0].length;
          fixedText =
            fixedText.substring(0, pos) + "]" + fixedText.substring(pos);
          matchCount++;
          // Update the regex lastIndex to account for the inserted bracket
          arrayRegex.lastIndex += 1;
        }

        // If we couldn't find all unclosed arrays, add remaining closing brackets at the end
        if (matchCount < unclosedArrays) {
          fixedText += "]".repeat(unclosedArrays - matchCount);
        }

        cleanedText = fixedText;
      }

      // Check for and fix unterminated string literals
      const quoteCounts = (cleanedText.match(/"/g) || []).length;
      if (quoteCounts % 2 !== 0) {
        console.log("Detected unbalanced quotes, attempting to fix...");
        // Try to find unterminated strings and fix them
        cleanedText = cleanedText.replace(/("(?:[^"\\]|\\.)*$)/g, '$1"');
      }

      // Final attempt at manual repair for array elements
      try {
        return JSON.parse(cleanedText);
      } catch (error) {
        if (error.message.includes("position")) {
          const errorPosition = parseInt(
            error.message.match(/position (\d+)/)?.[1]
          );
          if (!isNaN(errorPosition)) {
            console.log(
              `Error at position ${errorPosition}, attempting targeted fix...`
            );

            // Extract the problematic segment around the error
            const start = Math.max(0, errorPosition - 20);
            const end = Math.min(cleanedText.length, errorPosition + 20);
            const segment = cleanedText.substring(start, end);
            console.log(`Problematic segment: "${segment}"`);

            // Try to fix common issues at the error position
            if (errorPosition < cleanedText.length) {
              // Check if we're missing a comma between array elements
              const beforeError = cleanedText.substring(
                Math.max(0, errorPosition - 5),
                errorPosition
              );
              const afterError = cleanedText.substring(
                errorPosition,
                Math.min(errorPosition + 5, cleanedText.length)
              );

              if (/["\d}][\s\n]*["{[]/.test(beforeError + afterError)) {
                // Missing comma between array elements
                cleanedText =
                  cleanedText.substring(0, errorPosition) +
                  "," +
                  cleanedText.substring(errorPosition);
                console.log("Inserted missing comma between array elements");
              } else if (/,[\s\n]*[\]}]/.test(beforeError + afterError)) {
                // Trailing comma before closing bracket
                cleanedText =
                  cleanedText.substring(0, errorPosition - 1) +
                  cleanedText.substring(errorPosition);
                console.log("Removed trailing comma before closing bracket");
              }

              try {
                return JSON.parse(cleanedText);
              } catch (retryError) {
                console.log(`Targeted fix failed: ${retryError.message}`);
              }
            }
          }
        }

        // Last resort: try a more aggressive approach by returning a simplified valid JSON
        console.log(`Cleaning attempt failed: ${error.message}`);
        console.log("Attempting last resort fallback method...");

        try {
          // Try to extract and rebuild the JSON structure
          const fallbackJson = attemptFallbackParsing(cleanedText);
          if (fallbackJson) {
            console.log("Fallback parsing successful");
            return fallbackJson;
          }
        } catch (fallbackError) {
          console.log(`Fallback parsing failed: ${fallbackError.message}`);
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error in extractWithCleaning:", error);
    return null;
  }
};

/**
 * Last resort method to extract valid JSON by rebuilding the structure
 * @param {string} text - The problematic JSON text
 * @returns {Object|null} - A simplified but valid JSON object or null
 */
const attemptFallbackParsing = (text) => {
  try {
    // Try to extract the high-level structure first
    const mainKeys = [];
    const keyRegex = /"([^"]+)":\s*[{\[]?/g;
    let match;

    while ((match = keyRegex.exec(text)) !== null) {
      if (!mainKeys.includes(match[1])) {
        mainKeys.push(match[1]);
      }
    }

    if (mainKeys.length === 0) {
      return null;
    }

    // Build a simplified valid JSON with just the main keys
    const simpleObject = {};

    for (const key of mainKeys) {
      // Try to extract the value for this key
      const keyPattern = new RegExp(
        `"${key}":\\s*([{\\[]?\\s*[\\s\\S]*?)(?=,"[^"]+":|\\s*}$)`,
        "i"
      );
      const valueMatch = text.match(keyPattern);

      if (valueMatch && valueMatch[1]) {
        try {
          // Try to parse the value if it's an object or array
          if (
            valueMatch[1].trim().startsWith("{") ||
            valueMatch[1].trim().startsWith("[")
          ) {
            try {
              simpleObject[key] = JSON.parse(
                valueMatch[1].trim().replace(/,\s*$/, "")
              );
            } catch {
              // If parsing fails, use a placeholder based on the type
              simpleObject[key] = valueMatch[1].trim().startsWith("[")
                ? []
                : {};
            }
          } else {
            // For simple values, clean and add them
            let cleanValue = valueMatch[1].trim().replace(/,$/, "");

            // Handle string values
            if (cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
              simpleObject[key] = cleanValue.substring(
                1,
                cleanValue.length - 1
              );
            }
            // Handle numeric values
            else if (!isNaN(cleanValue)) {
              simpleObject[key] = Number(cleanValue);
            }
            // Handle boolean values
            else if (cleanValue === "true") {
              simpleObject[key] = true;
            } else if (cleanValue === "false") {
              simpleObject[key] = false;
            }
            // Default to empty string
            else {
              simpleObject[key] = "";
            }
          }
        } catch {
          // Fallback to empty object or array
          simpleObject[key] = "";
        }
      } else {
        // Key exists but we couldn't extract a proper value
        simpleObject[key] = "";
      }
    }

    return simpleObject;
  } catch (error) {
    console.error("Error in attemptFallbackParsing:", error);
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
    sectionTitles: {
      summary: [
        "Professional Summary",
        "Executive Summary",
        "Summary",
        "Profile",
      ],
      experience: [
        "Experience",
        "Work Experience",
        "Professional Experience",
        "Employment History",
      ],
      skills: [
        "Skills",
        "Technical Skills",
        "Core Competencies",
        "Areas of Expertise",
      ],
      education: [
        "Education",
        "Educational Background",
        "Academic Credentials",
      ],
      certifications: [
        "Certifications",
        "Professional Certifications",
        "Credentials",
      ],
    },
    formatting: [
      "Use clean, consistent formatting with clear section headings",
      "Ensure proper spacing between sections (10-12pt before, 4-6pt after)",
      "Use standard fonts like Arial, Calibri, or Times New Roman (10-12pt)",
      "Maintain consistent date formatting throughout (MM/YYYY recommended)",
      "Use standard bullets (•) rather than custom symbols or emojis",
      "Avoid text boxes, multiple columns, headers/footers, and tables",
      "Keep margins between 0.5-1 inch on all sides",
      "Save as PDF format to preserve formatting across ATS systems",
    ],
  };
};

module.exports = {
  extractJsonFromText,
  extractWithCleaning,
  cleanText,
  extractPatterns,
  calculateAtsScore,
  getAtsFormattingRecommendations,
};
