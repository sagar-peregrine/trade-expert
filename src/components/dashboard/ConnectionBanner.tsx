"use client";
import { useState } from "react";
import { useDashboardStore } from "@/store/dashboard";
import { AlertTriangle, X, ExternalLink } from "lucide-react";

export function ConnectionBanner() {
  const { wsConnected, setActiveTab } = useDashboardStore();
  const [dismissed, setDismissed] = useState(false);

  if (wsConnected || dismissed) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center gap-3 text-sm animate-slide-in">
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
      <span className="text-amber-300 flex-1">
        Backend not connected. Start FastAPI + ngrok, then update the URL in{" "}
        <button
          onClick={() => setActiveTab("settings")}
          className="underline hover:text-amber-200"
        >
          Settings
        </button>.
      </span>
      <a
        href="https://ngrok.com/download"
        target="_blank"
        rel="noopener noreferrer"
        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-xs"
      >
        ngrok docs <ExternalLink className="w-3 h-3" />
      </a>
      <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-amber-200">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
