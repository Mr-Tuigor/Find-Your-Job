"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Briefcase, Upload } from "lucide-react";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { JobList } from "@/components/dashboard/job-list";
import { DetailPanel } from "@/components/dashboard/detail-panel";
import { ResumeSummary } from "@/components/dashboard/resume-summary";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  JobWithScore,
  ResumeAnalysis,
  DashboardFilters,
  LocationFilter,
  ApiFilters,
} from "@/lib/types";

function DashboardContent() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resumeId");

  const [activeResumeId, setActiveResumeId] = useState<string | null>(resumeId);
  const [resumesList, setResumesList] = useState<{id: string, createdAt: string, parsedJson: any}[]>([]);
  
  const [jobs, setJobs] = useState<JobWithScore[]>([]);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobWithScore | null>(null);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const [filters, setFilters] = useState<DashboardFilters>({
    minScore: 0,
    location: "all",
    keyword: "",
  });

  const [apiFilters, setApiFilters] = useState<ApiFilters>({
    country: "Worldwide",
    jobType: "All Domains",
  });

  // Fetch resume data
  useEffect(() => {
    async function fetchResumes() {
      try {
        if (activeResumeId) {
          const res = await fetch(`/api/resume?id=${activeResumeId}`);
          if (!res.ok) throw new Error("Failed to load resume");
          const data = await res.json();
          setResumeAnalysis(data.resume.parsedJson);
        } else {
          // fetch all resumes
          const res = await fetch(`/api/resume`);
          if (!res.ok) throw new Error("Failed to load resumes");
          const data = await res.json();
          if (data.resumes && data.resumes.length > 0) {
            setResumesList(data.resumes);
          }
        }
      } catch (err) {
        console.error("Resume fetch error:", err);
      } finally {
        setIsLoadingResume(false);
      }
    }

    fetchResumes();
  }, [activeResumeId]);

  // Fetch jobs when searchTrigger changes (on manual search)
  useEffect(() => {
    if (!resumeAnalysis || searchTrigger === 0) {
      if (!isLoadingResume) setIsLoadingJobs(false);
      return;
    }

    async function fetchJobs() {
      setIsLoadingJobs(true);
      setError(null);
      try {
        const query = resumeAnalysis!.recommended_role;
        const res = await fetch(
          `/api/jobs?query=${encodeURIComponent(query)}&resumeId=${activeResumeId}&country=${encodeURIComponent(apiFilters.country)}&jobType=${encodeURIComponent(apiFilters.jobType)}`
        );
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        setJobs(data.jobs);
        setHasSearched(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load jobs");
      } finally {
        setIsLoadingJobs(false);
      }
    }

    fetchJobs();
  }, [resumeAnalysis, activeResumeId, isLoadingResume, searchTrigger]);

  const handleSearch = () => {
    setSearchTrigger(t => t + 1);
  };

  // Client-side filtering — instantaneous
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Min score filter
      if (job.base_match_score < filters.minScore) return false;

      // Location filter
      if (filters.location !== "all") {
        if (filters.location === "remote" && !job.job_is_remote) return false;
        if (filters.location === "onsite" && job.job_is_remote) return false;
        // hybrid: show all (most APIs don't distinguish hybrid)
      }

      // Keyword filter
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        const searchable = `${job.job_title} ${job.employer_name} ${job.job_description}`.toLowerCase();
        if (!searchable.includes(kw)) return false;
      }

      return true;
    });
  }, [jobs, filters]);

  if (isLoadingResume || isLoadingJobs) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            {isLoadingResume ? "Loading your resume..." : "Fetching job listings..."}
          </p>
        </div>
      </div>
    );
  }

  if (!activeResumeId || !resumeAnalysis) {
    if (resumesList.length > 0 && !activeResumeId) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 tracking-tight">Select a Resume</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Choose one of your previously uploaded resumes to start finding jobs, or upload a new one.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl px-4">
            {resumesList.map(r => (
              <button 
                key={r.id} 
                onClick={() => {
                  setActiveResumeId(r.id);
                  setResumeAnalysis(r.parsedJson);
                }}
                className="glass-card p-6 rounded-xl text-left hover:border-primary/50 hover:bg-white/5 transition group flex flex-col h-full"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                      {new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                    {r.parsedJson?.recommended_role || "Uploaded Resume"}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {r.parsedJson?.skills?.slice(0, 3).map((skill: string) => (
                      <span key={skill} className="text-[10px] bg-background/50 border border-border/50 px-1.5 py-0.5 rounded text-muted-foreground">
                        {skill}
                      </span>
                    ))}
                    {r.parsedJson?.skills?.length > 3 && (
                      <span className="text-[10px] bg-background/50 border border-border/50 px-1.5 py-0.5 rounded text-muted-foreground">
                        +{r.parsedJson.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-10">
            <a
              href="/upload"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl gradient-btn text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              <Upload className="h-4 w-4" />
              Upload New Resume
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">No Resume Found</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Upload a resume first to see job matches.
          </p>
          <a
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg gradient-btn text-white text-sm font-medium"
          >
            Upload Resume
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Resume Summary */}
      <ResumeSummary analysis={resumeAnalysis} />

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        apiFilters={apiFilters}
        onApiFilterChange={setApiFilters}
        onSearch={handleSearch}
        totalJobs={jobs.length}
        filteredCount={filteredJobs.length}
      />

      {/* Master-Detail Layout */}
      {!hasSearched && jobs.length === 0 && !isLoadingJobs && !error ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] glass-card rounded-xl text-center p-8">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2">Ready to find your match?</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Select your preferred job domain and country above, then click <strong className="text-foreground">Search Jobs</strong> to find the best opportunities tailored to your resume.
          </p>
        </div>
      ) : (
        <div className="flex gap-4" style={{ height: "calc(100vh - 320px)" }}>
        {/* Left Column — Job List (40%) */}
        <div className="w-[40%] min-w-[300px] glass-card rounded-xl overflow-hidden">
          <JobList
            jobs={filteredJobs}
            selectedJobId={selectedJob?.job_id || null}
            onSelectJob={setSelectedJob}
          />
        </div>

        {/* Right Column — Detail Panel (60%) */}
        <div className="flex-1 glass-card rounded-xl overflow-hidden">
          <DetailPanel job={selectedJob} resumeId={activeResumeId} />
        </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
