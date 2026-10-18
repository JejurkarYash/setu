import { useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [activeItem, setActiveItem] = useState("Overview");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((current) => !current)}
        onNavigate={setActiveItem}
        activeItem={activeItem}
      />
      <main
        className={`min-h-screen pb-24 transition-[padding] duration-200 motion-reduce:transition-none md:pb-0 ${
          collapsed ? "md:pl-[68px]" : "md:pl-60"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
