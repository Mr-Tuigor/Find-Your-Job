import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FindYourJob — AI Resume Analyzer & Job Matcher",
  description:
    "Upload your resume, get AI-powered analysis with ATS scoring, and find perfectly matched job listings with instant keyword matching and deep AI analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <TooltipProvider>
            <div className="mesh-gradient" aria-hidden="true" />
            <Navbar />
            <main className="flex-1">{children}</main>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
