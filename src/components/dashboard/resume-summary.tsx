"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Target, Zap, AlertCircle } from "lucide-react";
import { ScoreRing } from "@/components/ui/score-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ResumeAnalysis } from "@/lib/types";

interface ResumeSummaryProps {
  analysis: ResumeAnalysis;
}

export function ResumeSummary({ analysis }: ResumeSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-card rounded-xl overflow-hidden mb-4">
      {/* Collapsed Header */}
      <button
        id="resume-summary-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-primary/3 transition-colors"
      >
        <div className="flex items-center gap-4">
          <ScoreRing score={analysis.ats_score} size={40} strokeWidth={3} />
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">
              Resume ATS Score: {analysis.ats_score}/100
            </p>
            <p className="text-xs text-muted-foreground">
              Recommended: <span className="text-primary font-medium">{analysis.recommended_role}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            {analysis.skills.slice(0, 3).map((skill, i) => (
              <Badge key={i} variant="secondary" className="text-[10px]">
                {skill}
              </Badge>
            ))}
            {analysis.skills.length > 3 && (
              <Badge variant="outline" className="text-[10px]">
                +{analysis.skills.length - 3}
              </Badge>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in border-t border-border/30 pt-4">
          {/* Skills */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold">Skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analysis.skills.map((skill, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-semibold">Extracted Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {analysis.extracted_keywords.map((kw, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="text-[10px] border-blue-500/30 text-blue-400"
                >
                  {kw}
                </Badge>
              ))}
            </div>
          </div>

          {/* Critical Feedback */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm font-semibold">Critical Feedback</span>
            </div>
            <ul className="space-y-1">
              {analysis.critical_feedback.map((fb, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  {fb}
                </li>
              ))}
            </ul>
          </div>

          {/* Brutal Feedback */}
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <p className="text-xs text-amber-200/80 italic leading-relaxed">
              &quot;{analysis.brutal_feedback}&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
