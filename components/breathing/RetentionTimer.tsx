"use client";

type Props = {
  elapsedMs: number;
  personalBestMs: number;
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function RetentionTimer({ elapsedMs, personalBestMs }: Props) {
  const isNewBest = personalBestMs > 0 && elapsedMs > personalBestMs;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="font-mono text-6xl font-bold tabular-nums text-white">
        {formatTime(elapsedMs)}
      </div>
      {personalBestMs > 0 && (
        <p
          className={`text-sm font-medium transition-colors duration-300 ${
            isNewBest ? "text-emerald-400 animate-pulse" : "text-white/40"
          }`}
        >
          {isNewBest
            ? "New personal best!"
            : `Best: ${formatTime(personalBestMs)}`}
        </p>
      )}
    </div>
  );
}
