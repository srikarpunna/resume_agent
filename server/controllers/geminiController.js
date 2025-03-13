const axios = require("axios");
const config = require("../config/default");
const { extractJsonFromText } = require("../utils/textUtils");

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

    // Enhanced ATS-focused resume extraction prompt
    const prompt = `
As an expert ATS (Applicant Tracking System) specialist, analyze the following resume and extract information in a structured way that helps identify how well the resume will perform with ATS systems. 

RESUME TEXT:
${resumeText}

Extract all relevant information and format your response as a comprehensive JSON object with these sections:

- contactInfo: {
    name: Full name of the candidate
    email: Email address
    phone: Phone number with proper formatting
    location: Location/address information
    linkedin: LinkedIn URL if present
    portfolio: Portfolio/website URL if present
    github: GitHub profile if present
  }
- professionalSummary: Comprehensive professional summary or objective statement
- experience: [
    Array of work experiences, each containing:
    {
      title: Job title (IMPORTANT: exact job title as written in resume)
      company: Company name
      location: Job location if specified
      startDate: Start date (MM/YYYY format if possible)
      endDate: End date or "Present" (MM/YYYY format if possible)
      duration: Total duration (e.g., "3 years 2 months")
      responsibilities: Array of bullet points describing responsibilities/achievements
      achievements: Array of quantifiable achievements if separated from responsibilities
      keywords: Array of important keywords/skills demonstrated in this role
    }
  ]
- skills: {
    technical: Array of all technical skills (programming languages, tools, etc.)
    soft: Array of soft skills (communication, leadership, etc.)
    certifications: Array of professional certifications
    languages: Array of language proficiencies if mentioned
    categories: Object grouping skills by category (e.g., "Programming": ["JavaScript", "Python"])
  }
- education: [
    Array of education entries, each containing:
    {
      institution: Name of institution
      degree: Degree obtained
      field: Field of study
      location: Location if mentioned
      graduationDate: Date of graduation (YYYY format)
      gpa: GPA if mentioned
      honors: Academic honors/awards if mentioned
      relevantCourses: Array of relevant courses if mentioned
    }
  ]
- projects: [
    Array of projects if mentioned, each containing:
    {
      name: Project name
      description: Brief description
      technologies: Array of technologies used
      url: Project URL if available
      highlights: Key accomplishments or features
    }
  ]
- certifications: [
    Array of certifications, each containing:
    {
      name: Certification name
      issuer: Issuing organization
      date: Date obtained
      expiration: Expiration date if mentioned
    }
  ]
- atsAnalysis: {
    keywordDensity: Estimate of keyword density (high/medium/low)
    formatCompatibility: Assessment of format compatibility with ATS systems
    potentialIssues: Array of potential ATS issues in the resume
    missingElements: Array of commonly expected elements that are missing
    strengths: Array of elements that would perform well in ATS screening
  }
- keyPhrases: Array of 5-10 notable phrases from the resume that highlight qualifications
- recommendedJobTitles: Array of 3-5 job titles this resume appears targeted for
- careerLevel: Estimated career level (entry, mid, senior, executive, etc.)
- industrySectors: Array of industry sectors this resume appears aligned with

Only extract information that's actually present in the resume. Be thorough and precise in identifying all relevant qualifications, experiences and skills.
`;

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

    // Enhanced prompt with ATS-focused extraction
    const prompt = `
Analyze this job description as an expert ATS (Applicant Tracking System) specialist and extract structured information that will help optimize a resume to pass both ATS screening and human review.

JOB DESCRIPTION:
${jobDescription}

Your analysis should be extremely thorough in identifying keywords and patterns that ATS systems and recruiters look for. Format your response as a detailed JSON object with these sections:

- title: The exact job title from the description
- targetRole: General category of the role (e.g., "Data Engineer", "Software Developer")
- seniority: Precise level of seniority (junior, mid, senior, lead, etc.)
- company: Company name if mentioned
- location: Location and remote status if specified
- keyRequirements: Array of the 5-8 most critical requirements for this role
- keywords: {
    mustHave: Array of 10-15 essential keywords an ATS would flag as required
    niceToHave: Array of 5-10 beneficial but not essential keywords
    buzzwords: Array of industry jargon and buzzwords appearing in the description
  }
- requiredSkills: {
    technical: Array of technical skills required (programming languages, tools, etc.)
    domain: Array of domain knowledge areas required (finance, healthcare, etc.)
    tools: Array of specific tools, platforms, or software mentioned
  }
- preferredSkills: {
    technical: Array of technical skills preferred but not required
    domain: Array of domain knowledge areas preferred but not required  
    tools: Array of specific tools that are preferred but not required
  }
- experience: {
    yearsRequired: Minimum years required for the role
    yearsPreferred: Preferred years of experience
    specificRequirements: Array of specific experience statements from the description
  }
- education: {
    degree: Minimum educational requirement
    field: Specific field of study if mentioned
    isRequired: Boolean indicating if education is a hard requirement
  }
- responsibilities: Array of 10-15 main job responsibilities
- atsKeywords: Array of 15-20 specific keywords an ATS would prioritize for this role
- keyPhrases: Array of 5-8 exact phrases from the job description that seem most important
- formatRecommendations: Array of 3-5 specific ATS-friendly formatting recommendations
- avoidPhrases: Array of 3-5 phrases or terms to avoid for this specific job

Only include information that's actually present in the job description, but be comprehensive in your extraction of relevant details.`;

    try {
      // Call Gemini API with the enhanced prompt
      const result = await callGeminiAPI(prompt);

      // Parse the JSON response
      try {
        // Try to extract JSON from the result
        let parsedData;
        if (result.trim().startsWith("{") && result.trim().endsWith("}")) {
          // Direct JSON
          parsedData = JSON.parse(result);
        } else {
          // Try to find JSON in the text
          const jsonMatch = result.match(/{[\s\S]*}/);
          parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        }

        if (!parsedData) {
          console.error("Failed to parse JSON from job analysis response");
          return res.status(500).json({
            message: "Could not parse job description data",
          });
        }

        console.log("Successfully extracted enhanced job description data");
        return res.json(parsedData);
      } catch (jsonError) {
        console.error("JSON parsing error in job analysis:", jsonError.message);
        return res.status(500).json({
          message: "Error parsing response from AI service",
        });
      }
    } catch (apiError) {
      console.error("Gemini API error in job analysis:", apiError.message);
      return res.status(500).json({
        message: "Error from AI service: " + apiError.message,
      });
    }
  } catch (error) {
    console.error("Server error in analyzeJob:", error);
    return res.status(500).json({
      message: "Server error processing job description",
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

    // Simple prompt focused on matching
    const prompt = `
Compare this resume and job description and identify matches, gaps, and transformation opportunities:

RESUME:
${JSON.stringify(resumeData)}

JOB DESCRIPTION:
${JSON.stringify(jobData)}

Calculate match scores by category and identify transformation opportunities.
Format as JSON with:
- overallMatch (0-100 score)
- categoryScores (skills, experience, education)
- keyStrengths (array of strengths that match job requirements)
- gapAnalysis (missing skills categorized by importance: critical, important, nice-to-have)
- improvementOpportunities (specific ways to improve the resume)
- roleTransformation (specific guidance on how to transform current roles to match the target role)
- experienceMapping (map between candidate's experience and target role responsibilities)
- titleSuggestions (suggested job title transformations for each role in the resume)
- skillsToEmphasize (existing skills to highlight for the target role)
- skillsToRemove (skills irrelevant to the target role that should be removed)
- isConsultingCompany (boolean - true if resume shows consulting experience)`;

    try {
      // Call Gemini API
      const result = await callGeminiAPI(prompt);

      // Parse result
      try {
        // Extract and parse JSON
        let parsedData;
        if (result.trim().startsWith("{") && result.trim().endsWith("}")) {
          parsedData = JSON.parse(result);
        } else {
          const jsonMatch = result.match(/{[\s\S]*}/);
          parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        }

        if (!parsedData) {
          console.error("Failed to parse resume-job match analysis");
          return res
            .status(500)
            .json({ message: "Could not generate match analysis" });
        }

        console.log("Successfully generated match analysis");
        return res.json(parsedData);
      } catch (jsonError) {
        console.error(
          "JSON parsing error in match analysis:",
          jsonError.message
        );
        return res
          .status(500)
          .json({ message: "Error parsing match analysis" });
      }
    } catch (apiError) {
      console.error("API error in match analysis:", apiError.message);
      return res
        .status(500)
        .json({ message: "Error from AI service: " + apiError.message });
    }
  } catch (error) {
    console.error("Server error in matchResumeJob:", error);
    return res
      .status(500)
      .json({ message: "Server error comparing resume to job" });
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

    // Enhanced ATS-focused prompt for resume optimization
    const prompt = `
You are an expert ATS (Applicant Tracking System) optimization specialist and professional resume writer. 
Your task is to optimize a resume to perfectly match a job description while maintaining truthfulness and improving ATS compatibility.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

JOB DATA:
${JSON.stringify(jobData, null, 2)}

Create an optimized version of the resume that will rank highly in ATS systems for this specific job. Follow these guidelines:

1. Tailor the resume carefully to match keywords from the job description, especially focusing on the must-have keywords and technical skills.
2. Reorganize and prioritize experiences to highlight the most relevant ones for this specific job.
3. Enhance bullet points to be more achievement-oriented and include metrics where possible.
4. Use industry-standard terminology and job titles that match the target role.
5. Incorporate keywords naturally - don't just keyword stuff, but ensure important terms appear in context.
6. Prioritize hard skills and technical qualifications that match the job requirements.
7. Structure information in an ATS-friendly format (proper headings, simple formatting).
8. Focus on the specific achievements and experiences most relevant to this job.
9. Use the exact job title from the job description where appropriate.
10. Keep content truthful and accurate - only optimize existing information, don't fabricate experience.

Format your response as a valid JSON object with the SAME structure as the original resume data:

- contactInfo: Keep original contact info
- summary: Rewritten to target this specific job
- experience: Array of work experiences, optimized with enhanced bullet points
- skills: Reorganized and enhanced to emphasize skills relevant to this job
- education: Enhanced if relevant to the position
- certifications: Highlighted if relevant

For each experience item, enhance the responsibilities and achievements to better match the job requirements while keeping the core facts the same. Focus on quantifiable achievements and use language matching the job description.

Also include an "optimizationNotes" field that provides:
- keywordsAdded: Array of keywords strategically added
- optimizationStrategy: Brief explanation of overall approach
- atsCompatibilityImprovements: Specific changes made for ATS optimization
- prioritizedSkills: List of skills emphasized based on job match
- formattingRecommendations: Suggestions for final resume formatting
`;

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

          // Try to find JSON by looking for { and }
          if (!optimizedResume) {
            const jsonStart = optimizationResult.indexOf("{");
            const jsonEnd = optimizationResult.lastIndexOf("}") + 1;

            if (jsonStart >= 0 && jsonEnd > jsonStart) {
              try {
                const jsonText = optimizationResult.substring(
                  jsonStart,
                  jsonEnd
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

        // If we failed to extract JSON, try manual extraction as a fallback
        if (!optimizedResume) {
          console.log(
            "All JSON extraction methods failed, attempting manual extraction"
          );
          optimizedResume = {
            contactInfo: resumeData.contactInfo,
            summary: "",
            experience: [],
            skills: resumeData.skills || {},
            education: resumeData.education || [],
            certifications: resumeData.certifications || [],
          };

          // Try to extract summary
          const summaryMatch = optimizationResult.match(
            /\"summary\":\s*\"(.*?)\"/s
          );
          if (summaryMatch && summaryMatch[1]) {
            optimizedResume.summary = summaryMatch[1]
              .replace(/\\"/g, '"')
              .replace(/\\n/g, " ");
          }

          // Use original data as fallback if extraction fails
          if (!optimizedResume.summary) {
            optimizedResume.summary =
              resumeData.summary ||
              "Professional with experience in relevant field";
            console.log("Using original summary as fallback");
          }

          // Use original data for sections that couldn't be extracted
          if (resumeData.experience && !optimizedResume.experience.length) {
            optimizedResume.experience = resumeData.experience;
            console.log("Using original experience data as fallback");
          }
        }

        // Ensure the optimizedResume has all the necessary sections
        optimizedResume = {
          contactInfo: optimizedResume.contactInfo || resumeData.contactInfo,
          summary: optimizedResume.summary || resumeData.summary,
          experience: optimizedResume.experience || [],
          skills: optimizedResume.skills || {},
          education: optimizedResume.education || [],
          certifications: optimizedResume.certifications || [],
          optimizationNotes: optimizedResume.optimizationNotes || {
            keywordsAdded: [],
            optimizationStrategy: "Resume optimized for ATS compatibility",
            atsCompatibilityImprovements: [],
            prioritizedSkills: [],
            formattingRecommendations: [],
          },
        };

        // Handling for experience array with original job titles
        if (resumeData.experience && resumeData.experience.length > 0) {
          // Map through experiences and ensure title/position compatibility
          optimizedResume.experience = optimizedResume.experience.map(
            (optimizedExp) => {
              // Find matching original experience if possible
              const originalExp = resumeData.experience.find(
                (orig) =>
                  orig.company === optimizedExp.company ||
                  orig.title === optimizedExp.title ||
                  orig.position === optimizedExp.title ||
                  (optimizedExp.position &&
                    (orig.title === optimizedExp.position ||
                      orig.position === optimizedExp.position))
              );

              if (originalExp) {
                // Keep the original title but enhance the rest
                console.log(
                  `Preserving original job title with optimized context: ${originalExp.title}`
                );
                return {
                  ...optimizedExp,
                  title:
                    optimizedExp.title ||
                    originalExp.title ||
                    originalExp.position,
                  originalTitle: originalExp.title || originalExp.position,
                };
              }
              return optimizedExp;
            }
          );
        }

        // Add ATS optimization score
        const jobKeywords = [
          ...(jobData.keywords?.mustHave || []),
          ...(jobData.requiredSkills?.technical || []),
          ...(jobData.requiredSkills?.tools || []),
          ...(jobData.atsKeywords || []),
        ];

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

    const prompt = `
You are a highly experienced resume writing consultant who specializes in incorporating client feedback into their resumes. 

CLIENT FEEDBACK: "${feedback}"

CURRENT RESUME: ${JSON.stringify(currentResume)}

Your task is to thoughtfully implement the client's feedback while maintaining the overall professional tone and structure of the resume. Follow these guidelines:

1. Carefully interpret what the client is asking for, even if their instructions are vague or brief
2. Make targeted changes that address the specific feedback rather than rewriting everything
3. Maintain consistency in writing style between original and new content
4. Use natural, human language that sounds like it was written by a professional resume writer
5. Preserve the strengths of the original resume while addressing the requested improvements
6. Add context-appropriate details when implementing feedback about "adding more detail"
7. Use varied sentence structures and transitional phrases typical of human writing
8. Avoid formulaic language, repetitive phrasings, or AI-sounding patterns
9. Be selective and purposeful with terminology - don't overuse keywords or industry jargon

When implementing the feedback:
- If asked to add more technical details, include specific tools, frameworks, or methodologies
- If asked to highlight certain achievements, emphasize metrics and outcomes
- If asked to simplify language, use clearer phrasing while maintaining professional tone
- If asked to add more soft skills, integrate them contextually into experience descriptions
- If asked about formatting issues, modify content to better suit standard resume structures

Return the revised resume as a JSON object with carefully implemented changes that address the client's feedback while maintaining a natural, professional, human-written quality.

The final resume should read coherently and maintain the same voice throughout, with new content seamlessly integrated with existing content.`;

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
