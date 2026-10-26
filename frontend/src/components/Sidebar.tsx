"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Target,
  KanbanSquare,
  Users,
  Video,
  FileText,
  Receipt,
  BarChart3,
  Zap,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hit-list", label: "Hit List", icon: Target },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/sessions", label: "Sessions", icon: Video },
  { href: "/proposals", label: "Proposals", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] flex flex-col border-r border-white/8 bg-surface z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-kratos-500/20 border border-kratos-500/40 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-kratos-400" />
            </div>
            <div className="absolute inset-0 rounded-lg bg-kratos-500/20 blur-[6px] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <div className="font-display text-white text-sm font-semibold tracking-wide uppercase">
              Kratos
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">
              CRM
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        <p className="mono-label px-2 mb-3">Navigation</p>
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-kratos-500/15 text-kratos-300 border border-kratos-500/25"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              )}
            >
              <item.icon
                className={clsx(
                  "w-4 h-4 flex-shrink-0",
                  isActive ? "text-kratos-400" : "text-white/35"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/8">
        <div className="flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-white/80 truncate">
              Kratos Systems
            </p>
            <p className="mono-label text-[9px]">Internal CRM</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
