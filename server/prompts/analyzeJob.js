/**
 * Prompt for job description analysis that extracts structured information 
 * This is used by the Job Analyzer Agent
 * 
 * @param {string} jobDescription - The raw text of the job description to analyze
 * @returns {string} The prompt to send to Gemini API
 */
const generateAnalyzeJobPrompt = (jobDescription) => {
  return `
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

Only include information that's actually present in the job description, but be comprehensive in your extraction of relevant details.
`;
};

module.exports = generateAnalyzeJobPrompt; 