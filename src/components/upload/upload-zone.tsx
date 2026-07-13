"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Shield,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type UploadStatus = "idle" | "uploading" | "analyzing" | "success" | "error";

export function UploadZone() {
  const [file, setFile] = useState<File | null>(null);
  const [piiMasking, setPiiMasking] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") {
      setError("Only PDF files are accepted");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB");
      return;
    }
    setFile(f);
    setError(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    setProgress(20);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("piiMasking", piiMasking.toString());

    try {
      setProgress(40);
      setStatus("analyzing");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      setProgress(100);
      setStatus("success");

      // Redirect to dashboard after brief delay
      setTimeout(() => {
        router.push(`/dashboard?resumeId=${data.resumeId}`);
      }, 1000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const statusConfig = {
    idle: { icon: Upload, text: "Ready to upload", color: "text-muted-foreground" },
    uploading: { icon: Loader2, text: "Uploading...", color: "text-primary" },
    analyzing: { icon: Loader2, text: "AI is analyzing your resume...", color: "text-primary" },
    success: { icon: CheckCircle2, text: "Analysis complete! Redirecting...", color: "text-emerald-400" },
    error: { icon: AlertCircle, text: error || "Something went wrong", color: "text-destructive" },
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`upload-zone rounded-2xl p-10 text-center cursor-pointer transition-all ${
          isDragging ? "dragging border-primary bg-primary/5" : ""
        } ${file ? "border-primary/50" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          className="hidden"
          id="file-upload"
        />

        <div className="flex flex-col items-center gap-4">
          {file ? (
            <>
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • Click to change
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center">
                <Upload className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Drop your resume here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse • PDF only, max 10MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* PII Masking Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl glass-card">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-amber-400" />
          <div>
            <Label htmlFor="pii-toggle" className="text-sm font-medium cursor-pointer">
              Enable PII Masking
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Mask personal information before AI analysis
            </p>
          </div>
          <Tooltip>
            {/* @ts-expect-error: asChild is supported by Radix but shadcn types might miss it */}
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-xs">
                Your resume will be processed through a local PII masking engine
                before being sent to the AI for analysis. This removes names,
                emails, phone numbers, and other personal data.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Switch
          id="pii-toggle"
          checked={piiMasking}
          onCheckedChange={setPiiMasking}
        />
      </div>

      {/* Upload Progress */}
      {status !== "idle" && (
        <div className="space-y-2 animate-fade-in">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center gap-2 justify-center">
            <StatusIcon
              className={`h-4 w-4 ${statusConfig[status].color} ${
                status === "uploading" || status === "analyzing"
                  ? "animate-spin"
                  : ""
              }`}
            />
            <span className={`text-sm ${statusConfig[status].color}`}>
              {statusConfig[status].text}
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && status === "error" && (
        <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Upload Button */}
      <Button
        id="upload-btn"
        onClick={handleUpload}
        disabled={!file || status === "uploading" || status === "analyzing" || status === "success"}
        className="w-full gradient-btn text-white border-0 h-12 text-base font-semibold"
      >
        {status === "uploading" || status === "analyzing" ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : status === "success" ? (
          <>
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Done!
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 mr-2" />
            Analyze My Resume
          </>
        )}
      </Button>
    </div>
  );
}
