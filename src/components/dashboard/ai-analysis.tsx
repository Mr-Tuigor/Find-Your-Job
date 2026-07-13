"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { JobMatchAnalysis } from "@/lib/types";

interface AIAnalysisProps {
  analysis: JobMatchAnalysis | null;
  isLoading: boolean;
  error: string | null;
}

export function AIAnalysis({ analysis, isLoading, error }: AIAnalysisProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">Analysis Failed</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">
            AI is analyzing this match...
          </span>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4 skeleton-shimmer" />
          <Skeleton className="h-4 w-full skeleton-shimmer" />
          <Skeleton className="h-4 w-5/6 skeleton-shimmer" />
          <Skeleton className="h-20 w-full skeleton-shimmer" />
          <Skeleton className="h-4 w-2/3 skeleton-shimmer" />
          <Skeleton className="h-16 w-full skeleton-shimmer" />
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Match Score Header */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <Sparkles className="h-5 w-5 text-primary" />
        <div>
          <span className="text-sm font-semibold text-foreground">
            AI Match Score:{" "}
            <span className="text-primary">{analysis.match_percentage}%</span>
          </span>
        </div>
      </div>

      {/* Key Strengths */}
      <Section
        icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
        title="Key Strengths"
        color="emerald"
      >
        <ul className="space-y-1.5">
          {analysis.key_strengths.map((s, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">✓</span>
              {s}
            </li>
          ))}
        </ul>
      </Section>

      {/* Match Reasoning */}
      <Section
        icon={<Lightbulb className="h-4 w-4 text-amber-400" />}
        title="Why You Match"
        color="amber"
      >
        <ul className="space-y-1.5">
          {analysis.match_reasoning.map((r, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">→</span>
              {r}
            </li>
          ))}
        </ul>
      </Section>

      {/* Missing Skills */}
      <Section
        icon={<XCircle className="h-4 w-4 text-red-400" />}
        title="Missing Skills"
        color="red"
      >
        <div className="flex flex-wrap gap-1.5">
          {analysis.missing_skills.map((skill, i) => (
            <Badge
              key={i}
              variant="outline"
              className="text-[10px] border-red-500/30 text-red-400"
            >
              {skill}
            </Badge>
          ))}
        </div>
      </Section>

      {/* Suggestions */}
      <Section
        icon={<Sparkles className="h-4 w-4 text-blue-400" />}
        title="Suggestions"
        color="blue"
      >
        <ul className="space-y-1.5">
          {analysis.suggestions.map((s, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">💡</span>
              {s}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      {children}
    </div>
  );
}
