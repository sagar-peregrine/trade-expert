export interface CryptoPrice {
  symbol: string;
  price: number;
  change24h?: number;
  changePercent24h?: number;
}

export interface RSIData {
  value: number;
  status: RSIStatus;
  timestamp: number;
}

export type RSIStatus =
  | "EXTREMELY_OVERBOUGHT"
  | "OVERBOUGHT"
  | "SLIGHTLY_OVERBOUGHT"
  | "NEUTRAL"
  | "SLIGHTLY_OVERSOLD"
  | "OVERSOLD"
  | "EXTREMELY_OVERSOLD"
  | "UNKNOWN";

export type AlertType = "rsi_gt" | "rsi_lt" | "price_above" | "price_below";

export interface AlertRule {
  id: string;
  symbol: string;
  type: AlertType;
  value: number;
  timeframe?: string;
  enabled: boolean;
  notify_telegram?: boolean;
  notify_whatsapp?: boolean;
}

export interface TriggeredAlert {
  id: string;
  rule_id: string;
  symbol: string;
  type: AlertType;
  message: string;
  timestamp: number;
  extra: Record<string, number>;
}

export interface WsUpdateMessage {
  type: "update";
  prices: Record<string, number>;
  rsi: Record<string, { value: number; timestamp: number }>;
  timestamp: number;
}

export interface WsAlertMessage {
  type: "alert";
  data: TriggeredAlert;
}

export type WsMessage = WsUpdateMessage | WsAlertMessage;

export type Timeframe = "1m" | "3m" | "15m" | "30m" | "1h";

export interface DashboardConfig {
  ngrokUrl: string;
  selectedSymbols: string[];
  selectedTimeframes: Timeframe[];
}
