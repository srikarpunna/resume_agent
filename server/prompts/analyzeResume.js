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
- summaries: [
    Array of all summary sections found in the resume, each containing:
    {
      type: Type of summary ("summary", "technical_summary", "professional_summary", etc.)
      heading: Exact heading text as it appears in the resume (including any punctuation)
      content: The actual content of the summary do not add any extra special character
      format: The format of the content ("paragraph", "bullets", or "mixed")
    }
  ]
- experience: [
    Array of work experiences, each containing:
    {
      title: Job title (IMPORTANT: exact job title as written in resume)
      company: Company name
      location: Job location if specified
      startDate: Start date (MM/YYYY format if possible)
      endDate: End date or "Present" (MM/YYYY format if possible)
      duration: Total duration (e.g., "3 years 2 months")
      description: Project or role description paragraph if present (often found after job title and before responsibilities)
      environment: Technical environment, tools and technologies used (often found at the end of the experience entry)
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
    categories: {
      programming_languages: Array of programming languages (e.g., Java, JavaScript, Python)
      frameworks_libraries: Array of frameworks and libraries (e.g., Spring, React.js, Angular)
      web_technologies: Array of web technologies (e.g., HTML, CSS, AJAX)
      databases: Array of database technologies (e.g., Oracle, MySQL, MongoDB)
      devops_tools: Array of DevOps and tooling skills (e.g., Git, Jenkins, Docker)
      cloud_platforms: Array of cloud platform skills (e.g., AWS, Azure, Google Cloud)
      testing: Array of testing tools and methodologies (e.g., JUnit, Selenium, Mocha)
      soft_skills: Array of soft skills (e.g., Communication, Teamwork)
      // Add other appropriate categories as needed based on resume content
    }
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

Important notes for experience extraction:
1. Pay close attention to sections labeled "Description:", "Project Description:", "Client:", or similar, which often contain project context or role overview
2. Look for sections labeled "Environment:", "Technical Environment:", "Technologies:", "Tech Stack:", or similar at the end of experience entries
3. Only extract description/environment fields if they are explicitly present in the resume
4. If these sections are not clearly present, set the corresponding fields to an empty string ("")
5. Do not attempt to generate or infer description/environment content if not explicitly present
6. Common patterns for description sections:
   - Text immediately following job title/company and before responsibilities
   - Paragraphs beginning with "Client:" or "Project:"
   - Sections explicitly labeled as "Description:"
7. Common patterns for environment sections:
   - Lists of technologies at the end of an experience entry
   - Sections beginning with "Environment:", "Tech Stack:", or "Technologies:"
   - Comma-separated lists of technical skills specific to that role

Important notes for summary extraction:
1. Look for all sections that could be summaries (Summary, Technical Summary, Professional Summary, etc.)
2. Preserve the exact heading text as it appears in the resume
3. For each summary:
   - Determine if it's a paragraph, bullet points, or mixed format
   - Keep the original formatting and structure
   - Identify the type of summary based on its content and heading
4. If a resume has multiple summaries, include all of them in the summaries array
5. Maintain the order of summaries as they appear in the resume

Only extract information that's actually present in the resume. Be thorough and precise in identifying all relevant qualifications, experiences and skills.
`;
};

module.exports = generateAnalyzeResumePrompt;
