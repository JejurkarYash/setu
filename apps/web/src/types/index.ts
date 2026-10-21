export interface Project {
  id: string;
  name: string;
  monthly_budget: number;
  spend: number;
  provider: Provider;
  created_at: string;
  key_prefix?: string;
}

export interface ApiKey {
  id: string;
  project_id: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

export interface UsageLog {
  id: string;
  project_id: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  cost_usd: number;
  status_code: number;
  created_at: string;
}

export interface AlertSetting {
  id: string;
  project_id: string;
  trigger_threshold_pct: number;
  notify_slack: boolean;
  last_notified_at?: string;
  created_at: string;
}

export type Provider = "openai" | "anthropic" | "gemini";
