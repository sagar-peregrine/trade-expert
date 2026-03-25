"use client";
import { useState } from "react";
import { useDashboardStore } from "@/store/dashboard";
import { createApiClient } from "@/lib/api";
import { toast } from "sonner";
import { POPULAR_SYMBOLS, TIMEFRAMES } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AlertType, Timeframe } from "@/types";
import { X, Loader2 } from "lucide-react";

const ALERT_TYPES: { value: AlertType; label: string; desc: string }[] = [
  { value: "rsi_gt", label: "RSI >", desc: "Trigger when RSI goes above threshold" },
  { value: "rsi_lt", label: "RSI <", desc: "Trigger when RSI drops below threshold" },
  { value: "price_above", label: "Price >", desc: "Trigger when price crosses above resistance" },
  { value: "price_below", label: "Price <", desc: "Trigger when price crosses below support" },
];

interface Props {
  onClose: () => void;
}

export function AlertRuleForm({ onClose }: Props) {
  const { config, setAlertRules } = useDashboardStore();
  const [form, setForm] = useState({
    symbol: config.selectedSymbols[0] ?? "BTCUSDT",
    type: "rsi_gt" as AlertType,
    value: "",
    timeframe: "1h" as Timeframe,
    enabled: true,
  });
  const [loading, setLoading] = useState(false);

  const api = createApiClient(config.ngrokUrl);

  const handleSubmit = async () => {
    if (!form.value) return toast.error("Enter a threshold value");
    setLoading(true);
    try {
      const res = await api.addAlertRule({
        symbol: form.symbol,
        type: form.type,
        value: parseFloat(form.value),
        timeframe: form.timeframe,
        enabled: form.enabled,
      });
      // Refresh rules
      const rulesData = await api.getAlertRules();
      setAlertRules(rulesData.rules);
      toast.success(`Alert created for ${form.symbol}`);
      onClose();
    } catch (e) {
      toast.error("Failed to create alert. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  const isRsiType = form.type === "rsi_gt" || form.type === "rsi_lt";

  return (
    <div className="bg-bg-card border border-border-default rounded-xl p-5 space-y-4 animate-slide-in">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm text-text-primary">New Alert Rule</h3>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Symbol */}
        <div className="space-y-1.5">
          <label className="text-xs text-text-muted font-mono">Symbol</label>
          <select
            value={form.symbol}
            onChange={(e) => setForm({ ...form, symbol: e.target.value })}
            className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-accent-cyan/50"
          >
            {POPULAR_SYMBOLS.map((s) => (
              <option key={s} value={s}>{s.replace("USDT", "")}</option>
            ))}
          </select>
        </div>

        {/* Alert type */}
        <div className="space-y-1.5">
          <label className="text-xs text-text-muted font-mono">Alert Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as AlertType })}
            className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-accent-cyan/50"
          >
            {ALERT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Timeframe (only for RSI) */}
        {isRsiType && (
          <div className="space-y-1.5">
            <label className="text-xs text-text-muted font-mono">Timeframe</label>
            <div className="flex gap-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setForm({ ...form, timeframe: tf })}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-mono border transition-all",
                    form.timeframe === tf
                      ? "bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan"
                      : "bg-bg-primary border-border-default text-text-muted hover:text-text-primary"
                  )}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Threshold value */}
        <div className="space-y-1.5">
          <label className="text-xs text-text-muted font-mono">
            {isRsiType ? "RSI Threshold (0–100)" : "Price (USDT)"}
          </label>
          <input
            type="number"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            placeholder={isRsiType ? "e.g. 70" : "e.g. 50000"}
            className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-cyan/50"
          />
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-text-muted bg-bg-elevated px-3 py-2 rounded-lg">
        {ALERT_TYPES.find((t) => t.value === form.type)?.desc}
        {isRsiType && ` for ${form.symbol} on the ${form.timeframe} chart.`}
      </p>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-accent-cyan text-bg-primary font-semibold text-sm hover:bg-accent-cyan/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Create Alert
      </button>
    </div>
  );
}
