import { useEffect, useRef, type CSSProperties } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";

/* ------------------------------------------------------------------
   "The Span"
   Many application lines are drawn together into one heavy beam (the
   gateway), then released to a small set of providers. One request is
   routed across in cyan. The only orchid mark is the gateway's port.
------------------------------------------------------------------- */
const W = 1440;
const H = 520;
const NECK_X = 600;
const MID = H / 2;

const LEFT_COUNT = 19;
const RIGHT_COUNT = 6;
const ACCENT_LEFT = 6;
const ACCENT_RIGHT = 2;

const neckY = (i: number, n: number) => MID + (i - (n - 1) / 2) * 1.5;

const leftPath = (i: number) => {
  const y = 16 + i * ((H - 32) / (LEFT_COUNT - 1));
  const ny = neckY(i, LEFT_COUNT);
  return `M0 ${y} C 300 ${y} 340 ${ny} ${NECK_X} ${ny}`;
};

const rightPath = (k: number) => {
  const y = 70 + k * ((H - 140) / (RIGHT_COUNT - 1));
  const ny = neckY(k, RIGHT_COUNT);
  return `M${NECK_X} ${ny} C 880 ${ny} 920 ${y} 1160 ${y} L${W} ${y}`;
};

const routePath = `${leftPath(ACCENT_LEFT)} ${rightPath(ACCENT_RIGHT).replace(/^M\S+ \S+/, "")}`;

const ease = [0.16, 1, 0.3, 1] as const;

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

