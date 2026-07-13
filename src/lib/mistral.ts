import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
});

const MODEL = "mistral-small-2506";

export interface ResumeAnalysis {
  skills: string[];
  experience: { title: string; company: string; duration: string }[];
  ats_score: number;
  critical_feedback: string[];
  extracted_keywords: string[];
  recommended_role: string;
  brutal_feedback: string;
}

export interface JobMatchAnalysis {
  match_percentage: number;
  match_reasoning: string[];
  missing_skills: string[];
  suggestions: string[];
  key_strengths: string[];
}

export async function analyzeResume(text: string): Promise<ResumeAnalysis> {
  const response = await mistral.chat.complete({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `You are an expert resume analyst and career coach. You provide brutally honest, actionable feedback. You MUST respond with valid JSON only — no markdown, no code fences, no extra text.`,
      },
      {
        role: "user",
        content: `Analyze this resume text and return a JSON object with EXACTLY this schema:
{
  "skills": ["skill1", "skill2", ...],
  "experience": [{"title": "Job Title", "company": "Company Name", "duration": "Duration"}],
  "ats_score": <number 0-100>,
  "critical_feedback": ["feedback1", "feedback2", ...],
  "extracted_keywords": ["keyword1", "keyword2", ...],
  "recommended_role": "Best matching job title for job search",
  "brutal_feedback": "One paragraph of brutally honest feedback about the resume quality, what's missing, and what needs improvement"
}

Rules:
- ats_score should reflect how well the resume would perform in an Applicant Tracking System
- extracted_keywords is CRITICAL — extract as many as possible (aim for 20-40 keywords). Include:
  * Programming languages (e.g. Python, JavaScript, TypeScript, Java, C++)
  * Frameworks & libraries (e.g. React, Next.js, Django, Spring Boot)
  * Tools & platforms (e.g. Docker, Git, AWS, Figma, Jira)
  * Databases (e.g. PostgreSQL, MongoDB, Redis)
  * Methodologies (e.g. Agile, CI/CD, TDD)
  * Domain keywords (e.g. Machine Learning, API Development, Cloud Computing)
  * Soft skills (e.g. Leadership, Problem Solving, Communication)
  * Certifications mentioned
  * Industry terms relevant to their field
- recommended_role should be a broad, flexible job title to maximize search results. Prefer entry-level, fresher-friendly, or general roles (e.g., "Junior Software Engineer", "Software Engineer", "Marketing Assistant", "Intern") rather than highly specialized senior titles to ensure a higher volume of matches. Keep it easy to apply and flexible.
- Be brutally honest in feedback — don't sugarcoat
- Include at least 5 critical feedback points

Resume text:
${text}`,
      },
    ],
    temperature: 0.3,
    maxTokens: 2000,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("No response from Mistral AI");
  }

  // Strip potential markdown code fences
  const cleaned = content
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as ResumeAnalysis;
  } catch {
    throw new Error(`Failed to parse Mistral response as JSON: ${cleaned.substring(0, 200)}`);
  }
}

export async function analyzeJobMatch(
  resumeText: string,
  jobDescription: string,
  jobTitle: string
): Promise<JobMatchAnalysis> {
  const response = await mistral.chat.complete({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `You are an expert recruiter and career advisor. Compare the candidate's resume against the job posting and provide detailed analysis. You MUST respond with valid JSON only — no markdown, no code fences, no extra text.`,
      },
      {
        role: "user",
        content: `Compare this resume against the following job posting and return a JSON object with EXACTLY this schema:
{
  "match_percentage": <number 0-100>,
  "match_reasoning": ["reason1", "reason2", ...],
  "missing_skills": ["skill1", "skill2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "key_strengths": ["strength1", "strength2", ...]
}

Rules:
- match_percentage: overall fit percentage
- match_reasoning: 3-5 specific reasons why the candidate matches
- missing_skills: skills/qualifications the candidate lacks for this role
- suggestions: actionable advice for the candidate to improve their chances
- key_strengths: 3-5 strongest matching points

Job Title: ${jobTitle}
Job Description:
${jobDescription}

Resume:
${resumeText}`,
      },
    ],
    temperature: 0.3,
    maxTokens: 1500,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("No response from Mistral AI");
  }

  const cleaned = content
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as JobMatchAnalysis;
  } catch {
    throw new Error(`Failed to parse Mistral job analysis response: ${cleaned.substring(0, 200)}`);
  }
}
