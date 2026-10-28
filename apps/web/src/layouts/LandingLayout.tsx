import { Outlet } from "react-router-dom";

export default function LandingLayout() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-text-primary">
      <Outlet />
    </div>
  );
}
