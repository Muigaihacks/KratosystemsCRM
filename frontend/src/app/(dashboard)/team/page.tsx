"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  UserPlus,
  KeyRound,
  UserX,
  UserCheck,
  Lock,
  Unlock,
  AlertTriangle,
  Mail,
  CheckCircle2,
  X,
  Search,
  Filter,
  Layers,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";

interface Permissions {
  dashboard: boolean;
  hit_list: boolean;
  pipeline: boolean;
  clients: boolean;
  sessions: boolean;
  proposals: boolean;
  invoices: boolean;
  analytics: boolean;
  team_management: boolean;
  export_data: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "bd" | "developer";
  role_display: string;
  status: "active" | "invited" | "deactivated" | "locked";
  status_display: string;
  password_change_count: number;
  is_active: boolean;
  is_locked: boolean;
  phone: string;
  notes: string;
  permissions: Permissions;
  last_active_at: string | null;
  created_at: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // New Member Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "bd" | "developer">("developer");
  const [newPhone, setNewPhone] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch Team Members
  const fetchTeam = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/team/");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.results || data);
      }
    } catch (err) {
      console.error("Failed to fetch team members", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  // Handle Password Reset Trigger (Increments count, locks at 3)
  const handleResetPassword = async (member: TeamMember) => {
    const confirmPrompt = window.confirm(
      `Trigger password reset for ${member.name}?\n\nCurrent change count: ${member.password_change_count}/3.\nNote: Exceeding 3 changes automatically locks the account for security.`
    );
    if (!confirmPrompt) return;

    try {
      const res = await fetch(`http://localhost:8000/api/team/${member.id}/reset-password/`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        setTimeout(() => setActionNotice(null), 6000);
        fetchTeam();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Account Unlock
  const handleUnlock = async (member: TeamMember) => {
    try {
      const res = await fetch(`http://localhost:8000/api/team/${member.id}/unlock/`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        setTimeout(() => setActionNotice(null), 5000);
        fetchTeam();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Toggle Active/Deactivate
  const handleToggleStatus = async (member: TeamMember) => {
    const action = member.is_active ? "deactivate" : "activate";
    if (!window.confirm(`Are you sure you want to ${action} ${member.name}'s account?`)) return;

    try {
      const res = await fetch(`http://localhost:8000/api/team/${member.id}/toggle-status/`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        setTimeout(() => setActionNotice(null), 5000);
        fetchTeam();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Invite / Create User
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:8000/api/team/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          role: newRole,
          phone: newPhone,
          notes: newNotes,
        }),
      });

      if (res.ok) {
        setIsInviteModalOpen(false);
        setNewName("");
        setNewEmail("");
        setNewPhone("");
        setNewNotes("");
        setActionNotice(`Invitation email sent to ${newEmail} with role '${newRole}'.`);
        setTimeout(() => setActionNotice(null), 6000);
        fetchTeam();
      }
    } catch (err) {
      console.error("Error creating member", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner Notice if triggered */}
      {actionNotice && (
        <div className="p-4 rounded-xl bg-kratos-500/10 border border-kratos-500/30 flex items-center gap-3 text-sm text-kratos-200 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-kratos-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-kratos-500/15 border border-kratos-500/30 flex items-center justify-center text-kratos-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Team & Access Control</h1>
          </div>
          <p className="text-sm text-white/50 mt-1">
            Manage user roles, granular permissions, account security policies, and team provisioning
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kratos-500 hover:bg-kratos-600 text-white font-medium text-sm transition-all shadow-lg shadow-kratos-500/20 w-fit"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="text-xs font-mono uppercase tracking-wider text-white/40">Total Accounts</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{members.length}</div>
          <div className="text-xs text-white/50 mt-1">Authorized Kratos personnel</div>
        </div>

        <div className="glass-card p-5">
          <div className="text-xs font-mono uppercase tracking-wider text-white/40">Super Admins</div>
          <div className="text-2xl font-bold text-kratos-400 mt-1 font-mono">
            {members.filter((m) => m.role === "admin").length}
          </div>
          <div className="text-xs text-white/50 mt-1">Tyrese Muigai & Chris Odongo</div>
        </div>

        <div className="glass-card p-5">
          <div className="text-xs font-mono uppercase tracking-wider text-white/40">Developers Assigned</div>
          <div className="text-2xl font-bold text-violet-400 mt-1 font-mono">
            {members.filter((m) => m.role === "developer").length}
          </div>
          <div className="text-xs text-white/50 mt-1">Technical build leads</div>
        </div>

        <div className="glass-card p-5 border-amber-500/20 bg-amber-500/5">
          <div className="text-xs font-mono uppercase tracking-wider text-amber-300/70 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            Security Policy
          </div>
          <div className="text-sm font-semibold text-white mt-1.5">Max 3 Password Changes</div>
          <div className="text-xs text-white/50 mt-1">Automatic suspension on limit</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search team member..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-elevated/60 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-kratos-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end">
          <Filter className="w-3.5 h-3.5 text-white/40" />
          <div className="flex bg-surface-elevated/60 border border-white/10 rounded-xl p-1 text-xs">
            {["all", "admin", "bd", "developer"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={clsx(
                  "px-3 py-1 rounded-lg capitalize transition-all",
                  roleFilter === r
                    ? "bg-kratos-500 text-white font-medium"
                    : "text-white/60 hover:text-white"
                )}
              >
                {r === "all" ? "All Roles" : r === "bd" ? "Business Dev" : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
            Active Roster ({filteredMembers.length})
          </h2>
          <span className="text-xs text-white/40">Self-Registration: Restricted (Invite Only)</span>
        </div>

        <div className="divide-y divide-white/5">
          {filteredMembers.map((member) => {
            const isNearLimit = member.password_change_count === 2;
            const isLocked = member.password_change_count >= 3 || member.status === "locked";

            return (
              <div
                key={member.id}
                className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                {/* User Info */}
                <div className="flex items-center gap-3.5 min-w-[280px]">
                  <div
                    className={clsx(
                      "w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm border",
                      member.role === "admin"
                        ? "bg-gold-500/10 border-gold-500/30 text-gold-400"
                        : member.role === "bd"
                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                        : "bg-violet-500/10 border-violet-500/30 text-violet-400"
                    )}
                  >
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{member.name}</span>
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-medium border",
                          member.role === "admin"
                            ? "bg-gold-500/15 text-gold-300 border-gold-500/30"
                            : member.role === "bd"
                            ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                            : "bg-violet-500/15 text-violet-300 border-violet-500/30"
                        )}
                      >
                        {member.role_display}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/50 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-white/40" />
                        {member.email}
                      </span>
                      {member.phone && <span>• {member.phone}</span>}
                    </div>
                  </div>
                </div>

                {/* Status & Password Security Tracker */}
                <div className="flex items-center gap-6">
                  {/* Account Status Badge */}
                  <div>
                    <div className="text-[10px] uppercase font-mono text-white/40 mb-1">Status</div>
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                        isLocked
                          ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                          : !member.is_active
                          ? "bg-gray-500/15 text-gray-400 border-gray-500/30"
                          : member.status === "invited"
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      )}
                    >
                      <span
                        className={clsx(
                          "w-1.5 h-1.5 rounded-full",
                          isLocked
                            ? "bg-rose-400 animate-ping"
                            : !member.is_active
                            ? "bg-gray-400"
                            : member.status === "invited"
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        )}
                      />
                      {isLocked ? "Suspended (Locked)" : member.status_display}
                    </span>
                  </div>

                  {/* Password Reset Counter (0/3) */}
                  <div className="min-w-[130px]">
                    <div className="flex items-center justify-between text-[10px] uppercase font-mono text-white/40 mb-1">
                      <span>Password Resets</span>
                      <span
                        className={clsx(
                          "font-bold",
                          isLocked
                            ? "text-rose-400"
                            : isNearLimit
                            ? "text-amber-400"
                            : "text-white/60"
                        )}
                      >
                        {member.password_change_count}/3
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all",
                          isLocked
                            ? "bg-rose-500 w-full"
                            : member.password_change_count === 2
                            ? "bg-amber-400 w-2/3"
                            : member.password_change_count === 1
                            ? "bg-cyan-400 w-1/3"
                            : "bg-transparent w-0"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end lg:self-center">
                  {isLocked ? (
                    <button
                      onClick={() => handleUnlock(member)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-medium transition-all"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlock Account</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleResetPassword(member)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-medium transition-all"
                      title="Trigger password reset (max 3 times)"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-kratos-400" />
                      <span>Reset Password</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleStatus(member)}
                    className={clsx(
                      "p-1.5 rounded-lg border transition-all text-xs flex items-center gap-1 px-2.5",
                      member.is_active
                        ? "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-300"
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-300"
                    )}
                  >
                    {member.is_active ? (
                      <>
                        <UserX className="w-3.5 h-3.5" />
                        <span>Deactivate</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role Permission Matrix Section */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <Layers className="w-5 h-5 text-kratos-400" />
          <h2 className="text-base font-semibold text-white">Role Permission Architecture</h2>
        </div>
        <p className="text-xs text-white/50 mb-6">
          Access control boundaries enforced across Kratos Systems CRM without requiring an external admin panel
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 text-white/40 font-mono uppercase">
                <th className="py-2.5 px-3">CRM Module</th>
                <th className="py-2.5 px-3 text-gold-400">Super Admin (Tyrese & Chris)</th>
                <th className="py-2.5 px-3 text-cyan-400">Business Dev (BD)</th>
                <th className="py-2.5 px-3 text-violet-400">Technical Developer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/70">
              <tr>
                <td className="py-2.5 px-3 font-medium text-white">Executive Dashboard</td>
                <td className="py-2.5 px-3 text-emerald-400 font-mono">Full Access (KES Metrics)</td>
                <td className="py-2.5 px-3 text-emerald-400 font-mono">Full Access</td>
                <td className="py-2.5 px-3 text-white/40 font-mono">Tasks / Assigned Leads</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-white">Hit List (Intake)</td>
                <td className="py-2.5 px-3 text-emerald-400 font-mono">Full Read / Write / Advance</td>
                <td className="py-2.5 px-3 text-emerald-400 font-mono">Full Read / Write / Advance</td>
                <td className="py-2.5 px-3 text-rose-400 font-mono">Hidden</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-white">Pipeline Kanban (Drag-Drop)</td>
                <td className="py-2.5 px-3 text-emerald-400 font-mono">All 8 Stages + Pricing</td>
                <td className="py-2.5 px-3 text-emerald-400 font-mono">All 8 Stages</td>
                <td className="py-2.5 px-3 text-amber-400 font-mono">Active Build & Delivery</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-white">Client Context & Transcripts</td>
                <td className="py-2.5 px-3 text-emerald-400 font-mono">Full Access + Notes</td>
                <td className="py-2.5 px-3 text-emerald-400 font-mono">Full Access + Notes</td>
                <td className="py-2.5 px-3 text-emerald-400 font-mono">Assigned Client Briefs</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-white">Recall.ai Bot Dispatch</td>
                <td className="py-2.5 px-3 text-emerald-400 font-mono">Dispatch Any Meeting</td>
                <td className="py-2.5 px-3 text-emerald-400 font-mono">Dispatch Client Calls</td>
                <td className="py-2.5 px-3 text-emerald-400 font-mono">Dispatch Tech Reviews</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-white">Proposals (Claude Drafter)</td>
                <td className="py-2.5 px-3 text-emerald-400 font-mono">Generate, Approve, Send</td>
                <td className="py-2.5 px-3 text-emerald-400 font-mono">Draft & Propose</td>
                <td className="py-2.5 px-3 text-rose-400 font-mono">Hidden</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-white">Invoices & KRA eTIMS</td>
                <td className="py-2.5 px-3 text-emerald-400 font-mono">Create, VAT 16%, eTIMS Push</td>
                <td className="py-2.5 px-3 text-rose-400 font-mono">Hidden</td>
                <td className="py-2.5 px-3 text-rose-400 font-mono">Hidden</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-white">Team & Access Control</td>
                <td className="py-2.5 px-3 text-emerald-400 font-mono">Invite, Reset, Deactivate</td>
                <td className="py-2.5 px-3 text-rose-400 font-mono">Hidden</td>
                <td className="py-2.5 px-3 text-rose-400 font-mono">Hidden</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md border border-white/10 p-6 relative">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-kratos-500/20 text-kratos-400 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Invite Team Member</h3>
                <p className="text-xs text-white/50">Send an onboarding invite to join Kratos CRM</p>
              </div>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dennis Mwangi"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-kratos-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="dennis@kratos.africa"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-kratos-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                  Assigned Role & Permissions *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-kratos-500"
                >
                  <option value="developer">Technical Developer (Assigned Tasks & Context)</option>
                  <option value="bd">Business Development (Pipeline, Clients, Proposals)</option>
                  <option value="admin">Super Admin (Full Financial & User Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+254 700 000 000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-kratos-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-kratos-500 hover:bg-kratos-600 text-white text-xs font-medium transition-all shadow-lg shadow-kratos-500/20 disabled:opacity-50"
                >
                  {submitting ? "Inviting..." : "Send Invitation Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
