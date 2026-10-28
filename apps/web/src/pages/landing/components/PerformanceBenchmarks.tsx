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
  {
    value: 2.88,
    decimals: 2,
    suffix: "",
    unit: "ms",
    label: "P95 LATENCY",
  },
  {
    value: 0,
    decimals: 0,
    suffix: "%",
    unit: "",
    label: "HTTP FAILURES",
  },
];

const reveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const metricReveal: Variants = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 72,
      damping: 18,
      mass: 0.8,
    },
  },
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
  reduceMotion,
}: {
  value: number;
  decimals: number;
  suffix: string;
  active: boolean;
  reduceMotion: boolean;
}) {
  const displayValueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const displayValue = displayValueRef.current;
    if (!displayValue) return;
    if (!active) {
      displayValue.textContent = "0";
      return;
    }

    let animationFrame = 0;
    const duration = value === 0 || reduceMotion ? 0 : 1100;
    const startTime = performance.now();

    const animate = (timestamp: number) => {
      const progress =
        duration === 0 ? 1 : Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      displayValue.textContent = formatMetricValue(
        value * easedProgress,
        decimals,
        suffix,
      );

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [active, decimals, reduceMotion, suffix, value]);

  return <span ref={displayValueRef}>0</span>;
}

export default function PerformanceBenchmarks() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { amount: 0.25 });

  return (
    <section
      className="performance-benchmarks"
      id="performance"
      ref={sectionRef}
    >
      <motion.div
        className="performance-accent-line"
        initial={prefersReducedMotion ? false : { scaleX: 0, opacity: 0 }}
        whileInView={
          prefersReducedMotion ? undefined : { scaleX: 1, opacity: 1 }
        }
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden="true"
      />
      <motion.div
        className="performance-benchmarks-inner"
        initial={prefersReducedMotion ? false : "hidden"}
        whileInView={prefersReducedMotion ? undefined : "visible"}
        viewport={{ amount: 0.25 }}
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
          className="performance-metrics"
          aria-label="Performance benchmarks"
        >
          {metrics.map((metric) => (
            <motion.div
              className="performance-metric"
              key={metric.label}
              variants={metricReveal}
            >
              <div className="performance-value">
                <AnimatedMetric
                  value={metric.value}
                  decimals={metric.decimals}
                  suffix={metric.suffix}
                  active={isInView}
                  reduceMotion={Boolean(prefersReducedMotion)}
                />
                {metric.unit && <small>{metric.unit}</small>}
              </div>
              <p>{metric.label}</p>
            </motion.div>
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

        .performance-benchmarks::before {
          display: none;
        }

        .performance-accent-line {
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

        .performance-benchmarks-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: clamp(86px, 10vw, 136px) clamp(22px, 6vw, 96px) 72px;
        }

        .performance-intro {
          max-width: 680px;
        }

        .performance-eyebrow {
          margin: 0 0 18px;
          color: #d98be9;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.16em;
        }

        .performance-intro h2 {
          margin: 0;
          color: #f7f7f7;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 700;
          letter-spacing: -0.05em;
          line-height: 1.04;
        }

        .performance-description {
          max-width: 520px;
          margin: 20px 0 0;
          color: #8e8e98;
          font-size: 14px;
          line-height: 1.55;
        }

        .performance-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          margin-top: 72px;
          border-top: 1px solid #202026;
          border-bottom: 1px solid #202026;
        }

        .performance-metric {
          min-width: 0;
          padding: 34px clamp(18px, 3.4vw, 48px) 38px;
        }

        .performance-metric + .performance-metric {
          border-left: 1px solid #202026;
        }

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
        }

        .performance-value small {
          color: #e879f9;
          font-family: "JetBrains Mono", monospace;
          font-size: 12px;
          letter-spacing: 0.02em;
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
          border-top: 1px solid #202026;
          color: #686873;
          font-family: "Geist", sans-serif;
          font-size: 12px;
          line-height: 1.5;
        }

        .performance-footnote span {
          color: #a7a7b0;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
        }

        @media (max-width: 700px) {
          .performance-benchmarks {
            margin-left: 0;
            margin-right: 0;
          }

          .performance-benchmarks-inner {
            padding: 72px 20px 52px;
          }

          .performance-intro h2 {
            font-size: clamp(32px, 10vw, 44px);
          }

          .performance-metrics {
            grid-template-columns: repeat(2, 1fr);
            margin-top: 52px;
          }

          .performance-metric {
            padding: 26px 16px 30px;
          }

          .performance-metric:nth-child(3) {
            grid-column: 1 / -1;
            border-top: 1px solid #202026;
            border-left: 0;
          }

          .performance-value span {
            font-size: clamp(32px, 10vw, 44px);
          }
        }
      `}</style>
    </section>
  );
}
