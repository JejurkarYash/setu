import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { useEffect, useRef } from "react";

const metrics = [
  {
    value: 5170,
    decimals: 0,
    suffix: "+",
    unit: "req/s",
    label: "SUSTAINED THROUGHPUT",
  },
  { value: 2.88, decimals: 2, suffix: "", unit: "ms", label: "P95 LATENCY" },
  { value: 0, decimals: 0, suffix: "%", unit: "", label: "HTTP FAILURES" },
];

const ease = [0.16, 1, 0.3, 1] as const;

// One signal crosses the ledger. Each figure resolves as it passes.
const PASS_MS = 1500;
const STEP_MS = PASS_MS / metrics.length;

const reveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

function formatMetricValue(value: number, decimals: number, suffix: string) {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;
}

function AnimatedMetric({
  value,
  decimals,
  suffix,
  active,
  delay,
  reduceMotion,
}: {
  value: number;
  decimals: number;
  suffix: string;
  active: boolean;
  delay: number;
  reduceMotion: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !active || reduceMotion || value === 0) return;

    node.textContent = formatMetricValue(0, decimals, suffix);
    const duration = 1300;
    let frame = 0;
    let start = 0;

    // Runs only while counting, then stops itself.
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - t) ** 4;
      node.textContent = formatMetricValue(value * eased, decimals, suffix);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    const timer = window.setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [active, decimals, delay, reduceMotion, suffix, value]);

  // Final value is the server/first render, so there is no layout shift.
  return <span ref={ref}>{formatMetricValue(value, decimals, suffix)}</span>;
}

