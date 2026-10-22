import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  RotateCw,
  Copy,
  Check,
  AlertTriangle,
  X,
  Shield,
  Lock,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";

export default function ProjectKeysPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, apiKeys, generateApiKey } = useProjects();

  const project = projects.find((p) => p.id === projectId);
  // Single active key contract for the project
  const projectKeys = projectId ? (apiKeys[projectId] ?? []) : [];
  const currentKey = projectKeys.find((k) => k.is_active) ?? projectKeys[0];

  const [showRotateConfirm, setShowRotateConfirm] = useState(false);
  const [newlyCreatedSecret, setNewlyCreatedSecret] = useState<string | null>(
    null,
  );
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  if (!project) {
    return (
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "64px 16px",
          textAlign: "center",
          fontFamily: "'JetBrains Mono', monospace",
          color: "#ffffff",
        }}
      >
        <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Project not found</h2>
        <Link
          to="/dashboard"
          style={{
            marginTop: "24px",
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#ffffff",
            color: "#000000",
            fontWeight: 700,
            fontSize: "12px",
            textDecoration: "none",
            textTransform: "uppercase",
          }}
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const handleConfirmRotation = async () => {
    if (!projectId) return;
    setIsRotating(true);
    try {
      // Rotates key and generates a new raw secret string
      const generated = await generateApiKey(projectId);
      setNewlyCreatedSecret(generated.rawSecret);
      setShowRotateConfirm(false);
    } catch (err) {
      console.error("Failed to rotate API Key:", err);
    } finally {
      setIsRotating(false);
    }
  };

  const handleCopySecret = () => {
    if (!newlyCreatedSecret) return;
    navigator.clipboard.writeText(newlyCreatedSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "#8e8e8e",
            }}
          >
            <Link
              to="/dashboard"
              style={{ color: "#8e8e8e", textDecoration: "none" }}
            >
              Projects
            </Link>
            <span>/</span>
            <Link
              to={`/dashboard/project/${project.id}`}
              style={{ color: "#8e8e8e", textDecoration: "none" }}
            >
              {project.name}
            </Link>
            <span>/</span>
            <span style={{ color: "#ffffff", fontWeight: 600 }}>API Key</span>
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Gateway API Key
          </h1>
          <p style={{ fontSize: "13px", color: "#8e8e8e", margin: 0 }}>
            Each project maintains exactly one active key to authenticate
            incoming proxy requests.
          </p>
        </div>

        {/* Rotate Action Button */}
        <button
          type="button"
          onClick={() => setShowRotateConfirm(true)}
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
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#262626")}
        >
          <RotateCw size={15} color="#C084FC" />
          <span>Rotate Key</span>
        </button>
      </div>

      {/* ── Active Key Card ────────────────────────────────────────── */}
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
                backgroundColor: currentKey?.is_active ? "#34D399" : "#f87171",
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
              ACTIVE GATEWAY CREDENTIAL
            </h2>
          </div>
          <Key size={16} color="#71717a" />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Key Prefix Preview */}
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
              KEY MASK
            </label>
            <div
              style={{
                height: "44px",
                padding: "0 16px",
                backgroundColor: "#171717",
                border: "1px solid #222222",
                display: "flex",
                alignItems: "center",
                fontSize: "12px",
                fontFamily: "'JetBrains Mono', monospace",
                color: "#ffffff",
                boxSizing: "border-box",
              }}
            >
              {currentKey?.key_prefix ?? "setu_live"}_••••••••••••••••
            </div>
          </div>

          {/* Status & Security */}
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
              SECURITY STATUS
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
              <span>SHA-256 HASHED</span>
              <span style={{ color: "#34D399", fontWeight: 600 }}>ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Key Metadata Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "16px",
            borderTop: "1px solid #1f1f1f",
            fontSize: "11px",
            fontFamily: "'JetBrains Mono', monospace",
            color: "#71717a",
          }}
        >
          <span>
            CREATED:{" "}
            {currentKey?.created_at
              ? new Date(currentKey.created_at).toLocaleDateString()
              : "ACTIVE"}
          </span>
          <span>
            LAST USED:{" "}
            {currentKey?.last_used_at
              ? new Date(currentKey.last_used_at).toLocaleDateString()
              : "JUST NOW"}
          </span>
        </div>
      </div>

      {/* ── Security Architecture Callout ──────────────────────────── */}
      <div
        style={{
          backgroundColor: "#121212",
          border: "1px solid #222222",
          padding: "24px",
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            backgroundColor: "#171717",
            border: "1px solid #222222",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Shield size={18} color="#C084FC" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <h3
            style={{
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            ZERO-TRUST SECURITY ARCHITECTURE
          </h3>
          <p
            style={{
              fontSize: "12px",
              color: "#8e8e8e",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            All Setu gateway proxy keys are cryptographically hashed using
            SHA-256 before storage in PostgreSQL. Upstream provider credentials
            (OpenAI, Anthropic, Gemini) are secured via authenticated
            AES-256-GCM encryption.
          </p>
        </div>
      </div>

      {/* ── Rotation Warning Confirmation Modal ────────────────────── */}
      <AnimatePresence>
        {showRotateConfirm && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(8px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              style={{
                width: "100%",
                maxWidth: "460px",
                backgroundColor: "#121212",
                border: "1px solid #222222",
                padding: "28px",
                boxSizing: "border-box",
                color: "#ffffff",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                <AlertTriangle size={18} color="#f87171" />
                <h3
                  style={{
                    fontSize: "13px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    margin: 0,
                    textTransform: "uppercase",
                  }}
                >
                  ROTATE API KEY CONFIRMATION
                </h3>
              </div>

              <p
                style={{
                  fontSize: "12px",
                  color: "#8e8e8e",
                  lineHeight: 1.6,
                  margin: "0 0 24px 0",
                }}
              >
                Rotating will immediately invalidate the current key. Any active
                applications using the old key will fail with HTTP 401
                Unauthorized until updated with the new credential.
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowRotateConfirm(false)}
                  disabled={isRotating}
                  style={{
                    padding: "10px 18px",
                    fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                    color: "#8e8e8e",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRotation}
                  disabled={isRotating}
                  style={{
                    padding: "10px 20px",
                    fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    color: "#ffffff",
                    backgroundColor: "#f87171",
                    border: "1px solid rgba(248, 113, 113, 0.4)",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  {isRotating ? "Rotating..." : "Confirm & Rotate"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── New Secret Revelation Modal ────────────────────────────── */}
      <AnimatePresence>
        {newlyCreatedSecret && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(8px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              style={{
                width: "100%",
                maxWidth: "520px",
                backgroundColor: "#121212",
                border: "1px solid #222222",
                padding: "28px",
                boxSizing: "border-box",
                color: "#ffffff",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: "16px",
                  marginBottom: "20px",
                  borderBottom: "1px solid #1f1f1f",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Lock size={16} color="#34D399" />
                  <h3
                    style={{
                      fontSize: "12px",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      color: "#ffffff",
                      margin: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    SAVE YOUR NEW GATEWAY KEY
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setNewlyCreatedSecret(null)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#71717a",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "12px 14px",
                  backgroundColor: "#171717",
                  border: "1px solid #222222",
                  marginBottom: "20px",
                }}
              >
                <AlertTriangle
                  size={15}
                  color="#C084FC"
                  style={{ flexShrink: 0, marginTop: "1px" }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    color: "#8e8e8e",
                    lineHeight: 1.4,
                  }}
                >
                  Please copy this key now. For zero-trust security, Setu stores
                  only SHA-256 hashes—you will not be able to view this raw key
                  again.
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  marginBottom: "24px",
                }}
              >
                <label
                  style={{
                    fontSize: "11px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    color: "#71717a",
                    textTransform: "uppercase",
                  }}
                >
                  RAW SECRET KEY
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    readOnly
                    value={newlyCreatedSecret}
                    style={{
                      flex: 1,
                      height: "42px",
                      padding: "0 14px",
                      backgroundColor: "#171717",
                      border: "1px solid #222222",
                      color: "#ffffff",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "12px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "0 16px",
                      backgroundColor: "#141414",
                      border: "1px solid #262626",
                      color: "#ffffff",
                      fontWeight: 600,
                      fontSize: "12px",
                      fontFamily: "'JetBrains Mono', monospace",
                      cursor: "pointer",
                    }}
                  >
                    {copiedSecret ? (
                      <Check size={14} color="#34D399" />
                    ) : (
                      <Copy size={14} />
                    )}
                    <span>{copiedSecret ? "COPIED" : "COPY"}</span>
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setNewlyCreatedSecret(null)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#141414",
                    border: "1px solid #262626",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace",
                    cursor: "pointer",
                  }}
                >
                  I HAVE SAVED THIS KEY
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
