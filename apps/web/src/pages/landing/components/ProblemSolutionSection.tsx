import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { useRef, useState } from "react";

const features = ["Unified Routing", "Usage Visibility", "Budget Protection"];

// Refined, non-overlapping paths for Fragmented state (Direct independent routes)
const fragmentedPaths = [
  "M120 70 C 230 40, 420 50, 535 55", // App A -> OpenAI
  "M120 70 C 230 110, 420 95, 535 112", // App A -> Anthropic
  "M120 128 C 220 128, 430 128, 535 112", // App B -> Anthropic
  "M120 128 C 230 170, 420 160, 535 170", // App B -> Google Gemini
  "M120 186 C 230 140, 420 70, 535 55", // App C -> OpenAI
  "M120 186 C 230 200, 420 180, 535 170", // App C -> Google Gemini
];

// Refined Setu Gateway routing paths (Hub-and-Spoke: Apps -> Gateway -> Providers)
const setuGatewayPaths = [
  // Inputs to Gateway (Left side to Center)
  "M120 70 C 190 70, 220 128, 275 128",
  "M120 128 C 190 128, 220 128, 275 128",
  "M120 186 C 190 186, 220 128, 275 128",
  // Outputs from Gateway (Center to Right side)
  "M365 128 C 420 128, 450 55, 535 55",
  "M365 128 C 430 128, 430 112, 535 112",
  "M365 128 C 420 128, 450 170, 535 170",
];

const reveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function FlowParticle({ path, delay }: { path: string; delay: number }) {
  return (
    <circle r="2" fill="#E879F9">
      <animateMotion
        dur="4.5s"
        begin={`${delay}s`}
        repeatCount="indefinite"
        path={path}
      />
      <animate
        attributeName="opacity"
        values="0;0.9;0.9;0"
        keyTimes="0;0.15;0.85;1"
        dur="4.5s"
        begin={`${delay}s`}
        repeatCount="indefinite"
      />
    </circle>
  );
}

