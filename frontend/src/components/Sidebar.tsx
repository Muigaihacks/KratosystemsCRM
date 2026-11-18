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
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { clsx } from "clsx";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hit-list", label: "Hit List", icon: Target },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/sessions", label: "Sessions", icon: Video },
  { href: "/proposals", label: "Proposals", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/team", label: "Team & Access", icon: ShieldCheck },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        "fixed left-0 top-0 h-screen flex flex-col border-r border-white/8 bg-surface z-40 transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Header / Logo + Toggle */}
      <div
        className={clsx(
          "py-4 border-b border-white/8 flex items-center transition-all duration-300",
          collapsed ? "px-3 justify-center flex-col gap-3" : "px-4 justify-between"
        )}
      >
        <Link
          href="/dashboard"
          className={clsx("flex items-center gap-2.5 group", collapsed && "justify-center")}
          title="Kratos Systems Africa — QRF CRM"
        >
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-kratos-500/15 border border-kratos-500/30 flex items-center justify-center p-1 overflow-hidden">
              <img
                src="/kratos-emblem.png"
                alt="Kratos Systems"
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(31,142,134,0.4)]"
              />
            </div>
            <div className="absolute inset-0 rounded-lg bg-kratos-500/20 blur-[6px] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {!collapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <div className="font-display text-white text-sm font-semibold tracking-wide uppercase truncate">
                Kratos QRF
              </div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-kratos-400 truncate">
                Africa • CRM
              </div>
            </div>
          )}
        </Link>

        {/* Toggle Button (Claude-Style) */}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all focus:outline-none"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-kratos-400" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="mono-label px-3 mb-2 text-[10px] text-white/40 uppercase tracking-wider font-mono">
            Navigation
          </p>
        )}

        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 relative group",
                collapsed ? "justify-center" : "justify-start",
                isActive
                  ? "bg-kratos-500/15 text-kratos-300 border border-kratos-500/25"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent"
              )}
            >
              <item.icon
                className={clsx(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  isActive ? "text-kratos-400" : "text-white/40 group-hover:text-white/70"
                )}
              />

              {!collapsed && (
                <span className="truncate whitespace-nowrap">{item.label}</span>
              )}

              {/* Floating Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-[72px] rounded-lg px-2.5 py-1 bg-surface-elevated border border-white/15 text-white text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity shadow-xl z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className={clsx("p-3 border-t border-white/8", collapsed ? "flex justify-center" : "px-4 py-4")}>
        <div className={clsx("flex items-center gap-3", collapsed ? "justify-center" : "")}>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-white/80 truncate">
                Kratos QRF
              </p>
              <p className="mono-label text-[9px] text-kratos-400/80">Command Suite</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
