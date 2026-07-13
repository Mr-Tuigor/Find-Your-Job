import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeJobMatch } from "@/lib/mistral";
import type { ResumeAnalysis } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { resumeId, jobDescription, jobTitle } = body;

    if (!resumeId || !jobDescription || !jobTitle) {
      return Response.json(
        { error: "resumeId, jobDescription, and jobTitle are required" },
        { status: 400 }
      );
    }

    // Fetch resume from DB
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, userId: session.user.id },
    });

    if (!resume) {
      return Response.json({ error: "Resume not found" }, { status: 404 });
    }

    // Deep dive analysis via Mistral AI
    const analysis = await analyzeJobMatch(
      resume.originalText,
      jobDescription,
      jobTitle
    );

    return Response.json({ analysis });
  } catch (error) {
    console.error("Job analysis error:", error);
    const message = error instanceof Error ? error.message : "Failed to analyze job match";
    return Response.json({ error: message }, { status: 500 });
  }
}
