"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useDashboardStore } from "@/store/dashboard";

interface Candle {
  t: number;  // open time
  o: number;  // open
  h: number;  // high
  l: number;  // low
  c: number;  // close
  v: number;  // volume
}

interface Props {
  symbol: string;
  timeframe?: string;
  color: string;
  height?: number;
}

const TF_REFRESH: Record<string, number> = {
  "1m": 30_000,
  "3m": 60_000,
  "15m": 120_000,
  "30m": 180_000,
  "1h": 300_000,
};

async function fetchCandles(symbol: string, interval: string, limit = 40): Promise<Candle[]> {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance ${res.status}`);
  const raw: number[][] = await res.json();
  return raw.map((k) => ({
    t: k[0],
    o: parseFloat(String(k[1])),
    h: parseFloat(String(k[2])),
    l: parseFloat(String(k[3])),
    c: parseFloat(String(k[4])),
    v: parseFloat(String(k[5])),
  }));
}

function drawCandles(
  canvas: HTMLCanvasElement,
  candles: Candle[],
  coinColor: string
) {
  if (!candles.length) return;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  if (!W || !H) return;

  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 8, bottom: 8, left: 2, right: 2 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const highs = candles.map((c) => c.h);
  const lows  = candles.map((c) => c.l);
  const maxP  = Math.max(...highs);
  const minP  = Math.min(...lows);
  const range = maxP - minP || 1;

  const toY = (p: number) => pad.top + (1 - (p - minP) / range) * innerH;

  const n = candles.length;
  const totalGap = innerW * 0.15;
  const candleW = (innerW - totalGap) / n;
  const gap = totalGap / (n - 1 || 1);
  const bodyMinH = 1;

  // Subtle grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 3; i++) {
    const y = pad.top + (i / 3) * innerH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
  }

  candles.forEach((c, i) => {
    const x = pad.left + i * (candleW + gap);
    const cx = x + candleW / 2;
    const isGreen = c.c >= c.o;

    const bullColor = coinColor;
    const bearColor = "#ff3366";
    const candleColor = isGreen ? bullColor : bearColor;

    const bodyTop    = toY(Math.max(c.o, c.c));
    const bodyBottom = toY(Math.min(c.o, c.c));
    const bodyH      = Math.max(bodyBottom - bodyTop, bodyMinH);

    // Wick shadow
    ctx.save();
    ctx.shadowColor = candleColor;
    ctx.shadowBlur = 2;

    // Upper wick
    ctx.strokeStyle = candleColor;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(cx, toY(c.h));
    ctx.lineTo(cx, bodyTop);
    ctx.stroke();

    // Lower wick
    ctx.beginPath();
    ctx.moveTo(cx, bodyBottom);
    ctx.lineTo(cx, toY(c.l));
    ctx.stroke();
    ctx.restore();

    // Candle body
    ctx.save();
    ctx.shadowColor = candleColor;
    ctx.shadowBlur = isGreen ? 4 : 3;

    if (isGreen) {
      // Gradient fill for bullish
      const grad = ctx.createLinearGradient(0, bodyTop, 0, bodyTop + bodyH);
      grad.addColorStop(0, candleColor + "ff");
      grad.addColorStop(1, candleColor + "99");
      ctx.fillStyle = grad;
    } else {
      const grad = ctx.createLinearGradient(0, bodyTop, 0, bodyTop + bodyH);
      grad.addColorStop(0, bearColor + "99");
      grad.addColorStop(1, bearColor + "ff");
      ctx.fillStyle = grad;
    }
    ctx.fillRect(x, bodyTop, candleW, bodyH);

    // Body border outline (thin)
    ctx.strokeStyle = candleColor;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.5;
    ctx.strokeRect(x, bodyTop, candleW, bodyH);
    ctx.restore();
  });

  // Highlight last candle price line
  const last = candles[candles.length - 1];
  const lastY = toY(last.c);
  const isLastGreen = last.c >= last.o;
  const lastColor = isLastGreen ? coinColor : "#ff3366";

  ctx.save();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = lastColor;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = 0.5;
  ctx.shadowColor = lastColor;
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.moveTo(pad.left, lastY);
  ctx.lineTo(W - pad.right, lastY);
  ctx.stroke();
  ctx.restore();

  // Price label at right edge
  ctx.save();
  ctx.font = `bold ${9 * Math.min(dpr, 2)}px 'JetBrains Mono', monospace`;
  ctx.fillStyle = lastColor;
  ctx.globalAlpha = 0.9;
  ctx.shadowColor = lastColor;
  ctx.shadowBlur = 6;
  // (label drawn via DOM overlay instead for crisp text)
  ctx.restore();
}

export function CandlestickChart({ symbol, timeframe = "1m", color, height = 120 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { config } = useDashboardStore();

  const tf = config.selectedTimeframes[0] ?? timeframe;

  const load = useCallback(async () => {
    try {
      const data = await fetchCandles(symbol, tf, 40);
      setCandles(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [symbol, tf]);

  // Initial load + polling
  useEffect(() => {
    load();
    const interval = TF_REFRESH[tf] ?? 60_000;
    timerRef.current = setInterval(load, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [load, tf]);

  // Draw whenever candles change or canvas resizes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candles.length) return;
    drawCandles(canvas, candles, color);

    // ResizeObserver to redraw on resize
    const ro = new ResizeObserver(() => drawCandles(canvas, candles, color));
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [candles, color]);

  // Stats from candles
  const last  = candles[candles.length - 1];
  const first = candles[0];
  const sessionChange = last && first
    ? ((last.c - first.o) / first.o) * 100
    : null;

  if (loading) {
    return (
      <div
        className="w-full flex items-center justify-center"
        style={{ height }}
      >
        <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
          Fetching candles…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height }}>
        <span className="text-[10px] font-mono text-text-muted opacity-50">Chart unavailable</span>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
      {/* Candle count + timeframe label */}
      <div className="absolute bottom-1 left-2 flex items-center gap-2 pointer-events-none">
        <span
          className="text-[9px] font-mono px-1.5 py-0.5 rounded"
          style={{ background: `${color}18`, color: `${color}cc`, border: `1px solid ${color}30` }}
        >
          {tf} · {candles.length}
        </span>
        {sessionChange != null && (
          <span className={`text-[9px] font-mono ${sessionChange >= 0 ? "text-green-400" : "text-red-400"}`}>
            {sessionChange >= 0 ? "▲" : "▼"} {Math.abs(sessionChange).toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
}
