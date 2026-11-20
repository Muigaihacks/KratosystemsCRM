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
  Sliders,
  Plus,
  Check,
  Building2,
} from "lucide-react";
import { clsx } from "clsx";

export type AccessTier = "none" | "read" | "write";

export interface GranularPermissions {
  dashboard: AccessTier;
  pipeline: AccessTier;
  hit_list: AccessTier;
  clients: AccessTier;
  sessions: AccessTier;
  proposals: AccessTier;
  invoices: AccessTier;
  analytics: AccessTier;
  team_management: AccessTier;
  export_data: AccessTier;
}

export interface RoleDef {
  id: string;
  name: string;
  description: string;
  badge_color: string;
  permissions: GranularPermissions;
  is_custom?: boolean;
}

export const MODULE_DEFINITIONS: { key: keyof GranularPermissions; label: string; desc: string }[] = [
  { key: "dashboard", label: "Executive Dashboard", desc: "Company revenue, active pipeline sum, and high-level KPI cards" },
  { key: "pipeline", label: "Deals Pipeline (Kanban)", desc: "8-stage drag & drop commercial pipeline, deal sizing, and lead movement" },
  { key: "hit_list", label: "Prospects Hit List", desc: "Pre-pipeline company targeting, qualification criteria, and intake review" },
  { key: "clients", label: "Client Directory & Context", desc: "Corporate client master records, contact persons, and technical profiles" },
  { key: "sessions", label: "Meeting Intelligence", desc: "Recall.ai bot dispatch, audio recordings, and AssemblyAI transcripts" },
  { key: "proposals", label: "14-Page Agreements & SOW", desc: "Clause drafting, ODPC compliance terms, and digital contract signing" },
  { key: "invoices", label: "NCBA Bank Invoices & eTIMS", desc: "Itemized tax invoices, KRA eTIMS QR generation, and Resend PDF dispatch" },
  { key: "analytics", label: "Financial Analytics & Velocity", desc: "Conversion rates, partnership lead attribution, and cash collections" },
  { key: "team_management", label: "Team & User Security", desc: "Staff provisioning, password reset limit tracking (3 max), and lockouts" },
  { key: "export_data", label: "Data & Financial CSV Export", desc: "Audit CSV generation for accounting, taxation, and milestone reconciliation" },
];

