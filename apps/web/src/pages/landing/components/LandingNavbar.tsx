import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";

const DOCS_URL = "https://docs.setu.dev";
const GITHUB_URL = "https://github.com/JejurkarYash/setu";
const ease = [0.16, 1, 0.3, 1] as const;

export default function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const reduceMotion = useReducedMotion();

  // The cyan hairline under the bar is the route: it advances as the page does.
  // Pure transform (scaleX), so scrolling never triggers layout.
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
  });

  // Only flips a boolean when crossing the threshold, not on every scroll event.
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  const close = () => setMobileMenuOpen(false);

  return (
    <header className={`landing-header${stuck ? " is-stuck" : ""}`}>
      <motion.nav
        className="landing-nav"
        aria-label="Primary"
        initial={reduceMotion ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
      >
        <Link to="/" className="landing-logo" aria-label="Setu home">
          <img src="/Setu_Icon.svg" alt="" />
        </Link>

        <div className="landing-nav-links">
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="landing-nav-link"
          >
            Docs
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="landing-nav-link"
          >
            Github
          </a>
        </div>

        <div className="landing-nav-cta-wrap">
          <Link to="/dashboard" className="landing-nav-cta">
            Get Started
          </Link>
        </div>

        <button
          type="button"
          className="landing-menu-button"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="landing-mobile-menu"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span
            className={`menu-icon${mobileMenuOpen ? " is-open" : ""}`}
            aria-hidden="true"
          >
            <i />
            <i />
          </span>
        </button>

        {!reduceMotion && (
          <motion.span
            className="landing-route"
            style={{ scaleX: progress }}
            aria-hidden="true"
          />
        )}
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="landing-mobile-menu"
            className="landing-mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease }}
          >
            <a href={DOCS_URL} target="_blank" rel="noreferrer" onClick={close}>
              Docs
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              onClick={close}
            >
              Github
            </a>
            <Link to="/dashboard" onClick={close}>
              Get Started
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .landing-header {
          position: sticky;
          top: 0;
          z-index: 50;
          margin-left: clamp(20px, 6.5vw, 88px);
          margin-right: clamp(20px, 2.5vw, 32px);
          border-left: 1px solid #19191d;
          background: #050505;
          font-family: "Geist", sans-serif;
          transition: background 300ms ease;
        }

        .landing-header.is-stuck { background: rgba(5, 5, 5, 0.94); }

        .landing-nav {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
          padding: 0 22px;
          border-bottom: 1px solid #19191d;
          transition: height 350ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .landing-header.is-stuck .landing-nav { height: 58px; }

        .landing-logo,
        .landing-logo img { width: 54px; height: 54px; transition: width 350ms cubic-bezier(0.16, 1, 0.3, 1), height 350ms cubic-bezier(0.16, 1, 0.3, 1); }
        .landing-header.is-stuck .landing-logo,
        .landing-header.is-stuck .landing-logo img { width: 46px; height: 46px; }

        .landing-logo { display: flex; align-items: center; justify-content: center; }
        .landing-logo img { object-fit: contain; }

        .landing-nav-links {
          position: absolute;
          top: 50%;
          left: 50%;
          display: flex;
          align-items: center;
          gap: 30px;
          transform: translate(-50%, -50%);
        }

        .landing-nav-link {
          position: relative;
          padding: 8px 0;
          color: #8f8f97;
          font-size: 13px;
          font-weight: 500;
          line-height: 1;
          text-decoration: none;
          transition: color 200ms ease;
        }

        .landing-nav-link::after {
          position: absolute;
          right: 0;
          bottom: 1px;
          left: 0;
          height: 1px;
          content: "";
          background: #67e8f9;
          opacity: 0.75;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 340ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .landing-nav-link:hover,
        .landing-nav-link:focus-visible { color: #fff; }
        .landing-nav-link:hover::after,
        .landing-nav-link:focus-visible::after { transform: scaleX(1); }

        .landing-nav-link:focus-visible,
        .landing-nav-cta:focus-visible,
        .landing-menu-button:focus-visible { outline: 2px solid #f0abfc; outline-offset: 4px; }

        .landing-nav-cta-wrap {
          position: absolute;
          top: 0;
          right: clamp(18px, 7.5vw, 102px);
          bottom: 0;
          display: flex;
          align-items: center;
        }

        .landing-nav-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 102px;
          height: 30px;
          padding: 0 16px;
          background: #fff;
          color: #080808;
          font-size: 11px;
          font-weight: 600;
          line-height: 1;
          text-decoration: none;
          transition: background 220ms ease, transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .landing-nav-cta:hover { background: #f0abfc; transform: translateY(-2px); }

        /* scroll route, drawn over the bottom border */
        .landing-route {
          position: absolute;
          right: 0;
          bottom: -1px;
          left: 0;
          height: 1px;
          background: linear-gradient(90deg, rgba(103, 232, 249, 0.15), #67e8f9);
          transform-origin: left;
          pointer-events: none;
        }

        .landing-menu-button,
        .landing-mobile-menu { display: none; }

        @media (max-width: 700px) {
          .landing-header { margin-left: 0; margin-right: 0; border-left: 0; }
          .landing-nav { padding: 0 20px; }
          .landing-header.is-stuck .landing-nav { height: 56px; }
          .landing-logo,
          .landing-logo img { width: 46px; height: 46px; }
          .landing-header.is-stuck .landing-logo,
          .landing-header.is-stuck .landing-logo img { width: 42px; height: 42px; }
          .landing-nav-links,
          .landing-nav-cta-wrap { display: none; }

          .landing-menu-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            margin-right: -10px;
            border: 0;
            background: transparent;
            color: #fff;
            cursor: pointer;
          }

          .menu-icon { position: relative; width: 20px; height: 12px; }
          .menu-icon i {
            position: absolute;
            left: 0;
            width: 100%;
            height: 1.5px;
            background: currentColor;
            transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1), top 320ms cubic-bezier(0.16, 1, 0.3, 1);
          }
          .menu-icon i:first-child { top: 0; }
          .menu-icon i:last-child { top: 10px; }
          .menu-icon.is-open i:first-child { top: 5px; transform: rotate(45deg); }
          .menu-icon.is-open i:last-child { top: 5px; transform: rotate(-45deg); }

          .landing-mobile-menu {
            position: absolute;
            top: calc(100% + 8px);
            right: 16px;
            left: 16px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 22px;
            border: 1px solid #202026;
            background: #08080b;
          }

          .landing-mobile-menu a { color: #e4e4e7; font-size: 15px; text-decoration: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .landing-nav,
          .landing-logo,
          .landing-logo img,
          .landing-nav-link::after,
          .menu-icon i,
          .landing-nav-cta { transition: none; }
        }
      `}</style>
    </header>
  );
}
