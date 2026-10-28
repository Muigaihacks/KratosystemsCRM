import Link from "next/link";
import { Lock, ArrowRight, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 bg-dot-grid">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Kratos Logo / Header */}
        <div className="flex flex-col items-center text-center mb-6">
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
        </div>

        {/* Restricted Notice Card */}
        <div className="w-full bg-surface-elevated/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="text-white text-lg font-semibold mb-2">
            Invitation Only Access
          </h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            Self-registration is disabled for this secure internal platform. All team accounts are provisioned and assigned roles directly by administrators.
          </p>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/8 text-left mb-6">
            <div className="flex items-center gap-2 text-xs font-medium text-white/80 mb-1">
              <ShieldAlert className="w-4 h-4 text-kratos-400" />
              <span>Receiving an invite?</span>
            </div>
            <p className="text-[12px] text-white/50 leading-relaxed">
              If you were invited, check your email for your invitation link to activate your account and set your initial password.
            </p>
          </div>

          <Link
            href="/sign-in"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-kratos-500 hover:bg-kratos-600 text-white font-medium text-sm transition-all shadow-lg shadow-kratos-500/25"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-white/35 text-xs text-center mt-6">
          Kratos Systems Ltd • Nairobi, Kenya • ODPC Compliant
        </p>
      </div>
    </div>
  );
}
