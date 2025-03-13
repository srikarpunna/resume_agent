const axios = require("axios");
const config = require("../config/default");
const { extractJsonFromText } = require("../utils/textUtils");
const { 
  generateAnalyzeResumePrompt,
  generateAnalyzeJobPrompt,
  generateMatchResumeJobPrompt,
  generateOptimizeResumePrompt,
  generateProcessFeedbackPrompt
} = require("../prompts");

/**
 * Call Gemini API with improved JSON response handling
 */
const callGeminiAPI = async (prompt) => {
  try {
    console.log(
      `Calling Gemini API with prompt length: ${prompt.length} characters`
    );

    // Enhance the prompt to encourage clean JSON responses
    const enhancedPrompt = `${prompt.trim()}

IMPORTANT RESPONSE FORMATTING GUIDELINES:
1. Return ONLY valid, parseable JSON in your response. 
2. Do NOT include markdown formatting, explanations, or any text before or after the JSON.
3. Do NOT use code blocks (\`\`\`json) in your response - return raw JSON only.
4. Ensure all JSON keys and string values are properly quoted with double quotes.
5. All arrays and objects should be properly terminated.
6. Do not include any trailing commas.
`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: enhancedPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Check if response has the expected structure
    if (
      !response.data ||
      !response.data.candidates ||
      !response.data.candidates[0]
    ) {
      console.error(
        "Unexpected API response structure:",
        JSON.stringify(response.data).substring(0, 200) + "..."
      );
      throw new Error("Unexpected response structure from Gemini API");
    }

    // Extract the text response
    const candidate = response.data.candidates[0];
    if (
      !candidate.content ||
      !candidate.content.parts ||
      candidate.content.parts.length === 0
    ) {
      console.error(
        "No content in API response:",
        JSON.stringify(candidate).substring(0, 200) + "..."
      );
      throw new Error("No content in API response");
    }

    // Get the raw text response
    let responseText = candidate.content.parts[0].text || "";
    console.log(`Received response of ${responseText.length} characters`);

    // Clean the response to improve JSON parsing success rate
    responseText = cleanApiResponse(responseText);

    return responseText;
  } catch (error) {
    console.error("Error calling Gemini API:", error.message);
    if (error.response) {
      console.error(
        "API response data:",
        JSON.stringify(error.response.data).substring(0, 500) + "..."
      );
    }
    throw error;
  }
};

/**
 * Clean the API response to improve JSON parsing success rate
 */
const cleanApiResponse = (text) => {
  // First check if the response is in a markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    console.log("Found JSON in markdown code block, extracting...");
    text = codeBlockMatch[1].trim();
  }

  // Find the bounds of the actual JSON content
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    console.log(
      `Found JSON boundaries at positions ${firstBrace} and ${lastBrace}`
    );
    text = text.substring(firstBrace, lastBrace + 1);
  }

  // Clean up the text for better JSON parsing
  let cleanedText = text
    // Remove zero-width characters and other invisible characters
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    // Normalize whitespace around structural JSON characters for better parsing
    .replace(/\s*([{}\[\],:])\s*/g, (match, p1) => {
      if (p1 === ":") return ": ";
      if (p1 === ",") return ", ";
      return p1;
    })
    // Fix common JSON syntax errors
    .replace(/,\s*([}\]])/g, "$1") // Remove trailing commas
    .replace(/([{,])\s*"([^"]+)"\s*=>/g, '$1"$2":') // Fix Ruby-style hash notation
    .replace(/([{,])\s*'([^']+)'\s*:/g, '$1"$2":'); // Convert single quotes to double quotes for keys

  // Diagnostic checks
  const openBraces = (cleanedText.match(/{/g) || []).length;
  const closeBraces = (cleanedText.match(/}/g) || []).length;
  const openBrackets = (cleanedText.match(/\[/g) || []).length;
  const closeBrackets = (cleanedText.match(/\]/g) || []).length;
  const quotes = (cleanedText.match(/"/g) || []).length;

  console.log(
    `JSON structure check - Braces: ${openBraces}/${closeBraces}, Brackets: ${openBrackets}/${closeBrackets}, Quotes: ${quotes}`
  );

  // Check for unbalanced quotes (which would indicate a problem)
  if (quotes % 2 !== 0) {
    console.log("Unbalanced quotes detected, attempting to fix...");
    // Try to identify and fix the issue by checking if we have missing closing quotes
    const lines = cleanedText.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineQuotes = (line.match(/"/g) || []).length;
      if (lineQuotes % 2 !== 0) {
        console.log(`Line ${i + 1} has unbalanced quotes: ${line}`);
        // If the line has a key pattern with an odd number of quotes, it probably is missing a closing quote
        if (line.match(/"\s*:\s*[^"]/) && lineQuotes === 1) {
          lines[i] = line + '"';
          console.log(`Fixed line ${i + 1} by adding a closing quote`);
        }
      }
    }
    cleanedText = lines.join("\n");
  }

  // Ensure balanced braces and brackets
  if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
    console.log("Unbalanced JSON structure detected, attempting to fix...");
    // Add missing closing braces/brackets if needed
    if (openBraces > closeBraces) {
      cleanedText += "}".repeat(openBraces - closeBraces);
    }
    if (openBrackets > closeBrackets) {
      // This is trickier - we need to find unclosed brackets and fix them
      // This is a simplified approach
      cleanedText = cleanedText.replace(/\[\s*(?=\}|$)/g, "[]");
    }
  }

  return cleanedText;
};

