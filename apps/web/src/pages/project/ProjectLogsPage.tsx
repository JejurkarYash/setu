import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Search,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";

export default function ProjectLogsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, logs, addMockLog } = useProjects();

  const project = projects.find((p) => p.id === projectId);
  const projectLogs = projectId ? logs[projectId] ?? [] : [];

  const [filterStatus, setFilterStatus] = useState<"all" | "200" | "429">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [simulating, setSimulating] = useState(false);

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

  const filteredLogs = useMemo(() => {
    return projectLogs.filter((log) => {
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "200" && log.status_code === 200) ||
        (filterStatus === "429" && log.status_code === 429);

      const matchesSearch =
        searchQuery.trim() === "" ||
        log.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [projectLogs, filterStatus, searchQuery]);

  const handleSimulate = (status: number) => {
    if (!projectId) return;
    setSimulating(true);
    setTimeout(() => {
      addMockLog(projectId, status);
      setSimulating(false);
    }, 300);
  };

  const totalCost = filteredLogs.reduce((acc, l) => acc + l.cost_usd, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-6">
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
            <span className="text-white">Request Logs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Request Logs & Telemetry
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Live telemetry flushed by Setu background batch workers with zero-copy stream chunking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={simulating}
            onClick={() => handleSimulate(200)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-white hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <Activity className="size-3.5 text-emerald-400" />
            <span>Simulate 200</span>
          </button>

          <button
            type="button"
            disabled={simulating}
            onClick={() => handleSimulate(429)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-border text-xs font-medium text-white hover:bg-surface-elevated transition-colors cursor-pointer"
          >
            <AlertTriangle className="size-3.5 text-red-400" />
            <span>Simulate 429</span>
          </button>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-surface border border-border">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by model or log ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#141414] border border-border text-xs text-white placeholder-text-muted focus:outline-none focus:border-brand transition-colors"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 rounded-xl bg-[#141414] p-1 border border-border/80">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              filterStatus === "all"
                ? "bg-white text-black font-semibold"
                : "text-text-muted hover:text-white"
            }`}
          >
            All ({projectLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("200")}
            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              filterStatus === "200"
                ? "bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30"
                : "text-text-muted hover:text-white"
            }`}
          >
            200 OK
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("429")}
            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              filterStatus === "429"
                ? "bg-red-500/20 text-red-300 font-semibold border border-red-500/30"
                : "text-text-muted hover:text-white"
            }`}
          >
            429 Blocked
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#141414] border border-border/60 text-xs font-mono text-text-muted">
          <span>Cost:</span>
          <span className="text-white font-semibold">${totalCost.toFixed(6)}</span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="p-6 rounded-2xl bg-surface border border-border">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-muted">
            No logs matching current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-border/40 text-text-muted font-sans font-medium text-[11px] uppercase tracking-wider">
                  <th className="pb-3 pl-2">Status</th>
                  <th className="pb-3">Model</th>
                  <th className="pb-3">Tokens (Prompt / Comp)</th>
                  <th className="pb-3">Cost (USD)</th>
                  <th className="pb-3 pr-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/25">
                {filteredLogs.map((log) => {
                  const isBlocked = log.status_code === 429;
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 pl-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                            isBlocked
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              isBlocked ? "bg-red-400" : "bg-emerald-400"
                            }`}
                          />
                          {log.status_code} {isBlocked ? "Quota Limit" : "OK"}
                        </span>
                      </td>

                      <td className="py-3 text-white font-medium">
                        {log.model}
                      </td>

                      <td className="py-3 text-text-secondary">
                        {isBlocked ? (
                          <span className="text-text-muted font-sans italic text-[11px]">
                            Request intercepted before upstream
                          </span>
                        ) : (
                          <span>
                            <span className="text-white">{log.prompt_tokens}</span> in /{" "}
                            <span className="text-white">{log.completion_tokens}</span> out{" "}
                            <span className="text-text-muted">
                              ({log.prompt_tokens + log.completion_tokens} total)
                            </span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 text-white">
                        {isBlocked ? (
                          <span className="text-emerald-400">$0.000000 (Saved)</span>
                        ) : (
                          `$${log.cost_usd.toFixed(6)}`
                        )}
                      </td>

                      <td className="py-3 pr-2 text-right text-text-muted font-sans">
                        {log.created_at}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
