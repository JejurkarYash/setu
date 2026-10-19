import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Check,
  Copy,
  Terminal,
  ArrowRight,
  RefreshCw,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";

export default function ProjectOverviewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, logs, resetBudgetUsage, addMockLog } = useProjects();

  const project = projects.find((p) => p.id === projectId);
  const projectLogs = projectId ? logs[projectId] ?? [] : [];

  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<"curl" | "python" | "node">("curl");
  const [simulating, setSimulating] = useState(false);

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-white">Project not found</h2>
        <p className="mt-2 text-sm text-text-secondary">
          The project <code className="text-brand">{projectId}</code> does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 px-4 py-2 rounded-xl bg-white text-black font-semibold text-sm cursor-pointer"
        >
          Return to Projects
        </button>
      </div>
    );
  }

  const percentUsed =
    project.monthly_budget > 0
      ? Math.min(100, (project.spend / project.monthly_budget) * 100)
      : 0;

  const totalTokens = projectLogs.reduce(
    (acc, l) => acc + l.prompt_tokens + l.completion_tokens,
    0
  );
  const successfulCalls = projectLogs.filter((l) => l.status_code === 200).length;
  const blockedCalls = projectLogs.filter((l) => l.status_code === 429).length;

  const getProviderConfig = () => {
    switch (project.provider) {
      case "openai":
        return {
          label: "OpenAI",
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          endpoint: "http://localhost:8080/v1/chat/completions",
          model: "gpt-4o",
        };
      case "anthropic":
        return {
          label: "Anthropic Claude",
          color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          endpoint: "http://localhost:8080/anthropic/v1/messages",
          model: "claude-3-7-sonnet",
        };
      case "gemini":
        return {
          label: "Google Gemini",
          color: "bg-sky-500/10 text-sky-400 border-sky-500/20",
          endpoint: "http://localhost:8080/v1beta/models/gemini-2.5-flash:generateContent",
          model: "gemini-2.5-flash",
        };
    }
  };

  const providerCfg = getProviderConfig();
  const sampleKey = `${project.key_prefix ?? "setu_live"}_demo99482`;

  const getCodeSnippet = () => {
    if (activeTab === "curl") {
      if (project.provider === "openai") {
        return `curl -X POST "${providerCfg.endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${sampleKey}" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello Setu Gateway!"}]
  }'`;
      } else if (project.provider === "anthropic") {
        return `curl -X POST "${providerCfg.endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${sampleKey}" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "claude-3-7-sonnet-20250219",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello Setu Claude Gateway!"}]
  }'`;
      } else {
        return `curl -X POST "${providerCfg.endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "x-goog-api-key: ${sampleKey}" \\
  -d '{
    "contents": [{"parts":[{"text": "Explain quantum computing in one sentence"}]}]
  }'`;
      }
    } else if (activeTab === "python") {
      return `import openai

client = openai.OpenAI(
    base_url="http://localhost:8080/v1",
    api_key="${sampleKey}"
)

response = client.chat.completions.create(
    model="${providerCfg.model}",
    messages=[{"role": "user", "content": "Hello via Setu Budget Gateway!"}]
)

print(response.choices[0].message.content)`;
    } else {
      return `import { OpenAI } from 'openai';

const openai = new OpenAI({
  baseURL: 'http://localhost:8080/v1',
  apiKey: '${sampleKey}',
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Say hello!' }],
    model: '${providerCfg.model}',
  });

  console.log(completion.choices[0].message.content);
}

main();`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSimulateRequest = (status: number) => {
    setSimulating(true);
    setTimeout(() => {
      addMockLog(project.id, status);
      setSimulating(false);
    }, 400);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-1">
            <Link to="/dashboard" className="hover:text-white transition-colors">
              Projects
            </Link>
            <span>/</span>
            <span className="text-white">{project.name}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {project.name}
            </h1>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${providerCfg.color}`}
            >
              {providerCfg.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            ID: <code className="font-mono text-xs text-text-muted">{project.id}</code> · Key Prefix:{" "}
            <code className="font-mono text-xs text-text-muted">{project.key_prefix ?? "setu_live"}</code>
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSimulateRequest(200)}
            disabled={simulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-medium text-white hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <Activity className="size-3.5 text-emerald-400" />
            <span>Simulate 200 OK</span>
          </button>

          <button
            type="button"
            onClick={() => handleSimulateRequest(429)}
            disabled={simulating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-medium text-white hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <AlertTriangle className="size-3.5 text-red-400" />
            <span>Simulate 429 Cap</span>
          </button>

          <button
            type="button"
            onClick={() => resetBudgetUsage(project.id)}
            title="Reset spend usage to $0.00"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-medium text-text-secondary hover:text-white hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            <span>Reset Spend</span>
          </button>
        </div>
      </div>

      {/* Main Budget Progress Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Monthly Budget Utilization
            </span>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-3xl sm:text-4xl font-bold font-mono text-white">
                ${project.spend < 0.01 ? project.spend.toFixed(6) : project.spend.toFixed(4)}
              </span>
              <span className="text-sm font-mono text-text-muted">
                / ${project.monthly_budget < 0.01 ? project.monthly_budget.toFixed(6) : project.monthly_budget.toFixed(2)} limit
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              {percentUsed >= 100
                ? "⚠️ Monthly budget limit reached! Inbound requests will receive 429."
                : percentUsed >= 80
                ? "⚠️ Warning: Spend is above 80% threshold."
                : "Protected by Setu atomic Redis quota enforcer."}
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-white">
              {percentUsed.toFixed(1)}%
            </span>
            <span className="text-xs text-text-muted block">used this cycle</span>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="w-full h-3 rounded-full bg-white/10 mt-6 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentUsed}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`h-full rounded-full transition-colors ${
              percentUsed >= 95
                ? "bg-red-500"
                : percentUsed >= 75
                ? "bg-amber-400"
                : "bg-emerald-400"
            }`}
          />
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
          <span>$0.00</span>
          <span>
            Remaining: $
            {Math.max(0, project.monthly_budget - project.spend).toFixed(
              project.monthly_budget < 0.01 ? 6 : 4
            )}
          </span>
          <span>
            ${project.monthly_budget < 0.01 ? project.monthly_budget.toFixed(6) : project.monthly_budget.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Total Requests
          </span>
          <p className="mt-2 text-2xl font-bold font-mono text-white">
            {projectLogs.length}
          </p>
          <span className="text-xs text-text-muted mt-1 block">
            {successfulCalls} OK · {blockedCalls} 429 Blocked
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Tokens Processed
          </span>
          <p className="mt-2 text-2xl font-bold font-mono text-white">
            {totalTokens.toLocaleString()}
          </p>
          <span className="text-xs text-text-muted mt-1 block">
            Zero-copy token counter
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Average Cost / Req
          </span>
          <p className="mt-2 text-2xl font-bold font-mono text-white">
            $
            {successfulCalls > 0
              ? (project.spend / successfulCalls).toFixed(6)
              : "0.000000"}
          </p>
          <span className="text-xs text-text-muted mt-1 block">
            Accurate upstream pricing
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border">
          <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Quota Enforcement
          </span>
          <div className="flex items-center gap-2 mt-2">
            <ShieldCheck className="size-5 text-emerald-400" />
            <span className="text-base font-semibold text-white">Active</span>
          </div>
          <span className="text-xs text-text-muted mt-1 block">
            Atomic Redis pipeline check
          </span>
        </div>
      </div>

      {/* Interactive Code Integration Snippet */}
      <div className="p-6 rounded-2xl bg-surface border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <Terminal className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Quick Integration
              </h3>
              <p className="text-xs text-text-secondary">
                Point your app to Setu gateway using your project credentials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-[#141414] p-1 border border-border/80">
              <button
                type="button"
                onClick={() => setActiveTab("curl")}
                className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeTab === "curl"
                    ? "bg-white text-black font-semibold"
                    : "text-text-muted hover:text-white"
                }`}
              >
                cURL
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("python")}
                className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeTab === "python"
                    ? "bg-white text-black font-semibold"
                    : "text-text-muted hover:text-white"
                }`}
              >
                Python
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("node")}
                className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  activeTab === "node"
                    ? "bg-white text-black font-semibold"
                    : "text-text-muted hover:text-white"
                }`}
              >
                Node.js
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-medium hover:bg-white/15 transition-colors cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="size-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
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

        <div className="mt-4 rounded-xl bg-[#0f0f0f] border border-border/60 p-4 font-mono text-xs text-text-primary overflow-x-auto">
          <pre>{getCodeSnippet()}</pre>
        </div>
      </div>

      {/* Recent Logs Preview */}
      <div className="p-6 rounded-2xl bg-surface border border-border">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Requests</h3>
            <p className="text-xs text-text-secondary">
              Latest incoming calls routed through this project.
            </p>
          </div>
          <Link
            to={`/dashboard/project/${project.id}/logs`}
            className="flex items-center gap-1 text-xs text-white hover:text-brand transition-colors font-medium"
          >
            <span>View All Logs</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {projectLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted">
            No requests logged yet. Use the "Simulate 200 OK" button above to test!
          </div>
        ) : (
          <div className="mt-4 divide-y divide-border/40">
            {projectLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-semibold px-2 py-0.5 rounded text-[11px] ${
                      log.status_code === 200
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {log.status_code}
                  </span>
                  <span className="font-mono text-white">{log.model}</span>
                  <span className="text-text-muted">
                    {log.prompt_tokens + log.completion_tokens} tokens
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono text-white">
                    ${log.cost_usd.toFixed(6)}
                  </span>
                  <span className="text-text-muted">{log.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
