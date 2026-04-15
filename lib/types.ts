import { BreathingSession, BreathingSettings, Pet } from "@prisma/client";

export type PetEssentials = Omit<
  Pet,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

export type BreathingSessionResult = {
  roundsCompleted: number;
  breathCount: number;
  totalRounds: number;
  maxRetentionMs: number;
  retentionTimes: number[];
};

export type BreathingData = {
  sessions: BreathingSession[];
  settings: BreathingSettings | null;
};
