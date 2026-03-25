"use client";
import { useState } from "react";
import { useDashboardStore } from "@/store/dashboard";
import { POPULAR_SYMBOLS, TIMEFRAMES } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Settings, Check, Save, RefreshCw, Link2 } from "lucide-react";
import type { Timeframe } from "@/types";
import { createApiClient } from "@/lib/api";
import { toast } from "sonner";

export function SettingsPanel() {
  const { config, setNgrokUrl, setSelectedSymbols, setSelectedTimeframes } = useDashboardStore();
  const [urlInput, setUrlInput] = useState(config.ngrokUrl);
  const [testingConn, setTestingConn] = useState(false);

  const toggleSymbol = (sym: string) => {
    if (config.selectedSymbols.includes(sym)) {
      setSelectedSymbols(config.selectedSymbols.filter((s) => s !== sym));
    } else {
      setSelectedSymbols([...config.selectedSymbols, sym]);
    }
  };

  const toggleTf = (tf: Timeframe) => {
    if (config.selectedTimeframes.includes(tf)) {
      setSelectedTimeframes(config.selectedTimeframes.filter((t) => t !== tf));
    } else {
      setSelectedTimeframes([...config.selectedTimeframes, tf]);
    }
  };

  const saveUrl = () => {
    setNgrokUrl(urlInput);
    toast.success("ngrok URL saved. Reconnecting…");
  };

  const testConnection = async () => {
    setTestingConn(true);
    try {
      const api = createApiClient(urlInput);
      await api.health();
      toast.success("✅ Backend connected successfully!");
    } catch {
      toast.error("❌ Could not reach backend. Check URL and ngrok.");
    } finally {
      setTestingConn(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5 text-accent-cyan" />
        <h2 className="font-display font-semibold text-lg">Settings</h2>
      </div>

      {/* ngrok URL */}
      <section className="bg-bg-card rounded-xl border border-border-default p-5 space-y-4">
        <h3 className="font-display font-medium text-sm text-text-secondary uppercase tracking-wider flex items-center gap-2">
          <Link2 className="w-3.5 h-3.5" /> Backend Connection
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://xxxx.ngrok.io"
            className="flex-1 bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-cyan/50 transition-colors"
          />
          <button
            onClick={testConnection}
            disabled={testingConn}
            className="px-3 py-2 rounded-lg bg-bg-elevated border border-border-default text-text-secondary hover:text-text-primary hover:border-border-bright transition-all text-sm"
          >
            {testingConn ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Test"}
          </button>
          <button
            onClick={saveUrl}
            className="px-3 py-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20 transition-all text-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
        <p className="text-xs text-text-muted">
          Run: <code className="bg-bg-elevated px-1.5 py-0.5 rounded font-mono text-accent-cyan">ngrok http 8000</code> and paste the HTTPS URL above.
        </p>
      </section>

      {/* Symbols */}
      <section className="bg-bg-card rounded-xl border border-border-default p-5 space-y-4">
        <h3 className="font-display font-medium text-sm text-text-secondary uppercase tracking-wider">
          Cryptocurrencies ({config.selectedSymbols.length} selected)
        </h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SYMBOLS.map((sym) => {
            const selected = config.selectedSymbols.includes(sym);
            return (
              <button
                key={sym}
                onClick={() => toggleSymbol(sym)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-mono border transition-all",
                  selected
                    ? "bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan"
                    : "bg-bg-elevated border-border-default text-text-secondary hover:border-border-bright hover:text-text-primary"
                )}
              >
                {selected && <Check className="w-3 h-3 inline mr-1" />}
                {sym.replace("USDT", "")}
              </button>
            );
          })}
        </div>
      </section>

      {/* Timeframes */}
      <section className="bg-bg-card rounded-xl border border-border-default p-5 space-y-4">
        <h3 className="font-display font-medium text-sm text-text-secondary uppercase tracking-wider">
          Timeframes
        </h3>
        <div className="flex gap-2">
          {TIMEFRAMES.map((tf) => {
            const selected = config.selectedTimeframes.includes(tf);
            return (
              <button
                key={tf}
                onClick={() => toggleTf(tf)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-mono border transition-all",
                  selected
                    ? "bg-accent-cyan/10 border-accent-cyan/40 text-accent-cyan"
                    : "bg-bg-elevated border-border-default text-text-secondary hover:border-border-bright"
                )}
              >
                {tf}
              </button>
            );
          })}
        </div>
      </section>

      {/* Info */}
      <section className="bg-bg-elevated rounded-xl border border-border-subtle p-4">
        <p className="text-xs text-text-muted leading-relaxed">
          <strong className="text-text-secondary">RSI Calculation:</strong> Uses 14-period Wilder's Exponential Moving Average on Binance OHLCV data.
          Same algorithm as TradingView. Updates every 5 seconds.
          <br /><br />
          <strong className="text-text-secondary">Alerts:</strong> Configure RSI overbought/oversold and support/resistance price alerts in the Alerts tab.
          Alerts fire with a 60-second cooldown to prevent spam.
        </p>
      </section>
    </div>
  );
}
