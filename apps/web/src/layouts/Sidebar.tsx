import type { SVGProps } from "react";

type IconName =
  | "overview"
  | "projects"
  | "api-keys"
  | "logs"
  | "alerts"
  | "settings"
  | "chevron"
  | "search";

type NavigationItem = {
  label: string;
  icon: Exclude<IconName, "chevron">;
};

const primaryNavigation: NavigationItem[] = [
  { label: "Overview", icon: "overview" },
  { label: "Projects", icon: "projects" },
  { label: "API Keys", icon: "api-keys" },
  { label: "Request Logs", icon: "logs" },
  { label: "Alerts", icon: "alerts" },
];

const settingsNavigation: NavigationItem = {
  label: "Settings",
  icon: "settings",
};

const iconPaths: Record<IconName, string> = {
  overview: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",
  projects: "M3 7.5h7l1.5 2H21v9H3v-11Zm0-3h6l1.5 2H21v2H10l-1.5-2H3v-2Z",
  "api-keys":
    "m14.5 9.5 5-5a2.12 2.12 0 1 1 3 3l-5 5M16 8l-5.5 5.5M10.5 13.5 8 16H5v3H2v-3l6.5-6.5M15 5l4 4",
  logs: "M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 5h6M9 12h6m-6 4h4",
  alerts: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4",
  settings:
    "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0-12v2m0 13v2m8.49-8.5h-2m-13 0h-2m15.02-6.02-1.42 1.42M7.91 16.09l-1.42 1.42m11.02 0-1.42-1.42M7.91 7.91 6.49 6.49",
  chevron: "m9 18 6-6-6-6",
  search: "m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z",
};

function Icon({
  name,
  ...props
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

function BrandMark() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-background">
      <svg
        aria-hidden="true"
        className="size-5"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M6 6.5 12 3l6 3.5v7L12 17l-6-3.5v-7Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="m9 12 3 1.75L15 12" stroke="currentColor" strokeWidth="2" />
      </svg>
    </span>
  );
}

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  activeItem: string;
  onNavigate: (label: string) => void;
};

function NavigationButton({
  item,
  collapsed,
  activeItem,
  onNavigate,
  mobile = false,
}: SidebarProps & { item: NavigationItem; mobile?: boolean }) {
  const isActive = activeItem === item.label;

  return (
    <button
      type="button"
      title={collapsed ? item.label : undefined}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
      onClick={() => onNavigate(item.label)}
      className={`group flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
        mobile ? "min-w-0 flex-1 flex-col gap-0.5 px-1 text-[10px]" : ""
      } ${collapsed ? "justify-center" : "justify-start"} ${
        isActive
          ? "bg-surface-elevated text-text-primary shadow-sm"
          : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
      }`}
    >
      <Icon
        name={item.icon}
        className={`size-[18px] shrink-0 transition-colors ${
          isActive
            ? "text-text-primary"
            : "text-text-muted group-hover:text-text-secondary"
        }`}
      />
      <span className={`truncate ${collapsed ? "sr-only" : ""}`}>
        {item.label}
      </span>
    </button>
  );
}

export default function Sidebar({
  collapsed,
  onToggle,
  activeItem,
  onNavigate,
}: SidebarProps) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-background transition-[width] duration-200 motion-reduce:transition-none md:flex ${
          collapsed ? "w-[68px]" : "w-60"
        }`}
      >
        <div className="group/brand relative flex h-16 items-center border-b border-border px-4">
          <div
            className={`flex items-center ${collapsed ? "w-full justify-center" : "gap-3"}`}
          >
            <BrandMark />
            <span
              className={`text-sm font-semibold tracking-wide ${collapsed ? "sr-only" : ""}`}
            >
              Setu
            </span>
          </div>
          {/* Toggle button */}
          <button
            type="button"
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggle}
            className={`group/toggle absolute flex size-8 items-center justify-center rounded-md text-text-muted transition-all duration-150 cursor-pointer hover:bg-surface-elevated hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
              collapsed
                ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 focus-visible:opacity-100 group-hover/brand:opacity-100"
                : "right-3 top-1/2 -translate-y-1/2"
            }`}
          >
            <Icon
              name="chevron"
              className={`size-4 transition-transform duration-200 motion-reduce:transition-none ${
                collapsed ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Primary navigation"
          className="flex flex-1 flex-col px-2 py-3"
        >
          <div className="space-y-0.5">
            {primaryNavigation.map((item) => (
              <NavigationButton
                key={item.label}
                item={item}
                collapsed={collapsed}
                activeItem={activeItem}
                onNavigate={onNavigate}
                onToggle={onToggle}
              />
            ))}
          </div>
          <div className="mt-auto space-y-0.5">
            <NavigationButton
              item={settingsNavigation}
              collapsed={collapsed}
              activeItem={activeItem}
              onNavigate={onNavigate}
              onToggle={onToggle}
            />
          </div>
        </nav>
      </aside>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-3 bottom-3 z-30 flex rounded-2xl border border-border bg-surface/95 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-2xl shadow-black/30 backdrop-blur-md md:hidden"
      >
        {primaryNavigation.map((item) => (
          <NavigationButton
            key={item.label}
            item={item}
            collapsed={false}
            activeItem={activeItem}
            onNavigate={onNavigate}
            onToggle={onToggle}
            mobile
          />
        ))}
      </nav>
    </>
  );
}
