import type { Project } from "../types";
import api from "../lib/api";

interface ProjectResponse {
  ID: string;
  Name: string;
  UserID: string;
  MonthlyBudget: number;
  CreatedAt: string;
  UpdatedAt: string;
  Spend: number;
}

interface ListProjectsResponse {
  projects: ProjectResponse[];
}

export interface CreateProjectRequest {
  name: string;
  monthly_budget: number;
  provider: "openai" | "anthropic" | "gemini";
  provider_key: string;
}

interface CreateProjectResponse {
  id: string;
}

export async function fetchProjects(): Promise<Project[]> {
  const response = await api.get<ListProjectsResponse>("/projects");

  return response.data.projects.map((project) => ({
    id: project.ID,
    name: project.Name,
    user_id: project.UserID,
    monthly_budget: project.MonthlyBudget,
    created_at: project.CreatedAt,
    updated_at: project.UpdatedAt,
    spend: project.Spend,
  }));
}

export async function createProject(
  data: CreateProjectRequest,
): Promise<CreateProjectResponse> {
  const response = await api.post<CreateProjectResponse>("/projects", data);
  return response.data;
}
