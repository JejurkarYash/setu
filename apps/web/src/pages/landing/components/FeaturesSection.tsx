import { motion, useReducedMotion } from "framer-motion";

type Feature = {
  id: "gateway" | "analytics" | "budget" | "alerts" | "logs";
  tag: string;
  title: string;
  description: string;
  labels: string[];
};

const features: Feature[] = [
  {
    id: "gateway",
    tag: "01 / REQUEST ROUTING",
    title: "One gateway. Multiple models.",
    description:
      "Route requests through a unified interface instead of managing separate provider integrations.",
    labels: ["OpenAI", "Anthropic", "Google Gemini"],
  },
  {
    id: "analytics",
    tag: "02 / USAGE OBSERVABILITY",
    title: "Every token tells a story.",
    description:
      "Understand request activity, token usage, and spending across your projects.",
    labels: ["$2,860 spend", "12k requests", "8.4M tokens"],
  },
  {
    id: "budget",
    tag: "03 / BUDGET SHIELD",
    title: "Set limits. Stay in control.",
    description:
      "Configure project budgets and monitor spending against your thresholds.",
    labels: ["Project budget", "Current spend", "Threshold 80%"],
  },
  {
    id: "alerts",
    tag: "04 / AUTOMATED ALERTS",
    title: "Know when spending crosses the line.",
    description:
      "Receive Slack notifications when configured spending thresholds are crossed.",
    labels: ["Threshold monitor", "Alert event", "Slack channel"],
  },
  {
    id: "logs",
    tag: "05 / LOG AUDITING",
    title: "Follow every request.",
    description:
      "Inspect request activity to understand traffic and troubleshoot issues.",
    labels: ["Latency", "Status 200", "OpenAI", "Anthropic", "Gemini"],
  },
];

