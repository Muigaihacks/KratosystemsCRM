"use client";

import { useEffect, useState, use } from "react";
import axios from "axios";
import Link from "next/link";
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Clock,
  Sparkles,
  FileText,
  Receipt,
  Video,
  Plus,
  Send,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";

type ContextEntry = {
  id: string;
  context_type: string;
  summary_text: string;
  created_by_name: string;
  tags: string[];
  full_transcript_url?: string;
  created_at: string;
};

type Session = {
  id: string;
  session_name: string;
  session_type: string;
  provider: string;
  meeting_url: string;
  scheduled_at: string | null;
  transcript_status: string;
  summary_text?: string;
};

type Proposal = {
  id: string;
  proposal_number: string;
  title: string;
  status: string;
  total_value_kes: string;
  sent_at: string | null;
  final_pdf_url?: string;
};

type Invoice = {
  id: string;
  invoice_number: string;
  total_kes: string;
  status: string;
  etims_submitted: boolean;
  due_date: string | null;
};

type ClientDetail = {
  id: string;
  company_name: string;
  industry: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  contact_role: string;
  website: string;
  location: string;
  stage: string;
  pipeline_value_kes: string | null;
  days_in_stage: number;
  source: string;
  assigned_developer_name: string | null;
  created_at: string;
  context_entries: ContextEntry[];
  sessions: Session[];
  proposals: Proposal[];
  invoices: Invoice[];
};

const STAGES = [
  { id: "hit_list", label: "Hit List" },
  { id: "engaged", label: "Engaged" },
  { id: "discovery", label: "Discovery" },
  { id: "proposal_sent", label: "Proposal Sent" },
  { id: "negotiation", label: "Negotiation" },
  { id: "contracting", label: "Contracting" },
  { id: "active_build", label: "Active Build" },
  { id: "maintenance", label: "Maintenance" },
];

