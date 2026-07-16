"use client";

import type { TimeSignature } from "../lib/types";

const SIGNATURES: { value: TimeSignature; label: string }[] = [
  { value: "4/4", label: "4/4" },
  { value: "3/4", label: "3/4" },
  { value: "2/4", label: "2/4" },
  { value: "6/8", label: "6/8" },
];

interface TimeSignatureSelectorProps {
  value: TimeSignature;
  onChange: (ts: TimeSignature) => void;
  disabled?: boolean;
}

export default function TimeSignatureSelector({
  value,
  onChange,
  disabled = false,
}: TimeSignatureSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Time Signature
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TimeSignature)}
        disabled={disabled}
        className="min-w-[44px] min-h-[44px] px-3 py-2 text-lg font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 cursor-pointer disabled:opacity-50"
        aria-label="Time signature"
      >
        {SIGNATURES.map((sig) => (
          <option key={sig.value} value={sig.value}>
            {sig.label}
          </option>
        ))}
      </select>
    </div>
  );
}