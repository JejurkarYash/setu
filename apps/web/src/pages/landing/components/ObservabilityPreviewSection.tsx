import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";

/* ------------------------------------------------------------------
   A small, honest console preview. The sidebar is a real tab list: each
   item changes what the console shows, and clicking a recent request on
   the Overview opens it in Request Logs. All figures are illustrative
   and labelled as such. Self-contained: no shared class names.
------------------------------------------------------------------- */

const TABS = ["Overview", "Request Logs", "Budgets", "Alerts"] as const;
type Tab = (typeof TABS)[number];

const STATS = [
  { label: "Requests", value: "2.4k", delta: "+12%" },
  { label: "Spend", value: "$2.86k", delta: "-$240" },
  { label: "Tokens", value: "8.4M", delta: "+3.2%" },
];

const BARS = [
  { day: "Mon", short: "M", value: 38 },
  { day: "Tue", short: "T", value: 52 },
  { day: "Wed", short: "W", value: 44 },
  { day: "Thu", short: "T", value: 68 },
  { day: "Fri", short: "F", value: 56 },
  { day: "Sat", short: "S", value: 74 },
  { day: "Sun", short: "S", value: 64 },
];

const PEAK = BARS.reduce(
  (best, bar, i) => (bar.value > BARS[best].value ? i : best),
  0,
);

