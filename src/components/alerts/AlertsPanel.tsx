"use client";
import { useState } from "react";
import { useDashboardStore } from "@/store/dashboard";
import { AlertRuleForm } from "./AlertRuleForm";
import { AlertRuleList } from "./AlertRuleList";
import { AlertHistoryList } from "./AlertHistoryList";
import { Bell, Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "rules" | "history";

export function AlertsPanel() {
  const [tab, setTab] = useState<Tab>("rules");
  const [showForm, setShowForm] = useState(false);
  const { alertHistory, alertRules } = useDashboardStore();

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-accent-cyan" />
          <h2 className="font-display font-semibold text-lg">Alerts</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          New Alert
        </button>
      </div>

      {/* New alert form */}
      {showForm && (
        <AlertRuleForm onClose={() => setShowForm(false)} />
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-bg-elevated rounded-lg w-fit border border-border-subtle">
        {(["rules", "history"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
              tab === t
                ? "bg-bg-card text-text-primary shadow-sm border border-border-default"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            {t === "rules" ? <Bell className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            {t === "rules" ? `Rules (${alertRules.length})` : `History (${alertHistory.length})`}
          </button>
        ))}
      </div>

      {tab === "rules" ? <AlertRuleList /> : <AlertHistoryList />}
    </div>
  );
}
