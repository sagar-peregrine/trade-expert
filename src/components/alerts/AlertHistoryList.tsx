"use client";
import { useDashboardStore } from "@/store/dashboard";
import { createApiClient } from "@/lib/api";
import { toast } from "sonner";
import { formatSymbol, timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Trash2, AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  rsi_gt: <TrendingUp className="w-3.5 h-3.5" />,
  rsi_lt: <TrendingDown className="w-3.5 h-3.5" />,
  price_above: <TrendingUp className="w-3.5 h-3.5" />,
  price_below: <TrendingDown className="w-3.5 h-3.5" />,
};

const TYPE_COLORS: Record<string, string> = {
  rsi_gt: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  rsi_lt: "text-green-400 bg-green-400/10 border-green-400/20",
  price_above: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  price_below: "text-red-400 bg-red-400/10 border-red-400/20",
};

export function AlertHistoryList() {
  const { alertHistory, clearHistory, config } = useDashboardStore();
  const api = createApiClient(config.ngrokUrl);

  const handleClear = async () => {
    try {
      await api.clearAlertHistory();
    } catch { /* local clear is fine */ }
    clearHistory();
    toast.success("Alert history cleared");
  };

  if (alertHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-text-muted gap-3">
        <Activity className="w-10 h-10 opacity-30" />
        <p className="text-sm">No alerts triggered yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-red transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear history
        </button>
      </div>

      <div className="space-y-2">
        {alertHistory.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-border-subtle bg-bg-card animate-fade-in"
          >
            <div className={cn(
              "w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5",
              TYPE_COLORS[alert.type] ?? "text-text-muted bg-bg-elevated border-border-subtle"
            )}>
              {TYPE_ICONS[alert.type] ?? <AlertTriangle className="w-3.5 h-3.5" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary leading-snug">{alert.message}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-mono text-text-muted">
                  {timeAgo(alert.timestamp)}
                </span>
                <span className="text-xs font-mono text-text-muted">
                  {new Date(alert.timestamp * 1000).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
