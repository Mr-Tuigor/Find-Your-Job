import Link from "next/link";
import {
  FileText,
  Sparkles,
  Briefcase,
  ArrowRight,
  Shield,
  Zap,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Powered by Mistral AI
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              Find Your
              <br />
              <span className="gradient-text">Perfect Job</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Upload your resume and let AI analyze it, score it against ATS
              standards, and match you with 30-40 live job listings — all in
              seconds.
            </p>

            <div className="flex items-center justify-center gap-4 mt-10">
              <Link href="/register">
                <Button
                  size="lg"
                  className="gradient-btn text-white border-0 h-13 px-8 text-base font-semibold gap-2"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-13 px-8 text-base border-border/50"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-border/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-3">
              Three simple steps to find your perfect career match
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="h-7 w-7" />}
              title="Upload & Analyze"
              description="Upload your PDF resume. Our AI extracts text, scores your ATS compatibility, and provides brutally honest feedback to improve."
              step="01"
            />
            <FeatureCard
              icon={<Target className="h-7 w-7" />}
              title="Smart Matching"
              description="We fetch 30-40 live job listings and instantly score each one against your resume keywords. No waiting — results in milliseconds."
              step="02"
            />
            <FeatureCard
              icon={<Sparkles className="h-7 w-7" />}
              title="Deep AI Analysis"
              description="Click any job for a detailed AI breakdown: why you match, what you're missing, and exactly how to improve your application."
              step="03"
            />
          </div>
        </div>
      </section>

      {/* Secondary Features */}
      <section className="py-20 border-t border-border/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <MiniFeature
              icon={<Shield className="h-5 w-5 text-amber-400" />}
              title="PII Protection"
              description="Optional PII masking removes personal data before AI analysis"
            />
            <MiniFeature
              icon={<Zap className="h-5 w-5 text-emerald-400" />}
              title="Instant Filters"
              description="Filter by match score, location, and keywords — all client-side"
            />
            <MiniFeature
              icon={<Briefcase className="h-5 w-5 text-blue-400" />}
              title="40+ Job Sources"
              description="Aggregated from LinkedIn, Indeed, Glassdoor, and more via Google Jobs"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  step,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-8 relative group hover:border-primary/30 transition-all duration-300">
      <span className="absolute top-4 right-4 text-5xl font-black text-primary/5 group-hover:text-primary/10 transition-colors">
        {step}
      </span>
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function MiniFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-border/30 hover:border-border/60 transition-colors">
      <div className="mt-0.5">{icon}</div>
      <div>
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}
