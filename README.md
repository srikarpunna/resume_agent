# Resume Optimizer Application

A powerful web application that optimizes user resumes for specific job descriptions using Google's Gemini API. This application implements an AI agent architecture to process resumes, analyze job descriptions, and generate tailored resumes.

## Features

- Upload your existing resume (PDF/DOCX)
- Paste a job description
- AI-powered resume optimization using Google's Gemini API
- Preview of the optimized resume
- Provide feedback and request changes
- Download the final resume as PDF

## Technical Stack

- **Frontend**: React.js, Material-UI, TailwindCSS
- **Backend**: Node.js with Express
- **AI Integration**: Google Gemini API
- **PDF Processing**: pdf-lib, pdf.js for parsing
- **DOCX Processing**: mammoth.js
- **PDF Generation**: react-pdf

## AI Agent Architecture

The application implements an AI agent architecture with:

1. **Orchestrator Agent**: Coordinates the entire workflow between agents
2. **Document Analyzer Agent**: Extracts structured information from uploaded resumes
3. **Job Description Analyzer Agent**: Parses job descriptions to identify key requirements
4. **Resume-Job Matcher Agent**: Compares resume against job requirements
5. **Content Enhancement Agent**: Optimizes resume content
6. **Feedback Interpreter Agent**: Processes user feedback

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Google Gemini API key

### Installation

1. Clone the repository

```
git clone https://github.com/yourusername/resume-optimizer.git
cd resume-optimizer
```

2. Install backend dependencies

```
npm install
```

3. Install frontend dependencies

```
npm run install-client
```

4. Create a `.env` file in the root directory and add your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
PORT=5000
```

5. Start the development server

```
npm run dev
```

6. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Upload your resume (PDF or DOCX)
2. Enter the job description
3. Review the AI-generated optimized resume
4. Provide feedback on sections you'd like to modify
5. Download the final resume as PDF

## License

This project is licensed under the MIT License - see the LICENSE file for details.
