import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProjectProvider } from "./context/ProjectContext";
import { UserProvider } from "./context/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import LandingLayout from "./layouts/LandingLayout";
import DashboardPage from "./pages/DashboardPage";
import DocsPage from "./pages/DocsPage";
import GlobalSettingsPage from "./pages/GlobalSettingsPage";
import LandingPage from "./pages/landing/LandingPage";
import LoginPage from "./pages/LoginPage";
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
          <Route element={<LandingLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/docs" element={<DocsPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
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
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProjectProvider>
      </UserProvider>
    </BrowserRouter>
  );
}