const lineUp: Variants = {
  hidden: { y: "108%" },
  visible: { y: 0, transition: { duration: 0.95, ease } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

const hoverSpring = { type: "spring" as const, stiffness: 400, damping: 20 };

function Span() {
  return (
    <svg
      className="setu-span"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Many application request lines drawn together into a single gateway, then routed out to a few model providers"
    >
      <defs>
        <linearGradient
          id="span-in"
          gradientUnits="userSpaceOnUse"
          x1="0"
          x2={NECK_X}
          y1="0"
          y2="0"
        >
          <stop offset="0" stopColor="#30363D" stopOpacity="0" />
          <stop offset="0.55" stopColor="#3A4247" />
          <stop offset="1" stopColor="#565D66" />
        </linearGradient>
        <linearGradient
          id="span-out"
          gradientUnits="userSpaceOnUse"
          x1={NECK_X}
          x2={W}
          y1="0"
          y2="0"
        >
          <stop offset="0" stopColor="#565D66" />
          <stop offset="0.5" stopColor="#3A4247" />
          <stop offset="1" stopColor="#30363D" />
        </linearGradient>
      </defs>

      <g className="span-lines">
        {Array.from({ length: LEFT_COUNT }, (_, i) =>
          i === ACCENT_LEFT ? null : (
            <path
              key={`l${i}`}
              d={leftPath(i)}
              pathLength={1}
              stroke="url(#span-in)"
              style={{ "--i": i } as CSSProperties}
            />
          ),
        )}
        {Array.from({ length: RIGHT_COUNT }, (_, k) =>
          k === ACCENT_RIGHT ? null : (
            <path
              key={`r${k}`}
              d={rightPath(k)}
              pathLength={1}
              stroke="url(#span-out)"
              style={{ "--i": k + 10 } as CSSProperties}
            />
          ),
        )}
      </g>

      {/* the gateway: one heavy beam */}
      <line
        className="span-beam"
        x1={NECK_X - 70}
        x2={NECK_X + 70}
        y1={MID}
        y2={MID}
      />

      {/* the routed request */}
      <path className="span-route" d={routePath} pathLength={100} />
      <path className="span-pulse" d={routePath} pathLength={100} />
    </svg>
  );
}

export default function HeroSection() {
  const heroRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  // Pause CSS animation while off screen. Toggles a class, no React state.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => hero.classList.toggle("is-paused", !entry.isIntersecting),
      { threshold: 0.02 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="setu-hero" ref={heroRef}>
      <motion.div
        className="setu-top"
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        variants={stagger}
      >
        <div className="setu-headline">
          <motion.p className="setu-eyebrow" variants={fadeUp}>
            SETU / LLM GATEWAY
          </motion.p>
          <h1 className="setu-title">
            <span className="setu-line">
              <motion.span variants={lineUp}>One gateway.</motion.span>
            </span>
            <span className="setu-line">
              <motion.span variants={lineUp}>Every model.</motion.span>
            </span>
            <span className="setu-line">
              <motion.span variants={lineUp}>Total control.</motion.span>
            </span>
          </h1>
        </div>

        <motion.div className="setu-aside" variants={fadeUp}>
          <p>
            Route requests, monitor usage, and control LLM spending through one
            unified gateway.
          </p>
          <div className="setu-actions">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={hoverSpring}
            >
              <Link to="/dashboard" className="setu-primary">
                <span>Get Started</span>
                <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3.333 8h9.334M8 3.333L12.667 8 8 12.667"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={hoverSpring}
            >
              <a
                href="https://github.com/JejurkarYash/setu"
                target="_blank"
                rel="noreferrer"
                className="setu-secondary"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.47 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .5Z"
                  />
                </svg>
                <span>GitHub</span>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      <div className="setu-graphic">
        <Span />
        {/* ruler through the gateway, plus its port */}
        <span className="setu-ruler" aria-hidden="true" />
        <span className="setu-port" aria-hidden="true" />
        <span className="setu-tag setu-tag-in" aria-hidden="true">
          APPLICATIONS
        </span>
        <span className="setu-tag setu-tag-gate" aria-hidden="true">
          GATEWAY
        </span>
        <span className="setu-tag setu-tag-out" aria-hidden="true">
          PROVIDERS
        </span>
      </div>

      <style>{`
        .setu-hero {
          position: relative;
          isolation: isolate;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: clamp(640px, calc(100svh - 68px), 840px);
          margin: 0 clamp(20px, 2.5vw, 32px) 0 clamp(20px, 6.5vw, 88px);
          overflow: hidden;
          border-left: 1px solid #19191d;
          border-bottom: 1px solid #19191d;
          background: #050505;
          font-family: "Geist", sans-serif;
        }

        .setu-top {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(260px, 340px);
          align-items: end;
          gap: clamp(24px, 4vw, 80px);
          padding: clamp(44px, 8vh, 96px) clamp(20px, 3.4vw, 48px) 0;
        }

        .setu-eyebrow {
          margin: 0 0 24px;
          color: #8f8f97;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.16em;
        }

        .setu-title {
          margin: 0;
          color: #f7f7f7;
          font-size: clamp(46px, 6.6vw, 104px);
          font-weight: 600;
          letter-spacing: -0.07em;
          line-height: 0.95;
        }

        .setu-line {
          display: block;
          overflow: hidden;
          padding-bottom: 0.08em;
        }

        .setu-line > span { display: block; }

        .setu-aside { padding-bottom: 0.8vw; }

        .setu-aside p {
          max-width: 310px;
          margin: 0;
          color: #969ba3;
          font-size: 15px;
          line-height: 1.6;
        }

        .setu-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 28px;
        }

        .setu-primary,
        .setu-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 48px;
          font-family: "Geist", sans-serif;
          font-size: 14.5px;
          font-weight: 600;
          text-decoration: none;
          transition: background 220ms ease, border-color 220ms ease, color 220ms ease;
        }

        .setu-primary { min-width: 148px; padding: 0 22px; background: #fff; color: #08070b; }
        .setu-primary:hover { background: #f0abfc; }
        .setu-primary svg { width: 15px; height: 15px; transition: transform 200ms ease; }
        .setu-primary:hover svg { transform: translateX(4px); }

        .setu-secondary {
          min-width: 118px;
          padding: 0 20px;
          border: 1px solid #27272d;
          background: #0d0d11;
          color: #e4e4e7;
        }

        .setu-secondary:hover { border-color: #3a4247; background: #111318; color: #fff; }
        .setu-secondary svg { width: 17px; height: 17px; flex: 0 0 auto; }

        .setu-primary:focus-visible,
        .setu-secondary:focus-visible { outline: 2px solid #f0abfc; outline-offset: 4px; }

        /* ---- the span ---- */
        .setu-graphic {
          position: relative;
          flex: 1;
          min-height: 300px;
          margin-top: clamp(24px, 5vh, 56px);
          border-top: 1px solid #19191d;
        }

        .setu-span {
          position: absolute;
          inset: 0;
          display: block;
          width: 100%;
          height: 100%;
        }

        .span-lines path {
          fill: none;
          stroke-width: 1;
          vector-effect: non-scaling-stroke;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: span-draw 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: calc(var(--i) * 55ms + 350ms);
        }

        .span-beam {
          stroke: #dce5e9;
          stroke-width: 6;
          vector-effect: non-scaling-stroke;
          transition: stroke-width 350ms cubic-bezier(0.16, 1, 0.3, 1);
          animation: span-beam-in 900ms cubic-bezier(0.16, 1, 0.3, 1) 900ms both;
          transform-box: fill-box;
          transform-origin: center;
        }

        .setu-graphic:hover .span-beam { stroke-width: 9; }

        .span-route {
          fill: none;
          stroke: #67e8f9;
          stroke-opacity: 0.45;
          stroke-width: 1.5;
          vector-effect: non-scaling-stroke;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: span-route-in 1.8s cubic-bezier(0.16, 1, 0.3, 1) 1.1s forwards;
          transition: stroke-opacity 400ms ease;
        }

        .setu-graphic:hover .span-route { stroke-opacity: 0.9; }

        .span-pulse {
          fill: none;
          stroke: #a5f3fc;
          stroke-width: 4;
          stroke-linecap: round;
          stroke-dasharray: 3 97;
          stroke-dashoffset: 3;
          vector-effect: non-scaling-stroke;
          opacity: 0;
          animation: span-travel 6s cubic-bezier(0.45, 0, 0.2, 1) 3s infinite;
        }

        .setu-ruler {
          position: absolute;
          top: 0;
          bottom: 0;
          left: ${(NECK_X / W) * 100}%;
          width: 1px;
          background: linear-gradient(180deg, #202026, transparent 18%, transparent 82%, #202026);
        }

        /* the one orchid mark: the gateway's port */
        .setu-port {
          position: absolute;
          top: 50%;
          left: ${(NECK_X / W) * 100}%;
          width: 2px;
          height: 26px;
          background: #e879f9;
          transform: translate(-50%, -50%);
          animation: span-fade 700ms ease 1.4s both;
        }

        .setu-tag {
          position: absolute;
          color: #565d66;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          animation: span-fade 800ms ease 1.2s both;
        }

        .setu-tag-in { top: 14px; left: clamp(20px, 3.4vw, 48px); }
        .setu-tag-out { top: 14px; right: clamp(20px, 3.4vw, 48px); }
        .setu-tag-gate {
          bottom: 14px;
          left: ${(NECK_X / W) * 100}%;
          transform: translateX(-50%);
          color: #686873;
        }

        @keyframes span-draw { to { stroke-dashoffset: 0; } }
        @keyframes span-route-in { to { stroke-dashoffset: 0; } }
        @keyframes span-beam-in { from { opacity: 0; transform: scaleX(0.2); } to { opacity: 1; transform: scaleX(1); } }
        @keyframes span-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes span-travel {
          0% { stroke-dashoffset: 3; opacity: 0.95; }
          70% { stroke-dashoffset: -97; opacity: 0.95; }
          72%, 100% { stroke-dashoffset: -97; opacity: 0; }
        }

        .setu-hero.is-paused * { animation-play-state: paused !important; }

        @media (max-width: 860px) {
          .setu-hero { min-height: auto; }
          .setu-top { grid-template-columns: 1fr; align-items: start; gap: 28px; padding-top: 52px; }
          .setu-title { font-size: clamp(44px, 13vw, 80px); }
          .setu-aside { padding-bottom: 0; }
          .setu-graphic { min-height: 260px; margin-top: 44px; }
        }

        @media (max-width: 640px) {
          .setu-hero { margin-left: 0; margin-right: 0; border-left: 0; }
          .setu-top { padding-left: 20px; padding-right: 20px; }
          .setu-actions { flex-direction: column; align-items: stretch; }
          .setu-actions > div,
          .setu-actions a { width: 100%; }
          .setu-tag-in { left: 20px; }
          .setu-tag-out { right: 20px; }
          .setu-tag-gate { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .span-lines path { animation: none; stroke-dashoffset: 0; }
          .span-beam, .setu-port, .setu-tag { animation: none; }
          .span-route { animation: none; stroke-dashoffset: 0; }
          .span-pulse { animation: none; opacity: 0; }
        }
      `}</style>
    </section>
  );
}
