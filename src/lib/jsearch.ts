import { prisma } from "./prisma";

export interface Job {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  job_city: string | null;
  job_state: string | null;
  job_country: string;
  job_description: string;
  job_is_remote: boolean;
  job_employment_type: string;
  job_posted_at: string;
  job_apply_link: string;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_required_skills: string[] | null;
  base_match_score?: number;
}

interface JSearchResponse {
  status: string;
  data: JSearchJob[];
}

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  job_city: string | null;
  job_state: string | null;
  job_country: string;
  job_description: string;
  job_is_remote: boolean;
  job_employment_type: string;
  job_posted_at_datetime_utc: string;
  job_apply_link: string;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_required_skills: string[] | null;
}

function normalizeJob(job: JSearchJob): Job {
  return {
    job_id: job.job_id,
    job_title: job.job_title || "Untitled Position",
    employer_name: job.employer_name || "Unknown Company",
    employer_logo: job.employer_logo,
    job_city: job.job_city,
    job_state: job.job_state,
    job_country: job.job_country || "US",
    job_description: job.job_description || "",
    job_is_remote: job.job_is_remote || false,
    job_employment_type: job.job_employment_type || "FULLTIME",
    job_posted_at: job.job_posted_at_datetime_utc || new Date().toISOString(),
    job_apply_link: job.job_apply_link || "#",
    job_min_salary: job.job_min_salary,
    job_max_salary: job.job_max_salary,
    job_salary_currency: job.job_salary_currency,
    job_required_skills: job.job_required_skills,
  };
}

/**
 * Fetch jobs from JSearch API (via RapidAPI).
 * Uses cache-first strategy: checks PostgreSQL for cached results before hitting the API.
 * Cached results expire after 1 hour.
 *
 * Supports employment type filtering to include internships and all job types.
 */
export async function searchJobs(query: string): Promise<Job[]> {
  const cacheKey = query.toLowerCase().trim();

  // Check cache first
  const cached = await prisma.jobSearchCache.findUnique({
    where: { queryString: cacheKey },
  });

  if (cached && new Date(cached.expiresAt) > new Date()) {
    return cached.jobResults as unknown as Job[];
  }

  // Cache miss or expired — fetch from JSearch API
  const allJobs: Job[] = [];
  const numPages = 4; // 4 pages × 10 results = up to 40 jobs

  for (let page = 1; page <= numPages; page++) {
    try {
      const url = new URL("https://jsearch.p.rapidapi.com/search");
      url.searchParams.set("query", query);
      url.searchParams.set("page", page.toString());
      url.searchParams.set("num_pages", "1");
      url.searchParams.set("date_posted", "month");
      // Include all employment types: FULLTIME, PARTTIME, CONTRACTOR, INTERN
      url.searchParams.set("employment_types", "FULLTIME,PARTTIME,CONTRACTOR,INTERN");

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      });

      if (!response.ok) {
        console.error(`JSearch API error on page ${page}: ${response.status}`);
        // On 429 (rate limit), don't try more pages
        if (response.status === 429) break;
        continue; // Try next page on other errors
      }

      const data: JSearchResponse = await response.json();

      if (data.data && data.data.length > 0) {
        allJobs.push(...data.data.map(normalizeJob));
      } else {
        break; // No more results
      }
    } catch (error) {
      console.error(`JSearch fetch error on page ${page}:`, error);
      break;
    }
  }

  if (allJobs.length > 0) {
    // Upsert cache with 1-hour TTL
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.jobSearchCache.upsert({
      where: { queryString: cacheKey },
      update: {
        jobResults: allJobs as any,
        expiresAt,
      },
      create: {
        queryString: cacheKey,
        jobResults: allJobs as any,
        expiresAt,
      },
    });
  }

  return allJobs;
}
