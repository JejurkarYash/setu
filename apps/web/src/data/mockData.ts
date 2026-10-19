import type { Project, ApiKey, UsageLog, AlertSetting } from "../types";

export const initialProjects: Project[] = [
  {
    id: "low-budget-test",
    name: "Low Budget Quota Test Project",
    monthly_budget: 0.0008,
    spend: 0.000435,
    provider: "openai",
    created_at: "2026-10-12T10:00:00Z",
    key_prefix: "setu_live_limit",
  },
  {
    id: "openai-production",
    name: "OpenAI Production Gateway",
    monthly_budget: 100.0,
    spend: 14.82,
    provider: "openai",
    created_at: "2026-10-10T14:30:00Z",
    key_prefix: "setu_live_openai",
  },
  {
    id: "claude-eval-pipeline",
    name: "Anthropic Claude Test Project",
    monthly_budget: 100.0,
    spend: 4.25,
    provider: "anthropic",
    created_at: "2026-10-11T09:15:00Z",
    key_prefix: "setu_live_ant",
  },
  {
    id: "gemini-flash-app",
    name: "Gemini 2.5 Flash High Throughput",
    monthly_budget: 50.0,
    spend: 0.38,
    provider: "gemini",
    created_at: "2026-10-12T16:45:00Z",
    key_prefix: "setu_live_gem",
  },
];

export const sampleApiKeys: Record<string, ApiKey[]> = {
  "low-budget-test": [
    {
      id: "key-1",
      project_id: "low-budget-test",
      key_prefix: "setu_live_limit",
      is_active: true,
      created_at: "2026-10-12T10:00:00Z",
      last_used_at: "2026-10-19T22:30:00Z",
    },
  ],
  "openai-production": [
    {
      id: "key-2",
      project_id: "openai-production",
      key_prefix: "setu_live_openai",
      is_active: true,
      created_at: "2026-10-10T14:30:00Z",
      last_used_at: "2026-10-19T21:45:00Z",
    },
  ],
};

export const sampleLogs: Record<string, UsageLog[]> = {
  "low-budget-test": [
    {
      id: "log-1",
      project_id: "low-budget-test",
      model: "gpt-5.5",
      prompt_tokens: 45,
      completion_tokens: 12,
      cost_usd: 0.000435,
      status_code: 200,
      created_at: "2 minutes ago",
    },
    {
      id: "log-2",
      project_id: "low-budget-test",
      model: "gpt-5.5",
      prompt_tokens: 42,
      completion_tokens: 10,
      cost_usd: 0.00041,
      status_code: 200,
      created_at: "5 minutes ago",
    },
    {
      id: "log-3",
      project_id: "low-budget-test",
      model: "blocked",
      prompt_tokens: 0,
      completion_tokens: 0,
      cost_usd: 0,
      status_code: 429,
      created_at: "8 minutes ago",
    },
  ],
};

export const sampleAlerts: Record<string, AlertSetting> = {
  "low-budget-test": {
    id: "alert-1",
    project_id: "low-budget-test",
    trigger_threshold_pct: 80,
    notify_slack: true,
    created_at: "2026-10-12T11:00:00Z",
  },
};
