"use client";
import { useDashboardStore } from "@/store/dashboard";
import { CryptoCard } from "./CryptoCard";
import { RsiSummaryBar } from "./RsiSummaryBar";
import { QuickAlertForm } from "../alerts/QuickAlertForm";
import { BarChart2, Layers } from "lucide-react";

export function CryptoGrid() {
  const { config } = useDashboardStore();
  const symbols = config.selectedSymbols;

  if (symbols.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-text-muted gap-3">
        <Layers className="w-12 h-12 opacity-30" />
        <p className="font-display">No symbols selected.</p>
        <p className="text-sm">Go to Settings → select cryptocurrencies to monitor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <RsiSummaryBar />

      <div className="flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-accent-cyan" />
        <h2 className="font-display font-semibold text-text-primary text-sm uppercase tracking-widest">
          Live Market
        </h2>
        <span className="text-xs font-mono text-text-muted ml-2">
          {symbols.length} pairs · {config.selectedTimeframes.join(", ")}
        </span>
      </div>

      {/* Max 3 columns, 1 on mobile, 2 on tablet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {symbols.map((symbol) => (
          <CryptoCard key={symbol} symbol={symbol} />
        ))}
      </div>

      <QuickAlertForm />
    </div>
  );
}
