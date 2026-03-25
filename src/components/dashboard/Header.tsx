"use client";
import { useDashboardStore } from "@/store/dashboard";
import { Activity, Radio } from "lucide-react";

export function Header() {
  const { wsConnected, market, config } = useDashboardStore();

  return (
    <header className="border-b border-border-subtle bg-bg-secondary/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 lg:px-6 h-14">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-accent-cyan" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-text-primary tracking-tight">
              CryptoSentinel
            </h1>
            <p className="text-xs text-text-muted font-mono hidden sm:block">
              Professional Trading Dashboard
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-4">
          {market.lastUpdated && (
            <span className="text-xs text-text-muted font-mono hidden md:block">
              Updated {new Date(market.lastUpdated).toLocaleTimeString()}
            </span>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono"
            style={{
              borderColor: wsConnected ? "rgba(0,255,157,0.3)" : "rgba(255,51,102,0.3)",
              background: wsConnected ? "rgba(0,255,157,0.05)" : "rgba(255,51,102,0.05)",
              color: wsConnected ? "#00ff9d" : "#ff3366",
            }}
          >
            <Radio className="w-3 h-3" />
            <span>{wsConnected ? "LIVE" : "OFFLINE"}</span>
          </div>
          <div className="text-xs text-text-muted hidden sm:block font-mono truncate max-w-[160px]">
            {config.ngrokUrl.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>
    </header>
  );
}
