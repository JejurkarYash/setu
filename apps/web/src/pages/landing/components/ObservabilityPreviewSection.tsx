import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";

const navItems = ["Overview", "Request Logs", "Budgets", "Alerts"];

const statCards = [
  { label: "Requests", value: "2.4k", delta: "+12%" },
  { label: "Spend", value: "$2.86k", delta: "-$240" },
  { label: "Tokens", value: "8.4M", delta: "+3.2%" },
];

const chartBars = [
  { label: "M", value: 38 },
  { label: "T", value: 52 },
  { label: "W", value: 44 },
  { label: "T", value: 68 },
  { label: "F", value: 56 },
  { label: "S", value: 74 },
  { label: "S", value: 64 },
];

const logRows = [
  { time: "16:42:01", model: "openai/gpt-4o", status: 200, latency: "142ms" },
  { time: "16:41:58", model: "anthropic/claude-3.5", status: 200, latency: "210ms" },
  { time: "16:41:52", model: "google/gemini-pro", status: 429, latency: "12ms" },
  { time: "16:41:40", model: "openai/gpt-4o-mini", status: 200, latency: "94ms" },
];

export default function ObservabilityPreviewSection() {
  const prefersReducedMotion = useReducedMotion();
  const [activeBar, setActiveBar] = useState<number | null>(null);
  const [activeNav, setActiveNav] = useState("Overview");

  const selectedBar = useMemo(
    () => chartBars[activeBar ?? 4] ?? chartBars[4],
    [activeBar],
  );

  return (
    <section className="problem-solution-section observability-preview-section" data-chapter="04 / OBSERVABILITY">
      <motion.div
        className="problem-accent-line"
        initial={prefersReducedMotion ? false : { scaleX: 0, opacity: 0 }}
        whileInView={prefersReducedMotion ? undefined : { scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      />

      <div className="problem-solution-inner observability-inner">
        <div className="problem-solution-copy observability-copy">
          <p className="problem-solution-eyebrow">OBSERVABILITY</p>
          <h2>Your LLM traffic. Finally, in focus.</h2>
          <p className="problem-description">
            Track usage, understand spending, and inspect requests across your LLM
            infrastructure—all through Setu.
          </p>
        </div>

        <motion.div
          className="observability-stage"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="observability-window">
            <div className="dashboard-header-row">
              <div className="dashboard-breadcrumbs">
                <span>Projects</span>
                <span className="separator">/</span>
                <span className="current">prod-core</span>
              </div>
              <div className="status-pill live-pill">
                <span className="live-dot" />
                LIVE OVERVIEW
              </div>
            </div>

            <div className="dashboard-shell">
              <aside className="dashboard-sidebar">
                {navItems.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`sidebar-nav-item ${activeNav === item ? "is-active" : ""}`}
                    aria-current={activeNav === item ? "page" : undefined}
                    onClick={() => setActiveNav(item)}
                  >
                    {item}
                  </button>
                ))}
              </aside>

              <div className="dashboard-body">
                <div className="metric-row">
                  {statCards.map((card) => (
                    <motion.div
                      key={card.label}
                      className="metric-card"
                      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                      transition={{ duration: 0.18 }}
                    >
                      <span className="metric-label">{card.label}</span>
                      <div className="metric-value-row">
                        <strong>{card.value}</strong>
                        <span className="metric-delta">{card.delta}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="content-grid">
                  <div className="chart-panel panel-surface">
                    <div className="panel-header-row">
                      <span className="panel-title">Request activity</span>
                      <span className="panel-meta">last 7 days</span>
                    </div>

                    <div className="bar-chart" aria-label="Request activity chart">
                      {chartBars.map((bar, index) => (
                        <div
                          key={bar.label}
                          className="bar-column"
                          onMouseEnter={() => setActiveBar(index)}
                          onMouseLeave={() => setActiveBar(null)}
                        >
                          <div className="bar-tooltip">
                            {bar.value} req/min
                          </div>
                          <div
                            className={`bar ${activeBar === index ? "is-hovered" : ""}`}
                            style={{ height: `${bar.value}%` }}
                          />
                          <span>{bar.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="chart-hover-readout">
                      <span className="readout-label">Peak</span>
                      <span className="readout-value">{selectedBar.value} req/min</span>
                    </div>
                  </div>

                  <div className="budget-panel panel-surface">
                    <div className="panel-header-row">
                      <span className="panel-title">Budget monitor</span>
                      <span className="amber-badge">80% threshold</span>
                    </div>

                    <div className="budget-summary">
                      <div>
                        <span className="muted-label">Spent</span>
                        <strong>$78.40</strong>
                      </div>
                      <div className="budget-meta">
                        <span className="muted-label">Remaining</span>
                        <strong>$21.60</strong>
                      </div>
                    </div>

                    <div className="budget-track">
                      <div className="budget-fill" style={{ width: "78.4%" }} />
                      <div className="budget-threshold" style={{ left: "80%" }}>
                        <span>80%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bottom-grid">
                  <div className="panel-surface logs-panel">
                    <div className="panel-header-row">
                      <span className="panel-title">Recent requests</span>
                      <span className="panel-meta">live</span>
                    </div>

                    <div className="logs-header-row">
                      <span>Time</span>
                      <span>Provider</span>
                      <span>Status</span>
                      <span>Latency</span>
                    </div>

                    {logRows.map((row, index) => (
                      <div
                        key={`${row.time}-${index}`}
                        className={`log-row ${index === 2 ? "is-highlighted" : ""}`}
                      >
                        <span>{row.time}</span>
                        <span>{row.model}</span>
                        <span className={row.status === 200 ? "status-ok" : "status-warn"}>
                          {row.status}
                        </span>
                        <span>{row.latency}</span>
                      </div>
                    ))}
                  </div>

                  <div className="panel-surface alert-panel">
                    <div className="panel-header-row">
                      <span className="panel-title">Slack channel</span>
                      <span className="panel-meta">configured</span>
                    </div>

                    <div className="alert-card">
                      <div className="alert-card-topline">
                        <span className="slack-tag"># setu-alerts</span>
                        <span className="mini-status">active</span>
                      </div>

                      <div className="alert-message">
                        <div className="slack-mark">S</div>
                        <div className="alert-copy">
                          <div className="alert-author-row">
                            <span>Setu Budget Shield</span>
                            <span className="bot-badge">APP</span>
                          </div>
                          <div className="alert-text">
                            <span className="danger-tag">THRESHOLD 80% REACHED</span>
                            <p>Project prod-core crossed its configured threshold.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        .observability-preview-section {
          background: #070707;
          overflow: hidden;
        }

        .observability-preview-section::before {
          position: absolute;
          top: 0;
          bottom: 0;
          left: clamp(20px, 6.5vw, 88px);
          width: 1px;
          content: "";
          background: #1d2327;
          pointer-events: none;
        }

        .observability-inner {
          display: flex;
          flex-direction: column;
          gap: 44px;
        }

        .observability-copy {
          max-width: 760px;
        }

        .observability-stage {
          width: 100%;
        }

        .observability-window {
          position: relative;
          background: #090b0d;
          border: 1px solid #293137;
          padding: 18px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .observability-window::before {
          position: absolute;
          top: -1px;
          left: 18px;
          width: 96px;
          height: 1px;
          content: "";
          background: #67e8f9;
        }

        .dashboard-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 10px 18px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.12);
        }

        .dashboard-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8e8e8e;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: "JetBrains Mono", monospace;
        }

        .dashboard-breadcrumbs .current {
          color: #f5f5f5;
        }

        .separator {
          opacity: 0.7;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border: 1px solid rgba(52, 211, 153, 0.28);
          background: rgba(52, 211, 153, 0.08);
          color: #5eead4;
          font-size: 9px;
          font-family: "JetBrains Mono", monospace;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34D399;
          box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.12);
        }

        .dashboard-shell {
          display: grid;
          grid-template-columns: 180px minmax(0, 1fr);
          min-height: 560px;
          margin-top: 18px;
        }

        .dashboard-sidebar {
          border-right: 1px solid rgba(148, 163, 184, 0.12);
          padding: 18px 12px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: rgba(7, 8, 12, 0.5);
        }

        .sidebar-nav-item {
          width: 100%;
          border: 1px solid transparent;
          background: transparent;
          color: #a7acb8;
          text-align: left;
          padding: 10px 12px;
          font-size: 11px;
          font-family: "JetBrains Mono", monospace;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: default;
          transition: color 180ms ease, background 180ms ease, border-color 180ms ease;
        }

        .sidebar-nav-item:hover {
          border-color: rgba(148, 163, 184, 0.18);
          color: #f5f5f5;
        }

        .sidebar-nav-item.is-active {
          background: rgba(103, 232, 249, 0.06);
          border-color: rgba(103, 232, 249, 0.24);
          color: #f5f5f5;
        }

        .dashboard-body {
          padding: 18px 18px 10px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .metric-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .metric-card {
          background: rgba(15, 17, 22, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.12);
          padding: 14px 16px;
          min-height: 88px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          transition: border-color 180ms ease, background 180ms ease;
        }

        .metric-card:hover {
          border-color: rgba(148, 163, 184, 0.24);
          background: rgba(18, 20, 26, 0.94);
        }

        .metric-label {
          display: block;
          color: #8f93a2;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .metric-value-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          margin-top: 10px;
        }

        .metric-card strong {
          color: #f5f5f5;
          font-size: clamp(1.45rem, 2vw, 2rem);
          letter-spacing: -0.06em;
          font-family: "JetBrains Mono", monospace;
        }

        .metric-delta {
          color: #5eead4;
          font-size: 9px;
          font-family: "JetBrains Mono", monospace;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .content-grid,
        .bottom-grid {
          display: grid;
          gap: 16px;
        }

        .content-grid {
          grid-template-columns: minmax(0, 1.5fr) minmax(240px, 0.75fr);
        }

        .bottom-grid {
          grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.8fr);
        }

        .panel-surface {
          background: rgba(15, 17, 22, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.12);
          padding: 14px 16px 12px;
        }

        .panel-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 14px;
        }

        .panel-title {
          color: #f4f4f5;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: "JetBrains Mono", monospace;
        }

        .panel-meta {
          color: #8d919b;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: "JetBrains Mono", monospace;
        }

        .bar-chart {
          position: relative;
          height: 170px;
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 12px;
          align-items: end;
          padding: 18px 12px 0;
          background: linear-gradient(180deg, rgba(8, 9, 12, 0.12), rgba(8, 9, 12, 0));
          border: 1px solid rgba(148, 163, 184, 0.08);
        }

        .bar-column {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: end;
          height: 100%;
          gap: 8px;
        }

        .bar {
          width: 100%;
          max-width: 28px;
          background: linear-gradient(180deg, rgba(103, 232, 249, 0.78), rgba(103, 232, 249, 0.2));
          border: 1px solid rgba(103, 232, 249, 0.22);
          min-height: 18px;
          transition: transform 0.2s ease, opacity 0.2s ease, filter 0.2s ease;
        }

        .bar.is-hovered {
          transform: translateY(-2px);
          background: linear-gradient(180deg, #a5f3fc, rgba(103, 232, 249, 0.36));
        }

        .bar-column span {
          color: #777d8a;
          font-size: 9px;
          font-family: "JetBrains Mono", monospace;
        }

        .bar-tooltip {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translate(-50%, -100%);
          padding: 4px 6px;
          border: 1px solid rgba(148, 163, 184, 0.22);
          background: rgba(5, 5, 8, 0.96);
          color: #dfe1ec;
          font-size: 8px;
          font-family: "JetBrains Mono", monospace;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease;
        }

        .bar-column:hover .bar-tooltip {
          opacity: 1;
        }

        .chart-hover-readout {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid rgba(148, 163, 184, 0.08);
          color: #a7acb8;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .readout-value {
          color: #f5f5f5;
        }

        .budget-panel {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .amber-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border: 1px solid rgba(245, 158, 11, 0.2);
          background: rgba(245, 158, 11, 0.08);
          color: #f59e0b;
          font-size: 8px;
          font-family: "JetBrains Mono", monospace;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .budget-summary {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }

        .muted-label {
          display: block;
          color: #8f93a2;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: "JetBrains Mono", monospace;
        }

        .budget-summary strong {
          display: block;
          margin-top: 8px;
          color: #f5f5f5;
          font-size: 1.7rem;
          font-family: "JetBrains Mono", monospace;
          letter-spacing: -0.06em;
        }

        .budget-track {
          position: relative;
          height: 16px;
          border: 1px solid rgba(148, 163, 184, 0.12);
          background: rgba(17, 19, 24, 0.85);
          overflow: hidden;
        }

        .budget-fill {
          position: absolute;
          inset: 0 auto 0 0;
          background: linear-gradient(90deg, #67E8F9 0%, #E879F9 72%, #F5C96B 100%);
        }

        .budget-threshold {
          position: absolute;
          top: -6px;
          width: 2px;
          height: calc(100% + 12px);
          background: rgba(245, 158, 11, 0.9);
        }

        .budget-threshold span {
          position: absolute;
          left: 50%;
          top: -18px;
          transform: translateX(-50%);
          color: #f59e0b;
          font-size: 8px;
          letter-spacing: 0.08em;
          font-family: "JetBrains Mono", monospace;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .logs-panel {
          min-height: 240px;
        }

        .logs-header-row,
        .log-row {
          display: grid;
          grid-template-columns: 70px minmax(120px, 1fr) 64px 64px;
          gap: 10px;
          align-items: center;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.04em;
        }

        .logs-header-row {
          padding: 10px 0 8px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          color: #7f8694;
          text-transform: uppercase;
        }

        .log-row {
          padding: 10px 0;
          color: #d8d9df;
          border-bottom: 1px solid rgba(148, 163, 184, 0.08);
        }

        .log-row.is-highlighted {
          background: rgba(232, 121, 249, 0.06);
          border-color: rgba(232, 121, 249, 0.16);
        }

        .status-ok {
          color: #5eead4;
        }

        .status-warn {
          color: #fca5a5;
        }

        .alert-panel {
          display: flex;
          flex-direction: column;
        }

        .alert-card {
          background: rgba(10, 12, 16, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.14);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-height: 220px;
        }

        .alert-card-topline {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: #8d919b;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .slack-tag {
          color: #c8ccd7;
        }

        .mini-status {
          background: rgba(52, 211, 153, 0.08);
          border: 1px solid rgba(52, 211, 153, 0.3);
          color: #5eead4;
          padding: 4px 6px;
        }

        .alert-message {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .slack-mark {
          width: 36px;
          height: 36px;
          border-radius: 0;
          background: linear-gradient(135deg, #f5d9ff, #E879F9);
          color: #09090b;
          display: grid;
          place-items: center;
          font-family: "JetBrains Mono", monospace;
          font-weight: 700;
          flex-shrink: 0;
        }

        .alert-copy {
          flex: 1;
        }

        .alert-author-row {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #f5f5f5;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          margin-bottom: 10px;
        }

        .bot-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 2px 5px;
          border: 1px solid rgba(148, 163, 184, 0.18);
          background: rgba(255, 255, 255, 0.03);
          color: #bfc4d1;
          font-size: 8px;
          font-family: "JetBrains Mono", monospace;
          letter-spacing: 0.08em;
        }

        .alert-text {
          background: rgba(26, 23, 31, 0.8);
          border: 1px solid rgba(248, 113, 113, 0.2);
          padding: 12px;
        }

        .danger-tag {
          display: inline-block;
          padding: 4px 8px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(248, 113, 113, 0.2);
          color: #fca5a5;
          font-size: 8px;
          letter-spacing: 0.08em;
          font-family: "JetBrains Mono", monospace;
          text-transform: uppercase;
        }

        .alert-text p {
          margin: 10px 0 0;
          color: #d8d9de;
          font-size: 12px;
          line-height: 1.5;
        }

        @media (max-width: 900px) {
          .observability-inner {
            gap: 28px;
          }

          .dashboard-shell {
            grid-template-columns: 1fr;
          }

          .dashboard-sidebar {
            border-right: none;
            border-bottom: 1px solid rgba(148, 163, 184, 0.12);
            flex-direction: row;
            flex-wrap: wrap;
          }

          .content-grid,
          .bottom-grid,
          .metric-row {
            grid-template-columns: 1fr;
          }

          .dashboard-body {
            padding: 12px 0 0;
          }
        }
      `}</style>
    </section>
  );
}
