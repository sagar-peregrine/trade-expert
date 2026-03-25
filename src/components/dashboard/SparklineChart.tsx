"use client";
import { useEffect, useRef } from "react";

interface Props {
  prices: number[];
  color: string;
  width?: number;
  height?: number;
  showArea?: boolean;
}

export function SparklineChart({ prices, color, width = 300, height = 64, showArea = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prices.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth || width;
    const H = canvas.offsetHeight || height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const pad = { top: 6, bottom: 6, left: 2, right: 2 };
    const innerW = W - pad.left - pad.right;
    const innerH = H - pad.top - pad.bottom;

    // Map price → canvas coords
    const toX = (i: number) => pad.left + (i / (prices.length - 1)) * innerW;
    const toY = (p: number) => pad.top + (1 - (p - min) / range) * innerH;

    // Determine trend colour
    const isUp = prices[prices.length - 1] >= prices[0];
    const lineColor = isUp ? color : "#ff3366";
    const glowColor = isUp ? color : "#ff3366";

    // Build path
    ctx.beginPath();
    prices.forEach((p, i) => {
      if (i === 0) ctx.moveTo(toX(i), toY(p));
      else {
        // smooth bezier
        const cx = (toX(i - 1) + toX(i)) / 2;
        ctx.bezierCurveTo(cx, toY(prices[i - 1]), cx, toY(p), toX(i), toY(p));
      }
    });

    // Glow effect
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 6;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Fill gradient area
    if (showArea) {
      const fillPath = new Path2D();
      prices.forEach((p, i) => {
        if (i === 0) fillPath.moveTo(toX(i), toY(p));
        else {
          const cx = (toX(i - 1) + toX(i)) / 2;
          fillPath.bezierCurveTo(cx, toY(prices[i - 1]), cx, toY(p), toX(i), toY(p));
        }
      });
      fillPath.lineTo(toX(prices.length - 1), H);
      fillPath.lineTo(toX(0), H);
      fillPath.closePath();

      const grad = ctx.createLinearGradient(0, pad.top, 0, H);
      const hex = lineColor.replace("#", "");
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      grad.addColorStop(0, `rgba(${r},${g},${b},0.18)`);
      grad.addColorStop(0.6, `rgba(${r},${g},${b},0.06)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.fill(fillPath);
    }

    // Dot at last price
    const lastX = toX(prices.length - 1);
    const lastY = toY(prices[prices.length - 1]);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8;
    ctx.fill();

  }, [prices, color, width, height, showArea]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: `${height}px`, display: "block" }}
    />
  );
}
