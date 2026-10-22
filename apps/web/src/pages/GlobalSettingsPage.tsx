import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Shield, Key, Check, Save } from "lucide-react";

export default function GlobalSettingsPage() {
  const [name, setName] = useState("Yash Jejurkar");
  const [email, setEmail] = useState("yash@setu.dev");
  const [role, setRole] = useState("Workspace Owner");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1080px",
        margin: "0 auto",
        padding: "12px 16px 80px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        boxSizing: "border-box",
        userSelect: "none",
      }}
    >
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          paddingBottom: "24px",
          borderBottom: "1px solid #222222",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Global Settings
          </h1>
          <p style={{ fontSize: "13px", color: "#8e8e8e", margin: 0 }}>
            Manage your personal profile credentials and workspace access level.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <AnimatePresence>
            {savedSuccess && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  backgroundColor: "rgba(52, 211, 153, 0.1)",
                  border: "1px solid rgba(52, 211, 153, 0.3)",
                  color: "#34D399",
                  fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                }}
              >
                <Check size={14} />
                <span>SAVED</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={handleSave}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: "#141414",
              border: "1px solid #262626",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "13px",
              padding: "10px 20px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.6)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "#262626")
            }
          >
            <Save size={15} color="#C084FC" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        style={{ display: "flex", flexDirection: "column", gap: "28px" }}
      >
        {/* ── Section 1: User Profile Credentials ───────────────────────── */}
        <div
          style={{
            backgroundColor: "#121212",
            border: "1px solid #222222",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: "16px",
              borderBottom: "1px solid #1f1f1f",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#34D399",
                  borderRadius: "50%",
                  display: "inline-block",
                }}
              />
              <h2
                style={{
                  fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "0.08em",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                USER PROFILE
              </h2>
            </div>
            <User size={16} color="#71717a" />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Full Name */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <label
                style={{
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#71717a",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <User size={13} color="#8e8e8e" /> FULL NAME
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 16px",
                  backgroundColor: "#171717",
                  border: "1px solid #222222",
                  color: "#ffffff",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(168, 85, 247, 0.8)")
                }
                onBlur={(e) => (e.currentTarget.style.borderColor = "#222222")}
              />
            </div>

            {/* Email Address */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <label
                style={{
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#71717a",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Mail size={13} color="#8e8e8e" /> EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@setu.dev"
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 16px",
                  backgroundColor: "#171717",
                  border: "1px solid #222222",
                  color: "#ffffff",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor =
                    "rgba(168, 85, 247, 0.8)")
                }
                onBlur={(e) => (e.currentTarget.style.borderColor = "#222222")}
              />
            </div>
          </div>
        </div>

        {/* ── Section 2: Account Security & Role ────────────────────────── */}
        <div
          style={{
            backgroundColor: "#121212",
            border: "1px solid #222222",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: "16px",
              borderBottom: "1px solid #1f1f1f",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#34D399",
                  borderRadius: "50%",
                  display: "inline-block",
                }}
              />
              <h2
                style={{
                  fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "0.08em",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                ACCESS & PRIVILEGES
              </h2>
            </div>
            <Shield size={16} color="#71717a" />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Account Role */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <label
                style={{
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#71717a",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Key size={13} color="#8e8e8e" /> ACCESS ROLE
              </label>
              <input
                type="text"
                disabled
                value={role}
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 16px",
                  backgroundColor: "#171717",
                  border: "1px solid #222222",
                  color: "#8e8e8e",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  outline: "none",
                  cursor: "not-allowed",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Gateway Key Status */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <label
                style={{
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#71717a",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                SECURITY ENCRYPTION
              </label>
              <div
                style={{
                  height: "44px",
                  padding: "0 16px",
                  backgroundColor: "#171717",
                  border: "1px solid #222222",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#ffffff",
                  boxSizing: "border-box",
                }}
              >
                <span>AES-256-GCM Vault</span>
                <span
                  style={{
                    color: "#34D399",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
