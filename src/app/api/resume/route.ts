import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ResumeAnalysis } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resumeId = request.nextUrl.searchParams.get("id");

    if (resumeId) {
      // Fetch specific resume
      const resume = await prisma.resume.findUnique({
        where: { id: resumeId, userId: session.user.id },
      });

      if (!resume) {
        return Response.json({ error: "Resume not found" }, { status: 404 });
      }

      return Response.json({
        resume: {
          id: resume.id,
          originalText: resume.originalText,
          piiMasked: resume.piiMasked,
          parsedJson: resume.parsedJson as unknown as ResumeAnalysis,
          createdAt: resume.createdAt.toISOString(),
        },
      });
    }

    // Fetch all resumes for user (most recent first)
    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        piiMasked: true,
        parsedJson: true,
        createdAt: true,
      },
    });

    return Response.json({ resumes });
  } catch (error) {
    console.error("Resume fetch error:", error);
    return Response.json({ error: "Failed to fetch resume" }, { status: 500 });
  }
}
