"use client";

import { useBreathingContext } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { toast } from "sonner";
import BreathingCircle from "./BreathingCircle";
import PhaseIndicator from "./PhaseIndicator";
import RetentionTimer from "./RetentionTimer";
import SafetyModal from "./SafetyModal";
import SessionSetup from "./SessionSetup";

// ─── Timing constants ──────────────────────────────────────────────────────────
const INHALE_MS = 2000;
const EXHALE_MS = 2500;
const RECOVERY_HOLD_S = 15;

// ─── State machine ─────────────────────────────────────────────────────────────
type SessionPhase =
  | "safety"
  | "setup"
  | "breathing"
  | "retention"
  | "recovery"
  | "round-complete"
  | "session-complete";

type BreathSubPhase = "inhale" | "exhale";

type State = {
  phase: SessionPhase;
  breathSubPhase: BreathSubPhase;
  currentRound: number;
  currentBreath: number;
  retentionTimes: number[];
  recoverySecondsLeft: number;
};

type Action =
  | { type: "SHOW_SETUP" }
  | { type: "START_BREATHING"; totalRounds: number }
  | { type: "SET_BREATH_SUBPHASE"; sub: BreathSubPhase }
  | { type: "INCREMENT_BREATH" }
  | { type: "ENTER_RETENTION" }
  | { type: "RELEASE_HOLD"; retentionMs: number }
  | { type: "TICK_RECOVERY" }
  | { type: "NEXT_ROUND" }
  | { type: "SESSION_COMPLETE" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SHOW_SETUP":
      return { ...state, phase: "setup" };
    case "START_BREATHING":
      return {
        ...state,
        phase: "breathing",
        breathSubPhase: "inhale",
        currentRound: state.currentRound === 0 ? 1 : state.currentRound,
        currentBreath: 1,
      };
    case "SET_BREATH_SUBPHASE":
      return { ...state, breathSubPhase: action.sub };
    case "INCREMENT_BREATH":
      return { ...state, currentBreath: state.currentBreath + 1 };
    case "ENTER_RETENTION":
      return { ...state, phase: "retention" };
    case "RELEASE_HOLD":
      return {
        ...state,
        phase: "recovery",
        retentionTimes: [...state.retentionTimes, action.retentionMs],
        recoverySecondsLeft: RECOVERY_HOLD_S,
      };
    case "TICK_RECOVERY":
      return {
        ...state,
        recoverySecondsLeft: Math.max(0, state.recoverySecondsLeft - 1),
      };
    case "NEXT_ROUND":
      return {
        ...state,
        phase: "breathing",
        breathSubPhase: "inhale",
        currentRound: state.currentRound + 1,
        currentBreath: 1,
      };
    case "SESSION_COMPLETE":
      return { ...state, phase: "session-complete" };
    default:
      return state;
  }
}

const initialState: State = {
  phase: "safety",
  breathSubPhase: "inhale",
  currentRound: 0,
  currentBreath: 1,
  retentionTimes: [],
  recoverySecondsLeft: RECOVERY_HOLD_S,
};

