"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  Filter,
  Building2,
  Mail,
  Phone,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import NewClientModal from "@/components/modals/NewClientModal";

type Client = {
  id: string;
  company_name: string;
  industry: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  stage: string;
  pipeline_value_kes: string | null;
  days_in_stage: number;
  source: string;
  assigned_developer_name: string | null;
  created_at: string;
};

const STAGES = [
  { id: "all", label: "All Clients" },
  { id: "hit_list", label: "Hit List", color: "#6B7280" },
  { id: "engaged", label: "Engaged", color: "#3B82F6" },
  { id: "discovery", label: "Discovery", color: "#8B5CF6" },
  { id: "proposal_sent", label: "Proposal Sent", color: "#F59E0B" },
  { id: "negotiation", label: "Negotiation", color: "#EF4444" },
  { id: "contracting", label: "Contracting", color: "#10B981" },
  { id: "active_build", label: "Active Build", color: "#1F8E86" },
  { id: "maintenance", label: "Maintenance", color: "#6366F1" },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [showNewModal, setShowNewModal] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${API}/api/clients/`);
      setClients(res.data.results || res.data || []);
    } catch {
      // Fallback seed
      setClients([
        {
          id: "seed-1",
          company_name: "Waiyaki Hides & Skins Ltd",
          industry: "manufacturing",
          contact_name: "James Waiyaki",
          contact_email: "j.waiyaki@waiyakihides.co.ke",
          contact_phone: "+254 712 345 678",
          stage: "contracting",
          pipeline_value_kes: "1850000.00",
          days_in_stage: 5,
          source: "chris",
          assigned_developer_name: "Tyrese Muigai",
          created_at: new Date().toISOString(),
        },
        {
          id: "seed-2",
          company_name: "Apex Agro Logistics",
          industry: "logistics",
          contact_name: "Kevin Mutua",
          contact_email: "kmutua@apexagro.africa",
          contact_phone: "+254 722 987 654",
          stage: "discovery",
          pipeline_value_kes: "2400000.00",
          days_in_stage: 3,
          source: "chris",
          assigned_developer_name: "Tyrese Muigai",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact_name.toLowerCase().includes(search.toLowerCase());
    const matchesStage = selectedStage === "all" || c.stage === selectedStage;
    return matchesSearch && matchesStage;
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
            <span className="mono-label-teal">// CRM DIRECTORY</span>
            <span className="text-white/20">•</span>
            <span className="text-xs text-white/50">ALL CLIENT ACCOUNTS</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-kratos-400" />
            Clients
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Comprehensive directory of all prospect, active build, and maintenance accounts.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-kratos-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Stage Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {STAGES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedStage(s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedStage === s.id
                ? "bg-kratos-500 text-white shadow-lg shadow-kratos-500/20"
                : "bg-surface-raised/80 text-white/60 hover:text-white border border-white/5 hover:border-white/10"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-raised/60 p-3 rounded-xl border border-white/8">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-kratos-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-white/50">
            Accounts: <strong className="text-white">{filteredClients.length}</strong>
          </span>
          <span className="text-white/20">|</span>
          <span className="text-white/50">
            Pipeline:{" "}
            <strong className="kes-value font-semibold">
              KES {totalValue.toLocaleString()}
            </strong>
          </span>
        </div>
      </div>

      {/* Client List */}
      <div className="glass-card rounded-2xl border border-white/8 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/40 text-sm">
            Loading clients...
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-16 text-center">
            <Building2 className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-white/80">No clients found</h3>
            <p className="text-xs text-white/40 mt-1">
              Try adjusting your search query or stage filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-raised/80 text-white/40 uppercase font-mono tracking-wider text-[10px] border-b border-white/8">
                <tr>
                  <th className="py-3.5 px-5">Company</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4">Contract Value</th>
                  <th className="py-3.5 px-4">Assigned To</th>
                  <th className="py-3.5 px-5 text-right">View Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {filteredClients.map((client) => {
                  const stageObj = STAGES.find((s) => s.id === client.stage);
                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
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
                          {client.industry}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-white/90 font-medium">
                          {client.contact_name}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-white/40 mt-0.5">
                          {client.contact_email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-2.5 h-2.5" />
                              {client.contact_email}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                          style={{
                            backgroundColor: `${stageObj?.color || "#1F8E86"}15`,
                            color: stageObj?.color || "#1F8E86",
                            border: `1px solid ${stageObj?.color || "#1F8E86"}30`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: stageObj?.color || "#1F8E86" }}
                          />
                          {stageObj?.label || client.stage}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono font-medium kes-value">
                        {client.pipeline_value_kes
                          ? `KES ${parseFloat(client.pipeline_value_kes).toLocaleString()}`
                          : "—"}
                      </td>

                      <td className="py-4 px-4 text-white/60">
                        {client.assigned_developer_name || (
                          <span className="text-white/30 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <Link
                          href={`/clients/${client.id}`}
                          className="inline-flex items-center gap-1 text-kratos-400 hover:text-kratos-300 font-medium text-xs group-hover:translate-x-1 transition-transform"
                        >
                          Profile
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showNewModal && (
        <NewClientModal
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          onSuccess={fetchClients}
        />
      )}
    </div>
  );
}
