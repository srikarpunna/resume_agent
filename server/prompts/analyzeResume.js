/**
 * Prompt for resume analysis that extracts structured information from a resume
 * This is used by the Document Analyzer Agent
 * 
 * @param {string} resumeText - The raw text of the resume to analyze
 * @returns {string} The prompt to send to Gemini API
 */
const generateAnalyzeResumePrompt = (resumeText) => {
  return `
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
};

module.exports = generateAnalyzeResumePrompt; 