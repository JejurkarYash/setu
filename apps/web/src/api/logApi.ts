import api from "../lib/api";
import type { UsageLog } from "../types";

interface UsageLogResponse {
  usage_logs: Array<{
    ID?: string;
    id?: string;
    ProjectID?: string;
    project_id?: string;
    Model?: string;
    model?: string;
    PromptTokens?: number;
    prompt_tokens?: number;
    CompletionTokens?: number;
    completion_tokens?: number;
    CostUsd?: number;
    cost_usd?: number;
    StatusCode?: number;
    status_code?: number;
    CreatedAt?: string;
    created_at?: string;
  }>;
}

function normalizeLog(
  log: UsageLogResponse["usage_logs"][number],
  projectId: string,
): UsageLog {
  return {
    id: log.ID ?? log.id ?? "",
    project_id: log.ProjectID ?? log.project_id ?? projectId,
    model: log.Model ?? log.model ?? "",
    prompt_tokens: log.PromptTokens ?? log.prompt_tokens ?? 0,
    completion_tokens: log.CompletionTokens ?? log.completion_tokens ?? 0,
    cost_usd: log.CostUsd ?? log.cost_usd ?? 0,
    status_code: log.StatusCode ?? log.status_code ?? 0,
    created_at: log.CreatedAt ?? log.created_at ?? "",
  };
}

export async function fetchProjectLogs(
  projectId: string,
  limit: number,
  offset: number,
): Promise<UsageLog[]> {
  const response = await api.get<UsageLogResponse>(
    `/projects/${projectId}/logs`,
    { params: { limit, offset } },
  );

  return response.data.usage_logs.map((log) => normalizeLog(log, projectId));
}
