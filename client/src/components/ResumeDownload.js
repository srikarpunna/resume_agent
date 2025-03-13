import React, { useState, useRef } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useResumeContext } from "../context/ResumeContext";
import { pdf } from "@react-pdf/renderer";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register fonts
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Me5Q.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v29/KFOlCnqEu92Fr1MmWUlvAw.ttf",
      fontWeight: 700,
    },
  ],
});

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    padding: 30,
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 10,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  contactInfo: {
    fontSize: 10,
    marginBottom: 10,
  },
  contactLink: {
    fontSize: 10,
    color: "#0077B5",
    marginBottom: 5,
    textDecoration: "none",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    paddingBottom: 2,
  },
  experienceItem: {
    marginBottom: 8,
  },
  company: {
    fontSize: 12,
    fontWeight: "bold",
  },
  position: {
    fontSize: 12,
    fontWeight: "bold",
  },
  duration: {
    fontSize: 10,
    fontStyle: "italic",
    marginBottom: 3,
  },
  responsibilitiesContainer: {
    marginLeft: 10,
  },
  responsibility: {
    fontSize: 10,
    marginBottom: 2,
    flexDirection: "row",
  },
  bullet: {
    width: 10,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skill: {
    fontSize: 10,
    marginRight: 5,
  },
  educationItem: {
    marginBottom: 5,
  },
  degree: {
    fontSize: 12,
    fontWeight: "bold",
  },
  institution: {
    fontSize: 10,
    fontStyle: "italic",
  },
  year: {
    fontSize: 10,
  },
  specialization: {
    fontSize: 10,
    marginTop: 2,
  },
  coursework: {
    fontSize: 10,
    marginTop: 2,
  },
  bulletList: {
    marginBottom: 10,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "center",
  },
});

// Helper function to render summary content based on format
const renderSummaryContent = (summary) => {
  if (!summary) return null;

  switch (summary.format) {
    case "bullets":
      return (
        <View style={styles.bulletList}>
          {summary.content.split("\n").map((line, index) => {
            const cleanLine = line.replace(/^[\s]*[•\-\*]\s*/, "").trim();
            if (!cleanLine) return null;

            return (
              <View key={index} style={styles.bulletItem}>
                <Text style={styles.bullet}>• </Text>
                <Text style={{ fontSize: 10, flex: 1 }}>{cleanLine}</Text>
              </View>
            );
          })}
        </View>
      );

    case "mixed":
      return (
        <View>
          {summary.content.split("\n").map((line, index) => {
            const isBullet = /^[\s]*[•\-\*]/.test(line);
            const cleanLine = isBullet
              ? line.replace(/^[\s]*[•\-\*]\s*/, "").trim()
              : line.trim();

            if (!cleanLine) return null;

            if (isBullet) {
              return (
                <View key={index} style={styles.bulletItem}>
                  <Text style={styles.bullet}>• </Text>
                  <Text style={{ fontSize: 10, flex: 1 }}>{cleanLine}</Text>
                </View>
              );
            }

            return (
              <Text key={index} style={{ fontSize: 10, marginBottom: 4 }}>
                {cleanLine}
              </Text>
            );
          })}
        </View>
      );

    default: // paragraph
      return <Text style={{ fontSize: 10 }}>{summary.content}</Text>;
  }
};

