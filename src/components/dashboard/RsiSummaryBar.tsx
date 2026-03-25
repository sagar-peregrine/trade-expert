"use client";
import { useDashboardStore } from "@/store/dashboard";
import { getRsiStatus, getRsiColor, formatSymbol } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function RsiSummaryBar() {
  const { config, market } = useDashboardStore();
  const primaryTf = config.selectedTimeframes[0] ?? "1h";

  const items = config.selectedSymbols
    .map((symbol) => {
      const key = `${symbol}_${primaryTf}`;
      const rsiData = market.rsi[key];
      return { symbol, rsi: rsiData?.value ?? null };
    })
    .filter((item) => item.rsi !== null);

  if (items.length === 0) return null;

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
      <span className="text-[10px] font-mono text-text-muted shrink-0 mr-2">
        RSI/{primaryTf}:
      </span>
      {items.map(({ symbol, rsi }) => {
        const status = getRsiStatus(rsi!);
        const color = getRsiColor(status);
        return (
          <div
            key={symbol}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-mono shrink-0",
              rsi! >= 70 ? "bg-red-500/10 border-red-500/20" :
              rsi! <= 30 ? "bg-green-500/10 border-green-500/20" :
              "bg-bg-elevated border-border-subtle"
            )}
          >
            <span className="text-text-secondary">{formatSymbol(symbol)}</span>
            <span className={color}>{rsi!.toFixed(0)}</span>
          </div>
        );
      })}
    </div>
  );
}
