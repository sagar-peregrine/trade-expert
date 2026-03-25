import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AlertRule, TriggeredAlert, Timeframe, DashboardConfig } from "@/types";

const SPARKLINE_MAX = 60; // keep last 60 price points per symbol

interface MarketData {
  prices: Record<string, number>;
  rsi: Record<string, { value: number; timestamp: number }>;
  lastUpdated: number | null;
  // Rolling price history for sparklines: symbol → prices[]
  priceHistory: Record<string, number[]>;
}

interface DashboardStore {
  config: DashboardConfig;
  setNgrokUrl: (url: string) => void;
  setSelectedSymbols: (symbols: string[]) => void;
  setSelectedTimeframes: (tfs: Timeframe[]) => void;

  market: MarketData;
  updateMarket: (
    prices: Record<string, number>,
    rsi: Record<string, { value: number; timestamp: number }>
  ) => void;

  alertRules: AlertRule[];
  alertHistory: TriggeredAlert[];
  setAlertRules: (rules: AlertRule[]) => void;
  addAlertToHistory: (alert: TriggeredAlert) => void;
  clearHistory: () => void;

  wsConnected: boolean;
  setWsConnected: (v: boolean) => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      config: {
        ngrokUrl: "http://localhost:8000",
        selectedSymbols: ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
        selectedTimeframes: ["1m", "15m", "1h"],
      },
      setNgrokUrl: (url) =>
        set((s) => ({ config: { ...s.config, ngrokUrl: url.replace(/\/$/, "") } })),
      setSelectedSymbols: (symbols) =>
        set((s) => ({ config: { ...s.config, selectedSymbols: symbols } })),
      setSelectedTimeframes: (tfs) =>
        set((s) => ({ config: { ...s.config, selectedTimeframes: tfs } })),

      market: { prices: {}, rsi: {}, lastUpdated: null, priceHistory: {} },
      updateMarket: (prices, rsi) =>
        set((s) => {
          // Append new prices to history buffers
          const priceHistory = { ...s.market.priceHistory };
          for (const [sym, price] of Object.entries(prices)) {
            const prev = priceHistory[sym] ?? [];
            priceHistory[sym] = [...prev, price].slice(-SPARKLINE_MAX);
          }
          return {
            market: {
              prices,
              rsi,
              lastUpdated: Date.now(),
              priceHistory,
            },
          };
        }),

      alertRules: [],
      alertHistory: [],
      setAlertRules: (rules) => set({ alertRules: rules }),
      addAlertToHistory: (alert) =>
        set((s) => ({ alertHistory: [alert, ...s.alertHistory].slice(0, 100) })),
      clearHistory: () => set({ alertHistory: [] }),

      wsConnected: false,
      setWsConnected: (v) => set({ wsConnected: v }),

      activeTab: "dashboard",
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "crypto-dashboard-storage",
      partialize: (s) => ({
        config: s.config,
        alertRules: s.alertRules,
        alertHistory: s.alertHistory,
      }),
    }
  )
);
