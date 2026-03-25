"use client";
import { useEffect, useCallback, useRef } from "react";
import { useDashboardStore } from "@/store/dashboard";
import { createApiClient } from "@/lib/api";

export function useApi() {
  const { config, setAlertRules } = useDashboardStore();
  const clientRef = useRef(createApiClient(config.ngrokUrl));

  // Update client when ngrok URL changes
  useEffect(() => {
    clientRef.current = createApiClient(config.ngrokUrl);
  }, [config.ngrokUrl]);

  const loadAlertRules = useCallback(async () => {
    try {
      const data = await clientRef.current.getAlertRules();
      setAlertRules(data.rules);
    } catch (e) {
      console.warn("Failed to load alert rules:", e);
    }
  }, [setAlertRules]);

  const syncWatchedSymbols = useCallback(async () => {
    try {
      await clientRef.current.updateWatched(
        config.selectedSymbols,
        config.selectedTimeframes
      );
    } catch (e) {
      console.warn("Failed to sync watched symbols:", e);
    }
  }, [config.selectedSymbols, config.selectedTimeframes]);

  useEffect(() => {
    loadAlertRules();
    syncWatchedSymbols();
  }, [loadAlertRules, syncWatchedSymbols]);

  return { api: clientRef.current, loadAlertRules };
}
