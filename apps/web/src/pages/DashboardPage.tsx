import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  X,
  Lock,
} from "lucide-react";
import { useProjects } from "../context/ProjectContext";
import type { Provider } from "../types";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { projects, createProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for creating project
  const [newProjectName, setNewProjectName] = useState("");
  const [newBudget, setNewBudget] = useState("100.00");
  const [newProvider, setNewProvider] = useState<Provider>("openai");
  const [newProviderKey, setNewProviderKey] = useState("");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const created = createProject({
      name: newProjectName,
      monthly_budget: parseFloat(newBudget) || 100,
      provider: newProvider,
      providerKey: newProviderKey,
    });

    setIsModalOpen(false);
    setNewProjectName("");
    setNewProviderKey("");
    navigate(`/dashboard/project/${created.id}`);
  };

  const totalSpend = projects.reduce((acc, p) => acc + p.spend, 0);
  const totalBudget = projects.reduce((acc, p) => acc + p.monthly_budget, 0);

  const getProviderBadge = (provider: Provider) => {
    switch (provider) {
      case "openai":
        return {
          label: "OpenAI",
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        };
      case "anthropic":
        return {
          label: "Anthropic",
          color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        };
      case "gemini":
        return {
          label: "Google Gemini",
          color: "bg-sky-500/10 text-sky-400 border-sky-500/20",
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-border/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Projects
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-text-secondary border border-white/5">
              {projects.length} Total
            </span>
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage your budget-protected LLM gateways, keys, and alerts.
          </p>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5 cursor-pointer"
        >
          <Plus className="size-4" />
          <span>New Project</span>
        </motion.button>
      </div>

      {/* Global Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
        <div className="p-5 rounded-2xl bg-surface border border-border">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Gateway Spend
            </span>
            <TrendingUp className="size-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-white">
            ${totalSpend.toFixed(4)}
          </p>
          <span className="text-xs text-text-muted mt-1 block">
            Across {projects.length} projects this month
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Budget Cap
            </span>
            <Cpu className="size-4 text-brand" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-white">
            ${totalBudget.toFixed(2)}
          </p>
          <span className="text-xs text-text-muted mt-1 block">
            Automatic 429 quota protection active
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-medium uppercase tracking-wider">
              Gateway Health
            </span>
            <Layers className="size-4 text-sky-400" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-lg font-semibold text-white">All Systems Operational</p>
          </div>
          <span className="text-xs text-text-muted mt-1 block">
            Zero-copy proxy engine running
          </span>
        </div>
      </div>

      {/* Project Cards Grid */}
      <h2 className="text-base font-semibold text-white mb-4">Your Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const badge = getProviderBadge(project.provider);
          const percentUsed =
            project.monthly_budget > 0
              ? Math.min(100, (project.spend / project.monthly_budget) * 100)
              : 0;

          return (
            <motion.div
              key={project.id}
              whileHover={{ y: -3, borderColor: "#555" }}
              transition={{ duration: 0.15 }}
              onClick={() => navigate(`/dashboard/project/${project.id}`)}
              className="group p-5 rounded-2xl bg-surface/80 border border-border/80 hover:bg-surface cursor-pointer flex flex-col justify-between transition-colors shadow-sm relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${badge.color}`}
                  >
                    {badge.label}
                  </span>
                  <span className="text-xs text-text-muted font-mono">
                    {project.key_prefix ?? "setu_live"}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white group-hover:text-brand transition-colors line-clamp-1">
                  {project.name}
                </h3>
              </div>

              {/* Budget Progress Bar */}
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-text-muted">
                    Spend: ${project.spend < 0.01 ? project.spend.toFixed(6) : project.spend.toFixed(2)}
                  </span>
                  <span className="text-white font-medium">
                    Limit: ${project.monthly_budget < 0.01 ? project.monthly_budget.toFixed(6) : project.monthly_budget.toFixed(2)}
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentUsed}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      percentUsed >= 90
                        ? "bg-red-500"
                        : percentUsed >= 75
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
                  <span>{percentUsed.toFixed(1)}% used</span>
                  <span className="inline-flex items-center gap-1 text-white group-hover:translate-x-1 transition-transform">
                    View Project <ArrowRight className="size-3" />
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-md rounded-2xl bg-[#141414] border border-border p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="size-5 text-brand" /> Create New Project
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="size-8 rounded-lg flex items-center justify-center text-text-muted hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Production GPT-5 Pipeline"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-surface border border-border text-white text-sm focus:outline-none focus:border-brand transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Monthly Budget (USD)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-surface border border-border text-white font-mono text-sm focus:outline-none focus:border-brand transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Target Provider
                    </label>
                    <select
                      value={newProvider}
                      onChange={(e) => setNewProvider(e.target.value as Provider)}
                      className="w-full h-10 px-3 rounded-xl bg-surface border border-border text-white text-sm focus:outline-none focus:border-brand transition-colors cursor-pointer"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic (Claude)</option>
                      <option value="gemini">Google Gemini</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1.5 flex items-center justify-between">
                    <span>Provider API Key</span>
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Lock className="size-3" /> Encrypted with AES-256-GCM
                    </span>
                  </label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={newProviderKey}
                    onChange={(e) => setNewProviderKey(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-surface border border-border text-white font-mono text-sm focus:outline-none focus:border-brand transition-colors"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
