import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Plus,
  Copy,
  Check,
  AlertTriangle,
  X,
  Shield,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";

export default function ProjectKeysPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, apiKeys, generateApiKey, revokeApiKey } = useProjects();

  const project = projects.find((p) => p.id === projectId);
  const keys = projectId ? apiKeys[projectId] ?? [] : [];

  const [newlyCreatedSecret, setNewlyCreatedSecret] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null);

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

  const handleCreateKey = () => {
    if (!projectId) return;
    const generated = generateApiKey(projectId);
    setNewlyCreatedSecret(generated.rawSecret);
  };

  const handleCopySecret = () => {
    if (!newlyCreatedSecret) return;
    navigator.clipboard.writeText(newlyCreatedSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleConfirmRevoke = () => {
    if (!projectId || !keyToRevoke) return;
    revokeApiKey(projectId, keyToRevoke);
    setKeyToRevoke(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-8">
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
            <span className="text-white">API Keys</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Gateway API Keys
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Keys are used by your applications to authenticate with the Setu proxy and count against this project's budget.
          </p>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateKey}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5 cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Generate New Key</span>
        </motion.button>
      </div>

      {/* Secret Key Revelation Modal */}
      <AnimatePresence>
        {newlyCreatedSecret && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-2xl bg-[#141414] border border-border p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
                  <Key className="size-5" />
                  <span>API Key Created Successfully</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNewlyCreatedSecret(null)}
                  className="size-8 rounded-lg flex items-center justify-center text-text-muted hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>
                  Please copy this key now. For your security, Setu never stores raw keys and you will not be able to view it again.
                </span>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Your New Gateway Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newlyCreatedSecret}
                    className="w-full h-10 px-3.5 rounded-xl bg-surface border border-border text-white font-mono text-xs select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="h-10 px-4 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-neutral-200 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedSecret ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setNewlyCreatedSecret(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  I have saved this key
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Revoke Confirmation Modal */}
      <AnimatePresence>
        {keyToRevoke && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-[#141414] border border-border p-6 shadow-2xl relative"
            >
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="size-5 text-red-400" /> Revoke API Key?
              </h3>
              <p className="mt-2 text-xs text-text-secondary leading-relaxed">
                Applications using this key will immediately be blocked and receive HTTP 401 Unauthorized errors. This action cannot be undone.
              </p>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setKeyToRevoke(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-text-secondary hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRevoke}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
                >
                  Revoke Key
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Keys Table Card */}
      <div className="p-6 rounded-2xl bg-surface border border-border">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div>
            <h2 className="text-base font-semibold text-white">Active Keys</h2>
            <p className="text-xs text-text-secondary">
              {keys.filter((k) => k.is_active).length} active of {keys.length} total
            </p>
          </div>
        </div>

        {keys.length === 0 ? (
          <div className="py-12 text-center text-sm text-text-muted">
            No API keys found for this project. Click "Generate New Key" to create one.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/40 text-text-muted font-medium">
                  <th className="pb-3 pl-2">Key Prefix</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Created At</th>
                  <th className="pb-3">Last Used</th>
                  <th className="pb-3 pr-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-mono">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pl-2 text-white font-medium">
                      <div className="flex items-center gap-2">
                        <Key className="size-3.5 text-text-muted" />
                        <span>{key.key_prefix}_••••••••</span>
                      </div>
                    </td>
                    <td className="py-3">
                      {key.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
                          <span className="size-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 font-sans">
                          Revoked
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-text-secondary font-sans">
                      {new Date(key.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-text-muted font-sans">
                      {key.last_used_at
                        ? new Date(key.last_used_at).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="py-3 pr-2 text-right">
                      {key.is_active && (
                        <button
                          type="button"
                          onClick={() => setKeyToRevoke(key.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-sans font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security Architecture Callout */}
      <div className="p-5 rounded-2xl bg-surface border border-border flex items-start gap-3">
        <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-text-muted shrink-0 mt-0.5">
          <Shield className="size-4" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-white">
            Zero-Trust Key Storage
          </h3>
          <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
            All Setu gateway keys are cryptographically hashed using SHA-256 before being committed to PostgreSQL. Your upstream provider credentials (OpenAI, Anthropic, Gemini) are stored with authenticated AES-256-GCM encryption using your master key.
          </p>
        </div>
      </div>
    </div>
  );
}
