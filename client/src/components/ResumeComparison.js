import React, { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Divider,
  Chip,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { useResumeContext } from "../context/ResumeContext";
import { processFeedback } from "../api";
import SummarySection from "./SummarySection";

// Helper function to identify differences between original and optimized content
const getContentDifference = (original, optimized) => {
  if (!original || !optimized) return { hasChanges: false, content: optimized };

  // For simple string comparison (summary, etc.)
  if (typeof original === "string" && typeof optimized === "string") {
    return {
      hasChanges: original.trim() !== optimized.trim(),
      content: optimized,
    };
  }

  // For arrays (like skills)
  if (Array.isArray(original) && Array.isArray(optimized)) {
    const newItems = optimized.filter((item) => !original.includes(item));
    return {
      hasChanges: newItems.length > 0,
      content: optimized,
      newItems,
    };
  }

  return { hasChanges: false, content: optimized };
};

// Resume section renderer component
const ResumeSection = ({
  title,
  content,
  originalContent,
  isOptimized = false,
}) => {
  const { hasChanges } = getContentDifference(originalContent, content);
  const shouldHighlight = isOptimized && hasChanges;

  return (
    <Box className="mb-4">
      <Typography
        variant="subtitle1"
        className={`font-bold mb-1 ${
          shouldHighlight ? "text-primary-main" : ""
        }`}
      >
        {title}
        {shouldHighlight && (
          <Chip
            label="Optimized"
            size="small"
            color="primary"
            className="ml-2"
          />
        )}
      </Typography>
      <Typography
        variant="body2"
        className={`whitespace-pre-line ${
          shouldHighlight ? "highlight-optimized" : ""
        }`}
      >
        {content}
      </Typography>
    </Box>
  );
};

// Experience section that highlights only new responsibilities
const ExperienceSection = ({
  experience,
  originalExperience,
  isOptimized,
  optimizationNotes,
}) => {
  console.log("ExperienceSection props:", {
    experience,
    originalExperience,
    isOptimized,
    optimizationNotes,
  });

  if (!experience) {
    console.log("Experience is null or undefined - returning null");
    return null;
  }

  if (!Array.isArray(experience)) {
    console.log("Experience is not an array:", experience);
    return null;
  }

  if (experience.length === 0) {
    console.log("Experience array is empty");
    return null;
  }

  // Helper function to clean and normalize responsibilities
  const normalizeResponsibility = (resp) => {
    let normalized = resp.trim();
    // Ensure proper ending punctuation
    if (
      !normalized.endsWith(".") &&
      !normalized.endsWith("!") &&
      !normalized.endsWith("?")
    ) {
      normalized += ".";
    }
    return normalized;
  };

  // Helper function to format date range
  const formatDateRange = (startDate, endDate) => {
    if (!startDate && !endDate) return "";
    const start = startDate || "Present";
    const end = endDate || "Present";
    return `${start} - ${end}`;
  };

  // Helper function to parse environment string into array of technologies
  const parseEnvironment = (environmentStr) => {
    if (!environmentStr) return [];

    // If it's already an array, return it
    if (Array.isArray(environmentStr)) return environmentStr;

    // Split by common separators (commas, semicolons, and)
    return environmentStr
      .split(/,|;|\sand\s/)
      .map((tech) => tech.trim())
      .filter((tech) => tech.length > 0);
  };

  // Check if the optimizedResume includes notes about generated descriptions/environments
  const descriptionsGenerated = optimizationNotes?.descriptionsGenerated || [];
  const environmentsGenerated = optimizationNotes?.environmentsGenerated || [];

  return (
    <>
      <Typography variant="subtitle1" className="font-bold mb-2">
        Experience
      </Typography>
      {experience.map((exp, index) => {
        // Find matching company in original resume
        const originalExp = originalExperience?.find(
          (oe) =>
            oe.company === exp.company &&
            (oe.title === exp.title || oe.position === exp.position)
        );

        // Get and normalize responsibilities from both original and optimized
        const originalResps =
          originalExp?.responsibilities?.map(normalizeResponsibility) || [];
        const currentResps =
          exp.responsibilities?.map(normalizeResponsibility) || [];

        // For the original resume view (isOptimized is false):
        // - Just show all responsibilities from the original experience
        // For the optimized view (isOptimized is true):
        // - Determine which responsibilities are new
        let newResponsibilities = [];
        if (isOptimized) {
          newResponsibilities = currentResps.filter(
            (r) =>
              !originalResps.some(
                (origResp) =>
                  origResp.toLowerCase() === r.toLowerCase() ||
                  origResp.toLowerCase().includes(r.toLowerCase()) ||
                  r.toLowerCase().includes(origResp.toLowerCase())
              )
          );
        }

        // Check if description has been modified
        const descriptionChanged =
          isOptimized &&
          exp.description &&
          originalExp?.description &&
          exp.description.trim() !== originalExp.description.trim();

        // Check if description was newly generated (didn't exist in original)
        const descriptionGenerated =
          isOptimized &&
          exp.description &&
          (!originalExp?.description ||
            originalExp.description.trim() === "") &&
          (descriptionsGenerated.includes(exp.title) ||
            descriptionsGenerated.includes(`${exp.title} at ${exp.company}`));

        // Parse environment string into array of technologies
        const environmentTechnologies = parseEnvironment(exp.environment);
        const originalEnvironmentTechnologies = parseEnvironment(
          originalExp?.environment
        );

        // Check if environment was newly generated (didn't exist in original)
        const environmentGenerated =
          isOptimized &&
          exp.environment &&
          (!originalExp?.environment ||
            originalExp.environment.trim() === "") &&
          (environmentsGenerated.includes(exp.title) ||
            environmentsGenerated.includes(`${exp.title} at ${exp.company}`));

        // Determine which technologies are new
        const newTechnologies = isOptimized
          ? environmentTechnologies.filter(
              (tech) => !originalEnvironmentTechnologies.includes(tech)
            )
          : [];

        const hasNewContent =
          !originalExp ||
          (newResponsibilities && newResponsibilities.length > 0) ||
          descriptionChanged ||
          descriptionGenerated ||
          newTechnologies.length > 0 ||
          environmentGenerated;

        return (
          <Box key={index} className="mb-6">
            <Box className="flex justify-between items-start">
              <Box>
                <Typography
                  variant="body1"
                  className={`font-semibold ${
                    !originalExp && isOptimized ? "text-primary-main" : ""
                  }`}
                >
                  {exp.title || exp.position}
                  {!originalExp && isOptimized && (
                    <Chip
                      label="New"
                      size="small"
                      color="primary"
                      className="ml-2"
                    />
                  )}
                </Typography>
                <Typography variant="body1" className="italic">
                  {exp.company}
                  {exp.location && (
                    <Typography
                      component="span"
                      variant="body2"
                      className="ml-2"
                    >
                      • {exp.location}
                    </Typography>
                  )}
                </Typography>
              </Box>
              <Typography variant="body2" className="text-right">
                {exp.duration || formatDateRange(exp.startDate, exp.endDate)}
              </Typography>
            </Box>

            {/* Description Section */}
            {exp.description && (
              <Box className="mt-2 mb-2">
                <Typography
                  variant="body2"
                  className={`${
                    descriptionChanged || descriptionGenerated
                      ? "highlight-optimized"
                      : ""
                  }`}
                >
                  <span className="font-semibold">Description: </span>
                  {exp.description}
                  {descriptionChanged && isOptimized && (
                    <Chip
                      label="Enhanced"
                      size="small"
                      color="success"
                      className="ml-1"
                      sx={{ height: "16px", fontSize: "0.6rem" }}
                    />
                  )}
                  {descriptionGenerated && isOptimized && (
                    <Chip
                      label="AI Generated"
                      size="small"
                      color="info"
                      className="ml-1"
                      sx={{ height: "16px", fontSize: "0.6rem" }}
                    />
                  )}
                </Typography>
              </Box>
            )}

            {/* Responsibilities Section */}
            {exp.responsibilities && exp.responsibilities.length > 0 && (
              <Box className="mt-2">
                <Typography variant="body2" className="font-semibold">
                  Responsibilities:
                </Typography>
                {/* For original resume view OR for original responsibilities in optimized view */}
                {(!isOptimized
                  ? exp.responsibilities
                  : exp.responsibilities?.filter(
                      (resp) =>
                        !newResponsibilities.includes(
                          normalizeResponsibility(resp)
                        )
                    )
                )?.map((resp, idx) => (
                  <Typography
                    key={`orig-${idx}`}
                    variant="body2"
                    className="ml-4 relative"
                  >
                    • {resp}
                  </Typography>
                ))}

                {/* Show new responsibilities only in optimized view */}
                {isOptimized &&
                  newResponsibilities.map((resp, idx) => (
                    <Typography
                      key={`new-${idx}`}
                      variant="body2"
                      className="ml-4 relative highlight-optimized"
                    >
                      • {resp}
                      <Chip
                        label="AI Added"
                        size="small"
                        color="success"
                        className="ml-1"
                        sx={{ height: "16px", fontSize: "0.6rem" }}
                      />
                    </Typography>
                  ))}
              </Box>
            )}

            {/* Environment Section */}
            {exp.environment && (
              <Box className="mt-3">
                <Typography variant="body2" className="font-semibold">
                  Environment:
                </Typography>
                <Box className="flex flex-wrap gap-1 mt-1">
                  {environmentTechnologies.map((tech, idx) => (
                    <Chip
                      key={`tech-${idx}`}
                      label={tech}
                      size="small"
                      color={
                        isOptimized &&
                        (newTechnologies.includes(tech) || environmentGenerated)
                          ? "success"
                          : "default"
                      }
                      variant={
                        isOptimized &&
                        (newTechnologies.includes(tech) || environmentGenerated)
                          ? "filled"
                          : "outlined"
                      }
                      className={
                        isOptimized &&
                        (newTechnologies.includes(tech) || environmentGenerated)
                          ? "highlight-optimized"
                          : ""
                      }
                    />
                  ))}
                  {environmentGenerated && isOptimized && (
                    <Chip
                      label="AI Generated List"
                      size="small"
                      color="info"
                      className="ml-1"
                      sx={{ height: "16px", fontSize: "0.6rem" }}
                    />
                  )}
                </Box>
              </Box>
            )}
          </Box>
        );
      })}
    </>
  );
};

// Skills section that highlights only new skills
const SkillsSection = ({ skills, originalSkills, isOptimized }) => {
  if (!skills) return null;

  // Handle both object format (new AI) and array/string format (legacy)
  let skillsArray = [];
  let originalSkillsArray = [];
  let allSkillCategories = [];

  // Check if skills is an object with categories (new format from enhanced AI)
  const isSkillsObject =
    skills &&
    typeof skills === "object" &&
    !Array.isArray(skills) &&
    (skills.technical || skills.soft || skills.tools);

  if (isSkillsObject) {
    // New format: skills is an object with categories
    allSkillCategories = ["technical", "soft", "tools"];

    // Flatten all skill categories into a single array
    skillsArray = allSkillCategories.reduce((acc, category) => {
      if (skills[category] && Array.isArray(skills[category])) {
        return [...acc, ...skills[category]];
      }
      return acc;
    }, []);

    // Handle original skills in the same way if it has the same structure
    if (
      originalSkills &&
      typeof originalSkills === "object" &&
      !Array.isArray(originalSkills)
    ) {
      originalSkillsArray = allSkillCategories.reduce((acc, category) => {
        if (
          originalSkills[category] &&
          Array.isArray(originalSkills[category])
        ) {
          return [...acc, ...originalSkills[category]];
        }
        return acc;
      }, []);
    } else if (Array.isArray(originalSkills)) {
      originalSkillsArray = originalSkills;
    } else if (originalSkills) {
      originalSkillsArray = originalSkills.split(/,\s*/);
    }
  } else {
    // Legacy format: skills is either an array or string
    skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(/,\s*/)
      : [];
    originalSkillsArray = Array.isArray(originalSkills)
      ? originalSkills
      : originalSkills
      ? originalSkills.split(/,\s*/)
      : [];
  }

  const { hasChanges } = getContentDifference(originalSkillsArray, skillsArray);
  const shouldHighlight = isOptimized && hasChanges;

  // Function to determine if a skill is new
  const isNewSkill = (skill) =>
    isOptimized && !originalSkillsArray.includes(skill);

  return (
    <Box className="mb-4">
      <Typography
        variant="subtitle1"
        className={`font-bold mb-1 ${
          shouldHighlight ? "text-primary-main" : ""
        }`}
      >
        Skills
        {shouldHighlight && (
          <Chip
            label="Optimized"
            size="small"
            color="primary"
            className="ml-2"
          />
        )}
      </Typography>

      {isSkillsObject && isOptimized ? (
        // Render categorized skills section for the new format
        <Box>
          {allSkillCategories.map((category) => {
            if (!skills[category] || !skills[category].length) return null;

            return (
              <Box key={category} className="mb-2">
                <Typography
                  variant="body2"
                  className="font-semibold text-gray-600"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}:
                </Typography>
                <Box className="flex flex-wrap gap-1 mt-1">
                  {skills[category].map((skill, index) => (
                    <Chip
                      key={`${category}-${index}`}
                      label={skill}
                      size="small"
                      color={isNewSkill(skill) ? "success" : "default"}
                      variant={isNewSkill(skill) ? "filled" : "outlined"}
                      className={isNewSkill(skill) ? "highlight-optimized" : ""}
                    />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : (
        // Render flat list for legacy format
        <Box className="flex flex-wrap gap-1">
          {skillsArray.map((skill, index) => (
            <Chip
              key={index}
              label={skill}
              size="small"
              color={isNewSkill(skill) ? "success" : "default"}
              variant={isNewSkill(skill) ? "filled" : "outlined"}
              className={isNewSkill(skill) ? "highlight-optimized" : ""}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

// Resume renderer component
const ResumeRenderer = ({ resume, originalResume, isOptimized = false }) => {
  console.log("ResumeRenderer props:", {
    resume,
    originalResume,
    isOptimized,
    "resume?.experience": resume?.experience,
    "originalResume?.experience": originalResume?.experience,
    optimizationNotes: resume?.optimizationNotes,
  });

  if (!resume) return <Typography>No resume data available</Typography>;

  // Helper to check for LinkedIn URL in contactInfo
  const formatContactInfo = (contactInfo) => {
    if (!contactInfo) return null;

    return (
      <Box className="text-center">
        <Typography variant="body2">
          {contactInfo.email && `${contactInfo.email}`}
          {contactInfo.phone && ` | ${contactInfo.phone}`}
          {contactInfo.location && ` | ${contactInfo.location}`}
        </Typography>
        {contactInfo.linkedin && (
          <Typography variant="body2">
            <a
              href={
                contactInfo.linkedin.startsWith("http")
                  ? contactInfo.linkedin
                  : `https://${contactInfo.linkedin}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              LinkedIn Profile
            </a>
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box>
      {/* Contact Information */}
      <Box className="mb-4">
        <Typography variant="h6" className="font-bold text-center">
          {resume.contactInfo?.name}
        </Typography>
        {formatContactInfo(resume.contactInfo)}
      </Box>

      {/* Summaries */}
      {resume.summaries?.map((summary, index) => (
        <SummarySection
          key={index}
          summary={summary}
          originalSummary={originalResume?.summaries?.[index]}
          isOptimized={isOptimized}
        />
      ))}

      {/* Experience */}
      <ExperienceSection
        experience={resume.experience}
        originalExperience={originalResume?.experience}
        isOptimized={isOptimized}
        optimizationNotes={isOptimized ? resume.optimizationNotes : null}
      />

      {/* Skills */}
      <SkillsSection
        skills={resume.skills}
        originalSkills={originalResume?.skills}
        isOptimized={isOptimized}
      />

      {/* Education */}
      <Typography variant="subtitle1" className="font-bold mb-2">
        Education
      </Typography>
      {Array.isArray(resume.education) ? (
        resume.education.map((edu, index) => {
          // Find if this education is new
          const isNewEducation =
            isOptimized &&
            !originalResume?.education?.some(
              (oe) =>
                oe.institution === edu.institution && oe.degree === edu.degree
            );

          return (
            <Box
              key={index}
              className={`mb-1 ${isNewEducation ? "highlight-optimized" : ""}`}
            >
              <Typography variant="body1" className="font-semibold">
                {edu.degree}
                {isNewEducation && (
                  <Chip
                    label="New"
                    size="small"
                    color="success"
                    className="ml-2"
                    sx={{ height: "16px", fontSize: "0.6rem" }}
                  />
                )}
              </Typography>
              <Box className="flex justify-between">
                <Typography variant="body2" className="italic">
                  {edu.institution}
                </Typography>
                <Typography variant="body2">{edu.year}</Typography>
              </Box>
              {edu.specialization && (
                <Typography variant="body2" className="mt-1">
                  Specialization: {edu.specialization}
                </Typography>
              )}
              {edu.relevantCoursework && edu.relevantCoursework.length > 0 && (
                <Typography variant="body2" className="mt-1">
                  Relevant Coursework: {edu.relevantCoursework.join(", ")}
                </Typography>
              )}
            </Box>
          );
        })
      ) : (
        <Typography variant="body2">
          No education information available
        </Typography>
      )}
    </Box>
  );
};

const ResumeComparison = () => {
  const {
    uploadedResume,
    optimizedResume,
    matchAnalysis,
    setOptimizedResume,
    setError,
    userFeedback,
    setUserFeedback,
    feedbackApplied,
    setFeedbackApplied,
    setIsProcessing,
  } = useResumeContext();
  const [activeTab, setActiveTab] = useState(0);
  const [processingFeedback, setProcessingFeedback] = useState(false);

  console.log("ResumeComparison context data:", {
    "uploadedResume?.parsedData": uploadedResume?.parsedData,
    "uploadedResume?.parsedData?.experience":
      uploadedResume?.parsedData?.experience,
    optimizedResume: optimizedResume,
    "optimizedResume?.experience": optimizedResume?.experience,
    "Full optimizedResume structure": JSON.stringify(optimizedResume, null, 2),
  });

  // Don't render if we don't have optimization results
  if (!optimizedResume) return null;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFeedbackSubmit = async () => {
    if (!userFeedback.trim()) return;

    setProcessingFeedback(true);
    setIsProcessing(true);

    try {
      const updatedResume = await processFeedback(
        userFeedback,
        optimizedResume
      );
      setOptimizedResume(updatedResume);
      setFeedbackApplied(true);
    } catch (error) {
      console.error("Error processing feedback:", error);
      setError("Failed to process feedback. Please try again.");
    } finally {
      setProcessingFeedback(false);
      setIsProcessing(false);
    }
  };

  return (
    <Paper className="p-4 mb-6">
      <Box className="flex items-center mb-4">
        <CompareArrowsIcon className="mr-2 text-primary-main" />
        <Typography variant="h6">Resume Comparison</Typography>
      </Box>

      {matchAnalysis && (
        <Box className="mb-4 bg-gray-50 p-3 rounded-md">
          <Typography variant="subtitle1" className="font-semibold mb-2">
            Match Analysis
          </Typography>
          <Box className="flex flex-wrap gap-2">
            <Chip
              label={`Overall Match: ${matchAnalysis.overallMatch || 0}%`}
              color={
                (matchAnalysis.overallMatch || 0) > 70
                  ? "success"
                  : (matchAnalysis.overallMatch || 0) > 40
                  ? "warning"
                  : "error"
              }
            />
            <Chip
              label={`Skills Match: ${
                matchAnalysis.categoryScores?.skillsMatch ||
                matchAnalysis.skillsMatch ||
                0
              }%`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Experience Match: ${
                matchAnalysis.categoryScores?.experienceMatch ||
                matchAnalysis.experienceMatch ||
                0
              }%`}
              color="primary"
              variant="outlined"
            />
            {matchAnalysis.categoryScores?.educationMatch !== undefined && (
              <Chip
                label={`Education Match: ${matchAnalysis.categoryScores.educationMatch}%`}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>

          {/* Display missing skills with category distinction if available */}
          {(matchAnalysis.missingSkills?.length > 0 ||
            matchAnalysis.gapAnalysis?.missingSkills?.critical?.length > 0 ||
            matchAnalysis.gapAnalysis?.missingSkills?.important?.length >
              0) && (
            <Box className="mt-2">
              <Typography variant="body2" className="font-medium">
                Missing Skills:
              </Typography>
              <Box className="flex flex-wrap gap-1 mt-1">
                {/* Handle legacy format */}
                {matchAnalysis.missingSkills?.map((skill, index) => (
                  <Chip
                    key={`legacy-${index}`}
                    label={skill}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                ))}

                {/* Handle new format with categories */}
                {matchAnalysis.gapAnalysis?.missingSkills?.critical?.map(
                  (skill, index) => (
                    <Chip
                      key={`critical-${index}`}
                      label={skill}
                      size="small"
                      color="error"
                      variant="filled"
                    />
                  )
                )}
                {matchAnalysis.gapAnalysis?.missingSkills?.important?.map(
                  (skill, index) => (
                    <Chip
                      key={`important-${index}`}
                      label={skill}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  )
                )}
                {matchAnalysis.gapAnalysis?.missingSkills?.minor?.map(
                  (skill, index) => (
                    <Chip
                      key={`minor-${index}`}
                      label={skill}
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  )
                )}
              </Box>
            </Box>
          )}

          {/* Show key strengths if available */}
          {matchAnalysis.keyStrengths &&
            matchAnalysis.keyStrengths.length > 0 && (
              <Box className="mt-2">
                <Typography variant="body2" className="font-medium">
                  Key Strengths:
                </Typography>
                <Box className="flex flex-wrap gap-1 mt-1">
                  {matchAnalysis.keyStrengths.map((item, index) => (
                    <Chip
                      key={`strength-${index}`}
                      label={item.strength || item}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
        </Box>
      )}

      <Tabs value={activeTab} onChange={handleTabChange} className="mb-4">
        <Tab label="Side by Side" />
        <Tab label="Original" />
        <Tab label="Optimized" />
      </Tabs>

      <Divider />

      {activeTab === 0 && (
        <Box className="comparison-container mt-4">
          <Box className="p-4 border rounded-lg bg-white">
            <Typography variant="h6" className="mb-4 text-center">
              Original Resume
            </Typography>
            <ResumeRenderer resume={uploadedResume.parsedData} />
          </Box>
          <Box className="p-4 border rounded-lg bg-white">
            <Typography variant="h6" className="mb-4 text-center">
              Optimized Resume
            </Typography>
            <ResumeRenderer
              resume={optimizedResume}
              originalResume={uploadedResume.parsedData}
              isOptimized={true}
            />
          </Box>
        </Box>
      )}

      {activeTab === 1 && (
        <Box className="mt-4 p-4 border rounded-lg bg-white">
          <ResumeRenderer resume={uploadedResume.parsedData} />
        </Box>
      )}

      {activeTab === 2 && (
        <Box className="mt-4 p-4 border rounded-lg bg-white">
          <ResumeRenderer
            resume={optimizedResume}
            originalResume={uploadedResume.parsedData}
            isOptimized={true}
          />
        </Box>
      )}

      <Box className="mt-6 p-4 bg-gray-50 rounded-md">
        <Typography variant="subtitle1" className="font-bold mb-2">
          Provide Feedback
        </Typography>
        <Typography variant="body2" className="mb-3">
          Suggest specific changes to further improve your optimized resume.
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Example: 'Please add more technical skills related to data analysis' or 'Make the summary more concise'"
          variant="outlined"
          value={userFeedback}
          onChange={(e) => setUserFeedback(e.target.value)}
          className="mb-3"
        />
        <Box className="flex justify-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleFeedbackSubmit}
            disabled={!userFeedback.trim() || processingFeedback}
          >
            {processingFeedback ? (
              <>
                <CircularProgress size={16} className="mr-2" />
                Processing...
              </>
            ) : (
              "Apply Feedback"
            )}
          </Button>
        </Box>
        {feedbackApplied && (
          <Alert severity="success" className="mt-3">
            Feedback has been applied successfully!
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default ResumeComparison;
