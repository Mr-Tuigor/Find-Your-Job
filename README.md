<div align="center">

# 🎯 FindYourJob: An AI-Powered Resume Analyzer & Job Matcher
**IEEE Format Project Documentation**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)](https://www.prisma.io/)

</div>

---

## Abstract
The rapid evolution of the job market demands efficient mechanisms for connecting job seekers with relevant opportunities. "FindYourJob" is an AI-powered resume analyzer and job matching system designed to streamline the recruitment process. Utilizing advanced Large Language Models (LLMs) such as Mistral AI, the system provides automated extraction of skills, experience, and keywords from resumes. It further integrates with real-time job boards via the JSearch API to intelligently match candidates with suitable positions. This document outlines the architecture, features, and implementation details of the system.

## 1. Introduction
The recruitment landscape is increasingly reliant on automated tools to process large volumes of applications. Traditional Applicant Tracking Systems (ATS) often rely on rigid keyword matching, which can disadvantage candidates whose resumes use synonyms or different phrasing. "FindYourJob" addresses this limitation by employing semantic analysis and AI-driven skill grouping. The system provides users with brutally honest feedback on their resumes and recommends jobs based on a sophisticated matching algorithm that accounts for skill synonyms, job title relevance, and required qualifications.

## 2. System Architecture
The system follows a modern web architecture, utilizing a client-server model with a robust backend for AI processing and data management. 
- **Frontend Layer:** Developed using Next.js 16 (App Router) with TypeScript and Tailwind CSS, offering a responsive, glassmorphism-themed user interface.
- **Backend Layer:** Powered by Next.js API routes, interacting with a PostgreSQL database via Prisma ORM for data persistence and caching.
- **AI Engine:** Integrates Mistral AI (`mistral-small-2506`) for natural language understanding, skill extraction, and deep analysis of job-resume fit.
- **External APIs:** Utilizes the JSearch API (RapidAPI) for aggregating live job postings across 40+ job boards.

## 3. Methodology & Features
### 3.1 Smart Resume Analysis
- **Data Extraction:** Extracts 20-40 keywords covering languages, frameworks, methodologies, and soft skills using Mistral AI.
- **Feedback Mechanism:** Generates actionable feedback to improve the resume's ATS compatibility and overall quality.
- **PII Masking:** (Optional) An external Python-based engine masks Personally Identifiable Information (PII) such as names and contact details before AI processing to ensure privacy.

### 3.2 Intelligent Job Matching
- **Data Aggregation:** Queries multiple endpoints (recommended role, internships, top skills) simultaneously.
- **Smart Scoring Algorithm:** Computes a match score based on synonym matching (e.g., "JS" and "JavaScript"), skill-family grouping (e.g., React and Vue.js), and explicit requirement matching.
- **Caching Mechanism:** Implements a 1-hour intelligent cache in PostgreSQL to optimize API usage and reduce latency.

### 3.3 Security & Administration
- **Authentication:** Secured via NextAuth.js v5 using credential-based login.
- **Role-Based Access Control (RBAC):** Distinguishes between standard users and administrators, with protected routes and a dedicated admin panel for user management.

## 4. Implementation Details
The project structure is organized modularly:
- `/src/app`: Contains Next.js routes, including the dashboard, admin panel, and API endpoints.
- `/src/components`: Houses reusable UI components (e.g., Shadcn/ui primitives, uploaded zone, job lists).
- `/src/lib`: Contains core logic for AI integration (`mistral.ts`), job searching (`jsearch.ts`), and the scoring engine (`scoring.ts`).

## 5. Conclusion
"FindYourJob" presents a comprehensive solution for modern job seekers, leveraging AI to bridge the gap between candidate qualifications and job requirements. The intelligent scoring engine and real-time job matching capabilities significantly enhance the efficiency of the job search process.

---

## 6. Setup Instructions & Getting Started

### Prerequisites
- **Node.js** ≥ 20
- **PostgreSQL** (local instance or Docker)
- **Mistral AI API key** — [Get one here](https://console.mistral.ai/)
- **RapidAPI key** (JSearch) — [Subscribe here](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/Find_Your_Job.git
cd Find_Your_Job
npm install
```

### 2. Set Up PostgreSQL
**Option A: Docker (recommended)**
```bash
docker run --name fyj-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=find_your_job \
  -p 5432:5432 -d postgres:15
```

**Option B: Native install** — Create a database named `find_your_job` in pgAdmin or `psql`.

### 3. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` with your actual values:
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/find_your_job"

# Mistral AI
MISTRAL_API_KEY="your-mistral-api-key"

# RapidAPI (JSearch)
RAPIDAPI_KEY="your-rapidapi-key"

# NextAuth
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# PII Masking (optional — leave empty to disable)
PII_ENGINE_PATH=""
PII_PYTHON_PATH="python"
```

### 4. Initialize Database
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Admin Access
Promote any registered user to admin:
```bash
npx tsx scripts/make-admin.ts user@example.com
```

### PII Masking Engine Configuration
If you have an external Python-based PII masking tool, configure it in `.env`:
```env
PII_ENGINE_PATH="/path/to/your/pii_script.py"
PII_PYTHON_PATH="python3"
```
The engine receives the PDF buffer via stdin and should return masked plain text via stdout.
