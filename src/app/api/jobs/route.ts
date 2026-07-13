import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchJobs } from "@/lib/jsearch";
import { calculateMatchScore } from "@/lib/scoring";
import type { ResumeAnalysis, JobWithScore } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const resumeId = searchParams.get("resumeId");

    if (!query) {
      return Response.json({ error: "Query parameter is required" }, { status: 400 });
    }

    // Get resume data for scoring
    let keywords: string[] = [];
    let skills: string[] = [];
    let recommendedRole = query;
    if (resumeId) {
      const resume = await prisma.resume.findUnique({
        where: { id: resumeId, userId: session.user.id },
      });

      if (resume) {
        const parsed = resume.parsedJson as unknown as ResumeAnalysis;
        keywords = parsed.extracted_keywords || [];
        skills = parsed.skills || [];
        recommendedRole = parsed.recommended_role || query;
      }
    }

    const country = searchParams.get("country");
    const jobType = searchParams.get("jobType");

    // Build base query components
    let baseRole = recommendedRole;
    if (jobType && jobType !== "All Domains" && jobType !== "null") {
      baseRole = `${jobType} ${recommendedRole}`;
    }
    
    const locationSuffix = (country && country !== "Worldwide" && country !== "null") ? ` in ${country}` : "";

    // Build multiple search queries for broader coverage:
    // 1. Main recommended role with filters
    // 2. Role + "internship" for internship listings
    // 3. Top skills query for skill-based matches
    const queries: string[] = [`${baseRole}${locationSuffix}`];

    // Add internship variant
    queries.push(`${baseRole} intern${locationSuffix}`);

    // Add a skills-based query using top 3 skills
    if (skills.length > 0) {
      const topSkills = skills.slice(0, 3).join(" ");
      let skillsQuery = topSkills;
      if (jobType && jobType !== "All Domains" && jobType !== "null") {
        skillsQuery = `${jobType} ${topSkills}`;
      }
      queries.push(`${skillsQuery}${locationSuffix}`);
    }

    // Fetch jobs from all queries in parallel, deduplicate by job_id
    const allResults = await Promise.allSettled(
      queries.map((q) => searchJobs(q))
    );

    const seenJobIds = new Set<string>();
    const allJobs: JobWithScore[] = [];

    for (const result of allResults) {
      if (result.status === "fulfilled") {
        for (const job of result.value) {
          if (!seenJobIds.has(job.job_id)) {
            seenJobIds.add(job.job_id);

            // Compute match score with full context
            const score = keywords.length > 0
              ? calculateMatchScore(
                  [...keywords, ...skills],
                  `${job.job_title} ${job.job_description}`,
                  job.job_title,
                  job.job_required_skills
                )
              : 0;

            allJobs.push({ ...job, base_match_score: score });
          }
        }
      }
    }

    // Sort by match score descending
    allJobs.sort((a, b) => b.base_match_score - a.base_match_score);

    const limitedJobs = allJobs.slice(0, 40);

    return Response.json({ jobs: limitedJobs });
  } catch (error) {
    console.error("Jobs fetch error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch jobs";
    return Response.json({ error: message }, { status: 500 });
  }
}
