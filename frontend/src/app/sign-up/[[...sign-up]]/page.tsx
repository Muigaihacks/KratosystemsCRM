import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center text-white/50">Loading...</div>}>
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 bg-dot-grid">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Kratos Logo / Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kratos-500 to-kratos-700 flex items-center justify-center shadow-lg shadow-kratos-500/20">
              <span className="font-bold text-xl text-white tracking-wider">K</span>
            </div>
            <div>
              <h1 className="font-semibold text-lg text-white tracking-tight">Kratos Systems</h1>
              <p className="text-xs text-white/50 mono-label-teal">Internal CRM</p>
            </div>
          </div>

          {/* Clerk Sign Up Component */}
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-surface-elevated/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl",
                headerTitle: "text-white text-xl font-medium",
                headerSubtitle: "text-white/60 text-sm",
                formButtonPrimary:
                  "bg-kratos-500 hover:bg-kratos-600 text-white font-medium shadow-lg shadow-kratos-500/25 transition-all text-sm py-2.5",
                formFieldInput:
                  "bg-surface border border-white/10 text-white placeholder-white/30 rounded-lg focus:border-kratos-500 focus:ring-1 focus:ring-kratos-500",
                formFieldLabel: "text-white/80 text-xs font-medium",
                footerActionLink: "text-kratos-400 hover:text-kratos-300 font-medium",
                identityPreviewText: "text-white/80",
                dividerLine: "bg-white/10",
                dividerText: "text-white/40 text-xs uppercase",
              },
            }}
          />
        </div>
      </div>
    </Suspense>
  );
}
