export const _matchResume = {
  overallMatch: 75,
  categoryScores: {
    skills: 80,
    experience: 70,
    education: 70,
  },
  keyStrengths: [
    "Experience with Java, Spring Boot, and microservices architecture",
    "Cloud development experience with AWS",
    "Experience with Agile methodologies",
    "Front-end development experience with React.js and other JavaScript frameworks",
    "Experience with NoSQL databases (MongoDB)",
    "Experience with RESTful web services and API development",
  ],
  gapAnalysis: {
    critical: [
      "Golang",
      "Kubernetes",
      "DevSecOps experience",
      "Experience with CI/CD pipelines and tools like Jenkins, Docker",
    ],
    important: [
      "Experience with distributed caching systems like Redis",
      "Deeper understanding of cloud-native principles and practices",
    ],
    "nice-to-have": [
      "Experience with IBM Cloud",
      "Experience with Azure",
      "Experience with Istio",
      "Experience with Cloudant",
    ],
  },
  improvementOpportunities: [
    "Quantify achievements in experience section with metrics and numbers to demonstrate impact",
    "Tailor resume summary and experience descriptions to specifically address the job description requirements, highlighting relevant keywords and skills",
    'Create a dedicated "Projects" section to showcase personal projects or contributions to open-source projects that demonstrate relevant skills',
    "Shorten the summary section and focus on the most relevant skills and experience",
    "Remove irrelevant skills from the skills section, such as older Java versions (Java 6, Java 7) and technologies not mentioned in the job description (e.g., Flutter, Splunk)",
    "Add certifications related to cloud computing, Kubernetes, or DevSecOps to enhance credibility",
    "Include links to a portfolio or GitHub profile to showcase projects and code samples",
  ],
  roleTransformation: [
    "Emphasize experience with cloud-native development and microservices architecture",
    "Highlight experience with building and deploying applications on AWS and other cloud platforms",
    "Focus on skills related to containerization, orchestration, and CI/CD",
    "Position experience with Spring Boot as a strong foundation for developing cloud-native applications",
    "Showcase experience with RESTful API design and development",
  ],
  experienceMapping: {
    "First Command": {
      matches: [
        "Developed cloud microservices using Spring Boot",
        "Worked with microservice architecture using Spring Boot and REST APIs",
        "Experience with Apache Kafka",
        "Experience with AWS services (EC2, S3, etc.)",
        "Experience with Agile/SCRUM methodologies",
      ],
      gaps: ["No mention of Golang, Kubernetes, or DevSecOps practices"],
      transform: [
        "Frame experience with Spring Boot and microservices as directly applicable to cloud-native development on IBM Cloud",
        "Highlight experience with building and deploying scalable applications on AWS and relate it to similar tasks on IBM Cloud",
      ],
    },
    Lennar: {
      matches: [
        "Developed cloud-hosted web applications and REST APIs using Spring Boot",
        "Experience with Docker",
        "Experience with AWS services (EC2, S3, etc.)",
        "Experience with Agile Scrum methodology",
      ],
      gaps: ["No mention of Golang, Kubernetes, or DevSecOps practices"],
      transform: [
        "Emphasize experience with Docker and containerization as relevant to Kubernetes and container orchestration",
        "Highlight experience with building and deploying applications on AWS and relate it to similar tasks on IBM Cloud",
      ],
    },
    "CGI Inc": {
      matches: [
        "Developed RESTful web services using Spring Boot",
        "Experience with Spring Boot and microservices",
        "Experience with JMS and asynchronous communication",
        "Experience with Agile/SCRUM methodologies",
      ],
      gaps: [
        "No mention of Golang, Kubernetes, or DevSecOps practices",
        "Limited cloud experience",
      ],
      transform: [
        "Frame experience with Spring Boot and microservices as directly applicable to cloud-native development on IBM Cloud",
        "Highlight any experience related to cloud technologies or principles, even if not directly using IBM Cloud or AWS",
      ],
    },
  },
  titleSuggestions: {
    "Full Stack Developer (First Command)": "Cloud Application Developer",
    "Full Stack Developer (Lennar)": "Cloud Platform Engineer",
    "Java/J2EE Developer (CGI Inc)": "Microservices Developer",
  },
  skillsToEmphasize: [
    "Java",
    "Spring Boot",
    "Microservices",
    "AWS",
    "REST APIs",
    "Agile/SCRUM",
    "React.js",
    "MongoDB",
    "HTML",
    "CSS",
    "JavaScript",
  ],
  skillsToRemove: ["Java 6", "Java 7", "Flutter", "Splunk", "IMS", "JSTL"],
  isConsultingCompany: false,
};
