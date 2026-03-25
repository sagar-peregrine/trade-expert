"use client";
import { useDashboardStore } from "@/store/dashboard";
import { LayoutDashboard, Bell, Settings, TrendingUp, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "alerts",    label: "Alerts",    icon: Bell },
  { id: "notifications", label: "Notifications", icon: BellRing },
  { id: "settings",  label: "Settings",  icon: Settings },
];

export function Sidebar() {
  const { activeTab, setActiveTab, alertHistory } = useDashboardStore();
  const unread = alertHistory.filter(
    (a) => Date.now() - a.timestamp * 1000 < 60000
  ).length;

  return (
    <aside className="w-14 lg:w-52 border-r border-border-subtle bg-bg-secondary/50 flex flex-col py-4 gap-1 shrink-0">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={cn(
            "flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
            activeTab === id
              ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
          )}
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium hidden lg:block">{label}</span>
          {id === "alerts" && unread > 0 && (
            <span className="absolute right-2 top-1 w-4 h-4 rounded-full bg-accent-red text-white text-[9px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      ))}

      <div className="mt-auto mx-2 px-3 py-3 rounded-lg bg-bg-elevated border border-border-subtle hidden lg:block">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-3 h-3 text-accent-cyan" />
          <span className="text-xs font-mono text-accent-cyan">BINANCE</span>
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed">
          Data powered by Binance API. RSI calculated with 14-period Wilder smoothing.
        </p>
      </div>
    </aside>
  );
}
