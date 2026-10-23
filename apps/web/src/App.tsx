import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProjectProvider } from "./context/ProjectContext";
import { UserProvider } from "./context/UserContext";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import GlobalSettingsPage from "./pages/GlobalSettingsPage";
import ProjectOverviewPage from "./pages/project/ProjectOverviewPage";
import ProjectKeysPage from "./pages/project/ProjectKeysPage";
import ProjectLogsPage from "./pages/project/ProjectLogsPage";
import ProjectAlertsPage from "./pages/project/ProjectAlertsPage";
import ProjectSettingsPage from "./pages/project/ProjectSettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <ProjectProvider>
          <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<AppLayout />}>
            {/* Global Workspace Routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/settings" element={<GlobalSettingsPage />} />

            {/* Project Workspace Routes */}
            <Route
              path="/dashboard/project/:projectId"
              element={<ProjectOverviewPage />}
            />
            <Route
              path="/dashboard/project/:projectId/overview"
              element={<ProjectOverviewPage />}
            />
            <Route
              path="/dashboard/project/:projectId/keys"
              element={<ProjectKeysPage />}
            />
            <Route
              path="/dashboard/project/:projectId/logs"
              element={<ProjectLogsPage />}
            />
            <Route
              path="/dashboard/project/:projectId/alerts"
              element={<ProjectAlertsPage />}
            />
            <Route
              path="/dashboard/project/:projectId/settings"
              element={<ProjectSettingsPage />}
            />
          </Route>

          {/* Catch-all redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ProjectProvider>
      </UserProvider>
    </BrowserRouter>
  );
}
