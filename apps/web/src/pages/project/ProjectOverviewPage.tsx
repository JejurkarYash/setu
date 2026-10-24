import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Cpu,
  BarChart3,
  Layers,
  Activity,
  Filter,
  AlertCircle,
  Loader2,
} from "lucide-react";
import apiClient from "../../lib/api";

// ── Types ─────────────────────────────────────────────────────────────
type OverviewInterval = "hour" | "day";

type OverviewFilters = {
  from: string;
  to: string;
  interval: OverviewInterval;
  status?: "all" | "200" | "429";
  model?: string;
};

type ProjectOverview = {
  project: {
    id: string;
    name: string;
    monthly_budget: number;
    spend: number;
    provider: string;
    proxy_key_prefix: string;
    provider_key_configured: boolean;
  };
  range: {
    from: string;
    to: string;
    interval: OverviewInterval;
  };
  summary: {
    total_requests: number;
    successful_requests: number;
    blocked_requests: number;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    total_cost_usd: number;
  };
  volume: Array<{
    bucket: string;
    total_requests: number;
    successful_requests: number;
    blocked_requests: number;
  }>;
  recent_requests: Array<{
    id: string;
    model: string;
    status_code: number;
    prompt_tokens: number;
    completion_tokens: number;
    cost_usd: number;
    created_at: string;
  }>;
};

// ── API Function ─────────────────────────────────────────────────────
async function fetchProjectOverview(
  projectId: string,
  filters: OverviewFilters,
): Promise<ProjectOverview> {
  const params = new URLSearchParams();
  params.append("from", filters.from);
  params.append("to", filters.to);
  params.append("interval", filters.interval);

  if (filters.status && filters.status !== "all") {
    params.append("status", filters.status);
  }
  if (filters.model && filters.model !== "all") {
    params.append("model", filters.model);
  }

  const response = await apiClient.get<ProjectOverview>(
    `/projects/${projectId}/overview?${params.toString()}`,
  );
  return response.data;
}

// ── Default Filters Helper (Last 30 days) ────────────────────────────
const getDefaultFilters = (): OverviewFilters => {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);

  return {
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
    interval: "hour",
    status: "all",
    model: "all",
  };
};

