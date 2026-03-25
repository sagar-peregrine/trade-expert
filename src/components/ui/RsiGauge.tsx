"use client";
import { getRsiStatus, getRsiColor } from "@/lib/utils";

interface Props {
  value: number;
  size?: number;
  color?: string;
}

export function RsiGauge({ value, size = 64, color }: Props) {
  const status = getRsiStatus(value);
  const radius = 24;
  const circumference = Math.PI * radius; // half-circle
  const pct = value / 100;
  const offset = circumference * (1 - pct);

  const gaugeColor =
    value >= 70 ? "#ff3366" :
    value >= 60 ? "#ffd700" :
    value <= 30 ? "#00ff9d" :
    value <= 40 ? "#00d4ff" :
    color ?? "#00d4ff";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size / 2 + 12 }}>
      <svg
        width={size}
        height={size / 2 + 8}
        viewBox="0 0 56 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Track */}
        <path
          d="M 4 28 A 24 24 0 0 1 52 28"
          stroke="#1e1e30"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Fill */}
        <path
          d="M 4 28 A 24 24 0 0 1 52 28"
          stroke={gaugeColor}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
        />
        {/* Center value */}
        <text
          x="28"
          y="26"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fontFamily="'JetBrains Mono', monospace"
          fill={gaugeColor}
        >
          {value.toFixed(0)}
        </text>
      </svg>
    </div>
  );
}
