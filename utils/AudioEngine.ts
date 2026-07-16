/**
 * AudioEngine — wraps Web Audio API for precise metronome click scheduling.
 *
 * Generates short click sounds programmatically (no external audio files needed).
 * Uses a look-ahead scheduler pattern to minimise latency.
 */

let audioCtx: AudioContext | null = null;
let tickBuffer: AudioBuffer | null = null;
let accentBuffer: AudioBuffer | null = null;
let masterGain: GainNode | null = null;
let _muted = false;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = _muted ? 0 : 1;
    masterGain.connect(audioCtx.destination);
  }
  return audioCtx;
}

function getOutput(): GainNode {
  const ctx = getContext();
  if (!masterGain) {
    masterGain = ctx.createGain();
    masterGain.gain.value = _muted ? 0 : 1;
    masterGain.connect(ctx.destination);
  }
  return masterGain;
}

/**
 * Generate a short click-like AudioBuffer.
 */
function createClickBuffer(
  ctx: AudioContext,
  frequency: number,
  durationSec: number
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.ceil(sampleRate * durationSec);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * 80);
    const sample = Math.sin(2 * Math.PI * frequency * t) * envelope;
    data[i] = sample * 0.6;
  }

  return buffer;
}

function ensureBuffers(): void {
  const ctx = getContext();
  if (!tickBuffer) {
    tickBuffer = createClickBuffer(ctx, 1200, 0.04);
  }
  if (!accentBuffer) {
    accentBuffer = createClickBuffer(ctx, 1800, 0.06);
  }
}

// ---- Scheduler state ----

type SchedulerState = {
  bpm: number;
  beatsPerMeasure: number;
  running: boolean;
  onBeat: ((beatIndex: number) => void) | null;
  onStop: (() => void) | null;
};

const state: SchedulerState = {
  bpm: 120,
  beatsPerMeasure: 4,
  running: false,
  onBeat: null,
  onStop: null,
};

let timerId: ReturnType<typeof setTimeout> | null = null;
let nextBeatTime = 0;
let currentBeat = 0;
const LOOK_AHEAD_MS = 50;
const SCHEDULE_INTERVAL_MS = 25;

function scheduleNext(): void {
  if (!state.running) return;

  const ctx = getContext();
  const gain = getOutput();
  const now = ctx.currentTime;

  while (nextBeatTime < now + LOOK_AHEAD_MS / 1000) {
    const beatInMeasure = currentBeat % state.beatsPerMeasure;
    const buffer = beatInMeasure === 0 ? accentBuffer : tickBuffer;

    if (buffer) {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(gain);
      source.start(nextBeatTime);
    }

    if (state.onBeat) {
      state.onBeat(beatInMeasure);
    }

    const beatInterval = 60 / state.bpm;
    nextBeatTime += beatInterval;
    currentBeat++;
  }

  timerId = setTimeout(scheduleNext, SCHEDULE_INTERVAL_MS);
}

// ---- Public API ----

export function init(): void {
  ensureBuffers();
}

export function start(
  bpm: number,
  beatsPerMeasure: number,
  onBeat: (beatIndex: number) => void,
  onStop: () => void
): void {
  ensureBuffers();

  const ctx = getContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  state.bpm = bpm;
  state.beatsPerMeasure = beatsPerMeasure;
  state.running = true;
  state.onBeat = onBeat;
  state.onStop = onStop;

  currentBeat = 0;
  nextBeatTime = ctx.currentTime + 0.01;

  scheduleNext();
}

export function stop(): void {
  state.running = false;
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }
  if (state.onStop) {
    state.onStop();
  }
}

export function updateBpm(bpm: number): void {
  state.bpm = bpm;
  if (state.running) {
    const ctx = getContext();
    nextBeatTime = ctx.currentTime + 60 / bpm;
    currentBeat = 0;
  }
}

export function updateTimeSignature(beatsPerMeasure: number): void {
  state.beatsPerMeasure = beatsPerMeasure;
  if (state.running) {
    currentBeat = 0;
  }
}

export function setMuted(muted: boolean): void {
  _muted = muted;
  if (masterGain) {
    masterGain.gain.value = muted ? 0 : 1;
  }
}

export function isRunning(): boolean {
  return state.running;
}