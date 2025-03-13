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

    this.summary = data.summary || "";

    this.experience = Array.isArray(data.experience)
      ? data.experience.map((exp) => ({
          company: exp.company || "",
          position: exp.position || "",
          duration: exp.duration || "",
          responsibilities: Array.isArray(exp.responsibilities)
            ? exp.responsibilities
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
      summary: this.summary,
      experience: this.experience,
      skills: this.skills,
      education: this.education,
    };
  }
}

module.exports = ResumeModel;