export default function PerformanceBenchmarks() {
  const reduceMotion = Boolean(useReducedMotion());
  const sectionRef = useRef<HTMLElement>(null);
  const ledgerRef = useRef<HTMLDivElement>(null);
  const ledgerInView = useInView(ledgerRef, { amount: 0.4, once: true });

  return (
    <section
      className="performance-benchmarks"
      id="performance"
      data-chapter="01 / PERFORMANCE"
      ref={sectionRef}
    >
      <motion.div
        className="performance-inner"
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.div className="performance-intro" variants={reveal}>
          <p className="performance-eyebrow">PERFORMANCE / BENCHMARKS</p>
          <h2>Fast by design. Measured under load.</h2>
          <p className="performance-description">
            Built in Go. Benchmarked under sustained load. Designed for
            high-throughput LLM traffic.
          </p>
        </motion.div>

        <div
          ref={ledgerRef}
          className={`performance-ledger${ledgerInView || reduceMotion ? " is-live" : ""}`}
          aria-label="Performance benchmarks"
        >
          {/* the route continues here from the hero: port, then one signal */}
          <span className="ledger-port" aria-hidden="true" />
          <span className="ledger-route" aria-hidden="true" />
          <span className="ledger-signal" aria-hidden="true" />

          {metrics.map((metric, i) => (
            <div
              className="performance-metric"
              key={metric.label}
              style={{ ["--d" as string]: `${i * STEP_MS}ms` }}
            >
              <div className="performance-value">
                <AnimatedMetric
                  value={metric.value}
                  decimals={metric.decimals}
                  suffix={metric.suffix}
                  active={ledgerInView}
                  delay={i * STEP_MS}
                  reduceMotion={reduceMotion}
                />
                {metric.unit && <small>{metric.unit}</small>}
              </div>
              <p>{metric.label}</p>
            </div>
          ))}
        </div>

        <motion.p className="performance-footnote" variants={reveal}>
          Measured during a 5-minute <span>Grafana k6</span> stability test
          across <span>1.55M+ requests</span>. Peak throughput reached{" "}
          <span>7,420 req/s</span>.
        </motion.p>
      </motion.div>

      <style>{`
        .performance-benchmarks {
          position: relative;
          margin-left: clamp(20px, 6.5vw, 88px);
          margin-right: clamp(20px, 2.5vw, 32px);
          border-left: 1px solid #19191d;
          border-bottom: 1px solid #19191d;
          background: #050505;
          font-family: "Geist", sans-serif;
        }

        .performance-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: clamp(80px, 10vw, 128px) clamp(22px, 6vw, 96px) 72px;
        }

        .performance-intro { max-width: 680px; }

        .performance-eyebrow {
          margin: 0 0 18px;
          color: #8f8f97;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.16em;
        }

        .performance-intro h2 {
          margin: 0;
          color: #f7f7f7;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 600;
          letter-spacing: -0.06em;
          line-height: 1.04;
        }

        .performance-description {
          max-width: 520px;
          margin: 20px 0 0;
          color: #969ba3;
          font-size: 14px;
          line-height: 1.6;
        }

        .performance-ledger {
          position: relative;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          margin-top: 72px;
          border-bottom: 1px solid #202026;
        }

        /* the ledger's top edge: a graphite rail with a cyan route drawn over it */
        .performance-ledger::before {
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          height: 1px;
          content: "";
          background: #202026;
        }

        .ledger-route {
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          height: 1px;
          background: linear-gradient(90deg, #67e8f9, rgba(103, 232, 249, 0.25));
          transform: scaleX(0);
          transform-origin: left;
        }

        /* the orchid port where the route enters the ledger */
        .ledger-port {
          position: absolute;
          top: -9px;
          left: 0;
          width: 2px;
          height: 18px;
          background: #e879f9;
          opacity: 0;
        }

        .ledger-signal {
          position: absolute;
          top: -1px;
          left: 0;
          width: 36px;
          height: 3px;
          border-radius: 2px;
          background: #a5f3fc;
          opacity: 0;
        }

        .performance-metric {
          position: relative;
          min-width: 0;
          padding: 34px clamp(18px, 3.4vw, 48px) 38px;
          opacity: 0;
          transform: translateY(14px);
          transition: background 300ms ease;
        }

        .performance-metric:hover { background: #08080b; }
        .performance-metric + .performance-metric { border-left: 1px solid #202026; }

        .performance-value {
          display: flex;
          align-items: baseline;
          gap: 10px;
          white-space: nowrap;
        }

        .performance-value span {
          color: #f7f7f7;
          font-family: "JetBrains Mono", monospace;
          font-size: clamp(36px, 4vw, 58px);
          font-weight: 700;
          letter-spacing: -0.055em;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }

        .performance-value small {
          color: #67e8f9;
          font-family: "JetBrains Mono", monospace;
          font-size: 12px;
        }

        .performance-metric p {
          margin: 18px 0 0;
          color: #73737d;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
        }

        .performance-footnote {
          margin: 0;
          padding-top: 18px;
          color: #686873;
          font-size: 12px;
          line-height: 1.5;
        }

        .performance-footnote span {
          color: #a7a7b0;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
        }

        /* ---- one orchestrated pass, triggered once ---- */
        .performance-ledger.is-live .ledger-route {
          animation: ledger-draw ${PASS_MS}ms cubic-bezier(0.45, 0, 0.2, 1) forwards;
        }

        .performance-ledger.is-live .ledger-port { animation: ledger-fade 500ms ease forwards; }

        .performance-ledger.is-live .ledger-signal {
          animation: ledger-pass ${PASS_MS}ms cubic-bezier(0.45, 0, 0.2, 1) forwards;
        }

        .performance-ledger.is-live .performance-metric {
          animation: ledger-metric 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: var(--d);
        }

        @keyframes ledger-draw { to { transform: scaleX(1); } }
        @keyframes ledger-fade { to { opacity: 1; } }
        @keyframes ledger-pass {
          0% { left: 0; opacity: 1; }
          92% { opacity: 1; }
          100% { left: calc(100% - 36px); opacity: 0; }
        }
        @keyframes ledger-metric { to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 700px) {
          .performance-benchmarks { margin-left: 0; margin-right: 0; border-left: 0; }
          .performance-inner { padding: 72px 20px 52px; }
          .performance-intro h2 { font-size: clamp(32px, 10vw, 44px); }

          .performance-ledger { grid-template-columns: repeat(2, 1fr); margin-top: 52px; }
          .performance-metric { padding: 26px 16px 30px; }

          .performance-metric:nth-of-type(3) {
            grid-column: 1 / -1;
            border-top: 1px solid #202026;
            border-left: 0;
          }

          .performance-value span { font-size: clamp(32px, 10vw, 44px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .performance-metric { opacity: 1; transform: none; }
          .ledger-route { transform: scaleX(1); }
          .ledger-port { opacity: 1; }
          .performance-ledger.is-live * { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
