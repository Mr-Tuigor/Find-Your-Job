import { Briefcase } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl gradient-btn mb-4">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Create Account</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Start finding your perfect job match
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