// Resume PDF Document Component
const ResumePDF = ({ resume }) => {
  console.log(
    "ResumePDF rendering with data:",
    JSON.stringify(resume, null, 2)
  );

  if (!resume) return null;

  // Format contact info into parts for PDF
  const formatContactInfo = () => {
    const parts = [];
    const contactInfo = resume.contactInfo || {};

    if (contactInfo.email) parts.push(contactInfo.email);
    if (contactInfo.phone) parts.push(contactInfo.phone);
    if (contactInfo.location) parts.push(contactInfo.location);

    return parts.join(" | ");
  };

  // Make sure education is always an array even if it's not in the data
  const educationData = resume.education || [];
  console.log("Education data for PDF component:", educationData);

  // Make sure skills are properly formatted for display
  const formatSkillsForPDF = () => {
    console.log("Skills data for PDF:", resume.skills);

    if (!resume.skills) {
      return <Text style={{ fontSize: 10 }}>No skills listed</Text>;
    }

    if (Array.isArray(resume.skills)) {
      return resume.skills.map((skill, index) => (
        <Text key={index} style={styles.skill}>
          {skill}
          {index < resume.skills.length - 1 ? ", " : ""}
        </Text>
      ));
    }

    if (typeof resume.skills === "object") {
      // Check if it's the categorized skills format
      const hasCategories =
        resume.skills.technical || resume.skills.soft || resume.skills.tools;

      if (hasCategories) {
        return (
          <>
            {resume.skills.technical && resume.skills.technical.length > 0 && (
              <View style={{ marginBottom: 5 }}>
                <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                  Technical:{" "}
                </Text>
                <Text style={{ fontSize: 10 }}>
                  {resume.skills.technical.join(", ")}
                </Text>
              </View>
            )}
            {resume.skills.soft && resume.skills.soft.length > 0 && (
              <View style={{ marginBottom: 5 }}>
                <Text style={{ fontSize: 10, fontWeight: "bold" }}>Soft: </Text>
                <Text style={{ fontSize: 10 }}>
                  {resume.skills.soft.join(", ")}
                </Text>
              </View>
            )}
            {resume.skills.tools && resume.skills.tools.length > 0 && (
              <View style={{ marginBottom: 5 }}>
                <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                  Tools:{" "}
                </Text>
                <Text style={{ fontSize: 10 }}>
                  {resume.skills.tools.join(", ")}
                </Text>
              </View>
            )}
          </>
        );
      } else {
        // Handle plain object format by converting to string representation
        return (
          <Text style={{ fontSize: 10 }}>
            {Object.entries(resume.skills)
              .filter(([k, v]) => v && typeof v !== "object")
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ") || "No skills listed"}
          </Text>
        );
      }
    }

    return (
      <Text style={{ fontSize: 10 }}>
        {typeof resume.skills === "string" ? resume.skills : "No skills listed"}
      </Text>
    );
  };

  return (
    <Document title={`${resume.contactInfo?.name || "Optimized"} Resume`}>
      <Page size="A4" style={styles.page}>
        {/* Header / Contact Info */}
        <View style={styles.header}>
          <Text style={styles.name}>{resume.contactInfo?.name}</Text>
          <Text style={styles.contactInfo}>{formatContactInfo()}</Text>
          {resume.contactInfo?.linkedin && (
            <Text style={styles.contactLink}>
              LinkedIn: {resume.contactInfo.linkedin}
            </Text>
          )}
        </View>

        {/* Summaries */}
        {resume.summaries?.map((summary, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{summary.heading}</Text>
            {renderSummaryContent(summary)}
          </View>
        ))}

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>

          {resume.experience && resume.experience.length > 0 ? (
            resume.experience.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={styles.position}>
                    {exp.title || exp.position || ""}
                  </Text>
                  <Text style={styles.duration}>{exp.duration || ""}</Text>
                </View>
                <Text style={styles.company}>{exp.company || ""}</Text>

                <View style={styles.responsibilitiesContainer}>
                  {exp.responsibilities && exp.responsibilities.length > 0 ? (
                    exp.responsibilities.map((resp, idx) => (
                      <View key={idx} style={styles.responsibility}>
                        <Text style={styles.bullet}>• </Text>
                        <Text style={{ fontSize: 10, flex: 1 }}>{resp}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{ fontSize: 10 }}>
                      No responsibilities listed
                    </Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={{ fontSize: 10 }}>No experience listed</Text>
          )}
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>{formatSkillsForPDF()}</View>
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>

          {educationData && educationData.length > 0 ? (
            educationData.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <Text style={styles.degree}>{edu.degree || ""}</Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={styles.institution}>
                    {edu.institution || ""}
                  </Text>
                  <Text style={styles.year}>{edu.year || ""}</Text>
                </View>
                {edu.specialization && (
                  <Text style={styles.specialization}>
                    Specialization: {edu.specialization}
                  </Text>
                )}
                {edu.relevantCoursework &&
                  edu.relevantCoursework.length > 0 && (
                    <Text style={styles.coursework}>
                      Relevant Coursework: {edu.relevantCoursework.join(", ")}
                    </Text>
                  )}
              </View>
            ))
          ) : (
            <Text style={{ fontSize: 10 }}>No education listed</Text>
          )}
        </View>

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((cert, index) => (
              <View key={index} style={styles.responsibility}>
                <Text style={styles.bullet}>• </Text>
                <Text style={{ fontSize: 10, flex: 1 }}>{cert}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

const ResumeDownload = () => {
  const { optimizedResume } = useResumeContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState(null);
  const [useAlternateRenderer, setUseAlternateRenderer] = useState(false);
  const resumeContainerRef = useRef(null);

  // Format contact info for display
  const formatContactInfo = () => {
    if (!optimizedResume?.contactInfo) return "";

    const { email, phone, location, linkedin } = optimizedResume.contactInfo;
    const parts = [];

    if (email) parts.push(`Email: ${email}`);
    if (phone) parts.push(`Phone: ${phone}`);
    if (location) parts.push(`Location: ${location}`);

    return parts.join(" | ");
  };

  // Format skills section based on structure
  const formatSkills = () => {
    if (!optimizedResume.skills) return "No skills listed";

    // If skills is an object with categories
    if (
      typeof optimizedResume.skills === "object" &&
      !Array.isArray(optimizedResume.skills)
    ) {
      const categories = Object.keys(optimizedResume.skills).filter(
        (category) =>
          Array.isArray(optimizedResume.skills[category]) &&
          optimizedResume.skills[category].length > 0
      );

      if (categories.length === 0) return "No skills listed";

      return categories
        .map(
          (category) => `
          <div class="skill-category">
            <div style="font-weight: bold; text-transform: capitalize; margin-bottom: 2px;">${category}:</div>
            <div>${optimizedResume.skills[category].join(", ")}</div>
          </div>
        `
        )
        .join("");
    } else if (Array.isArray(optimizedResume.skills)) {
      // If skills is a simple array
      return optimizedResume.skills.join(", ") || "No skills listed";
    } else {
      // If skills is something else
      return "No skills listed";
    }
  };

  // Generate education section HTML
  const generateEducationHTML = () => {
    if (!optimizedResume.education || !optimizedResume.education.length) {
      return "<div>No education listed</div>";
    }

    return optimizedResume.education
      .map(
        (edu) => `
        <div class="education-item">
          <div class="degree">${edu.degree || "Degree not specified"}</div>
          <div class="education-details">
            <div class="institution">${edu.institution || ""}</div>
            ${edu.year ? `<div class="education-year">${edu.year}</div>` : ""}
          </div>
          ${
            edu.details
              ? `<div style="font-size: 12px; margin-top: 2px;">${edu.details}</div>`
              : ""
          }
        </div>
      `
      )
      .join("");
  };

  // Generate certifications section HTML
  const generateCertificationsHTML = () => {
    if (
      !optimizedResume.certifications ||
      !optimizedResume.certifications.length
    ) {
      return "";
    }

    return `
      <div class="section">
        <h2>Certifications</h2>
        ${optimizedResume.certifications
          .map(
            (cert) => `
          <div style="margin-bottom: 5px;">
            <div style="font-weight: bold;">${cert.name || ""}</div>
            ${
              cert.issuer || cert.year
                ? `<div style="font-style: italic; font-size: 12px;">
                ${[
                  cert.issuer ? `Issuer: ${cert.issuer}` : "",
                  cert.year ? `Year: ${cert.year}` : "",
                ]
                  .filter(Boolean)
                  .join(" | ")}
              </div>`
                : ""
            }
          </div>
        `
          )
          .join("")}
      </div>
    `;
  };

  // Generate experience section HTML with proper spacing
  const generateExperienceHTML = () => {
    if (!optimizedResume.experience || !optimizedResume.experience.length) {
      return "<div>No experience listed</div>";
    }

    return optimizedResume.experience
      .map(
        (exp, index) => `
      <div class="experience-item" style="margin-bottom: ${
        index < optimizedResume.experience.length - 1 ? "8px" : "0"
      };">
        <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
          <div style="font-weight: bold; font-size: 14px;">${
            exp.title || exp.position || ""
          }</div>
          <div style="font-style: italic; font-size: 12px;">${
            exp.duration || ""
          }</div>
        </div>
        <div style="font-weight: bold; font-size: 12px; margin-bottom: 4px;">${
          exp.company || ""
        }</div>
        ${
          exp.responsibilities && exp.responsibilities.length
            ? `<ul style="margin: 4px 0 0 0; padding-left: 18px;">
            ${exp.responsibilities
              .map(
                (resp) => `
              <li style="font-size: 12px; margin-bottom: 2px;">${resp}</li>
            `
              )
              .join("")}
          </ul>`
            : "<div>No responsibilities listed</div>"
        }
      </div>
    `
      )
      .join("");
  };

  const generateResumeHTML = () => {
    // Create the complete HTML for the resume
    return `
      <div style="font-family: Arial, sans-serif; padding: 15px; max-width: 800px; margin: 0 auto; line-height: 1.4; font-size: 12px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 12px;">
          <h1 style="font-size: 18px; margin: 0 0 4px 0;">${
            optimizedResume.contactInfo?.name || ""
          }</h1>
          <div style="font-size: 12px;">
            ${formatContactInfo()}
          </div>
        </div>

        <!-- Summaries -->
        ${optimizedResume.summaries
          ?.map(
            (summary) => `
          <div style="margin-bottom: 10px;">
            <h2 style="font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin: 0 0 8px 0;">${
              summary.heading
            }</h2>
            ${
              summary.format === "bullets"
                ? `<ul style="margin: 0; padding-left: 20px;">
                  ${summary.content
                    .split("\\n")
                    .filter((line) => line.trim())
                    .map(
                      (line) =>
                        `<li>${line
                          .replace(/^[\s]*[•\-\*]\s*/, "")
                          .trim()}</li>`
                    )
                    .join("")}
                </ul>`
                : summary.format === "mixed"
                ? summary.content
                    .split("\\n")
                    .map((line) => {
                      const isBullet = /^[\s]*[•\-\*]/.test(line);
                      const cleanLine = isBullet
                        ? line.replace(/^[\s]*[•\-\*]\s*/, "").trim()
                        : line.trim();
                      if (!cleanLine) return "";
                      return isBullet
                        ? `<div style="margin-left: 20px;">• ${cleanLine}</div>`
                        : `<div>${cleanLine}</div>`;
                    })
                    .join("")
                : `<div>${summary.content}</div>`
            }
          </div>
        `
          )
          .join("")}

        <!-- Experience -->
        <div style="margin-bottom: 10px;">
          <h2 style="font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin: 0 0 8px 0;">Experience</h2>
          ${generateExperienceHTML()}
        </div>

        <!-- Skills -->
        <div style="margin-bottom: 10px;">
          <h2 style="font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin: 0 0 8px 0;">Skills</h2>
          <div style="font-size: 12px;">${formatSkills()}</div>
        </div>

        <!-- Education -->
        <div style="margin-bottom: 10px;">
          <h2 style="font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin: 0 0 8px 0;">Education</h2>
          ${generateEducationHTML()}
        </div>
        
        <!-- Certifications (if available) -->
        ${generateCertificationsHTML()}
      </div>
    `;
  };

  // Function to handle PDF actions (preview, download, print)
  const handlePdfAction = async (action) => {
    try {
      setIsLoading(true);
      setError(null);

      // For debugging
      console.log("Resume data for PDF:", optimizedResume);
      console.log("Education data:", optimizedResume.education);
      console.log("Skills data:", optimizedResume.skills);

      if (useAlternateRenderer) {
        // Use the React-PDF renderer directly
        try {
          // Print info about which renderer is being used
          console.log("Using React-PDF renderer directly");

          const PDFDocument = <ResumePDF resume={optimizedResume} />;
          const asPdf = pdf([]);
          asPdf.updateContainer(PDFDocument);
          const pdfBlob = await asPdf.toBlob();

          console.log("PDF blob created successfully with React-PDF");

          // Handle the action
          if (action === "preview") {
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, "_blank");
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 3000);
          } else if (action === "download") {
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const link = document.createElement("a");
            link.href = pdfUrl;
            link.download = `${
              optimizedResume.contactInfo?.name || "Optimized"
            }_Resume.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 3000);
          } else if (action === "print") {
            handleDirectPrint();
          }

          return;
        } catch (reactPdfError) {
          console.error("Error with React-PDF renderer:", reactPdfError);
          setError(
            `Error with direct PDF generation: ${reactPdfError.message}`
          );
          // Continue with html2pdf as fallback
        }
      }

      // Default html2pdf method
      console.log("Using html2pdf renderer");

      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import("html2pdf.js")).default;

      // Create a container for the resume HTML
      const container = document.createElement("div");
      container.innerHTML = generateResumeHTML();
      document.body.appendChild(container);

      // For debugging
      console.log("HTML content for PDF:", container.innerHTML);

      // Configure html2pdf options with improved pagination
      const options = {
        margin: [10, 10, 10, 10], // Reduced margins [top, right, bottom, left] in mm
        filename: `${
          optimizedResume.contactInfo?.name || "Optimized"
        }_Resume.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          dpi: 192,
          height: container.clientHeight + 50, // Reduced extra space
          windowWidth: 900,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
          compress: true,
          putOnlyUsedFonts: true,
          precision: 16,
          floatPrecision: 16,
        },
        pagebreak: {
          mode: ["css", "legacy"],
          before: ".page-break-before",
          after: ".page-break-after",
          avoid: [".experience-item", ".education-item", "h2", "h3"],
        },
      };

      // Generate PDF
      try {
        const pdfBlob = await html2pdf()
          .from(container)
          .set(options)
          .outputPdf("blob");

        // Remove the temporary container
        document.body.removeChild(container);

        // Handle the action
        if (action === "preview") {
          const pdfUrl = URL.createObjectURL(pdfBlob);
          window.open(pdfUrl, "_blank");
          // Clean up URL after a delay
          setTimeout(() => URL.revokeObjectURL(pdfUrl), 3000);
        } else if (action === "download") {
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const link = document.createElement("a");
          link.href = pdfUrl;
          link.download = options.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          // Clean up URL after a delay
          setTimeout(() => URL.revokeObjectURL(pdfUrl), 3000);
        } else if (action === "print") {
          const pdfUrl = URL.createObjectURL(pdfBlob);
          const printWindow = window.open(pdfUrl, "_blank");
          if (printWindow) {
            printWindow.addEventListener("load", () => {
              printWindow.print();
            });
          } else {
            setError("Popup blocked. Please allow popups to print the resume.");
          }
          // Clean up URL after a delay
          setTimeout(() => URL.revokeObjectURL(pdfUrl), 5000);
        }
      } catch (pdfError) {
        console.error("Error generating PDF with html2pdf:", pdfError);
        setError(`PDF generation failed: ${pdfError.message}`);

        // Try the alternate renderer
        if (!useAlternateRenderer) {
          console.log("Switching to alternate renderer");
          setUseAlternateRenderer(true);
          handlePdfAction(action);
          return;
        }

        // Fallback to direct print method if PDF generation fails
        if (action === "print") {
          handleDirectPrint();
        }
      }
    } catch (err) {
      console.error("Error handling PDF action:", err);
      setError(`Failed to ${action} PDF: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple direct printing method as backup
  const handleDirectPrint = () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create a printable window
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        setError("Popup blocked. Please allow popups to print the resume.");
        setIsLoading(false);
        return;
      }

      // Write the resume HTML to the window
      printWindow.document.write(`
        <html>
          <head>
            <title>${
              optimizedResume?.contactInfo?.name || "Optimized"
            } Resume</title>
            <style>
              body { 
                margin: 0; 
                padding: 0; 
                font-family: Arial, sans-serif;
                font-size: 12px;
                line-height: 1.4;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 15px;
              }
              h1 { 
                font-size: 18px; 
                margin: 0 0 4px 0;
                text-align: center;
              }
              h2 {
                font-size: 16px;
                border-bottom: 1px solid #ccc;
                padding-bottom: 3px;
                margin: 10px 0 8px 0;
              }
              .contact-info {
                text-align: center;
                margin-bottom: 12px;
                font-size: 12px;
              }
              .contact-info a {
                color: #0077B5;
                text-decoration: none;
              }
              .section {
                margin-bottom: 10px;
                page-break-inside: avoid;
              }
              .experience-item {
                margin-bottom: 8px;
                page-break-inside: avoid;
              }
              .position {
                font-weight: bold;
                font-size: 14px;
              }
              .company {
                font-weight: bold;
                font-size: 12px;
                margin-bottom: 4px;
              }
              .duration {
                font-style: italic;
                font-size: 12px;
              }
              .education-item {
                margin-bottom: 8px;
                page-break-inside: avoid;
              }
              .degree {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 4px;
              }
              .institution {
                font-style: italic;
                font-size: 12px;
              }
              .education-year {
                font-size: 12px;
              }
              .education-details {
                display: flex;
                justify-content: space-between;
                margin-bottom: 3px;
              }
              .skill-category {
                margin-bottom: 5px;
              }
              ul {
                margin: 4px 0;
                padding-left: 18px;
              }
              li {
                margin-bottom: 2px;
                font-size: 12px;
              }
              @media print {
                @page { 
                  margin: 10mm; 
                  size: A4;
                }
                body { 
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .section, h2, .experience-item, .education-item { 
                  page-break-inside: avoid; 
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <!-- Header -->
              <h1>${optimizedResume?.contactInfo?.name || ""}</h1>
              <div class="contact-info">
                ${formatContactInfo()}
              </div>
              
              <!-- Summaries -->
              ${optimizedResume.summaries
                ?.map(
                  (summary) => `
                <div style="margin-bottom: 10px;">
                  <h2 style="font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin: 0 0 8px 0;">${
                    summary.heading
                  }</h2>
                  ${
                    summary.format === "bullets"
                      ? `<ul style="margin: 0; padding-left: 20px;">
                        ${summary.content
                          .split("\\n")
                          .filter((line) => line.trim())
                          .map(
                            (line) =>
                              `<li>${line
                                .replace(/^[\s]*[•\-\*]\s*/, "")
                                .trim()}</li>`
                          )
                          .join("")}
                      </ul>`
                      : summary.format === "mixed"
                      ? summary.content
                          .split("\\n")
                          .map((line) => {
                            const isBullet = /^[\s]*[•\-\*]/.test(line);
                            const cleanLine = isBullet
                              ? line.replace(/^[\s]*[•\-\*]\s*/, "").trim()
                              : line.trim();
                            if (!cleanLine) return "";
                            return isBullet
                              ? `<div style="margin-left: 20px;">• ${cleanLine}</div>`
                              : `<div>${cleanLine}</div>`;
                          })
                          .join("")
                      : `<div>${summary.content}</div>`
                  }
                </div>
              `
                )
                .join("")}
              
              <!-- Experience -->
              <div class="section">
                <h2>Experience</h2>
                ${generateExperienceHTML()}
              </div>
              
              <!-- Skills -->
              <div class="section">
                <h2>Skills</h2>
                <div>${formatSkills()}</div>
              </div>
              
              <!-- Education -->
              <div class="section">
                <h2>Education</h2>
                ${generateEducationHTML()}
              </div>
              
              <!-- Certifications -->
              ${generateCertificationsHTML()}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.setTimeout(function() {
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
      setIsLoading(false);
    } catch (error) {
      console.error("Error printing resume:", error);
      setError("Error printing resume: " + error.message);
      setIsLoading(false);
    }
  };

  return (
    <Paper className="p-4 mb-6">
      <Typography variant="h6" className="mb-4">
        Download Optimized Resume
      </Typography>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Box className="flex flex-wrap gap-3 justify-center mb-4">
        {/* Preview Button */}
        <Button
          variant="outlined"
          color="info"
          startIcon={
            isLoading ? <CircularProgress size={16} /> : <VisibilityIcon />
          }
          onClick={() => handlePdfAction("preview")}
          disabled={isLoading}
        >
          Preview PDF
        </Button>

        {/* Download Button */}
        <Button
          variant="contained"
          color="primary"
          startIcon={
            isLoading ? <CircularProgress size={16} /> : <DownloadIcon />
          }
          onClick={() => handlePdfAction("download")}
          disabled={isLoading}
        >
          Download PDF
        </Button>

        {/* Print Button */}
        <Button
          variant="outlined"
          color="secondary"
          startIcon={isLoading ? <CircularProgress size={16} /> : <PrintIcon />}
          onClick={handleDirectPrint}
          disabled={isLoading}
        >
          Print Resume
        </Button>
      </Box>

      {/* Rendering method toggle */}
      <Box className="flex items-center justify-center mb-2">
        <Typography variant="body2" className="mr-2">
          PDF Renderer:
        </Typography>
        <Button
          size="small"
          variant="text"
          color={useAlternateRenderer ? "primary" : "inherit"}
          onClick={() => setUseAlternateRenderer(!useAlternateRenderer)}
        >
          {useAlternateRenderer
            ? "Using Direct Renderer"
            : "Using HTML Renderer"}
        </Button>
      </Box>

      {/* Debug information (hidden in production) */}
      {process.env.NODE_ENV !== "production" && (
        <Box className="mt-3 p-2 bg-gray-100 rounded text-xs">
          <Typography variant="caption" className="block mb-1">
            <strong>Debug Info:</strong>
          </Typography>
          <Typography variant="caption" className="block">
            Skills data type: {typeof optimizedResume.skills}
            {Array.isArray(optimizedResume.skills) &&
              ` (Array of ${optimizedResume.skills.length} items)`}
          </Typography>
          {typeof optimizedResume.skills === "object" &&
            !Array.isArray(optimizedResume.skills) && (
              <Typography variant="caption" className="block">
                Skills keys: {Object.keys(optimizedResume.skills).join(", ")}
              </Typography>
            )}
          <Typography variant="caption" className="block">
            Education entries: {optimizedResume.education?.length || 0}
          </Typography>
          {optimizedResume.education?.length > 0 && (
            <Typography variant="caption" className="block">
              First education:{" "}
              {optimizedResume.education[0]?.institution || "N/A"},{" "}
              {optimizedResume.education[0]?.degree || "N/A"}
            </Typography>
          )}
          <Button
            size="small"
            variant="text"
            onClick={() => console.log("Optimized Resume:", optimizedResume)}
            className="mt-1 text-xs"
          >
            Log Full Data
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default ResumeDownload;
