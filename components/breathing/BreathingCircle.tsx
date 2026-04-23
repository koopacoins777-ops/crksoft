"use client";

type BreathPhase = "inhale" | "exhale" | "retention" | "recovery" | "idle";

type Props = {
  phase: BreathPhase;
  scale: number; // 0.0 – 1.0 (mapped internally to visual scale range)
};

const PHASE_COLORS: Record<BreathPhase, { from: string; to: string; glow: string }> = {
  inhale: {
    from: "from-cyan-400",
    to: "to-blue-600",
    glow: "rgba(34, 211, 238, 0.5)",
  },
  exhale: {
    from: "from-blue-500",
    to: "to-indigo-700",
    glow: "rgba(99, 102, 241, 0.3)",
  },
  retention: {
    from: "from-indigo-500",
    to: "to-violet-700",
    glow: "rgba(99, 102, 241, 0.4)",
  },
  recovery: {
    from: "from-amber-400",
    to: "to-orange-500",
    glow: "rgba(251, 191, 36, 0.5)",
  },
  idle: {
    from: "from-slate-500",
    to: "to-slate-700",
    glow: "rgba(100, 116, 139, 0.3)",
  },
};

export default function BreathingCircle({ phase, scale }: Props) {
  // Map 0–1 progress to visual scale range 0.55–1.35
  const visualScale = 0.55 + scale * 0.8;

  const colors = PHASE_COLORS[phase];

  const glowSize = phase === "inhale" ? 80 : phase === "retention" ? 60 : phase === "recovery" ? 90 : 40;
  const glowOpacity = phase === "idle" ? 0.2 : scale * 0.6 + 0.2;

  const retentionAnimation = phase === "retention" ? "animate-retention-pulse" : "";
  const recoveryAnimation = phase === "recovery" ? "animate-recovery-glow" : "";
  const glowAnimation = retentionAnimation || recoveryAnimation;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 320, height: 320 }}>
      {/* Outer ambient glow */}
      <div
        className={`absolute rounded-full ${glowAnimation}`}
        style={{
          width: 320,
          height: 320,
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          opacity: glowOpacity,
          transform: `scale(${visualScale * 1.3})`,
          transition: "transform 100ms linear, opacity 200ms ease",
          pointerEvents: "none",
        }}
      />

      {/* Mid ring */}
      <div
        className="absolute rounded-full border border-white/10"
        style={{
          width: 280,
          height: 280,
          transform: `scale(${visualScale * 1.1})`,
          transition: "transform 100ms linear",
          pointerEvents: "none",
        }}
      />

      {/* Main circle */}
      <div
        className={`rounded-full bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center`}
        style={{
          width: 256,
          height: 256,
          transform: `scale(${visualScale})`,
          transition: "transform 100ms linear, box-shadow 400ms ease",
          boxShadow: `0 0 ${glowSize}px ${colors.glow}`,
        }}
      />
    </div>
  );
}
