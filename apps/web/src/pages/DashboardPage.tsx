import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { useProjects } from "../context/ProjectContext";
import { ProjectCard } from "../components/project/ProjectCard";
import CreateProjectModal from "../components/project/CreateProjectModal";
import type { Provider } from "../types";

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

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (data: {
    name: string;
    monthly_budget: number;
    provider: Provider;
    providerKey: string;
  }) => {
    const created = await createProject(data);
    navigate(`/dashboard/project/${created.id}`);
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
      />
    </motion.div>
  );
}
