import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Sparkles } from "lucide-react";
import { useProjects } from "../context/ProjectContext";
import { ProjectCard } from "../components/project/ProjectCard";
import CreateProjectModal from "../components/project/CreateProjectModal";
import type { Provider } from "../types";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { projects = [], createProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateProject = (data: {
    name: string;
    monthly_budget: number;
    provider: Provider;
    providerKey: string;
  }) => {
    const created = createProject({
      name: data.name,
      monthly_budget: data.monthly_budget,
      provider: data.provider,
      providerKey: data.providerKey,
    });

    setIsModalOpen(false);

    if (created?.id) {
      navigate(`/dashboard/project/${created.id}`);
    }
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
      {/* ── Page Header (Identical to Global Settings) ────────────────── */}
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
              {projects.length}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#8e8e8e", margin: 0 }}>
            Budget-protected LLM gateways, API keys, and rate-limit alerts.
          </p>
        </div>

        {/* Clean Action Button (Matching Header Style) */}
        <button
          type="button"
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
            transition: "all 0.2s ease",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = "rgba(168, 85, 247, 0.6)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#262626")}
        >
          <Plus size={15} color="#C084FC" />
          <span>New Project</span>
        </button>
      </div>

      {/* ── Project Grid / Empty State Container ──────────────────────── */}
      {projects.length === 0 ? (
        <div
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
          <Sparkles size={32} color="#71717a" style={{ marginBottom: "4px" }} />
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
          <button
            type="button"
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
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
            boxSizing: "border-box",
          }}
        >
          {projects.map((project) => (
            <ProjectCard key={project.id} />
          ))}
        </div>
      )}

      {/* Create Project Modal Component */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