const LOGS = [
  { time: "16:42:01", model: "openai/gpt-4o", status: 200, latency: "142ms" },
  {
    time: "16:41:58",
    model: "anthropic/claude-3.5",
    status: 200,
    latency: "210ms",
  },
  {
    time: "16:41:52",
    model: "google/gemini-pro",
    status: 429,
    latency: "12ms",
  },
  {
    time: "16:41:40",
    model: "openai/gpt-4o-mini",
    status: 200,
    latency: "94ms",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;
const css = (o: Record<string, string | number>) => o as CSSProperties;

/* ---------------- panels ---------------- */

function Metrics() {
  return (
    <div className="ob-metrics">
      {STATS.map((s, i) => (
        <div className="ob-metric" key={s.label} style={css({ "--i": i })}>
          <span className="ob-label">{s.label}</span>
          <div>
            <strong>{s.value}</strong>
            <em>{s.delta}</em>
          </div>
        </div>
      ))}
    </div>
  );
}

function Activity({ live }: { live: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = BARS[hover ?? PEAK];

  return (
    <div className="ob-panel">
      <div className="ob-panel-head">
        <span className="ob-title">Request activity</span>
        <span className="ob-meta">last 7 days</span>
      </div>

      <div
        className="ob-bars"
        role="group"
        aria-label="Request activity over the last 7 days"
      >
        {BARS.map((bar, i) => (
          <button
            type="button"
            key={bar.day}
            className={`ob-bar${(hover ?? PEAK) === i ? " is-active" : ""}${live ? " is-live" : ""}`}
            style={css({ "--h": `${bar.value}%`, "--i": i })}
            aria-label={`${bar.day}: ${bar.value} requests per minute`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
          >
            <i />
            <span>{bar.short}</span>
          </button>
        ))}
      </div>

      <div className="ob-readout">
        <span>{hover === null ? "PEAK" : shown.day.toUpperCase()}</span>
        <strong>{shown.value} req/min</strong>
      </div>
    </div>
  );
}

function Budget({ live, large = false }: { live: boolean; large?: boolean }) {
  return (
    <div className={`ob-panel${large ? " is-large" : ""}`}>
      <div className="ob-panel-head">
        <span className="ob-title">Budget monitor</span>
        <span className="ob-amber">80% threshold</span>
      </div>

      <div className="ob-budget-sum">
        <div>
          <span className="ob-label">Spent</span>
          <strong>$78.40</strong>
        </div>
        <div>
          <span className="ob-label">Remaining</span>
          <strong>$21.60</strong>
        </div>
      </div>

      <div
        className="ob-meter"
        role="meter"
        aria-label="Budget used"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={78.4}
      >
        <div className="ob-meter-track" />
        <div className={`ob-meter-fill${live ? " is-live" : ""}`} />
        <div className="ob-meter-threshold">
          <span>80%</span>
        </div>
      </div>
    </div>
  );
}

function Logs({
  selected,
  onSelect,
  withDetail = false,
}: {
  selected: number | null;
  onSelect: (i: number) => void;
  withDetail?: boolean;
}) {
  const row = selected === null ? null : LOGS[selected];

  return (
    <div className={`ob-panel ob-logs${withDetail ? " has-detail" : ""}`}>
      <div className="ob-panel-head">
        <span className="ob-title">Recent requests</span>
        <span className="ob-meta">sample</span>
      </div>

      <div className="ob-logs-body">
        <div>
          <div className="ob-grid ob-grid-head" aria-hidden="true">
            <span>Time</span>
            <span>Provider</span>
            <span>Status</span>
            <span>Latency</span>
          </div>
          {LOGS.map((r, i) => (
            <button
              type="button"
              key={r.time}
              className={`ob-grid ob-row${i === selected ? " is-selected" : ""}`}
              aria-pressed={withDetail ? i === selected : undefined}
              onClick={() => onSelect(i)}
            >
              <span>{r.time}</span>
              <span>{r.model}</span>
              <span className={r.status === 200 ? "ob-ok" : "ob-bad"}>
                {r.status}
              </span>
              <span>{r.latency}</span>
            </button>
          ))}
        </div>

        {withDetail && (
          <aside className="ob-detail" aria-live="polite">
            {row ? (
              <div key={row.time} className="ob-detail-in">
                <span className="ob-label">Request</span>
                <h4>/chat/completions</h4>
                <dl>
                  <div>
                    <dt>Model</dt>
                    <dd>{row.model}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd className={row.status === 200 ? "ob-ok" : "ob-bad"}>
                      {row.status}
                    </dd>
                  </div>
                  <div>
                    <dt>Latency</dt>
                    <dd>{row.latency}</dd>
                  </div>
                  <div>
                    <dt>Time</dt>
                    <dd>{row.time}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <p className="ob-empty">Select a request to inspect it.</p>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

function SlackPanel({ large = false }: { large?: boolean }) {
  const [logoOk, setLogoOk] = useState(true);
  return (
    <div className={`ob-panel${large ? " is-large" : ""}`}>
      <div className="ob-panel-head">
        <span className="ob-title">Slack channel</span>
        <span className="ob-meta">configured</span>
      </div>

      <div className="ob-slack">
        <div className="ob-slack-top">
          <span className="ob-slack-logo">
            {logoOk ? (
              <img
                src="/logos/slack.svg"
                alt=""
                onError={() => setLogoOk(false)}
                draggable={false}
              />
            ) : (
              <b aria-hidden="true">S</b>
            )}
          </span>
          <span># setu-alerts</span>
        </div>

        <div className="ob-slack-msg">
          <span className="ob-avatar" aria-hidden="true">
            <img src="/Setu_Icon.svg" alt="" />
          </span>
          <div>
            <p className="ob-author">
              Setu <em>APP</em>
            </p>
            <div className="ob-slack-body">
              <span className="ob-pill">THRESHOLD 80% REACHED</span>
              <p>Project prod-core crossed its configured threshold.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- section ---------------- */

export default function ObservabilityPreviewSection() {
  const reduceMotion = Boolean(useReducedMotion());
  const windowRef = useRef<HTMLDivElement>(null);
  const live = useInView(windowRef, { amount: 0.3, once: true });

  const [tab, setTab] = useState<Tab>("Overview");
  const [selectedLog, setSelectedLog] = useState<number | null>(2);

  const onTabKeys = (event: KeyboardEvent) => {
    const keys = ["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const step =
      event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1;
    setTab(TABS[(TABS.indexOf(tab) + step + TABS.length) % TABS.length]);
  };

  const openLog = (i: number) => {
    setSelectedLog(i);
    setTab("Request Logs");
  };

  const body = (() => {
    switch (tab) {
      case "Request Logs":
        return (
          <Logs selected={selectedLog} onSelect={setSelectedLog} withDetail />
        );
      case "Budgets":
        return <Budget live={live} large />;
      case "Alerts":
        return <SlackPanel large />;
      default:
        return (
          <>
            <Metrics />
            <div className="ob-two">
              <Activity live={live} />
              <Budget live={live} />
            </div>
            <div className="ob-two ob-two-b">
              <Logs selected={null} onSelect={openLog} />
              <SlackPanel />
            </div>
          </>
        );
    }
  })();

  return (
    <section
      className="ob-section"
      id="observability"
      data-chapter="04 / OBSERVABILITY"
    >
      <div className="ob-inner">
        <motion.div
          className="ob-copy"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease }}
        >
          <p className="ob-eyebrow">OBSERVABILITY</p>
          <h2>Your LLM traffic. Finally, in focus.</h2>
          <p className="ob-lede">
            Track usage, understand spending, and inspect requests across your
            LLM infrastructure—all through Setu.
          </p>
        </motion.div>

        <motion.div
          ref={windowRef}
          className={`ob-window${live ? " is-live" : ""}`}
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.9, ease }}
        >
          <div className="ob-bar">
            <div className="ob-crumbs">
              <span>Projects</span>
              <i aria-hidden="true">/</i>
              <b>prod-core</b>
            </div>
            <span className="ob-preview">PREVIEW · ILLUSTRATIVE DATA</span>
          </div>

          <div className="ob-shell">
            <div
              className="ob-tabs"
              role="tablist"
              aria-orientation="vertical"
              aria-label="Console views"
              onKeyDown={onTabKeys}
            >
              {TABS.map((name) => (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  id={`ob-tab-${name}`}
                  aria-selected={tab === name}
                  aria-controls="ob-panel"
                  tabIndex={tab === name ? 0 : -1}
                  className={tab === name ? "is-active" : ""}
                  onClick={() => setTab(name)}
                >
                  {name}
                </button>
              ))}
            </div>

            <div
              className="ob-body"
              id="ob-panel"
              role="tabpanel"
              aria-labelledby={`ob-tab-${tab}`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tab}
                  className="ob-view"
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease }}
                >
                  {body}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        .ob-section {
          position: relative;
          margin-left: clamp(20px, 6.5vw, 88px);
          margin-right: clamp(20px, 2.5vw, 32px);
          border-left: 1px solid #19191d;
          border-bottom: 1px solid #19191d;
          background: #050505;
          font-family: "Geist", sans-serif;
        }

        .ob-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: clamp(80px, 10vw, 128px) clamp(22px, 6vw, 96px) 88px;
        }

        .ob-eyebrow {
          margin: 0 0 18px;
          color: #8f8f97;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.16em;
        }

        .ob-copy h2 {
          max-width: 720px;
          margin: 0;
          color: #f7f7f7;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 600;
          letter-spacing: -0.06em;
          line-height: 1.04;
        }

        .ob-lede { max-width: 520px; margin: 20px 0 0; color: #969ba3; font-size: 14px; line-height: 1.6; }

        /* ---- window ---- */
        .ob-window {
          position: relative;
          margin-top: 56px;
          border: 1px solid #1f1f28;
          background: #07070a;
        }

        .ob-window::before {
          position: absolute;
          top: -1px;
          left: 20px;
          width: 96px;
          height: 1px;
          content: "";
          background: #67e8f9;
        }

        .ob-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid #1f1f28;
          background: #0a0a0f;
        }

        .ob-crumbs { display: flex; align-items: center; gap: 8px; color: #73737d; font-family: "JetBrains Mono", monospace; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; }
        .ob-crumbs i { font-style: normal; opacity: 0.6; }
        .ob-crumbs b { color: #f5f5f5; font-weight: 500; }

        .ob-preview { color: #565d66; font-family: "JetBrains Mono", monospace; font-size: 9px; letter-spacing: 0.14em; }

        .ob-shell { display: grid; grid-template-columns: 176px minmax(0, 1fr); min-height: 560px; }

        .ob-tabs { display: flex; flex-direction: column; gap: 2px; padding: 16px 12px; border-right: 1px solid #1f1f28; background: #08080b; }

        .ob-tabs button {
          position: relative;
          padding: 11px 12px;
          border: 0;
          background: transparent;
          color: #8f8f97;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.06em;
          text-align: left;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 200ms ease, background 200ms ease;
        }

        .ob-tabs button:hover { color: #f5f5f5; }
        .ob-tabs button.is-active { background: #111318; color: #f5f5f5; }

        .ob-tabs button.is-active::before {
          position: absolute;
          top: 8px;
          bottom: 8px;
          left: 0;
          width: 2px;
          content: "";
          background: #67e8f9;
        }

        .ob-tabs button:focus-visible { outline: 2px solid #f0abfc; outline-offset: -2px; }

        .ob-body { min-width: 0; padding: 20px; }
        .ob-view { display: grid; gap: 16px; align-content: start; }

        /* ---- shared ---- */
        .ob-label {
          display: block;
          color: #73737d;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .ob-panel { padding: 16px 18px; border: 1px solid #1f1f28; background: #0a0a0f; }
        .ob-panel.is-large { padding: 28px 28px 32px; }

        .ob-panel-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 16px; }

        .ob-title { color: #f4f4f5; font-family: "JetBrains Mono", monospace; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; }
        .ob-meta { color: #686873; font-family: "JetBrains Mono", monospace; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; }

        .ob-amber {
          padding: 4px 8px;
          border: 1px solid rgba(245, 158, 11, 0.4);
          color: #f59e0b;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .ob-ok { color: #5eead4; }
        .ob-bad { color: #fca5a5; }

        .ob-two { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(240px, 0.8fr); gap: 16px; }
        .ob-two-b { grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.8fr); }

        /* ---- metrics ---- */
        .ob-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border: 1px solid #1f1f28; background: #0a0a0f; }
        .ob-metric { min-height: 88px; padding: 16px 18px; transition: background 250ms ease; }
        .ob-metric + .ob-metric { border-left: 1px solid #1f1f28; }
        .ob-metric:hover { background: #0d0d11; }
        .ob-metric > div { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-top: 10px; }

        .ob-metric strong {
          color: #f7f7f7;
          font-family: "JetBrains Mono", monospace;
          font-size: clamp(22px, 2.4vw, 30px);
          font-weight: 600;
          letter-spacing: -0.05em;
        }

        .ob-metric em { color: #5eead4; font-family: "JetBrains Mono", monospace; font-size: 10px; font-style: normal; letter-spacing: 0.06em; }

        .ob-window.is-live .ob-metric { animation: ob-rise 700ms cubic-bezier(0.16, 1, 0.3, 1) backwards; animation-delay: calc(var(--i) * 90ms + 200ms); }

        /* ---- bars ---- */
        .ob-bars { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 10px; height: 168px; align-items: stretch; }

        .ob-bar {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          gap: 8px;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        .ob-bar i {
          display: block;
          width: 100%;
          max-width: 30px;
          height: var(--h);
          background: #30363d;
          transform-origin: bottom;
          transition: background-color 250ms ease;
        }

        .ob-bar span { color: #686873; font-family: "JetBrains Mono", monospace; font-size: 10px; }
        .ob-bar:hover i,
        .ob-bar.is-active i { background: #67e8f9; }
        .ob-bar:focus-visible { outline: 2px solid #f0abfc; outline-offset: 2px; }

        .ob-bar.is-live i { animation: ob-grow 900ms cubic-bezier(0.16, 1, 0.3, 1) backwards; animation-delay: calc(var(--i) * 70ms + 300ms); }

        .ob-readout {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 14px;
          padding-top: 10px;
          border-top: 1px solid #1f1f28;
          color: #8f8f97;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
        }

        .ob-readout strong { color: #f5f5f5; font-weight: 500; }

        /* ---- budget ---- */
        .ob-budget-sum { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 26px; }
        .ob-budget-sum > div:last-child { text-align: right; }

        .ob-budget-sum strong {
          display: block;
          margin-top: 8px;
          color: #f7f7f7;
          font-family: "JetBrains Mono", monospace;
          font-size: clamp(24px, 2.4vw, 30px);
          font-weight: 600;
          letter-spacing: -0.05em;
        }

        .is-large .ob-budget-sum strong { font-size: clamp(34px, 4vw, 52px); }

        .ob-meter { position: relative; height: 28px; }

        .ob-meter-track,
        .ob-meter-fill {
          position: absolute;
          inset: 0;
          -webkit-mask-image: repeating-linear-gradient(90deg, #000 0 3px, transparent 3px 8px);
          mask-image: repeating-linear-gradient(90deg, #000 0 3px, transparent 3px 8px);
        }

        .ob-meter-track { background: #22242a; }
        .ob-meter-fill { background: #5eead4; clip-path: inset(0 21.6% 0 0); }
        .ob-meter-fill.is-live { animation: ob-meter 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.4s backwards; }

        .ob-meter-threshold { position: absolute; top: -8px; bottom: -8px; left: 80%; width: 1px; background: #f59e0b; }

        .ob-meter-threshold span {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          color: #f59e0b;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.1em;
          transform: translateX(-50%);
        }

        /* ---- logs ---- */
        .ob-logs-body { display: grid; gap: 20px; }
        .ob-logs.has-detail .ob-logs-body { grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); }

        .ob-grid {
          display: grid;
          grid-template-columns: 74px minmax(0, 1fr) 46px 56px;
          gap: 10px;
          align-items: center;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
        }

        .ob-grid-head { padding: 0 0 8px; border-bottom: 1px solid #1f1f28; color: #686873; font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; }

        .ob-row {
          position: relative;
          width: 100%;
          padding: 11px 0;
          border: 0;
          border-bottom: 1px solid #111318;
          background: transparent;
          color: #d4d4d8;
          text-align: left;
          cursor: pointer;
          transition: background 200ms ease;
        }

        .ob-row:hover { background: #0d0d11; }
        .ob-row.is-selected { background: #111318; }
        .ob-row.is-selected::before { position: absolute; top: 0; bottom: 0; left: -10px; width: 2px; content: ""; background: #c8d1d3; }
        .ob-row span:nth-child(2) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ob-row:focus-visible { outline: 2px solid #f0abfc; outline-offset: 2px; }

        .ob-detail { padding-left: 20px; border-left: 1px solid #1f1f28; }
        .ob-detail h4 { margin: 8px 0 16px; color: #f7f7f7; font-family: "JetBrains Mono", monospace; font-size: 15px; font-weight: 500; }
        .ob-detail dl { margin: 0; }
        .ob-detail dl > div { display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-bottom: 1px solid #111318; font-family: "JetBrains Mono", monospace; font-size: 11px; }
        .ob-detail dt { color: #686873; }
        .ob-detail dd { margin: 0; color: #e4e4e7; }
        .ob-empty { margin: 0; color: #686873; font-size: 13px; }
        .ob-detail-in { animation: ob-fade 400ms ease backwards; }

        /* ---- slack ---- */
        .ob-slack { border: 1px solid #1f1f28; background: #07070a; }

        .ob-slack-top {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-bottom: 1px solid #1f1f28;
          color: #c8d1d3;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
        }

        .ob-slack-logo { display: grid; width: 20px; height: 20px; place-items: center; background: #e4e4e7; }
        .ob-slack-logo img { width: 14px; height: 14px; object-fit: contain; }
        .ob-slack-logo b { color: #08070b; font-size: 11px; font-weight: 600; }

        .ob-slack-msg { display: flex; gap: 12px; padding: 16px 14px 18px; }
        .ob-slack-msg > div { min-width: 0; flex: 1; }

        .ob-avatar { display: grid; flex: 0 0 34px; width: 34px; height: 34px; place-items: center; border: 1px solid #27272d; background: #111318; }
        .ob-avatar img { width: 22px; height: 22px; object-fit: contain; }

        .ob-author { margin: 0 0 8px; color: #f5f5f5; font-size: 13px; font-weight: 600; }
        .ob-author em { margin-left: 8px; padding: 2px 5px; border: 1px solid #27272d; color: #8f8f97; font-family: "JetBrains Mono", monospace; font-size: 8px; font-style: normal; font-weight: 400; }

        .ob-slack-body { padding: 11px 13px; border-left: 2px solid #f59e0b; background: #111318; }
        .ob-pill { color: #f59e0b; font-family: "JetBrains Mono", monospace; font-size: 9px; letter-spacing: 0.12em; }
        .ob-slack-body p { margin: 8px 0 0; color: #d4d4d8; font-size: 13px; line-height: 1.5; }

        @keyframes ob-rise { from { opacity: 0; transform: translateY(10px); } }
        @keyframes ob-grow { from { transform: scaleY(0); } }
        @keyframes ob-meter { from { clip-path: inset(0 100% 0 0); } }
        @keyframes ob-fade { from { opacity: 0; } }

        /* ---- responsive ---- */
        @media (max-width: 900px) {
          .ob-shell { grid-template-columns: 1fr; min-height: 0; }

          .ob-tabs {
            flex-direction: row;
            gap: 2px;
            padding: 8px;
            overflow-x: auto;
            border-right: 0;
            border-bottom: 1px solid #1f1f28;
          }

          .ob-tabs button { flex: 0 0 auto; white-space: nowrap; }
          .ob-tabs button.is-active::before { top: auto; right: 12px; bottom: 0; left: 12px; width: auto; height: 2px; }

          .ob-two,
          .ob-two-b,
          .ob-logs.has-detail .ob-logs-body { grid-template-columns: 1fr; }

          .ob-detail { padding: 16px 0 0; border-top: 1px solid #1f1f28; border-left: 0; }
        }

        @media (max-width: 700px) {
          .ob-section { margin-left: 0; margin-right: 0; border-left: 0; }
          .ob-inner { padding: 72px 20px 56px; }
          .ob-copy h2 { font-size: clamp(32px, 10vw, 44px); }
          .ob-window { margin-top: 40px; }
          .ob-bar { padding: 12px 14px; }
          .ob-preview { font-size: 8px; }
          .ob-body { padding: 12px; }
          .ob-metrics { grid-template-columns: 1fr; }
          .ob-metric + .ob-metric { border-top: 1px solid #1f1f28; border-left: 0; }
          .ob-grid { grid-template-columns: 62px minmax(0, 1fr) 36px 48px; gap: 6px; font-size: 10px; }
          .ob-panel.is-large { padding: 20px 18px 24px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ob-section * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </section>
  );
}
