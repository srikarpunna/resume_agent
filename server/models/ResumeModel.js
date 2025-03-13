/**
 * Resume data model - defines the structure of resume data
 * Note: This is a simple JS model since we're not using a database
 */

class ResumeModel {
  /**
   * Create a new resume model instance
   * @param {Object} data - Resume data
   */
  constructor(data = {}) {
    this.contactInfo = data.contactInfo || {
      name: "",
      email: "",
      phone: "",
      location: "",
    };

    // Handle both old single summary and new multiple summaries format
    this.summaries = Array.isArray(data.summaries)
      ? data.summaries.map((summary) => ({
          ...summary,
          content: this.cleanContent(summary.content),
        }))
      : data.summary
      ? [
          {
            type: "summary",
            heading: "Summary",
            content: this.cleanContent(data.summary),
            format: this.detectSummaryFormat(data.summary),
          },
        ]
      : [];

    this.experience = Array.isArray(data.experience)
      ? data.experience.map((exp) => ({
          ...exp,
          title: exp.title || "",
          company: exp.company || "",
          position: exp.position || "",
          location: exp.location || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          duration: exp.duration || "",
          description: exp.description || "",
          environment: exp.environment || "",
          responsibilities: Array.isArray(exp.responsibilities)
            ? exp.responsibilities.map((resp) => this.cleanContent(resp))
            : [],
        }))
      : [];

    this.skills = Array.isArray(data.skills) ? data.skills : [];

    this.education = Array.isArray(data.education)
      ? data.education.map((edu) => ({
          institution: edu.institution || "",
          degree: edu.degree || "",
          year: edu.year || "",
        }))
      : [];
  }

  /**
   * Clean content by removing special characters and standardizing bullet points
   * @param {string} content - The content to clean
   * @returns {string} - The cleaned content
   */
  cleanContent(content) {
    if (!content) return "";
    return content
      .replace(/[\u2022\u2023\u2043\u2024\u2025\u2043\u2044\u2045]/g, "") // Remove special bullet characters
      .replace(/^[\s]*[•\-\*]\s*/gm, "") // Remove any bullet points at start of lines
      .trim();
  }

  /**
   * Detect the format of a summary section
   * @param {string} content - The summary content
   * @returns {string} - The detected format ('paragraph', 'bullets', or 'mixed')
   */
  detectSummaryFormat(content) {
    if (!content) return "paragraph";

    // Count bullet points (common bullet characters)
    const bulletCount = (content.match(/[•\-\*]/g) || []).length;
    const lineCount = content.split("\n").length;

    // If no bullets, it's a paragraph
    if (bulletCount === 0) return "paragraph";

    // If all lines start with bullets, it's bullets
    const lines = content.split("\n");
    const bulletLines = lines.filter((line) =>
      /^[\s]*[•\-\*]/.test(line)
    ).length;
    if (bulletLines === lines.length) return "bullets";

    // Otherwise, it's mixed
    return "mixed";
  }

  /**
   * Parse environment string into an array of technologies
   * @param {string} environmentStr - The environment string (e.g., "Java, Spring, AWS")
   * @returns {Array} - Array of technologies
   */
  parseEnvironment(environmentStr) {
    if (!environmentStr) return [];

    // First, check if it's already an array
    if (Array.isArray(environmentStr)) return environmentStr;

    // Split by common separators (commas, semicolons, and)
    return environmentStr
      .split(/,|;|\sand\s/)
      .map((tech) => tech.trim())
      .filter((tech) => tech.length > 0);
  }

  /**
   * Validate the resume data
   * @returns {Object} - Validation result with isValid flag and errors array
   */
  validate() {
    const errors = [];

    // Basic validation for required fields
    if (!this.contactInfo.name) {
      errors.push("Name is required");
    }

    if (!this.contactInfo.email) {
      errors.push("Email is required");
    } else if (!this.isValidEmail(this.contactInfo.email)) {
      errors.push("Email format is invalid");
    }

    if (this.experience.length === 0) {
      errors.push("At least one experience entry is required");
    }

    if (this.skills.length === 0) {
      errors.push("At least one skill is required");
    }

    // Validate summaries
    if (this.summaries.length > 0) {
      this.summaries.forEach((summary, index) => {
        if (!summary.type) {
          errors.push(`Summary ${index + 1} is missing a type`);
        }
        if (!summary.heading) {
          errors.push(`Summary ${index + 1} is missing a heading`);
        }
        if (!summary.content) {
          errors.push(`Summary ${index + 1} is missing content`);
        }
        if (!["paragraph", "bullets", "mixed"].includes(summary.format)) {
          errors.push(`Summary ${index + 1} has an invalid format`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - Whether the email is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Convert to plain object
   * @returns {Object} - Plain object representation
   */
  toObject() {
    return {
      contactInfo: this.contactInfo,
      summaries: this.summaries,
      experience: this.experience,
      skills: this.skills,
      education: this.education,
    };
  }
}

module.exports = ResumeModel;
