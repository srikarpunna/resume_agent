import { _analyzedResume_Basic } from '../utils/basic_resume/_analyzedResume_Basic';
import { _analyzeJob } from '../utils/basic_resume/_analyzeJob';
import { _matchResume } from '../utils/basic_resume/_matchResume';
import { _optimize_resume } from '../utils/basic_resume/_optimize_resume';

// Resume API calls with mock implementations
export const uploadResume = async (file) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate a mock resume text from _optimize_resume to ensure we have
  // text content which is required for the optimize button to be enabled
  const mockResumeText = `
ABIRAMI MUNI
muni1aby@gmail.com | 517-536-6384

SUMMARY
Experienced Business Analyst with a proven track record in requirements gathering, user story creation, and stakeholder management.

EXPERIENCE
Business Analyst, Ecolab (05/2023 - Present)
- Troubleshot production report errors, working with Oracle and Teradata databases to improve performance.
- Analyzed HIPAA EDI transactions and documented changes based on implementation guides.
- Developed project plans using PMO best practices, aligning with stakeholder needs.
...

Sr. Salesforce Business Analyst, Cummins (09/2021 - 04/2023)
- Designed and maintained Apex classes, triggers, batch classes, and Visualforce pages.
- Supported sales teams by optimizing lead conversion and automating custom quote generation.
...
  `;
  
  return {
    success: true,
    filename: "mock_resume.pdf",
    text: mockResumeText, // Adding this field which is required for the button to be enabled
    parsedData: {
      contactInfo: _optimize_resume.contactInfo,
      experience: _optimize_resume.experience,
      skills: _optimize_resume.skills,
      education: _optimize_resume.education,
      summary: "Experienced Business Analyst with a proven track record in requirements gathering, user story creation, and stakeholder management."
    }
  };
};

export const getResume = async (filename) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    success: true,
    data: _optimize_resume
  };
};

export const deleteResume = async (filename) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return {
    success: true,
    message: "Resume deleted successfully"
  };
};

// Gemini API calls with mock implementations
export const analyzeResume = async (resumeText) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return _analyzedResume_Basic;
};

export const analyzeJob = async (jobDescription) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return _analyzeJob;
};

export const matchResumeJob = async (resumeData, jobData) => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  return _matchResume;
};

export const optimizeResume = async (resumeData, jobData, matchAnalysis) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return _optimize_resume;
};

export const processFeedback = async (feedback, currentResume) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Just return the same optimized resume for simplicity
  // In a real implementation, you might want to make some changes based on feedback
  return _optimize_resume;
}; 