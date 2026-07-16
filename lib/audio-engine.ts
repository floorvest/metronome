import type { TimeSignature } from "./types";

const ACCENTED_FREQ = 880;
const UNACCENTED_FREQ = 440;
const CLICK_DURATION = 0.05;

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playClick(accented: boolean) {
  const ctx = getAudioContext();

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.frequency.value = accented ? ACCENTED_FREQ : UNACCENTED_FREQ;
  osc.type = "square";

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + CLICK_DURATION);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + CLICK_DURATION);
}

export type SchedulerCallback = (beat: number, accented: boolean) => void;

export class MetronomeScheduler {
  private bpm: number;
  private timeSignature: TimeSignature;
  private isMuted: boolean;
  private onBeat: SchedulerCallback;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private nextBeatTime: number = 0;
  private beatIndex: number = 0;

  constructor(
    bpm: number,
    timeSignature: TimeSignature,
    isMuted: boolean,
    onBeat: SchedulerCallback
  ) {
    this.bpm = bpm;
    this.timeSignature = timeSignature;
    this.isMuted = isMuted;
    this.onBeat = onBeat;
  }

  updateBpm(bpm: number) {
    this.bpm = bpm;
  }

  updateTimeSignature(ts: TimeSignature) {
    this.timeSignature = ts;
    this.beatIndex = 0;
  }

  updateMuted(muted: boolean) {
    this.isMuted = muted;
  }

  getBeatsPerMeasure(): number {
    switch (this.timeSignature) {
      case "4/4": return 4;
      case "3/4": return 3;
      case "2/4": return 2;
      case "6/8": return 6;
    }
  }

  start() {
    this.beatIndex = 0;
    this.nextBeatTime = performance.now();
    this.scheduleNext();
  }

  stop() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private scheduleNext() {
    const intervalMs = (60 / this.bpm) * 1000;
    const beatsPerMeasure = this.getBeatsPerMeasure();

    const now = performance.now();
    while (this.nextBeatTime <= now) {
      this.nextBeatTime += intervalMs;
    }

    const delay = this.nextBeatTime - now;

    this.timerId = setTimeout(() => {
      const accented = this.beatIndex === 0;

      if (!this.isMuted) {
        playClick(accented);
      }
      this.onBeat(this.beatIndex, accented);

      this.beatIndex = (this.beatIndex + 1) % beatsPerMeasure;
      this.scheduleNext();
    }, delay);
  }
}