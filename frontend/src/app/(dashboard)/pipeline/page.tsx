"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, TrendingUp } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import KanbanColumn from "@/components/kanban/KanbanColumn";
import ClientCard from "@/components/kanban/ClientCard";
import NewClientModal from "@/components/modals/NewClientModal";

const STAGES = [
  { id: "hit_list",      label: "Hit List",     color: "#6B7280" },
  { id: "engaged",       label: "Engaged",      color: "#3B82F6" },
  { id: "discovery",     label: "Discovery",    color: "#8B5CF6" },
  { id: "proposal_sent", label: "Proposal Sent",color: "#F59E0B" },
  { id: "negotiation",   label: "Negotiation",  color: "#EF4444" },
  { id: "contracting",   label: "Contracting",  color: "#10B981" },
  { id: "active_build",  label: "Active Build", color: "#1F8E86" },
  { id: "maintenance",   label: "Maintenance",  color: "#6366F1" },
];

export type Client = {
  id: string;
  company_name: string;
  industry: string;
  contact_name: string;
  stage: string;
  pipeline_value_kes: string | null;
  days_in_stage: number;
  source: string;
  assigned_developer_name: string | null;
};

export type KanbanData = Record<string, Client[]>;

export default function PipelinePage() {
  const [kanbanData, setKanbanData] = useState<KanbanData>({});
  const [loading, setLoading] = useState(true);
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [totalPipeline, setTotalPipeline] = useState(0);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchKanban = async () => {
    try {
      const [kanban, stats] = await Promise.all([
        axios.get(`${API}/api/clients/kanban/`),
        axios.get(`${API}/api/pipeline/stats/`),
      ]);
      setKanbanData(kanban.data);
      setTotalPipeline(stats.data.total_pipeline_kes);
    } catch {
      // Dev fallback — seed with sample data
      const seed: KanbanData = {};
      STAGES.forEach((s) => (seed[s.id] = []));
      seed["hit_list"] = [
        { id: "1", company_name: "Wylde International", industry: "consulting", contact_name: "Chris Odongo", stage: "hit_list", pipeline_value_kes: "500000", days_in_stage: 2, source: "chris", assigned_developer_name: null },
      ];
      seed["discovery"] = [
        { id: "2", company_name: "Waiyaki Family", industry: "agritech", contact_name: "Mr. Brown", stage: "discovery", pipeline_value_kes: "250000", days_in_stage: 7, source: "tyrese", assigned_developer_name: "Tyrese Muigai" },
      ];
      setKanbanData(seed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKanban(); }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const clientId = active.id as string;
    for (const stage of Object.values(kanbanData)) {
      const found = stage.find((c) => c.id === clientId);
      if (found) { setActiveClient(found); break; }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveClient(null);
    if (!over || active.id === over.id) return;

    const clientId = active.id as string;
    const newStage = over.id as string;
    if (!STAGES.find((s) => s.id === newStage)) return;

    // Optimistic update
    const updated = { ...kanbanData };
    let movedClient: Client | null = null;
    for (const [stage, clients] of Object.entries(updated)) {
      const idx = clients.findIndex((c) => c.id === clientId);
      if (idx !== -1) {
        [movedClient] = clients.splice(idx, 1);
        break;
      }
    }
    if (movedClient) {
      movedClient.stage = newStage;
      updated[newStage] = [...(updated[newStage] || []), movedClient];
      setKanbanData({ ...updated });
    }

    try {
      await axios.post(`${API}/api/clients/${clientId}/move-stage/`, { stage: newStage });
    } catch {
      fetchKanban(); // revert on error
    }
  };

  const formatKES = (amount: number) =>
    `KES ${(amount / 1_000_000).toFixed(2)}M`;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-7 py-5 border-b border-white/8 bg-surface flex-shrink-0">
        <div>
          <p className="mono-label-teal mb-1">// PIPELINE</p>
          <h1 className="font-display text-white text-2xl font-semibold tracking-tight">
            Pipeline Overview
          </h1>
        </div>
        <div className="flex items-center gap-5">
          {totalPipeline > 0 && (
            <div className="text-right">
              <p className="mono-label mb-0.5">Total Pipeline Value</p>
              <p className="kes-value text-lg font-semibold flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-gold-400" />
                {formatKES(totalPipeline)}
              </p>
            </div>
          )}
          <button
            onClick={() => setShowNewModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Client
          </button>
        </div>
      </div>

      {/* Kanban board */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white/40 font-mono text-sm animate-pulse">Loading pipeline...</div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-4 p-6 h-full" style={{ minWidth: "max-content" }}>
              {STAGES.map((stage) => (
                <KanbanColumn
                  key={stage.id}
                  stage={stage}
                  clients={kanbanData[stage.id] || []}
                  onRefresh={fetchKanban}
                />
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeClient ? <ClientCard client={activeClient} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {showNewModal && (
        <NewClientModal
          onClose={() => setShowNewModal(false)}
          onCreated={() => { setShowNewModal(false); fetchKanban(); }}
        />
      )}
    </div>
  );
}
