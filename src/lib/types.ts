import type { Job } from "./jsearch";
import type { ResumeAnalysis, JobMatchAnalysis } from "./mistral";

export type { Job, ResumeAnalysis, JobMatchAnalysis };

export interface ResumeData {
  id: string;
  originalText: string;
  piiMasked: boolean;
  parsedJson: ResumeAnalysis;
  createdAt: string;
}

export interface JobWithScore extends Job {
  base_match_score: number;
}

export type LocationFilter = "all" | "remote" | "onsite" | "hybrid";

export interface ApiFilters {
  country: string;
  jobType: string;
}

export interface DashboardFilters {
  minScore: number;
  location: LocationFilter;
  keyword: string;
}
