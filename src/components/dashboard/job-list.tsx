"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { JobCard } from "./job-card";
import { Briefcase } from "lucide-react";
import type { JobWithScore } from "@/lib/types";

interface JobListProps {
  jobs: JobWithScore[];
  selectedJobId: string | null;
  onSelectJob: (job: JobWithScore) => void;
}

export function JobList({ jobs, selectedJobId, onSelectJob }: JobListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: jobs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140,
    overscan: 5,
  });

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <Briefcase className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          No jobs match your filters
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Try adjusting your search criteria
        </p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-full overflow-auto"
      style={{ contain: "strict" }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const job = jobs[virtualItem.index];
          return (
            <div
              key={job.job_id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              className="px-2 py-1"
            >
              <JobCard
                job={job}
                isSelected={selectedJobId === job.job_id}
                onClick={() => onSelectJob(job)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