function GatewayGraphic() {
  return (
    <svg className="story-svg" viewBox="0 0 620 280" aria-label="Unified gateway diagram">
      <defs>
        <linearGradient id="gateway-path" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#E879F9" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#F5C96B" stopOpacity="0.65" />
        </linearGradient>
      </defs>

      <g stroke="#20242c" strokeWidth="1" strokeDasharray="4 7">
        <line x1="118" y1="40" x2="118" y2="240" />
        <line x1="500" y1="40" x2="500" y2="240" />
      </g>

      <g fill="none" stroke="url(#gateway-path)" strokeWidth="2" strokeLinecap="round">
        <path d="M118 64 C 180 64, 215 116, 280 116" />
        <path d="M118 140 C 180 140, 220 140, 280 140" />
        <path d="M118 216 C 180 216, 215 164, 280 164" />
        <path d="M340 116 C 400 116, 430 76, 500 76" />
        <path d="M340 140 C 395 140, 420 140, 500 140" />
        <path d="M340 164 C 400 164, 430 204, 500 204" />
      </g>

      <g>
        <circle r="4" fill="#E879F9">
          <animateMotion dur="4.5s" repeatCount="indefinite" path="M118 140 C 180 140, 220 140, 280 140" />
        </circle>
        <circle r="4" fill="#67E8F9">
          <animateMotion dur="4.5s" begin="1.6s" repeatCount="indefinite" path="M340 140 C 395 140, 420 140, 500 140" />
        </circle>
      </g>

      <g transform="translate(18, 98)">
        <rect width="100" height="52" rx="12" fill="#0d0d11" stroke="#2a2d34" />
        <text x="50" y="22" fill="#f5f5f5" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono, monospace">APP</text>
        <text x="50" y="38" fill="#9ca3af" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono, monospace">CLIENT</text>
      </g>

      <g transform="translate(260, 92)">
        <rect width="80" height="96" rx="16" fill="#0d0d11" stroke="#E879F9" strokeOpacity="0.5" />
        <rect x="12" y="16" width="56" height="64" rx="10" fill="#111318" stroke="#313640" />
        <text x="40" y="42" fill="#f5f5f5" fontSize="11" textAnchor="middle" fontFamily="JetBrains Mono, monospace">SETU</text>
        <text x="40" y="56" fill="#b5b7c0" fontSize="8" textAnchor="middle" fontFamily="JetBrains Mono, monospace">GATEWAY</text>
      </g>

      <g transform="translate(500, 46)">
        <rect width="110" height="36" rx="10" fill="#111318" stroke="#2a2d34" />
        <g transform="translate(10 9) scale(0.75)">
          <path fill="#10A37F" d="M28.627 9.942c-.514-.356-1.18-.396-1.734-.1-1.077.581-2.023 1.34-2.81 2.234-.787.893-1.411 1.91-1.848 3.018-.436 1.108-.68 2.29-.724 3.493-.044 1.202.112 2.404.463 3.565.352 1.161.895 2.26 1.607 3.255.713.996 1.583 1.868 2.584 2.576 1.002.709 2.123 1.242 3.32 1.574 1.198.332 2.459.461 3.722.38 1.264-.081 2.515-.373 3.702-.868 1.187-.495 2.292-1.183 3.27-2.039.978-.856 1.814-1.87 2.472-3.003.658-1.134 1.127-2.373 1.385-3.676.258-1.303.303-2.651.133-3.978-.17-1.327-.557-2.617-1.144-3.822-.587-1.205-1.371-2.308-2.316-3.273-.946-.965-2.043-1.782-3.254-2.42-1.211-.639-2.522-1.088-3.882-1.332-1.36-.244-2.754-.282-4.137-.112-1.383.17-2.735.548-4.01 1.122-1.275.574-2.457 1.334-3.504 2.253Z" />
        </g>
        <text x="56" y="22" fill="#f5f5f5" fontSize="10" fontFamily="JetBrains Mono, monospace">OpenAI</text>
      </g>

      <g transform="translate(500, 120)">
        <rect width="110" height="36" rx="10" fill="#111318" stroke="#2a2d34" />
        <g transform="translate(10 9) scale(0.8)">
          <path fill="#D97706" d="M17.522 4.155h-4.322L5.86 21.845h4.156l1.722-4.522h7.622l1.722 4.522h4.311L17.522 4.155Zm-3.822 9.611 2.8-7.533 2.8 7.533h-5.6Z" />
        </g>
        <text x="56" y="22" fill="#f5f5f5" fontSize="10" fontFamily="JetBrains Mono, monospace">Anthropic</text>
      </g>

      <g transform="translate(500, 178)">
        <rect width="110" height="36" rx="10" fill="#111318" stroke="#2a2d34" />
        <g transform="translate(10 8) scale(0.7)">
          <path fill="#34A853" d="M46.5 8c-.52 0-1.03.08-1.52.24-.49.16-.94.4-1.35.71-.41.31-.75.68-1.04 1.1-.29.42-.49.9-.6 1.42-.11.52-.17 1.06-.17 1.63 0 .57.06 1.11.17 1.63.11.52.31 1 .6 1.42.29.42.63.79 1.04 1.1.41.31.86.55 1.35.71.49.16 1 .24 1.52.24.52 0 1.03-.08 1.52-.24.49-.16.94-.4 1.35-.71.41-.31.75-.68 1.04-1.1.29-.42.49-.9.6-1.42.11-.52.17-1.06.17-1.63 0-.57-.06-1.11-.17-1.63-.11-.52-.31-1-.6-1.42-.29-.42-.63-.79-1.04-1.1-.41-.31-.86-.55-1.35-.71-.49-.16-1-.24-1.52-.24Zm-15.74 1.79c-1.4 0-2.75.46-3.87 1.32C26.77 12.18 26 13.66 26 15.16c0 1.49.77 2.98 2.1 3.95 1.33.97 3.09 1.47 4.89 1.47 1.79 0 3.56-.5 5-1.47.22-.16.43-.33.63-.52l-4.9-4.9c-.65-.65-1.51-.98-2.36-.98-.85 0-1.71.33-2.36.98-.26.25-.47.54-.64.84l3.08 3.08c.53.53 1.39.53 1.91 0l1.11-1.12 1.61 1.61-.87.87c-.68.68-1.59 1.07-2.54 1.07s-1.86-.39-2.54-1.07c-.68-.68-1.07-1.59-1.07-2.54s.39-1.86 1.07-2.54c.68-.68 1.59-1.07 2.54-1.07.95 0 1.86.39 2.54 1.07l.86.86 1.61-1.61-.86-.86c-.45-.45-.96-.82-1.52-1.09-.57-.27-1.18-.4-1.82-.4Zm17.73-4.47h.67v3.95h-5.06v-3.95h.67v3.29h3.72v-3.29Z" />
        </g>
        <text x="56" y="22" fill="#f5f5f5" fontSize="10" fontFamily="JetBrains Mono, monospace">Gemini</text>
      </g>
    </svg>
  );
}

