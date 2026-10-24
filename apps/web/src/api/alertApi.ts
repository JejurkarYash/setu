import axios from "axios";
import api from "../lib/api";

export interface AlertConfig {
  id: string;
  project_id: string;
  notify_slack: boolean;
  trigger_threshold_pct: number;
  last_notified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlertPayload {
  trigger_threshold: number;
  notify_slack: boolean;
  slack_webhook_url?: string;
}

export async function fetchAlertConfig(
  projectId: string,
): Promise<AlertConfig | null> {
  try {
    const response = await api.get<AlertConfig>(
      `/projects/alert/${projectId}`,
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createAlertConfig(
  projectId: string,
  payload: AlertPayload,
): Promise<AlertConfig> {
  const response = await api.post<AlertConfig>(
    `/projects/alert/${projectId}`,
    { project_id: projectId, ...payload },
  );
  return response.data;
}

export async function updateAlertConfig(
  projectId: string,
  payload: Partial<AlertPayload>,
): Promise<AlertConfig> {
  const response = await api.patch<AlertConfig>(
    `/projects/alert/${projectId}`,
    payload,
  );
  return response.data;
}

export async function deleteAlertConfig(projectId: string): Promise<void> {
  await api.delete(`/projects/alert/${projectId}`);
}
