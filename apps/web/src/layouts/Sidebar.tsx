import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Box,
  CodeXml,
  BarChart3,
  Bell,
  Settings,
  PanelLeftOpen,
  PanelLeftClose,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useUser } from "../context/UserContext";

export type NavItem = {
  label: string;
  mobileLabel: string;
  path: string;
  icon: LucideIcon;
};

export const globalNavItems: NavItem[] = [
  {
    label: "Projects",
    mobileLabel: "Projects",
    path: "/dashboard",
    icon: LayoutGrid,
  },
  {
    label: "Global Settings",
    mobileLabel: "Settings",
    path: "/dashboard/settings",
    icon: Settings,
  },
];

export const getProjectNavItems = (projectId: string): NavItem[] => [
  {
    label: "Overview",
    mobileLabel: "Dashboard",
    path: `/dashboard/project/${projectId}`,
    icon: LayoutGrid,
  },
  {
    label: "API Keys",
    mobileLabel: "APIs",
    path: `/dashboard/project/${projectId}/keys`,
    icon: CodeXml,
  },
  {
    label: "Request Logs",
    mobileLabel: "Analytics",
    path: `/dashboard/project/${projectId}/logs`,
    icon: BarChart3,
  },
  {
    label: "Alerts",
    mobileLabel: "Alerts",
    path: `/dashboard/project/${projectId}/alerts`,
    icon: Bell,
  },
  {
    label: "Settings",
    mobileLabel: "Settings",
    path: `/dashboard/project/${projectId}/settings`,
    icon: Settings,
  },
];

function BrandMark() {
  return (
    <span className="flex size-8 shrink-0    items-center justify-center bg-brand text-background shadow-md shadow-brand/25">
      <svg
        aria-hidden="true"
        className="size-4"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M6 6.5 12 3l6 3.5v7L12 17l-6-3.5v-7Z"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="m9 12 3 1.75L15 12" stroke="currentColor" strokeWidth="2.2" />
      </svg>
    </span>
  );
}

