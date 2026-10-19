import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Bell,
  Check,
  Server,
} from "lucide-react";

export default function GlobalSettingsPage() {
  const [slackWebhook, setSlackWebhook] = useState(
    "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
  );
  const [strictEnforcement, setStrictEnforcement] = useState(true);
  const [autoMonthlyReset, setAutoMonthlyReset] = useState(true);
  const [defaultThreshold, setDefaultThreshold] = useState("80");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-1">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-white">Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Global Settings
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Configure system-wide gateway defaults, notifications, and LLM budget enforcement.
          </p>
        </div>

        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium"
          >
            <Check className="size-4" />
            <span>Preferences saved successfully</span>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSave} className="mt-8 space-y-8">
        {/* Gateway Enforcement Policy */}
        <div className="p-6 rounded-2xl bg-surface border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-9 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
              <Shield className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Gateway Enforcement Policy
              </h2>
              <p className="text-xs text-text-secondary">
                Configure how the zero-copy proxy enforces monthly limits when keys exceed budget.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#141414] border border-border/60">
              <div>
                <span className="text-sm font-medium text-white block">
                  Hard Quota Block (HTTP 429)
                </span>
                <span className="text-xs text-text-muted mt-0.5 block">
                  Immediately intercept and terminate requests with 429 Quota Exceeded when monthly limit is met.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStrictEnforcement(!strictEnforcement)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  strictEnforcement ? "bg-white" : "bg-white/10"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out ${
                    strictEnforcement
                      ? "translate-x-5 bg-black"
                      : "translate-x-0.5 bg-neutral-400 mt-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#141414] border border-border/60">
              <div>
                <span className="text-sm font-medium text-white block">
                  Automatic Monthly Spend Rollover
                </span>
                <span className="text-xs text-text-muted mt-0.5 block">
                  Automatically reset project spend to $0.00 at 00:00 UTC on the 1st day of every month.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAutoMonthlyReset(!autoMonthlyReset)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoMonthlyReset ? "bg-white" : "bg-white/10"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out ${
                    autoMonthlyReset
                      ? "translate-x-5 bg-black"
                      : "translate-x-0.5 bg-neutral-400 mt-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Global Alerting */}
        <div className="p-6 rounded-2xl bg-surface border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Bell className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Global Notification Webhook
              </h2>
              <p className="text-xs text-text-secondary">
                Default Slack or Discord incoming webhook for budget threshold alerts.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Default Slack Webhook URL
              </label>
              <input
                type="url"
                value={slackWebhook}
                onChange={(e) => setSlackWebhook(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full h-10 px-3.5 rounded-xl bg-[#141414] border border-border text-white font-mono text-xs focus:outline-none focus:border-brand transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Default Warning Threshold (%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={defaultThreshold}
                  onChange={(e) => setDefaultThreshold(e.target.value)}
                  className="w-28 h-10 px-3.5 rounded-xl bg-[#141414] border border-border text-white font-mono text-sm focus:outline-none focus:border-brand transition-colors"
                />
                <span className="text-xs text-text-muted">
                  Sends Slack notification when project spend reaches this % of monthly limit.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Topology / Gateway Status */}
        <div className="p-6 rounded-2xl bg-surface border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Server className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Upstream Provider Routers
              </h2>
              <p className="text-xs text-text-secondary">
                Active proxy routes handled by the Setu gateway engine.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-[#141414] border border-border/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-400">OpenAI Proxy</span>
                <span className="size-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-xs font-mono text-text-muted">/v1/chat/completions</p>
              <span className="text-[11px] text-text-secondary mt-1 block">
                Streaming & reasoning tokens
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#141414] border border-border/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-amber-400">Anthropic Proxy</span>
                <span className="size-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-xs font-mono text-text-muted">/anthropic/v1/messages</p>
              <span className="text-[11px] text-text-secondary mt-1 block">
                Claude 3.7 & Haiku support
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#141414] border border-border/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-sky-400">Gemini Proxy</span>
                <span className="size-2 rounded-full bg-emerald-400" />
              </div>
              <p className="text-xs font-mono text-text-muted">/v1beta/models/*</p>
              <span className="text-[11px] text-text-secondary mt-1 block">
                Zero-copy SSE pipe writer
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5 cursor-pointer"
          >
            Save Preferences
          </motion.button>
        </div>
      </form>
    </div>
  );
}
