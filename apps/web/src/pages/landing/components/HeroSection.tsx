import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { Link } from "react-router-dom";
import FlowFieldBackground from "./FlowFieldBackground";
import ScrambleText from "./ScrambleText";

const heroCopyVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.08,
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Scroll parallax effect for multi-layered depth
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.2]);

  // High-performance RAF throttled mouse parallax tracking
  useEffect(() => {
    let animationFrameId: number;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetX = (e.clientX / innerWidth - 0.5) * 14;
      targetY = (e.clientY / innerHeight - 0.5) * 14;
    };

    const render = () => {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;
      setMousePosition({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <motion.section
      className="landing-hero"
      ref={containerRef}
      style={{ y: heroY, opacity: heroOpacity }}
    >
      <FlowFieldBackground />

      {/* Dynamic Interactive Spotlight Glow tracking cursor */}
      <div
        className="landing-cursor-spotlight"
        style={{
          transform: `translate3d(${mousePosition.x * 25}px, ${mousePosition.y * 25}px, 0px)`,
        }}
        aria-hidden="true"
      />

      {/* Cinematic Ambient Energy Core Glow */}
      <div className="landing-ambient-core" aria-hidden="true" />
      <div className="landing-ambient-core-secondary" aria-hidden="true" />

      <motion.div
        className="landing-hero-content"
        initial="hidden"
        animate="visible"
        variants={heroCopyVariants}
        style={{
          transform: `translate3d(${-mousePosition.x}px, ${-mousePosition.y}px, 0px)`,
        }}
      >
        <motion.div className="landing-hero-copy" variants={heroItemVariants}>
          {/* <motion.div
            className="landing-badge-wrapper"
            variants={heroItemVariants}
            whileHover={{ scale: 1.03 }}
          >
            <span className="badge-pulse-dot" />
            <span className="badge-text">
              GO-POWERED LLM GATEWAY & BUDGET SHIELD
            </span>
            <div className="badge-shimmer" />
          </motion.div> */}

          <motion.h1 variants={heroItemVariants}>
            <ScrambleText text="Never Get Surprised by" delay={200} />
            <br />
            <span className="landing-hero-accent-wrapper">
              <ScrambleText
                text="a Spiked LLM Bill Again."
                className="landing-hero-accent"
                delay={500}
              />
              <span className="accent-underline-glow" />
            </span>
          </motion.h1>

          <motion.p variants={heroItemVariants}>
            Setu sits between your application and providers to automatically
            block over-cap requests,
            <br className="landing-desktop-break" /> manage API keys, and track
            spend per project in real time with absolute cryptographic
            precision.
          </motion.p>
        </motion.div>

        <motion.div
          className="landing-hero-actions"
          variants={heroItemVariants}
        >
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
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <a
              href="https://github.com/JejurkarYash/setu"
              target="_blank"
              rel="noreferrer"
              className="landing-secondary-action hover:cursor-pointer"
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
              <span>Github</span>
              <motion.span
                className="github-star-badge"
                animate={{ scale: isHovered ? 1.08 : 1 }}
              >
                ★ Open Source
              </motion.span>
            </a>
          </motion.div>
        </motion.div>
      </motion.div>

      <style>{`
        .landing-hero {
          position: relative;
          isolation: isolate;
          font-family: "Geist", sans-serif;
          min-height: calc(92vh - 68px);
          margin-left: clamp(20px, 6.5vw, 88px);
          margin-right: clamp(20px, 2.5vw, 32px);
          border-left: 1px solid #19191d;
          border-bottom: 1px solid #19191d;
          display: flex;
          align-items: flex-end;
          padding: 0 0 57px;
          overflow: hidden;
          background-color: #060508;
        }

        /* Interactive Cursor Spotlight Glow */
        .landing-cursor-spotlight {
          position: absolute;
          top: 10%;
          left: 20%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, rgba(217, 70, 239, 0.03) 45%, transparent 75%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(50px);
          transition: transform 0.2s cubic-bezier(0.1, 0.8, 0.3, 1);
        }

        /* Cinematic Ambient Core Lighting */
        .landing-ambient-core {
          position: absolute;
          top: 10%;
          right: 10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(232, 121, 249, 0.1) 0%, rgba(124, 58, 237, 0.04) 50%, transparent 80%);
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: -1;
          animation: corePulse 7s ease-in-out infinite alternate;
        }

        .landing-ambient-core-secondary {
          position: absolute;
          bottom: -10%;
          left: 30%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(52, 211, 153, 0.05) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: -1;
          animation: corePulseSec 10s ease-in-out infinite alternate;
        }

        @keyframes corePulse {
          0% { transform: scale(0.85) translate(0, 0); opacity: 0.4; }
          100% { transform: scale(1.2) translate(-20px, 15px); opacity: 0.8; }
        }

        @keyframes corePulseSec {
          0% { transform: scale(0.9); opacity: 0.3; }
          100% { transform: scale(1.15); opacity: 0.6; }
        }

        .landing-flow-field {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -1;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }

        .landing-hero::before {
          position: absolute;
          inset: 0;
          z-index: -2;
          content: "";
          background-image: linear-gradient(
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.03) 1px,
              transparent 1px
            );
          background-position: 22px 0;
          background-size: 72px 72px;
          mask-image: linear-gradient(to bottom, transparent 2%, black 35%, black 100%);
        }

        .landing-hero-content {
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
          padding: 23px 22px 0;
          border-top: 1px solid #1c1c22;
          position: relative;
          z-index: 2;
          will-change: transform;
        }

        .landing-badge-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 6px 14px;
          margin-bottom: 18px;
          border-radius: 9999px;
          border: 1px solid rgba(232, 121, 249, 0.3);
          background: linear-gradient(90deg, rgba(232, 121, 249, 0.08), rgba(168, 85, 247, 0.03));
          font-family: "JetBrains Mono", monospace;
          font-size: 10.5px;
          letter-spacing: 0.08em;
          color: #f0abfc;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(232, 121, 249, 0.1);
          cursor: default;
        }

        .badge-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
          animation: badgeShimmer 3s ease-in-out infinite;
        }

        @keyframes badgeShimmer {
          0% { left: -100%; }
          30%, 100% { left: 200%; }
        }

        .badge-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #34D399;
          box-shadow: 0 0 10px #34D399;
          animation: dotBlink 2s ease-in-out infinite;
        }

        @keyframes dotBlink {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        .landing-hero-copy h1 {
          margin: 0;
          color: #f7f7f7;
          font-size: clamp(34px, 3.4vw, 40px);
          font-weight: 700;
          letter-spacing: -0.045em;
          line-height: 1.15;
        }

        .landing-hero-accent-wrapper {
          position: relative;
          display: inline-block;
        }

        .landing-hero-accent {
          color: #f0abfc;
          background: linear-gradient(105deg, #ffffff 10%, #f0abfc 48%, #c084fc 88%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 25px rgba(232, 121, 249, 0.25));
        }

        .accent-underline-glow {
          position: absolute;
          bottom: 2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, #e879f9, #34D399, transparent);
          opacity: 0.6;
          filter: blur(1px);
        }

        .landing-hero-copy p {
          margin: 15px 0 0;
          color: #a1a1aa;
          font-family: "Geist", sans-serif;
          font-size: 13px;
          line-height: 1.4;
          max-width: 580px;
        }

        .landing-hero-actions {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 0 clamp(0px, 7vw, 90px) 0 20px;
          transform: translateY(-8px);
        }

        /* Ultra High-End Clean Architectural Buttons */
        .landing-primary-action,
        .landing-secondary-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 50px;
          position: relative;
          overflow: hidden;
          text-decoration: none;
          font-family: "Geist", sans-serif;
          font-weight: 600;
          gap: 10px;
          font-size: 14.5px;
          border-radius: 0;
          transition: color 250ms ease, background 250ms ease, border-color 250ms ease,
            box-shadow 250ms ease, transform 250ms ease;
        }

        .landing-primary-action::after,
        .landing-secondary-action::after {
          position: absolute;
          top: 0;
          bottom: 0;
          left: -45%;
          width: 30%;
          content: "";
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          transform: skewX(-20deg);
          transition: left 550ms ease;
        }

        .landing-github-icon {
          width: 17px;
          height: 17px;
          flex: 0 0 auto;
        }

        .landing-primary-action {
          min-width: 150px;
          background: #ffffff;
          color: #08070b;
          padding: 0 24px;
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.12);
        }

        .action-arrow-icon {
          width: 15px;
          height: 15px;
          transition: transform 0.2s ease;
        }

        .landing-primary-action:hover .action-arrow-icon {
          transform: translateX(4px);
        }

        .landing-secondary-action {
          min-width: 140px;
          border: 1px solid #27272d;
          color: #e4e4e7;
          background: rgba(12, 11, 16, 0.9);
          padding: 0 20px;
        }

        .github-star-badge {
          font-size: 10px;
          font-family: "JetBrains Mono", monospace;
          background: rgba(232, 121, 249, 0.12);
          color: #f0abfc;
          padding: 2px 6px;
          border: 1px solid rgba(232, 121, 249, 0.25);
          margin-left: 2px;
        }

        .landing-primary-action:hover::after,
        .landing-secondary-action:hover::after {
          left: 130%;
        }

        .landing-primary-action:hover {
          background: #f0abfc;
          color: #08070b;
          box-shadow: 0 8px 30px rgba(232, 121, 249, 0.35);
        }

        .landing-secondary-action:hover {
          border-color: rgba(232, 121, 249, 0.6);
          color: #fff;
          background: #141318;
          box-shadow: 0 8px 30px rgba(232, 121, 249, 0.15);
        }

        @media (max-width: 768px) {
          .landing-hero {
            min-height: calc(100vh - 68px);
            margin-left: 0;
            margin-right: 0;
            padding: 0 20px 40px;
          }

          .landing-flow-field {
            bottom: 0;
            height: 100%;
          }

          .landing-hero-content {
            align-items: flex-start;
            flex-direction: column;
            padding: 24px 0 0;
            transform: none !important;
          }

          .landing-hero-copy h1 {
            font-size: clamp(30px, 8.5vw, 40px);
          }

          .landing-desktop-break {
            display: none;
          }

          .landing-hero-copy p {
            max-width: 100%;
            font-size: 13px;
            line-height: 1.5;
          }

          .landing-hero-actions {
            width: 100%;
            padding: 0;
            transform: none;
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .landing-primary-action,
          .landing-secondary-action {
            width: 100%;
            height: 48px;
            font-size: 14px;
          }
        }
      `}</style>
    </motion.section>
  );
}
