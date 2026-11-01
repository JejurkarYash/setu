import { Outlet } from "react-router-dom";

export default function LandingLayout() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-text-primary">
      <Outlet />
    </div>
  );
}
