"use client";
import { useDashboardStore } from "@/store/dashboard";
import { createApiClient } from "@/lib/api";
import { toast } from "sonner";
import { cn, formatSymbol } from "@/lib/utils";
import { Trash2, ToggleLeft, ToggleRight, Bell, BellOff, Send, MessageCircle } from "lucide-react";
import type { AlertRule } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  rsi_gt: "RSI >",
  rsi_lt: "RSI <",
  price_above: "Price >",
  price_below: "Price <",
};

const TYPE_COLORS: Record<string, string> = {
  rsi_gt: "text-orange-400",
  rsi_lt: "text-green-400",
  price_above: "text-accent-cyan",
  price_below: "text-accent-red",
};

export function AlertRuleList() {
  const { alertRules, config, setAlertRules } = useDashboardStore();
  const api = createApiClient(config.ngrokUrl);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAlertRule(id);
      setAlertRules(alertRules.filter((r) => r.id !== id));
      toast.success("Alert rule deleted");
    } catch {
      toast.error("Failed to delete rule");
    }
  };

  const handleToggle = async (rule: AlertRule, field: "enabled" | "notify_telegram" | "notify_whatsapp") => {
    const updated = { ...rule, [field]: !rule[field] };
    try {
      await api.updateAlertRule(rule.id, { [field]: updated[field] });
      setAlertRules(alertRules.map((r) => r.id === rule.id ? updated : r));
    } catch {
      toast.error("Failed to update rule");
    }
  };

  if (alertRules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-text-muted gap-3">
        <BellOff className="w-10 h-10 opacity-30" />
        <p className="text-sm">No alert rules yet. Click "New Alert" to create one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alertRules.map((rule) => (
        <div
          key={rule.id}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg border bg-bg-card transition-all",
            rule.enabled ? "border-border-default" : "border-border-subtle opacity-60"
          )}
        >
          {/* Enabled icon */}
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            rule.enabled ? "bg-accent-cyan/10" : "bg-bg-elevated"
          )}>
            {rule.enabled
              ? <Bell className="w-3.5 h-3.5 text-accent-cyan" />
              : <BellOff className="w-3.5 h-3.5 text-text-muted" />
            }
          </div>

          {/* Rule info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-semibold text-sm text-text-primary">
                {formatSymbol(rule.symbol)}
              </span>
              <span className={cn("font-mono text-xs", TYPE_COLORS[rule.type])}>
                {TYPE_LABELS[rule.type]}
              </span>
              <span className="font-mono text-sm font-bold text-text-primary">
                {rule.value.toLocaleString()}
              </span>
              {rule.timeframe && (
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted">
                  {rule.timeframe}
                </span>
              )}
            </div>

            {/* Notification channel pills */}
            <div className="flex items-center gap-2 mt-1.5">
              <button
                onClick={() => handleToggle(rule, "notify_telegram")}
                title="Toggle Telegram notification"
                className={cn(
                  "flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all",
                  rule.notify_telegram
                    ? "bg-[#229ED9]/15 border-[#229ED9]/40 text-[#229ED9]"
                    : "bg-bg-elevated border-border-subtle text-text-muted hover:border-[#229ED9]/30 hover:text-[#229ED9]/60"
                )}
              >
                <Send className="w-2.5 h-2.5" />
                TG
              </button>
              <button
                onClick={() => handleToggle(rule, "notify_whatsapp")}
                title="Toggle WhatsApp notification"
                className={cn(
                  "flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all",
                  rule.notify_whatsapp
                    ? "bg-[#25D366]/15 border-[#25D366]/40 text-[#25D366]"
                    : "bg-bg-elevated border-border-subtle text-text-muted hover:border-[#25D366]/30 hover:text-[#25D366]/60"
                )}
              >
                <MessageCircle className="w-2.5 h-2.5" />
                WA
              </button>
            </div>
          </div>

          {/* Enable/disable + delete */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleToggle(rule, "enabled")}
              className="text-text-muted hover:text-text-primary transition-colors"
              title={rule.enabled ? "Disable" : "Enable"}
            >
              {rule.enabled
                ? <ToggleRight className="w-5 h-5 text-accent-cyan" />
                : <ToggleLeft className="w-5 h-5" />
              }
            </button>
            <button
              onClick={() => handleDelete(rule.id)}
              className="text-text-muted hover:text-accent-red transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      <p className="text-[11px] text-text-muted px-1 pt-1">
        Click <span className="text-[#229ED9] font-mono">TG</span> /{" "}
        <span className="text-[#25D366] font-mono">WA</span> on each rule to enable that channel.
        Configure credentials in the <strong className="text-text-secondary">Notifications</strong> tab first.
      </p>
    </div>
  );
}
