import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Key,
  Cpu,
  BarChart3,
  Layers,
  Activity,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";

export default function ProjectOverviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, logs, resetBudgetUsage } = useProjects();

  const project = projects.find((p) => p.id === projectId);
  const projectLogs = projectId ? (logs[projectId] ?? []) : [];

  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  if (!project) {
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
        <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Project not found</h2>
        <p style={{ marginTop: "8px", fontSize: "13px", color: "#8e8e8e" }}>
          The project <code style={{ color: "#c084fc" }}>{projectId}</code> does
          not exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            marginTop: "24px",
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
    );
  }

  // 1. Current Spend vs Budget
  const percentUsed =
    project.monthly_budget > 0
      ? Math.min(100, (project.spend / project.monthly_budget) * 100)
      : 0;

  // 2. Request breakdown
  const successfulCalls = projectLogs.filter(
    (l) => l.status_code === 200,
  ).length;
  const blockedCalls = projectLogs.filter((l) => l.status_code === 429).length;

  // 3. Token breakdown
  const promptTokens = projectLogs.reduce(
    (acc, l) => acc + (l.prompt_tokens || 0),
    0,
  );
  const completionTokens = projectLogs.reduce(
    (acc, l) => acc + (l.completion_tokens || 0),
    0,
  );
  const totalTokens = promptTokens + completionTokens;

  // 4. Provider Key status
  const providerKeysStatus = [
    { name: "OpenAI", configured: project.provider === "openai" },
    { name: "Anthropic", configured: project.provider === "anthropic" },
    { name: "Gemini", configured: project.provider === "gemini" },
  ];

  // 5. Proxy Key status
  const primaryKey = `${project.key_prefix ?? "setu_live"}_demo99482`;
  const truncatedKey = `${primaryKey.slice(0, 10)}...${primaryKey.slice(-4)}`;

  // Hourly volume distribution mock generator (24-hour cycle)
  const volumeData = Array.from({ length: 12 }, (_, i) => {
    const hourLabel = `${(i * 2).toString().padStart(2, "0")}:00`;
    const count = Math.floor(Math.sin(i) * 15 + 20 + (i % 3) * 8);
    return { hour: hourLabel, count };
  });
  const maxVolume = Math.max(...volumeData.map((d) => d.count), 1);

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
              {project.provider.toUpperCase()}
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
            ID: {project.id} · Prefix: {project.key_prefix ?? "setu_live"}
          </p>
        </div>

        {/* Header Reset Button - Uniform Action Styling */}
        <button
          type="button"
          onClick={() => resetBudgetUsage(project.id)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            backgroundColor: "#141414",
            border: "1px solid #262626",
            color: "#ffffff",
            fontWeight: 600,
            fontSize: "13px",
            padding: "10px 20px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.6)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#262626")}
        >
          <RefreshCw size={15} color="#C084FC" />
          <span>Reset Usage</span>
        </button>
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
              MONTHLY SPEND UTILIZATION (redis:GetSpend)
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
                ${project.spend.toFixed(2)}
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#71717a",
                }}
              >
                / ${project.monthly_budget.toFixed(2)} LIMIT
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
            REMAINING: ${(project.monthly_budget - project.spend).toFixed(2)}
          </span>
          <span>${project.monthly_budget.toFixed(2)}</span>
        </div>
      </motion.div>

      {/* ── Metrics Grid (2, 3, 4, 5) ─────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Metric 2: Request Breakdown */}
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
              {projectLogs.length}
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
            <span style={{ color: "#34D399" }}>{successfulCalls} 200 OK</span>
            <span style={{ color: "#f87171" }}>{blockedCalls} 429 BLOCKED</span>
          </div>
        </motion.div>

        {/* Metric 3: Token Consumption */}
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
              {totalTokens.toLocaleString()}
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
            <span>PROMPT: {promptTokens.toLocaleString()}</span>
            <span>COMPL: {completionTokens.toLocaleString()}</span>
          </div>
        </motion.div>

        {/* Metric 4: Active Provider Keys */}
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
                PROVIDER INTEGRATIONS
              </span>
              <Cpu size={15} color="#71717a" />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                marginTop: "6px",
              }}
            >
              {providerKeysStatus.map((p) => (
                <div
                  key={p.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <span style={{ color: "#ffffff" }}>{p.name}</span>
                  <span
                    style={{
                      color: p.configured ? "#34D399" : "#71717a",
                      fontWeight: 600,
                    }}
                  >
                    {p.configured ? "CONFIGURED" : "MISSING"}
                  </span>
                </div>
              ))}
            </div>
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
            TABLE: provider_keys
          </div>
        </motion.div>

        {/* Metric 5: Primary Proxy API Key Status */}
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
                PRIMARY PROXY KEY
              </span>
              <Key size={15} color="#71717a" />
            </div>
            <p
              style={{
                fontSize: "13px",
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: "#ffffff",
                margin: "4px 0",
              }}
            >
              {truncatedKey}
            </p>
            <span
              style={{
                fontSize: "11px",
                fontFamily: "'JetBrains Mono', monospace",
                color: "#34D399",
                fontWeight: 600,
              }}
            >
              STATUS: ACTIVE
            </span>
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
            LAST USED: JUST NOW
          </div>
        </motion.div>
      </div>

      {/* ── Request Volume Bar Graph (Replacing cURL box) ───────────── */}
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
              HOURLY REQUEST VOLUME
            </h3>
          </div>
          <span
            style={{
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#71717a",
            }}
          >
            24H REALTIME METRICS
          </span>
        </div>

        {/* Bar Chart Graphics */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            height: "140px",
            gap: "12px",
            paddingTop: "20px",
          }}
        >
          {volumeData.map((item, idx) => {
            const heightPercent = (item.count / maxVolume) * 100;
            const isHovered = hoveredBar === idx;

            return (
              <div
                key={item.hour}
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
                style={{
                  flex: 1,
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
                      top: "-28px",
                      backgroundColor: "#171717",
                      border: "1px solid #3f3f46",
                      padding: "2px 8px",
                      fontSize: "10px",
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#34D399",
                      whiteSpace: "nowrap",
                      zIndex: 10,
                    }}
                  >
                    {item.count} reqs
                  </motion.div>
                )}

                {/* Bar */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ duration: 0.4, delay: idx * 0.03 }}
                  style={{
                    width: "100%",
                    maxWidth: "28px",
                    backgroundColor: isHovered ? "#C084FC" : "#34D399",
                    opacity: isHovered ? 1 : 0.75,
                    transition:
                      "background-color 0.15s ease, opacity 0.15s ease",
                  }}
                />

                <span
                  style={{
                    fontSize: "10px",
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "#71717a",
                    marginTop: "8px",
                  }}
                >
                  {item.hour}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Recent Requests Log Preview ────────────────────────────── */}
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
            RECENT REQUEST LOGS (usage_logs)
          </h3>
          <Link
            to={`/dashboard/project/${project.id}/logs`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#34D399",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            <span>VIEW ALL LOGS</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {projectLogs.length === 0 ? (
          <div
            style={{
              padding: "24px 0",
              textAlign: "center",
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "#71717a",
            }}
          >
            No requests logged yet. Real-time proxy traffic will populate here
            automatically.
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {projectLogs.slice(0, 4).map((log) => (
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
                  <span style={{ color: "#71717a" }}>{log.created_at}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