export default function ProblemSolutionSection() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const visualInView = useInView(visualRef, { amount: 0.2 });

  const [activeMode, setActiveMode] = useState<"fragmented" | "setu">("setu");

  const currentPaths =
    activeMode === "setu" ? setuGatewayPaths : fragmentedPaths;

  return (
    <section
      className="problem-solution-section"
      id="how-it-works"
      ref={sectionRef}
    >
      {/* Top section entry accent line matching benchmark style */}
      <motion.div
        className="problem-accent-line"
        initial={prefersReducedMotion ? false : { scaleX: 0, opacity: 0 }}
        whileInView={
          prefersReducedMotion ? undefined : { scaleX: 1, opacity: 1 }
        }
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      />

      <motion.div
        className="problem-solution-inner"
        initial={prefersReducedMotion ? false : "hidden"}
        whileInView={prefersReducedMotion ? undefined : "visible"}
        viewport={{ amount: 0.2 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {/* Section Header */}
        <motion.div className="problem-solution-copy" variants={reveal}>
          <div className="problem-header-row">
            <div>
              <p className="problem-solution-eyebrow">THE PROBLEM / SOLUTION</p>
              <h2>Your LLM infrastructure shouldn't be fragmented.</h2>
              <p className="problem-description">
                One gateway to route requests, track usage, and control spending
                across your LLM providers.
              </p>
            </div>

            {/* Mode Switcher Toggle */}
            <div className="architecture-mode-toggle" role="tablist">
              <button
                role="tab"
                aria-selected={activeMode === "fragmented"}
                onClick={() => setActiveMode("fragmented")}
                className={`mode-btn ${activeMode === "fragmented" ? "active-problem" : ""}`}
              >
                Fragmented
              </button>
              <button
                role="tab"
                aria-selected={activeMode === "setu"}
                onClick={() => setActiveMode("setu")}
                className={`mode-btn ${activeMode === "setu" ? "active-setu" : ""}`}
              >
                With Setu Gateway
              </button>
            </div>
          </div>
        </motion.div>

        {/* Graphic Architecture Diagram */}
        <motion.div
          ref={visualRef}
          className={`system-visual${visualInView ? " is-visible" : ""}`}
          variants={reveal}
        >
          <div className="system-visual-bar">
            <span className="visual-bar-title">
              {activeMode === "setu"
                ? "TOPOLOGY: UNIFIED GO GATEWAY ROUTING"
                : "TOPOLOGY: DIRECT FRAGMENTED CONNECTIONS"}
            </span>
            <span
              className={`visual-status-badge ${activeMode === "setu" ? "status-secured" : "status-warning"}`}
            >
              {activeMode === "setu"
                ? "● CENTRALIZED CONTROL"
                : "▲ DECENTRALIZED FRAGMENTATION"}
            </span>
          </div>

          <svg
            className="system-visual-canvas"
            viewBox="0 0 690 250"
            role="img"
            aria-label="Setu LLM gateway architecture diagram"
          >
            <defs>
              <linearGradient id="setu-flow-gradient" x1="0" x2="1">
                <stop offset="0" stopColor="#7C3AED" stopOpacity="0.4" />
                <stop offset="0.55" stopColor="#E879F9" />
                <stop offset="1" stopColor="#67E8F9" stopOpacity="0.6" />
              </linearGradient>

              <linearGradient id="fragmented-flow-gradient" x1="0" x2="1">
                <stop offset="0" stopColor="#71717a" stopOpacity="0.25" />
                <stop offset="1" stopColor="#52525b" stopOpacity="0.25" />
              </linearGradient>

              <filter id="setu-flow-glow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Subtle Clean Guidelines (Minimal grid replacement) */}
            <g className="system-grid" stroke="#16161b" strokeWidth="0.5">
              <line x1="120" y1="30" x2="120" y2="220" strokeDasharray="2 4" />
              <line x1="570" y1="30" x2="570" y2="220" strokeDasharray="2 4" />
              {activeMode === "setu" && (
                <line
                  x1="345"
                  y1="30"
                  x2="345"
                  y2="220"
                  strokeDasharray="2 4"
                  opacity="0.5"
                />
              )}
            </g>

            {/* Connecting Paths */}
            <g className="system-paths" fill="none">
              {currentPaths.map((path, index) => (
                <motion.path
                  key={`${activeMode}-${index}`}
                  d={path}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`diagram-path ${activeMode === "setu" ? "system-path-primary" : ""}`}
                  style={{
                    stroke:
                      activeMode === "setu"
                        ? "url(#setu-flow-gradient)"
                        : "url(#fragmented-flow-gradient)",
                    strokeWidth: activeMode === "setu" ? 1.5 : 1,
                    opacity: activeMode === "setu" ? 0.7 : 0.4,
                  }}
                />
              ))}
            </g>

            {/* Flow Particles (Active only in Setu Mode for performance/clarity) */}
            {!prefersReducedMotion && visualInView && activeMode === "setu" && (
              <g filter="url(#setu-flow-glow)">
                <FlowParticle path={setuGatewayPaths[0]} delay={0} />
                <FlowParticle path={setuGatewayPaths[1]} delay={1.2} />
                <FlowParticle path={setuGatewayPaths[2]} delay={2.4} />
                <FlowParticle path={setuGatewayPaths[3]} delay={0.6} />
                <FlowParticle path={setuGatewayPaths[4]} delay={1.8} />
                <FlowParticle path={setuGatewayPaths[5]} delay={3.0} />
              </g>
            )}

            {/* Left Clients / Applications */}
            <g className="system-endpoints">
              <g transform="translate(15, 52)">
                <rect width="105" height="36" rx="4" className="endpoint-box" />
                <text x="52.5" y="22">
                  App Service A
                </text>
              </g>
              <g transform="translate(15, 110)">
                <rect width="105" height="36" rx="4" className="endpoint-box" />
                <text x="52.5" y="22">
                  Agent Worker B
                </text>
              </g>
              <g transform="translate(15, 168)">
                <rect width="105" height="36" rx="4" className="endpoint-box" />
                <text x="52.5" y="22">
                  Client API C
                </text>
              </g>
            </g>

            {/* Right Providers with Official Brand Aesthetics & Logos */}
            <g className="system-endpoints">
              {/* OpenAI */}
              <g transform="translate(570, 38)">
                <rect width="105" height="34" rx="4" className="provider-box" />
                <g transform="translate(10, 9) scale(0.65)">
                  {/* Official OpenAI Spark/Logo vector mark */}
                  <path
                    fill="#10a37f"
                    d="M28.627 9.942c-.514-.356-1.18-.396-1.734-.1-1.077.581-2.023 1.34-2.81 2.234-.787.893-1.411 1.91-1.848 3.018-.436 1.108-.68 2.29-.724 3.493-.044 1.202.112 2.404.463 3.565.352 1.161.895 2.26 1.607 3.255.713.996 1.583 1.868 2.584 2.576 1.002.709 2.123 1.242 3.32 1.574 1.198.332 2.459.461 3.722.38 1.264-.081 2.515-.373 3.702-.868 1.187-.495 2.292-1.183 3.27-2.039.978-.856 1.814-1.87 2.472-3.003.658-1.134 1.127-2.373 1.385-3.676.258-1.303.303-2.651.133-3.978-.17-1.327-.557-2.617-1.144-3.822-.587-1.205-1.371-2.308-2.316-3.273-.946-.965-2.043-1.782-3.254-2.42-1.211-.639-2.522-1.088-3.882-1.332-1.36-.244-2.754-.282-4.137-.112-1.383.17-2.735.548-4.01 1.122-1.275.574-2.457 1.334-3.504 2.253Z"
                  />
                </g>
                <text x="62" y="22" textAnchor="start">
                  OpenAI
                </text>
              </g>

              {/* Anthropic */}
              <g transform="translate(570, 96)">
                <rect width="105" height="34" rx="4" className="provider-box" />
                <g transform="translate(10, 10) scale(0.65)">
                  {/* Official Anthropic Brand Mark */}
                  <path
                    fill="#d97706"
                    d="M17.522 4.155h-4.322L5.86 21.845h4.156l1.722-4.522h7.622l1.722 4.522h4.311L17.522 4.155Zm-3.822 9.611 2.8-7.533 2.8 7.533h-5.6Z"
                  />
                </g>
                <text x="62" y="22" textAnchor="start">
                  Anthropic
                </text>
              </g>

              {/* Google Gemini */}
              <g transform="translate(570, 154)">
                <rect width="105" height="34" rx="4" className="provider-box" />
                <g transform="translate(10, 9) scale(0.7)">
                  {/* Official Google Gemini Sparkle Icon */}
                  <path
                    fill="#1a73e8"
                    d="M19.5 0C19.5 10.77 10.77 19.5 0 19.5c10.77 0 19.5 8.73 19.5 19.5 0-10.77 8.73-19.5 19.5-19.5C28.23 19.5 19.5 10.77 19.5 0Z"
                  />
                </g>
                <text x="62" y="22" textAnchor="start">
                  Gemini
                </text>
              </g>
            </g>

            {/* Central Component (Setu Gateway Node or Direct Bypass Indicator) */}
            {activeMode === "setu" ? (
              <g className="system-gateway" transform="translate(265, 74)">
                {/* Clean engineering double-border container */}
                <rect
                  width="110"
                  height="102"
                  rx="6"
                  className="gateway-outer-rect"
                />
                <rect
                  x="5"
                  y="5"
                  width="100"
                  height="92"
                  rx="4"
                  className="gateway-inner-rect"
                />
                <text x="55" y="44" className="gateway-title">
                  SETU
                </text>
                <text x="55" y="62" className="gateway-subtitle">
                  GATEWAY
                </text>
                <line
                  x1="25"
                  y1="76"
                  x2="85"
                  y2="76"
                  stroke="rgba(232, 121, 249, 0.3)"
                  strokeWidth="1"
                />
                <text x="55" y="88" className="gateway-subtext">
                  PROXIED / GO
                </text>
              </g>
            ) : (
              <g
                className="system-fragmented-node"
                transform="translate(275, 95)"
              >
                <rect width="90" height="60" rx="4" className="fragment-box" />
                <text x="45" y="26" className="fragment-title">
                  DIRECT
                </text>
                <text x="45" y="42" className="fragment-subtitle">
                  UNMANAGED
                </text>
              </g>
            )}
          </svg>
        </motion.div>

        {/* 3-Column Benchmark-style Feature Highlights */}
        <div className="architecture-grid" aria-label="Setu features">
          {features.map((feature, idx) => (
            <motion.div
              className="architecture-card"
              key={feature}
              variants={reveal}
            >
              <p className="card-eyebrow">0{idx + 1} / CAPABILITY</p>
              <h3>{feature}</h3>
              <p className="card-desc">
                {idx === 0 &&
                  "Seamlessly route incoming traffic across OpenAI, Anthropic, and Google Gemini with zero downtime."}
                {idx === 1 &&
                  "Inspect token consumption, latency distribution, and cost per project in real time."}
                {idx === 2 &&
                  "Enforce strict atomic spending limits via Redis Lua to prevent bill shocks."}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p className="architecture-footnote" variants={reveal}>
          Built in Go for <span>maximum throughput</span> and sub-millisecond
          proxy intercept latency.
        </motion.p>
      </motion.div>

      <style>{`
        .problem-solution-section {
          position: relative;
          margin-left: clamp(20px, 6.5vw, 88px);
          margin-right: clamp(20px, 2.5vw, 32px);
          border-left: 1px solid #19191d;
          border-bottom: 1px solid #19191d;
          background: #050505;
          font-family: "Geist", sans-serif;
        }

        .problem-accent-line {
          position: absolute;
          top: -1px;
          left: 0;
          width: 100%;
          height: 1px;
          content: "";
          background: linear-gradient(
            90deg,
            transparent,
            rgba(232, 121, 249, 0.5) 42%,
            rgba(103, 232, 249, 0.25) 58%,
            transparent
          );
          opacity: 0.72;
          transform-origin: center;
        }

        .problem-solution-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: clamp(86px, 10vw, 136px) clamp(22px, 6vw, 96px) 72px;
        }

        .problem-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          flex-wrap: wrap;
        }

        .problem-solution-eyebrow {
          margin: 0 0 18px;
          color: #d98be9;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.16em;
        }

        .problem-solution-copy h2 {
          margin: 0;
          color: #f7f7f7;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 700;
          letter-spacing: -0.05em;
          line-height: 1.04;
          max-width: 700px;
        }

        .problem-description {
          max-width: 520px;
          margin: 20px 0 0;
          color: #8e8e98;
          font-size: 14px;
          line-height: 1.55;
        }

        /* Mode Switcher Toggle */
        .architecture-mode-toggle {
          display: flex;
          gap: 4px;
          background: #0e0e13;
          padding: 4px;
          border: 1px solid #202028;
        }

        .mode-btn {
          background: transparent;
          border: none;
          color: #73737d;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          padding: 8px 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mode-btn:hover {
          color: #d4d4d8;
        }

        .mode-btn.active-setu {
          background: rgba(232, 121, 249, 0.12);
          color: #f0abfc;
          border: 1px solid rgba(232, 121, 249, 0.3);
        }

        .mode-btn.active-problem {
          background: rgba(113, 113, 122, 0.15);
          color: #d4d4d8;
          border: 1px solid rgba(113, 113, 122, 0.3);
        }

        /* Architecture Visual Box */
        .system-visual {
          margin-top: 56px;
          border: 1px solid #1f1f28;
          background: #07070a;
        }

        .system-visual-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: #0b0a0f;
          border-bottom: 1px solid #1f1f28;
          flex-wrap: wrap;
          gap: 10px;
        }

        .visual-bar-title {
          font-family: "JetBrains Mono", monospace;
          font-size: 10.5px;
          letter-spacing: 0.1em;
          color: #8e8e98;
        }

        .visual-status-badge {
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          padding: 2px 8px;
        }

        .status-secured {
          color: #34D399;
          background: rgba(52, 211, 153, 0.1);
          border: 1px solid rgba(52, 211, 153, 0.25);
        }

        .status-warning {
          color: #a1a1aa;
          background: rgba(113, 113, 122, 0.1);
          border: 1px solid rgba(113, 113, 122, 0.25);
        }

        .system-visual-canvas {
          display: block;
          width: 100%;
          min-height: 250px;
          overflow: visible;
        }

        .diagram-path {
          stroke-width: 1.4;
          transition: stroke 0.3s ease, opacity 0.3s ease;
        }

        .system-path-primary {
          stroke-width: 1.8;
          filter: url(#setu-flow-glow);
        }

        /* SVG Node Styling */
        .endpoint-box {
          fill: #0c0b10;
          stroke: #22222a;
          stroke-width: 1;
        }

        .provider-box {
          fill: #0c0b10;
          stroke: #22222a;
          stroke-width: 1;
        }

        .system-endpoints text {
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.06em;
          fill: #d4d4d8;
          text-anchor: middle;
        }

        /* Gateway Art-Directed Geometry */
        .gateway-outer-rect {
          fill: #09080d;
          stroke: #E879F9;
          stroke-width: 1.2;
          filter: drop-shadow(0 0 12px rgba(232, 121, 249, 0.2));
        }

        .gateway-inner-rect {
          fill: #050505;
          stroke: rgba(232, 121, 249, 0.25);
          stroke-width: 1;
        }

        .gateway-title {
          font-family: "JetBrains Mono", monospace;
          font-size: 13px;
          font-weight: 700;
          fill: #f0abfc;
          text-anchor: middle;
          letter-spacing: 0.14em;
        }

        .gateway-subtitle {
          font-family: "JetBrains Mono", monospace;
          font-size: 8px;
          fill: #a1a1aa;
          text-anchor: middle;
          letter-spacing: 0.1em;
        }

        .gateway-subtext {
          font-family: "JetBrains Mono", monospace;
          font-size: 7px;
          fill: #67E8F9;
          text-anchor: middle;
          letter-spacing: 0.08em;
        }

        .fragment-box {
          fill: #0c0b10;
          stroke: #3f3f46;
          stroke-width: 1;
        }

        .fragment-title {
          font-family: "JetBrains Mono", monospace;
          font-size: 9.5px;
          fill: #d4d4d8;
          text-anchor: middle;
          letter-spacing: 0.08em;
          font-weight: 700;
        }

        .fragment-subtitle {
          font-family: "JetBrains Mono", monospace;
          font-size: 7px;
          fill: #71717a;
          text-anchor: middle;
          letter-spacing: 0.06em;
        }

        /* Benchmark Grid Section Below Diagram */
        .architecture-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          margin-top: 56px;
          border-top: 1px solid #202026;
          border-bottom: 1px solid #202026;
        }

        .architecture-card {
          min-width: 0;
          padding: 34px clamp(18px, 3.4vw, 48px) 38px;
        }

        .architecture-card + .architecture-card {
          border-left: 1px solid #202026;
        }

        .card-eyebrow {
          margin: 0 0 16px;
          color: #e879f9;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
        }

        .architecture-card h3 {
          margin: 0;
          color: #f7f7f7;
          font-family: "JetBrains Mono", monospace;
          font-size: clamp(20px, 2.2vw, 26px);
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.2;
        }

        .card-desc {
          margin: 16px 0 0;
          color: #73737d;
          font-size: 13px;
          line-height: 1.55;
        }

        .architecture-footnote {
          margin: 0;
          padding-top: 18px;
          border-top: 1px solid #202026;
          color: #686873;
          font-family: "Geist", sans-serif;
          font-size: 12px;
          line-height: 1.5;
        }

        .architecture-footnote span {
          color: #a7a7b0;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
        }

        @media (max-width: 700px) {
          .problem-solution-section {
            margin-left: 0;
            margin-right: 0;
          }

          .problem-solution-inner {
            padding: 72px 20px 52px;
          }

          .problem-solution-copy h2 {
            font-size: clamp(32px, 10vw, 44px);
          }

          .system-visual {
            margin-top: 40px;
            overflow-x: auto;
          }

          .system-visual-canvas {
            min-width: 620px;
          }

          .architecture-grid {
            grid-template-columns: repeat(2, 1fr);
            margin-top: 40px;
          }

          .architecture-card {
            padding: 26px 16px 30px;
          }

          .architecture-card:nth-child(3) {
            grid-column: 1 / -1;
            border-top: 1px solid #202026;
            border-left: 0;
          }
        }
      `}</style>
    </section>
  );
}
