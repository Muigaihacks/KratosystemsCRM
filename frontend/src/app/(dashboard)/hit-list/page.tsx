"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  Target,
  Plus,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Building2,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import NewClientModal from "@/components/modals/NewClientModal";

type Client = {
  id: string;
  company_name: string;
  industry: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_role: string;
  stage: string;
  pipeline_value_kes: string | null;
  days_in_stage: number;
  source: string;
  assigned_developer_name: string | null;
  created_at: string;
};

const INDUSTRY_LABELS: Record<string, string> = {
  agriculture: "Agriculture & Agritech",
  manufacturing: "Manufacturing",
  logistics: "Logistics & Transport",
  healthcare: "Healthcare",
  energy: "Energy & Solar",
  financial_services: "Financial Services",
  consulting: "Consulting",
  retail: "Retail & E-commerce",
  other: "Other",
};

export default function HitListPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [showNewModal, setShowNewModal] = useState(false);
  const [promotingId, setPromotingId] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchHitList = async () => {
    try {
      const res = await axios.get(`${API}/api/clients/?stage=hit_list`);
      setClients(res.data.results || res.data || []);
    } catch {
      // Fallback seed
      setClients([
        {
          id: "seed-1",
          company_name: "Eldoret Fresh Produce Hub",
          industry: "agriculture",
          contact_name: "Peter Kiprono",
          contact_email: "peter@eldoretfresh.com",
          contact_phone: "+254 711 223 344",
          contact_role: "General Manager",
          stage: "hit_list",
          pipeline_value_kes: "850000.00",
          days_in_stage: 1,
          source: "chris",
          assigned_developer_name: null,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHitList();
  }, []);

  const promoteToEngaged = async (client: Client) => {
    setPromotingId(client.id);
    try {
      await axios.post(`${API}/api/clients/${client.id}/move-stage/`, {
        stage: "engaged",
      });
      // Remove from hit list view
      setClients((prev) => prev.filter((c) => c.id !== client.id));
    } catch (err) {
      console.error("Failed to promote client", err);
    } finally {
      setPromotingId(null);
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_name.toLowerCase().includes(search.toLowerCase());
    const matchesIndustry =
      industryFilter === "all" || c.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  const totalValue = filteredClients.reduce(
    (sum, c) => sum + (c.pipeline_value_kes ? parseFloat(c.pipeline_value_kes) : 0),
    0
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="mono-label-teal">// BUSINESS DEVELOPMENT</span>
            <span className="text-white/20">•</span>
            <span className="text-xs text-white/50">CHRIS ODONGO NETWORK</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-3">
            <Target className="w-6 h-6 text-kratos-400" />
            Hit List
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Raw prospects and potential client accounts. Qualify and move them to Engaged once contacted.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewModal(true)}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-kratos-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Prospect to Hit List
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="mono-label">Active Prospects</span>
            <Target className="w-4 h-4 text-white/40" />
          </div>
          <p className="text-2xl font-semibold text-white mt-2">
            {filteredClients.length}
          </p>
          <p className="text-xs text-white/40 mt-1">Awaiting first contact / intro</p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-kratos-500/5 rounded-full blur-2xl" />
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="mono-label">Est. Hit List Value</span>
            <TrendingUp className="w-4 h-4 text-gold-400" />
          </div>
          <p className="text-2xl font-semibold kes-value mt-2">
            KES {totalValue.toLocaleString()}
          </p>
          <p className="text-xs text-white/40 mt-1">Estimated contract potential</p>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-2xl" />
        </div>

        <div className="glass-card p-5 rounded-2xl relative overflow-hidden border-kratos-500/20">
          <div className="flex items-center justify-between">
            <span className="mono-label-teal">Next Pipeline Step</span>
            <Sparkles className="w-4 h-4 text-kratos-400" />
          </div>
          <p className="text-sm font-medium text-white/90 mt-2">
            Qualify $\rightarrow$ Engaged
          </p>
          <p className="text-xs text-white/50 mt-1">
            Click &quot;Promote to Engaged&quot; once initial reach-out is done.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-raised/60 p-3 rounded-xl border border-white/8">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-kratos-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-white/40" />
          <span className="text-xs text-white/50">Industry:</span>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="bg-surface border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-kratos-500"
          >
            <option value="all">All Industries</option>
            {Object.entries(INDUSTRY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table List */}
      <div className="glass-card rounded-2xl border border-white/8 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/40 text-sm">
            Loading prospects...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-16 text-center">
            <Target className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-white/80">No prospects in Hit List</h3>
            <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto">
              Add upcoming business contacts from Chris&apos;s Wylde network to track them here.
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="mt-4 btn-primary text-xs"
            >
              Add First Prospect
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-raised/80 text-white/40 uppercase font-mono tracking-wider text-[10px] border-b border-white/8">
                <tr>
                  <th className="py-3.5 px-5">Company / Account</th>
                  <th className="py-3.5 px-4">Primary Contact</th>
                  <th className="py-3.5 px-4">Est. Contract Value</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Days in Stage</th>
                  <th className="py-3.5 px-5 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-4 px-5">
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-medium text-white hover:text-kratos-400 flex items-center gap-2 group-hover:translate-x-0.5 transition-transform"
                      >
                        <Building2 className="w-3.5 h-3.5 text-kratos-500" />
                        {client.company_name}
                      </Link>
                      <span className="text-[11px] text-white/40 block mt-0.5 ml-5">
                        {INDUSTRY_LABELS[client.industry] || client.industry}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-white/90">
                        <User className="w-3 h-3 text-white/40" />
                        {client.contact_name}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-white/40 mt-0.5">
                        {client.contact_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5" />
                            {client.contact_email}
                          </span>
                        )}
                        {client.contact_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            {client.contact_phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono font-medium kes-value">
                      {client.pipeline_value_kes
                        ? `KES ${parseFloat(client.pipeline_value_kes).toLocaleString()}`
                        : "—"}
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-kratos-500/10 text-kratos-300 border border-kratos-500/20">
                        {client.source === "chris"
                          ? "Chris (Wylde)"
                          : client.source === "tyrese"
                          ? "Tyrese"
                          : client.source}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-white/50 font-mono text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-white/30" />
                        {client.days_in_stage}d
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => promoteToEngaged(client)}
                        disabled={promotingId === client.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs font-medium transition-all disabled:opacity-50"
                        title="Promote to Engaged stage"
                      >
                        {promotingId === client.id ? (
                          "Promoting..."
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Promote
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNewModal && (
        <NewClientModal
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          onSuccess={fetchHitList}
        />
      )}
    </div>
  );
}
