"use client";
import { useState } from "react";
import { useDashboardStore } from "@/store/dashboard";
import { createApiClient } from "@/lib/api";
import { toast } from "sonner";
import { POPULAR_SYMBOLS } from "@/lib/utils";
import { Shield, TrendingUp, TrendingDown, Plus } from "lucide-react";

export function QuickAlertForm() {
  const { config, setAlertRules } = useDashboardStore();
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState(config.selectedSymbols[0] ?? "BTCUSDT");
  const [support, setSupport] = useState("");
  const [resistance, setResistance] = useState("");
  const [rsiOB, setRsiOB] = useState("70");
  const [rsiOS, setRsiOS] = useState("30");
  const [tf, setTf] = useState("1h");
  const [loading, setLoading] = useState(false);

  const api = createApiClient(config.ngrokUrl);

  const handleCreate = async () => {
    const rules = [];
    if (support) rules.push({ symbol, type: "price_below" as const, value: parseFloat(support), timeframe: tf, enabled: true });
    if (resistance) rules.push({ symbol, type: "price_above" as const, value: parseFloat(resistance), timeframe: tf, enabled: true });
    if (rsiOB) rules.push({ symbol, type: "rsi_gt" as const, value: parseFloat(rsiOB), timeframe: tf, enabled: true });
    if (rsiOS) rules.push({ symbol, type: "rsi_lt" as const, value: parseFloat(rsiOS), timeframe: tf, enabled: true });

    if (!rules.length) return toast.error("Fill in at least one value");

    setLoading(true);
    try {
      for (const r of rules) await api.addAlertRule(r);
      const data = await api.getAlertRules();
      setAlertRules(data.rules);
      toast.success(`${rules.length} alert(s) created for ${symbol.replace("USDT", "")}`);
      setOpen(false);
      setSupport(""); setResistance(""); setRsiOB("70"); setRsiOS("30");
    } catch {
      toast.error("Failed to create alerts. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-border-subtle rounded-xl bg-bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg-elevated/50 rounded-xl transition-all"
      >
        <Shield className="w-4 h-4 text-accent-cyan" />
        <span className="font-display font-medium text-sm">Quick S/R + RSI Alerts</span>
        <Plus className={`w-4 h-4 text-text-muted ml-auto transition-transform ${open ? "rotate-45" : ""}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-border-subtle pt-4 animate-slide-in">
          {/* Symbol + Timeframe */}
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs text-text-muted font-mono">Symbol</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-accent-cyan/50"
              >
                {(config.selectedSymbols.length ? config.selectedSymbols : POPULAR_SYMBOLS.slice(0, 5)).map((s) => (
                  <option key={s} value={s}>{s.replace("USDT", "")}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-text-muted font-mono">Timeframe</label>
              <select
                value={tf}
                onChange={(e) => setTf(e.target.value)}
                className="bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-accent-cyan/50"
              >
                {["1m","3m","15m","30m","1h"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Support */}
            <div className="space-y-1">
              <label className="text-xs text-green-400 font-mono flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Support Level
              </label>
              <input
                type="number"
                value={support}
                onChange={(e) => setSupport(e.target.value)}
                placeholder="e.g. 40000"
                className="w-full bg-bg-elevated border border-green-500/20 rounded-lg px-3 py-2 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-green-500/50"
              />
            </div>
            {/* Resistance */}
            <div className="space-y-1">
              <label className="text-xs text-red-400 font-mono flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Resistance Level
              </label>
              <input
                type="number"
                value={resistance}
                onChange={(e) => setResistance(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full bg-bg-elevated border border-red-500/20 rounded-lg px-3 py-2 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-red-500/50"
              />
            </div>
            {/* RSI OB */}
            <div className="space-y-1">
              <label className="text-xs text-orange-400 font-mono">RSI Overbought (&gt;)</label>
              <input
                type="number"
                value={rsiOB}
                onChange={(e) => setRsiOB(e.target.value)}
                min="0" max="100"
                className="w-full bg-bg-elevated border border-orange-500/20 rounded-lg px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-orange-500/50"
              />
            </div>
            {/* RSI OS */}
            <div className="space-y-1">
              <label className="text-xs text-cyan-400 font-mono">RSI Oversold (&lt;)</label>
              <input
                type="number"
                value={rsiOS}
                onChange={(e) => setRsiOS(e.target.value)}
                min="0" max="100"
                className="w-full bg-bg-elevated border border-cyan-500/20 rounded-lg px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-accent-cyan text-bg-primary font-semibold text-sm hover:bg-accent-cyan/90 transition-all disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create Alerts"}
          </button>
        </div>
      )}
    </div>
  );
}
