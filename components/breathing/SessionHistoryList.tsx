"use client";

import { useBreathingContext } from "@/lib/hooks";

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem === 0 ? `${m}m` : `${m}m ${rem}s`;
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function SessionHistoryList() {
  const { sessions } = useBreathingContext();

  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/5 py-12 text-center">
        <p className="text-3xl">🌬</p>
        <p className="mt-3 font-medium text-white/40">No sessions yet</p>
        <p className="text-sm text-white/25">
          Complete your first session to see your history
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium uppercase tracking-widest text-white/40">
        Recent Sessions
      </h3>
      <div className="rounded-2xl border border-white/5 bg-white/5 overflow-hidden">
        {sessions.slice(0, 10).map((session, i) => (
          <div
            key={session.id}
            className={`flex items-center justify-between px-4 py-3 ${
              i !== 0 ? "border-t border-white/5" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-lg">🌊</div>
              <div>
                <p className="text-sm font-medium text-white">
                  {formatDate(session.completedAt)}
                </p>
                <p className="text-xs text-white/40">
                  {session.roundsCompleted}/{session.totalRounds} rounds ·{" "}
                  {session.breathCount} breaths
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-cyan-400">
                {formatMs(session.maxRetentionMs)}
              </p>
              <p className="text-xs text-white/30">best hold</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
