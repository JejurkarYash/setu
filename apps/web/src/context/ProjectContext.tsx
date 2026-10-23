import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";
import type { Project, ApiKey, UsageLog, Provider } from "../types";
import {
  createProject as createProjectFromApi,
  fetchProjects as fetchProjectsFromApi,
} from "../api/projectApi";
import {
  sampleApiKeys,
  sampleLogs,
  sampleAlerts,
} from "../data/mockData";

export interface NotificationChannel {
  id: string;
  type: "slack" | "email";
  webhookUrl?: string;
  emailAddress?: string;
  enabled: boolean;
}

export interface AlertSetting {
  id: string;
  project_id: string;
  enabled: boolean;
  trigger_threshold_pct: number;
  channels: NotificationChannel[];
  notify_slack?: boolean;
  created_at: string;
}

interface ProjectContextType {
  projects: Project[];
  isLoadingProjects: boolean;
  projectsError: string | null;
  fetchProjects: () => Promise<void>;
  apiKeys: Record<string, ApiKey[]>;
  logs: Record<string, UsageLog[]>;
  alerts: Record<string, AlertSetting>;
  createProject: (data: {
    name: string;
    monthly_budget: number;
    provider: Provider;
    providerKey: string;
  }) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => void;
  resetBudgetUsage: (id: string) => void;
  deleteProject: (id: string) => void;
  generateApiKey: (projectId: string) => ApiKey & { rawSecret: string };
  revokeApiKey: (projectId: string, keyId: string) => void;
  saveAlert: (projectId: string, alertData: Partial<AlertSetting>) => void;
  addMockLog: (projectId: string, statusCode?: number) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROJECTS: "setu_projects",
  KEYS: "setu_api_keys",
  LOGS: "setu_logs",
  ALERTS: "setu_alerts",
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [apiKeys, setApiKeys] = useState<Record<string, ApiKey[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.KEYS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load api keys from storage", e);
    }
    return sampleApiKeys;
  });

  const [logs, setLogs] = useState<Record<string, UsageLog[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load logs from storage", e);
    }
    return sampleLogs;
  });

  const [alerts, setAlerts] = useState<Record<string, AlertSetting>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load alerts from storage", e);
    }
    return sampleAlerts as unknown as Record<string, AlertSetting>;
  });

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error(e);
    }
  }, [projects]);

  const fetchProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    setProjectsError(null);

    try {
      const fetchedProjects = await fetchProjectsFromApi();
      setProjects(fetchedProjects);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch projects";
      setProjectsError(message);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.KEYS, JSON.stringify(apiKeys));
    } catch (e) {
      console.error(e);
    }
  }, [apiKeys]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  }, [logs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch (e) {
      console.error(e);
    }
  }, [alerts]);

  const createProject = async (data: {
    name: string;
    monthly_budget: number;
    provider: Provider;
    providerKey: string;
  }): Promise<Project> => {
    const response = await createProjectFromApi({
      name: data.name.trim(),
      monthly_budget: data.monthly_budget,
      provider: data.provider,
      provider_key: data.providerKey.trim(),
    });

    const fetchedProjects = await fetchProjectsFromApi();
    setProjects(fetchedProjects);

    const createdProject = fetchedProjects.find(
      (project) => project.id === response.id,
    );

    if (!createdProject) {
      throw new Error("Created project was not returned by the projects API");
    }

    return createdProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  };

  const resetBudgetUsage = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, spend: 0 } : p)),
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setApiKeys((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setLogs((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setAlerts((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Generate / Rotate API Key (Enforces single active key rule)
  const generateApiKey = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    const prefix = project?.id.slice(0, 8) ?? "project";
    const randomSuffix = Math.random().toString(36).substring(2, 14);
    const rawSecret = `${prefix}_${randomSuffix}`;

    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      project_id: projectId,
      key_prefix: prefix,
      is_active: true,
      created_at: new Date().toISOString(),
      last_used_at: undefined,
    };

    // Invalidate previous active keys upon rotation
    setApiKeys((prev) => {
      const existing = (prev[projectId] ?? []).map((k) => ({
        ...k,
        is_active: false,
      }));
      return {
        ...prev,
        [projectId]: [newKey, ...existing],
      };
    });

    return { ...newKey, rawSecret };
  };

  const revokeApiKey = (projectId: string, keyId: string) => {
    setApiKeys((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] ?? []).map((k) =>
        k.id === keyId ? { ...k, is_active: false } : k,
      ),
    }));
  };

  const saveAlert = (projectId: string, alertData: Partial<AlertSetting>) => {
    setAlerts((prev) => {
      const existing: AlertSetting = prev[projectId] ?? {
        id: `alert-${Date.now()}`,
        project_id: projectId,
        enabled: false,
        trigger_threshold_pct: 80,
        channels: [],
        created_at: new Date().toISOString(),
      };

      return {
        ...prev,
        [projectId]: { ...existing, ...alertData },
      };
    });
  };

  const addMockLog = (projectId: string, statusCode = 200) => {
    const model = "unknown";

    const promptTokens =
      statusCode === 200 ? Math.floor(Math.random() * 200) + 20 : 0;
    const completionTokens =
      statusCode === 200 ? Math.floor(Math.random() * 80) + 10 : 0;
    const cost =
      statusCode === 200
        ? Number(
            (promptTokens * 0.000003 + completionTokens * 0.000015).toFixed(6),
          )
        : 0;

    const newLog: UsageLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      project_id: projectId,
      model: statusCode === 200 ? model : "blocked_quota_exceeded",
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      cost_usd: cost,
      status_code: statusCode,
      created_at: "Just now",
    };

    setLogs((prev) => ({
      ...prev,
      [projectId]: [newLog, ...(prev[projectId] ?? [])],
    }));

    if (cost > 0) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, spend: Number((p.spend + cost).toFixed(6)) }
            : p,
        ),
      );
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        isLoadingProjects,
        projectsError,
        fetchProjects,
        apiKeys,
        logs,
        alerts,
        createProject,
        updateProject,
        resetBudgetUsage,
        deleteProject,
        generateApiKey,
        revokeApiKey,
        saveAlert,
        addMockLog,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
};
