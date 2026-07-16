export type TimeSignature = "4/4" | "3/4" | "2/4" | "6/8";

export type BeatAccent = "accented" | "unaccented";

export interface MetronomeState {
  bpm: number;
  timeSignature: TimeSignature;
  isPlaying: boolean;
  isMuted: boolean;
  currentBeat: number;
}
