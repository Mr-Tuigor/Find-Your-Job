import { FileText } from "lucide-react";
import { UploadZone } from "@/components/upload/upload-zone";

export default function UploadPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Upload Your Resume</h1>
          <p className="text-muted-foreground mt-2">
            Drop your PDF resume and let AI do the heavy lifting
          </p>
        </div>
        <UploadZone />
      </div>
    </div>
  );
}
