import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const linkStyle = {
  color: "#8f8f97",
  fontFamily: '"Geist", sans-serif',
  fontSize: "13px",
  fontWeight: 500,
  lineHeight: 1,
  textDecoration: "none",
  transition: "color 180ms ease",
};

export default function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="landing-header">
      <motion.nav
        className="landing-nav"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link to="/" className="landing-logo" aria-label="Setu home">
          <img src="/Setu_Icon.svg" alt="" />
        </Link>

        <div className="landing-nav-links">
          <motion.a
            href="https://docs.setu.dev"
            target="_blank"
            rel="noreferrer"
            style={linkStyle}
            whileHover={{ y: -1 }}
            onMouseEnter={(event) => (event.currentTarget.style.color = "#fff")}
            onMouseLeave={(event) =>
              (event.currentTarget.style.color = "#8f8f97")
            }
          >
            Docs
          </motion.a>
          <motion.a
            href="https://github.com/JejurkarYash/setu"
            target="_blank"
            rel="noreferrer"
            style={linkStyle}
            whileHover={{ y: -1 }}
            onMouseEnter={(event) => (event.currentTarget.style.color = "#fff")}
            onMouseLeave={(event) =>
              (event.currentTarget.style.color = "#8f8f97")
            }
          >
            Github
          </motion.a>
        </div>

        <motion.div
          className="landing-nav-cta-wrap "
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          style={{ marginBottom: "2px" }}
        >
          <Link to="/dashboard" className="landing-nav-cta">
            Get Started
          </Link>
        </motion.div>

        <button
          type="button"
          className="landing-menu-button"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
        >
          {mobileMenuOpen ? "×" : "☰"}
        </button>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="landing-mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <a href="https://docs.setu.dev" target="_blank" rel="noreferrer">
              Docs
            </a>
            <a
              href="https://github.com/JejurkarYash/setu"
              target="_blank"
              rel="noreferrer"
            >
              Github
            </a>
            <Link to="/dashboard">Get Started</Link>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .landing-header {
          position: relative;
          z-index: 10;
          font-family: "Geist", sans-serif;
          margin-left: clamp(20px, 6.5vw, 88px);
          margin-right: clamp(20px, 2.5vw, 32px);
          border-left: 1px solid #19191d;
        }

        .landing-nav {
          position: relative;
          height: 68px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 22px;
          border-bottom: 1px solid #19191d;
        }

        .landing-logo {
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .landing-logo img {
          width: 54px;
          height: 54px;
          object-fit: contain;
        }

        .landing-nav-links {
          position: absolute;
          top: 50%;
          left: 50%;
          display: flex;
          align-items: center;
          gap: 30px;
          transform: translate(-50%, -50%);
        }

        .landing-nav-cta-wrap {
          position: absolute;
          right: clamp(18px, 7.5vw, 102px);
          top: 0;
          bottom: 0;
          display: flex;
          align-items: center;
        }

        .landing-nav-cta {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 102px;
          height: 30px;
          padding: 9px 16px;
          overflow: hidden;
          background: #fff;
          color: #080808;
          font-family: "Geist", sans-serif;
          font-weight: 600;
          font-size: 11px;
          line-height: 1;
          text-align: center;
          text-decoration: none;
          transition: color 220ms ease, background 220ms ease, box-shadow 220ms ease,
            transform 220ms ease;
        }

        .landing-nav-cta::after {
          position: absolute;
          top: 0;
          bottom: 0;
          left: -45%;
          width: 28%;
          content: "";
          background: linear-gradient(
            90deg,
            transparent,
            rgba(232, 121, 249, 0.8),
            transparent
          );
          transform: skewX(-20deg);
          transition: left 450ms ease;
        }

        .landing-nav-cta:hover {
          background: #f0abfc;
          box-shadow: 0 0 24px rgba(232, 121, 249, 0.3);
          transform: translateY(-2px);
        }

        .landing-nav-cta:hover::after {
          left: 125%;
        }

        .landing-menu-button,
        .landing-mobile-menu {
          display: none;
        }

        @media (max-width: 700px) {
          .landing-header {
            margin-left: 0;
            margin-right: 0;
          }

          .landing-nav {
            position: relative;
            padding: 0 20px;
          }

          .landing-logo,
          .landing-logo img {
            width: 48px;
            height: 48px;
          }

          .landing-nav-links,
          .landing-nav-cta-wrap {
            display: none;
          }

          .landing-menu-button {
            display: block;
            border: 0;
            background: transparent;
            color: #fff;
            cursor: pointer;
            font-size: 24px;
            line-height: 1;
          }

          .landing-nav-cta {
            height: 28px;
          }

          .landing-mobile-menu {
            position: absolute;
            top: 78px;
            right: 16px;
            left: 16px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 22px;
            border: 1px solid #242429;
            background: #080808;
          }

          .landing-mobile-menu a {
            color: #fff;
            font-size: 15px;
            text-decoration: none;
          }
        }
      `}</style>
    </header>
  );
}
