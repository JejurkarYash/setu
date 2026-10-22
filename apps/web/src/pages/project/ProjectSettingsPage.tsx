import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  RefreshCw,
  Check,
  AlertTriangle,
  Info,
  DollarSign,
  ShieldAlert,
  Edit2,
  X,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";

export default function ProjectSettingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, updateProject, resetBudgetUsage, deleteProject } =
    useProjects();

  const project = projects.find((p) => p.id === projectId);

  // Form States
  const [name, setName] = useState(project?.name ?? "");
  const [budget, setBudget] = useState(
    project?.monthly_budget.toString() ?? "100",
  );

  // Edit Mode Toggles
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  // UI States
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    updateProject(projectId, {
      name: name.trim(),
      monthly_budget: parseFloat(budget) || project.monthly_budget,
    });

    setIsEditingName(false);
    setIsEditingBudget(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleConfirmReset = () => {
    if (!projectId) return;
    resetBudgetUsage(projectId);
    setIsResetModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!projectId || deleteConfirmInput !== project.name) return;
    deleteProject(projectId);
    navigate("/dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
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
            <span style={{ color: "#ffffff", fontWeight: 600 }}>Settings</span>
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
            Project Settings
          </h1>
          <p style={{ fontSize: "13px", color: "#8e8e8e", margin: 0 }}>
            Configure project parameters, monthly budget limits, and project
            lifecycle.
          </p>
        </div>

        <AnimatePresence>
          {savedSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                backgroundColor: "rgba(52, 211, 153, 0.1)",
                border: "1px solid rgba(52, 211, 153, 0.3)",
                color: "#34D399",
                fontSize: "12px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
              }}
            >
              <Check size={14} />
              <span>CHANGES SAVED</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form
        onSubmit={handleSave}
        style={{ display: "flex", flexDirection: "column", gap: "28px" }}
      >
        {/* ── Section 1: General & Information ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          style={{
            backgroundColor: "#121212",
            border: "1px solid #222222",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "16px",
              borderBottom: "1px solid #1f1f1f",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Info size={16} color="#C084FC" />
              <h2
                style={{
                  fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                GENERAL INFORMATION
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                if (isEditingName) setName(project.name); // Revert on cancel
                setIsEditingName(!isEditingName);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                backgroundColor: isEditingName ? "#222222" : "#171717",
                border: "1px solid #222222",
                color: isEditingName ? "#34D399" : "#ffffff",
                fontSize: "11px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {isEditingName ? (
                <>
                  <X size={13} color="#f87171" />
                  <span>CANCEL</span>
                </>
              ) : (
                <>
                  <Edit2 size={13} color="#C084FC" />
                  <span>EDIT NAME</span>
                </>
              )}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{
                fontSize: "11px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: "#71717a",
                textTransform: "uppercase",
              }}
            >
              PROJECT NAME
            </label>
            <input
              type="text"
              required
              readOnly={!isEditingName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                height: "40px",
                padding: "0 14px",
                backgroundColor: isEditingName ? "#171717" : "#0f0f0f",
                border: isEditingName
                  ? "1px solid #34D399"
                  : "1px solid #1f1f1f",
                color: isEditingName ? "#ffffff" : "#8e8e8e",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "13px",
                outline: "none",
                cursor: isEditingName ? "text" : "not-allowed",
                boxSizing: "border-box",
                transition: "all 0.15s ease",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
              paddingTop: "8px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
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
                PROJECT ID
              </label>
              <input
                type="text"
                disabled
                value={project.id}
                style={{
                  height: "38px",
                  padding: "0 12px",
                  backgroundColor: "#0f0f0f",
                  border: "1px solid #1f1f1f",
                  color: "#71717a",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  cursor: "not-allowed",
                }}
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
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
                TARGET PROVIDER
              </label>
              <input
                type="text"
                disabled
                value={project.provider.toUpperCase()}
                style={{
                  height: "38px",
                  padding: "0 12px",
                  backgroundColor: "#0f0f0f",
                  border: "1px solid #1f1f1f",
                  color: "#34D399",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "not-allowed",
                }}
              />
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
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
                KEY PREFIX
              </label>
              <input
                type="text"
                disabled
                value={project.key_prefix ?? "setu_live"}
                style={{
                  height: "38px",
                  padding: "0 12px",
                  backgroundColor: "#0f0f0f",
                  border: "1px solid #1f1f1f",
                  color: "#71717a",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  cursor: "not-allowed",
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Section 2: Budget Cap Configuration ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          style={{
            backgroundColor: "#121212",
            border: "1px solid #222222",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "16px",
              borderBottom: "1px solid #1f1f1f",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <DollarSign size={16} color="#34D399" />
              <h2
                style={{
                  fontSize: "12px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: 0,
                  textTransform: "uppercase",
                }}
              >
                MONTHLY BUDGET CAP
              </h2>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => {
                  if (isEditingBudget)
                    setBudget(project.monthly_budget.toString()); // Revert on cancel
                  setIsEditingBudget(!isEditingBudget);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  backgroundColor: isEditingBudget ? "#222222" : "#171717",
                  border: "1px solid #222222",
                  color: isEditingBudget ? "#34D399" : "#ffffff",
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                {isEditingBudget ? (
                  <>
                    <X size={13} color="#f87171" />
                    <span>CANCEL</span>
                  </>
                ) : (
                  <>
                    <Edit2 size={13} color="#34D399" />
                    <span>EDIT BUDGET</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  backgroundColor: "#171717",
                  border: "1px solid #222222",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={13} color="#C084FC" />
                <span>RESET SPEND</span>
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{
                fontSize: "11px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: "#71717a",
                textTransform: "uppercase",
              }}
            >
              MONTHLY BUDGET (USD)
            </label>
            <input
              type="number"
              step="any"
              required
              readOnly={!isEditingBudget}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              style={{
                width: "240px",
                height: "40px",
                padding: "0 14px",
                backgroundColor: isEditingBudget ? "#171717" : "#0f0f0f",
                border: isEditingBudget
                  ? "1px solid #34D399"
                  : "1px solid #1f1f1f",
                color: isEditingBudget ? "#ffffff" : "#8e8e8e",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "13px",
                outline: "none",
                cursor: isEditingBudget ? "text" : "not-allowed",
                boxSizing: "border-box",
                transition: "all 0.15s ease",
              }}
            />
          </div>

          <div
            style={{
              padding: "14px 16px",
              backgroundColor: "#171717",
              border: "1px solid #222222",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <span style={{ color: "#71717a" }}>CURRENT SPEND THIS CYCLE:</span>
            <span style={{ color: "#ffffff", fontWeight: 700 }}>
              $
              {project.spend < 0.01
                ? project.spend.toFixed(6)
                : project.spend.toFixed(4)}
            </span>
          </div>
        </motion.div>

        {/* ── Save Button ───────────────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <motion.button
            type="submit"
            disabled={!isEditingName && !isEditingBudget}
            whileHover={{ scale: isEditingName || isEditingBudget ? 1.02 : 1 }}
            whileTap={{ scale: isEditingName || isEditingBudget ? 0.98 : 1 }}
            style={{
              padding: "12px 28px",
              backgroundColor:
                isEditingName || isEditingBudget ? "#141414" : "#171717",
              border:
                isEditingName || isEditingBudget
                  ? "1px solid #262626"
                  : "1px solid #222222",
              color: isEditingName || isEditingBudget ? "#ffffff" : "#71717a",
              fontSize: "13px",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              cursor:
                isEditingName || isEditingBudget ? "pointer" : "not-allowed",
              textTransform: "uppercase",
              boxShadow:
                isEditingName || isEditingBudget
                  ? "0 2px 8px rgba(0,0,0,0.4)"
                  : "none",
              transition: "all 0.15s ease",
            }}
          >
            SAVE CHANGES
          </motion.button>
        </div>
      </form>

      {/* ── Section 3: Danger Zone ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.15 }}
        style={{
          backgroundColor: "#121212",
          border: "1px solid rgba(248, 113, 113, 0.3)",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldAlert size={18} color="#f87171" />
          <h2
            style={{
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              color: "#f87171",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            DANGER ZONE
          </h2>
        </div>

        <p
          style={{
            fontSize: "12px",
            color: "#8e8e8e",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Permanently delete this project, revoke all proxy credentials, and
          purge usage logs. This action cannot be undone.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingTop: "8px",
          }}
        >
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            style={{
              padding: "10px 20px",
              backgroundColor: "rgba(248, 113, 113, 0.1)",
              border: "1px solid rgba(248, 113, 113, 0.3)",
              color: "#f87171",
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            DELETE PROJECT
          </button>
        </div>
      </motion.div>

      {/* ── Reset Spend Confirmation Modal ──────────────────────────── */}
      <AnimatePresence>
        {isResetModalOpen && (
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
                maxWidth: "440px",
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
                <RefreshCw size={18} color="#C084FC" />
                <h3
                  style={{
                    fontSize: "13px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    margin: 0,
                    textTransform: "uppercase",
                  }}
                >
                  RESET MONTHLY SPEND?
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
                This will reset the tracked budget usage for{" "}
                <strong style={{ color: "#ffffff" }}>{project.name}</strong> to
                $0.00 and restore blocked API traffic.
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
                  onClick={() => setIsResetModalOpen(false)}
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
                  onClick={handleConfirmReset}
                  style={{
                    padding: "10px 20px",
                    fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    color: "#ffffff",
                    backgroundColor: "#141414",
                    border: "1px solid #262626",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Project Confirmation Modal ───────────────────────── */}
      <AnimatePresence>
        {isDeleteModalOpen && (
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
                  DELETE PROJECT CONFIRMATION
                </h3>
              </div>

              <p
                style={{
                  fontSize: "12px",
                  color: "#8e8e8e",
                  lineHeight: 1.6,
                  margin: "0 0 16px 0",
                }}
              >
                This action cannot be undone. Type{" "}
                <code style={{ color: "#ffffff", fontWeight: 700 }}>
                  {project.name}
                </code>{" "}
                below to confirm deletion.
              </p>

              <input
                type="text"
                placeholder={project.name}
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 14px",
                  backgroundColor: "#171717",
                  border: "1px solid #222222",
                  color: "#ffffff",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: "24px",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteConfirmInput("");
                  }}
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
                  disabled={deleteConfirmInput !== project.name}
                  onClick={handleConfirmDelete}
                  style={{
                    padding: "10px 20px",
                    fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    color: "#ffffff",
                    backgroundColor:
                      deleteConfirmInput === project.name
                        ? "#f87171"
                        : "#222222",
                    border:
                      deleteConfirmInput === project.name
                        ? "1px solid rgba(248, 113, 113, 0.4)"
                        : "1px solid #222222",
                    cursor:
                      deleteConfirmInput === project.name
                        ? "pointer"
                        : "not-allowed",
                    opacity: deleteConfirmInput === project.name ? 1 : 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
