/**
 * Prompt for processing user feedback and incorporating it into the resume
 * This is used by the Feedback Interpreter Agent
 * 
 * @param {string} feedback - User feedback on the resume
 * @param {Object} currentResume - The current resume data
 * @returns {string} The prompt to send to Gemini API
 */
const generateProcessFeedbackPrompt = (feedback, currentResume) => {
  return `
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

The final resume should read coherently and maintain the same voice throughout, with new content seamlessly integrated with existing content.
`;
};

module.exports = generateProcessFeedbackPrompt; 