import React from "react";
import { ArrowUpRight, MoreHorizontal, AlertTriangle } from "lucide-react";

export type Provider = "openai" | "anthropic" | "gemini";

export interface ProjectCardProps {
  id?: string;
  name?: string;
  provider?: Provider;
  spend?: number;
  monthlyBudget?: number;
  requestCount?: number;
  keyPrefix?: string;
  onClick?: () => void;
  onMenuClick?: (e: React.MouseEvent) => void;
  className?: string;
}

// ── Helpers ──────────────────────────────────────────────

const PROVIDER_NAMES: Record<Provider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Gemini",
};

function formatCurrency(val?: number): string {
  if (val === undefined || val === null) return "—";
  return `$${val.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ── Component ────────────────────────────────────────────

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id = "prj_7x9k2m1q",
  name = "Production AI Gateway",
  provider = "openai",
  spend = 500.1,
  monthlyBudget = 1250.0,
  requestCount = 142850,
  keyPrefix = "sk-proj-9a8f",
  onClick,
  onMenuClick,
  className = "",
}) => {
  // ── Calculated Display Values ───────────────────────────
  const hasBudget = monthlyBudget > 0;
  const rawPct = hasBudget ? (spend / monthlyBudget) * 100 : 0;
  const clampedPct = Math.min(100, Math.max(0, rawPct));
  const isOver = hasBudget && spend > monthlyBudget;
  const isNear = !isOver && rawPct >= 80;

  // ── Color Tokens ────────────────────────────────────────
  // ── Color Tokens ────────────────────────────────────────
  const barColor = isOver
    ? "bg-rose-500"
    : isNear
      ? "bg-amber-500"
      : rawPct >= 60
        ? "bg-amber-500"
        : "bg-emerald-200";

  const pctColor = isOver
    ? "text-rose-400"
    : isNear || rawPct >= 60
      ? "text-amber-400"
      : "text-emerald-400";
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      // Inside ProjectCard.tsx: Update the outer div className
      className={[
        "group relative flex flex-col justify-between w-full min-w-0", // Removed max-w-[380px]
        "bg-[#141414] border border-zinc-800/80 overflow-hidden text-left shadow-lg",
        "cursor-pointer select-none transition-all duration-200 ease-out",
        "hover:border-zinc-700 hover:bg-[#181818] hover:shadow-xl hover:shadow-black/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50",
        className,
      ].join(" ")}
      style={{ padding: "20px" }}
    >
      {/* Top Accent Line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      {/* ── Top Header Section ──────────────────────────── */}
      <div className="flex flex-col gap-4" style={{ marginBottom: "16px" }}>
        {/* Row 1: Badge + Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-zinc-800 bg-zinc-900/90">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-zinc-300">
              {PROVIDER_NAMES[provider] ?? provider}
            </span>
          </div>

          <div className="flex items-center gap-1 text-zinc-400">
            <button
              type="button"
              aria-label="Project options"
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick?.(e);
              }}
              className="p-1 rounded hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <MoreHorizontal className="size-4" />
            </button>

            <div className="p-1">
              <ArrowUpRight className="size-4 text-zinc-500 transition-transform duration-200 group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>

        {/* Row 2: Name + ID */}
        <div className="min-w-0">
          <h3
            title={name}
            className="text-base font-semibold tracking-tight text-zinc-100 group-hover:text-white transition-colors truncate"
          >
            {name}
          </h3>
          <p
            title={`ID: ${id} | Key Prefix: ${keyPrefix}`}
            className="mt-1 text-xs font-mono text-zinc-500 tracking-tight truncate"
          >
            {id}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="border-t border-zinc-800/80"
        style={{ marginTop: "4px", marginBottom: "16px" }}
      />

      {/* ── Bottom Metrics Section ──────────────────────── */}
      <div className="flex flex-col gap-4">
        {/* Spend & Cap Grid */}
        <div
          className="grid grid-cols-2 gap-4"
          style={{ marginBottom: "12px" }}
        >
          <div className="min-w-0">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
              Current Spend
            </span>
            <span className="text-lg font-mono font-bold text-zinc-100 tracking-tight truncate block">
              {formatCurrency(spend)}
            </span>
          </div>

          <div className="min-w-0">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
              Monthly Cap
            </span>
            <span className="text-lg font-mono font-bold text-zinc-400 tracking-tight truncate block">
              {hasBudget ? formatCurrency(monthlyBudget) : "—"}
            </span>
          </div>
        </div>

        {/* Progress Bar & Stats */}
        <div className="flex flex-col gap-2">
          <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
              style={{ width: `${clampedPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-2 text-xs font-mono pt-1">
            <span className={`flex items-center gap-1 font-medium ${pctColor}`}>
              {isOver && <AlertTriangle className="size-3.5 shrink-0" />}
              {hasBudget
                ? `${rawPct.toFixed(1)}% ${isOver ? "over cap" : "used"}`
                : "No budget cap"}
            </span>

            <span className="text-zinc-500 truncate shrink">
              {requestCount.toLocaleString()} reqs
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
