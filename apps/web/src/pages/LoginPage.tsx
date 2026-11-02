import { motion, useReducedMotion } from "framer-motion";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function LoginPage() {
  const reduceMotion = Boolean(useReducedMotion());
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const destination =
    (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)
      ?.from;
  const redirectTo = destination?.pathname
    ? `${destination.pathname}${destination.search ?? ""}${destination.hash ?? ""}`
    : "/dashboard";

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      setError("Google did not return an identity token. Please try again.");
      return;
    }

    setError(null);
    setIsSigningIn(true);

    try {
      const result = await api.post<{ token: string }>("/user/google", {
        id_token: response.credential,
      });

      if (!result.data.token) {
        throw new Error("The authentication server did not return a session token.");
      }

      localStorage.setItem("token", result.data.token);
      navigate(redirectTo, { replace: true });
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Unable to complete Google sign-in. Please try again.",
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <main className="login-page" aria-label="Log in to Setu">
      <div className="login-grid" aria-hidden="true" />
      <header className="login-header">
        <Link to="/" className="login-brand" aria-label="Setu home">
          <img src="/Setu_Icon.svg" alt="" />
          <span>Setu</span>
        </Link>
        <span className="login-header-meta">AUTH / 001</span>
      </header>

      <div className="login-layout">
        <motion.section
          className="login-copy"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="login-eyebrow">
            <span className="login-status-dot" />
            SETU / CONTROL PLANE
          </p>
          <h1>
            Your gateway
            <br />
            starts here.
          </h1>
          <p className="login-description">
            Sign in to route requests, understand usage, and keep your LLM
            infrastructure under control.
          </p>
        </motion.section>

        <motion.section
          className="login-panel"
          initial={reduceMotion ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="login-panel-top">
            <span>IDENTITY GATEWAY</span>
            <span>READY</span>
          </div>

          <div className="login-machine" aria-hidden="true">
            <svg viewBox="0 0 520 230" fill="none">
              <path className="login-route login-route-a" d="M0 48H165L220 103" />
              <path className="login-route login-route-b" d="M0 115H180" />
              <path className="login-route login-route-c" d="M0 182H165L220 127" />
              <path className="login-route login-route-a" d="M300 103L355 48H520" />
              <path className="login-route login-route-b" d="M340 115H520" />
              <path className="login-route login-route-c" d="M300 127L355 182H520" />
              <path className="login-guide" d="M165 22V208M355 22V208" />
              <rect x="220" y="58" width="80" height="114" className="login-gate" />
              <rect x="234" y="72" width="52" height="86" className="login-gate-inner" />
              <path className="login-gate-mark" d="M260 87V143M247 115H273" />
              <circle cx="0" cy="48" r="3" className="login-node" />
              <circle cx="0" cy="115" r="3" className="login-node" />
              <circle cx="0" cy="182" r="3" className="login-node" />
              <circle cx="520" cy="48" r="3" className="login-node login-node-out" />
              <circle cx="520" cy="115" r="3" className="login-node login-node-out" />
              <circle cx="520" cy="182" r="3" className="login-node login-node-out" />
            </svg>
            <span className="login-machine-label login-machine-label-in">REQUEST</span>
            <span className="login-machine-label login-machine-label-out">SESSION</span>
            <span className="login-machine-caption">SECURE ROUTE / GOOGLE IDENTITY</span>
          </div>

          <div className={`login-google-button${isSigningIn ? " is-loading" : ""}`}>
            <button type="button" className="login-google-custom-button" disabled={isSigningIn}>
              <svg className="login-google-mark" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M21.35 12.27c0-.7-.06-1.37-.18-2.02H12v3.83h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.2Z" />
                <path fill="#34A853" d="M12 21.65c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.65Z" />
                <path fill="#FBBC05" d="M6.54 13.73A5.85 5.85 0 0 1 6.23 12c0-.6.11-1.18.31-1.73V7.74H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.26l3.24-2.53Z" />
                <path fill="#EA4335" d="M12 6.24c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.31 14.63 2.35 12 2.35a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53c.77-2.31 2.92-4.03 5.46-4.03Z" />
              </svg>
              <span>{isSigningIn ? "Connecting..." : "Continue with Google"}</span>
              <span className="login-google-arrow" aria-hidden="true">↗</span>
            </button>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setIsSigningIn(false);
                setError("Google sign-in was cancelled or failed.");
              }}
              text="continue_with"
              shape="rectangular"
              theme="filled_black"
              width="100%"
              useOneTap={false}
              click_listener={() => {
                setError(null);
                setIsSigningIn(true);
              }}
              containerProps={{ className: "login-google-trigger" }}
            />
          </div>
          {error && <p className="login-error" role="alert">{error}</p>}
        </motion.section>
      </div>

      <footer className="login-footer">
        <span>SETU / LLM INFRASTRUCTURE</span>
        <span>ACCESS CONTROLLED</span>
      </footer>

      <style>{`
        .login-page {
          position: relative;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          overflow: hidden;
          padding: 0 clamp(22px, 5vw, 72px);
          background: #050505;
          color: #f7f7f7;
          font-family: "Geist", sans-serif;
          isolation: isolate;
        }

        .login-grid {
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px);
          background-size: 88px 88px;
          mask-image: linear-gradient(to bottom, black, transparent 92%);
        }

        .login-header,
        .login-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 76px;
          border-bottom: 1px solid #19191d;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.14em;
        }

        .login-brand {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #f7f7f7;
          font-family: "Geist", sans-serif;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: -0.04em;
          text-decoration: none;
        }

        .login-brand img { width: 30px; height: 30px; object-fit: contain; }
        .login-header-meta,
        .login-footer { color: #565d66; }

        .login-layout {
          display: grid;
          grid-template-columns: minmax(0, 0.85fr) minmax(360px, 0.9fr);
          align-items: center;
          gap: clamp(48px, 10vw, 160px);
          width: min(1120px, 100%);
          flex: 1;
          margin: 0 auto;
          padding: clamp(60px, 10vh, 120px) 0;
        }

        .login-eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 0 0 22px;
          color: #8f8f97;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
        }

        .login-status-dot {
          width: 5px;
          height: 5px;
          background: #67e8f9;
          box-shadow: 0 0 0 4px rgba(103,232,249,0.08);
        }

        .login-copy h1 {
          margin: 0;
          color: #f7f7f7;
          font-size: clamp(44px, 6vw, 76px);
          font-weight: 600;
          letter-spacing: -0.075em;
          line-height: 0.96;
        }

        .login-description {
          max-width: 370px;
          margin: 28px 0 0;
          color: #858991;
          font-size: 15px;
          line-height: 1.65;
        }

        .login-panel {
          border: 1px solid #24242b;
          background: #08080b;
          box-shadow: 16px 16px 0 rgba(255,255,255,0.018);
        }

        .login-panel-top {
          display: flex;
          justify-content: space-between;
          padding: 13px 16px;
          border-bottom: 1px solid #202026;
          color: #686873;
          font-family: "JetBrains Mono", monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
        }

        .login-panel-top span:last-child { color: #67e8f9; }

        .login-machine {
          position: relative;
          padding: 32px 22px 26px;
          border-bottom: 1px solid #202026;
        }

        .login-machine svg { display: block; width: 100%; height: auto; }
        .login-route { stroke: #30363a; stroke-width: 1; }
        .login-route-a { stroke: #3a5b61; }
        .login-route-b { stroke: #67e8f9; stroke-opacity: 0.45; }
        .login-route-c { stroke: #4b394e; }
        .login-guide { stroke: #202026; stroke-dasharray: 2 7; }
        .login-gate { fill: #101115; stroke: #e879f9; stroke-opacity: 0.55; }
        .login-gate-inner { fill: #15151a; stroke: #3a4247; }
        .login-gate-mark { stroke: #f0abfc; stroke-width: 1.2; stroke-linecap: square; }
        .login-node { fill: #67e8f9; }
        .login-node-out { fill: #e879f9; }
        .login-route-b { stroke-dasharray: 3 8; animation: login-flow 3.2s linear infinite; }

        @keyframes login-flow { to { stroke-dashoffset: -44; } }

        .login-machine-label {
          position: absolute;
          top: 20px;
          color: #565d66;
          font-family: "JetBrains Mono", monospace;
          font-size: 8px;
          letter-spacing: 0.12em;
        }

        .login-machine-label-in { left: 22px; }
        .login-machine-label-out { right: 22px; }
        .login-machine-caption {
          display: block;
          margin-top: 16px;
          color: #565d66;
          font-family: "JetBrains Mono", monospace;
          font-size: 8px;
          letter-spacing: 0.12em;
          text-align: center;
        }

        .login-google-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: calc(100% - 32px);
          min-height: 54px;
          margin: 16px;
          border: 1px solid #31383d;
          background: #111317;
          overflow: hidden;
        }

        .login-google-custom-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          min-height: 54px;
          padding: 0 18px;
          border: 0;
          color: #f4f4f5;
          background: linear-gradient(90deg, #171a1f, #121417);
          font-family: "Geist", sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 180ms ease, color 180ms ease;
        }

        .login-google-custom-button:hover:not(:disabled) {
          color: #ffffff;
          background: linear-gradient(90deg, #20242a, #171a1f);
        }

        .login-google-custom-button:disabled {
          cursor: wait;
          opacity: 0.65;
        }

        .login-google-mark { width: 20px; height: 20px; flex: 0 0 auto; }
        .login-google-arrow {
          position: absolute;
          right: 18px;
          color: #67e8f9;
          font-size: 18px;
          line-height: 1;
          opacity: 0.8;
        }

        .login-google-trigger {
          position: absolute !important;
          inset: 0;
          z-index: 2;
          width: 100% !important;
          height: 100% !important;
          opacity: 0;
        }

        .login-google-trigger iframe {
          width: 100% !important;
          height: 100% !important;
        }

        .login-error {
          margin: -4px 16px 16px;
          color: #f5b94b;
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          line-height: 1.5;
        }

        .login-footer { min-height: 58px; border-bottom: 0; border-top: 1px solid #19191d; }

        @media (max-width: 760px) {
          .login-header { min-height: 68px; }
          .login-layout {
            grid-template-columns: 1fr;
            gap: 48px;
            padding: 64px 0;
          }
          .login-copy h1 { font-size: clamp(48px, 15vw, 72px); }
          .login-description { margin-top: 22px; }
          .login-panel { box-shadow: 8px 8px 0 rgba(255,255,255,0.018); }
          .login-footer { align-items: flex-start; flex-direction: column; justify-content: center; gap: 8px; padding: 16px 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .login-route-b,
          .login-google-button { transition: none; }
        }
      `}</style>
    </main>
  );
}
