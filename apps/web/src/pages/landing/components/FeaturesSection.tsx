import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type TargetAndTransition,
  type Variants,
} from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------
   Chapter 03 / TOOLKIT
   Desktop: a pinned stage. Scrolling moves a single marker down a rail
   and one capability is dominant at a time. Copy and visual enter and
   leave together, direction-aware, so reverse scroll restores cleanly.
   Mobile / reduced motion: a plain vertical sequence, same content.

   Perf notes
   - React state changes only when the active index changes (4 times
     across the whole section). The rail itself runs on MotionValues.
   - Visuals animate with CSS transforms/opacity and only while active.
   - Counters write to the DOM directly and stop themselves.
------------------------------------------------------------------- */

type State = "future" | "active" | "past";
type FeatureId = "gateway" | "analytics" | "budget" | "alerts" | "logs";

type Feature = {
  id: FeatureId;
  n: string;
  tag: string;
  name: string;
  title: string[];
  description: string;
  specs: string[];
  fig: string;
  readout: string;
  rgb: string; // background accent, "r g b"
  alt: string;
};

const FEATURES: Feature[] = [
  {
    id: "gateway",
    n: "01",
    tag: "REQUEST ROUTING",
    name: "Unified LLM Gateway",
    title: ["One gateway.", "Multiple models."],
    description:
      "Route requests to different AI providers through one unified gateway.",
    specs: ["OpenAI", "Anthropic", "Google Gemini"],
    fig: "ROUTING",
    readout: "DIAGRAM",
    rgb: "103 232 249",
    alt: "Three applications send requests to one Setu gateway, which routes them to OpenAI, Anthropic and Google Gemini.",
  },
  {
    id: "analytics",
    n: "02",
    tag: "USAGE & COST",
    name: "Usage & Cost Analytics",
    title: ["Every token", "tells a story."],
    description:
      "Understand API consumption, usage patterns, and spending across projects.",
    specs: ["Spend", "Requests", "Tokens"],
    fig: "ANALYTICS",
    readout: "SAMPLE DATA",
    rgb: "96 165 250",
    alt: "Sample analytics: spend and request trends over 30 days, and spend by project.",
  },
  {
    id: "budget",
    n: "03",
    tag: "BUDGET CONTROLS",
    name: "Budget Controls",
    title: ["Set limits.", "Stay in control."],
    description: "Set project budgets and maintain control over LLM spending.",
    specs: ["Project budgets", "Thresholds", "Remaining"],
    fig: "BUDGETS",
    readout: "SAMPLE DATA",
    rgb: "245 185 75",
    alt: "A sample project budget bar filling toward an 80 percent threshold marker.",
  },
  {
    id: "alerts",
    n: "04",
    tag: "SLACK ALERTS",
    name: "Slack Alerts",
    title: ["Know when spending", "crosses the line."],
    description:
      "Get notified when project spending reaches configured thresholds.",
    specs: ["Thresholds", "Slack"],
    fig: "ALERTS",
    readout: "ILLUSTRATIVE",
    rgb: "232 121 249",
    alt: "A budget threshold is reached and an alert message appears in a Slack channel.",
  },
  {
    id: "logs",
    n: "05",
    tag: "REQUEST LOGS",
    name: "Request Logs",
    title: ["Follow", "every request."],
    description:
      "Inspect API requests and understand what happened across your gateway.",
    specs: ["Status", "Provider", "Latency"],
    fig: "LOGS",
    readout: "SAMPLE DATA",
    rgb: "94 234 212",
    alt: "A table of sample request logs with time, status, provider and latency, and a detail panel for the selected request.",
  },
];

const N = FEATURES.length;
const NAV = 68; // height of the site nav the stage pins beneath

/* Brand marks. Paths from simple-icons (Anthropic, Google Gemini) and
   simple-icons v13 (OpenAI, Slack, which newer releases dropped).
   Slack is split into its four official colours. */
const ICON = {
  openai:
    "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
  anthropic:
    "M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z",
  gemini:
    "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81",
};

