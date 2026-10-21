import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, ShieldAlert, Terminal } from "lucide-react";
import type { Provider } from "../../types";

type CreateProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    monthly_budget: number;
    provider: Provider;
    providerKey: string;
  }) => void;
};

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("100.00");
  const [provider, setProvider] = useState<Provider>("openai");
  const [providerKey, setProviderKey] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name,
      monthly_budget: parseFloat(budget) || 100,
      provider,
      providerKey,
    });

    setName("");
    setProviderKey("");
    setBudget("100.00");
    setProvider("openai");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{
              width: "100%",
              maxWidth: "520px",
              backgroundColor: "#0c0c0c",
              border: "1px solid #27272a",
              padding: "28px",
              boxSizing: "border-box",
              color: "#ffffff",
              fontFamily: "'JetBrains Mono', monospace",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "16px",
                marginBottom: "24px",
                borderBottom: "1px solid #27272a",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(168, 85, 247, 0.1)",
                    border: "1px solid rgba(168, 85, 247, 0.3)",
                    flexShrink: 0,
                  }}
                >
                  <Terminal size={18} color="#c084fc" />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#ffffff",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    NEW GATEWAY SETUP
                  </h3>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#a1a1aa",
                      margin: "4px 0 0 0",
                      lineHeight: 1.2,
                    }}
                  >
                    Configure budget caps & rate limits
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "none",
                  color: "#a1a1aa",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Project Name */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#d4d4d8",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <span style={{ color: "#c084fc", marginRight: "6px" }}>
                    &gt;
                  </span>{" "}
                  PROJECT NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production GPT-4o Gateway"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    height: "42px",
                    padding: "0 14px",
                    backgroundColor: "#141414",
                    border: "1px solid #27272a",
                    color: "#ffffff",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "12px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Budget & Provider Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#d4d4d8",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    <span style={{ color: "#c084fc", marginRight: "6px" }}>
                      &gt;
                    </span>{" "}
                    BUDGET ($/MO)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 14px",
                      backgroundColor: "#141414",
                      border: "1px solid #27272a",
                      color: "#ffffff",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "12px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#d4d4d8",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    <span style={{ color: "#c084fc", marginRight: "6px" }}>
                      &gt;
                    </span>{" "}
                    PROVIDER
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as Provider)}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 10px",
                      backgroundColor: "#141414",
                      border: "1px solid #27272a",
                      color: "#ffffff",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "12px",
                      outline: "none",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="gemini">Google Gemini</option>
                  </select>
                </div>
              </div>

              {/* API Key */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <label
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#d4d4d8",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    <span style={{ color: "#c084fc", marginRight: "6px" }}>
                      &gt;
                    </span>{" "}
                    PROVIDER API KEY
                  </label>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "#71717a",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      marginLeft: "auto",
                    }}
                  >
                    <Lock size={12} color="#34d399" /> AES-256
                  </span>
                </div>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={providerKey}
                  onChange={(e) => setProviderKey(e.target.value)}
                  style={{
                    width: "100%",
                    height: "42px",
                    padding: "0 14px",
                    backgroundColor: "#141414",
                    border: "1px solid #27272a",
                    color: "#ffffff",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "12px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Guardrail Alert */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "12px 14px",
                  backgroundColor: "rgba(88, 28, 135, 0.2)",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  boxSizing: "border-box",
                  marginTop: "4px",
                }}
              >
                <ShieldAlert
                  size={16}
                  color="#c084fc"
                  style={{ flexShrink: 0, marginTop: "1px" }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    color: "#d4d4d8",
                    lineHeight: 1.4,
                  }}
                >
                  Traffic automatically terminates if monthly spend exceeds
                  configured caps.
                </span>
              </div>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "12px",
                  paddingTop: "16px",
                  marginTop: "8px",
                  borderTop: "1px solid #27272a",
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "10px 18px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#a1a1aa",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 22px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#ffffff",
                    backgroundColor: "#9333ea",
                    border: "1px solid rgba(192, 132, 252, 0.4)",
                    cursor: "pointer",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    boxShadow: "0 4px 14px rgba(147, 51, 234, 0.4)",
                  }}
                >
                  CREATE PROJECT
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
