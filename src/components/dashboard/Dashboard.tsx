"use client";
import { useDashboardStore } from "@/store/dashboard";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useApi } from "@/hooks/useApi";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { CryptoGrid } from "./CryptoGrid";
import { AlertsPanel } from "../alerts/AlertsPanel";
import { SettingsPanel } from "./SettingsPanel";
import { NotificationsPanel } from "./NotificationsPanel";
import { ConnectionBanner } from "./ConnectionBanner";
import { BellRing } from "lucide-react";

export function Dashboard() {
  const { activeTab } = useDashboardStore();
  useWebSocket();
  useApi();

  return (
    <div className="min-h-screen bg-bg-primary grid-bg flex flex-col">
      <ConnectionBanner />
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeTab === "dashboard"      && <CryptoGrid />}
          {activeTab === "alerts"         && <AlertsPanel />}
          {activeTab === "notifications"  && (
            <div className="max-w-2xl space-y-6 animate-fade-in">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 text-accent-cyan" />
                <h2 className="font-display font-semibold text-lg">Notifications</h2>
              </div>
              <NotificationsPanel />
            </div>
          )}
          {activeTab === "settings"       && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}
