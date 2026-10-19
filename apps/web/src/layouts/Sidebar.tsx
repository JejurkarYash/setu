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
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  mobileLabel: string;
  path: string;
  icon: LucideIcon;
};

// Global Workspace Navigation (when at /dashboard)
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

// Project Workspace Navigation (when at /dashboard/project/:projectId/...)
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
    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand text-background shadow-md shadow-brand/25">
      <svg
        aria-hidden="true"
        className="size-5"
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

// -------------------------------------------------------------
// Desktop Nav Button (Square when collapsed, Rectangular when open)
// -------------------------------------------------------------
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
      className={`relative flex items-center  ${
        collapsed ? "justify-center w-full" : "w-full"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.button
        type="button"
        aria-label={item.label}
        aria-current={isActive ? "page" : undefined}
        onClick={onClick}
        whileTap={{ scale: 0.94 }}
        className={`group relative flex items-center cursor-pointer select-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
          collapsed
            ? "size-10 aspect-square justify-center rounded-xl"
            : "h-11 w-full justify-start  px-3.5 gap-6"
        } ${isActive ? "text-white" : "text-[#8e8e8e] hover:text-white"}`}
      >
        {/* Active Pill (Pure White / Subtle Light Glass, No Brand Color) */}
        {isActive && (
          <motion.div
            layoutId="desktopActiveBackground"
            className="absolute inset-0 bg-white/10 border border-white/10 shadow-sm shadow-black/40"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}

        {/* Hover Highlight */}
        {!isActive && isHovered && (
          <motion.div
            layoutId="desktopHoverBackground"
            className="absolute inset-0  bg-white/[0.04]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          />
        )}

        {/* Icon (ALWAYS WHITE WHEN ACTIVE) */}
        <Icon
          className={`relative z-10 size-5 shrink-0 transition-colors duration-150 ${
            isActive ? "text-white" : "text-[#8e8e8e] group-hover:text-white"
          } ${
            collapsed 
            ? "" 
            :"justify-center left-2 "
          }`}
        />

        {/* Label (shown only when expanded) */}
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
              }`}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Floating Tooltip (shown on hover when collapsed) */}
      <AnimatePresence>
        {collapsed && isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -4, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 flex items-center"
          >
            <div className=" border p-2  border-border bg-[#181818] px-2.5 py-1 text-xs font-medium text-white shadow-xl shadow-black/70 backdrop-blur-md whitespace-nowrap">
              {item.label}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// -------------------------------------------------------------
// Mobile Bottom Floating Nav Item
// -------------------------------------------------------------
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
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
      className={`group relative flex flex-1 flex-col items-center justify-center h-full rounded-2xl cursor-pointer select-none transition-colors duration-150 focus-visible:outline-none ${
        isActive ? "text-white" : "text-[#7f7f7f] hover:text-[#b5b5b5]"
      }`}
    >
      {/* Active Pill Highlight */}
      {isActive && (
        <motion.div
          layoutId="mobileActiveIndicator"
          className="absolute inset-0 bg-white/10 border border-white/10 h-[70%] w-[70%] justify-center top-2 left-3   shadow-inner"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}

      {/* Icon */}
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

// -------------------------------------------------------------
// Main Sidebar Component
// -------------------------------------------------------------
export default function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const [brandHovered, setBrandHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Detect whether we are in a Project context
  // Matches: /dashboard/project/:projectId/...
  const projectPathMatch = location.pathname.match(
    /^\/dashboard\/project\/([^/]+)/
  );
  const isProjectContext = Boolean(projectPathMatch);
  const currentProjectId = projectPathMatch ? projectPathMatch[1] : null;

  // Determine which navigation list to render
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
      {/* ======================================================= */}
      {/* Desktop Sidebar (hidden on mobile, md:flex)             */}
      {/* ======================================================= */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ type: "spring", stiffness: 350, damping: 32 }}
        className={`fixed inset-y-0   left-0 z-30 hidden md:flex flex-col  border-r border-border bg-[#111111] select-none
          ${
            collapsed 
             ? "gap-2 "
             : ""
          }
          `}
      >
        {/* Header / Brand Area */}
        <div className="relative flex  h-16 items-center border-b border-border px-3.5">
          {collapsed ? (
            /* Collapsed Header: Hovering reveals PanelLeftOpen */
            <div className="flex w-full items-center justify-center">
              <button
                type="button"
                onClick={onToggle}
                onMouseEnter={() => setBrandHovered(true)}
                onMouseLeave={() => setBrandHovered(false)}
                aria-label="Expand sidebar"
                title="Expand sidebar"
                className="relative flex size-10 items-center justify-center  cursor-pointer transition-all duration-200 hover:bg-surface-elevated/80"
              >
                <AnimatePresence mode="wait">
                  {brandHovered ? (
                    <motion.div
                      key="panel-open"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.12 }}
                      className="flex items-center justify-center text-white"
                    >
                      <PanelLeftOpen className="size-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="brand-mark"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.12 }}
                    >
                      <BrandMark />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          ) : (
            /* Open Header: Brand on left, PanelLeftClose on right */
            <div className="flex w-full items-center justify-between">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate("/dashboard")}
              >
                <BrandMark />
                <span className="text-base font-semibold tracking-wide text-white whitespace-nowrap">
                  Setu
                </span>
              </div>

              <button
                type="button"
                onClick={onToggle}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                className="flex size-9 items-center justify-center  text-text-muted hover:bg-surface-elevated hover:text-white transition-colors cursor-pointer"
              >
                <PanelLeftClose className="size-5" />
              </button>
            </div>
          )}
        </div>

      

        {/* Primary Navigation List */}
        <nav
          aria-label="Primary navigation"
          className={`flex flex-1 flex-col pt-4 pb-4 ${
            collapsed ? "px-0 items-center" : "px-3.5"
          }`}
        >
          {/* Main items */}
          <div
            className={`flex flex-col gap-2 w-full ${
              collapsed ? "items-center" : ""
            }`}
          >
            {navItems.map((item) => (
              <DesktopNavButton
                key={item.label}
                item={item}
                collapsed={collapsed}
                isActive={isItemActive(item)}
                onClick={() => navigate(item.path)}
              />
            ))}
          </div>

          {/* Quick link to All Projects if inside a project at the bottom */}
          {isProjectContext && (
            <div
              className={`mt-auto pt-3 border-t border-border/60 flex flex-col w-full ${
                collapsed ? "items-center" : ""
              }`}
            >
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
      </motion.aside>

      {/* ======================================================= */}
      {/* Mobile Floating Pill Navigation                         */}
      {/* ======================================================= */}
      <motion.nav
        aria-label="Mobile navigation"
        initial={{ y: 80, opacity: 0, x: "-50%" }}
        animate={{ y: 0, opacity: 1, x: "-50%" }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="fixed bottom-6 left-1/2 z-40 flex items-center justify-between gap-1 w-[calc(100%-1.75rem)] max-w-[430px] h-[64px] rounded-sm  border border-white/10 bg-[#0d0d0d]/95 px-2.5 py-1.5 shadow-2xl shadow-black/90 backdrop-blur-2xl md:hidden select-none"
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
