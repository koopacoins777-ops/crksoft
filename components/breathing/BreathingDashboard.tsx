"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import StatsCards from "./StatsCards";
import SessionHistoryList from "./SessionHistoryList";

export default function BreathingDashboard() {
  return (
    <div className="mx-auto max-w-xl space-y-8 py-4 animate-fade-in-up">
      {/* Hero */}
      <div className="text-center">
        <div className="mb-4 text-5xl">🌬</div>
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Wim Hof Method
        </h1>
        <p className="mt-2 text-lg text-white/50">
          Breathe. Hold. Thrive.
        </p>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* CTA */}
      <Link href="/app/breathing/session">
        <Button className="h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 text-lg font-bold text-white shadow-xl shadow-cyan-900/40 hover:from-cyan-500 hover:to-blue-600 transition-all duration-200">
          Start Session
        </Button>
      </Link>

      {/* Method overview */}
      <div className="rounded-2xl border border-white/5 bg-white/5 p-5 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40">
          The Method
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { step: "1", label: "Power Breaths", desc: "Deep rhythmic breathing" },
            { step: "2", label: "Breath Retention", desc: "Hold after exhale" },
            { step: "3", label: "Recovery", desc: "Deep inhale, hold 15s" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-cyan-900/50 text-sm font-bold text-cyan-400">
                {item.step}
              </div>
              <p className="text-xs font-semibold text-white/70">{item.label}</p>
              <p className="text-xs text-white/30">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <SessionHistoryList />
    </div>
  );
}
