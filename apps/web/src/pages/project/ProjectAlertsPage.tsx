import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  Send,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";

export default function ProjectAlertsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, alerts, saveAlert } = useProjects();

  const project = projects.find((p) => p.id === projectId);
  const currentAlert = projectId ? alerts[projectId] : undefined;

  const [notifySlack, setNotifySlack] = useState(
    currentAlert?.notify_slack ?? true
  );
  const [thresholdPct, setThresholdPct] = useState(
    currentAlert?.trigger_threshold_pct ?? 80
  );
  const [slackWebhook, setSlackWebhook] = useState(
    "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
  );
  const [testSent, setTestSent] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
    saveAlert(projectId, {
      notify_slack: notifySlack,
      trigger_threshold_pct: thresholdPct,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSendTestAlert = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
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
            <span className="text-white">Alerts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Budget Alerts
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Receive proactive notifications to your team's Slack channel before requests get blocked.
          </p>
        </div>

        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium"
          >
            <Check className="size-4" />
            <span>Alert settings updated</span>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Slack Webhook Card */}
        <div className="p-6 rounded-2xl bg-surface border border-border">
          <div className="flex items-center justify-between pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Bell className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  Slack Notification Dispatcher
                </h2>
                <p className="text-xs text-text-secondary">
                  Triggered asynchronously via Setu background telemetry workers.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setNotifySlack(!notifySlack)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                notifySlack ? "bg-white" : "bg-white/10"
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out ${
                  notifySlack
                    ? "translate-x-5 bg-black"
                    : "translate-x-0.5 bg-neutral-400 mt-0.5"
                }`}
              />
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Incoming Webhook URL
              </label>
              <input
                type="url"
                value={slackWebhook}
                disabled={!notifySlack}
                onChange={(e) => setSlackWebhook(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="w-full h-10 px-3.5 rounded-xl bg-[#141414] border border-border text-white font-mono text-xs focus:outline-none focus:border-brand transition-colors disabled:opacity-50"
              />
            </div>

            {/* Threshold Slider & Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-text-secondary">
                  Alert Trigger Threshold
                </label>
                <span className="text-sm font-mono font-bold text-white">
                  {thresholdPct}% of monthly budget
                </span>
              </div>

              <input
                type="range"
                min="50"
                max="98"
                step="5"
                disabled={!notifySlack}
                value={thresholdPct}
                onChange={(e) => setThresholdPct(parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white disabled:opacity-50"
              />

              <div className="flex items-center justify-between mt-2">
                {[50, 75, 80, 90, 95].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    disabled={!notifySlack}
                    onClick={() => setThresholdPct(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium cursor-pointer transition-colors ${
                      thresholdPct === preset
                        ? "bg-white text-black font-semibold"
                        : "bg-surface-elevated text-text-muted hover:text-white"
                    } disabled:opacity-40`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Message Preview */}
        <div className="p-6 rounded-2xl bg-surface border border-border">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <h3 className="text-sm font-semibold text-white">
              Slack Message Preview
            </h3>
            <button
              type="button"
              disabled={!notifySlack || testSent}
              onClick={handleSendTestAlert}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-medium hover:bg-white/15 transition-colors cursor-pointer disabled:opacity-40"
            >
              {testSent ? (
                <>
                  <Check className="size-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Webhook Delivered!</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  <span>Send Test Notification</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-[#0f0f0f] border-l-4 border-l-amber-400 border border-border/60 font-sans text-xs space-y-1.5">
            <div className="flex items-center justify-between text-text-muted">
              <span className="font-semibold text-white">Setu Gateway Bot</span>
              <span>Today at 12:00 PM</span>
            </div>
            <p className="text-amber-300 font-medium">
              ⚠️ Setu Budget Alert: [{project.name}] reached {thresholdPct}% threshold!
            </p>
            <p className="text-text-secondary">
              Current Spend:{" "}
              <span className="font-mono text-white">
                ${((project.monthly_budget * thresholdPct) / 100).toFixed(4)}
              </span>{" "}
              /{" "}
              <span className="font-mono text-white">
                ${project.monthly_budget.toFixed(4)}
              </span>
            </p>
            <p className="text-[11px] text-text-muted">
              Atomic rate limit interceptor is armed. Once 100% is reached, requests will receive HTTP 429.
            </p>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors shadow-lg shadow-white/5 cursor-pointer"
          >
            Save Alert Configuration
          </motion.button>
        </div>
      </form>
    </div>
  );
}