/**
 * Document Analyzer Agent - Extracts structured information from resume
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.analyzeResume = async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ message: "Resume text is required" });
    }

    console.log(`Processing resume with ${resumeText.length} characters`);

    // Generate the prompt using the function from our prompts module
    const prompt = generateAnalyzeResumePrompt(resumeText);

    try {
      // Call Gemini API with the enhanced ATS-focused prompt
      const result = await callGeminiAPI(prompt);

      console.log("API response received, attempting to process...");

      // Handle different response formats
      let parsedData;

      // First try using our enhanced extraction utility
      try {
        parsedData = extractJsonFromText(result);

        if (parsedData) {
          console.log("Successfully extracted detailed resume data");
          return res.json(parsedData);
        } else {
          console.log("JSON extraction failed, trying alternative methods");

          // Try to extract JSON from markdown code block if present
          const codeBlockMatch = result.match(/```json\s*([\s\S]*?)\s*```/);
          if (codeBlockMatch && codeBlockMatch[1]) {
            try {
              parsedData = JSON.parse(codeBlockMatch[1]);
              console.log("Successfully extracted JSON from code block");
              return res.json(parsedData);
            } catch (codeBlockError) {
              console.log("Failed to parse JSON from code block");
            }
          }

          // Try to find first { and last } to extract JSON
          const jsonStartIndex = result.indexOf("{");
          const jsonEndIndex = result.lastIndexOf("}") + 1;

          if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
            try {
              const jsonText = result.substring(jsonStartIndex, jsonEndIndex);
              parsedData = JSON.parse(jsonText);
              console.log("Successfully extracted JSON using boundaries");
              return res.json(parsedData);
            } catch (boundaryError) {
              console.log("Failed to parse JSON using boundaries");
            }
          }

          // If all extraction methods fail
          return res.status(500).json({
            message: "Could not extract structured data from the resume",
          });
        }
      } catch (error) {
        console.error("Error in resume data extraction:", error);
        return res.status(500).json({
          message: "Error extracting structured data from the resume",
        });
      }
    } catch (apiError) {
      console.error("Gemini API error in resume analysis:", apiError);
      return res.status(500).json({
        message: "Error from AI service: " + apiError.message,
      });
    }
  } catch (error) {
    console.error("Server error in analyzeResume:", error);
    return res.status(500).json({
      message: "Server error processing resume",
    });
  }
};

/**
 * Job Analyzer Agent - Extracts requirements from job description
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.analyzeJob = async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ message: "Job description is required" });
    }

    console.log(
      `Processing job description with ${jobDescription.length} characters`
    );

    // Generate the prompt using the function from our prompts module
    const prompt = generateAnalyzeJobPrompt(jobDescription);

    try {
      const result = await callGeminiAPI(prompt);
      const jobData = extractJsonFromText(result);

      if (jobData) {
        console.log("Successfully extracted job data");
        return res.json(jobData);
      } else {
        return res.status(500).json({
          message: "Failed to extract structured data from job description",
        });
      }
    } catch (error) {
      console.error("Error in job description extraction:", error);
      return res.status(500).json({
        message: "Error processing job description",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Server error in analyzeJob:", error);
    return res.status(500).json({
      message: "Server error processing job description",
      error: error.message,
    });
  }
};

/**
 * Resume-Job Matcher Agent - Compares resume against job requirements
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.matchResumeJob = async (req, res) => {
  try {
    const { resumeData, jobData } = req.body;

    if (!resumeData || !jobData) {
      return res
        .status(400)
        .json({ message: "Resume and job data are required" });
    }

    console.log("Matching resume to job requirements");

    // Generate the prompt using the function from our prompts module
    const prompt = generateMatchResumeJobPrompt(resumeData, jobData);

    try {
      const result = await callGeminiAPI(prompt);
      const matchData = extractJsonFromText(result);

      if (matchData) {
        console.log("Successfully analyzed resume-job match");
        return res.json(matchData);
      } else {
        return res.status(500).json({
          message: "Failed to analyze the match between resume and job",
        });
      }
    } catch (error) {
      console.error("Error in resume-job matching:", error);
      return res.status(500).json({
        message: "Error analyzing the match",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Server error in matchResumeJob:", error);
    return res.status(500).json({
      message: "Server error in resume-job matching",
      error: error.message,
    });
  }
};

/**
 * Content Enhancement Agent - Optimizes resume content
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.optimizeResume = async (req, res) => {
  try {
    const { resumeData, jobData } = req.body;

    if (!resumeData || !jobData) {
      return res.status(400).json({
        message: "Both resume data and job data are required",
      });
    }

    console.log("Optimizing resume for job match...");

    // Generate the prompt using the function from our prompts module
    const prompt = generateOptimizeResumePrompt(resumeData, jobData);

    try {
      // Call the Gemini API with the improved prompt
      const optimizationResult = await callGeminiAPI(prompt);

      // Process the result with enhanced extraction
      try {
        let optimizedResume = null;

        // Use our enhanced extraction utility
        try {
          optimizedResume = extractJsonFromText(optimizationResult);
          console.log(
            "Successfully extracted optimized resume data using utility"
          );
        } catch (parseError) {
          console.log(
            "JSON extraction with utility failed, trying alternatives:",
            parseError.message
          );

          // Try to find JSON in markdown code block
          const codeBlockMatch = optimizationResult.match(
            /```json\s*([\s\S]*?)\s*```/
          );
          if (codeBlockMatch && codeBlockMatch[1]) {
            try {
              optimizedResume = JSON.parse(codeBlockMatch[1]);
              console.log(
                "Successfully extracted optimized resume from code block"
              );
            } catch (codeBlockError) {
              console.log(
                "Failed to parse JSON from code block:",
                codeBlockError.message
              );
            }
          }

          // Try to find first { and last } to extract JSON
          if (!optimizedResume) {
            const jsonStartIndex = optimizationResult.indexOf("{");
            const jsonEndIndex = optimizationResult.lastIndexOf("}") + 1;

            if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
              try {
                const jsonText = optimizationResult.substring(
                  jsonStartIndex,
                  jsonEndIndex
                );
                optimizedResume = JSON.parse(jsonText);
                console.log(
                  "Successfully extracted optimized resume using boundaries"
                );
              } catch (boundaryError) {
                console.log(
                  "Failed to parse JSON using boundaries:",
                  boundaryError.message
                );
              }
            }
          }
        }

        if (!optimizedResume) {
          return res.status(500).json({
            message: "Failed to extract optimized resume data from response",
          });
        }

        // Extract keywords from the job for ATS match score calculation
        let jobKeywords = [];
        if (jobData.keywords && jobData.keywords.mustHave) {
          jobKeywords = jobKeywords.concat(jobData.keywords.mustHave);
        }
        if (jobData.keywords && jobData.keywords.niceToHave) {
          jobKeywords = jobKeywords.concat(jobData.keywords.niceToHave);
        }
        if (jobData.requiredSkills && jobData.requiredSkills.technical) {
          jobKeywords = jobKeywords.concat(jobData.requiredSkills.technical);
        }
        if (jobData.atsKeywords) {
          jobKeywords = jobKeywords.concat(jobData.atsKeywords);
        }

        // Remove duplicates
        jobKeywords = [...new Set(jobKeywords)];

        // Calculate an ATS match score if there are extracted keywords
        if (jobKeywords.length > 0) {
          const resumeText = JSON.stringify(optimizedResume).toLowerCase();
          let keywordsFound = 0;

          jobKeywords.forEach((keyword) => {
            if (resumeText.includes(keyword.toLowerCase())) {
              keywordsFound++;
            }
          });

          const matchPercentage = Math.round(
            (keywordsFound / jobKeywords.length) * 100
          );
          optimizedResume.atsMatchScore = {
            score: matchPercentage,
            keywordsFound: keywordsFound,
            totalKeywords: jobKeywords.length,
          };

          console.log(
            `ATS Match Score: ${matchPercentage}% (${keywordsFound}/${jobKeywords.length} keywords)`
          );
        }

        return res.json(optimizedResume);
      } catch (processingError) {
        console.error("Error processing optimization result:", processingError);
        return res.status(500).json({
          message: "Error processing the optimized resume data",
          error: processingError.message,
        });
      }
    } catch (apiError) {
      console.error("Gemini API error in optimization:", apiError);
      return res.status(500).json({
        message: "Error from AI service during optimization",
        error: apiError.message,
      });
    }
  } catch (error) {
    console.error("Server error in optimizeResume:", error);
    return res.status(500).json({
      message: "Server error during resume optimization",
      error: error.message,
    });
  }
};

/**
 * Feedback Interpreter Agent - Processes user feedback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.processFeedback = async (req, res) => {
  try {
    const { feedback, currentResume } = req.body;

    if (!feedback || !currentResume) {
      return res.status(400).json({
        message: "Feedback and current resume are required",
      });
    }

    // Generate the prompt using the function from our prompts module
    const prompt = generateProcessFeedbackPrompt(feedback, currentResume);

    const result = await callGeminiAPI(prompt);
    const parsedData = extractJsonFromText(result);

    if (parsedData) {
      // Ensure that feedback changes sound natural and human-written
      if (parsedData.experience) {
        parsedData.experience.forEach((exp) => {
          if (exp.responsibilities) {
            // Vary sentence structures to sound more human
            exp.responsibilities = exp.responsibilities.map((resp) => {
              // Avoid starting every bullet with the same pattern
              const startsWithVerb =
                /^[A-Z][a-z]+ed|^[A-Z][a-z]+ted|^[A-Z][a-z]+ped|^[A-Z][a-z]+ded/;

              if (Math.random() > 0.8 && startsWithVerb.test(resp)) {
                // Occasionally use "Successfully X" or "Effectively X" instead of just "X"
                const enhancers = [
                  "Successfully ",
                  "Effectively ",
                  "Proficiently ",
                  "Skillfully ",
                ];
                const enhancer =
                  enhancers[Math.floor(Math.random() * enhancers.length)];
                return enhancer + resp.charAt(0).toLowerCase() + resp.slice(1);
              }

              return resp;
            });
          }
        });
      }

      res.json(parsedData);
    } else {
      res.status(500).json({ message: "Failed to process feedback" });
    }
  } catch (error) {
    console.error("Error processing feedback:", error);
    res.status(500).json({
      message: "Error processing feedback",
      error: error.message,
    });
  }
};