const SLACK = [
  {
    c: "#E01E5A",
    d: "M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z",
  },
  {
    c: "#36C5F0",
    d: "M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z",
  },
  {
    c: "#2EB67D",
    d: "M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z",
  },
  {
    c: "#ECB22E",
    d: "M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;
const v = (o: Record<string, string | number>) => o as unknown as CSSProperties;

/* ---------------------------- motion variants --------------------- */

const reveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

// Copy: direction-aware. "future" waits below, "past" has left upward.
const copyV: Variants = {
  future: {},
  active: { transition: { staggerChildren: 0.08, delayChildren: 0.16 } },
  past: {},
};

const tagV: Variants = {
  future: { opacity: 0, x: -14, transition: { duration: 0.3, ease } },
  active: { opacity: 1, x: 0, transition: { duration: 0.6, ease } },
  past: { opacity: 0, x: 14, transition: { duration: 0.3, ease } },
};

const lineV: Variants = {
  future: { y: "112%", transition: { duration: 0.4, ease } },
  active: { y: "0%", transition: { duration: 0.9, ease } },
  past: { y: "-112%", transition: { duration: 0.4, ease } },
};

const fadeV: Variants = {
  future: { opacity: 0, y: 18, transition: { duration: 0.3, ease } },
  active: { opacity: 1, y: 0, transition: { duration: 0.75, ease } },
  past: { opacity: 0, y: -18, transition: { duration: 0.3, ease } },
};

// Visuals: each capability has its own entrance.
const mk = (
  future: TargetAndTransition,
  active: TargetAndTransition,
  past: TargetAndTransition,
): Record<State, TargetAndTransition> => ({
  future: { ...future, transition: { duration: 0.4, ease } },
  active: { ...active, transition: { duration: 0.9, ease, delay: 0.12 } },
  past: { ...past, transition: { duration: 0.4, ease } },
});

const OPEN = "inset(0% 0% 0% 0%)";

const VIZ_MOTION: Record<FeatureId, Record<State, TargetAndTransition>> = {
  // the diagram resolves from slightly out of focus depth
  gateway: mk(
    { opacity: 0, scale: 0.94 },
    { opacity: 1, scale: 1 },
    { opacity: 0, scale: 1.06 },
  ),
  // a chart panel lifts into view and is unmasked from the top
  analytics: mk(
    { opacity: 0, y: 40, clipPath: "inset(14% 0% 0% 0%)" },
    { opacity: 1, y: 0, clipPath: OPEN },
    { opacity: 0, y: -28, clipPath: "inset(0% 0% 14% 0%)" },
  ),
  // the budget slides in from the side, like a gauge being pulled in
  budget: mk(
    { opacity: 0, x: 64 },
    { opacity: 1, x: 0 },
    { opacity: 0, x: -64 },
  ),
  // a notification drops in from above
  alerts: mk(
    { opacity: 0, y: -32, scale: 0.98 },
    { opacity: 1, y: 0, scale: 1 },
    { opacity: 0, y: 32, scale: 0.98 },
  ),
  // the log table is scanned open left to right
  logs: mk(
    { opacity: 0, clipPath: "inset(0% 100% 0% 0%)" },
    { opacity: 1, clipPath: OPEN },
    { opacity: 0, clipPath: "inset(0% 0% 0% 100%)" },
  ),
};

/* ------------------------------ hooks ----------------------------- */

function useMedia(query: string) {
  const [match, setMatch] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

/* ------------------------------ counter --------------------------- */

function Count({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  on,
  anim,
  delay = 0.4,
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  on: boolean;
  anim: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const fmt = (n: number) =>
      `${prefix}${n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;
    if (!on || !anim) {
      node.textContent = fmt(to);
      return;
    }
    node.textContent = fmt(0);
    const c = animate(0, to, {
      duration: 1.4,
      delay,
      ease,
      onUpdate: (n) => {
        node.textContent = fmt(n);
      },
    });
    return () => c.stop();
  }, [on, anim, to, decimals, prefix, suffix, delay]);
  // Final value is the first render, so there is no layout shift.
  return (
    <span ref={ref}>
      {`${prefix}${to.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`}
    </span>
  );
}

/* ------------------------------ visuals --------------------------- */

type VizProps = { on: boolean; anim: boolean };

function VizShell({
  id,
  on,
  anim,
  paused,
  alt,
  children,
}: {
  id: FeatureId;
  on: boolean;
  anim: boolean;
  paused: boolean;
  alt: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`tk-viz tk-viz-${id}${anim ? " is-anim" : ""}${on ? " is-on" : ""}${paused ? " is-paused" : ""}`}
      role="img"
      aria-label={alt}
    >
      {children}
    </div>
  );
}

/* 01 — gateway: apps -> one wall -> providers */
const GW_Y = [87, 190, 293];
const GW_APPS = ["App Service", "Agent Worker", "Client API"];
const GW_PROVIDERS = [
  { name: "OpenAI", path: ICON.openai, fill: "#f7f7f7" },
  { name: "Anthropic", path: ICON.anthropic, fill: "#d97757" },
  { name: "Google Gemini", path: ICON.gemini, fill: "url(#tk-gem)" },
];
// pulses alternate: request in, then out to a provider
const GW_PULSES: { side: "L" | "R"; k: number; d: number }[] = [
  { side: "L", k: 0, d: 0 },
  { side: "R", k: 0, d: 1.3 },
  { side: "L", k: 1, d: 2 },
  { side: "R", k: 1, d: 3.3 },
  { side: "L", k: 2, d: 4 },
  { side: "R", k: 2, d: 5.3 },
];

function GatewayViz() {
  const L = GW_Y.map(
    (y, k) => `M152 ${y} C 216 ${y} 238 ${182 + k * 8} 300 ${182 + k * 8}`,
  );
  const R = GW_Y.map(
    (y, k) => `M340 ${182 + k * 8} C 402 ${182 + k * 8} 424 ${y} 488 ${y}`,
  );
  return (
    <svg
      className="tk-gw"
      viewBox="0 0 640 380"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tk-gem" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#4796e3" />
          <stop offset="0.55" stopColor="#9177c7" />
          <stop offset="1" stopColor="#ca6673" />
        </linearGradient>
      </defs>

      <g className="tk-a" style={v({ "--i": 0 })}>
        <text x="24" y="32" className="tk-svg-tag">
          REQUESTS
        </text>
        <text x="616" y="32" textAnchor="end" className="tk-svg-tag">
          PROVIDERS
        </text>
        <text x="320" y="364" textAnchor="middle" className="tk-svg-tag">
          ONE ENDPOINT
        </text>
      </g>

      {[...L, ...R].map((d, i) => (
        <path
          key={d}
          d={d}
          pathLength={1}
          className="tk-draw tk-gw-link"
          style={v({ "--i": i })}
        />
      ))}

      {GW_PULSES.map((p) => (
        <path
          key={`${p.side}${p.k}`}
          d={p.side === "L" ? L[p.k] : R[p.k]}
          pathLength={100}
          className="tk-pulse"
          style={v({ "--pd": `${p.d}s` })}
        />
      ))}

      {GW_APPS.map((name, k) => (
        <g key={name} className="tk-a" style={v({ "--i": k })}>
          <rect
            x="24"
            y={GW_Y[k] - 18}
            width="128"
            height="36"
            className="tk-svg-node"
          />
          <text x="38" y={GW_Y[k] + 3.5} className="tk-svg-name">
            {name}
          </text>
        </g>
      ))}

      <g className="tk-a" style={v({ "--i": 3 })}>
        <rect x="300" y="40" width="40" height="300" fill="#0d0d11" />
        <line x1="300.5" y1="40" x2="300.5" y2="340" stroke="#3a4247" />
        <line x1="339.5" y1="40" x2="339.5" y2="340" stroke="#3a4247" />
        <rect x="337.5" y="176" width="3" height="28" fill="#dce5e9" />
        <text
          x="320"
          y="193.5"
          textAnchor="middle"
          transform="rotate(-90 320 190)"
          className="tk-svg-tag tk-svg-wall"
        >
          SETU GATEWAY
        </text>
      </g>

      {GW_PROVIDERS.map((p, k) => (
        <g key={p.name} className="tk-a" style={v({ "--i": k + 4 })}>
          <rect
            x="488"
            y={GW_Y[k] - 20}
            width="128"
            height="40"
            className="tk-svg-node"
          />
          <path
            d={p.path}
            fill={p.fill}
            transform={`translate(502 ${GW_Y[k] - 8}) scale(0.667)`}
          />
          <text x="530" y={GW_Y[k] + 3.5} className="tk-svg-name">
            {p.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* 02 — analytics: sample trend + spend by project */
const PROJECTS: [string, string, number][] = [
  ["prod-core", "$1,420", 100],
  ["agent-evals", "$890", 62.7],
  ["internal-tools", "$550", 38.7],
];
const SPEND_LINE =
  "M0 152 C 36 150 62 128 104 120 S 168 130 208 100 S 268 62 318 76 S 384 44 432 54 S 508 26 560 20";
const REQ_LINE =
  "M0 166 C 48 160 78 150 120 142 S 190 128 232 118 S 300 108 346 96 S 420 92 470 78 S 530 66 560 58";

function AnalyticsViz({ on, anim }: VizProps) {
  return (
    <>
      <div className="tk-an-metrics tk-a" style={v({ "--i": 0 })}>
        <div className="tk-an-metric">
          <p className="tk-lbl">SPEND</p>
          <p className="tk-val">
            <Count to={2860} prefix="$" on={on} anim={anim} delay={0.45} />
          </p>
        </div>
        <div className="tk-an-metric">
          <p className="tk-lbl">REQUESTS</p>
          <p className="tk-val">
            <Count
              to={12.4}
              decimals={1}
              suffix="k"
              on={on}
              anim={anim}
              delay={0.55}
            />
          </p>
        </div>
        <div className="tk-an-metric">
          <p className="tk-lbl">TOKENS</p>
          <p className="tk-val">
            <Count
              to={8.4}
              decimals={1}
              suffix="M"
              on={on}
              anim={anim}
              delay={0.65}
            />
          </p>
        </div>
      </div>

      <div className="tk-an-chart tk-a" style={v({ "--i": 1 })}>
        <div className="tk-an-legend">
          <span>
            <i className="tk-sw tk-sw-cyan" />
            SPEND
          </span>
          <span>
            <i className="tk-sw tk-sw-blue" />
            REQUESTS
          </span>
          <em>LAST 30 DAYS</em>
        </div>
        <div className="tk-an-plot">
          <svg
            viewBox="0 0 560 190"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="tk-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#67e8f9" stopOpacity="0.2" />
                <stop offset="1" stopColor="#67e8f9" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[38, 76, 114, 152].map((y) => (
              <line key={y} x1="0" x2="560" y1={y} y2={y} className="tk-grid" />
            ))}
            <path
              d={`${SPEND_LINE} L560 190 L0 190 Z`}
              fill="url(#tk-area)"
              className="tk-a tk-an-area"
              style={v({ "--i": 6 })}
            />
            <path
              d={REQ_LINE}
              pathLength={1}
              className="tk-draw tk-an-req"
              style={v({ "--i": 1 })}
            />
            <path
              d={SPEND_LINE}
              pathLength={1}
              className="tk-draw tk-an-spend"
              style={v({ "--i": 3 })}
            />
          </svg>
          <span className="tk-an-dot" />
        </div>
        <div className="tk-an-axis">
          <span>DAY 1</span>
          <span>DAY 8</span>
          <span>DAY 15</span>
          <span>DAY 22</span>
          <span>DAY 30</span>
        </div>
      </div>

      <div className="tk-an-projects tk-a" style={v({ "--i": 2 })}>
        <p className="tk-lbl">SPEND BY PROJECT</p>
        {PROJECTS.map(([name, amount, w], i) => (
          <div className="tk-an-prow" key={name}>
            <span>{name}</span>
            <div className="tk-an-track">
              <i
                className="tk-bar-fill"
                style={v({ "--w": `${w}%`, "--i": i, opacity: 1 - i * 0.28 })}
              />
            </div>
            <span>{amount}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* 03 — budget: usage fills toward the threshold */
const BUDGET = 100;
const SPENT = 78.4;

function BudgetViz({ on, anim }: VizProps) {
  const root = useRef<HTMLDivElement>(null);
  const spent = useRef<HTMLSpanElement>(null);
  const rem = useRef<HTMLSpanElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLElement>(null);

  useEffect(() => {
    const paint = (n: number) => {
      if (spent.current) spent.current.textContent = `$${n.toFixed(2)}`;
      if (rem.current) rem.current.textContent = `$${(BUDGET - n).toFixed(2)}`;
      if (pct.current) pct.current.textContent = `${n.toFixed(1)}%`;
      if (fill.current)
        fill.current.style.clipPath = `inset(0 ${100 - n}% 0 0)`;
      if (root.current) root.current.dataset.state = n >= 62 ? "warn" : "ok";
    };
    if (!on || !anim) {
      paint(SPENT);
      return;
    }
    paint(0);
    const c = animate(0, SPENT, {
      duration: 2.4,
      delay: 0.55,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: paint,
    });
    return () => c.stop();
  }, [on, anim]);

  return (
    <div className="tk-bg" ref={root} data-state="warn">
      <div className="tk-bg-head tk-a" style={v({ "--i": 0 })}>
        <span className="tk-lbl">PROJECT / PROD-CORE</span>
        <span className="tk-bg-state">
          <span className="tk-bg-ok">ON TRACK</span>
          <span className="tk-bg-warn">APPROACHING THRESHOLD</span>
        </span>
      </div>

      <div className="tk-bg-big tk-a" style={v({ "--i": 1 })}>
        <p className="tk-bg-spent">
          <span ref={spent}>$78.40</span>
        </p>
        <p className="tk-bg-pct">
          <span ref={pct}>78.4%</span>
          <small>OF BUDGET</small>
        </p>
      </div>

      <div className="tk-bg-meter tk-a" style={v({ "--i": 2 })}>
        <div className="tk-bg-flag" style={{ left: "80%" }}>
          <span>THRESHOLD 80%</span>
        </div>
        <div className="tk-bg-track">
          <i className="tk-bg-fill" ref={fill} />
          <b className="tk-bg-mark" style={{ left: "80%" }} />
        </div>
        <div className="tk-bg-scale">
          <span>$0</span>
          <span>$100</span>
        </div>
      </div>

      <div className="tk-an-metrics tk-a" style={v({ "--i": 3 })}>
        <div className="tk-an-metric">
          <p className="tk-lbl">BUDGET</p>
          <p className="tk-val tk-val-sm">$100.00</p>
        </div>
        <div className="tk-an-metric">
          <p className="tk-lbl">THRESHOLD</p>
          <p className="tk-val tk-val-sm">$80.00</p>
        </div>
        <div className="tk-an-metric">
          <p className="tk-lbl">REMAINING</p>
          <p className="tk-val tk-val-sm">
            <span ref={rem}>$21.60</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* 04 — alerts: threshold reached, Slack message arrives */
function AlertsViz() {
  return (
    <div className="tk-al">
      <div className="tk-al-meter tk-a" style={v({ "--i": 0 })}>
        <div className="tk-bg-head">
          <span className="tk-lbl">PROJECT / PROD-CORE</span>
          <span className="tk-al-hit">THRESHOLD 80% REACHED</span>
        </div>
        <div className="tk-bg-track tk-al-track">
          <i className="tk-al-fill" />
          <b className="tk-bg-mark tk-al-mark" style={{ left: "80%" }} />
        </div>
        <div className="tk-bg-scale">
          <span>$0</span>
          <span>$80.00 / $100.00</span>
        </div>
      </div>

      <div className="tk-al-wire" aria-hidden="true">
        <i className="tk-al-wire-line" />
        <i className="tk-al-wire-dot" />
      </div>

      <div className="tk-sl">
        <div className="tk-sl-top">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {SLACK.map((s) => (
              <path key={s.c} d={s.d} fill={s.c} />
            ))}
          </svg>
          <span>Slack</span>
          <em># setu-alerts</em>
        </div>
        <div className="tk-sl-msg">
          <div className="tk-sl-av">S</div>
          <div className="tk-sl-copy">
            <p className="tk-sl-name">
              <b>Setu</b>
              <span>APP</span>
              <time>now</time>
            </p>
            <span className="tk-sl-pill">THRESHOLD 80% REACHED</span>
            <p className="tk-sl-text">
              Project prod-core crossed its budget threshold.
            </p>
            <p className="tk-sl-meta">$80.00 / $100.00</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 05 — logs: request rows, one selected, detail follows */
type LogRow = { t: string; s: number; p: string; ms: number };
const LOG_ROWS: LogRow[] = [
  { t: "16:42:07", s: 200, p: "OpenAI", ms: 142 },
  { t: "16:42:03", s: 200, p: "Anthropic", ms: 210 },
  { t: "16:41:58", s: 429, p: "Google Gemini", ms: 12 },
  { t: "16:41:52", s: 200, p: "OpenAI", ms: 94 },
  { t: "16:41:47", s: 200, p: "Google Gemini", ms: 187 },
  { t: "16:41:40", s: 200, p: "Anthropic", ms: 168 },
  { t: "16:41:33", s: 200, p: "OpenAI", ms: 121 },
];
const LOG_SEQ = [0, 2, 1];
const ROW_H = 34;
const STATUS_TEXT: Record<number, string> = {
  200: "200 OK",
  429: "429 Too Many Requests",
};

function LogsViz({ on, anim }: VizProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!on || !anim) return;
    const id = window.setInterval(
      () => setStep((s) => (s + 1) % LOG_SEQ.length),
      2800,
    );
    return () => window.clearInterval(id);
  }, [on, anim]);

  const sel = LOG_SEQ[step];
  const row = LOG_ROWS[sel];

  return (
    <div className="tk-lg">
      <div className="tk-lg-table">
        <div className="tk-lg-head">
          <span>TIME</span>
          <span>STATUS</span>
          <span>PROVIDER</span>
          <span>LATENCY</span>
        </div>
        <div className="tk-lg-body">
          <span
            className="tk-lg-sel"
            style={{ transform: `translateY(${sel * ROW_H}px)` }}
          />
          {LOG_ROWS.map((r, i) => (
            <div
              className="tk-lg-row tk-lg-in"
              key={r.t}
              style={v({ "--i": i })}
            >
              <span>{r.t}</span>
              <span className={r.s === 200 ? "tk-ok" : "tk-warn"}>{r.s}</span>
              <span>{r.p}</span>
              <span className="tk-lg-ms">{r.ms}ms</span>
            </div>
          ))}
        </div>
      </div>

      <div className="tk-lg-detail tk-a" style={v({ "--i": 8 })}>
        <p className="tk-lbl">REQUEST DETAIL</p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.dl
            key={sel}
            className="tk-lg-kv"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease }}
          >
            <div>
              <dt>ROUTE</dt>
              <dd>/chat/completions</dd>
            </div>
            <div>
              <dt>PROVIDER</dt>
              <dd>{row.p}</dd>
            </div>
            <div>
              <dt>STATUS</dt>
              <dd className={row.s === 200 ? "tk-ok" : "tk-warn"}>
                {STATUS_TEXT[row.s]}
              </dd>
            </div>
            <div>
              <dt>LATENCY</dt>
              <dd>{row.ms} ms</dd>
            </div>
          </motion.dl>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Viz({ id, on, anim }: { id: FeatureId } & VizProps) {
  switch (id) {
    case "gateway":
      return <GatewayViz />;
    case "analytics":
      return <AnalyticsViz on={on} anim={anim} />;
    case "budget":
      return <BudgetViz on={on} anim={anim} />;
    case "alerts":
      return <AlertsViz />;
    case "logs":
      return <LogsViz on={on} anim={anim} />;
  }
}

/* ------------------------------ copy ------------------------------ */

function Copy({
  f,
  state,
  instant = false,
}: {
  f: Feature;
  state: State;
  instant?: boolean;
}) {
  return (
    <motion.div
      className="tk-copy"
      variants={copyV}
      initial={instant ? false : "future"}
      animate={state}
    >
      <motion.p className="tk-tag" variants={tagV}>
        <b>{f.n}</b> / {f.tag}
      </motion.p>
      <h3 className="tk-title">
        {f.title.map((line) => (
          <span className="tk-line" key={line}>
            <motion.span variants={lineV}>{line}</motion.span>
          </span>
        ))}
      </h3>
      <motion.p className="tk-desc" variants={fadeV}>
        {f.description}
      </motion.p>
      <motion.ul className="tk-specs" variants={fadeV}>
        {f.specs.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

/* ------------------------------ desktop --------------------------- */

function VizPanel({ f, state }: { f: Feature; state: State }) {
  const on = state === "active";
  const m = VIZ_MOTION[f.id];
  return (
    <motion.div
      className="tk-panel"
      initial={m.future}
      animate={m[state]}
      aria-hidden={state !== "active"}
    >
      <VizShell id={f.id} on={on} anim paused={false} alt={f.alt}>
        <Viz id={f.id} on={on} anim />
      </VizShell>
    </motion.div>
  );
}

function Pinned() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const current = useRef(0);
  const [active, setActive] = useState(0);

  // Use the actual page scroll position as the single source of truth.
  const { scrollY } = useScroll();

  // Calculate the exact scroll range during which the sticky stage is pinned.
  const getScrollMetrics = () => {
    const track = trackRef.current;
    const stage = stageRef.current;

    if (!track || !stage) return null;

    const trackTop = track.getBoundingClientRect().top + window.scrollY;

    const start = trackTop - NAV;

    // The sticky stage can travel only this far inside its parent.
    const distance = Math.max(1, track.offsetHeight - stage.offsetHeight);

    return { start, distance };
  };

  // Convert the actual scroll position into the active feature index.
  const updateActive = (position: number) => {
    const metrics = getScrollMetrics();
    if (!metrics) return;

    const progress = Math.max(
      0,
      Math.min(1, (position - metrics.start) / metrics.distance),
    );

    const index = Math.min(N - 1, Math.floor(progress * N));

    if (index !== current.current) {
      current.current = index;
      setActive(index);
    }
  };

  // Update only when the actual scroll position changes.
  useMotionValueEvent(scrollY, "change", updateActive);

  // Correct initial state and handle viewport resizing.
  useEffect(() => {
    const sync = () => updateActive(window.scrollY);

    sync();

    window.addEventListener("resize", sync);

    return () => {
      window.removeEventListener("resize", sync);
    };
  }, []);

  // Drive the navigation rail directly from scroll position.
  // No React re-render is needed for every scroll event.
  const marker = useTransform(scrollY, (position) => {
    const metrics = getScrollMetrics();

    if (!metrics) return 0.5 / N;

    const progress = Math.max(
      0,
      Math.min(1, (position - metrics.start) / metrics.distance),
    );

    return 0.5 / N + progress * (1 - 1 / N);
  });

  const markerTop = useTransform(marker, (value) => `${value * 100}%`);

  // Navigate to the center of the requested feature's scroll range.
  const goTo = (index: number) => {
    const metrics = getScrollMetrics();

    if (!metrics) return;

    // Avoid unnecessary scrolling when the requested feature is active.
    if (index === current.current) return;

    const progress = (index + 0.5) / N;

    const target = metrics.start + progress * metrics.distance;

    window.scrollTo({
      top: Math.max(
        0,
        Math.min(
          target,
          document.documentElement.scrollHeight - window.innerHeight,
        ),
      ),
      behavior: "smooth",
    });
  };

  const stateOf = (index: number): State =>
    index === active ? "active" : index < active ? "past" : "future";

  const a = active;
  const next = FEATURES[Math.min(a + 1, N - 1)];

  return (
    <div className="tk-track" ref={trackRef}>
      <div className="tk-stage" ref={stageRef}>
        <div className="tk-accents" aria-hidden="true">
          {FEATURES.map((f, i) => (
            <span
              key={f.id}
              className="tk-accent"
              data-on={active === i}
              style={v({ "--rgb": f.rgb })}
            />
          ))}
        </div>

        <div className="tk-stage-inner">
          <nav className="tk-rail" aria-label="Toolkit progress">
            <span className="tk-rail-line" />

            <motion.span
              className="tk-rail-fill"
              style={{
                scaleY: marker,
                originY: 0,
              }}
            />

            {FEATURES.map((f, i) => (
              <button
                type="button"
                key={f.id}
                className={`tk-tick${
                  active === i ? " is-active" : ""
                }${i < active ? " is-done" : ""}`}
                style={{
                  top: `${((i + 0.5) / N) * 100}%`,
                }}
                onClick={() => goTo(i)}
                aria-label={`${f.n}, ${f.name}`}
                aria-current={active === i ? "step" : undefined}
              >
                <i />
                <span>{f.n}</span>
              </button>
            ))}

            <motion.span className="tk-rail-port" style={{ top: markerTop }} />
          </nav>

          <div className="tk-copycol">
            <div className="tk-copy-stage">
              {FEATURES.map((f, i) => (
                <div className="tk-copy-pos" key={f.id}>
                  <Copy f={f} state={stateOf(i)} />
                </div>
              ))}
            </div>

            <div className="tk-next" aria-hidden="true">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={a}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  {a < N - 1 ? (
                    <>
                      NEXT <b>{next.n}</b> {next.name}
                    </>
                  ) : (
                    "END OF TOOLKIT, KEEP SCROLLING"
                  )}

                  <svg viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 3v10M3.5 8.5 8 13l4.5-4.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <div className="tk-frame">
            <div className="tk-bar">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`c${a}`}
                  className="tk-caption"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  FIG {FEATURES[a].n} / {FEATURES[a].fig}
                </motion.p>
              </AnimatePresence>

              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`r${a}`}
                  className="tk-readout"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  <i aria-hidden="true" />
                  {FEATURES[a].readout}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="tk-canvas">
              {FEATURES.map((f, i) => (
                <VizPanel key={f.id} f={f} state={stateOf(i)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ mobile ---------------------------- */

function Slide({ f, reduce }: { f: Feature; reduce: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { amount: 0.25, once: true });
  const live = useInView(ref, { amount: 0.02 });
  const on = reduce || seen;
  return (
    <article className="tk-slide" ref={ref}>
      <Copy f={f} state={on ? "active" : "future"} instant={reduce} />
      <div className="tk-frame">
        <div className="tk-bar">
          <p className="tk-caption">
            FIG {f.n} / {f.fig}
          </p>
          <p className="tk-readout">
            <i aria-hidden="true" />
            {f.readout}
          </p>
        </div>
        <div className="tk-canvas">
          <div className="tk-panel">
            <VizShell
              id={f.id}
              on={on}
              anim={!reduce}
              paused={!live}
              alt={f.alt}
            >
              <Viz id={f.id} on={on} anim={!reduce} />
            </VizShell>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------ section --------------------------- */

export default function FeaturesSection() {
  const reduce = Boolean(useReducedMotion());
  const wide = useMedia("(min-width: 901px)");
  const pinned = wide && !reduce;

  return (
    <section className="tk-section" id="toolkit" data-chapter="03 / TOOLKIT">
      <motion.div
        className="tk-inner tk-head"
        initial={reduce ? false : "hidden"}
        whileInView={reduce ? undefined : "visible"}
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.p className="tk-eyebrow" variants={reveal}>
          THE SETU TOOLKIT
        </motion.p>
        <motion.h2 variants={reveal}>
          The control layer your LLM stack was missing.
        </motion.h2>
        <motion.p className="tk-head-desc" variants={reveal}>
          Everything you need to route requests, understand usage, and control
          spending across your LLM infrastructure.
        </motion.p>
      </motion.div>

      {pinned ? (
        <Pinned />
      ) : (
        <div className="tk-inner tk-stack">
          {FEATURES.map((f) => (
            <Slide key={f.id} f={f} reduce={reduce} />
          ))}
        </div>
      )}

      <style>{`
        .tk-section {
          --e: cubic-bezier(0.16, 1, 0.3, 1);
          --mono: "JetBrains Mono", monospace;
          position: relative;
          margin-left: clamp(20px, 6.5vw, 88px);
          margin-right: clamp(20px, 2.5vw, 32px);
          border-left: 1px solid #19191d;
          border-bottom: 1px solid #19191d;
          background: #050505;
          font-family: "Geist", sans-serif;
        }

        .tk-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding-left: clamp(22px, 6vw, 96px);
          padding-right: clamp(22px, 6vw, 96px);
        }

        /* ---- header ---- */
        .tk-head { padding-top: clamp(80px, 10vw, 128px); padding-bottom: 64px; }

        .tk-eyebrow {
          margin: 0 0 18px;
          color: #8f8f97;
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.16em;
        }

        .tk-head h2 {
          max-width: 700px;
          margin: 0;
          color: #f7f7f7;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 600;
          letter-spacing: -0.06em;
          line-height: 1.04;
        }

        .tk-head-desc {
          max-width: 520px;
          margin: 20px 0 0;
          color: #969ba3;
          font-size: 14px;
          line-height: 1.6;
        }

        /* ---- pinned stage ---- */
        .tk-track {
          --stage: min(820px, calc(100svh - ${NAV}px));
          --step: 72svh;
          position: relative;
          height: calc(var(--stage) + ${N - 1} * var(--step));
          border-top: 1px solid #19191d;
        }

        .tk-stage {
          position: sticky;
          top: ${NAV}px;
          height: var(--stage);
          overflow: hidden;
        }

        .tk-accents { position: absolute; inset: 0; pointer-events: none; }

        .tk-accent {
          position: absolute;
          inset: 0;
          opacity: 0;
          background: radial-gradient(52% 62% at 74% 52%, rgb(var(--rgb) / 0.07), transparent 72%);
          transition: opacity 800ms ease;
        }

        .tk-accent[data-on="true"] { opacity: 1; }

        .tk-stage-inner {
          position: relative;
          display: grid;
          grid-template-columns: 36px minmax(0, 0.82fr) minmax(0, 1.18fr);
          gap: clamp(20px, 3vw, 48px);
          height: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: clamp(24px, 4vh, 44px) clamp(22px, 6vw, 96px);
        }

        /* rail */
        .tk-rail { position: relative; }

        .tk-rail-line,
        .tk-rail-fill {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 5px;
          width: 1px;
        }

        .tk-rail-line { background: #202026; }
        .tk-rail-fill { background: #67e8f9; opacity: 0.55; transform-origin: top; }

        .tk-rail-port {
          position: absolute;
          left: 0;
          width: 11px;
          height: 2px;
          margin-top: -1px;
          background: #e879f9;
        }

        .tk-tick {
          position: absolute;
          left: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 0;
          border: 0;
          background: transparent;
          color: #565d66;
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.08em;
          cursor: pointer;
          transform: translateY(-50%);
          transition: color 300ms ease;
        }

        .tk-tick i {
          flex: 0 0 auto;
          width: 5px;
          height: 5px;
          margin-left: 3px;
          border-radius: 50%;
          background: #26262d;
          transition: background 300ms ease;
        }

        .tk-tick span { margin-left: 4px; }
        .tk-tick:hover { color: #c8d1d3; }
        .tk-tick.is-done i { background: #565d66; }
        .tk-tick.is-active { color: #f7f7f7; }
        .tk-tick.is-active i { background: #5eead4; }
        .tk-tick:focus-visible { outline: 2px solid #f0abfc; outline-offset: 4px; }

        /* copy column */
        .tk-copycol { position: relative; display: flex; flex-direction: column; min-width: 0; }
        .tk-copy-stage { position: relative; flex: 1; }

        .tk-copy-pos {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-bottom: 24px;
        }

        .tk-tag {
          margin: 0 0 22px;
          color: #8f8f97;
          font-family: var(--mono);
          font-size: 11px;
          letter-spacing: 0.16em;
        }

        .tk-tag b { color: #f7f7f7; font-weight: 400; }

        .tk-title {
          margin: 0;
          color: #f7f7f7;
          font-size: clamp(34px, 3.9vw, 56px);
          font-weight: 600;
          letter-spacing: -0.06em;
          line-height: 1.02;
        }

        .tk-line { display: block; overflow: hidden; padding-bottom: 0.1em; margin-bottom: -0.1em; }
        .tk-line > span { display: block; }

        .tk-desc {
          max-width: 380px;
          margin: 24px 0 0;
          color: #969ba3;
          font-size: 14.5px;
          line-height: 1.6;
        }

        .tk-specs {
          display: flex;
          flex-wrap: wrap;
          margin: 32px 0 0;
          padding: 0;
          list-style: none;
          border-top: 1px solid #202026;
          border-bottom: 1px solid #202026;
        }

        .tk-specs li {
          padding: 11px 14px;
          color: #73737d;
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .tk-specs li:first-child { padding-left: 0; }
        .tk-specs li + li { border-left: 1px solid #202026; }

        .tk-next {
          display: flex;
          align-items: center;
          height: 44px;
          color: #686873;
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.12em;
        }

        .tk-next p { display: inline-flex; align-items: center; gap: 8px; margin: 0; }
        .tk-next b { color: #a7a7b0; font-weight: 400; }
        .tk-next svg { width: 12px; height: 12px; }

        /* frame + canvas */
        .tk-frame {
          display: flex;
          flex-direction: column;
          min-width: 0;
          border-top: 1px solid #202026;
          border-bottom: 1px solid #202026;
          background: #07070a;
        }

        .tk-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px 20px;
          min-height: 46px;
          padding: 8px 20px;
          border-bottom: 1px solid #202026;
          background: #08080b;
        }

        .tk-caption { margin: 0; color: #a1a1aa; font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em; }

        .tk-readout {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          color: #8f8f97;
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.12em;
        }

        .tk-readout i { width: 5px; height: 5px; border-radius: 50%; background: #565d66; }

        .tk-canvas {
          position: relative;
          flex: 1;
          min-height: 0;
          overflow: hidden;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 64px 64px;
          background-position: -1px -1px;
        }

        .tk-panel {
          position: absolute;
          inset: 0;
          padding: clamp(18px, 2.2vw, 30px);
        }

        /* ---- shared visual primitives ---- */
        .tk-viz {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 22px;
          width: 100%;
          height: 100%;
        }

        .tk-lbl {
          margin: 0;
          color: #73737d;
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.12em;
        }

        .tk-val {
          margin: 10px 0 0;
          color: #f7f7f7;
          font-family: var(--mono);
          font-size: clamp(22px, 2.4vw, 30px);
          font-weight: 700;
          letter-spacing: -0.055em;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }

        .tk-val-sm { font-size: clamp(18px, 1.8vw, 22px); }

        .tk-an-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid #202026;
          border-bottom: 1px solid #202026;
        }

        .tk-an-metric { min-width: 0; padding: 16px 16px 18px; }
        .tk-an-metric + .tk-an-metric { border-left: 1px solid #202026; }
        .tk-an-metric:first-child { padding-left: 0; }

        /* entrances: base state is the finished state. Hidden states only
           exist while .is-anim, so reduced motion shows everything. */
        .tk-viz.is-anim:not(.is-on) .tk-a,
        .tk-viz.is-anim:not(.is-on) .tk-draw,
        .tk-viz.is-anim:not(.is-on) .tk-lg-in { opacity: 0; }

        .tk-viz.is-anim.is-on .tk-a {
          animation: tk-rise 0.8s var(--e) both;
          animation-delay: calc(0.25s + var(--i, 0) * 90ms);
        }

        .tk-draw { fill: none; }

        .tk-viz.is-anim .tk-draw { stroke-dasharray: 1; stroke-dashoffset: 0; }

        .tk-viz.is-anim.is-on .tk-draw {
          animation: tk-draw 1.5s var(--e) both;
          animation-delay: calc(0.3s + var(--i, 0) * 80ms);
        }

        .tk-viz.is-paused *,
        .tk-viz.is-paused *::after { animation-play-state: paused !important; }

        @keyframes tk-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes tk-draw { from { opacity: 1; stroke-dashoffset: 1; } to { opacity: 1; stroke-dashoffset: 0; } }
        @keyframes tk-scalex { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes tk-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes tk-travel {
          0% { stroke-dashoffset: 3; opacity: 0.95; }
          20% { stroke-dashoffset: -97; opacity: 0.95; }
          21%, 100% { stroke-dashoffset: -97; opacity: 0; }
        }

        /* ---- 01 gateway ---- */
        .tk-gw { display: block; width: 100%; height: 100%; max-height: 100%; }
        .tk-gw-link { stroke: #3a4247; stroke-width: 1; }
        .tk-svg-node { fill: #0d0d11; stroke: #27272d; }

        .tk-svg-name { fill: #e4e4e7; font-family: var(--mono); font-size: 11px; }

        .tk-svg-tag {
          fill: #565d66;
          font-family: var(--mono);
          font-size: 9.5px;
          letter-spacing: 0.16em;
        }

        .tk-svg-wall { fill: #686873; font-size: 9px; }

        .tk-pulse {
          fill: none;
          stroke: #a5f3fc;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-dasharray: 3 97;
          stroke-dashoffset: 3;
          opacity: 0;
        }

        .tk-viz.is-anim.is-on .tk-pulse {
          animation: tk-travel 6s cubic-bezier(0.45, 0, 0.2, 1) infinite;
          animation-delay: calc(var(--pd) + 1.9s);
        }

        /* ---- 02 analytics ---- */
        .tk-an-legend {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-bottom: 12px;
          color: #8f8f97;
          font-family: var(--mono);
          font-size: 10px;
          letter-spacing: 0.12em;
        }

        .tk-an-legend span { display: inline-flex; align-items: center; gap: 8px; }
        .tk-an-legend em { margin-left: auto; font-style: normal; color: #686873; }
        .tk-sw { width: 10px; height: 2px; }
        .tk-sw-cyan { background: #67e8f9; }
        .tk-sw-blue { background: #60a5fa; }

        .tk-an-plot { position: relative; height: clamp(130px, 20vh, 190px); }
        .tk-an-plot svg { display: block; width: 100%; height: 100%; overflow: visible; }

        .tk-grid { stroke: #15151a; stroke-width: 1; vector-effect: non-scaling-stroke; }

        .tk-an-spend,
        .tk-an-req { fill: none; vector-effect: non-scaling-stroke; stroke-linecap: round; stroke-linejoin: round; }
        .tk-an-spend { stroke: #67e8f9; stroke-width: 1.8; }
        .tk-an-req { stroke: #60a5fa; stroke-width: 1.2; stroke-opacity: 0.8; }

        .tk-an-dot {
          position: absolute;
          top: 10.5%;
          right: 0;
          width: 7px;
          height: 7px;
          margin: -3.5px -3.5px 0 0;
          border-radius: 50%;
          background: #67e8f9;
        }

        .tk-an-dot::after {
          content: "";
          position: absolute;
          inset: -5px;
          border-radius: 50%;
          border: 1px solid #67e8f9;
          opacity: 0;
        }

        .tk-viz.is-anim:not(.is-on) .tk-an-dot { opacity: 0; }

        .tk-viz.is-anim.is-on .tk-an-dot { animation: tk-fade 0.5s ease 2.1s both; }

        .tk-viz.is-anim.is-on .tk-an-dot::after { animation: tk-ring 2.8s ease-out 2.4s infinite; }

        @keyframes tk-ring {
          0% { transform: scale(0.6); opacity: 0.7; }
          70%, 100% { transform: scale(1.7); opacity: 0; }
        }

        .tk-an-axis {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          color: #565d66;
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.12em;
        }

        .tk-an-projects { display: grid; gap: 10px; }

        .tk-an-prow {
          display: grid;
          grid-template-columns: 104px minmax(0, 1fr) 56px;
          align-items: center;
          gap: 14px;
          color: #a1a1aa;
          font-family: var(--mono);
          font-size: 11px;
        }

        .tk-an-prow span:last-child { text-align: right; color: #f7f7f7; font-variant-numeric: tabular-nums; }
        .tk-an-track { height: 6px; background: #121217; }

        .tk-bar-fill {
          display: block;
          width: var(--w);
          height: 100%;
          background: #67e8f9;
          transform-origin: left;
        }

        .tk-viz.is-anim.is-on .tk-bar-fill {
          animation: tk-scalex 1.2s var(--e) both;
          animation-delay: calc(1.1s + var(--i, 0) * 120ms);
        }

        .tk-viz.is-anim:not(.is-on) .tk-bar-fill { transform: scaleX(0); }

        /* ---- 03 budget (also reused by alerts) ---- */
        .tk-bg { display: flex; flex-direction: column; gap: 30px; }

        .tk-bg-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }

        .tk-bg-state { position: relative; display: block; width: 190px; height: 22px; }

        .tk-bg-ok,
        .tk-bg-warn,
        .tk-al-hit {
          display: inline-flex;
          align-items: center;
          height: 22px;
          padding: 0 8px;
          border: 1px solid;
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.12em;
          transition: opacity 300ms ease;
        }

        .tk-bg-ok,
        .tk-bg-warn { position: absolute; right: 0; top: 0; }
        .tk-bg-ok { color: #5eead4; border-color: rgba(94, 234, 212, 0.35); background: rgba(94, 234, 212, 0.06); }

        .tk-bg-warn,
        .tk-al-hit { color: #f5b94b; border-color: rgba(245, 185, 75, 0.4); background: rgba(245, 185, 75, 0.07); }

        .tk-bg[data-state="ok"] .tk-bg-warn,
        .tk-bg[data-state="warn"] .tk-bg-ok { opacity: 0; }

        .tk-bg-big { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }

        .tk-bg-spent {
          margin: 0;
          color: #f7f7f7;
          font-family: var(--mono);
          font-size: clamp(40px, 5vw, 66px);
          font-weight: 700;
          letter-spacing: -0.06em;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }

        .tk-bg-pct {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          margin: 0;
          color: #a1a1aa;
          font-family: var(--mono);
          font-size: 15px;
          font-variant-numeric: tabular-nums;
        }

        .tk-bg-pct small { color: #565d66; font-size: 9px; letter-spacing: 0.14em; }

        .tk-bg-meter { position: relative; padding-top: 26px; }

        .tk-bg-flag {
          position: absolute;
          top: 0;
          transform: translateX(-50%);
          color: #f5b94b;
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.12em;
          white-space: nowrap;
        }

        .tk-bg-track {
          position: relative;
          height: 14px;
          border: 1px solid #202026;
          background-color: #0d0d11;
          background-image: repeating-linear-gradient(90deg, transparent 0, transparent calc(10% - 1px), #1a1a21 calc(10% - 1px), #1a1a21 10%);
        }

        .tk-bg-fill {
          position: absolute;
          inset: 1px;
          background: linear-gradient(90deg, #67e8f9 0%, #67e8f9 50%, #f5b94b 80%);
          clip-path: inset(0 21.6% 0 0);
        }

        .tk-bg-mark {
          position: absolute;
          top: -22px;
          bottom: -8px;
          width: 1px;
          background: #f5b94b;
        }

        .tk-viz.is-anim.is-on .tk-bg-mark { animation: tk-fade 0.4s ease 2.2s both; }
        .tk-viz.is-anim:not(.is-on) .tk-bg-mark { opacity: 0; }

        .tk-bg-scale {
          display: flex;
          justify-content: space-between;
          margin-top: 14px;
          color: #565d66;
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.1em;
        }

        /* ---- 04 alerts ---- */
        .tk-al { display: flex; flex-direction: column; justify-content: center; gap: 0; width: 100%; }
        .tk-al-meter { display: flex; flex-direction: column; gap: 18px; }
        .tk-al-track .tk-bg-mark { top: -6px; bottom: -6px; }

        .tk-al-fill {
          position: absolute;
          inset: 1px;
          width: calc(80% - 1px);
          background: linear-gradient(90deg, #67e8f9 0%, #67e8f9 62%, #f5b94b 100%);
          transform-origin: left;
        }

        .tk-al-hit { opacity: 1; }

        .tk-viz.is-anim:not(.is-on) .tk-al-fill { transform: scaleX(0); }
        .tk-viz.is-anim:not(.is-on) .tk-al-hit { opacity: 0; }

        .tk-viz.is-anim.is-on .tk-al-fill { animation: tk-scalex 1.3s cubic-bezier(0.65, 0, 0.35, 1) 0.5s both; }
        .tk-viz.is-anim.is-on .tk-al-hit { animation: tk-fade 0.4s ease 1.8s both; }
        .tk-viz.is-anim.is-on .tk-al-mark { animation: tk-hit 0.9s var(--e) 1.8s both; }

        @keyframes tk-hit {
          0% { transform: scaleY(1); box-shadow: none; }
          40% { transform: scaleY(1.5); }
          100% { transform: scaleY(1); }
        }

        .tk-al-wire { position: relative; height: 56px; margin-left: 80%; }

        .tk-al-wire-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 1px;
          background: #3a4247;
          transform-origin: top;
        }

        .tk-al-wire-dot {
          position: absolute;
          left: -1.5px;
          top: 0;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #a5f3fc;
          opacity: 0;
        }

        .tk-viz.is-anim:not(.is-on) .tk-al-wire-line { transform: scaleY(0); }

        .tk-viz.is-anim.is-on .tk-al-wire-line { animation: tk-scaley 0.5s var(--e) 1.9s both; }
        .tk-viz.is-anim.is-on .tk-al-wire-dot { animation: tk-drop 0.6s cubic-bezier(0.45, 0, 0.2, 1) 2.0s both; }

        @keyframes tk-scaley { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes tk-drop {
          0% { transform: translateY(0); opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(52px); opacity: 0; }
        }

        .tk-sl { border: 1px solid #27272d; background: #0d0d11; }

        .tk-viz.is-anim:not(.is-on) .tk-sl { opacity: 0; }
        .tk-viz.is-anim.is-on .tk-sl { animation: tk-notify 0.9s var(--e) 2.4s both; }

        @keyframes tk-notify {
          from { opacity: 0; transform: translateY(-14px) scale(0.985); }
          to { opacity: 1; transform: none; }
        }

        .tk-sl-top {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-bottom: 1px solid #202026;
          color: #a1a1aa;
          font-family: var(--mono);
          font-size: 10.5px;
        }

        .tk-sl-top svg { width: 14px; height: 14px; flex: 0 0 auto; }
        .tk-sl-top em { margin-left: auto; font-style: normal; color: #686873; }

        .tk-sl-msg { position: relative; display: flex; gap: 12px; padding: 16px 16px 18px; }

        .tk-sl-msg::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 2px;
          background: #f5b94b;
        }

        .tk-sl-av {
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          width: 34px;
          height: 34px;
          border: 1px solid #27272d;
          background: #14141a;
          color: #f7f7f7;
          font-family: var(--mono);
          font-size: 12px;
          font-weight: 700;
        }

        .tk-sl-copy { min-width: 0; }

        .tk-sl-name { display: flex; align-items: center; gap: 8px; margin: 0 0 10px; }
        .tk-sl-name b { color: #f7f7f7; font-size: 14px; font-weight: 600; }

        .tk-sl-name span {
          padding: 2px 5px;
          border: 1px solid #2b2b33;
          color: #8f8f97;
          font-family: var(--mono);
          font-size: 8.5px;
          letter-spacing: 0.1em;
        }

        .tk-sl-name time { color: #686873; font-family: var(--mono); font-size: 10px; }

        .tk-sl-pill {
          display: inline-block;
          padding: 4px 8px;
          border: 1px solid rgba(245, 185, 75, 0.35);
          background: rgba(245, 185, 75, 0.07);
          color: #f5b94b;
          font-family: var(--mono);
          font-size: 9px;
          letter-spacing: 0.12em;
        }

        .tk-sl-text { margin: 12px 0 0; color: #c8cbd2; font-size: 14px; line-height: 1.5; }
        .tk-sl-meta { margin: 6px 0 0; color: #73737d; font-family: var(--mono); font-size: 11px; }

        /* ---- 05 logs ---- */
        .tk-lg { display: flex; flex-direction: column; gap: 16px; width: 100%; }

        .tk-lg-table { border-top: 1px solid #1f1f28; border-bottom: 1px solid #1f1f28; background: #0a0a0f; }

        .tk-lg-head,
        .tk-lg-row {
          display: grid;
          grid-template-columns: 76px 48px minmax(0, 1fr) 96px;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          font-family: var(--mono);
          font-size: 11px;
          font-variant-numeric: tabular-nums;
        }

        .tk-lg-head {
          height: 32px;
          border-bottom: 1px solid #1f1f28;
          color: #686873;
          font-size: 9.5px;
          letter-spacing: 0.12em;
        }

        .tk-lg-body { position: relative; }

        .tk-lg-sel {
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          height: ${ROW_H}px;
          border-left: 2px solid #67e8f9;
          background: rgba(103, 232, 249, 0.05);
          transition: transform 550ms var(--e);
        }

        .tk-lg-row { position: relative; height: ${ROW_H}px; color: #c8cbd2; border-bottom: 1px solid #121217; }
        .tk-lg-row:last-child { border-bottom: 0; }

        .tk-ok { color: #5eead4; }
        .tk-warn { color: #f5b94b; }

        .tk-lg-ms { color: #a1a1aa; }

        .tk-viz.is-anim.is-on .tk-lg-in {
          animation: tk-row 0.7s var(--e) both;
          animation-delay: calc(0.5s + var(--i, 0) * 70ms);
        }

        @keyframes tk-row { from { opacity: 0; transform: translateX(-14px); } to { opacity: 1; transform: none; } }

        .tk-lg-detail {
          min-height: 118px;
          padding: 14px 16px;
          border-top: 1px solid #1f1f28;
          border-bottom: 1px solid #1f1f28;
          background: #07070a;
        }

        .tk-lg-kv {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px 20px;
          margin: 14px 0 0;
        }

        .tk-lg-kv div { min-width: 0; }
        .tk-lg-kv dt { color: #565d66; font-family: var(--mono); font-size: 9px; letter-spacing: 0.14em; }
        .tk-lg-kv dd { margin: 6px 0 0; color: #e4e4e7; font-family: var(--mono); font-size: 12px; }

        /* ---- stacked layout: mobile and reduced motion ---- */
        .tk-stack { padding-bottom: 24px; }

        .tk-slide {
          display: grid;
          gap: 32px;
          padding: 56px 0;
          border-top: 1px solid #202026;
        }

        .tk-slide:first-child { border-top: 0; padding-top: 8px; }

        .tk-slide .tk-canvas { flex: none; overflow: visible; }
        .tk-slide .tk-panel { position: relative; inset: auto; }
        .tk-slide .tk-viz { height: auto; }
        .tk-slide .tk-gw { height: auto; }
        .tk-slide .tk-title { font-size: clamp(34px, 9vw, 52px); }

        @media (min-width: 901px) {
          .tk-slide {
            grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
            gap: clamp(24px, 4vw, 64px);
            align-items: center;
          }
        }

        @media (max-width: 700px) {
          .tk-section { margin-left: 0; margin-right: 0; border-left: 0; }
          .tk-inner { padding-left: 20px; padding-right: 20px; }
          .tk-head { padding-top: 72px; padding-bottom: 40px; }
          .tk-head h2 { font-size: clamp(32px, 10vw, 44px); }
          .tk-panel { padding: 16px; }
          .tk-an-metric { padding: 14px 10px 16px; }
          .tk-an-metric:first-child { padding-left: 0; }
          .tk-an-prow { grid-template-columns: 86px minmax(0, 1fr) 48px; gap: 10px; font-size: 10px; }
          .tk-bg-state { width: 150px; }
          .tk-bg-state span { font-size: 8px; padding: 0 6px; }
          .tk-lg-head,
          .tk-lg-row { grid-template-columns: 60px 36px minmax(0, 1fr) 54px; gap: 8px; padding: 0 10px; font-size: 10px; }
          .tk-lg-kv { grid-template-columns: 1fr 1fr; }
          .tk-sl-msg { padding: 14px 12px 16px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .tk-viz * { animation: none !important; }
          .tk-viz .tk-a,
          .tk-viz .tk-draw,
          .tk-viz .tk-lg-in { opacity: 1 !important; }
          .tk-accent,
          .tk-lg-sel { transition: none; }
        }
      `}</style>
    </section>
  );
}