export default function ProjectOverviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Active overview state
  const [overview, setOverview] = useState<ProjectOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active filters applied to the server request
  const [appliedFilters, setAppliedFilters] =
    useState<OverviewFilters>(getDefaultFilters());

  // Draft filter states controlled by UI inputs
  const [dateRangeOption, setDateRangeOption] = useState<
    "24h" | "7d" | "30d" | "custom"
  >("30d");
  const [draftFrom, setDraftFrom] = useState(appliedFilters.from);
  const [draftTo, setDraftTo] = useState(appliedFilters.to);
  const [draftInterval, setDraftInterval] = useState<OverviewInterval>(
    appliedFilters.interval,
  );
  const [draftStatus, setDraftStatus] = useState<"all" | "200" | "429">(
    appliedFilters.status || "all",
  );
  const [draftModel, setDraftModel] = useState<string>(
    appliedFilters.model || "all",
  );

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Helper to handle date range presets
  const handlePresetChange = (option: "24h" | "7d" | "30d" | "custom") => {
    setDateRangeOption(option);
    if (option === "custom") return;

    const toDate = new Date();
    const fromDate = new Date();

    if (option === "24h") {
      fromDate.setHours(fromDate.getHours() - 24);
      setDraftInterval("hour");
    } else if (option === "7d") {
      fromDate.setDate(fromDate.getDate() - 7);
      setDraftInterval("hour");
    } else if (option === "30d") {
      fromDate.setDate(fromDate.getDate() - 30);
      setDraftInterval("day");
    }

    setDraftFrom(fromDate.toISOString());
    setDraftTo(toDate.toISOString());
  };

  // Fetch overview data function
  const loadOverview = useCallback(
    async (filtersToFetch: OverviewFilters, isInitial: boolean = false) => {
      if (!projectId) return;

      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      setErrorMessage(null);

      try {
        const data = await fetchProjectOverview(projectId, filtersToFetch);
        setOverview(data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          const serverMsg =
            error.response?.data?.Error || error.response?.data?.error;

          if (status === 400) {
            setErrorMessage(
              serverMsg ||
                "The selected filters are invalid. Please check ranges.",
            );
          } else if (status === 401) {
            setErrorMessage("Authentication error. Please log in again.");
          } else if (status === 403) {
            setErrorMessage(
              "You do not have access to view this project overview.",
            );
          } else if (status === 404) {
            setErrorMessage("Project was not found.");
          } else if (status === 500) {
            setErrorMessage("Internal server error. Please try again later.");
          } else {
            setErrorMessage(
              serverMsg || "Failed to load project overview data.",
            );
          }
        } else {
          setErrorMessage(
            "An unexpected network error occurred. Please check your connection.",
          );
        }
      } finally {
        setIsLoading(false);
        setIsRefetching(false);
      }
    },
    [projectId],
  );

  // Initial load on mount or projectId change
  useEffect(() => {
    const initialFilters = getDefaultFilters();
    setAppliedFilters(initialFilters);
    setDraftFrom(initialFilters.from);
    setDraftTo(initialFilters.to);
    setDraftInterval(initialFilters.interval);
    setDraftStatus(initialFilters.status || "all");
    setDraftModel(initialFilters.model || "all");

    if (projectId) {
      loadOverview(initialFilters, true);
    }
  }, [projectId, loadOverview]);

  // Apply filters handler
  const handleApplyFilters = () => {
    if (isRefetching) return;

    const newFilters: OverviewFilters = {
      from: new Date(draftFrom).toISOString(),
      to: new Date(draftTo).toISOString(),
      interval: draftInterval,
      status: draftStatus,
      model: draftModel,
    };

    setAppliedFilters(newFilters);
    loadOverview(newFilters, false);
  };

  // Reset filters handler
  const handleResetFilters = () => {
    const defaultF = getDefaultFilters();
    setDateRangeOption("30d");
    setDraftFrom(defaultF.from);
    setDraftTo(defaultF.to);
    setDraftInterval(defaultF.interval);
    setDraftStatus(defaultF.status || "all");
    setDraftModel(defaultF.model || "all");

    setAppliedFilters(defaultF);
    loadOverview(defaultF, false);
  };

  // Extract available models dynamically from recent requests or overview
  const availableModels = useMemo(() => {
    if (!overview || !overview.recent_requests) return [];
    const modelsSet = new Set(overview.recent_requests.map((r) => r.model));
    return Array.from(modelsSet);
  }, [overview]);

  // ── Render States ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "120px 16px",
          textAlign: "center",
          fontFamily: "'JetBrains Mono', monospace",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Loader2 size={32} color="#34D399" className="animate-spin" />
        <span style={{ fontSize: "13px", color: "#8e8e8e" }}>
          Loading project overview...
        </span>
      </div>
    );
  }

  // Handle explicit 404 / Initial load error state with Retry
  if (errorMessage && !overview) {
    return (
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "64px 16px",
          textAlign: "center",
          fontFamily: "'JetBrains Mono', monospace",
          color: "#ffffff",
        }}
      >
        <AlertCircle
          size={40}
          color="#f87171"
          style={{ margin: "0 auto 16px" }}
        />
        <h2 style={{ fontSize: "18px", fontWeight: 700 }}>
          Unable to Load Project Overview
        </h2>
        <p style={{ marginTop: "8px", fontSize: "13px", color: "#8e8e8e" }}>
          {errorMessage}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <button
            onClick={() => loadOverview(appliedFilters, true)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#141414",
              border: "1px solid #262626",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "12px",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            Retry
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#ffffff",
              color: "#000000",
              fontWeight: 700,
              fontSize: "12px",
              border: "none",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            Return to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!overview) return null;

  const { project, summary, volume, recent_requests } = overview;

  // Visual Budget Calculations
  const percentUsed =
    project.monthly_budget > 0
      ? Math.min(
          100,
          Math.max(0, (project.spend / project.monthly_budget) * 100),
        )
      : 0;

  const maxVolume = Math.max(...volume.map((d) => d.total_requests), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{
        width: "100%",
        maxWidth: "1080px",
        margin: "0 auto",
        padding: "12px 16px 80px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        boxSizing: "border-box",
        userSelect: "none",
      }}
    >
      {/* ── Error Banner for Filter/Refetch Failures ────────────────────── */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 16px",
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(248, 113, 113, 0.3)",
              color: "#f87171",
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          paddingBottom: "24px",
          borderBottom: "1px solid #222222",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "#8e8e8e",
            }}
          >
            <Link
              to="/dashboard"
              style={{ color: "#8e8e8e", textDecoration: "none" }}
            >
              Projects
            </Link>
            <span>/</span>
            <span style={{ color: "#ffffff", fontWeight: 600 }}>
              {project.name}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "4px",
            }}
          >
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              {project.name}
            </h1>
            <span
              style={{
                fontSize: "11px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                color: "#34D399",
                backgroundColor: "rgba(52, 211, 153, 0.1)",
                border: "1px solid rgba(52, 211, 153, 0.3)",
                padding: "2px 8px",
              }}
            >
              PROJECT
            </span>
          </div>
          <p
            style={{
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#71717a",
              margin: 0,
            }}
          >
            ID: {project.id} · Provider: {project.provider.toUpperCase()} · Key
            Prefix: {project.proxy_key_prefix}
          </p>
        </div>

        {/* Provider Key Status Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              padding: "8px 14px",
              backgroundColor: "#171717",
              border: "1px solid #222222",
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ color: "#8e8e8e" }}>PROVIDER KEY:</span>
            <span
              style={{
                color: project.provider_key_configured ? "#34D399" : "#f87171",
                fontWeight: 600,
              }}
            >
              {project.provider_key_configured ? "CONFIGURED" : "MISSING"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Filter Controls Section ─────────────────────────────────── */}
      <div
        style={{
          backgroundColor: "#121212",
          border: "1px solid #222222",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #1f1f1f",
            paddingBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Filter size={15} color="#C084FC" />
            <span
              style={{
                fontSize: "12px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              ANALYTICS FILTERS
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              background: "transparent",
              border: "none",
              color: "#8e8e8e",
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Reset Filters
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            alignItems: "center",
          }}
        >
          {/* Date Range Preset Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "10px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: "#71717a",
                textTransform: "uppercase",
              }}
            >
              Time Range
            </label>
            <select
              value={dateRangeOption}
              onChange={(e) => handlePresetChange(e.target.value as any)}
              style={{
                height: "38px",
                padding: "0 10px",
                backgroundColor: "#171717",
                border: "1px solid #222222",
                color: "#ffffff",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "12px",
                outline: "none",
              }}
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Interval Selection */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "10px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: "#71717a",
                textTransform: "uppercase",
              }}
            >
              Interval Bucket
            </label>
            <select
              value={draftInterval}
              onChange={(e) =>
                setDraftInterval(e.target.value as OverviewInterval)
              }
              style={{
                height: "38px",
                padding: "0 10px",
                backgroundColor: "#171717",
                border: "1px solid #222222",
                color: "#ffffff",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "12px",
                outline: "none",
              }}
            >
              <option value="hour">Hour</option>
              <option value="day">Day</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "10px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: "#71717a",
                textTransform: "uppercase",
              }}
            >
              Status Filter
            </label>
            <select
              value={draftStatus}
              onChange={(e) => setDraftStatus(e.target.value as any)}
              style={{
                height: "38px",
                padding: "0 10px",
                backgroundColor: "#171717",
                border: "1px solid #222222",
                color: "#ffffff",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "12px",
                outline: "none",
              }}
            >
              <option value="all">All Statuses</option>
              <option value="200">Successful (200)</option>
              <option value="429">Blocked (429)</option>
            </select>
          </div>

          {/* Model Filter */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label
              style={{
                fontSize: "10px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: "#71717a",
                textTransform: "uppercase",
              }}
            >
              Model Filter
            </label>
            <select
              value={draftModel}
              onChange={(e) => setDraftModel(e.target.value)}
              style={{
                height: "38px",
                padding: "0 10px",
                backgroundColor: "#171717",
                border: "1px solid #222222",
                color: "#ffffff",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "12px",
                outline: "none",
              }}
            >
              <option value="all">All Models</option>
              {availableModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Inputs if Custom Selected */}
        {dateRangeOption === "custom" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginTop: "8px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: "#8e8e8e",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                From (UTC)
              </span>
              <input
                type="datetime-local"
                value={draftFrom.slice(0, 16)}
                onChange={(e) =>
                  setDraftFrom(new Date(e.target.value).toISOString())
                }
                style={{
                  height: "36px",
                  padding: "0 10px",
                  backgroundColor: "#171717",
                  border: "1px solid #222222",
                  color: "#ffffff",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                }}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: "#8e8e8e",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                To (UTC)
              </span>
              <input
                type="datetime-local"
                value={draftTo.slice(0, 16)}
                onChange={(e) =>
                  setDraftTo(new Date(e.target.value).toISOString())
                }
                style={{
                  height: "36px",
                  padding: "0 10px",
                  backgroundColor: "#171717",
                  border: "1px solid #222222",
                  color: "#ffffff",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                }}
              />
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "4px",
          }}
        >
          <button
            type="button"
            disabled={isRefetching}
            onClick={handleApplyFilters}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: "#141414",
              border: "1px solid #262626",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "12px",
              padding: "8px 18px",
              cursor: isRefetching ? "not-allowed" : "pointer",
              opacity: isRefetching ? 0.7 : 1,
            }}
          >
            {isRefetching ? (
              <>
                <Loader2 size={14} color="#34D399" className="animate-spin" />
                <span>Applying...</span>
              </>
            ) : (
              <span>Apply Filters</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Metric 1: Monthly Spend Utilization ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          backgroundColor: "#121212",
          border: "1px solid #222222",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "11px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: "#71717a",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              MONTHLY SPEND UTILIZATION
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#ffffff",
                }}
              >
                $
                {project.spend < 0.01 && project.spend > 0
                  ? project.spend.toFixed(4)
                  : project.spend.toFixed(2)}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#71717a",
                }}
              >
                / $
                {project.monthly_budget < 0.01 && project.monthly_budget > 0
                  ? project.monthly_budget.toFixed(4)
                  : project.monthly_budget.toFixed(2)}{" "}
                LIMIT
              </span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span
              style={{
                fontSize: "24px",
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: percentUsed >= 90 ? "#f87171" : "#34D399",
              }}
            >
              {percentUsed.toFixed(1)}%
            </span>
            <span
              style={{
                fontSize: "11px",
                fontFamily: "'JetBrains Mono', monospace",
                color: "#71717a",
                display: "block",
              }}
            >
              CAPACITY USED
            </span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div
          style={{
            width: "100%",
            height: "8px",
            backgroundColor: "#171717",
            border: "1px solid #222222",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentUsed}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              height: "100%",
              backgroundColor: percentUsed >= 90 ? "#f87171" : "#34D399",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "11px",
            fontFamily: "'JetBrains Mono', monospace",
            color: "#71717a",
          }}
        >
          <span>$0.00</span>
          <span>
            REMAINING: $
            {Math.max(0, project.monthly_budget - project.spend) < 0.01 &&
            project.monthly_budget - project.spend > 0
              ? (project.monthly_budget - project.spend).toFixed(4)
              : (project.monthly_budget - project.spend).toFixed(2)}
          </span>
          <span>
            $
            {project.monthly_budget < 0.01 && project.monthly_budget > 0
              ? project.monthly_budget.toFixed(4)
              : project.monthly_budget.toFixed(2)}
          </span>
        </div>
      </motion.div>

      {/* ── Summary Cards Grid ──────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Request Breakdown Card */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          style={{
            padding: "20px",
            backgroundColor: "#121212",
            border: "1px solid #222222",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "16px",
            boxSizing: "border-box",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#71717a",
                }}
              >
                REQUEST BREAKDOWN
              </span>
              <BarChart3 size={15} color="#71717a" />
            </div>
            <p
              style={{
                fontSize: "24px",
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: "#ffffff",
                margin: 0,
              }}
            >
              {summary.total_requests.toLocaleString()}
            </p>
          </div>

          <div
            style={{
              paddingTop: "12px",
              borderTop: "1px solid #1f1f1f",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <span style={{ color: "#34D399" }}>
              {summary.successful_requests.toLocaleString()} 200 OK
            </span>
            <span style={{ color: "#f87171" }}>
              {summary.blocked_requests.toLocaleString()} 429 BLOCKED
            </span>
          </div>
        </motion.div>

        {/* Token Consumption Card */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          style={{
            padding: "20px",
            backgroundColor: "#121212",
            border: "1px solid #222222",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "16px",
            boxSizing: "border-box",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#71717a",
                }}
              >
                TOKEN CONSUMPTION
              </span>
              <Layers size={15} color="#71717a" />
            </div>
            <p
              style={{
                fontSize: "24px",
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: "#ffffff",
                margin: 0,
              }}
            >
              {summary.total_tokens.toLocaleString()}
            </p>
          </div>

          <div
            style={{
              paddingTop: "12px",
              borderTop: "1px solid #1f1f1f",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "10px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#71717a",
            }}
          >
            <span>PROMPT: {summary.prompt_tokens.toLocaleString()}</span>
            <span>COMPL: {summary.completion_tokens.toLocaleString()}</span>
          </div>
        </motion.div>

        {/* Total Cost Card */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          style={{
            padding: "20px",
            backgroundColor: "#121212",
            border: "1px solid #222222",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "16px",
            boxSizing: "border-box",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#71717a",
                }}
              >
                TOTAL COST (USD)
              </span>
              <Cpu size={15} color="#71717a" />
            </div>
            <p
              style={{
                fontSize: "24px",
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: "#ffffff",
                margin: 0,
              }}
            >
              ${summary.total_cost_usd.toFixed(4)}
            </p>
          </div>

          <div
            style={{
              paddingTop: "12px",
              borderTop: "1px solid #1f1f1f",
              fontSize: "10px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#71717a",
            }}
          >
            AGGREGATED ACROSS FILTERS
          </div>
        </motion.div>
      </div>

      {/* ── Request Volume Bar Graph ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        style={{
          backgroundColor: "#121212",
          border: "1px solid #222222",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "16px",
            borderBottom: "1px solid #1f1f1f",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Activity size={16} color="#C084FC" />
            <h3
              style={{
                fontSize: "12px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              REQUEST VOLUME BUCKETS
            </h3>
          </div>
          <span
            style={{
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#71717a",
            }}
          >
            INTERVAL: {overview.range.interval.toUpperCase()}
          </span>
        </div>

        {volume.length === 0 ? (
          <div
            style={{
              padding: "32px 0",
              textAlign: "center",
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#71717a",
            }}
          >
            No volume metrics found for the selected filter range.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-start",
              height: "140px",
              gap: "24px",
              paddingTop: "20px",
              overflowX: "auto",
            }}
          >
            {volume.map((item, idx) => {
              const heightPercent = (item.total_requests / maxVolume) * 100;
              const isHovered = hoveredBar === idx;

              return (
                <div
                  key={item.bucket}
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                  style={{
                    width: "48px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "100%",
                    justifyContent: "flex-end",
                    position: "relative",
                    cursor: "pointer",
                  }}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        position: "absolute",
                        top: "-36px",
                        backgroundColor: "#171717",
                        border: "1px solid #3f3f46",
                        padding: "4px 8px",
                        fontSize: "10px",
                        fontFamily: "'JetBrains Mono', monospace",
                        color: "#34D399",
                        whiteSpace: "nowrap",
                        zIndex: 10,
                      }}
                    >
                      <div>{item.total_requests} total</div>
                      <div style={{ color: "#34D399" }}>
                        {item.successful_requests} 200 /{" "}
                        <span style={{ color: "#f87171" }}>
                          {item.blocked_requests} 429
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(heightPercent, 6)}%` }}
                    transition={{ duration: 0.4, delay: idx * 0.02 }}
                    style={{
                      width: "100%",
                      maxWidth: "28px",
                      backgroundColor: isHovered ? "#C084FC" : "#34D399",
                      opacity: isHovered ? 1 : 0.8,
                    }}
                  />

                  <span
                    style={{
                      fontSize: "9px",
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#71717a",
                      marginTop: "8px",
                      transform: "rotate(-30deg)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(item.bucket).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Recent Requests Section ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        style={{
          backgroundColor: "#121212",
          border: "1px solid #222222",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "16px",
            borderBottom: "1px solid #1f1f1f",
          }}
        >
          <h3
            style={{
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            RECENT REQUESTS
          </h3>
          <span
            style={{
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#71717a",
            }}
          >
            SERVER RESPONSE LOGS
          </span>
        </div>

        {recent_requests.length === 0 ? (
          <div
            style={{
              padding: "24px 0",
              textAlign: "center",
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#71717a",
            }}
          >
            No requests logged yet for the current filters.
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {recent_requests.map((log) => (
              <motion.div
                key={log.id}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
                style={{
                  padding: "12px 16px",
                  backgroundColor: "#171717",
                  border: "1px solid #222222",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <span
                    style={{
                      padding: "2px 8px",
                      fontWeight: 700,
                      backgroundColor:
                        log.status_code === 200
                          ? "rgba(52, 211, 153, 0.1)"
                          : "rgba(248, 113, 113, 0.1)",
                      color: log.status_code === 200 ? "#34D399" : "#f87171",
                      border:
                        log.status_code === 200
                          ? "1px solid rgba(52, 211, 153, 0.3)"
                          : "1px solid rgba(248, 113, 113, 0.3)",
                    }}
                  >
                    {log.status_code}
                  </span>
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>
                    {log.model}
                  </span>
                  <span style={{ color: "#71717a" }}>
                    {log.prompt_tokens + log.completion_tokens} tokens
                  </span>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "16px" }}
                >
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>
                    ${log.cost_usd.toFixed(6)}
                  </span>
                  <span style={{ color: "#71717a" }}>
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
