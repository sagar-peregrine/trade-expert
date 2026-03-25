"use client";
import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useDashboardStore } from "@/store/dashboard";
import type { WsMessage } from "@/types";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { config, updateMarket, setWsConnected, addAlertToHistory } = useDashboardStore();

  const connect = useCallback(() => {
    if (!config.ngrokUrl) return;

    const wsUrl = config.ngrokUrl
      .replace(/^https?/, (m) => (m === "https" ? "wss" : "ws"))
      .replace(/\/$/, "") + "/ws";

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        // Subscribe to selected symbols/timeframes
        ws.send(
          JSON.stringify({
            type: "subscribe",
            symbols: config.selectedSymbols,
            timeframes: config.selectedTimeframes,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);

          if (msg.type === "update") {
            updateMarket(msg.prices, msg.rsi);
          } else if (msg.type === "alert") {
            addAlertToHistory(msg.data);
            toast.warning(`🔔 ${msg.data.message}`, {
              duration: 8000,
              description: new Date(msg.data.timestamp * 1000).toLocaleTimeString(),
            });
          }
        } catch (e) {
          console.error("WS parse error:", e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        // Auto-reconnect after 3s
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        setWsConnected(false);
        ws.close();
      };
    } catch (e) {
      console.error("WebSocket connection failed:", e);
      setWsConnected(false);
    }
  }, [config.ngrokUrl, config.selectedSymbols, config.selectedTimeframes]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  const resubscribe = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "subscribe",
          symbols: config.selectedSymbols,
          timeframes: config.selectedTimeframes,
        })
      );
    }
  }, [config.selectedSymbols, config.selectedTimeframes]);

  return { resubscribe };
}
