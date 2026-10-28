"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  FileText,
  Receipt,
  Video,
  ArrowRight,
  Target,
  Sparkles,
  Building2,
  Clock,
} from "lucide-react";

type PipelineStats = {
  total_pipeline_kes: number;
  total_clients: number;
  by_stage: Record<string, { count: number; total_kes: number; label: string }>;
};

type Client = {
  id: string;
  company_name: string;
  industry: string;
  contact_name: string;
  stage: string;
  pipeline_value_kes: string | null;
  days_in_stage: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, clientsRes] = await Promise.all([
          axios.get(`${API}/api/pipeline/stats/`),
          axios.get(`${API}/api/clients/`),
        ]);
        setStats(statsRes.data);
        const all = clientsRes.data.results || clientsRes.data || [];
        setRecentClients(all.slice(0, 5));
      } catch {
        // Fallback seed
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
        setRecentClients([
          {
            id: "1",
            company_name: "Waiyaki Hides & Skins Ltd",
            industry: "manufacturing",
            contact_name: "James Waiyaki",
            stage: "contracting",
            pipeline_value_kes: "1850000.00",
            days_in_stage: 5,
          },
          {
            id: "2",
            company_name: "Apex Agro Logistics",
            industry: "logistics",
            contact_name: "Kevin Mutua",
            stage: "discovery",
            pipeline_value_kes: "2400000.00",
            days_in_stage: 3,
          },
          {
            id: "3",
            company_name: "Simba Haulers East Africa",
            industry: "transport",
            contact_name: "Hassan Omar",
            stage: "negotiation",
            pipeline_value_kes: "3500000.00",
            days_in_stage: 4,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalValue = stats?.total_pipeline_kes || 0;
  const totalClients = stats?.total_clients || 0;
  const activeBuildCount = stats?.by_stage?.active_build?.count || 0;
  const proposalCount = stats?.by_stage?.proposal_sent?.count || 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="mono-label-teal mb-1">// EXECUTIVE DASHBOARD</p>
          <h1 className="font-display text-white text-2xl font-bold tracking-tight">
            Kratos Systems Executive Suite
          </h1>
          <p className="text-white/50 text-xs mt-1">
            Overview of commercial deal flow, Chris Odongo partnership intake, and live engineering builds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/hit-list"
            className="px-3.5 py-2 rounded-xl bg-surface-raised border border-white/10 hover:border-white/20 text-xs text-white/80 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Target className="w-3.5 h-3.5 text-kratos-400" />
            Hit List
          </Link>
          <Link href="/pipeline" className="btn-primary text-xs flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Open Kanban Board
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <p className="mono-label">Total Pipeline Value</p>
            <TrendingUp className="w-4 h-4 text-gold-400" />
          </div>
          <p className="text-2xl font-bold font-mono kes-value">
            KES {totalValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-white/40 mt-1">Grounded in 8 deal stages</p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-2xl" />
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <p className="mono-label">Active Accounts</p>
            <Users className="w-4 h-4 text-kratos-300" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">{totalClients}</p>
          <p className="text-[11px] text-white/40 mt-1">Accounts in CRM directory</p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-kratos-500/5 rounded-full blur-2xl" />
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <p className="mono-label">Active Engineering Builds</p>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-blue-400">
            {activeBuildCount}
          </p>
          <p className="text-[11px] text-white/40 mt-1">In active software delivery</p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl" />
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <p className="mono-label">Contracting & Proposals</p>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            {(stats?.by_stage?.contracting?.count || 0) + (stats?.by_stage?.negotiation?.count || 0)}
          </p>
          <p className="text-[11px] text-white/40 mt-1">Closing phase deals</p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Accounts Activity */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/8 space-y-4">
          <div className="flex items-center justify-between border-b border-white/8 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Priority Deal Velocity</h3>
              <p className="text-xs text-white/40 mt-0.5">
                Key client accounts currently moving through pipeline stages.
              </p>
            </div>
            <Link
              href="/pipeline"
              className="text-xs text-kratos-400 hover:text-kratos-300 font-medium flex items-center gap-1"
            >
              View Board
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {recentClients.map((client) => (
              <div
                key={client.id}
                className="py-3.5 flex items-center justify-between hover:bg-white/[0.01] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-surface-raised border border-white/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-kratos-400" />
                  </div>
                  <div>
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-xs font-medium text-white hover:text-kratos-400 transition-colors"
                    >
                      {client.company_name}
                    </Link>
                    <p className="text-[11px] text-white/40">
                      {client.contact_name} • {client.industry}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="kes-value font-semibold">
                    {client.pipeline_value_kes
                      ? `KES ${parseFloat(client.pipeline_value_kes).toLocaleString()}`
                      : "—"}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-white/60">
                    {client.stage.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Launch Actions */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/8 space-y-4">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-kratos-400" />
              Quick Command Actions
            </h3>

            <div className="space-y-2.5">
              <Link
                href="/sessions"
                className="p-3 rounded-xl bg-surface-raised/80 hover:bg-surface-raised border border-white/5 hover:border-kratos-500/30 flex items-center justify-between text-xs text-white group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Video className="w-4 h-4 text-blue-400" />
                  <span>Dispatch Recall Meeting Bot</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/proposals"
                className="p-3 rounded-xl bg-surface-raised/80 hover:bg-surface-raised border border-white/5 hover:border-kratos-500/30 flex items-center justify-between text-xs text-white group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Draft AI Proposal</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/invoices"
                className="p-3 rounded-xl bg-surface-raised/80 hover:bg-surface-raised border border-white/5 hover:border-kratos-500/30 flex items-center justify-between text-xs text-white group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>Create eTIMS Tax Invoice</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/analytics"
                className="p-3 rounded-xl bg-surface-raised/80 hover:bg-surface-raised border border-white/5 hover:border-kratos-500/30 flex items-center justify-between text-xs text-white group transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-gold-400" />
                  <span>View Stage Conversion Analytics</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
