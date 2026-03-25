import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RSIStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return price.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 8 });
}

export function formatSymbol(symbol: string): string {
  return symbol.replace("USDT", "");
}

export function getRsiColor(status: RSIStatus): string {
  switch (status) {
    case "EXTREMELY_OVERBOUGHT": return "text-red-400";
    case "OVERBOUGHT": return "text-orange-400";
    case "SLIGHTLY_OVERBOUGHT": return "text-yellow-400";
    case "NEUTRAL": return "text-cyan-400";
    case "SLIGHTLY_OVERSOLD": return "text-blue-400";
    case "OVERSOLD": return "text-green-400";
    case "EXTREMELY_OVERSOLD": return "text-emerald-300";
    default: return "text-text-secondary";
  }
}

export function getRsiBgColor(status: RSIStatus): string {
  switch (status) {
    case "EXTREMELY_OVERBOUGHT": return "bg-red-500/10 border-red-500/30";
    case "OVERBOUGHT": return "bg-orange-500/10 border-orange-500/30";
    case "SLIGHTLY_OVERBOUGHT": return "bg-yellow-500/10 border-yellow-500/30";
    case "NEUTRAL": return "bg-cyan-500/10 border-cyan-500/30";
    case "SLIGHTLY_OVERSOLD": return "bg-blue-500/10 border-blue-500/30";
    case "OVERSOLD": return "bg-green-500/10 border-green-500/30";
    case "EXTREMELY_OVERSOLD": return "bg-emerald-500/10 border-emerald-500/30";
    default: return "bg-border-subtle border-border-default";
  }
}

export function getRsiLabel(status: RSIStatus): string {
  switch (status) {
    case "EXTREMELY_OVERBOUGHT": return "Extremely OB";
    case "OVERBOUGHT": return "Overbought";
    case "SLIGHTLY_OVERBOUGHT": return "Slightly OB";
    case "NEUTRAL": return "Neutral";
    case "SLIGHTLY_OVERSOLD": return "Slightly OS";
    case "OVERSOLD": return "Oversold";
    case "EXTREMELY_OVERSOLD": return "Extremely OS";
    default: return "Unknown";
  }
}

export function getRsiStatus(value: number): RSIStatus {
  if (value >= 80) return "EXTREMELY_OVERBOUGHT";
  if (value >= 70) return "OVERBOUGHT";
  if (value >= 60) return "SLIGHTLY_OVERBOUGHT";
  if (value <= 20) return "EXTREMELY_OVERSOLD";
  if (value <= 30) return "OVERSOLD";
  if (value <= 40) return "SLIGHTLY_OVERSOLD";
  return "NEUTRAL";
}

export function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp * 1000;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

export const POPULAR_SYMBOLS = [
  "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT",
  "ADAUSDT", "DOGEUSDT", "AVAXUSDT", "DOTUSDT", "MATICUSDT",
  "LINKUSDT", "UNIUSDT", "LTCUSDT", "ATOMUSDT", "NEARUSDT",
  "APTUSDT", "ARBUSDT", "OPUSDT", "INJUSDT", "SUIUSDT",
];

export const TIMEFRAMES = ["1m", "3m", "15m", "30m", "1h"] as const;
