"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import ClientCard from "./ClientCard";
import type { Client } from "@/app/(dashboard)/pipeline/page";

type Stage = { id: string; label: string; color: string };

export default function KanbanColumn({
  stage,
  clients,
  onRefresh,
}: {
  stage: Stage;
  clients: Client[];
  onRefresh: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  const totalKES = clients.reduce((sum, c) => sum + parseFloat(c.pipeline_value_kes || "0"), 0);

  return (
    <div className="kanban-column flex flex-col">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span
            className="stage-dot"
            style={{ backgroundColor: stage.color }}
          />
          <span className="text-[12px] font-semibold text-white/80 uppercase tracking-wide">
            {stage.label}
          </span>
          <span className="text-[11px] font-mono text-white/30 bg-white/5 px-1.5 py-0.5 rounded-full">
            {clients.length}
          </span>
        </div>
        {totalKES > 0 && (
          <span className="text-[10px] font-mono text-gold-500">
            {(totalKES / 1000).toFixed(0)}K
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2.5 min-h-[400px] p-2.5 rounded-2xl border transition-all duration-200 ${
          isOver
            ? "border-kratos-500/50 bg-kratos-500/5"
            : "border-white/6 bg-white/[0.02]"
        }`}
        style={{ borderTopColor: isOver ? stage.color : undefined }}
      >
        <SortableContext
          items={clients.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} onRefresh={onRefresh} />
          ))}
        </SortableContext>

        {clients.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="mono-label text-center leading-relaxed">
              Drop clients<br />here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
