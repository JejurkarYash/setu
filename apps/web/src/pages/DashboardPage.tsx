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
    <div className="w-full flex flex-col gap-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white truncate">
              Projects
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 truncate">
            Budget-protected LLM gateways, API keys, and rate-limit alerts.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="group relative inline-flex items-center justify-center gap-2.5 bg-zinc-900 border border-zinc-800 hover:border-purple-500/60 text-zinc-200 hover:text-white font-medium text-xs sm:text-sm transition-all duration-200 shadow-md active:scale-[0.98] shrink-0 cursor-pointer rounded-none"
          style={{
            paddingLeft: "14px",
            paddingRight: "18px",
            paddingTop: "9px",
            paddingBottom: "9px",
          }}
        >
          <div className="flex items-center justify-center size-5 bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 group-hover:border-purple-500/40 transition-colors shrink-0 rounded-none">
            <Plus className="size-3.5 text-purple-400 stroke-[2.5]" />
          </div>
          <span className="tracking-tight whitespace-nowrap font-semibold">
            New Project
          </span>
        </button>
      </div>

      {/* Project Grid / Empty State */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800/80 bg-[#121212]/50 text-center px-4 mt-2 rounded-none">
          <Sparkles className="size-8 text-zinc-600 mb-3" />
          <p className="text-sm font-semibold text-zinc-300">
            No projects created yet
          </p>
          <p className="text-xs text-zinc-500 mt-1 mb-6 max-w-xs">
            Create your first budget-protected LLM gateway to start managing
            usage.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-none bg-white text-black hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            <Plus className="size-4" />
            New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} />
          ))}
        </div>
      )}

      {/* Separate Modal Component */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
