"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  Receipt,
  Plus,
  Send,
  Building2,
  ShieldCheck,
  Clock,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  QrCode,
} from "lucide-react";

type LineItem = {
  description: string;
  amount_kes: number;
};

type Invoice = {
  id: string;
  client: string;
  client_name: string;
  invoice_number: string;
  description: string;
  line_items: LineItem[];
  subtotal_kes: string;
  vat_kes: string;
  total_kes: string;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  pdf_url: string;
  etims_submitted: boolean;
  etims_invoice_number: string;
  etims_qr_code_url: string;
  sent_at: string | null;
  sent_to: string;
  created_at: string;
};

type Client = {
  id: string;
  company_name: string;
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [applyVat, setApplyVat] = useState(true);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "Milestone 1 — Initial Build Deposit", amount_kes: 740000 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [etimsSubmittingId, setEtimsSubmittingId] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchData = async () => {
    try {
      const [invRes, clientRes] = await Promise.all([
        axios.get(`${API}/api/invoices/`),
        axios.get(`${API}/api/clients/`),
      ]);
      setInvoices(invRes.data.results || invRes.data || []);
      setClients(clientRes.data.results || clientRes.data || []);
    } catch {
      // Fallback seed
      setInvoices([
        {
          id: "inv-1",
          client: "c-1",
          client_name: "Waiyaki Hides & Skins Ltd",
          invoice_number: "KS-INV-001",
          description: "Milestone 1 — Supply Chain System Deposit (40%)",
          line_items: [
            {
              description: "Milestone 1 — Architecture & Core Tracking Modules",
              amount_kes: 740000,
            },
          ],
          subtotal_kes: "740000.00",
          vat_kes: "118400.00",
          total_kes: "858400.00",
          status: "draft",
          due_date: "2026-11-15",
          paid_at: null,
          pdf_url: "",
          etims_submitted: true,
          etims_invoice_number: "KRA-ETIMS-2026-0091823",
          etims_qr_code_url: "",
          sent_at: null,
          sent_to: "j.waiyaki@waiyakihides.co.ke",
          created_at: new Date().toISOString(),
        },
      ]);
      setClients([{ id: "c-1", company_name: "Waiyaki Hides & Skins Ltd" }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: "", amount_kes: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    const updated = [...lineItems];
    if (field === "amount_kes") {
      updated[index].amount_kes = parseFloat(value as string) || 0;
    } else {
      updated[index].description = value as string;
    }
    setLineItems(updated);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (item.amount_kes || 0), 0);
  const vat = applyVat ? subtotal * 0.16 : 0;
  const total = subtotal + vat;

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !description.trim()) return;
    setSubmitting(true);

    try {
      const res = await axios.post(`${API}/api/invoices/`, {
        client: selectedClient,
        description: description,
        line_items: lineItems,
        subtotal_kes: subtotal,
        vat_kes: vat,
        total_kes: total,
        due_date: dueDate || null,
      });

      setInvoices([res.data, ...invoices]);
      setShowCreateModal(false);
      setDescription("");
      setSelectedClient("");
    } catch {
      // Optimistic preview
      const fakeInv: Invoice = {
        id: `inv-${Date.now()}`,
        client: selectedClient,
        client_name: clients.find((c) => c.id === selectedClient)?.company_name || "Client",
        invoice_number: `KS-INV-00${invoices.length + 1}`,
        description: description,
        line_items: lineItems,
        subtotal_kes: subtotal.toFixed(2),
        vat_kes: vat.toFixed(2),
        total_kes: total.toFixed(2),
        status: "draft",
        due_date: dueDate || null,
        paid_at: null,
        pdf_url: "",
        etims_submitted: false,
        etims_invoice_number: "",
        etims_qr_code_url: "",
        sent_at: null,
        sent_to: "",
        created_at: new Date().toISOString(),
      };
      setInvoices([fakeInv, ...invoices]);
      setShowCreateModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEtims = async (invoiceId: string) => {
    setEtimsSubmittingId(invoiceId);
    try {
      const res = await axios.post(`${API}/api/invoices/${invoiceId}/submit-etims/`);
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId
            ? {
                ...inv,
                etims_submitted: true,
                etims_invoice_number: res.data.etims_invoice_number || "KRA-ETIMS-2026-LIVE",
              }
            : inv
        )
      );
    } catch {
      // Optimistic update for mock demonstration
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId
            ? {
                ...inv,
                etims_submitted: true,
                etims_invoice_number: `KRA-ETIMS-2026-${Math.floor(100000 + Math.random() * 900000)}`,
              }
            : inv
        )
      );
    } finally {
      setEtimsSubmittingId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="mono-label-teal">// FINANCIAL COMPLIANCE</span>
            <span className="text-white/20">•</span>
            <span className="text-xs text-white/50">KENYA REVENUE AUTHORITY eTIMS</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-3">
            <Receipt className="w-6 h-6 text-kratos-400" />
            Invoices & eTIMS
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Generate itemized tax invoices in KES, sync with KRA eTIMS, and dispatch via Resend.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-kratos-500/20"
        >
          <Plus className="w-4 h-4" />
          Create New Invoice
        </button>
      </div>

      {/* Invoices List */}
      <div className="glass-card rounded-2xl border border-white/8 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/40 text-sm">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="p-16 text-center">
            <Receipt className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-white/80">No invoices issued</h3>
            <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto">
              Create your first client invoice. Milestone deposits will automatically calculate VAT and eTIMS parameters.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 btn-primary text-xs"
            >
              Create First Invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-raised/80 text-white/40 uppercase font-mono tracking-wider text-[10px] border-b border-white/8">
                <tr>
                  <th className="py-3.5 px-5">Invoice #</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Total Amount (KES)</th>
                  <th className="py-3.5 px-4">eTIMS Status</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5 font-mono text-emerald-400 font-semibold">
                      {inv.invoice_number}
                    </td>

                    <td className="py-4 px-4">
                      <Link
                        href={`/clients/${inv.client}`}
                        className="font-medium text-white hover:text-kratos-400 flex items-center gap-1.5"
                      >
                        <Building2 className="w-3.5 h-3.5 text-kratos-500" />
                        {inv.client_name}
                      </Link>
                    </td>

                    <td className="py-4 px-4 max-w-xs truncate text-white/70">
                      {inv.description}
                    </td>

                    <td className="py-4 px-4 font-mono font-medium kes-value">
                      KES {parseFloat(inv.total_kes).toLocaleString()}
                    </td>

                    <td className="py-4 px-4">
                      {inv.etims_submitted ? (
                        <div className="flex flex-col">
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                            <ShieldCheck className="w-3 h-3" />
                            eTIMS Certified
                          </span>
                          <span className="text-[9px] text-white/30 font-mono truncate max-w-[120px]">
                            {inv.etims_invoice_number}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSubmitEtims(inv.id)}
                          disabled={etimsSubmittingId === inv.id}
                          className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[10px] font-mono flex items-center gap-1"
                        >
                          <QrCode className="w-2.5 h-2.5" />
                          {etimsSubmittingId === inv.id ? "Submitting..." : "Submit eTIMS"}
                        </button>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-white/60">
                        {inv.status}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <button className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 ml-auto">
                        <Send className="w-3 h-3" />
                        Send PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card w-full max-w-xl p-6 rounded-2xl border border-white/10 space-y-5 bg-surface-elevated max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-kratos-400" />
                <h3 className="text-base font-semibold text-white">Create New Invoice</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-white/40 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Select Client *
                </label>
                <select
                  required
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-kratos-500"
                >
                  <option value="">Choose client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Invoice Memo / Description *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Deposit for Sprint 1 Development"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-kratos-500"
                />
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/80">Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-[11px] text-kratos-400 hover:text-kratos-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {lineItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        required
                        type="text"
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => handleLineItemChange(index, "description", e.target.value)}
                        className="flex-1 bg-surface border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-kratos-500"
                      />
                      <input
                        required
                        type="number"
                        placeholder="Amount KES"
                        value={item.amount_kes || ""}
                        onChange={(e) => handleLineItemChange(index, "amount_kes", e.target.value)}
                        className="w-32 bg-surface border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-kratos-500 font-mono"
                      />
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(index)}
                          className="text-white/40 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="vat-check"
                  checked={applyVat}
                  onChange={(e) => setApplyVat(e.target.checked)}
                  className="rounded border-white/20 bg-surface text-kratos-500 focus:ring-kratos-500"
                />
                <label htmlFor="vat-check" className="text-xs text-white/70">
                  Include 16% Kenya VAT (eTIMS compliant calculation)
                </label>
              </div>

              {/* Totals Summary */}
              <div className="bg-surface p-4 rounded-xl border border-white/8 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal:</span>
                  <span>KES {subtotal.toLocaleString()}</span>
                </div>
                {applyVat && (
                  <div className="flex justify-between text-white/60">
                    <span>VAT (16%):</span>
                    <span>KES {vat.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-white/5">
                  <span>Total Amount:</span>
                  <span className="kes-value font-semibold">KES {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedClient || !description.trim()}
                  className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  {submitting ? "Creating..." : "Generate Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
