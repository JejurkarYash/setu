import { useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

type AppLayoutProps = {
  children?: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((current) => !current)}
      />
      <main
        className={`min-h-screen pb-28 transition-[padding] duration-200 motion-reduce:transition-none md:pb-8 ${
          collapsed ? "md:pl-[72px]" : "md:pl-60"
        }`}
      >
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
