export const runtime = "nodejs";

import { NextRequest } from "next/server";

// Self-contained PDF text extractor — avoids pdf-parse CJS/ESM interop issues with Turbopack
async function parsePdf(dataBuffer: Buffer): Promise<{ text: string }> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(dataBuffer) });
  const doc = await loadingTask.promise;
  const textParts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      .filter((item: any) => "str" in item)
      .map((item: any) => item.str);
    textParts.push(strings.join(" "));
  }
  return { text: textParts.join("\n") };
}
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeResume } from "@/lib/mistral";
import { runPIIMasking, isPIIEngineConfigured } from "@/lib/pii-engine";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const piiMasking = formData.get("piiMasking") === "true";

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return Response.json({ error: "Only PDF files are accepted" }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: "File size must be under 10MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText: string;

    if (piiMasking) {
      // Route through PII masking engine
      if (!isPIIEngineConfigured()) {
        return Response.json(
          { error: "PII masking engine is not configured. Contact your administrator." },
          { status: 503 }
        );
      }
      extractedText = await runPIIMasking(buffer);
    } else {
      // Direct PDF parsing
      const pdfData = await parsePdf(buffer);
      extractedText = pdfData.text;
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return Response.json(
        { error: "Could not extract sufficient text from the PDF. Please upload a text-based PDF." },
        { status: 422 }
      );
    }

    // Send to Mistral AI for analysis
    const analysis = await analyzeResume(extractedText);

    // Save to database
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        originalText: extractedText,
        piiMasked: piiMasking,
        parsedJson: analysis as any,
      },
    });

    return Response.json({
      resumeId: resume.id,
      analysis,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Failed to process resume";
    return Response.json({ error: message }, { status: 500 });
  }
}
