/**
 * Prompt for matching resume against job requirements
 * This is used by the Resume-Job Matcher Agent
 * 
 * @param {Object} resumeData - The structured resume data
 * @param {Object} jobData - The structured job description data
 * @returns {string} The prompt to send to Gemini API
 */
const generateMatchResumeJobPrompt = (resumeData, jobData) => {
  return `
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
- isConsultingCompany (boolean - true if resume shows consulting experience)
`;
};

module.exports = generateMatchResumeJobPrompt; 