import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";

/* ------------------------------------------------------------------
   One diagram, two states.
   Fragmented: every app reaches for every provider it needs, and the
   lines tangle. With Setu: the same six links are pulled through one
   gateway wall, so the apps only know one endpoint.
   The lines are the same objects in both states; they morph.
------------------------------------------------------------------- */

type Mode = "fragmented" | "setu";

const APPS = ["App Service A", "Agent Worker B", "Client API C"];
const PROVIDERS = ["OpenAI", "Anthropic", "Google Gemini"];

// viewBox is 400 x 300; rows sit at y = 50, 150, 250
const ROW_Y = [50, 150, 250];
const LINKS: [number, number][] = [
  [0, 0], // A -> OpenAI
  [0, 1], // A -> Anthropic
  [1, 1], // B -> Anthropic
  [1, 2], // B -> Gemini
  [2, 0], // C -> OpenAI
  [2, 2], // C -> Gemini
];
const ROUTED = 1; // the link that carries the cyan signal in Setu mode

const features = [
  {
    tag: "ROUTING",
    title: "Unified Routing",
    body: "Seamlessly route incoming traffic across OpenAI, Anthropic, and Google Gemini with zero downtime.",
  },
  {
    tag: "USAGE",
    title: "Usage Visibility",
    body: "Inspect token consumption, latency distribution, and cost per project in real time.",
  },
  {
    tag: "BUDGETS",
    title: "Budget Protection",
    body: "Enforce strict atomic spending limits via Redis Lua to prevent bill shocks.",
  },
];

const CAPTION: Record<Mode, string> = {
  fragmented: "Every app connects to every provider it needs.",
  setu: "Apps connect to one endpoint. Setu routes to the providers.",
};

const READOUT: Record<Mode, string> = {
  fragmented: "6 PROVIDER CONNECTIONS",
  setu: "1 GATEWAY ENDPOINT",
};

const ease = [0.16, 1, 0.3, 1] as const;

const reveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function buildPath(idx: number, t: number) {
  const [from, to] = LINKS[idx];
  const y1 = ROW_Y[from];
  const y2 = ROW_Y[to];
  // fragmented: the midpoint sits halfway between the two ends (lines cross).
  // setu: every midpoint is pulled into a tight bundle at the gateway.
  const ym = lerp((y1 + y2) / 2, 150 + (idx - 2.5) * 5, t).toFixed(1);
  return `M0 ${y1} C 100 ${y1} 110 ${ym} 200 ${ym} C 290 ${ym} 300 ${y2} 400 ${y2}`;
}

function Link({ idx, morph }: { idx: number; morph: MotionValue<number> }) {
  const d = useTransform(morph, (t) => buildPath(idx, t));
  const stroke = useTransform(morph, [0, 1], ["#30363D", "#565D66"]);
  return (
    <motion.path
      className="fs-link"
      d={d}
      style={{ stroke, "--i": idx } as unknown as CSSProperties}
    />
  );
}

