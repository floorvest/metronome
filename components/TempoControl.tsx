"use client";

import { registerTap } from "../lib/tap-tempo";

interface TempoControlProps {
  bpm: number;
  onBpmChange: (bpm: number) => void;
  disabled?: boolean;
}

export default function TempoControl({
  bpm,
  onBpmChange,
  disabled = false,
}: TempoControlProps) {
  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    onBpmChange(Number(e.target.value));
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    if (!isNaN(v)) {
      onBpmChange(Math.min(300, Math.max(20, v)));
    }
  }

  function handleTap() {
    const result = registerTap();
    if (result !== null) {
      onBpmChange(result);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <label className="text-3xl font-mono tabular-nums text-gray-800 dark:text-gray-100">
        {bpm} <span className="text-sm text-gray-500">BPM</span>
      </label>

      <input
        type="range"
        min={20}
        max={300}
        value={bpm}
        onChange={handleSlider}
        disabled={disabled}
        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 disabled:opacity-50"
        aria-label="Tempo slider"
      />

      <div className="flex items-center gap-3">
        <input
          type="number"
          min={20}
          max={300}
          value={bpm}
          onChange={handleInput}
          disabled={disabled}
          className="w-20 px-3 py-2 text-center text-lg font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 disabled:opacity-50"
          aria-label="BPM numeric input"
        />

        <button
          onClick={handleTap}
          disabled={disabled}
          className="min-w-[44px] min-h-[44px] px-5 py-2 text-lg font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white transition-colors disabled:opacity-50"
          aria-label="Tap tempo"
        >
          TAP
        </button>
      </div>
    </div>
  );
}