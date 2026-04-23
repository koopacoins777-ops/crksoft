"use client";

type SessionPhase =
  | "idle"
  | "breathing"
  | "retention"
  | "recovery"
  | "round-complete"
  | "session-complete";

type BreathSubPhase = "inhale" | "exhale";

type Props = {
  phase: SessionPhase;
  breathSubPhase: BreathSubPhase;
  currentBreath: number;
  totalBreaths: number;
  currentRound: number;
  totalRounds: number;
};

const PHASE_LABELS: Record<string, string> = {
  inhale: "INHALE",
  exhale: "EXHALE",
  retention: "HOLD YOUR BREATH",
  recovery: "RECOVERY BREATH",
  "round-complete": "ROUND COMPLETE",
  "session-complete": "SESSION COMPLETE",
  idle: "READY",
};

const PHASE_COLORS: Record<string, string> = {
  inhale: "text-cyan-300",
  exhale: "text-blue-300",
  retention: "text-violet-300",
  recovery: "text-amber-300",
  "round-complete": "text-emerald-300",
  "session-complete": "text-emerald-300",
  idle: "text-slate-400",
};

export default function PhaseIndicator({
  phase,
  breathSubPhase,
  currentBreath,
  totalBreaths,
  currentRound,
  totalRounds,
}: Props) {
  const labelKey =
    phase === "breathing" ? breathSubPhase : phase;

  const label = PHASE_LABELS[labelKey] ?? "";
  const color = PHASE_COLORS[labelKey] ?? "text-white";

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Round dots */}
      <div className="flex gap-2">
        {Array.from({ length: totalRounds }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-all duration-500 ${
              i < currentRound - 1
                ? "bg-emerald-400 scale-100"
                : i === currentRound - 1
                ? "bg-cyan-400 scale-125"
                : "bg-white/20"
            }`}
          />
        ))}
      </div>

      {/* Round label */}
      <p className="text-sm font-medium text-white/50 tracking-widest uppercase">
        Round {currentRound} of {totalRounds}
      </p>

      {/* Phase label */}
      <h2
        className={`text-3xl font-bold tracking-widest uppercase transition-all duration-300 ${color}`}
      >
        {label}
      </h2>

      {/* Breath counter (only during breathing) */}
      {phase === "breathing" && (
        <p className="text-lg text-white/60">
          Breath{" "}
          <span className="text-white font-semibold">{currentBreath}</span>{" "}
          of {totalBreaths}
        </p>
      )}
    </div>
  );
}
