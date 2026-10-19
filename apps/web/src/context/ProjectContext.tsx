import React, { createContext, useContext, useState, useEffect } from "react";
import type { Project, ApiKey, UsageLog, AlertSetting, Provider } from "../types";
import {
  initialProjects,
  sampleApiKeys,
  sampleLogs,
  sampleAlerts,
} from "../data/mockData";

interface ProjectContextType {
  projects: Project[];
  apiKeys: Record<string, ApiKey[]>;
  logs: Record<string, UsageLog[]>;
  alerts: Record<string, AlertSetting>;
  createProject: (data: {
    name: string;
    monthly_budget: number;
    provider: Provider;
    providerKey?: string;
  }) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  resetBudgetUsage: (id: string) => void;
  deleteProject: (id: string) => void;
  generateApiKey: (projectId: string) => ApiKey & { rawSecret: string };
  revokeApiKey: (projectId: string, keyId: string) => void;
  saveAlert: (projectId: string, alertData: Partial<AlertSetting>) => void;
  addMockLog: (projectId: string, status?: number) => void;
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
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load projects from storage", e);
    }
    return initialProjects;
  });

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
    return sampleAlerts;
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error(e);
    }
  }, [projects]);

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

  const createProject = (data: {
    name: string;
    monthly_budget: number;
    provider: Provider;
    providerKey?: string;
  }): Project => {
    const id = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const uniqueId = projects.some((p) => p.id === id)
      ? `${id}-${Math.floor(Math.random() * 1000)}`
      : id;

    const prefix = `setu_live_${data.provider.slice(0, 3)}_${Math.random()
      .toString(36)
      .substring(2, 6)}`;

    const newProject: Project = {
      id: uniqueId,
      name: data.name,
      monthly_budget: data.monthly_budget,
      spend: 0,
      provider: data.provider,
      created_at: new Date().toISOString(),
      key_prefix: prefix,
    };

    setProjects((prev) => [newProject, ...prev]);

    // Initialize default API key for project
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      project_id: uniqueId,
      key_prefix: prefix,
      is_active: true,
      created_at: new Date().toISOString(),
      last_used_at: undefined,
    };

    setApiKeys((prev) => ({
      ...prev,
      [uniqueId]: [newKey],
    }));

    // Initialize default alert
    setAlerts((prev) => ({
      ...prev,
      [uniqueId]: {
        id: `alert-${Date.now()}`,
        project_id: uniqueId,
        trigger_threshold_pct: 80,
        notify_slack: false,
        created_at: new Date().toISOString(),
      },
    }));

    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const resetBudgetUsage = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, spend: 0 } : p))
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

  const generateApiKey = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    const prefix = project?.key_prefix ?? `setu_live_${Math.random().toString(36).substring(2, 7)}`;
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

    setApiKeys((prev) => ({
      ...prev,
      [projectId]: [newKey, ...(prev[projectId] ?? [])],
    }));

    return { ...newKey, rawSecret };
  };

  const revokeApiKey = (projectId: string, keyId: string) => {
    setApiKeys((prev) => ({
      ...prev,
      [projectId]: (prev[projectId] ?? []).map((k) =>
        k.id === keyId ? { ...k, is_active: false } : k
      ),
    }));
  };

  const saveAlert = (projectId: string, alertData: Partial<AlertSetting>) => {
    setAlerts((prev) => {
      const existing = prev[projectId] ?? {
        id: `alert-${Date.now()}`,
        project_id: projectId,
        trigger_threshold_pct: 80,
        notify_slack: false,
        created_at: new Date().toISOString(),
      };
      return {
        ...prev,
        [projectId]: { ...existing, ...alertData },
      };
    });
  };

  const addMockLog = (projectId: string, statusCode = 200) => {
    const project = projects.find((p) => p.id === projectId);
    const model =
      project?.provider === "openai"
        ? "gpt-5.5"
        : project?.provider === "anthropic"
        ? "claude-3-7-sonnet"
        : "gemini-2.5-flash";

    const promptTokens = statusCode === 200 ? Math.floor(Math.random() * 200) + 20 : 0;
    const completionTokens = statusCode === 200 ? Math.floor(Math.random() * 80) + 10 : 0;
    const cost = statusCode === 200 ? Number((promptTokens * 0.000003 + completionTokens * 0.000015).toFixed(6)) : 0;

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
          p.id === projectId ? { ...p, spend: Number((p.spend + cost).toFixed(6)) } : p
        )
      );
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
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
