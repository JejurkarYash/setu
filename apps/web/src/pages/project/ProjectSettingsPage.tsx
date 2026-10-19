import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  RefreshCw,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";

export default function ProjectSettingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, updateProject, resetBudgetUsage, deleteProject } = useProjects();

  const project = projects.find((p) => p.id === projectId);

  const [name, setName] = useState(project?.name ?? "");
  const [budget, setBudget] = useState(project?.monthly_budget.toString() ?? "100");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-white">Project not found</h2>
        <Link
          to="/dashboard"
          className="mt-4 inline-block px-4 py-2 rounded-xl bg-white text-black font-semibold text-sm"
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
      name,
      monthly_budget: parseFloat(budget) || project.monthly_budget,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleConfirmReset = () => {
    if (!projectId) return;
    resetBudgetUsage(projectId);
    setIsResetModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!projectId) return;
    deleteProject(projectId);
    navigate("/dashboard");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-1">
            <Link to="/dashboard" className="hover:text-white transition-colors">
              Projects
            </Link>
            <span>/</span>
            <Link
              to={`/dashboard/project/${project.id}`}
              className="hover:text-white transition-colors"
            >
              {project.name}
            </Link>
            <span>/</span>
            <span className="text-white">Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Project Settings
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Configure project parameters, monthly budget caps, and reset billing quotas.
          </p>
        </div>

        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium"
          >
            <Check className="size-4" />
            <span>Changes saved</span>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Details */}
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
          <h2 className="text-base font-semibold text-white">General Information</h2>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-[#141414] border border-border text-white text-sm focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Target Provider
              </label>
              <input
                type="text"
                disabled
                value={project.provider.toUpperCase()}
                className="w-full h-10 px-3.5 rounded-xl bg-[#141414] border border-border text-text-muted text-sm font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Key Prefix
              </label>
              <input
                type="text"
                disabled
                value={project.key_prefix ?? "setu_live"}
                className="w-full h-10 px-3.5 rounded-xl bg-[#141414] border border-border text-text-muted text-sm font-mono cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Budget Cap Configuration */}
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Monthly Budget Cap</h2>
              <p className="text-xs text-text-secondary">
                The gateway terminates incoming calls with HTTP 429 when spend reaches this cap.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-elevated border border-border text-xs font-medium text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              <span>Reset Current Spend</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Monthly Budget (USD)
            </label>
            <input
              type="number"
              step="any"
              required
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full sm:w-64 h-10 px-3.5 rounded-xl bg-[#141414] border border-border text-white font-mono text-sm focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-[#141414] border border-border/60 flex items-center justify-between text-xs font-mono">
            <span className="text-text-muted">Current Spend this cycle:</span>
            <span className="text-white font-bold">
              ${project.spend < 0.01 ? project.spend.toFixed(6) : project.spend.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5 cursor-pointer"
          >
            Save Changes
          </motion.button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/[0.02] space-y-4">
        <h2 className="text-base font-semibold text-red-400 flex items-center gap-2">
          <AlertTriangle className="size-5" /> Danger Zone
        </h2>
        <p className="text-xs text-text-secondary">
          Permanently delete this project, revoke all active API keys, and remove all usage analytics and alerts.
        </p>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            Delete Project
          </button>
        </div>
      </div>

      {/* Reset Spend Confirmation Modal */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-[#141414] border border-border p-6 shadow-2xl relative"
            >
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RefreshCw className="size-5 text-amber-400" /> Reset Monthly Spend?
              </h3>
              <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                This will reset the tracked spend for <strong>{project.name}</strong> to $0.00 and re-enable any blocked API keys.
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Project Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-[#141414] border border-border p-6 shadow-2xl relative"
            >
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trash2 className="size-5 text-red-400" /> Delete Project?
              </h3>
              <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                Are you sure you want to permanently delete <strong>{project.name}</strong>? All keys will stop working immediately.
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
