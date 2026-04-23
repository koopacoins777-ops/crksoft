"use client";

import { Button } from "@/components/ui/button";
import { useBreathingContext } from "@/lib/hooks";

type Props = {
  onStart: () => void;
};

export default function SessionSetup({ onStart }: Props) {
  const { settings, handleUpdateSettings } = useBreathingContext();

  const breathOptions: (30 | 35 | 40)[] = [30, 35, 40];
  const roundOptions: (2 | 3 | 4)[] = [2, 3, 4];

  return (
    <div className="flex flex-col items-center gap-10 animate-fade-in-up">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Wim Hof Method
        </h1>
        <p className="mt-2 text-lg text-white/50">Configure your session</p>
      </div>

      <div className="w-full max-w-sm space-y-6">
        {/* Breaths per round */}
        <div>
          <p className="mb-3 text-center text-sm font-medium uppercase tracking-widest text-white/50">
            Breaths per round
          </p>
          <div className="flex gap-2">
            {breathOptions.map((n) => (
              <button
                key={n}
                onClick={() =>
                  handleUpdateSettings({ ...settings, breathCount: n })
                }
                className={`flex-1 rounded-xl py-3 text-lg font-bold transition-all duration-200 ${
                  settings.breathCount === n
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/50"
                    : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Rounds */}
        <div>
          <p className="mb-3 text-center text-sm font-medium uppercase tracking-widest text-white/50">
            Rounds
          </p>
          <div className="flex gap-2">
            {roundOptions.map((n) => (
              <button
                key={n}
                onClick={() =>
                  handleUpdateSettings({ ...settings, roundCount: n })
                }
                className={`flex-1 rounded-xl py-3 text-lg font-bold transition-all duration-200 ${
                  settings.roundCount === n
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/50"
                    : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Session preview */}
        <div className="rounded-xl bg-white/5 px-4 py-3 text-center text-sm text-white/40">
          {settings.roundCount} rounds ×{" "}
          {settings.breathCount} breaths ≈{" "}
          {Math.round((settings.roundCount * (settings.breathCount * 5 + 75)) / 60)} min
        </div>
      </div>

      <Button
        onClick={onStart}
        className="h-14 w-full max-w-sm rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-700 text-lg font-bold text-white shadow-xl shadow-cyan-900/40 hover:from-cyan-500 hover:to-blue-600 transition-all duration-200"
      >
        Begin Session
      </Button>
    </div>
  );
}
