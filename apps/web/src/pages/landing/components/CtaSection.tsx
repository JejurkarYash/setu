import { useRef, type CSSProperties } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { useNavigate } from "react-router-dom";

/* ------------------------------------------------------------------
   The page closes on a bridge.
   A suspension span in hairlines: two towers, one cable, a deck laid
   left to right, hangers dropping in from the towers toward the middle.
   Requests cross the deck from applications to providers. The one
   orchid mark is the gate at mid-span. Hovering or focusing
   "Get Started" sends a request across (pure CSS, :has).
   Different from the hero on purpose: that one converges, this one spans.
------------------------------------------------------------------- */

const githubUrl = "https://github.com/JejurkarYash/setu";

const W = 600;
const H = 460;
const DECK = 290;
const TL = 190; // left tower x
const TR = 410; // right tower x
const TOP = 96; // where cables meet the towers

const bz = (a: number, b: number, c: number, d: number, t: number) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};

const MAIN_CABLE = `M${TL} ${TOP} C 230 190 370 190 ${TR} ${TOP}`;
const LEFT_CABLE = `M${TL} ${TOP} C 140 130 70 200 -40 288`;
const RIGHT_CABLE = `M${TR} ${TOP} C 460 130 530 200 ${W + 40} 288`;

type Hanger = { x: number; y: number; d: number };

// hangers drop in from the towers first, the middle of the span last
const N_MAIN = 17;
const N_SIDE = 5;
const HANGERS: Hanger[] = [
  ...Array.from({ length: N_MAIN }, (_, k) => {
    const t = (k + 1) / (N_MAIN + 1);
    return {
      x: bz(TL, 230, 370, TR, t),
      y: bz(TOP, 190, 190, TOP, t),
      d: Math.min(k, N_MAIN - 1 - k),
    };
  }),
  ...Array.from({ length: N_SIDE }, (_, k) => {
    const t = (k + 1) / (N_SIDE + 1);
    return {
      x: bz(TL, 140, 70, -40, t),
      y: bz(TOP, 130, 200, 288, t),
      d: k,
    };
  }),
  ...Array.from({ length: N_SIDE }, (_, k) => {
    const t = (k + 1) / (N_SIDE + 1);
    return {
      x: bz(TR, 460, 530, W + 40, t),
      y: bz(TOP, 130, 200, 288, t),
      d: k,
    };
  }),
];

const ease = [0.16, 1, 0.3, 1] as const;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

const spring = { type: "spring" as const, stiffness: 400, damping: 20 };

// pulled out so the water reflection can reuse it
function Structure() {
  return (
    <>
      <g className="cta-cables">
        {[MAIN_CABLE, LEFT_CABLE, RIGHT_CABLE].map((d) => (
          <path key={d} className="cta-draw" d={d} pathLength={1} />
        ))}
      </g>
      <g className="cta-hangers">
        {HANGERS.map((hg, i) => (
          <path
            key={i}
            className="cta-draw"
            d={`M${hg.x.toFixed(1)} ${hg.y.toFixed(1)} V${DECK}`}
            pathLength={1}
            style={{ "--d": hg.d } as CSSProperties}
          />
        ))}
      </g>
      <g className="cta-towers">
        {[TL, TR].map((x) => (
          <g key={x}>
            <path className="cta-draw" d={`M${x} 350 V84`} pathLength={1} />
            <path
              className="cta-draw"
              d={`M${x - 8} 84 H${x + 8}`}
              pathLength={1}
            />
          </g>
        ))}
      </g>
    </>
  );
}

