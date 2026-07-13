"use client";

import { useState } from "react";
import {
  ExternalLink,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  Sparkles,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScoreRing } from "@/components/ui/score-ring";
import { AIAnalysis } from "./ai-analysis";
import type { JobWithScore, JobMatchAnalysis } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface DetailPanelProps {
  job: JobWithScore | null;
  resumeId: string | null;
}

export function DetailPanel({ job, resumeId }: DetailPanelProps) {
  const [analysis, setAnalysis] = useState<JobMatchAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analyzedJobId, setAnalyzedJobId] = useState<string | null>(null);

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-muted/30 flex items-center justify-center mb-4">
          <FileText className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-semibold text-muted-foreground">
          Select a job to view details
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Click on any job card from the list
        </p>
      </div>
    );
  }

  const locationText = job.job_is_remote
    ? "Remote"
    : [job.job_city, job.job_state, job.job_country].filter(Boolean).join(", ");

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(job.job_posted_at), { addSuffix: true });
    } catch {
      return "Recently";
    }
  })();

  const handleAnalyze = async () => {
    if (!resumeId) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysis(null);
    setAnalyzedJobId(job.job_id);

    try {
      const response = await fetch("/api/jobs/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          jobDescription: job.job_description,
          jobTitle: job.job_title,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset analysis if job changed
  const currentAnalysis = analyzedJobId === job.job_id ? analysis : null;
  const currentError = analyzedJobId === job.job_id ? analysisError : null;
  const currentLoading = analyzedJobId === job.job_id ? isAnalyzing : false;

  return (
    <div className="h-full overflow-auto animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-border/40">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground leading-tight">
              {job.job_title}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {job.employer_name}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {locationText}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{timeAgo}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              {job.job_is_remote && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                  Remote
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                <Briefcase className="h-3 w-3 mr-1" />
                {job.job_employment_type?.replace("_", " ") || "Full-time"}
              </Badge>
              {job.job_min_salary && job.job_max_salary && (
                <Badge variant="outline" className="text-xs">
                  {job.job_salary_currency || "$"}
                  {(job.job_min_salary / 1000).toFixed(0)}k -{" "}
                  {(job.job_max_salary / 1000).toFixed(0)}k
                </Badge>
              )}
            </div>
          </div>

          <ScoreRing score={job.base_match_score} size={64} strokeWidth={5} />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-4">
          <Button
            id="apply-now-btn"
            onClick={() => window.open(job.job_apply_link, "_blank")}
            className="gradient-btn text-white border-0 flex-1 sm:flex-none"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Apply Now
          </Button>
          <Button
            id="ai-analysis-btn"
            variant="outline"
            onClick={handleAnalyze}
            disabled={currentLoading || !resumeId}
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {currentLoading ? "Analyzing..." : "🤖 AI Analysis"}
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="analysis" className="p-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="description">Job Description</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="mt-4">
          {currentAnalysis || currentLoading || currentError ? (
            <AIAnalysis
              analysis={currentAnalysis}
              isLoading={currentLoading}
              error={currentError}
            />
          ) : (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium">
                Click &quot;🤖 AI Analysis&quot; to get a detailed match breakdown
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Powered by Mistral AI
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="description" className="mt-4">
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {job.job_description}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
