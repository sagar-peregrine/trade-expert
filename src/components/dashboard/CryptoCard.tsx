"use client";
import { useEffect, useRef, useState } from "react";
import { useDashboardStore } from "@/store/dashboard";
import { RsiGauge } from "../ui/RsiGauge";
import { CandlestickChart } from "./CandlestickChart";
import {
  cn, formatPrice, formatSymbol,
  getRsiColor, getRsiLabel, getRsiStatus, getRsiBgColor,
} from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props { symbol: string }

const COIN_COLORS: Record<string, string> = {
  BTC: "#f7931a", ETH: "#627eea", BNB: "#f3ba2f", SOL: "#9945ff",
  XRP: "#00aae4", ADA: "#6ab0ff", DOGE: "#c2a633", AVAX: "#e84142",
  DOT: "#e6007a", MATIC: "#8247e5", LINK: "#375bd2", UNI: "#ff007a",
  LTC: "#b0b0b0", ATOM: "#6f7390", NEAR: "#00c08b", APT: "#36d1dc",
  ARB: "#28a0f0", OP: "#ff0420", INJ: "#00b3ff", SUI: "#4da2ff",
};

function getCoinColor(symbol: string) {
  return COIN_COLORS[formatSymbol(symbol)] ?? "#00d4ff";
}

export function CryptoCard({ symbol }: Props) {
  const { market, config } = useDashboardStore();
  const price = market.prices[symbol];
  const priceHistory = market.priceHistory?.[symbol] ?? [];
  const prevPriceRef = useRef<number | null>(null);
  const [flashClass, setFlashClass] = useState("");
  const coinColor = getCoinColor(symbol);
  const base = formatSymbol(symbol);
  const timeframes = config.selectedTimeframes;
  const primaryTf = timeframes[0] ?? "1m";

  // % change vs first price in ws buffer
  const firstPrice = priceHistory.length > 1 ? priceHistory[0] : null;
  const priceDelta = firstPrice && price ? ((price - firstPrice) / firstPrice) * 100 : null;
  const isUp = priceDelta == null ? null : priceDelta >= 0;

  // Flash on every tick
  useEffect(() => {
    if (price == null || prevPriceRef.current == null) {
      prevPriceRef.current = price ?? null;
      return;
    }
    setFlashClass(price > prevPriceRef.current ? "flash-green" : price < prevPriceRef.current ? "flash-red" : "");
    prevPriceRef.current = price;
    const t = setTimeout(() => setFlashClass(""), 700);
    return () => clearTimeout(t);
  }, [price]);

  const rsiValues = timeframes.map((tf) => {
    const data = market.rsi[`${symbol}_${tf}`];
    return { tf, value: data?.value ?? null };
  });
  const primaryRsi = rsiValues[0];
  const rsiStatus = primaryRsi?.value != null ? getRsiStatus(primaryRsi.value) : "UNKNOWN";

  return (
    <div className={cn(
      "relative rounded-xl border bg-bg-card overflow-hidden transition-all duration-300",
      "border-border-default hover:border-opacity-80 hover:shadow-xl"
    )}>
      {/* Coin colour accent bar */}
      <div className="h-[2px] w-full" style={{
        background: `linear-gradient(90deg, ${coinColor}dd 0%, ${coinColor}44 50%, transparent 100%)`
      }} />

      <div className="p-4 pb-3">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold font-mono shrink-0"
              style={{ background: `${coinColor}20`, color: coinColor, border: `1px solid ${coinColor}40` }}
            >
              {base.slice(0, 3)}
            </div>
            <div>
              <p className="font-display font-bold text-sm text-text-primary leading-none">{base}</p>
              <p className="text-[10px] text-text-muted font-mono mt-0.5">{symbol}</p>
            </div>
          </div>

          {primaryRsi?.value != null && (
            <span className={cn(
              "text-[10px] font-mono px-2 py-0.5 rounded-full border",
              getRsiBgColor(rsiStatus), getRsiColor(rsiStatus)
            )}>
              {getRsiLabel(rsiStatus)}
            </span>
          )}
        </div>

        {/* ── Price ─────────────────────────────────────────── */}
        <div className="mb-3">
          <p className={cn("font-mono font-bold text-[22px] text-text-primary tracking-tight leading-none", flashClass)}>
            {price != null ? `$${formatPrice(price)}` : "—"}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-text-muted font-mono">USDT</span>
            {priceDelta != null && (
              <span className={cn(
                "flex items-center gap-0.5 text-[11px] font-mono font-semibold",
                isUp ? "text-green-400" : "text-red-400"
              )}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isUp ? "+" : ""}{priceDelta.toFixed(3)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Candlestick Chart ─────────────────────────────── */}
      <div className="px-2 pb-2">
        <CandlestickChart
          symbol={symbol}
          timeframe={primaryTf}
          color={coinColor}
          height={110}
        />
      </div>

      {/* ── RSI Footer ────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-t border-border-subtle/40 bg-bg-secondary/30">
        {primaryRsi?.value != null ? (
          <RsiGauge value={primaryRsi.value} size={52} color={coinColor} />
        ) : (
          <div className="w-12 h-7 flex items-center justify-center">
            <span className="text-[9px] text-text-muted font-mono animate-pulse">RSI…</span>
          </div>
        )}
        <div className="flex-1 grid grid-cols-3 gap-1">
          {rsiValues.slice(0, 3).map(({ tf, value }) => (
            <div key={tf} className="flex flex-col items-center py-0.5 rounded bg-bg-elevated/60">
              <span className="text-[9px] text-text-muted font-mono leading-none mb-0.5">{tf}</span>
              <span className={cn(
                "text-[11px] font-mono font-bold leading-none",
                value != null ? getRsiColor(getRsiStatus(value)) : "text-text-muted"
              )}>
                {value != null ? value.toFixed(0) : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