function DesktopNavButton({
  item,
  collapsed,
  isActive,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;

  return (
    <div
      className="relative flex items-center w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.button
        type="button"
        aria-label={item.label}
        aria-current={isActive ? "page" : undefined}
        onClick={onClick}
        whileTap={{ scale: 0.96 }}
        className={`group relative flex items-center w-full cursor-pointer select-none transition-colors duration-150 focus-visible:outline-none ${
          collapsed
            ? "size-10 aspect-square justify-center mx-auto"
            : "h-10 justify-start px-3 gap-3  "
        } ${isActive ? "text-white" : "text-[#8e8e8e] hover:text-white"}`}
      >
        {/* Active Gray Background Box */}
        {isActive && (
          <motion.div
            layoutId="desktopActiveBackground"
            className="absolute inset-0 bg-white/10 border border-white/10 shadow-sm"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}

        {/* Hover Highlight */}
        {!isActive && isHovered && (
          <motion.div
            layoutId="desktopHoverBackground"
            className="absolute inset-0 bg-white/[0.04]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          />
        )}

        <Icon
          className={`relative z-10 size-4.5 shrink-0 transition-colors duration-150 ${
            isActive ? "text-white" : "text-[#8e8e8e] group-hover:text-white"
          } ${collapsed ? "" : "justify-center left-3 "}`}
        />

        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className={`relative z-10 truncate text-sm font-medium tracking-tight whitespace-nowrap ${
                isActive
                  ? "text-white font-semibold"
                  : "text-[#a3a3a3] group-hover:text-white"
              } ${collapsed ? "hidden" : " jusitfy-center left-4 "}`}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Floating Tooltip */}
      <AnimatePresence>
        {collapsed && isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -4, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 flex items-center"
          >
            <div className="border border-border w-full h-6 flex items-center text-center bg-[#181818] px-3 py-1 text-xs font-medium text-white shadow-xl backdrop-blur-md whitespace-nowrap">
              {item.label}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileNavItem({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
      className={`group relative flex flex-1 flex-col items-center justify-center h-full cursor-pointer select-none transition-colors duration-150 focus-visible:outline-none ${
        isActive ? "text-white" : "text-[#7f7f7f] hover:text-[#b5b5b5]"
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="mobileActiveIndicator"
          className="absolute inset-1.5 bg-white/10 border border-white/15 shadow-sm"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}

      <Icon
        className={`relative z-10 size-5 shrink-0 transition-transform duration-150 ${
          isActive
            ? "text-white scale-105"
            : "text-[#808080] group-hover:text-white"
        }`}
      />
    </motion.button>
  );
}

export default function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const [brandHovered, setBrandHovered] = useState(false);
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const projectPathMatch = location.pathname.match(
    /^\/dashboard\/project\/([^/]+)/,
  );
  const isProjectContext = Boolean(projectPathMatch);
  const currentProjectId = projectPathMatch ? projectPathMatch[1] : null;

  const navItems: NavItem[] =
    isProjectContext && currentProjectId
      ? getProjectNavItems(currentProjectId)
      : globalNavItems;

  const isItemActive = (item: NavItem) => {
    if (item.path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    if (item.label === "Overview" && currentProjectId) {
      return (
        location.pathname === `/dashboard/project/${currentProjectId}` ||
        location.pathname === `/dashboard/project/${currentProjectId}/overview`
      );
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: "spring", stiffness: 350, damping: 32 }}
        className="fixed inset-y-0 left-0 z-30 hidden md:flex flex-col border-r border-border bg-[#0D0D0D] select-none justify-between"
      >
        <div className="w-full">
          {/* Header Section */}
          <div className="relative flex h-16 items-center border-b border-border px-3.5">
            {collapsed ? (
              <div className="flex w-full items-center justify-center">
                <button
                  type="button"
                  onClick={onToggle}
                  onMouseEnter={() => setBrandHovered(true)}
                  onMouseLeave={() => setBrandHovered(false)}
                  className="relative flex size-10 items-center justify-center cursor-pointer transition-all duration-200 hover:bg-white/[0.05]"
                >
                  <AnimatePresence mode="wait">
                    {brandHovered ? (
                      <motion.div
                        key="panel-open"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center justify-center text-white"
                      >
                        <PanelLeftOpen className="size-5" />
                      </motion.div>
                    ) : (
                      <motion.div key="brand-mark">
                        <BrandMark />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            ) : (
              <div className="flex w-full items-center justify-center gap-26 left-2 ">
                <div
                  className="flex items-center gap-3 cursor-pointer "
                  onClick={() => navigate("/dashboard")}
                >
                  <BrandMark />
                  <span className="text-sm font-semibold tracking-wide text-white whitespace-nowrap">
                    Setu
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onToggle}
                  className="flex size-8 items-center justify-center text-zinc-400 hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer"
                >
                  <PanelLeftClose className="size-5" />
                </button>
              </div>
            )}
          </div>

          {/* Nav Section (p-3 guarantees left/right/top breathing room) */}
          <nav className="flex flex-col p-3 space-y-1 w-full">
            {navItems.map((item) => (
              <DesktopNavButton
                key={item.label}
                item={item}
                collapsed={collapsed}
                isActive={isItemActive(item)}
                onClick={() => navigate(item.path)}
              />
            ))}

            {isProjectContext && (
              <div className="mt-4 pt-3 border-t border-border/60 flex flex-col w-full">
                <DesktopNavButton
                  item={{
                    label: "All Projects",
                    mobileLabel: "Projects",
                    path: "/dashboard",
                    icon: Box,
                  }}
                  collapsed={collapsed}
                  isActive={location.pathname === "/dashboard"}
                  onClick={() => navigate("/dashboard")}
                />
              </div>
            )}
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="border-t border-border/60 bg-[#0D0D0D] px-4 py-6 shrink-0 mt-auto">
          <div
            className={`group relative flex items-center gap-3 p-2.5 hover:bg-white/[0.04] transition-colors cursor-pointer select-none ${
              collapsed ? "justify-center px-0" : "px-3"
            }`}
          >
            {/* Avatar Box */}
            <div className="flex size-9 shrink-0 items-center justify-center bg-zinc-800 text-xs font-semibold text-white border border-zinc-700 shadow-sm">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={`${user.name}'s avatar`}
                  className="size-full object-cover"
                />
              ) : (
                (user?.name.charAt(0).toUpperCase() ?? "U")
              )}
            </div>

            {!collapsed && (
              <div className="flex flex-1 items-center justify-between min-w-0">
                <div className="truncate pr-3">
                  <p className="text-xs font-semibold text-white truncate leading-tight">
                    {user?.name ?? "Loading profile..."}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate leading-tight mt-1">
                    {user?.email ?? ""}
                  </p>
                </div>
                <button
                  type="button"
                  title="Sign out"
                  aria-label="Sign out"
                  className="p-1.5 text-zinc-400 hover:text-white transition-colors shrink-0 mr-2"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Mobile Nav */}
      <motion.nav
        initial={{ y: 80, opacity: 0, x: "-50%" }}
        animate={{ y: 0, opacity: 1, x: "-50%" }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="fixed bottom-6 left-1/2 z-40 flex items-center justify-between gap-1 w-[calc(100%-1.75rem)] max-w-[360px] h-[52px] border border-white/10 bg-[#0d0d0d]/95 px-2 py-1 shadow-2xl backdrop-blur-2xl md:hidden select-none"
      >
        {navItems.map((item) => (
          <MobileNavItem
            key={item.label}
            item={item}
            isActive={isItemActive(item)}
            onClick={() => navigate(item.path)}
          />
        ))}
      </motion.nav>
    </>
  );
}
