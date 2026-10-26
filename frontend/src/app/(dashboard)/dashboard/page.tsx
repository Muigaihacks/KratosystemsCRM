"use client";

import { TrendingUp, Users, FileText, Receipt, Video } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-7">
      <div className="mb-8">
        <p className="mono-label-teal mb-1">// DASHBOARD</p>
        <h1 className="font-display text-white text-2xl font-semibold tracking-tight">
          Good evening, Tyrese 👋
        </h1>
        <p className="text-white/40 text-sm mt-1">Here's your Kratos Systems pipeline at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Pipeline", value: "KES 0", icon: TrendingUp, color: "text-gold-500", sub: "across all stages" },
          { label: "Active Clients", value: "0", icon: Users, color: "text-kratos-300", sub: "in pipeline" },
          { label: "Open Proposals", value: "0", icon: FileText, color: "text-blue-400", sub: "awaiting response" },
          { label: "Pending Invoices", value: "KES 0", icon: Receipt, color: "text-green-400", sub: "outstanding" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-5 border border-white/8">
            <div className="flex items-center justify-between mb-3">
              <p className="mono-label">{stat.label}</p>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className={`text-xl font-semibold font-mono ${stat.color}`}>{stat.value}</p>
            <p className="text-[11px] text-white/30 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6 border border-white/8">
        <div className="flex items-center gap-3 mb-4">
          <Video className="w-4 h-4 text-kratos-300" />
          <p className="text-white/70 text-sm font-medium">Upcoming Sessions</p>
        </div>
        <p className="text-white/30 text-sm">No sessions scheduled. Add client sessions to see them here.</p>
      </div>
    </div>
  );
}
