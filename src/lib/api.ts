import type { AlertRule } from "@/types";

export function createApiClient(baseUrl: string) {
  const base = baseUrl.replace(/\/$/, "");

  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${base}${path}`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
    return res.json();
  }

  async function post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error((err as { detail?: string }).detail ?? `POST ${path} → ${res.status}`);
    }
    return res.json();
  }

  async function del<T>(path: string): Promise<T> {
    const res = await fetch(`${base}${path}`, {
      method: "DELETE",
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    if (!res.ok) throw new Error(`DELETE ${path} → ${res.status}`);
    return res.json();
  }

  async function patch<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${base}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PATCH ${path} → ${res.status}`);
    return res.json();
  }

  return {
    health: () => get("/health"),
    getPrices: () => get<{ prices: Record<string, number> }>("/prices/"),
    getAllRsi: () => get<Record<string, Record<string, { value: number; status: string; timestamp: number }>>>("/rsi/"),
    getAlertRules: () => get<{ rules: AlertRule[] }>("/alerts/rules"),
    addAlertRule: (rule: Omit<AlertRule, "id">) => post<{ rule: AlertRule }>("/alerts/rules", rule),
    deleteAlertRule: (id: string) => del(`/alerts/rules/${id}`),
    updateAlertRule: (id: string, fields: Partial<AlertRule>) => patch(`/alerts/rules/${id}`, fields),
    getAlertHistory: () => get<{ alerts: unknown[]; total: number }>("/alerts/history"),
    clearAlertHistory: () => del("/alerts/history"),
    getAvailableSymbols: () => get<{ symbols: string[]; popular: string[] }>("/config/symbols"),
    updateWatched: (symbols: string[], timeframes: string[]) => post("/config/watched", { symbols, timeframes }),
    // Notifications
    getNotificationConfig: () => get<{
      telegram: { bot_token: string; chat_id: string; enabled: boolean; configured: boolean };
      whatsapp: { account_sid: string; auth_token: string; from_number: string; to_number: string; enabled: boolean; configured: boolean };
    }>("/notifications/config"),
    setTelegramConfig: (bot_token: string, chat_id: string, enabled: boolean) =>
      post("/notifications/config/telegram", { bot_token, chat_id, enabled }),
    setWhatsAppConfig: (account_sid: string, auth_token: string, from_number: string, to_number: string, enabled: boolean) =>
      post("/notifications/config/whatsapp", { account_sid, auth_token, from_number, to_number, enabled }),
    toggleTelegram: (enabled: boolean) => patch("/notifications/config/telegram/toggle", { enabled }),
    toggleWhatsApp: (enabled: boolean) => patch("/notifications/config/whatsapp/toggle", { enabled }),
    testTelegram: () => post("/notifications/test/telegram", {}),
    testWhatsApp: () => post("/notifications/test/whatsapp", {}),
  };
}
