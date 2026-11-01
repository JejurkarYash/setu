import { Link } from "react-router-dom";

const githubUrl = "https://github.com/JejurkarYash/setu";

export default function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-main">
        <div className="landing-footer-brand">
          <Link to="/" className="landing-footer-wordmark" aria-label="Setu home">
            <img src="/Setu_Icon.svg" alt="" />
            <span>Setu</span>
          </Link>
          <p>The control layer for your LLM infrastructure.</p>
        </div>

        <nav className="landing-footer-nav" aria-label="Footer navigation">
          <a href="https://docs.setu.dev" target="_blank" rel="noreferrer">
            Documentation
            <span aria-hidden="true">↗</span>
          </a>
          <a href={githubUrl} target="_blank" rel="noreferrer">
            GitHub
            <span aria-hidden="true">↗</span>
          </a>
          <Link to="/dashboard">
            Get Started
            <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </div>

      <div className="landing-footer-bottom">
        <span>© 2026 Setu. All rights reserved.</span>
        <span>Built for developers.</span>
      </div>

      <style>{`
        .landing-footer {
          margin: 0 clamp(20px, 2.5vw, 32px) 0 clamp(20px, 6.5vw, 88px);
          border-left: 1px solid #19191d;
          border-top: 1px solid #19191d;
          background: #070707;
          color: #8f8f97;
          font-family: "Geist", sans-serif;
        }

        .landing-footer-main,
        .landing-footer-bottom {
          max-width: 1280px;
          margin: 0 auto;
          padding-left: clamp(24px, 4vw, 64px);
          padding-right: clamp(24px, 4vw, 64px);
        }

        .landing-footer-main {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 48px;
          padding-top: 46px;
          padding-bottom: 44px;
        }

        .landing-footer-brand {
          min-width: 0;
        }

        .landing-footer-wordmark {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: #f4f4f5;
          font-size: 19px;
          font-weight: 600;
          letter-spacing: -0.035em;
          text-decoration: none;
        }

        .landing-footer-wordmark img {
          width: 28px;
          height: 28px;
          object-fit: contain;
        }

        .landing-footer-brand p {
          max-width: 285px;
          margin: 16px 0 0;
          color: #73737d;
          font-size: 13px;
          line-height: 1.55;
        }

        .landing-footer-nav {
          display: flex;
          align-items: center;
          gap: clamp(20px, 3vw, 42px);
          padding-top: 7px;
        }

        .landing-footer-nav a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #a1a1aa;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: color 180ms ease;
        }

        .landing-footer-nav a span {
          color: #666671;
          font-size: 12px;
          transition: color 180ms ease, transform 180ms ease;
        }

        .landing-footer-nav a:hover,
        .landing-footer-nav a:focus-visible {
          color: #f4f4f5;
        }

        .landing-footer-nav a:hover span,
        .landing-footer-nav a:focus-visible span {
          color: #67e8f9;
          transform: translate(1px, -1px);
        }

        .landing-footer-nav a:focus-visible,
        .landing-footer-wordmark:focus-visible {
          outline: 2px solid #f0abfc;
          outline-offset: 4px;
        }

        .landing-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-top: 1px solid #19191d;
          padding-top: 18px;
          padding-bottom: 20px;
          color: #5f5f69;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.01em;
        }

        @media (max-width: 640px) {
          .landing-footer {
            margin-left: 0;
            margin-right: 0;
          }

          .landing-footer-main {
            flex-direction: column;
            gap: 34px;
            padding-top: 42px;
            padding-bottom: 40px;
          }

          .landing-footer-nav {
            flex-wrap: wrap;
            gap: 18px 26px;
            padding-top: 0;
          }

          .landing-footer-bottom {
            align-items: flex-start;
            flex-direction: column;
            gap: 9px;
            line-height: 1.4;
          }
        }
      `}</style>
    </footer>
  );
}
