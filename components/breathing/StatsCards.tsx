"use client";

import { useBreathingContext } from "@/lib/hooks";

function formatMs(ms: number): string {
  if (ms === 0) return "—";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem === 0 ? `${m}m` : `${m}m ${rem}s`;
}

export default function StatsCards() {
  const { streak, personalBestMs, totalSessions } = useBreathingContext();

  const stats = [
    {
      label: "Day Streak",
      value: streak > 0 ? `${streak}` : "0",
      unit: streak === 1 ? "day" : "days",
      icon: "🔥",
      highlight: streak > 0,
    },
    {
      label: "Best Hold",
      value: formatMs(personalBestMs),
      unit: personalBestMs > 0 ? "personal best" : "",
      icon: "⏱",
      highlight: personalBestMs > 0,
    },
    {
      label: "Sessions",
      value: `${totalSessions}`,
      unit: totalSessions === 1 ? "session" : "sessions",
      icon: "🌊",
      highlight: totalSessions > 0,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-2xl border p-4 text-center transition-all duration-300 ${
            stat.highlight
              ? "border-cyan-800/50 bg-cyan-950/30"
              : "border-white/5 bg-white/5"
          }`}
        >
          <div className="text-2xl">{stat.icon}</div>
          <div
            className={`mt-1 text-3xl font-bold tabular-nums ${
              stat.highlight ? "text-white" : "text-white/30"
            }`}
          >
            {stat.value}
          </div>
          <div className="mt-0.5 text-xs font-medium uppercase tracking-wider text-white/40">
            {stat.label}
          </div>
          {stat.unit && (
            <div className="text-xs text-white/25">{stat.unit}</div>
          )}
        </div>
      ))}
    </div>
  );
}
