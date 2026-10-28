import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import FlowFieldBackground from "./FlowFieldBackground";
import ScrambleText from "./ScrambleText";

const heroCopyVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delayChildren: 0.12,
      staggerChildren: 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function HeroSection() {
  return (
    <section className="landing-hero">
      <FlowFieldBackground />

      <motion.div
        className="landing-hero-content"
        initial="hidden"
        animate="visible"
        variants={heroCopyVariants}
      >
        <motion.div className="landing-hero-copy" variants={heroItemVariants}>
          <motion.h1 variants={heroItemVariants}>
            <ScrambleText text="Never Get Surprised by" delay={260} />
            <br />
            <ScrambleText
              text="a Spiked LLM Bill Again."
              className="landing-hero-accent"
              delay={620}
            />
          </motion.h1>
          <motion.p variants={heroItemVariants}>
            Setu sits between your application and providers to automatically
            block over-cap requests,
            <br className="landing-desktop-break" /> manage API keys, and track
            spend per project in real time.
          </motion.p>
        </motion.div>

        <motion.div className="landing-hero-actions" variants={heroItemVariants}>
          <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 24 }}
          >
            <Link to="/dashboard" className="landing-primary-action">
              Get Started
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 24 }}
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
              Github
            </a>
          </motion.div>
        </motion.div>
      </motion.div>

      <style>{`
        .landing-hero {
          position: relative;
          isolation: isolate;
          font-family: "Geist", sans-serif;
          min-height: calc(100vh - 68px);
          margin-left: clamp(20px, 6.5vw, 88px);
          margin-right: clamp(20px, 2.5vw, 32px);
          border-left: 1px solid #19191d;
          border-bottom: 1px solid #19191d;
          display: flex;
          align-items: flex-end;
          padding: 0 0 57px;
          overflow: hidden;
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
              rgba(255, 255, 255, 0.025) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.025) 1px,
              transparent 1px
            );
          background-position: 22px 0;
          background-size: 72px 72px;
          mask-image: linear-gradient(to bottom, transparent 4%, black 38%, black 100%);
        }

        .landing-hero-content {
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
          padding: 23px 22px 0;
          border-top: 1px solid #19191d;
          position: relative;
          z-index: 2;
        }

        .landing-hero-copy h1 {
          margin: 0;
          color: #f7f7f7;
          font-size: clamp(32px, 3.2vw, 37px);
          font-weight: 700;
          letter-spacing: -0.045em;
          line-height: 1.16;
        }

        .landing-hero-accent {
          color: #f0abfc;
          background: linear-gradient(100deg, #f7f7f7 15%, #f0abfc 52%, #d8b4fe 85%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .landing-hero-copy p {
          margin: 13px 0 0;
          color: #d1d1d5;
          font-family: "Geist", sans-serif;
          font-size: 12px;
          line-height: 1.25;
          max-width: 560px;
        }

        .landing-hero-actions {
          display: flex;
          align-items: center;
          gap: 26px;
          padding: 0 clamp(0px, 7.5vw, 103px) 0 20px;
          transform: translateY(-10px);
        }

        /* Sharper, clean rectangular buttons */
        .landing-primary-action,
        .landing-secondary-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 48px;
          position: relative;
          overflow: hidden;
          text-decoration: none;
          font-family: "Geist", sans-serif;
          font-weight: 600;
          gap: 9px;
          font-size: 15px;
          border-radius: 0;
          transition: color 220ms ease, background 220ms ease, border-color 220ms ease,
            box-shadow 220ms ease, transform 220ms ease;
        }

        .landing-primary-action::after,
        .landing-secondary-action::after {
          position: absolute;
          top: 0;
          bottom: 0;
          left: -45%;
          width: 28%;
          content: "";
          background: linear-gradient(
            90deg,
            transparent,
            rgba(232, 121, 249, 0.85),
            transparent
          );
          transform: skewX(-20deg);
          transition: left 450ms ease;
        }

        .landing-github-icon {
          width: 17px;
          height: 17px;
          flex: 0 0 auto;
        }

        .landing-primary-action {
          min-width: 139px;
          background: #fff;
          color: #171717;
        }

        .landing-secondary-action {
          min-width: 100px;
          border: 1px solid #242429;
          color: #e8e8e8;
          background: rgba(8, 8, 8, 0.85);
        }

        .landing-primary-action:hover,
        .landing-secondary-action:hover {
          transform: translateY(-3px);
        }

        .landing-primary-action:hover::after,
        .landing-secondary-action:hover::after {
          left: 125%;
        }

        .landing-primary-action:hover {
          background: #f0abfc;
          box-shadow: 0 10px 28px rgba(232, 121, 249, 0.2);
        }

        .landing-secondary-action:hover {
          border-color: #e879f9;
          color: #fff;
          background: #17171b;
          box-shadow: 0 10px 28px rgba(232, 121, 249, 0.12);
        }

        @media (max-width: 700px) {
          .landing-hero {
            min-height: calc(100vh - 68px);
            margin-left: 0;
            margin-right: 0;
            padding: 0 20px 36px;
          }

          .landing-flow-field {
            bottom: 0;
            height: 100%;
          }

          .landing-hero-content {
            align-items: flex-start;
            flex-direction: column;
            padding: 24px 0 0;
          }

          .landing-hero-copy h1 {
            font-size: clamp(30px, 9vw, 42px);
          }

          .landing-desktop-break {
            display: none;
          }

          .landing-hero-copy p {
            max-width: 500px;
            font-size: 13px;
            line-height: 1.45;
          }

          .landing-hero-actions {
            width: 100%;
            padding: 0;
            transform: none;
          }

          .landing-primary-action,
          .landing-secondary-action {
            height: 46px;
            font-size: 14px;
          }
        }
      `}</style>
    </section>
  );
}