export default function CtaSection() {
  const navigate = useNavigate();
  const reduceMotion = Boolean(useReducedMotion());
  const ref = useRef<HTMLElement>(null);
  const live = useInView(ref, { amount: 0.35, once: true });
  const visible = useInView(ref, { amount: 0 });

  return (
    <section
      ref={ref}
      className={`cta-section${live || reduceMotion ? " is-live" : ""}${visible ? "" : " is-paused"}`}
      id="get-started"
      data-chapter="06 / DEPLOY"
    >
      <motion.div
        className="cta-copy"
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.35 }}
        variants={container}
      >
        <motion.p className="cta-eyebrow" variants={rise}>
          READY TO GET STARTED?
        </motion.p>
        <motion.h2 variants={rise}>
          Stop managing integrations. Start building.
        </motion.h2>
        <motion.p className="cta-description" variants={rise}>
          Bring your LLM traffic, usage, and spending under one unified gateway.
        </motion.p>

        <motion.div className="cta-actions" variants={rise}>
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={spring}
          >
            <button
              type="button"
              className="cta-primary"
              onClick={() =>
                navigate(localStorage.getItem("token") ? "/dashboard" : "/login")
              }
            >
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
            </button>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={spring}
          >
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="cta-secondary"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.47 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .5Z"
                />
              </svg>
              <span>Explore GitHub</span>
            </a>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="cta-plane">
        <div className="cta-frame">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="A suspension bridge drawn in fine lines. Requests cross the deck from applications on one bank to LLM providers on the other."
          >
            <defs>
              <linearGradient id="cta-fade-g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff" />
                <stop offset="1" stopColor="#000" />
              </linearGradient>
              <mask
                id="cta-fade"
                maskUnits="userSpaceOnUse"
                x="-100"
                y={DECK}
                width={W + 200}
                height={H - DECK}
              >
                <rect
                  x="-100"
                  y={DECK}
                  width={W + 200}
                  height={H - DECK}
                  fill="url(#cta-fade-g)"
                />
              </mask>
            </defs>

            {/* water: the same structure, mirrored and faded */}
            <g mask="url(#cta-fade)">
              <g
                className="cta-mirror"
                transform={`translate(0 ${DECK * 2}) scale(1 -1)`}
              >
                <Structure />
              </g>
            </g>

            <g className="cta-struct">
              <Structure />
            </g>

            {/* deck: hairline roadway, heavy laid span between the towers */}
            <path
              className="cta-draw cta-roadway"
              d={`M-40 ${DECK} H${W + 40}`}
              pathLength={1}
            />
            <path
              className="cta-draw cta-deck"
              d={`M${TL} ${DECK} H${TR}`}
              pathLength={1}
            />

            {/* traffic crossing the deck */}
            {[0, 2.3, 4.6].map((d) => (
              <path
                key={d}
                className="cta-pulse"
                d={`M0 ${DECK} H${W}`}
                pathLength={100}
                style={{ "--pd": `${d}s` } as CSSProperties}
              />
            ))}
            <path
              className="cta-cross"
              d={`M0 ${DECK} H${W}`}
              pathLength={100}
            />

            {/* the one orchid mark: the gate at mid-span */}
            <rect
              className="cta-port"
              x={W / 2 - 1.5}
              y={DECK - 15}
              width="3"
              height="30"
            />
          </svg>

          <span className="cta-tag cta-tag-l" aria-hidden="true">
            APPLICATIONS
          </span>
          <span className="cta-tag cta-tag-r" aria-hidden="true">
            PROVIDERS
          </span>
          <span className="cta-tag cta-tag-c" aria-hidden="true">
            ONE ENDPOINT
          </span>
        </div>
      </div>

      <style>{`
        .cta-section {
          position: relative;
          isolation: isolate;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, 0.95fr);
          align-items: center;
          min-height: 480px;
          margin: 0 clamp(20px, 2.5vw, 32px) 0 clamp(20px, 6.5vw, 88px);
          overflow: hidden;
          border-left: 1px solid #19191d;
          background: #050505;
          font-family: "Geist", sans-serif;
        }

        .cta-copy {
          position: relative;
          z-index: 1;
          padding: clamp(64px, 9vw, 112px) 24px clamp(64px, 9vw, 112px) clamp(24px, 6vw, 96px);
        }

        .cta-eyebrow {
          margin: 0 0 22px;
          color: #8f8f97;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.16em;
        }

        .cta-copy h2 {
          max-width: 620px;
          margin: 0;
          color: #f7f7f7;
          font-size: clamp(36px, 4.6vw, 64px);
          font-weight: 600;
          letter-spacing: -0.065em;
          line-height: 1;
        }

        .cta-description {
          max-width: 400px;
          margin: 24px 0 0;
          color: #969ba3;
          font-size: 15px;
          line-height: 1.65;
        }

        .cta-actions { display: flex; align-items: center; gap: 12px; margin-top: 34px; }

        .cta-primary,
        .cta-secondary {
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

        .cta-primary { min-width: 148px; padding: 0 22px; background: #fff; color: #08070b; }
        .cta-primary:hover { background: #f0abfc; }
        .cta-primary svg { width: 15px; height: 15px; transition: transform 200ms ease; }
        .cta-primary:hover svg { transform: translateX(4px); }

        .cta-secondary { min-width: 164px; padding: 0 20px; border: 1px solid #27272d; background: #0d0d11; color: #e4e4e7; }
        .cta-secondary:hover { border-color: #3a4247; background: #111318; color: #fff; }
        .cta-secondary svg { width: 17px; height: 17px; flex: 0 0 auto; }

        .cta-primary:focus-visible,
        .cta-secondary:focus-visible { outline: 2px solid #f0abfc; outline-offset: 4px; }

        /* ---- the bridge ---- */
        .cta-plane {
          position: relative;
          display: grid;
          place-items: center;
          align-self: stretch;
          min-height: 320px;
          overflow: hidden;
        }

        .cta-frame { position: relative; width: 100%; aspect-ratio: ${W} / ${H}; }

        .cta-frame svg { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }

        .cta-section svg path { fill: none; stroke: #30363d; stroke-width: 1; vector-effect: non-scaling-stroke; }

        .cta-section .cta-towers path { stroke: #3a4247; }
        .cta-section .cta-cables path { stroke: #565d66; }
        .cta-section .cta-hangers path { stroke: #2a2f36; }
        .cta-roadway { stroke: #3a4247 !important; }
        .cta-deck { stroke: #dce5e9 !important; stroke-width: 6 !important; }
        .cta-mirror { opacity: 0.2; }

        .cta-draw { stroke-dasharray: 1; stroke-dashoffset: 1; }

        .cta-pulse,
        .cta-cross {
          stroke: #a5f3fc !important;
          stroke-width: 4 !important;
          stroke-linecap: round;
          stroke-dasharray: 3 97;
          stroke-dashoffset: 3;
          opacity: 0;
        }

        .cta-cross { stroke: #e0fcff !important; stroke-width: 5 !important; stroke-dasharray: 6 94; stroke-dashoffset: 6; }

        /* the one orchid mark */
        .cta-port {
          fill: #e879f9;
          opacity: 0;
          transform-box: fill-box;
          transform-origin: center;
        }

        .cta-tag {
          position: absolute;
          color: #565d66;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          white-space: nowrap;
          opacity: 0;
        }

        .cta-tag-l { left: 14px; top: calc(${(DECK / H) * 100}% - 28px); }
        .cta-tag-r { right: 14px; top: calc(${(DECK / H) * 100}% - 28px); }
        .cta-tag-c { left: 50%; top: calc(${(DECK / H) * 100}% + 26px); transform: translateX(-50%); color: #686873; }

        /* ---- one orchestrated moment: the span is built ---- */
        .is-live .cta-towers path { animation: cta-draw 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards; }
        .is-live .cta-cables path { animation: cta-draw 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards; }
        .is-live .cta-hangers path {
          animation: cta-draw 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: calc(1s + var(--d, 0) * 75ms);
        }
        .is-live .cta-roadway { animation: cta-draw 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; }
        .is-live .cta-deck { animation: cta-draw 1.1s cubic-bezier(0.16, 1, 0.3, 1) 1.5s forwards; }
        .is-live .cta-port { animation: cta-fade 700ms ease 2.4s forwards; }
        .is-live .cta-tag { animation: cta-fade 800ms ease 2.2s forwards; }

        /* traffic: slow loop, starts once the deck is laid */
        .is-live .cta-pulse {
          animation: cta-travel 7s cubic-bezier(0.45, 0, 0.2, 1) infinite;
          animation-delay: calc(3.4s + var(--pd));
        }

        /* hover or focus "Get Started": send a request across, ping the gate */
        .is-live:has(.cta-primary:hover) .cta-cross,
        .is-live:has(.cta-primary:focus-visible) .cta-cross { animation: cta-cross 1.1s cubic-bezier(0.45, 0, 0.2, 1) both; }
        .is-live:has(.cta-primary:hover) .cta-port,
        .is-live:has(.cta-primary:focus-visible) .cta-port { animation: cta-ping 1.1s cubic-bezier(0.16, 1, 0.3, 1) both; }

        .cta-section.is-paused * { animation-play-state: paused !important; }

        @keyframes cta-draw { to { stroke-dashoffset: 0; } }
        @keyframes cta-fade { to { opacity: 1; } }
        @keyframes cta-travel {
          0% { stroke-dashoffset: 3; opacity: 0.95; }
          26% { stroke-dashoffset: -97; opacity: 0.95; }
          27%, 100% { stroke-dashoffset: -97; opacity: 0; }
        }
        @keyframes cta-cross {
          0% { stroke-dashoffset: 6; opacity: 1; }
          92% { stroke-dashoffset: -100; opacity: 1; }
          100% { stroke-dashoffset: -100; opacity: 0; }
        }
        @keyframes cta-ping {
          0% { opacity: 1; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.6); }
          100% { opacity: 1; transform: scaleY(1); }
        }

        /* ---- responsive ---- */
        @media (max-width: 860px) {
          .cta-section { grid-template-columns: 1fr; min-height: 0; }
          .cta-copy { padding: 72px 24px 40px; }
          .cta-plane { min-height: 0; border-top: 1px solid #19191d; }
        }

        @media (max-width: 640px) {
          .cta-section { margin-left: 0; margin-right: 0; border-left: 0; }
          .cta-copy { padding: 64px 20px 36px; }
          .cta-copy h2 { font-size: clamp(34px, 10vw, 48px); }
          .cta-actions { flex-direction: column; align-items: stretch; margin-top: 30px; }
          .cta-actions > div,
          .cta-actions a { width: 100%; }
          .cta-tag { font-size: 9px; }
          .cta-tag-l { left: 10px; }
          .cta-tag-r { right: 10px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cta-draw { stroke-dashoffset: 0; animation: none !important; }
          .cta-port,
          .cta-tag { opacity: 1; animation: none !important; }
          .cta-pulse,
          .cta-cross { display: none; }
        }
      `}</style>
    </section>
  );
}
