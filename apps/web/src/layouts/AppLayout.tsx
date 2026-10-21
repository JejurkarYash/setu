import { useState, useEffect, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

type AppLayoutProps = {
  children?: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = collapsed ? 100 : 270;

  return (
    <div className="min-h-screen w-full bg-background text-text-primary flex flex-row overflow-x-hidden relative">
      {/* ── Sidebar Navigation ───────────────────────────── */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((current) => !current)}
      />

      {/* ── Main Work Area ────────────────────────────────── */}
      <main
        className="flex-1 min-h-screen max-w-full bg-background overflow-x-hidden overflow-y-auto transition-[padding-left] duration-200 ease-out"
        style={{
          paddingLeft: isMobile ? "12px" : `${sidebarWidth}px`,
          paddingTop: "24px",
          paddingBottom: "112px",
          paddingRight: isMobile ? "12px" : collapsed ? "50px" : "32px",
        }}
      >
        {/* Equalized Left/Right Padding Wrapper */}
        <div className="w-full max-w-[1600px] mx-auto px-5 sm:px-6 md:px-8 lg:px-10">
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  );
}