export default function ProblemSolutionSection() {
  const reduceMotion = Boolean(useReducedMotion());
  const diagramRef = useRef<HTMLDivElement>(null);
  const seenOnce = useInView(diagramRef, { amount: 0.5, once: true });
  const visibleNow = useInView(diagramRef, { amount: 0.05 });
  const touched = useRef(false);

  const [mode, setMode] = useState<Mode>("fragmented");
  const morph = useMotionValue(0);

  const wallOpacity = useTransform(morph, [0, 0.45, 1], [0, 0, 1]);
  const wallScale = useTransform(morph, [0, 1], [0.7, 1]);

  // Reduced motion shows the finished state immediately.
  useEffect(() => {
    if (reduceMotion) setMode("setu");
  }, [reduceMotion]);

  // One orchestrated moment: the first time the diagram is seen it starts
  // tangled, then pulls itself through the gateway.
  useEffect(() => {
    if (!seenOnce || reduceMotion) return;
    const timer = window.setTimeout(() => {
      if (!touched.current) setMode("setu");
    }, 1300);
    return () => window.clearTimeout(timer);
  }, [seenOnce, reduceMotion]);

  useEffect(() => {
    const controls = animate(morph, mode === "setu" ? 1 : 0, {
      duration: reduceMotion ? 0 : 1.15,
      ease,
    });
    return () => controls.stop();
  }, [mode, morph, reduceMotion]);

  const choose = (next: Mode) => {
    touched.current = true;
    setMode(next);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      choose(mode === "setu" ? "fragmented" : "setu");
    }
  };

  const routedD = buildPath(ROUTED, 1);

  return (
    <section
      className="fs-section"
      id="how-it-works"
      data-chapter="02 / ARCHITECTURE"
    >
      <motion.div
        className="fs-inner"
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.15 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.div className="fs-header" variants={reveal}>
          <div className="fs-copy">
            <p className="fs-eyebrow">THE PROBLEM / SOLUTION</p>
            <h2>Your LLM infrastructure shouldn't be fragmented.</h2>
            <p className="fs-description">
              One gateway to route requests, track usage, and control spending
              across your LLM providers.
            </p>
          </div>

          <div
            className="fs-toggle"
            role="tablist"
            aria-label="Architecture view"
            onKeyDown={onKeyDown}
          >
            <span
              className={`fs-toggle-thumb${mode === "setu" ? " is-setu" : ""}`}
              aria-hidden="true"
            />
            <button
              type="button"
              role="tab"
              aria-selected={mode === "fragmented"}
              tabIndex={mode === "fragmented" ? 0 : -1}
              onClick={() => choose("fragmented")}
            >
              Fragmented
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "setu"}
              tabIndex={mode === "setu" ? 0 : -1}
              onClick={() => choose("setu")}
            >
              <i className="fs-toggle-dot" aria-hidden="true" />
              With Setu
            </button>
          </div>
        </motion.div>

        <motion.div variants={reveal}>
          <div
            ref={diagramRef}
            className={`fs-frame mode-${mode}${seenOnce ? " is-live" : ""}${visibleNow ? "" : " is-paused"}`}
          >
            <div className="fs-bar">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`c-${mode}`}
                  className="fs-caption"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  {CAPTION[mode]}
                </motion.p>
              </AnimatePresence>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`r-${mode}`}
                  className="fs-readout"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  <i aria-hidden="true" />
                  {READOUT[mode]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div
              className="fs-diagram"
              role="img"
              aria-label={
                mode === "setu"
                  ? "Three applications connect to one Setu gateway, which routes to OpenAI, Anthropic and Google Gemini."
                  : "Three applications each connect directly to several providers, creating six crossing connections."
              }
            >
              <div className="fs-col fs-col-apps">
                {APPS.map((name) => (
                  <span className="fs-node" key={name}>
                    {name}
                  </span>
                ))}
              </div>

              <div className="fs-stage">
                <svg
                  viewBox="0 0 400 300"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <g className="fs-links">
                    {LINKS.map((_, i) => (
                      <Link key={i} idx={i} morph={morph} />
                    ))}
                  </g>
                  <path className="fs-route" d={routedD} />
                  <path className="fs-pulse" d={routedD} pathLength={100} />
                </svg>

                <div className="fs-wall-pos" aria-hidden="true">
                  <motion.div
                    className="fs-wall"
                    style={{ opacity: wallOpacity, scaleY: wallScale }}
                  >
                    <span className="fs-wall-label">SETU GATEWAY</span>
                    <span className="fs-port" />
                  </motion.div>
                </div>
              </div>

              <div className="fs-col fs-col-providers">
                {PROVIDERS.map((name) => (
                  <span className="fs-node fs-node-provider" key={name}>
                    <i aria-hidden="true" />
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="fs-grid" aria-label="Setu features">
          {features.map((feature) => (
            <motion.div
              className="fs-card"
              key={feature.title}
              variants={reveal}
            >
              <p className="fs-card-tag">{feature.tag}</p>
              <h3>{feature.title}</h3>
              <p className="fs-card-body">{feature.body}</p>
              <span className="fs-card-rail" aria-hidden="true" />
            </motion.div>
          ))}
        </div>

        <motion.p className="fs-footnote" variants={reveal}>
          Built in Go for <span>maximum throughput</span> and sub-millisecond
          proxy intercept latency.
        </motion.p>
      </motion.div>

      <style>{`
        .fs-section {
          position: relative;
          margin-left: clamp(20px, 6.5vw, 88px);
          margin-right: clamp(20px, 2.5vw, 32px);
          border-left: 1px solid #19191d;
          border-bottom: 1px solid #19191d;
          background: #050505;
          font-family: "Geist", sans-serif;
        }

        .fs-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: clamp(80px, 10vw, 128px) clamp(22px, 6vw, 96px) 72px;
        }

        .fs-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 28px;
        }

        .fs-eyebrow {
          margin: 0 0 18px;
          color: #8f8f97;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.16em;
        }

        .fs-copy h2 {
          max-width: 700px;
          margin: 0;
          color: #f7f7f7;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 600;
          letter-spacing: -0.06em;
          line-height: 1.04;
        }

        .fs-description {
          max-width: 520px;
          margin: 20px 0 0;
          color: #969ba3;
          font-size: 14px;
          line-height: 1.6;
        }

        /* ---- toggle ---- */
        .fs-toggle {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-width: 270px;
          padding: 3px;
          border: 1px solid #202026;
          background: #0a0a0f;
        }

        .fs-toggle-thumb {
          position: absolute;
          top: 3px;
          bottom: 3px;
          left: 3px;
          width: calc(50% - 3px);
          border: 1px solid #3a4247;
          background: #15171b;
          transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .fs-toggle-thumb.is-setu { transform: translateX(100%); }

        .fs-toggle button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 36px;
          border: 0;
          background: transparent;
          color: #73737d;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          cursor: pointer;
          transition: color 250ms ease;
        }

        .fs-toggle button:hover { color: #c8d1d3; }
        .fs-toggle button[aria-selected="true"] { color: #f7f7f7; }
        .fs-toggle button:focus-visible { outline: 2px solid #f0abfc; outline-offset: 2px; }

        .fs-toggle-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #565d66;
          transition: background 300ms ease;
        }

        .fs-toggle button[aria-selected="true"] .fs-toggle-dot { background: #e879f9; }

        /* ---- diagram frame ---- */
        .fs-frame {
          margin-top: 56px;
          border: 1px solid #1f1f28;
          background: #07070a;
        }

        .fs-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px 20px;
          min-height: 46px;
          padding: 8px 20px;
          border-bottom: 1px solid #1f1f28;
          background: #0a0a0f;
        }

        .fs-caption { margin: 0; color: #a1a1aa; font-size: 13px; }

        .fs-readout {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          color: #8f8f97;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
        }

        .fs-readout i {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #565d66;
        }

        .mode-setu .fs-readout { color: #c8d1d3; }
        .mode-setu .fs-readout i { background: #5eead4; }

        .fs-diagram {
          display: grid;
          grid-template-columns: 168px minmax(0, 1fr) 168px;
          height: 300px;
        }

        .fs-col {
          display: grid;
          grid-template-rows: repeat(3, 1fr);
          align-items: center;
        }

        .fs-col-apps { padding-left: 20px; }
        .fs-col-providers { padding-right: 20px; }

        .fs-node {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 40px;
          padding: 0 12px;
          overflow: hidden;
          border: 1px solid #27272d;
          background: #0d0d11;
          color: #e4e4e7;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          white-space: nowrap;
        }

        .fs-node-provider i {
          flex: 0 0 auto;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #565d66;
          transition: background 500ms ease 600ms;
        }

        .mode-setu .fs-node-provider i { background: #5eead4; }

        .fs-stage { position: relative; min-width: 0; }

        .fs-stage svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .fs-link {
          fill: none;
          stroke-width: 1;
          vector-effect: non-scaling-stroke;
          opacity: 0;
        }

        .is-live .fs-link {
          animation: fs-in 900ms ease forwards;
          animation-delay: calc(var(--i) * 90ms);
        }

        .fs-route {
          fill: none;
          stroke: #67e8f9;
          stroke-width: 1.2;
          stroke-opacity: 0;
          vector-effect: non-scaling-stroke;
          transition: stroke-opacity 600ms ease;
        }

        .mode-setu .fs-route { stroke-opacity: 0.45; transition-delay: 800ms; }

        .fs-pulse {
          fill: none;
          stroke: #a5f3fc;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-dasharray: 3 97;
          stroke-dashoffset: 3;
          vector-effect: non-scaling-stroke;
          opacity: 0;
        }

        .mode-setu.is-live .fs-pulse {
          animation: fs-travel 5.5s cubic-bezier(0.45, 0, 0.2, 1) 1.8s infinite;
        }

        .fs-wall-pos {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 44px;
          margin-left: -22px;
        }

        .fs-wall {
          position: relative;
          height: 100%;
          border-right: 1px solid #3a4247;
          border-left: 1px solid #3a4247;
          background: #0d0d11;
        }

        .fs-wall-label {
          position: absolute;
          top: 50%;
          left: 50%;
          color: #686873;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.16em;
          white-space: nowrap;
          transform: translate(-50%, -50%) rotate(-90deg);
        }

        /* the one orchid mark: the gateway's port */
        .fs-port {
          position: absolute;
          top: 50%;
          right: -2px;
          width: 3px;
          height: 24px;
          background: #e879f9;
          transform: translateY(-50%);
        }

        .fs-frame.is-paused * { animation-play-state: paused !important; }

        @keyframes fs-in { to { opacity: 1; } }
        @keyframes fs-travel {
          0% { stroke-dashoffset: 3; opacity: 0.95; }
          70% { stroke-dashoffset: -97; opacity: 0.95; }
          72%, 100% { stroke-dashoffset: -97; opacity: 0; }
        }

        /* ---- capabilities ledger ---- */
        .fs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          margin-top: 56px;
          border-top: 1px solid #202026;
          border-bottom: 1px solid #202026;
        }

        .fs-card {
          position: relative;
          min-width: 0;
          padding: 32px clamp(18px, 3.4vw, 48px) 38px;
          transition: background 300ms ease;
        }

        .fs-card:hover { background: #08080b; }
        .fs-card + .fs-card { border-left: 1px solid #202026; }

        .fs-card-tag {
          margin: 0 0 18px;
          color: #8f8f97;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
        }

        .fs-card h3 {
          margin: 0;
          color: #f7f7f7;
          font-size: clamp(20px, 2.1vw, 26px);
          font-weight: 600;
          letter-spacing: -0.045em;
          line-height: 1.15;
        }

        .fs-card-body {
          margin: 14px 0 0;
          color: #8f8f97;
          font-size: 13px;
          line-height: 1.6;
        }

        /* a cyan hairline draws across the top edge of the hovered card */
        .fs-card-rail {
          position: absolute;
          top: -1px;
          right: 0;
          left: 0;
          height: 1px;
          background: #67e8f9;
          opacity: 0.7;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .fs-card:hover .fs-card-rail { transform: scaleX(1); }

        .fs-footnote {
          margin: 0;
          padding-top: 18px;
          color: #686873;
          font-size: 12px;
          line-height: 1.5;
        }

        .fs-footnote span {
          color: #a7a7b0;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
        }

        @media (max-width: 860px) {
          .fs-diagram { grid-template-columns: 138px minmax(0, 1fr) 138px; }
          .fs-node { font-size: 10px; padding: 0 10px; }
        }

        @media (max-width: 700px) {
          .fs-section { margin-left: 0; margin-right: 0; border-left: 0; }
          .fs-inner { padding: 72px 20px 52px; }
          .fs-copy h2 { font-size: clamp(32px, 10vw, 44px); }
          .fs-toggle { width: 100%; }
          .fs-frame { margin-top: 40px; }
          .fs-bar { padding: 10px 14px; }
          .fs-diagram { grid-template-columns: 104px minmax(0, 1fr) 104px; height: 260px; }
          .fs-col-apps { padding-left: 8px; }
          .fs-col-providers { padding-right: 8px; }
          .fs-node { height: 36px; gap: 6px; padding: 0 8px; font-size: 9px; }
          .fs-node-provider i { display: none; }
          .fs-wall-pos { width: 30px; margin-left: -15px; }
          .fs-wall-label { font-size: 8px; }

          .fs-grid { grid-template-columns: repeat(2, 1fr); margin-top: 40px; }
          .fs-card { padding: 26px 16px 30px; }
          .fs-card:nth-child(3) { grid-column: 1 / -1; border-top: 1px solid #202026; border-left: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .fs-link { opacity: 1; animation: none !important; }
          .fs-pulse { animation: none !important; opacity: 0; }
          .fs-toggle-thumb,
          .fs-card-rail { transition: none; }
        }
      `}</style>
    </section>
  );
}
