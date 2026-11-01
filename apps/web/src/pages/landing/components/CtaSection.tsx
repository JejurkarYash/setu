import { motion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const githubUrl = "https://github.com/JejurkarYash/setu";

export default function CtaSection() {
  return (
    <motion.section
      className="landing-final-cta"
      id="get-started"
      data-chapter="06 / DEPLOY"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={contentVariants}
    >
      <div className="landing-final-cta-grid" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <svg viewBox="0 0 760 220" fill="none">
          <path d="M0 110h260l74-74h166l74 74h186" />
          <path d="M0 110h260l74 74h166l74-74h186" />
          <circle cx="334" cy="36" r="3" />
          <circle cx="500" cy="184" r="3" />
        </svg>
      </div>

      <motion.div className="landing-final-cta-content" variants={itemVariants}>
        <p className="landing-final-cta-eyebrow">READY TO GET STARTED?</p>
        <h2>Stop managing integrations. Start building.</h2>
        <p className="landing-final-cta-description">
          Bring your LLM traffic, usage, and spending under one unified
          gateway.
        </p>

        <motion.div className="landing-final-cta-actions" variants={itemVariants}>
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Link to="/dashboard" className="landing-primary-action">
              <span>Get Started</span>
              <svg
                className="action-arrow-icon"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
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
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="landing-secondary-action"
            >
              <svg
                className="landing-github-icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
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

      <style>{`
        .landing-final-cta {
          position: relative;
          isolation: isolate;
          min-height: 460px;
          margin: 0 clamp(20px, 2.5vw, 32px) 0 clamp(20px, 6.5vw, 88px);
          border-left: 1px solid #19191d;
          border-top: 1px solid #19191d;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          background: #070707;
          font-family: "Geist", sans-serif;
        }

        .landing-final-cta::before {
          position: absolute;
          inset: 0;
          content: "";
          pointer-events: none;
          background: linear-gradient(180deg, rgba(255,255,255,0.015), transparent 42%);
        }

        .landing-final-cta-content {
          position: relative;
          z-index: 1;
          width: min(760px, calc(100% - 40px));
          margin-left: clamp(24px, 8vw, 120px);
          text-align: left;
        }

        .landing-final-cta-eyebrow {
          margin: 0 0 22px;
          color: #8f8f97;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.16em;
        }

        .landing-final-cta h2 {
          margin: 0;
          color: #f4f4f5;
          font-size: clamp(36px, 5vw, 64px);
          font-weight: 500;
          letter-spacing: -0.055em;
          line-height: 1.02;
        }

        .landing-final-cta-description {
          max-width: 430px;
          margin: 24px 0 0;
          color: #8f8f97;
          font-size: 15px;
          line-height: 1.65;
        }

        .landing-final-cta-actions {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 14px;
          margin-top: 34px;
        }

        .landing-final-cta .landing-secondary-action {
          min-width: 164px;
        }

        .landing-final-cta-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.48;
        }

        .landing-final-cta-grid span {
          position: absolute;
          width: 5px;
          height: 5px;
          border: 1px solid #3a3a42;
          background: #060508;
        }

        .landing-final-cta-grid span:nth-child(1) { top: 24%; left: 18%; }
        .landing-final-cta-grid span:nth-child(2) { top: 24%; right: 18%; }
        .landing-final-cta-grid span:nth-child(3) { bottom: 24%; left: 18%; }
        .landing-final-cta-grid span:nth-child(4) { bottom: 24%; right: 18%; }

        .landing-final-cta-grid svg {
          position: absolute;
          top: 50%;
          left: 50%;
          width: min(760px, 92%);
          height: 220px;
          transform: translate(-50%, -50%);
        }

        .landing-final-cta-grid path {
          stroke: #1d1d23;
          stroke-width: 1;
          stroke-dasharray: 2 8;
        }

        .landing-final-cta-grid circle {
          fill: #45454f;
        }

        .landing-final-cta a:focus-visible {
          outline: 2px solid #f0abfc;
          outline-offset: 4px;
        }

        @media (max-width: 640px) {
          .landing-final-cta {
            min-height: 500px;
            margin-left: 0;
            margin-right: 0;
            padding: 64px 20px;
          }

          .landing-final-cta-content {
            width: 100%;
            margin-left: 0;
          }

          .landing-final-cta h2 {
            font-size: clamp(34px, 10vw, 48px);
          }

          .landing-final-cta-actions {
            flex-direction: column;
            align-items: stretch;
            margin-top: 30px;
          }

          .landing-final-cta {
            justify-content: center;
          }

          .landing-final-cta-actions > div {
            width: 100%;
          }

          .landing-final-cta .landing-primary-action,
          .landing-final-cta .landing-secondary-action {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .landing-final-cta-grid svg {
            display: none;
          }
        }
      `}</style>
    </motion.section>
  );
}
