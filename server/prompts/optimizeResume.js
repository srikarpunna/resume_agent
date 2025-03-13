/**
 * Prompt for optimizing resume content based on job requirements
 * This is used by the Content Enhancement Agent
 * 
 * @param {Object} resumeData - The structured resume data
 * @param {Object} jobData - The structured job description data
 * @returns {string} The prompt to send to Gemini API
 */
const generateOptimizeResumePrompt = (resumeData, jobData) => {
  return `
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
};

module.exports = generateOptimizeResumePrompt; 