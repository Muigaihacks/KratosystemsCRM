"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { Clock, User, GripVertical } from "lucide-react";
import { clsx } from "clsx";
import type { Client } from "@/app/(dashboard)/pipeline/page";

export default function ClientCard({
  client,
  isDragging,
  onRefresh,
}: {
  client: Client;
  isDragging?: boolean;
  onRefresh?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } =
    useSortable({ id: client.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatKES = (val: string | null) => {
    if (!val) return null;
    const n = parseFloat(val);
    if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `KES ${(n / 1_000).toFixed(0)}K`;
    return `KES ${n.toLocaleString()}`;
  };

  const urgencyColor = client.days_in_stage > 14
    ? "text-red-400"
    : client.days_in_stage > 7
    ? "text-yellow-400"
    : "text-white/35";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "glass-card rounded-xl p-3.5 cursor-grab active:cursor-grabbing group",
        "transition-all duration-150 animate-slide-in",
        (isDragging || isSortableDragging) && "opacity-40 rotate-1 scale-95"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <Link
          href={`/clients/${client.id}`}
          className="font-semibold text-[13px] text-white hover:text-kratos-300 transition-colors leading-tight"
          onClick={(e) => e.stopPropagation()}
        >
          {client.company_name}
        </Link>
        <GripVertical className="w-3.5 h-3.5 text-white/20 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <p className="text-[11px] text-white/40 mb-2.5 capitalize">{client.industry}</p>

      {client.pipeline_value_kes && (
        <p className="kes-value text-[13px] font-semibold mb-2.5">
          {formatKES(client.pipeline_value_kes)}
        </p>
      )}

      <div className="flex items-center justify-between pt-2.5 border-t border-white/6">
        <div className="flex items-center gap-1.5">
          <User className="w-3 h-3 text-white/25" />
          <span className="text-[11px] text-white/40 truncate max-w-[80px]">
            {client.contact_name}
          </span>
        </div>
        <div className={clsx("flex items-center gap-1", urgencyColor)}>
          <Clock className="w-3 h-3" />
          <span className="text-[11px] font-mono">
            {client.days_in_stage}d
          </span>
        </div>
      </div>
    </div>
  );
}