// ─── Component ─────────────────────────────────────────────────────────────────
export default function SessionController() {
  const router = useRouter();
  const { settings, personalBestMs, handleSaveSession } = useBreathingContext();

  const [state, dispatch] = useReducer(reducer, initialState);
  const [circleScale, setCircleScale] = useState(0.2);
  const [retentionElapsedMs, setRetentionElapsedMs] = useState(0);
  const [saving, setSaving] = useState(false);

  const rafRef = useRef<number | null>(null);
  const breathPhaseStartRef = useRef<number>(0);
  const breathSubPhaseRef = useRef<BreathSubPhase>("inhale");
  const retentionStartRef = useRef<number | null>(null);
  const retentionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recoveryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathCountRef = useRef(1);
  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Breath cycle animation (rAF) ─────────────────────────────────────────────
  const startBreathCycle = useCallback((totalBreaths: number) => {
    breathPhaseStartRef.current = performance.now();
    breathSubPhaseRef.current = "inhale";
    breathCountRef.current = stateRef.current.currentBreath;

    dispatch({ type: "SET_BREATH_SUBPHASE", sub: "inhale" });

    const tick = (now: number) => {
      const elapsed = now - breathPhaseStartRef.current;
      const sub = breathSubPhaseRef.current;

      if (sub === "inhale") {
        const progress = Math.min(elapsed / INHALE_MS, 1);
        setCircleScale(progress); // 0 → 1 mapped to visual range in circle component
        if (progress >= 1) {
          breathPhaseStartRef.current = now;
          breathSubPhaseRef.current = "exhale";
          dispatch({ type: "SET_BREATH_SUBPHASE", sub: "exhale" });
        }
      } else {
        const progress = Math.min(elapsed / EXHALE_MS, 1);
        setCircleScale(1 - progress); // 1 → 0
        if (progress >= 1) {
          // Exhale complete → count breath
          const newCount = breathCountRef.current + 1;
          breathCountRef.current = newCount;

          if (newCount > totalBreaths) {
            // All breaths done → enter retention
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            setCircleScale(0);
            dispatch({ type: "ENTER_RETENTION" });
            return;
          }

          dispatch({ type: "INCREMENT_BREATH" });
          breathPhaseStartRef.current = now;
          breathSubPhaseRef.current = "inhale";
          dispatch({ type: "SET_BREATH_SUBPHASE", sub: "inhale" });
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // ── Retention phase ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase === "retention") {
      retentionStartRef.current = Date.now();
      setRetentionElapsedMs(0);

      retentionIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - (retentionStartRef.current ?? Date.now());
        setRetentionElapsedMs(elapsed);
      }, 100);
    } else {
      if (retentionIntervalRef.current) {
        clearInterval(retentionIntervalRef.current);
        retentionIntervalRef.current = null;
      }
    }
  }, [state.phase]);

  // ── Recovery phase countdown ──────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase === "recovery") {
      setCircleScale(1);
      recoveryIntervalRef.current = setInterval(() => {
        dispatch({ type: "TICK_RECOVERY" });
      }, 1000);
    } else {
      if (recoveryIntervalRef.current) {
        clearInterval(recoveryIntervalRef.current);
        recoveryIntervalRef.current = null;
      }
    }
  }, [state.phase]);

  // Auto-advance from recovery when countdown hits 0
  useEffect(() => {
    if (state.phase === "recovery" && state.recoverySecondsLeft === 0) {
      if (state.currentRound >= settings.roundCount) {
        dispatch({ type: "SESSION_COMPLETE" });
      } else {
        dispatch({ type: "NEXT_ROUND" });
      }
    }
  }, [state.phase, state.recoverySecondsLeft, state.currentRound, settings.roundCount]);

  // ── Start breathing when phase transitions to "breathing" ────────────────────
  useEffect(() => {
    if (state.phase === "breathing") {
      setCircleScale(0);
      startBreathCycle(settings.breathCount);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state.phase, state.currentRound, settings.breathCount, startBreathCycle]);

  // ── Session complete → save ───────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase === "session-complete") {
      const maxRetentionMs = state.retentionTimes.length
        ? Math.max(...state.retentionTimes)
        : 0;

      setSaving(true);
      handleSaveSession({
        roundsCompleted: state.currentRound,
        breathCount: settings.breathCount,
        totalRounds: settings.roundCount,
        maxRetentionMs,
        retentionTimes: state.retentionTimes,
      }).then(() => {
        setSaving(false);
        toast.success("Session saved!", { description: "Great work!" });
        router.push("/app/breathing");
      });
    }
  }, [state.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (retentionIntervalRef.current) clearInterval(retentionIntervalRef.current);
      if (recoveryIntervalRef.current) clearInterval(recoveryIntervalRef.current);
    };
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleReleaseHold = () => {
    const elapsed = retentionStartRef.current
      ? Date.now() - retentionStartRef.current
      : 0;
    dispatch({ type: "RELEASE_HOLD", retentionMs: elapsed });
  };

  const handleExit = () => {
    router.push("/app/breathing");
  };

  // ── Derive circle props ───────────────────────────────────────────────────────
  const circlePhase =
    state.phase === "breathing"
      ? state.breathSubPhase
      : state.phase === "retention"
      ? "retention"
      : state.phase === "recovery"
      ? "recovery"
      : "idle";

  // ── Safety & setup screens ────────────────────────────────────────────────────
  if (state.phase === "safety") {
    return (
      <SafetyModal
        onAcknowledge={() => dispatch({ type: "SHOW_SETUP" })}
        onCancel={handleExit}
      />
    );
  }

  if (state.phase === "setup") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <SessionSetup
          onStart={() =>
            dispatch({ type: "START_BREATHING", totalRounds: settings.roundCount })
          }
        />
      </div>
    );
  }

  // ── Session complete ──────────────────────────────────────────────────────────
  if (state.phase === "session-complete") {
    const maxRetentionMs = state.retentionTimes.length
      ? Math.max(...state.retentionTimes)
      : 0;
    const formatMs = (ms: number) => {
      const s = Math.floor(ms / 1000);
      return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
    };

    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 text-center animate-fade-in-up">
          <div className="text-6xl">🎉</div>
          <h2 className="text-4xl font-bold text-white">Session Complete!</h2>
          <div className="space-y-1">
            <p className="text-white/60">
              {state.currentRound} rounds · {settings.breathCount} breaths each
            </p>
            {maxRetentionMs > 0 && (
              <p className="text-2xl font-bold text-cyan-400">
                Best hold: {formatMs(maxRetentionMs)}
              </p>
            )}
          </div>
          {saving && (
            <p className="text-sm text-white/40 animate-pulse">Saving session…</p>
          )}
        </div>
      </div>
    );
  }

  // ── Active session ────────────────────────────────────────────────────────────
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between px-6 py-8">
      {/* Exit button */}
      <div className="flex w-full justify-end">
        <button
          onClick={handleExit}
          className="text-sm text-white/30 transition-colors hover:text-white/60"
        >
          End Session
        </button>
      </div>

      {/* Phase indicator */}
      <div className="flex flex-col items-center gap-3">
        <PhaseIndicator
          phase={state.phase}
          breathSubPhase={state.breathSubPhase}
          currentBreath={state.currentBreath}
          totalBreaths={settings.breathCount}
          currentRound={state.currentRound}
          totalRounds={settings.roundCount}
        />
      </div>

      {/* Breathing circle */}
      <div className="flex flex-col items-center gap-6">
        <BreathingCircle phase={circlePhase} scale={circleScale} />

        {/* Retention timer */}
        {state.phase === "retention" && (
          <RetentionTimer
            elapsedMs={retentionElapsedMs}
            personalBestMs={personalBestMs}
          />
        )}

        {/* Recovery countdown */}
        {state.phase === "recovery" && (
          <div className="flex flex-col items-center gap-1">
            <div className="font-mono text-6xl font-bold text-amber-400 tabular-nums">
              {state.recoverySecondsLeft}
            </div>
            <p className="text-sm text-white/50">Hold your breath</p>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="w-full max-w-sm">
        {state.phase === "retention" && (
          <button
            onClick={handleReleaseHold}
            className="w-full rounded-2xl bg-violet-600/80 py-4 text-lg font-bold text-white backdrop-blur transition-all hover:bg-violet-500"
          >
            Breathe
          </button>
        )}
        {state.phase === "breathing" && (
          <p className="text-center text-sm text-white/20">
            Breathe deeply and let the rhythm guide you
          </p>
        )}
        {state.phase === "recovery" && (
          <p className="text-center text-sm text-white/20">
            Take a full deep breath and hold it
          </p>
        )}
      </div>
    </div>
  );
}
