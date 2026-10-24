import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";
import type { Project, ApiKey, Provider } from "../types";
import {
  createProject as createProjectFromApi,
  fetchProjects as fetchProjectsFromApi,
} from "../api/projectApi";
import {
  sampleApiKeys,
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
  alerts: Record<string, AlertSetting>;
  createProject: (data: {
    name: string;
    monthly_budget: number;
    provider: Provider;
    providerKey: string;
  }) => Promise<{ project: Project; apiKey: string }>;
  updateProject: (id: string, updates: Partial<Project>) => void;
  resetBudgetUsage: (id: string) => void;
  deleteProject: (id: string) => void;
  generateApiKey: (projectId: string) => ApiKey & { rawSecret: string };
  revokeApiKey: (projectId: string, keyId: string) => void;
  saveAlert: (projectId: string, alertData: Partial<AlertSetting>) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROJECTS: "setu_projects",
  KEYS: "setu_api_keys",
  ALERTS: "setu_alerts",
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
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
    void fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.KEYS, JSON.stringify(apiKeys));
    } catch (e) {
      console.error(e);
    }
  }, [apiKeys]);

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
  }): Promise<{ project: Project; apiKey: string }> => {
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

    return {
      project: createdProject,
      apiKey: response.api_key,
    };
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

  return (
    <ProjectContext.Provider
      value={{
        projects,
        isLoadingProjects,
        projectsError,
        fetchProjects,
        apiKeys,
        alerts,
        createProject,
        updateProject,
        resetBudgetUsage,
        deleteProject,
        generateApiKey,
        revokeApiKey,
        saveAlert,
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
