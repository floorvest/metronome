"use client";

import { useEffect, useState } from "react";
import type { TimeSignature } from "@/lib/types";

interface VisualBeatIndicatorProps {
  currentBeat: number;
  isPlaying: boolean;
  timeSignature: TimeSignature;
}

function beatsPerMeasure(ts: TimeSignature): number {
  switch (ts) {
    case "4/4": return 4;
    case "3/4": return 3;
    case "2/4": return 2;
    case "6/8": return 6;
  }
}

export default function VisualBeatIndicator({
  currentBeat,
  isPlaying,
  timeSignature,
}: VisualBeatIndicatorProps) {
  const total = beatsPerMeasure(timeSignature);
  const [flashBeat, setFlashBeat] = useState<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      setFlashBeat(null);
      return;
    }
    setFlashBeat(currentBeat);
    const timeout = setTimeout(() => setFlashBeat(null), 100);
    return () => clearTimeout(timeout);
  }, [currentBeat, isPlaying]);

  return (
    <div className="flex items-center justify-center gap-3">
      {Array.from({ length: total }).map((_, i) => {
        const isAccented = i === 0;
        const isFlashing = flashBeat === i;
        return (
          <div
            key={i}
            className={`rounded-full transition-all duration-75 ${
              isAccented
                ? "w-8 h-8 border-2 border-emerald-500"
                : "w-6 h-6 border-2 border-gray-400 dark:border-gray-500"
            } ${
              isFlashing
                ? isAccented
                  ? "bg-emerald-400 scale-125 shadow-lg shadow-emerald-400/50"
                  : "bg-gray-600 dark:bg-gray-300 scale-110"
                : "bg-transparent"
            }`}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}