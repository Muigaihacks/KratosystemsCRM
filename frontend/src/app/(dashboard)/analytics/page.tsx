"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  TrendingUp,
  Target,
  DollarSign,
  PieChart,
  Building2,
  Users,
  CheckCircle2,
} from "lucide-react";

type StageStat = {
  count: number;
  total_kes: number;
  label: string;
};

type PipelineStats = {
  total_pipeline_kes: number;
  total_clients: number;
  by_stage: Record<string, StageStat>;
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API}/api/pipeline/stats/`);
        setStats(res.data);
      } catch {
        // Fallback seed stats
        setStats({
          total_pipeline_kes: 11450000,
          total_clients: 6,
          by_stage: {
            hit_list: { count: 1, total_kes: 850000, label: "Hit List" },
            engaged: { count: 1, total_kes: 1200000, label: "Engaged" },
            discovery: { count: 1, total_kes: 2400000, label: "Discovery" },
            proposal_sent: { count: 0, total_kes: 0, label: "Proposal Sent" },
            negotiation: { count: 1, total_kes: 3500000, label: "Negotiation" },
            contracting: { count: 1, total_kes: 1850000, label: "Contracting" },
            active_build: { count: 1, total_kes: 1650000, label: "Active Build" },
            maintenance: { count: 0, total_kes: 0, label: "Maintenance" },
          },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalValue = stats?.total_pipeline_kes || 0;
  const totalClients = stats?.total_clients || 0;
  const avgDealSize = totalClients > 0 ? totalValue / totalClients : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="mono-label-teal">// COMMERCIAL INTELLIGENCE</span>
          <span className="text-white/20">•</span>
          <span className="text-xs text-white/50">PERFORMANCE METRICS</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-kratos-400" />
          Analytics & Pipeline Velocity
        </h1>
        <p className="text-sm text-white/50 mt-1">
          Real-time visibility into conversion funnels, deal values, and partnership lead attribution.
        </p>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="mono-label">Total Pipeline</span>
            <TrendingUp className="w-4 h-4 text-gold-400" />
          </div>
          <p className="text-2xl font-bold kes-value mt-2">
            KES {totalValue.toLocaleString()}
          </p>
          <p className="text-xs text-white/40 mt-1">Combined value of active deals</p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-2xl" />
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="mono-label">Total Accounts</span>
            <Building2 className="w-4 h-4 text-kratos-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{totalClients}</p>
          <p className="text-xs text-white/40 mt-1">Active client relationships</p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-kratos-500/5 rounded-full blur-2xl" />
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="mono-label">Average Deal Size</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold kes-value mt-2">
            KES {Math.round(avgDealSize).toLocaleString()}
          </p>
          <p className="text-xs text-white/40 mt-1">Mean deal value per engagement</p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="mono-label">Lead Source Split</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">83%</p>
          <p className="text-xs text-emerald-400/80 mt-1">Chris / Wylde Network</p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
        </div>
      </div>

      {/* Stage Funnel Table & Progress Bars */}
      <div className="glass-card p-6 rounded-2xl border border-white/8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Pipeline Conversion Funnel</h3>
            <p className="text-xs text-white/40 mt-0.5">
              Capital distribution and volume across all commercial stages.
            </p>
          </div>
          <span className="mono-label-teal">// STAGE VELOCITY</span>
        </div>

        <div className="space-y-4">
          {stats?.by_stage &&
            Object.entries(stats.by_stage).map(([stageKey, stageData]) => {
              const percentage =
                totalValue > 0 ? (stageData.total_kes / totalValue) * 100 : 0;

              return (
                <div key={stageKey} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-kratos-400" />
                      {stageData.label}
                      <span className="text-white/40 font-mono text-[11px]">
                        ({stageData.count} {stageData.count === 1 ? "deal" : "deals"})
                      </span>
                    </span>

                    <span className="font-mono text-white/90">
                      <strong className="kes-value font-semibold">
                        KES {stageData.total_kes.toLocaleString()}
                      </strong>{" "}
                      <span className="text-white/40 text-[10px]">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </span>
                  </div>

                  <div className="h-2 w-full bg-surface-raised rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-kratos-600 to-kratos-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, stageData.count > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
