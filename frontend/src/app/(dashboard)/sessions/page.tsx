"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  Video,
  Plus,
  Search,
  Bot,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
  X,
} from "lucide-react";

type Session = {
  id: string;
  client: string;
  client_name: string;
  session_name: string;
  session_type: string;
  provider: string;
  meeting_url: string;
  scheduled_at: string | null;
  duration_minutes: number | null;
  recall_bot_id: string;
  recording_url: string;
  transcript_status: string;
  transcript_text?: string;
  summary_text?: string;
  action_items?: string[];
  key_takeaways?: string[];
  created_at: string;
};

type Client = {
  id: string;
  company_name: string;
};

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [provider, setProvider] = useState("google_meet");
  const [dispatching, setDispatching] = useState(false);
  const [selectedSessionForDetails, setSelectedSessionForDetails] = useState<Session | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchData = async () => {
    try {
      const [sessRes, clientRes] = await Promise.all([
        axios.get(`${API}/api/sessions/`),
        axios.get(`${API}/api/clients/`),
      ]);
      setSessions(sessRes.data.results || sessRes.data || []);
      setClients(clientRes.data.results || clientRes.data || []);
    } catch {
      // Fallback seed
      setSessions([
        {
          id: "sess-1",
          client: "c-1",
          client_name: "Waiyaki Hides & Skins Ltd",
          session_name: "Waiyaki — Discovery Session #1",
          session_type: "discovery",
          provider: "google_meet",
          meeting_url: "https://meet.google.com/xyz-abcd-efg",
          scheduled_at: new Date().toISOString(),
          duration_minutes: 45,
          recall_bot_id: "bot_123456",
          recording_url: "",
          transcript_status: "ready",
          summary_text:
            "Discussion on batch-tracking hides from Athi River to Naivasha. Managing Director James Waiyaki approved scope for real-time mobile reporting and supplier reconciliation.",
          action_items: [
            "Send formal proposal by Friday",
            "Schedule follow-up on warehouse weighbridge API",
          ],
          key_takeaways: [
            "Budget approved at KES 1.85M",
            "40% advance deposit accepted",
          ],
          created_at: new Date().toISOString(),
        },
      ]);
      setClients([
        { id: "c-1", company_name: "Waiyaki Hides & Skins Ltd" },
        { id: "c-2", company_name: "Apex Agro Logistics" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDispatchBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !meetingUrl.trim()) return;
    setDispatching(true);

    try {
      // 1. Create the session
      const createRes = await axios.post(`${API}/api/sessions/`, {
        client: selectedClient,
        session_name: sessionName || `Discovery Call — ${new Date().toLocaleDateString()}`,
        meeting_url: meetingUrl,
        provider: provider,
        session_type: "discovery",
      });

      const newSession = createRes.data;

      // 2. Dispatch the bot
      try {
        await axios.post(`${API}/api/sessions/${newSession.id}/dispatch-bot/`);
      } catch (botErr) {
        console.warn("Recall.ai bot dispatch pending API key, session saved.", botErr);
      }

      setSessions([newSession, ...sessions]);
      setShowDispatchModal(false);
      setMeetingUrl("");
      setSessionName("");
      setSelectedClient("");
    } catch (err) {
      console.error("Failed to schedule session", err);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="mono-label-teal">// INTELLIGENCE GATHERING</span>
            <span className="text-white/20">•</span>
            <span className="text-xs text-white/50">UNIVERSAL MEETING SESSIONS</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-3">
            <Video className="w-6 h-6 text-kratos-400" />
            Client Sessions & Recall Bot
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Dispatch Recall.ai bots to Zoom, Google Meet, or Microsoft Teams to capture transcripts and Claude summaries automatically.
          </p>
        </div>

        <button
          onClick={() => setShowDispatchModal(true)}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-kratos-500/20"
        >
          <Bot className="w-4 h-4" />
          Dispatch Recall Bot
        </button>
      </div>

      {/* Feature Banner */}
      <div className="glass-card p-5 rounded-2xl border border-kratos-500/20 bg-gradient-to-r from-kratos-900/30 via-surface-raised to-surface flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-kratos-500/20 border border-kratos-500/40 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-kratos-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Automated Meeting Pipeline (Recall.ai $\rightarrow$ AssemblyAI $\rightarrow$ Claude)
            </h4>
            <p className="text-xs text-white/50 mt-0.5">
              Paste any meeting link before your call. The bot enters the call, records audio, generates a timestamped transcript, and extracts action items into the client&apos;s context log.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-white/60">
          <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Google Meet</span>
          <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Zoom</span>
          <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">Teams</span>
        </div>
      </div>

      {/* Session List */}
      <div className="glass-card rounded-2xl border border-white/8 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/40 text-sm">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-16 text-center">
            <Video className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-white/80">No Client Sessions logged</h3>
            <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto">
              Dispatch your first Recall.ai bot to a client meeting to begin capturing AI transcripts and commercial context.
            </p>
            <button
              onClick={() => setShowDispatchModal(true)}
              className="mt-4 btn-primary text-xs"
            >
              Dispatch Bot Now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-5 hover:bg-white/[0.02] transition-colors space-y-3 cursor-pointer"
                onClick={() => setSelectedSessionForDetails(sess)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-raised border border-white/10 flex items-center justify-center">
                      <Video className="w-4 h-4 text-kratos-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white hover:text-kratos-400 transition-colors">
                        {sess.session_name}
                      </h3>
                      <Link
                        href={`/clients/${sess.client}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-white/50 hover:text-white flex items-center gap-1 mt-0.5"
                      >
                        <Building2 className="w-3 h-3 text-kratos-500" />
                        {sess.client_name}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 uppercase border border-blue-500/20">
                      {sess.provider.replace("_", " ")}
                    </span>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded uppercase ${
                        sess.transcript_status === "ready"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : sess.transcript_status === "processing"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-white/5 text-white/50 border border-white/10"
                      }`}
                    >
                      {sess.transcript_status}
                    </span>
                  </div>
                </div>

                {/* AI Summary Snippet */}
                {sess.summary_text && (
                  <p className="text-xs text-white/70 line-clamp-2 bg-surface-raised/40 p-3 rounded-xl border border-white/5">
                    <strong className="text-kratos-400 font-mono text-[10px] uppercase block mb-1">
                      Claude AI Key Takeaway:
                    </strong>
                    {sess.summary_text}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dispatch Recall Bot Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-white/10 space-y-5 bg-surface-elevated">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-kratos-400" />
                <h3 className="text-base font-semibold text-white">Dispatch Recall.ai Bot</h3>
              </div>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDispatchBot} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Select Client Account *
                </label>
                <select
                  required
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-kratos-500"
                >
                  <option value="">Select a client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Meeting URL (Google Meet / Zoom / Teams) *
                </label>
                <input
                  required
                  type="url"
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  value={meetingUrl}
                  onChange={(e) => {
                    const url = e.target.value;
                    setMeetingUrl(url);
                    if (url.includes("meet.google.com")) setProvider("google_meet");
                    else if (url.includes("zoom.us")) setProvider("zoom");
                    else if (url.includes("teams.microsoft.com")) setProvider("teams");
                  }}
                  className="w-full bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-kratos-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-kratos-500"
                  >
                    <option value="google_meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="teams">Microsoft Teams</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Session Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Discovery Call #1"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-kratos-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-kratos-500/10 border border-kratos-500/20 text-xs text-kratos-300">
                The bot will join automatically with the display name <strong>&quot;Kratos AI Assistant&quot;</strong> and initiate recording once admitted.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatching || !meetingUrl.trim() || !selectedClient}
                  className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Bot className="w-3.5 h-3.5" />
                  {dispatching ? "Dispatching..." : "Dispatch Bot Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Detail Slide-over / Modal */}
      {selectedSessionForDetails && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card w-full max-w-2xl p-6 rounded-2xl border border-white/10 space-y-4 bg-surface-elevated max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {selectedSessionForDetails.session_name}
                </h3>
                <p className="text-xs text-white/50">{selectedSessionForDetails.client_name}</p>
              </div>
              <button
                onClick={() => setSelectedSessionForDetails(null)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="mono-label-teal">// SUMMARY</span>
                <p className="text-white/90 mt-1 leading-relaxed whitespace-pre-wrap bg-surface p-3.5 rounded-xl border border-white/5">
                  {selectedSessionForDetails.summary_text || "No AI summary available yet."}
                </p>
              </div>

              {selectedSessionForDetails.key_takeaways && (
                <div>
                  <span className="mono-label">// KEY TAKEAWAYS</span>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-white/80">
                    {selectedSessionForDetails.key_takeaways.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedSessionForDetails.action_items && (
                <div>
                  <span className="mono-label">// ACTION ITEMS</span>
                  <ul className="list-disc list-inside space-y-1 mt-1 text-white/80">
                    {selectedSessionForDetails.action_items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
