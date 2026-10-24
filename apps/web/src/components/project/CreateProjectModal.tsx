import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Lock,
  ShieldAlert,
  Loader2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import type { Provider } from "../../types";

type CreateProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    monthly_budget: number;
    provider: Provider;
    providerKey: string;
  }) => Promise<{ projectId: string; apiKey: string }>;
  onProjectContinue: (projectId: string) => void;
};

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  onProjectContinue,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("100.00");
  const [provider, setProvider] = useState<Provider>("openai");
  const [providerKey, setProviderKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [createdProject, setCreatedProject] = useState<{
    projectId: string;
    apiKey: string;
  } | null>(null);
  const [hasCopiedKey, setHasCopiedKey] = useState(false);

  const resetFormState = () => {
    setName("");
    setProviderKey("");
    setBudget("100.00");
    setProvider("openai");
    setFormError(null);
    setNameError(null);
    setCreatedProject(null);
    setHasCopiedKey(false);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetFormState();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const monthlyBudget = Number(budget);

    setFormError(null);
    setNameError(null);

    if (!name.trim() || !Number.isFinite(monthlyBudget) || monthlyBudget <= 0) {
      setFormError("Please enter a valid project name and monthly budget.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmit({
        name: name.trim(),
        monthly_budget: monthlyBudget,
        provider,
        providerKey: providerKey.trim(),
      });

      setCreatedProject(result);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverMessage =
          typeof error.response?.data?.Error === "string"
            ? error.response.data.Error
            : typeof error.response?.data?.error === "string"
              ? error.response.data.error
              : null;

        if (error.response?.status === 409) {
          setNameError(
            serverMessage ?? "A project with this name already exists.",
          );
        } else {
          setFormError(
            serverMessage ??
              "Failed to create gateway project. Please try again.",
          );
        }
      } else {
        setFormError(
          "An unexpected error occurred. Please check your network connection.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
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
              position: "relative",
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
                onClick={handleClose}
                disabled={isSubmitting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#71717a",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  transition: "color 0.2s ease",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            {createdProject ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                <div>
                  <h4 style={{ margin: 0, color: "#34D399", fontSize: "16px" }}>
                    Project created successfully
                  </h4>
                  <p style={{ color: "#a1a1aa", fontSize: "12px", lineHeight: 1.5 }}>
                    Copy this Setu API key now. For security, it will not be
                    shown again.
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px",
                    backgroundColor: "#171717",
                    border: "1px solid rgba(52, 211, 153, 0.35)",
                  }}
                >
                  <code
                    style={{
                      flex: 1,
                      color: "#ffffff",
                      fontSize: "12px",
                      wordBreak: "break-all",
                    }}
                  >
                    {createdProject.apiKey}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard.writeText(createdProject.apiKey);
                      setHasCopiedKey(true);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 10px",
                      color: "#ffffff",
                      backgroundColor: "#262626",
                      border: "1px solid #3f3f46",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    {hasCopiedKey ? <Check size={14} /> : <Copy size={14} />}
                    {hasCopiedKey ? "Copied" : "Copy"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const projectId = createdProject.projectId;
                    resetFormState();
                    onProjectContinue(projectId);
                  }}
                  style={{
                    alignSelf: "flex-end",
                    padding: "10px 18px",
                    color: "#000000",
                    backgroundColor: "#ffffff",
                    border: "none",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Continue to Project
                </button>
              </div>
            ) : (
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
                  onChange={(e) => {
                    setName(e.target.value);
                    if (nameError) setNameError(null);
                    if (formError) setFormError(null);
                  }}
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    height: "42px",
                    padding: "0 14px",
                    backgroundColor: "#171717",
                    border: nameError
                      ? "1px solid #f87171"
                      : "1px solid #222222",
                    color: "#ffffff",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "12px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <AnimatePresence>
                  {nameError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#f87171",
                        fontSize: "11px",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      <AlertCircle size={13} color="#f87171" />
                      <span>{nameError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                    disabled={isSubmitting}
                    onChange={(e) => {
                      setBudget(e.target.value);
                      if (formError) setFormError(null);
                    }}
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
                    disabled={isSubmitting}
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
                      cursor: isSubmitting ? "not-allowed" : "pointer",
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
                  disabled={isSubmitting}
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
                />
              </div>

              {/* Professional Error Notification Banner */}
              <AnimatePresence>
                {formError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    role="alert"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "12px 14px",
                      color: "#f87171",
                      backgroundColor: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(248, 113, 113, 0.3)",
                      fontSize: "12px",
                      fontFamily: "'JetBrains Mono', monospace",
                      boxSizing: "border-box",
                    }}
                  >
                    <AlertCircle
                      size={16}
                      color="#f87171"
                      style={{ flexShrink: 0, marginTop: "1px" }}
                    />
                    <span style={{ lineHeight: 1.4 }}>{formError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

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
                  onClick={handleClose}
                  disabled={isSubmitting}
                  style={{
                    padding: "10px 18px",
                    fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                    color: "#8e8e8e",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    transition: "color 0.2s ease",
                  }}
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
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
                    padding: "10px 24px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        size={15}
                        color="#34D399"
                        className="animate-spin"
                      />
                      <span>Creating Gateway...</span>
                    </>
                  ) : (
                    <span>Create Project</span>
                  )}
                </motion.button>
              </div>
            </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
