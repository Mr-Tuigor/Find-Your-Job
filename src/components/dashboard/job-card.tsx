"use client";

import { Building2, MapPin, Clock, Briefcase } from "lucide-react";
import { ScoreRing } from "@/components/ui/score-ring";
import { Badge } from "@/components/ui/badge";
import type { JobWithScore } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface JobCardProps {
  job: JobWithScore;
  isSelected: boolean;
  onClick: () => void;
}

export function JobCard({ job, isSelected, onClick }: JobCardProps) {
  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(job.job_posted_at), { addSuffix: true });
    } catch {
      return "Recently";
    }
  })();

  const locationText = job.job_is_remote
    ? "Remote"
    : [job.job_city, job.job_state].filter(Boolean).join(", ") || job.job_country;

  return (
    <button
      id={`job-card-${job.job_id}`}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all duration-200
        ${
          isSelected
            ? "job-card-active border-primary/60 bg-primary/8"
            : "border-border/40 hover:border-primary/30 hover:bg-primary/3 job-card-hover"
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Score Ring */}
        <ScoreRing score={job.base_match_score} size={44} strokeWidth={3.5} />

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate leading-tight">
            {job.job_title}
          </h3>

          <div className="flex items-center gap-1.5 mt-1">
            <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {job.employer_name}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{locationText}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            {job.job_is_remote && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-emerald-500/30 text-emerald-400">
                Remote
              </Badge>
            )}
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-border/50">
              <Briefcase className="h-2.5 w-2.5 mr-0.5" />
              {job.job_employment_type?.replace("_", " ") || "Full-time"}
            </Badge>
          </div>
        </div>
      </div>
    </button>
  );
}
