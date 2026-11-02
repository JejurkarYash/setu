import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

const githubUrl = "https://github.com/JejurkarYash/setu";
const profileUrl = "https://github.com/JejurkarYash";

export default function LandingFooter() {
  const reduceMotion = Boolean(useReducedMotion());

  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <footer className="lf-footer">
      <motion.div
        className="lf-main"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="lf-brand">
          <Link to="/" className="lf-wordmark" aria-label="Setu home">
            <img src="/Setu_Icon.svg" alt="" />
            <span>Setu</span>
          </Link>
          <p>The control layer for your LLM infrastructure.</p>
        </div>

        <nav className="lf-nav" aria-label="Footer navigation">
          <Link to="/docs">
            Documentation
            <span aria-hidden="true">↗</span>
          </Link>
          <a href={githubUrl} target="_blank" rel="noreferrer">
            GitHub
            <span aria-hidden="true">↗</span>
          </a>
          <Link to={localStorage.getItem("token") ? "/dashboard" : "/login"}>
            Get Started
            <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </motion.div>

      <div className="lf-bottom">
        <span>© {new Date().getFullYear()} Setu. All rights reserved.</span>
        <a
          className="lf-credit"
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Built by Yash Jejurkar on GitHub"
        >
          <span className="lf-credit-label">BUILT BY</span>
          <span className="lf-credit-name">Yash Jejurkar</span>
          <span className="lf-credit-mark" aria-hidden="true">↗</span>
        </a>
        <span className="lf-tagline">Built for developers.</span>
        <button type="button" className="lf-top" onClick={backToTop}>
          Back to top <span aria-hidden="true">↑</span>
        </button>
      </div>

      <style>{`
        .lf-footer {
          position: relative;
          margin: 0 clamp(20px, 2.5vw, 32px) 0 clamp(20px, 6.5vw, 88px);
          border-left: 1px solid #19191d;
          border-top: 1px solid #19191d;
          background: #050505;
          color: #8f8f97;
          font-family: "Geist", sans-serif;
        }

        /* the same short cyan segment that opens the page's windows */
        .lf-footer::before {
          position: absolute;
          top: -1px;
          left: 20px;
          width: 72px;
          height: 1px;
          content: "";
          background: #67e8f9;
        }

        .lf-main,
        .lf-bottom {
          max-width: 1280px;
          margin: 0 auto;
          padding-right: clamp(24px, 4vw, 64px);
          padding-left: clamp(24px, 4vw, 64px);
        }

        .lf-main {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 48px;
          padding-top: 48px;
          padding-bottom: 46px;
        }

        .lf-brand { min-width: 0; }

        .lf-wordmark {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #f4f4f5;
          font-size: 19px;
          font-weight: 600;
          letter-spacing: -0.035em;
          text-decoration: none;
        }

        .lf-wordmark img { width: 28px; height: 28px; object-fit: contain; }

        .lf-brand p {
          max-width: 285px;
          margin: 16px 0 0;
          color: #73737d;
          font-size: 13px;
          line-height: 1.55;
        }

        .lf-nav { display: flex; align-items: center; gap: clamp(20px, 3vw, 42px); padding-top: 7px; }

        .lf-nav a {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 0;
          color: #a1a1aa;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: color 200ms ease;
        }

        /* a cyan hairline draws under the hovered link */
        .lf-nav a::after {
          position: absolute;
          right: 0;
          bottom: 1px;
          left: 0;
          height: 1px;
          content: "";
          background: #67e8f9;
          opacity: 0.7;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 340ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .lf-nav a span { color: #666671; font-size: 12px; transition: color 200ms ease, transform 200ms ease; }

        .lf-nav a:hover,
        .lf-nav a:focus-visible { color: #f4f4f5; }
        .lf-nav a:hover::after,
        .lf-nav a:focus-visible::after { transform: scaleX(1); }
        .lf-nav a:hover span,
        .lf-nav a:focus-visible span { color: #67e8f9; transform: translate(1px, -1px); }

        .lf-nav a:focus-visible,
        .lf-wordmark:focus-visible,
        .lf-credit:focus-visible,
        .lf-top:focus-visible { outline: 2px solid #f0abfc; outline-offset: 4px; }

        .lf-bottom {
          display: grid;
          grid-template-columns: 1fr auto auto 1fr;
          align-items: center;
          gap: 20px;
          padding-top: 16px;
          padding-bottom: 18px;
          border-top: 1px solid #19191d;
          color: #5f5f69;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.01em;
        }

        .lf-tagline { text-align: center; }

        .lf-credit {
          display: inline-flex;
          align-items: baseline;
          gap: 7px;
          color: #73737d;
          text-decoration: none;
          transition: color 200ms ease;
        }

        .lf-credit-label {
          color: #565d66;
          font-size: 8px;
          letter-spacing: 0.14em;
        }

        .lf-credit-name { color: #a1a1aa; transition: color 200ms ease; }
        .lf-credit-mark { color: #565d66; transition: color 200ms ease, transform 200ms ease; }

        .lf-credit:hover,
        .lf-credit:focus-visible { color: #f4f4f5; }
        .lf-credit:hover .lf-credit-name,
        .lf-credit:focus-visible .lf-credit-name { color: #f4f4f5; }
        .lf-credit:hover .lf-credit-mark,
        .lf-credit:focus-visible .lf-credit-mark { color: #67e8f9; transform: translate(1px, -1px); }

        .lf-top {
          justify-self: end;
          padding: 4px 0;
          border: 0;
          background: transparent;
          color: #73737d;
          font-family: inherit;
          font-size: inherit;
          letter-spacing: inherit;
          cursor: pointer;
          transition: color 200ms ease;
        }

        .lf-top span { display: inline-block; transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1); }
        .lf-top:hover { color: #f4f4f5; }
        .lf-top:hover span { transform: translateY(-2px); }

        @media (max-width: 640px) {
          .lf-footer { margin-left: 0; margin-right: 0; border-left: 0; }
          .lf-main { flex-direction: column; gap: 34px; padding-top: 42px; padding-bottom: 40px; }
          .lf-nav { flex-wrap: wrap; gap: 14px 26px; padding-top: 0; }

          .lf-bottom {
            grid-template-columns: 1fr;
            justify-items: start;
            gap: 9px;
            line-height: 1.4;
          }

          .lf-tagline { text-align: left; }
          .lf-credit { order: 3; }
          .lf-top { justify-self: start; }
        }

        @media (prefers-reduced-motion: reduce) {
          .lf-nav a::after,
          .lf-nav a span,
          .lf-credit-mark,
          .lf-top span { transition: none; }
        }
      `}</style>
    </footer>
  );
}