export default function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const clientId = resolvedParams.id;

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState("manual_note");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchClient = async () => {
    try {
      const res = await axios.get(`${API}/api/clients/${clientId}/`);
      setClient(res.data);
    } catch {
      // Fallback preview
      setClient({
        id: clientId,
        company_name: "Waiyaki Hides & Skins Ltd",
        industry: "manufacturing",
        contact_name: "James Waiyaki",
        contact_email: "j.waiyaki@waiyakihides.co.ke",
        contact_phone: "+254 712 345 678",
        contact_role: "Managing Director",
        website: "https://waiyakihides.co.ke",
        location: "Nairobi / Athi River",
        stage: "contracting",
        pipeline_value_kes: "1850000.00",
        days_in_stage: 5,
        source: "chris",
        assigned_developer_name: "Tyrese Muigai",
        created_at: new Date().toISOString(),
        context_entries: [
          {
            id: "ctx-1",
            context_type: "meeting_summary",
            created_by_name: "AI Agent (Recall + Claude)",
            summary_text:
              "James Waiyaki is seeking to automate inventory batch-tracking and supply chain analytics across 3 collection centers in Athi River and Naivasha. High priority on real-time mobile reporting and supplier reconciliation. KES 1.85M budget approved with 40% upfront deposit.",
            tags: ["supply_chain", "mobile_reports", "inventory"],
            created_at: new Date().toISOString(),
          },
        ],
        sessions: [
          {
            id: "sess-1",
            session_name: "Waiyaki — Discovery #1",
            session_type: "discovery",
            provider: "google_meet",
            meeting_url: "https://meet.google.com/abc-defg-hij",
            scheduled_at: new Date().toISOString(),
            transcript_status: "ready",
          },
        ],
        proposals: [
          {
            id: "prop-1",
            proposal_number: "KS-PROP-001",
            title: "Hides & Skins Business Intelligence System",
            status: "approved",
            total_value_kes: "1850000.00",
            sent_at: new Date().toISOString(),
          },
        ],
        invoices: [
          {
            id: "inv-1",
            invoice_number: "KS-INV-001",
            total_kes: "740000.00",
            status: "draft",
            etims_submitted: true,
            due_date: "2026-11-15",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  const handleStageChange = async (newStage: string) => {
    if (!client || client.stage === newStage) return;
    setUpdatingStage(true);
    try {
      await axios.post(`${API}/api/clients/${client.id}/move-stage/`, {
        stage: newStage,
      });
      setClient({ ...client, stage: newStage, days_in_stage: 0 });
    } catch (err) {
      console.error("Failed to update stage", err);
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !client) return;
    setSubmittingNote(true);
    try {
      const res = await axios.post(`${API}/api/clients/context/`, {
        client: client.id,
        context_type: noteType,
        summary_text: newNote,
      });
      setClient({
        ...client,
        context_entries: [res.data, ...(client.context_entries || [])],
      });
      setNewNote("");
    } catch {
      // Local optimistic update
      const fakeEntry: ContextEntry = {
        id: `local-${Date.now()}`,
        context_type: noteType,
        summary_text: newNote,
        created_by_name: "Tyrese Muigai",
        tags: ["manual_note"],
        created_at: new Date().toISOString(),
      };
      setClient({
        ...client,
        context_entries: [fakeEntry, ...(client.context_entries || [])],
      });
      setNewNote("");
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-white/50 text-sm">
        Loading client profile...
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-12 text-center text-white/50 text-sm">
        Client not found.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/pipeline"
        className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Back to Pipeline
      </Link>

      {/* Hero Header */}
      <div className="glass-card p-6 rounded-2xl border border-white/8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-kratos-500/20 border border-kratos-500/40 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-kratos-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {client.company_name}
                </h1>
                <p className="text-xs text-white/50 uppercase tracking-wider font-mono">
                  {client.industry} • Added by {client.source === "chris" ? "Chris (Wylde)" : "Tyrese"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/60 pt-2">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-white/40" />
                {client.contact_name} ({client.contact_role || "Contact"})
              </span>
              {client.contact_email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-white/40" />
                  <a
                    href={`mailto:${client.contact_email}`}
                    className="hover:text-kratos-400"
                  >
                    {client.contact_email}
                  </a>
                </span>
              )}
              {client.contact_phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-white/40" />
                  {client.contact_phone}
                </span>
              )}
              {client.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-white/40" />
                  {client.location}
                </span>
              )}
            </div>
          </div>

          {/* Commercials Summary */}
          <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-white/8 pt-4 lg:pt-0 lg:pl-6">
            <div>
              <span className="mono-label">Contract Value</span>
              <p className="text-2xl font-bold kes-value font-mono mt-1">
                {client.pipeline_value_kes
                  ? `KES ${parseFloat(client.pipeline_value_kes).toLocaleString()}`
                  : "—"}
              </p>
              <p className="text-[11px] text-white/40 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                {client.days_in_stage} days in current stage
              </p>
            </div>
          </div>
        </div>

        {/* Pipeline Stage Progress Bar */}
        <div className="mt-8 pt-6 border-t border-white/8">
          <div className="flex items-center justify-between mb-2">
            <span className="mono-label-teal">// PIPELINE PROGRESS</span>
            <span className="text-xs text-white/50 font-mono">
              Current Stage:{" "}
              <strong className="text-white uppercase">
                {client.stage.replace("_", " ")}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
            {STAGES.map((s, index) => {
              const currentStageIndex = STAGES.findIndex(
                (st) => st.id === client.stage
              );
              const isPast = index < currentStageIndex;
              const isCurrent = s.id === client.stage;

              return (
                <button
                  key={s.id}
                  disabled={updatingStage}
                  onClick={() => handleStageChange(s.id)}
                  className={`px-2 py-2 rounded-lg text-center text-[10px] font-medium transition-all ${
                    isCurrent
                      ? "bg-kratos-500 text-white font-semibold ring-2 ring-kratos-400/50 shadow-lg shadow-kratos-500/20"
                      : isPast
                      ? "bg-kratos-900/60 text-kratos-300 border border-kratos-700/30"
                      : "bg-surface-raised/60 text-white/40 border border-white/5 hover:border-white/10 hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Context Feed & Notes (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Context Note Form */}
          <div className="glass-card p-5 rounded-2xl border border-white/8 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-kratos-400" />
                Add Context or Meeting Note
              </span>
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value)}
                className="bg-surface border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/80 focus:outline-none focus:border-kratos-500"
              >
                <option value="manual_note">Manual Note</option>
                <option value="site_visit">Site Visit Notes</option>
                <option value="proposal_feedback">Proposal Feedback</option>
                <option value="contract_note">Contract Note</option>
              </select>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                rows={3}
                placeholder="Log key meeting decisions, technical requirements, stakeholder preferences, or budget updates..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full bg-surface border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-kratos-500 transition-colors"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingNote || !newNote.trim()}
                  className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  {submittingNote ? "Saving..." : "Save to Client Context"}
                </button>
              </div>
            </form>
          </div>

          {/* Context History Feed */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-kratos-400" />
              Intelligence & Context Timeline
            </h2>

            {client.context_entries.length === 0 ? (
              <div className="glass-card p-8 rounded-2xl border border-white/8 text-center text-white/40 text-xs">
                No context entries yet. Log a note above or dispatch a Recall.ai bot to a meeting.
              </div>
            ) : (
              client.context_entries.map((entry) => (
                <div
                  key={entry.id}
                  className="glass-card p-5 rounded-2xl border border-white/8 space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between text-[11px] text-white/40">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-kratos-500/10 text-kratos-300 font-mono uppercase text-[9px] border border-kratos-500/20">
                        {entry.context_type.replace("_", " ")}
                      </span>
                      <span>By {entry.created_by_name}</span>
                    </div>
                    <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                  </div>

                  <p className="text-xs text-white/90 leading-relaxed whitespace-pre-wrap">
                    {entry.summary_text}
                  </p>

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1">
                      {entry.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/50 font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Sessions, Proposals, Invoices (1 Col) */}
        <div className="space-y-6">
          {/* Client Sessions */}
          <div className="glass-card p-5 rounded-2xl border border-white/8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-blue-400" />
                Client Sessions
              </h3>
              <Link
                href="/sessions"
                className="text-[11px] text-kratos-400 hover:text-kratos-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Schedule
              </Link>
            </div>

            {client.sessions.length === 0 ? (
              <p className="text-xs text-white/40 italic">No sessions logged.</p>
            ) : (
              <div className="space-y-2.5">
                {client.sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3 rounded-xl bg-surface-raised/70 border border-white/5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-white">{sess.session_name}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                        {sess.provider.replace("_", " ")}
                      </span>
                    </div>
                    {sess.meeting_url && (
                      <a
                        href={sess.meeting_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-white/50 hover:text-kratos-400 flex items-center gap-1 truncate"
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        Join Call
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Proposals */}
          <div className="glass-card p-5 rounded-2xl border border-white/8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Proposals
              </h3>
              <Link
                href="/proposals"
                className="text-[11px] text-kratos-400 hover:text-kratos-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                New Draft
              </Link>
            </div>

            {client.proposals.length === 0 ? (
              <p className="text-xs text-white/40 italic">No proposals generated yet.</p>
            ) : (
              <div className="space-y-2.5">
                {client.proposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-3 rounded-xl bg-surface-raised/70 border border-white/5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-amber-400 font-semibold">
                        {prop.proposal_number}
                      </span>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
                        {prop.status}
                      </span>
                    </div>
                    <p className="text-xs text-white/80 truncate">{prop.title}</p>
                    <p className="text-xs font-mono kes-value">
                      KES {parseFloat(prop.total_value_kes).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoices & eTIMS */}
          <div className="glass-card p-5 rounded-2xl border border-white/8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Invoices & eTIMS
              </h3>
              <Link
                href="/invoices"
                className="text-[11px] text-kratos-400 hover:text-kratos-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Create
              </Link>
            </div>

            {client.invoices.length === 0 ? (
              <p className="text-xs text-white/40 italic">No invoices issued.</p>
            ) : (
              <div className="space-y-2.5">
                {client.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl bg-surface-raised/70 border border-white/5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-emerald-400 font-semibold">
                        {inv.invoice_number}
                      </span>
                      <div className="flex items-center gap-1">
                        {inv.etims_submitted && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            eTIMS
                          </span>
                        )}
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                          {inv.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-mono kes-value">
                      KES {parseFloat(inv.total_kes).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
