"use client";

import { saveBreathingSession, updateBreathingSettings } from "@/actions/breathing-actions";
import { BreathingData, BreathingSessionResult } from "@/lib/types";
import { BreathingSession, BreathingSettings } from "@prisma/client";
import { createContext, useOptimistic, useState } from "react";
import { toast } from "sonner";

type TBreathingContext = {
  sessions: BreathingSession[];
  settings: { breathCount: 30 | 35 | 40; roundCount: 2 | 3 | 4 };
  personalBestMs: number;
  streak: number;
  totalSessions: number;
  handleSaveSession: (result: BreathingSessionResult) => Promise<void>;
  handleUpdateSettings: (settings: {
    breathCount: 30 | 35 | 40;
    roundCount: 2 | 3 | 4;
  }) => Promise<void>;
};

export const BreathingContext = createContext<TBreathingContext | null>(null);

function computeStreak(sessions: BreathingSession[]): number {
  if (sessions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sessionDays = new Set(
    sessions.map((s) => {
      const d = new Date(s.completedAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  let streak = 0;
  const current = new Date(today);

  while (true) {
    if (sessionDays.has(current.getTime())) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export default function BreathingContextProvider({
  data,
  children,
}: {
  data: BreathingData;
  children: React.ReactNode;
}) {
  const defaultSettings: { breathCount: 30 | 35 | 40; roundCount: 2 | 3 | 4 } =
    {
      breathCount: (data.settings?.breathCount as 30 | 35 | 40) ?? 30,
      roundCount: (data.settings?.roundCount as 2 | 3 | 4) ?? 3,
    };

  const [optimisticSessions, setOptimisticSessions] = useOptimistic(
    data.sessions,
    (state, newSession: BreathingSession) => [newSession, ...state]
  );

  const [settings, setSettings] = useState(defaultSettings);

  const personalBestMs =
    optimisticSessions.length > 0
      ? Math.max(...optimisticSessions.map((s) => s.maxRetentionMs))
      : 0;

  const streak = computeStreak(optimisticSessions);
  const totalSessions = optimisticSessions.length;

  const handleSaveSession = async (result: BreathingSessionResult) => {
    const optimistic: BreathingSession = {
      id: Math.random().toString(),
      userId: "",
      completedAt: new Date(),
      roundsCompleted: result.roundsCompleted,
      breathCount: result.breathCount,
      totalRounds: result.totalRounds,
      maxRetentionMs: result.maxRetentionMs,
      retentionTimes: JSON.stringify(result.retentionTimes),
    };
    setOptimisticSessions(optimistic);

    const error = await saveBreathingSession(result);
    if (error) {
      toast.warning(error.message);
    }
  };

  const handleUpdateSettings = async (newSettings: {
    breathCount: 30 | 35 | 40;
    roundCount: 2 | 3 | 4;
  }) => {
    setSettings(newSettings);
    const error = await updateBreathingSettings(newSettings);
    if (error) {
      toast.warning(error.message);
    }
  };

  return (
    <BreathingContext.Provider
      value={{
        sessions: optimisticSessions,
        settings,
        personalBestMs,
        streak,
        totalSessions,
        handleSaveSession,
        handleUpdateSettings,
      }}
    >
      {children}
    </BreathingContext.Provider>
  );
}
