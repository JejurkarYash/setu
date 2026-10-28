import { motion } from "framer-motion";

const features = ["Unified Routing", "Usage Visibility", "Budget Protection"];

const paths = [
  "M80 86 C170 30 205 116 315 128",
  "M80 142 C175 176 210 96 315 128",
  "M80 198 C175 120 220 166 315 128",
  "M315 128 C430 54 488 84 610 72",
  "M315 128 C430 112 500 128 610 128",
  "M315 128 C430 148 490 170 610 188",
];

const reveal = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

function FlowParticle({ path, delay }: { path: string; delay: number }) {
  return (
    <circle r="2.2" fill="#E879F9">
      <animateMotion
        dur="5.8s"
        begin={`${delay}s`}
        repeatCount="indefinite"
        path={path}
      />
      <animate
        attributeName="opacity"
        values="0;0.9;0.9;0"
        keyTimes="0;0.18;0.72;1"
        dur="5.8s"
        begin={`${delay}s`}
        repeatCount="indefinite"
      />
    </circle>
  );
}

export default function ProblemSolutionSection() {
  return (
    <section className="problem-solution-section" id="how-it-works">
      <motion.div
        className="problem-solution-inner"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.18 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12 } },
        }}
      >
        <motion.div className="problem-solution-copy" variants={reveal}>
          <p className="problem-solution-eyebrow">THE SETU APPROACH</p>
          <h2>Your LLM traffic. Under control.</h2>
          <p>
            One gateway for routing requests, tracking usage, and controlling
            spend.
          </p>
        </motion.div>

        <motion.div className="system-visual" variants={reveal}>
          <svg
            className="system-visual-canvas"
            viewBox="0 0 690 250"
            role="img"
            aria-label="Requests flow from multiple APIs through the Setu Gateway and out to LLM providers"
          >
            <defs>
              <linearGradient id="setu-flow-gradient" x1="0" x2="1">
                <stop offset="0" stopColor="#7C3AED" stopOpacity="0.35" />
                <stop offset="0.55" stopColor="#E879F9" />
                <stop offset="1" stopColor="#67E8F9" stopOpacity="0.5" />
              </linearGradient>
              <filter id="setu-flow-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g className="system-grid">
              <path d="M0 42H690M0 84H690M0 126H690M0 168H690M0 210H690" />
              <path d="M80 0V250M160 0V250M240 0V250M320 0V250M400 0V250M480 0V250M560 0V250" />
            </g>

            <g className="system-paths" fill="none">
              {paths.map((path, index) => (
                <path
                  key={path}
                  d={path}
                  className={index === 0 || index === 4 ? "system-path-primary" : ""}
                />
              ))}
            </g>

            <g filter="url(#setu-flow-glow)">
              <FlowParticle path={paths[0]} delay={0} />
              <FlowParticle path={paths[1]} delay={1.7} />
              <FlowParticle path={paths[2]} delay={3.1} />
              <FlowParticle path={paths[3]} delay={2.2} />
              <FlowParticle path={paths[4]} delay={0.8} />
              <FlowParticle path={paths[5]} delay={3.8} />
            </g>

            <g className="system-endpoints">
              <text x="20" y="72">MULTIPLE APIs</text>
              <text x="20" y="128">SCATTERED USAGE</text>
              <text x="20" y="184">UNCONTROLLED SPEND</text>
              <text x="526" y="57">PROVIDER A</text>
              <text x="526" y="113">PROVIDER B</text>
              <text x="526" y="173">PROVIDER C</text>
            </g>

            <g className="system-gateway">
              <rect x="274" y="92" width="82" height="72" />
              <rect x="283" y="101" width="64" height="54" />
              <text x="315" y="126">SETU</text>
              <text x="315" y="142">GATEWAY</text>
            </g>
          </svg>
        </motion.div>

        <motion.div className="system-features" variants={reveal}>
          {features.map((feature) => (
            <span key={feature}>{feature}</span>
          ))}
        </motion.div>
      </motion.div>

      <style>{`
        .problem-solution-section {
          margin-left: clamp(20px, 6.5vw, 88px);
          margin-right: clamp(20px, 2.5vw, 32px);
          border-left: 1px solid #19191d;
          border-bottom: 1px solid #19191d;
          background: #050505;
          font-family: "Geist", sans-serif;
        }

        .problem-solution-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: clamp(84px, 10vw, 136px) clamp(22px, 6vw, 96px) 86px;
        }

        .problem-solution-copy {
          max-width: 650px;
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
          font-size: clamp(34px, 4vw, 56px);
          font-weight: 700;
          letter-spacing: -0.055em;
          line-height: 1.02;
        }

        .problem-solution-copy > p:last-child {
          max-width: 500px;
          margin: 20px 0 0;
          color: #8e8e98;
          font-size: 14px;
          line-height: 1.55;
        }

        .system-visual {
          margin-top: 68px;
          border-top: 1px solid #202026;
          border-bottom: 1px solid #202026;
          background: #07070a;
        }

        .system-visual-canvas {
          display: block;
          width: 100%;
          min-height: 250px;
          overflow: visible;
        }

        .system-grid path {
          fill: none;
          stroke: #17171d;
          stroke-width: 0.6;
        }

        .system-paths path {
          stroke: url(#setu-flow-gradient);
          stroke-width: 1.1;
          opacity: 0.42;
        }

        .system-paths .system-path-primary {
          stroke-width: 1.7;
          opacity: 0.72;
          filter: url(#setu-flow-glow);
        }

        .system-endpoints text,
        .system-gateway text {
          font-family: "JetBrains Mono", monospace;
          font-size: 8px;
          letter-spacing: 0.08em;
          text-anchor: middle;
        }

        .system-endpoints text {
          fill: #676771;
        }

        .system-gateway rect:first-child {
          fill: rgba(232, 121, 249, 0.08);
          stroke: rgba(232, 121, 249, 0.8);
          stroke-width: 1;
        }

        .system-gateway rect:nth-child(2) {
          fill: #08070b;
          stroke: rgba(232, 121, 249, 0.28);
          stroke-width: 1;
        }

        .system-gateway text {
          fill: #f0abfc;
        }

        .system-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          margin-top: 26px;
          border-bottom: 1px solid #202026;
        }

        .system-features span {
          padding: 18px 20px 20px;
          color: #a7a7b0;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-align: center;
        }

        .system-features span + span {
          border-left: 1px solid #202026;
        }

        @media (max-width: 700px) {
          .problem-solution-section {
            margin-left: 0;
            margin-right: 0;
          }

          .problem-solution-inner {
            padding: 72px 20px 64px;
          }

          .system-visual {
            margin-top: 48px;
            overflow-x: auto;
          }

          .system-visual-canvas {
            min-width: 620px;
          }

          .system-features span {
            padding: 16px 8px;
            font-size: 8px;
            letter-spacing: 0.04em;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .system-visual-canvas animateMotion,
          .system-visual-canvas animate {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