export const INITIAL_ROLES: RoleDef[] = [
  {
    id: "admin",
    name: "Super Admin",
    description: "Full commercial, financial, and user provisioning authority",
    badge_color: "emerald",
    permissions: {
      dashboard: "write",
      pipeline: "write",
      hit_list: "write",
      clients: "write",
      sessions: "write",
      proposals: "write",
      invoices: "write",
      analytics: "write",
      team_management: "write",
      export_data: "write",
    },
  },
  {
    id: "bd",
    name: "Business Development",
    description: "Pipeline acceleration, client intake, proposals, and deal closing",
    badge_color: "sky",
    permissions: {
      dashboard: "read",
      pipeline: "write",
      hit_list: "write",
      clients: "write",
      sessions: "write",
      proposals: "write",
      invoices: "read",
      analytics: "read",
      team_management: "none",
      export_data: "none",
    },
  },
  {
    id: "finance",
    name: "Finance Controller",
    description: "NCBA invoice reconciliation, financial audits, and eTIMS tax compliance",
    badge_color: "amber",
    permissions: {
      dashboard: "read",
      pipeline: "read",
      hit_list: "none",
      clients: "read",
      sessions: "none",
      proposals: "read",
      invoices: "write",
      analytics: "write",
      team_management: "none",
      export_data: "write",
    },
  },
  {
    id: "developer",
    name: "Technical Developer",
    description: "Assigned build delivery, technical review, and meeting transcripts",
    badge_color: "violet",
    permissions: {
      dashboard: "read",
      pipeline: "read",
      hit_list: "none",
      clients: "read",
      sessions: "write",
      proposals: "none",
      invoices: "none",
      analytics: "none",
      team_management: "none",
      export_data: "none",
    },
  },
];

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  role_display: string;
  status: "active" | "invited" | "deactivated" | "locked";
  status_display: string;
  password_change_count: number;
  is_active: boolean;
  is_locked: boolean;
  phone: string;
  notes: string;
  permissions?: any;
  last_active_at: string | null;
  created_at: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Dynamic Roles State
  const [roles, setRoles] = useState<RoleDef[]>(INITIAL_ROLES);
  const [customRoleName, setCustomRoleName] = useState("");
  const [customRoleDesc, setCustomRoleDesc] = useState("");
  const [customRoleColor, setCustomRoleColor] = useState("emerald");
  const [customRolePerms, setCustomRolePerms] = useState<GranularPermissions>({
    dashboard: "read",
    pipeline: "read",
    hit_list: "none",
    clients: "read",
    sessions: "none",
    proposals: "none",
    invoices: "read",
    analytics: "none",
    team_management: "none",
    export_data: "none",
  });

  // Load Custom Roles from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kratos_custom_roles");
      if (saved) {
        const parsed: RoleDef[] = JSON.parse(saved);
        setRoles([...INITIAL_ROLES, ...parsed]);
      }
    } catch (e) {
      console.error("Failed to load custom roles", e);
    }
  }, []);

  const handleSaveCustomRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoleName.trim()) return;

    const roleId = customRoleName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const newRoleObj: RoleDef = {
      id: roleId,
      name: customRoleName.trim(),
      description: customRoleDesc.trim() || "Custom organizational role",
      badge_color: customRoleColor,
      permissions: { ...customRolePerms },
      is_custom: true,
    };

    const updated = [...roles.filter((r) => r.id !== roleId), newRoleObj];
    setRoles(updated);
    try {
      const customs = updated.filter((r) => r.is_custom);
      localStorage.setItem("kratos_custom_roles", JSON.stringify(customs));
    } catch (err) {
      console.error("Error saving role", err);
    }

    setActionNotice(`Custom role '${newRoleObj.name}' saved with granular permissions.`);
    setTimeout(() => setActionNotice(null), 5000);
    setIsRoleModalOpen(false);
    setCustomRoleName("");
    setCustomRoleDesc("");
  };

  const handlePermChange = (moduleKey: keyof GranularPermissions, level: AccessTier) => {
    setCustomRolePerms((prev) => ({ ...prev, [moduleKey]: level }));
  };

  // New Member Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<string>("developer");
  const [newPhone, setNewPhone] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "https://api.qrf.kratosystems.africa";

  // Fetch Team Members
  const fetchTeam = async () => {
    try {
      const res = await fetch(`${API}/api/team/`);
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
      const res = await fetch(`${API}/api/team/${member.id}/reset-password/`, {
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
      const res = await fetch(`${API}/api/team/${member.id}/unlock/`, {
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
      const res = await fetch(`${API}/api/team/${member.id}/toggle-status/`, {
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
      const res = await fetch(`${API}/api/team/`, {
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium text-sm transition-all shadow-sm w-fit"
          >
            <Sliders className="w-4 h-4 text-kratos-400" />
            <span>Manage Roles & Permissions</span>
          </button>
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-kratos-500 hover:bg-kratos-600 text-white font-medium text-sm transition-all shadow-lg shadow-kratos-500/20 w-fit"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        </div>
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
          <div className="text-xs text-white/50 mt-1">Executive & System Leads</div>
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
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <Layers className="w-5 h-5 text-kratos-400" />
              <h2 className="text-base font-semibold text-white">Granular 3-Tier Role Permission Architecture</h2>
            </div>
            <p className="text-xs text-white/50">
              Multi-tiered commercial access control enforced across all 10 CRM operational modules
            </p>
          </div>

          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-medium transition-all w-fit cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-kratos-400" />
            <span>Create Custom Role</span>
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-mono">
          <span className="text-white/40">Access Tiers:</span>
          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">None (Hidden & Blocked)</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Read (View & Audit Only)</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Write (Full Authoring & Control)</span>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 text-white/40 font-mono uppercase">
                <th className="py-3 px-3">CRM Module</th>
                {roles.map((r) => (
                  <th key={r.id} className="py-3 px-3 font-semibold text-white">
                    <span className="flex items-center gap-1.5">
                      <span>{r.name}</span>
                      {r.is_custom && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-kratos-500/20 text-kratos-300 font-normal">
                          Custom
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/70">
              {MODULE_DEFINITIONS.map((m) => (
                <tr key={m.key} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-3">
                    <div className="font-medium text-white">{m.label}</div>
                    <div className="text-[10px] text-white/40">{m.desc}</div>
                  </td>
                  {roles.map((r) => {
                    const tier = r.permissions?.[m.key] || "none";
                    return (
                      <td key={r.id} className="py-3 px-3 font-mono">
                        {tier === "write" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold text-[10px]">
                            <Check className="w-3 h-3" />
                            Full Access
                          </span>
                        )}
                        {tier === "read" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px]">
                            View Only
                          </span>
                        )}
                        {tier === "none" && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/5 text-white/30 border border-white/10 text-[10px]">
                            None
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
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
                  placeholder="dennis@kratosystems.africa"
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
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-kratos-500"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.description}
                    </option>
                  ))}
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

      {/* Custom Role Creator Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="glass-card w-full max-w-2xl border border-white/10 p-6 my-8 rounded-2xl relative bg-surface-elevated">
            <button
              onClick={() => setIsRoleModalOpen(false)}
              className="absolute top-5 right-5 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-kratos-500/20 text-kratos-400 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Create Custom Role & Granular Permissions</h3>
                <p className="text-xs text-white/50">
                  Configure 3-tier read/write/none permissions across all 10 CRM modules
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCustomRole} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Finance Controller"
                    value={customRoleName}
                    onChange={(e) => setCustomRoleName(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-kratos-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Invoices audit, revenue models, tax compliance"
                    value={customRoleDesc}
                    onChange={(e) => setCustomRoleDesc(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-kratos-500"
                  />
                </div>
              </div>

              {/* Module Granular Permission Toggles */}
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase text-white/60 tracking-wider">
                  Module Access Control (3-Tier)
                </div>

                <div className="divide-y divide-white/5 max-h-[45vh] overflow-y-auto pr-1">
                  {MODULE_DEFINITIONS.map((m) => {
                    const currentTier = customRolePerms[m.key];
                    return (
                      <div
                        key={m.key}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{m.label}</div>
                          <div className="text-[10px] text-white/40">{m.desc}</div>
                        </div>

                        <div className="inline-flex rounded-lg bg-surface p-1 border border-white/10 shrink-0">
                          <button
                            type="button"
                            onClick={() => handlePermChange(m.key, "none")}
                            className={clsx(
                              "px-2.5 py-1 rounded text-[11px] font-mono transition-all",
                              currentTier === "none"
                                ? "bg-rose-500/20 text-rose-300 font-semibold"
                                : "text-white/40 hover:text-white"
                            )}
                          >
                            None
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePermChange(m.key, "read")}
                            className={clsx(
                              "px-2.5 py-1 rounded text-[11px] font-mono transition-all",
                              currentTier === "read"
                                ? "bg-amber-500/20 text-amber-300 font-semibold"
                                : "text-white/40 hover:text-white"
                            )}
                          >
                            View Only
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePermChange(m.key, "write")}
                            className={clsx(
                              "px-2.5 py-1 rounded text-[11px] font-mono transition-all",
                              currentTier === "write"
                                ? "bg-emerald-500/20 text-emerald-300 font-semibold"
                                : "text-white/40 hover:text-white"
                            )}
                          >
                            Full Access
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customRoleName.trim()}
                  className="px-5 py-2.5 rounded-lg bg-kratos-500 hover:bg-kratos-600 text-white text-xs font-medium transition-all shadow-lg shadow-kratos-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Role to Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
