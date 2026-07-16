/**
 * TapTempo utility — calculates BPM from user taps.
 *
 * Records the last N tap timestamps and returns the median interval
 * converted to BPM.  Debounce window prevents accidental double-taps.
 */

const TAP_WINDOW = 5;
const DEBOUNCE_MS = 200;

let taps: number[] = [];

export function recordTap(): number | null {
  const now = performance.now();

  // Debounce: ignore taps happening too close together
  if (taps.length > 0 && now - taps[taps.length - 1] < DEBOUNCE_MS) {
    return null;
  }

  taps.push(now);

  // Keep only the last TAP_WINDOW taps
  if (taps.length > TAP_WINDOW) {
    taps = taps.slice(taps.length - TAP_WINDOW);
  }

  if (taps.length < 2) {
    return null; // need at least 2 taps for an interval
  }

  // Compute intervals between consecutive taps
  const intervals: number[] = [];
  for (let i = 1; i < taps.length; i++) {
    intervals.push(taps[i] - taps[i - 1]);
  }

  // Sort intervals and pick the median
  const sorted = [...intervals].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  // Convert ms interval to BPM
  const bpm = Math.round(60000 / median);

  // Clamp to allowed range
  return Math.max(20, Math.min(300, bpm));
}

export function resetTaps(): void {
  taps = [];
}