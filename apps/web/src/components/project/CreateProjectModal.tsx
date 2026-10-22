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
            padding: "20px",
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
              backgroundColor: "#121212",
              border: "1px solid #222222",
              padding: "28px",
              boxSizing: "border-box",
              color: "#ffffff",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9)",
              userSelect: "none",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "16px",
                marginBottom: "24px",
                borderBottom: "1px solid #1f1f1f",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#34D399",
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                />
                <h3
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
                  NEW GATEWAY SETUP
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#71717a",
                  cursor: "pointer",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#71717a")}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
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
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    color: "#71717a",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
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
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#222222")
                  }
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
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      color: "#71717a",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
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
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "#222222")
                    }
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
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      color: "#71717a",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    PROVIDER
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as Provider)}
                    style={{
                      width: "100%",
                      height: "42px",
                      padding: "0 10px",
                      backgroundColor: "#171717",
                      border: "1px solid #222222",
                      color: "#ffffff",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "12px",
                      outline: "none",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(168, 85, 247, 0.8)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "#222222")
                    }
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
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 700,
                      color: "#71717a",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    PROVIDER API KEY
                  </label>
                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: "'JetBrains Mono', monospace",
                      color: "#34D399",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Lock size={12} color="#34D399" /> AES-256
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
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#222222")
                  }
                />
              </div>

              {/* Guardrail Note Box */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "12px 14px",
                  backgroundColor: "#171717",
                  border: "1px solid #222222",
                  boxSizing: "border-box",
                  marginTop: "4px",
                }}
              >
                <ShieldAlert
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
                  Real-time circuit breaker active: traffic automatically
                  terminates if monthly spend exceeds caps.
                </span>
              </div>

              {/* Footer Buttons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "12px",
                  paddingTop: "16px",
                  marginTop: "8px",
                  borderTop: "1px solid #1f1f1f",
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "10px 18px",
                    fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                    color: "#8e8e8e",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#ffffff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#8e8e8e")
                  }
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                    (e.currentTarget.style.borderColor =
                      "rgba(168, 85, 247, 0.6)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "#262626")
                  }
                >
                  Create Project
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
