"use client";

import { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

const INDUSTRIES = [
  "agritech","fintech","health","real_estate","logistics",
  "retail","hospitality","manufacturing","legal","education","other"
];

export default function NewClientModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    company_name: "", industry: "other", contact_name: "",
    contact_email: "", contact_phone: "", contact_role: "",
    pipeline_value_kes: "", source: "chris", location: "", website: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/api/clients/`, form);
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg glass-card rounded-2xl p-6 m-4 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="mono-label-teal mb-1">// NEW ENTRY</p>
            <h2 className="font-display text-white text-xl font-semibold">Add to Hit List</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mono-label block mb-1.5">Company Name *</label>
              <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-kratos-500/50" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} placeholder="e.g. Waiyaki Family Holdings" />
            </div>
            <div>
              <label className="mono-label block mb-1.5">Industry</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-kratos-500/50" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})}>
                {INDUSTRIES.map(i => <option key={i} value={i} className="bg-surface">{i.replace("_"," ")}</option>)}
              </select>
            </div>
            <div>
              <label className="mono-label block mb-1.5">Pipeline Value (KES)</label>
              <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-kratos-500/50" value={form.pipeline_value_kes} onChange={e => setForm({...form, pipeline_value_kes: e.target.value})} placeholder="250000" />
            </div>
            <div>
              <label className="mono-label block mb-1.5">Contact Name *</label>
              <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-kratos-500/50" value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} placeholder="Mr. Brown" />
            </div>
            <div>
              <label className="mono-label block mb-1.5">Contact Role</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-kratos-500/50" value={form.contact_role} onChange={e => setForm({...form, contact_role: e.target.value})} placeholder="CEO, Founder..." />
            </div>
            <div className="col-span-2">
              <label className="mono-label block mb-1.5">Contact Email *</label>
              <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-kratos-500/50" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} placeholder="client@company.com" />
            </div>
            <div>
              <label className="mono-label block mb-1.5">Source</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-kratos-500/50" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                <option value="chris" className="bg-surface">Chris (Wylde)</option>
                <option value="tyrese" className="bg-surface">Tyrese</option>
                <option value="referral" className="bg-surface">Referral</option>
                <option value="inbound" className="bg-surface">Inbound</option>
              </select>
            </div>
            <div>
              <label className="mono-label block mb-1.5">Location</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-kratos-500/50" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Nairobi, Kenya" />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary py-2.5 rounded-xl disabled:opacity-50">
              {loading ? "Adding..." : "Add to Hit List"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