function AnalyticsGraphic() {
  return (
    <div className="story-analytics-shell">
      <div className="mini-metrics-row">
        <div className="mini-metric">
          <span className="label">Spend</span>
          <strong>$2,860</strong>
        </div>
        <div className="mini-metric">
          <span className="label">Requests</span>
          <strong>12.4k</strong>
        </div>
      </div>

      <div className="chart-card">
        <svg className="story-svg chart-svg" viewBox="0 0 420 180" aria-label="Usage chart">
          <g stroke="#1d2128" strokeWidth="1">
            <line x1="28" y1="140" x2="390" y2="140" />
            <line x1="28" y1="16" x2="28" y2="140" />
          </g>
          <g fill="none" stroke="#67E8F9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M28 126 C 70 120, 104 98, 138 72 S 200 38, 246 58 S 304 46, 340 78 S 366 62, 390 36" />
          </g>
          <g fill="#67E8F9">
            <circle cx="246" cy="58" r="4" />
            <circle cx="340" cy="78" r="4" />
          </g>
          <g fill="#f5f5f5" fontSize="9" fontFamily="JetBrains Mono, monospace">
            <text x="28" y="156">Jan</text>
            <text x="116" y="156">Feb</text>
            <text x="208" y="156">Mar</text>
            <text x="298" y="156">Apr</text>
          </g>
        </svg>
      </div>

      <div className="mini-grid">
        <div className="mini-panel">
          <span className="panel-label">Token usage</span>
          <strong>8.4M</strong>
        </div>
        <div className="mini-panel">
          <span className="panel-label">Avg latency</span>
          <strong>184ms</strong>
        </div>
        <div className="mini-panel">
          <span className="panel-label">Error rate</span>
          <strong>0.7%</strong>
        </div>
      </div>
    </div>
  );
}

function BudgetGraphic() {
  return (
    <div className="story-budget-shell">
      <div className="budget-head-row">
        <span className="mini-meta">project / prod-core</span>
        <span className="amber-tag">threshold 80%</span>
      </div>

      <div className="budget-total-row">
        <div>
          <span className="mini-meta">Budget</span>
          <strong>$100.00</strong>
        </div>
        <div>
          <span className="mini-meta">Spent</span>
          <strong>$78.40</strong>
        </div>
      </div>

      <div className="budget-track">
        <div className="budget-fill" style={{ width: "78.4%" }} />
        <div className="budget-threshold" style={{ left: "80%" }}>
          <span>80%</span>
        </div>
      </div>

      <div className="budget-footer-row">
        <span>Remaining: $21.60</span>
        <span>+ $4.80 today</span>
      </div>
    </div>
  );
}

