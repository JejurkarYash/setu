import api from "../lib/api";
import type { ApiKey } from "../types";

interface ProjectOverviewResponse {
  project: {
    proxy_key_prefix: string;
  };
}

interface GenerateApiKeyResponse {
  id: string;
  key_prefix: string;
  api_key: string;
}

export async function fetchProjectKeyMetadata(
  projectId: string,
): Promise<ApiKey> {
  const response = await api.get<ProjectOverviewResponse>(
    `/projects/${projectId}/overview`,
  );

  return {
    id: `${projectId}-active`,
    project_id: projectId,
    key_prefix: response.data.project.proxy_key_prefix,
    is_active: true,
    created_at: "",
  };
}

export async function generateProjectKey(projectId: string): Promise<{
  key: ApiKey;
  rawSecret: string;
}> {
  const response = await api.post<GenerateApiKeyResponse>(
    `/projects/key/generate/${projectId}`,
  );

  return {
    key: {
      id: response.data.id,
      project_id: projectId,
      key_prefix: response.data.key_prefix,
      is_active: true,
      created_at: new Date().toISOString(),
    },
    rawSecret: response.data.api_key,
  };
}
