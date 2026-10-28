import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center text-white/50">Loading...</div>}>
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 bg-dot-grid">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Kratos Logo / Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-2xl bg-surface-elevated/80 border border-kratos-500/30 flex items-center justify-center p-2.5 backdrop-blur-xl shadow-2xl shadow-kratos-500/20">
              <img
                src="/kratos-emblem.png"
                alt="Kratos Systems Africa"
                className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(31,142,134,0.6)]"
              />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-kratos-500/10 blur-xl -z-10" />
          </div>
          <h1 className="font-display font-bold text-xl text-white tracking-wide uppercase">
            Kratos Systems
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-kratos-400 mt-0.5">
            Africa • Enterprise CRM
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Internal Portal • Authorized Access
          </div>
        </div>

        {/* Clerk Sign In Component */}
        <SignIn
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
