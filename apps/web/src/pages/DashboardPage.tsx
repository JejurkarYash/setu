import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
} from "lucide-react";
import { useProjects } from "../context/ProjectContext";
import { ProjectCard } from "../components/project/ProjectCard";
import CreateProjectModal from "../components/project/CreateProjectModal";
import type { Provider } from "../types";

// Type for the created project response including the one-time raw API key
type CreatedProjectData = {
  id: string;
  name: string;
  budget: number;
  provider: string;
  apiKey: string;
  keyPrefix: string;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    projects = [],
    createProject,
    fetchProjects,
    isLoadingProjects,
    projectsError,
  } = useProjects();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // One-time API Key Reveal Dialog state
  const [newlyCreatedProject, setNewlyCreatedProject] =
    useState<CreatedProjectData | null>(null);
  const [hasCopiedKey, setHasCopiedKey] = useState(false);
  const [acknowledgedWarning, setAcknowledgedWarning] = useState(false);

  const handleCreateProject = async (data: {
    name: string;
    monthly_budget: number;
    provider: Provider;
    providerKey: string;
  }) => {
    const created = await createProject(data);
    setIsModalOpen(false);

    // Set the newly created project response to show the one-time key modal
    setNewlyCreatedProject({
      id: created.project.id,
      name: created.project.name,
      budget: created.project.monthly_budget,
      provider: data.provider,
      apiKey: created.apiKey,
      keyPrefix: created.apiKey.slice(0, 13),
    });
    setHasCopiedKey(false);
    setAcknowledgedWarning(false);

    return {
      projectId: created.project.id,
      apiKey: created.apiKey,
    };
  };

  const handleCopyKey = async (apiKey: string) => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setHasCopiedKey(true);
      setTimeout(() => setHasCopiedKey(false), 3000);
    } catch (err) {
      console.error("Failed to copy API key", err);
    }
  };

  const handleCloseApiKeyModal = () => {
    if (!newlyCreatedProject) return;
    const projectId = newlyCreatedProject.id;
    setNewlyCreatedProject(null);
    navigate(`/dashboard/project/${projectId}`);
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Projects
            </h1>
            <span
              style={{
                fontSize: "11px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                color: "#a1a1aa",
                backgroundColor: "#171717",
                border: "1px solid #222222",
                padding: "2px 8px",
              }}
            >
              {isLoadingProjects ? "..." : projects.length}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#8e8e8e", margin: 0 }}>
            Budget-protected LLM gateways, API keys, and rate-limit alerts.
          </p>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
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
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          <Plus size={15} color="#C084FC" />
          <span>New Project</span>
        </motion.button>
      </div>

      {/* ── Content Area: Loading / Error / Empty / Grid ───────────── */}
      <AnimatePresence mode="wait">
        {isLoadingProjects ? (
          /* Skeleton Loader State */
          <motion.div
            key="loading-skeletons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
              boxSizing: "border-box",
            }}
          >
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                animate={{
                  opacity: [0.35, 0.75, 0.35],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: item * 0.15,
                }}
                style={{
                  backgroundColor: "#121212",
                  border: "1px solid #222222",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  minHeight: "160px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      height: "16px",
                      width: "55%",
                      backgroundColor: "#222222",
                    }}
                  />
                  <div
                    style={{
                      height: "12px",
                      width: "25%",
                      backgroundColor: "#1a1a1a",
                    }}
                  />
                </div>
                <div
                  style={{
                    height: "12px",
                    width: "40%",
                    backgroundColor: "#1a1a1a",
                    marginTop: "4px",
                  }}
                />
                <div
                  style={{
                    marginTop: "auto",
                    height: "6px",
                    width: "100%",
                    backgroundColor: "#1f1f1f",
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : projectsError ? (
          /* Error Banner State */
          <motion.div
            key="error-state"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "20px",
              backgroundColor: "#121212",
              border: "1px solid rgba(248, 113, 113, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "#f87171",
              fontSize: "13px",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <AlertCircle size={18} color="#f87171" />
              <span>{projectsError}</span>
            </div>
            <button
              type="button"
              onClick={() => void fetchProjects()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                backgroundColor: "#171717",
                border: "1px solid #222222",
                color: "#ffffff",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              <RefreshCw size={12} />
              <span>RETRY</span>
            </button>
          </motion.div>
        ) : projects.length === 0 ? (
          /* Empty State Container */
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "64px 24px",
              backgroundColor: "#121212",
              border: "1px dashed #222222",
              textAlign: "center",
              boxSizing: "border-box",
              gap: "12px",
            }}
          >
            <Sparkles
              size={32}
              color="#71717a"
              style={{ marginBottom: "4px" }}
            />
            <p
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#ffffff",
                margin: 0,
              }}
            >
              No projects created yet
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#71717a",
                maxWidth: "320px",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Create your first budget-protected LLM gateway to start managing
              usage.
            </p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              style={{
                marginTop: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                fontSize: "12px",
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                color: "#000000",
                backgroundColor: "#ffffff",
                border: "none",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <Plus size={14} />
              New Project
            </motion.button>
          </motion.div>
        ) : (
          /* Populated Project Cards Grid */
          <motion.div
            key="projects-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
              boxSizing: "border-box",
            }}
          >
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                name={project.name}
                spend={project.spend}
                monthlyBudget={project.monthly_budget}
                onClick={() => navigate(`/dashboard/project/${project.id}`)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Project Modal Component */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
        onProjectContinue={(projectId) => {
          setIsModalOpen(false);
          navigate(`/dashboard/project/${projectId}`);
        }}
      />

      {/* ── One-Time API Key Reveal Modal ───────────────────────────── */}
      <AnimatePresence>
        {newlyCreatedProject && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: "16px",
              boxSizing: "border-box",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              style={{
                width: "100%",
                maxWidth: "540px",
                backgroundColor: "#121212",
                border: "1px solid #262626",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                boxSizing: "border-box",
                boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #1f1f1f",
                  paddingBottom: "16px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <ShieldAlert size={20} color="#34D399" />
                  <h2
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#ffffff",
                      margin: 0,
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    PROJECT CREATED SUCCESSFULLY
                  </h2>
                </div>
              </div>

              {/* Warning Banner */}
              <div
                style={{
                  padding: "14px 16px",
                  backgroundColor: "rgba(248, 113, 113, 0.08)",
                  border: "1px solid rgba(248, 113, 113, 0.3)",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <AlertCircle
                  size={18}
                  color="#f87171"
                  style={{ flexShrink: 0, marginTop: "2px" }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#f87171",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    Save your Proxy API Key now
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#a1a1aa",
                      lineHeight: 1.5,
                    }}
                  >
                    This is the <strong>only time</strong> your raw API key will
                    be displayed. For security reasons, we do not store the
                    unhashed key. If you lose it, you will need to generate a
                    new one.
                  </span>
                </div>
              </div>

              {/* Key Display Box */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    color: "#71717a",
                    textTransform: "uppercase",
                  }}
                >
                  Proxy API Key ({newlyCreatedProject.name})
                </span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    backgroundColor: "#171717",
                    border: "1px solid #222222",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "13px",
                    color: "#34D399",
                    gap: "12px",
                    wordBreak: "break-all",
                  }}
                >
                  <span style={{ userSelect: "all" }}>
                    {newlyCreatedProject.apiKey}
                  </span>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopyKey(newlyCreatedProject.apiKey)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 12px",
                      backgroundColor: hasCopiedKey
                        ? "rgba(52, 211, 153, 0.15)"
                        : "#222222",
                      border: "1px solid",
                      borderColor: hasCopiedKey ? "#34D399" : "#333333",
                      color: hasCopiedKey ? "#34D399" : "#ffffff",
                      fontSize: "11px",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    {hasCopiedKey ? (
                      <>
                        <Check size={14} color="#34D399" />
                        <span>COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} color="#C084FC" />
                        <span>COPY KEY</span>
                      </>
                    )}
                  </motion.button>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#71717a",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  Key Prefix:{" "}
                  <code style={{ color: "#C084FC" }}>
                    {newlyCreatedProject.keyPrefix}...
                  </code>
                </span>
              </div>

              {/* Acknowledgment Checkbox */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "#d4d4d8",
                  fontFamily: "'JetBrains Mono', monospace",
                  marginTop: "4px",
                }}
              >
                <input
                  type="checkbox"
                  checked={acknowledgedWarning}
                  onChange={(e) => setAcknowledgedWarning(e.target.checked)}
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: "#34D399",
                    cursor: "pointer",
                  }}
                />
                <span>
                  I have safely copied and stored this API key in a secure
                  location.
                </span>
              </label>

              {/* Action Button */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "8px",
                }}
              >
                <motion.button
                  type="button"
                  disabled={!acknowledgedWarning}
                  whileHover={acknowledgedWarning ? { scale: 1.02 } : {}}
                  whileTap={acknowledgedWarning ? { scale: 0.98 } : {}}
                  onClick={handleCloseApiKeyModal}
                  style={{
                    padding: "10px 24px",
                    backgroundColor: acknowledgedWarning
                      ? "#ffffff"
                      : "#1f1f1f",
                    color: acknowledgedWarning ? "#000000" : "#71717a",
                    fontWeight: 700,
                    fontSize: "12px",
                    fontFamily: "'JetBrains Mono', monospace",
                    border: "none",
                    cursor: acknowledgedWarning ? "pointer" : "not-allowed",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    transition: "all 0.2s ease",
                  }}
                >
                  Continue to Project
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
