import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

/**
 * Component responsible for generating and downloading DOCX files from resume data.
 * Each section's formatting is clearly separated for easy review and modification.
 */
class DocxGenerator {
  constructor(resumeData) {
    this.resumeData = resumeData;
    this.sections = [];
  }

  /**
   * Generate and download the DOCX file
   */
  async generateAndDownload() {
    try {
      this.buildDocument();
      
      // Create Word Document
      const doc = new DocxDocument({
        sections: [{
          children: this.sections
        }],
      });

      // Generate the docx file
      const blob = await Packer.toBlob(doc);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.resumeData.contactInfo?.name || 'Optimized'}_Resume.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      
      return true;
    } catch (error) {
      console.error('Error generating DOCX:', error);
      throw new Error('Failed to generate Word document: ' + error.message);
    }
  }

  /**
   * Main document building method - calls each section builder in order
   */
  buildDocument() {
    this.addHeader();
    this.addSummaries();
    this.addExperience();
    this.addSkills();
    this.addEducation();
    this.addCertifications();
  }

  /**
   * Helper method to create paragraphs with consistent formatting
   */
  createParagraph(text, options = {}) {
    const { 
      heading = false, 
      bold = false, 
      italic = false, 
      alignment = AlignmentType.LEFT, 
      spacing = 120,
      indent = null
    } = options;
    
    const runs = [];
    if (typeof text === 'string') {
      runs.push(new TextRun({
        text,
        bold,
        italic,
        size: bold ? 24 : 22,
      }));
    } else if (Array.isArray(text)) {
      text.forEach(part => {
        runs.push(new TextRun({
          text: part.text,
          bold: part.bold || bold,
          italic: part.italic || italic,
          size: part.bold ? 24 : 22,
        }));
      });
    }
    
    const paragraphOptions = {
      children: runs,
      heading: heading ? HeadingLevel.HEADING_1 : undefined,
      alignment,
      spacing: {
        after: spacing,
      }
    };
    
    // Add indentation if specified
    if (indent) {
      paragraphOptions.indent = indent;
    }
    
    return new Paragraph(paragraphOptions);
  }

  /**
   * Build the header section with name and contact info
   */
  addHeader() {
    const contactInfo = this.resumeData.contactInfo || {};
    
    // Name - make it bigger and bold
    if (contactInfo.name) {
      this.sections.push(
        this.createParagraph(contactInfo.name, { 
          bold: true, 
          alignment: AlignmentType.CENTER,
          spacing: 120
        })
      );
    }
    
    // Contact info on separate lines, left-aligned
    const contactParts = [];
    
    // Email, phone, location
    const contactLine = [];
    if (contactInfo.email) contactLine.push(contactInfo.email);
    if (contactInfo.phone) contactLine.push(contactInfo.phone);
    if (contactInfo.location) contactLine.push(contactInfo.location);
    
    if (contactLine.length > 0) {
      this.sections.push(
        this.createParagraph(contactLine.join(' | '), {
          alignment: AlignmentType.CENTER,
          spacing: 120
        })
      );
    }

    // LinkedIn on its own line
    if (contactInfo.linkedin) {
      this.sections.push(
        this.createParagraph(`LinkedIn: ${contactInfo.linkedin}`, {
          alignment: AlignmentType.CENTER,
          spacing: 240 // Extra space after the header section
        })
      );
    }
  }

  /**
   * Build the summaries section
   */
  addSummaries() {
    if (this.resumeData.summaries && this.resumeData.summaries.length > 0) {
      this.resumeData.summaries.forEach(summary => {
        // Use ALL CAPS and bold for the heading, with a colon
        const headingText = (summary.heading || 'Summary').toUpperCase() + ":";
        this.sections.push(
          this.createParagraph(headingText, { 
            bold: true, 
            spacing: 80 // Reduced spacing after heading
          })
        );
        
        if (summary.format === 'bullets') {
          // Handle bullet points
          const bulletPoints = summary.content.split('\n').filter(point => point.trim());
          bulletPoints.forEach(point => {
            const trimmedPoint = point.trim().replace(/^[•\-\*]\s*/, '');
            this.sections.push(
              this.createParagraph(`• ${trimmedPoint}`, { 
                spacing: 60, // Reduced spacing between bullet points
                indent: {
                  left: 360 // Reduced indent (360 twips ≈ 0.25 inch instead of 0.5 inch)
                }
              })
            );
          });
        } else {
          // Handle paragraph
          this.sections.push(
            this.createParagraph(summary.content || '', { spacing: 120 })
          );
        }
      });
    }
  }

  /**
   * Build the experience section
   */
  addExperience() {
    if (this.resumeData.experience && this.resumeData.experience.length > 0) {
      this.sections.push(
        this.createParagraph('EXPERIENCE:', { bold: true, spacing: 80 })
      );

      this.resumeData.experience.forEach(exp => {
        // Job title
        this.sections.push(
          this.createParagraph(exp.title || exp.position || '', { bold: true, spacing: 60 })
        );

        // Company and location
        const companyLocationText = [
          exp.company,
          exp.location ? `• ${exp.location}` : '',
        ].filter(Boolean).join(' ');
        
        this.sections.push(
          this.createParagraph(companyLocationText, { italic: true, spacing: 60 })
        );

        // Date range
        if (exp.duration || (exp.startDate && exp.endDate)) {
          this.sections.push(
            this.createParagraph(exp.duration || `${exp.startDate} - ${exp.endDate}`, { spacing: 60 })
          );
        }

        // Description - make "Description:" label bold
        if (exp.description) {
          this.sections.push(
            this.createParagraph([
              { text: "Description: ", bold: true },
              { text: exp.description }
            ], { spacing: 60 })
          );
        }

        // Responsibilities
        if (exp.responsibilities && exp.responsibilities.length > 0) {
          // Remove the "Responsibilities:" header line and just show the bullet points
          
          exp.responsibilities.forEach(resp => {
            this.sections.push(
              this.createParagraph(`• ${resp}`, { 
                spacing: 60,
                indent: {
                  left: 360 // Reduced indent (360 twips ≈ 0.25 inch)
                }
              })
            );
          });
        }

        // Environment - make "Environment:" label bold
        if (exp.environment) {
          this.sections.push(
            this.createParagraph([
              { text: "Environment: ", bold: true },
              { text: exp.environment }
            ], { spacing: 120 })
          );
        }
      });
    }
  }

  /**
   * Build the skills section
   */
  addSkills() {
    if (this.resumeData.skills) {
      this.sections.push(
        this.createParagraph('SKILLS:', { bold: true, spacing: 80 })
      );

      // Handle detailed categories format
      if (
        typeof this.resumeData.skills === 'object' &&
        !Array.isArray(this.resumeData.skills) &&
        this.resumeData.skills.categories &&
        typeof this.resumeData.skills.categories === 'object'
      ) {
        const categories = Object.keys(this.resumeData.skills.categories).filter(
          category => 
            Array.isArray(this.resumeData.skills.categories[category]) && 
            this.resumeData.skills.categories[category].length > 0
        );

        categories.forEach(category => {
          const formattedCategory = category.charAt(0).toUpperCase() + 
            category.slice(1).replace(/_/g, ' ');
          
          const skillsList = this.resumeData.skills.categories[category].join(', ');
          this.sections.push(
            this.createParagraph(`• ${formattedCategory}: ${skillsList}`, { 
              spacing: 60,
              indent: {
                left: 360 // Reduced indent 
              }
            })
          );
        });
      }
      // Handle basic categories format
      else if (
        typeof this.resumeData.skills === 'object' &&
        !Array.isArray(this.resumeData.skills)
      ) {
        const categories = Object.keys(this.resumeData.skills).filter(
          category => 
            Array.isArray(this.resumeData.skills[category]) && 
            this.resumeData.skills[category].length > 0
        );

        categories.forEach(category => {
          const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);
          const skillsList = this.resumeData.skills[category].join(', ');
          this.sections.push(
            this.createParagraph(`• ${formattedCategory}: ${skillsList}`, { 
              spacing: 60,
              indent: {
                left: 360 // Reduced indent
              }
            })
          );
        });
      }
      // Handle array format
      else if (Array.isArray(this.resumeData.skills)) {
        this.sections.push(
          this.createParagraph(`• ${this.resumeData.skills.join(', ')}`, { 
            spacing: 120,
            indent: {
              left: 360 // Reduced indent
            }
          })
        );
      }
    }
  }

  /**
   * Build the education section
   */
  addEducation() {
    if (this.resumeData.education && this.resumeData.education.length > 0) {
      this.sections.push(
        this.createParagraph('EDUCATION:', { bold: true, spacing: 80 })
      );

      this.resumeData.education.forEach(edu => {
        // Degree
        this.sections.push(
          this.createParagraph(`• ${edu.degree || ''}`, { 
            bold: true, 
            spacing: 60,
            indent: {
              left: 360 // Reduced indent
            }
          })
        );
        
        // Institution and graduation date - indent this further
        this.sections.push(
          this.createParagraph([
            { text: edu.institution || '', italic: true },
            { text: edu.graduationDate ? `, ${edu.graduationDate}` : '' }
          ], { 
            spacing: 60,
            indent: {
              left: 720 // Reduced further indent
            }
          })
        );

        // Field of study
        if (edu.field) {
          this.sections.push(
            this.createParagraph(`Field of Study: ${edu.field}`, { 
              spacing: 60,
              indent: {
                left: 720 // Reduced indent
              }
            })
          );
        }

        // GPA
        if (edu.gpa) {
          this.sections.push(
            this.createParagraph(`GPA: ${edu.gpa}`, { 
              spacing: 60,
              indent: {
                left: 720 // Reduced indent
              }
            })
          );
        }

        // Honors
        if (edu.honors && edu.honors.length > 0) {
          this.sections.push(
            this.createParagraph(`Honors: ${edu.honors.join(', ')}`, { 
              spacing: 60,
              indent: {
                left: 720 // Reduced indent
              }
            })
          );
        }

        // Relevant courses
        if (edu.relevantCourses && edu.relevantCourses.length > 0) {
          this.sections.push(
            this.createParagraph(`Relevant Courses: ${edu.relevantCourses.join(', ')}`, { 
              spacing: 120,
              indent: {
                left: 720 // Reduced indent
              }
            })
          );
        }
      });
    }
  }

  /**
   * Build the certifications section
   */
  addCertifications() {
    if (this.resumeData.certifications && this.resumeData.certifications.length > 0) {
      this.sections.push(
        this.createParagraph('CERTIFICATIONS:', { bold: true, spacing: 80 })
      );

      this.resumeData.certifications.forEach(cert => {
        let certText = '';
        
        // Handle both string format and object format
        if (typeof cert === 'string') {
          certText = cert;
        } else {
          certText = cert.name || '';
          if (cert.issuer) certText += ` - ${cert.issuer}`;
          if (cert.date) certText += ` (${cert.date})`;
        }
        
        this.sections.push(
          this.createParagraph(`• ${certText}`, { 
            spacing: 60,
            indent: {
              left: 360 // Reduced indent
            }
          })
        );
      });
    }
  }
}

export default DocxGenerator; 