import { execFile } from "child_process";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

/**
 * PII Masking Engine — Optional Feature
 *
 * Routes PDF through an external Python PII masking system via child_process.
 * The Python script should:
 *   - Accept a PDF file path as the first argument
 *   - Output the masked text to stdout
 *
 * Configuration (via .env.local):
 *   PII_ENGINE_PATH — absolute path to the Python PII masking script
 *   PII_PYTHON_PATH — path to Python executable (defaults to "python")
 */

const PII_ENGINE_PATH = process.env.PII_ENGINE_PATH || "";
const PII_PYTHON_PATH = process.env.PII_PYTHON_PATH || "python";
const TIMEOUT_MS = 120_000; // 2 minutes max

export function isPIIEngineConfigured(): boolean {
  return PII_ENGINE_PATH.length > 0;
}

export async function runPIIMasking(pdfBuffer: Buffer): Promise<string> {
  if (!isPIIEngineConfigured()) {
    throw new Error(
      "PII masking engine is not configured. Set PII_ENGINE_PATH in your .env.local file."
    );
  }

  // Create temp directory inside the project
  const tmpDir = join(process.cwd(), "tmp", "pii");
  await mkdir(tmpDir, { recursive: true });

  const tempFileName = `resume-${randomUUID()}.pdf`;
  const tempFilePath = join(tmpDir, tempFileName);

  try {
    // Write PDF buffer to temp file
    await writeFile(tempFilePath, pdfBuffer);

    // Execute Python PII engine
    const maskedText = await new Promise<string>((resolve, reject) => {
      execFile(
        PII_PYTHON_PATH,
        [PII_ENGINE_PATH, tempFilePath],
        { timeout: TIMEOUT_MS, maxBuffer: 10 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            reject(
              new Error(
                `PII engine failed: ${error.message}${stderr ? `\nStderr: ${stderr}` : ""}`
              )
            );
            return;
          }

          const output = stdout.trim();
          if (!output) {
            reject(new Error("PII engine returned empty output"));
            return;
          }

          resolve(output);
        }
      );
    });

    return maskedText;
  } finally {
    // Cleanup temp file
    try {
      await unlink(tempFilePath);
    } catch {
      // Ignore cleanup errors
    }
  }
}