function AlertsGraphic() {
  return (
    <div className="story-alert-shell">
      <div className="alert-flow">
        <div className="alert-node">Budget threshold</div>
        <div className="alert-arrow">→</div>
        <div className="alert-node">Alert event</div>
        <div className="alert-arrow">→</div>
        <div className="alert-node slack-node">Slack</div>
      </div>

      <div className="slack-preview">
        <div className="slack-topline">
          <span># setu-alerts</span>
          <span>today</span>
        </div>
        <div className="slack-message">
          <div className="slack-avatar">S</div>
          <div className="slack-copy">
            <div className="slack-author">
              Setu Budget Shield <span>APP</span>
            </div>
            <div className="slack-body">
              <span className="danger-pill">THRESHOLD 80% REACHED</span>
              <p>Project prod-core crossed budget threshold ($80.00 / $100.00).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogsGraphic() {
  const rows = [
    { time: "16:42:01", status: "200", provider: "openai/gpt-4o", latency: "142ms" },
    { time: "16:41:58", status: "200", provider: "anthropic/claude-3.5", latency: "210ms" },
    { time: "16:41:52", status: "429", provider: "google/gemini-pro", latency: "12ms" },
    { time: "16:41:40", status: "200", provider: "openai/gpt-4o-mini", latency: "94ms" },
  ];

  return (
    <div className="story-logs-shell">
      <div className="logs-header">
        <span>timestamp</span>
        <span>status</span>
        <span>provider</span>
        <span>latency</span>
      </div>
      {rows.map((row, index) => (
        <div key={row.time} className={`log-row ${index === 2 ? "is-active" : ""}`}>
          <span>{row.time}</span>
          <span className={row.status === "200" ? "ok-status" : "warn-status"}>{row.status}</span>
          <span>{row.provider}</span>
          <span>{row.latency}</span>
        </div>
      ))}

      <div className="log-detail-panel">
        <div className="detail-header">Request → /chat/completions</div>
        <div className="detail-meta">
          <span>model: openai/gpt-4o</span>
          <span>status: 200</span>
        </div>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="problem-solution-section features-story-section" id="toolkit">
      <motion.div
        className="problem-accent-line"
        initial={prefersReducedMotion ? false : { scaleX: 0, opacity: 0 }}
        whileInView={prefersReducedMotion ? undefined : { scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      />

      <div className="problem-solution-inner">
        <div className="problem-solution-copy">
          <p className="problem-solution-eyebrow">THE SETU TOOLKIT</p>
          <h2>The control layer your LLM stack was missing.</h2>
          <p className="problem-description">
            Everything you need to route requests, understand usage, and control
            spending across your LLM infrastructure.
          </p>
        </div>

        <div className="story-sequence">
          {features.map((feature, index) => (
            <motion.article
              key={feature.id}
              className="story-slide"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.35 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.04 }}
            >
              <div className="story-slide-inner">
                <div className="story-copy">
                  <span className="story-index">{feature.tag}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <div className="story-labels">
                    {feature.labels.map((label) => (
                      <span key={label} className="story-chip">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="story-visual">
                  <div className="visual-shell">
                    {feature.id === "gateway" && <GatewayGraphic />}
                    {feature.id === "analytics" && <AnalyticsGraphic />}
                    {feature.id === "budget" && <BudgetGraphic />}
                    {feature.id === "alerts" && <AlertsGraphic />}
                    {feature.id === "logs" && <LogsGraphic />}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <style>{`
        .features-story-section {
          background: #050505;
          padding-bottom: 32px;
        }

        .story-sequence {
          display: flex;
          flex-direction: column;
          gap: 32px;
          margin-top: 52px;
        }

        .story-slide {
          min-height: 80vh;
        }

        .story-slide-inner {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          align-items: center;
          gap: 40px;
          padding: clamp(24px, 3vw, 44px);
          background: rgba(11, 11, 15, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
        }

        .story-copy {
          max-width: 540px;
        }

        .story-index {
          display: inline-block;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #E879F9;
          margin-bottom: 18px;
        }

        .story-copy h3 {
          margin: 0;
          color: #f5f5f5;
          font-size: clamp(2.2rem, 3vw, 3.5rem);
          line-height: 1.02;
          letter-spacing: -0.055em;
          max-width: 540px;
        }

        .story-copy p {
          margin: 16px 0 0;
          color: #a7a7b1;
          font-size: 1.05rem;
          line-height: 1.7;
          max-width: 520px;
        }

        .story-labels {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
        }

        .story-chip {
          border: 1px solid rgba(148, 163, 184, 0.28);
          background: rgba(15, 17, 22, 0.9);
          color: #dfe1ec;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 8px 10px;
          border-radius: 0;
        }

        .story-visual {
          display: flex;
          justify-content: center;
        }

        .visual-shell {
          width: min(100%, 660px);
          min-height: 320px;
          border-radius: 0;
          border: 1px solid rgba(148, 163, 184, 0.16);
          background: linear-gradient(180deg, rgba(12, 12, 18, 0.96), rgba(9, 9, 12, 0.96));
          padding: 18px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
        }

        .story-svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        .story-analytics-shell {
          display: grid;
          gap: 20px;
          height: 100%;
        }

        .mini-metrics-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .mini-metric {
          flex: 1;
          background: rgba(19, 22, 31, 0.95);
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 0;
          padding: 14px 16px;
        }

        .mini-metric .label,
        .panel-label,
        .mini-meta {
          display: block;
          color: #8c8f99;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }

        .mini-metric strong,
        .mini-panel strong,
        .budget-total-row strong {
          display: block;
          margin-top: 8px;
          color: #f4f4f5;
          font-size: 1.4rem;
          letter-spacing: -0.04em;
        }

        .chart-card {
          background: rgba(15, 17, 22, 0.92);
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 0;
          padding: 12px 12px 8px;
        }

        .chart-svg {
          min-height: 160px;
        }

        .mini-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .mini-panel {
          background: rgba(15, 17, 22, 0.88);
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 0;
          padding: 12px 14px;
        }

        .story-budget-shell {
          display: grid;
          gap: 18px;
          height: 100%;
          padding: 8px 0;
        }

        .budget-head-row,
        .budget-total-row,
        .budget-footer-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }

        .amber-tag {
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(245, 158, 11, 0.45);
          background: rgba(245, 158, 11, 0.08);
          color: #f59e0b;
          font-family: "JetBrains Mono", monospace;
          font-size: 8px;
          letter-spacing: 0.08em;
          padding: 6px 8px;
          border-radius: 0;
          text-transform: uppercase;
        }

        .story-budget-shell strong {
          color: #f5f5f5;
          font-size: 1.7rem;
          letter-spacing: -0.06em;
        }

        .budget-track {
          position: relative;
          height: 16px;
          border-radius: 0;
          background: rgba(24, 27, 35, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.14);
          overflow: hidden;
        }

        .budget-fill {
          position: absolute;
          inset: 0 auto 0 0;
          border-radius: inherit;
          background: linear-gradient(90deg, #67E8F9 0%, #E879F9 70%, #F5C96B 100%);
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
          font-family: "JetBrains Mono", monospace;
          font-size: 8px;
          letter-spacing: 0.08em;
          white-space: nowrap;
          text-transform: uppercase;
        }

        .budget-footer-row {
          color: #c7c8cd;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.04em;
        }

        .story-alert-shell {
          display: grid;
          gap: 22px;
          height: 100%;
        }

        .alert-flow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .alert-node {
          border: 1px solid rgba(148, 163, 184, 0.22);
          background: rgba(13, 17, 23, 0.9);
          border-radius: 0;
          padding: 8px 14px;
          color: #f5f5f5;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .alert-arrow {
          color: #67E8F9;
          font-size: 20px;
          opacity: 0.85;
        }

        .slack-node {
          border-color: rgba(232, 121, 249, 0.4);
          color: #f5d9ff;
        }

        .slack-preview {
          background: rgba(10, 12, 16, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 0;
          padding: 16px;
        }

        .slack-topline {
          display: flex;
          justify-content: space-between;
          color: #8d919b;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .slack-message {
          display: flex;
          gap: 12px;
        }

        .slack-avatar {
          width: 32px;
          height: 32px;
          border-radius: 0;
          background: linear-gradient(135deg, #f5d9ff, #E879F9);
          color: #0c0d10;
          display: grid;
          place-items: center;
          font-family: "JetBrains Mono", monospace;
          font-weight: 700;
          flex-shrink: 0;
        }

        .slack-copy {
          flex: 1;
        }

        .slack-author {
          color: #f5f5f5;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          margin-bottom: 8px;
        }

        .slack-author span {
          display: inline-block;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(148, 163, 184, 0.18);
          padding: 2px 5px;
          border-radius: 0;
          color: #b9bcc7;
          margin-left: 6px;
          font-size: 8px;
        }

        .slack-body {
          background: rgba(26, 23, 31, 0.8);
          border: 1px solid rgba(248, 113, 113, 0.2);
          border-radius: 0;
          padding: 10px 12px;
        }

        .danger-pill {
          display: inline-block;
          color: #fca5a5;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(248, 113, 113, 0.25);
          border-radius: 0;
          padding: 4px 8px;
          font-family: "JetBrains Mono", monospace;
          font-size: 8px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .slack-body p {
          margin: 10px 0 0;
          color: #d8d9de;
          font-size: 12px;
          line-height: 1.5;
        }

        .story-logs-shell {
          display: grid;
          gap: 8px;
          background: rgba(10, 10, 14, 0.96);
          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 0;
          padding: 16px 14px 12px;
        }

        .logs-header,
        .log-row {
          display: grid;
          grid-template-columns: 1fr 70px minmax(120px, 1fr) 72px;
          gap: 12px;
          align-items: center;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .logs-header {
          color: #787d89;
          padding: 0 10px 8px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.12);
        }

        .log-row {
          padding: 10px 10px;
          color: #d3d5db;
          border-radius: 0;
          border: 1px solid transparent;
        }

        .log-row.is-active {
          background: rgba(232, 121, 249, 0.08);
          border-color: rgba(232, 121, 249, 0.2);
        }

        .ok-status {
          color: #5eead4;
        }

        .warn-status {
          color: #fca5a5;
        }

        .log-detail-panel {
          margin-top: 4px;
          background: rgba(18, 20, 26, 0.92);
          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 0;
          padding: 10px 12px;
          color: #dfe3ee;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
        }

        .detail-header {
          margin-bottom: 8px;
          color: #f5f5f5;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .detail-meta {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #93a2bd;
        }

        @media (max-width: 900px) {
          .story-slide {
            min-height: auto;
          }

          .story-slide-inner {
            grid-template-columns: 1fr;
            gap: 22px;
          }

          .story-copy h3 {
            font-size: clamp(2.1rem, 9vw, 3.2rem);
          }

          .story-copy {
            max-width: none;
          }

          .story-labels {
            gap: 8px;
          }

          .logs-header,
          .log-row {
            grid-template-columns: 1fr 60px 1fr 60px;
            font-size: 8px;
          }
        }
      `}</style>
    </section>
  );
}
