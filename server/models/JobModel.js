/**
 * Job description data model - defines the structure of job description data
 * Note: This is a simple JS model since we're not using a database
 */

class JobModel {
  /**
   * Create a new job model instance
   * @param {Object} data - Job description data
   */
  constructor(data = {}) {
    this.title = data.title || "";
    this.requiredSkills = Array.isArray(data.requiredSkills)
      ? data.requiredSkills
      : [];
    this.preferredSkills = Array.isArray(data.preferredSkills)
      ? data.preferredSkills
      : [];

    this.experience = {
      yearsRequired: data.experience?.yearsRequired || 0,
      industry: data.experience?.industry || "",
    };

    this.education = data.education || "";
    this.responsibilities = Array.isArray(data.responsibilities)
      ? data.responsibilities
      : [];
  }

  /**
   * Validate the job description data
   * @returns {Object} - Validation result with isValid flag and errors array
   */
  validate() {
    const errors = [];

    // Basic validation for required fields
    if (!this.title) {
      errors.push("Job title is required");
    }

    if (this.requiredSkills.length === 0) {
      errors.push("At least one required skill is needed");
    }

    if (this.responsibilities.length === 0) {
      errors.push("At least one responsibility is needed");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert to plain object
   * @returns {Object} - Plain object representation
   */
  toObject() {
    return {
      title: this.title,
      requiredSkills: this.requiredSkills,
      preferredSkills: this.preferredSkills,
      experience: this.experience,
      education: this.education,
      responsibilities: this.responsibilities,
    };
  }
}

module.exports = JobModel;
