"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const TIME_SIGNATURES = ["4/4", "3/4", "2/4", "6/8"] as const;
type TimeSignature = (typeof TIME_SIGNATURES)[number];

function parseSignature(ts: TimeSignature): { beats: number; division: number } {
  const [b, d] = ts.split("/").map(Number);
  return { beats: b, division: d };
}

function createClickBuffer(ctx: AudioContext, freq: number): AudioBuffer {
  const duration = 0.04;
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * 80);
    data[i] = Math.sin(2 * Math.PI * freq * t) * envelope;
  }
  return buffer;
}

export default function Metronome() {
  const [bpm, setBpm] = useState(100);
  const [running, setRunning] = useState(false);
  const [muted, setMuted] = useState(false);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>("4/4");
  const [currentBeat, setCurrentBeat] = useState(0);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [visualBeat, setVisualBeat] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const accentBufferRef = useRef<AudioBuffer | null>(null);
  const normalBufferRef = useRef<AudioBuffer | null>(null);
  const schedulerTimerRef = useRef<number | null>(null);
  const nextBeatTimeRef = useRef(0);
  const beatIndexRef = useRef(0);
  const runningRef = useRef(false);
  const bpmRef = useRef(bpm);
  const sigRef = useRef(timeSignature);
  const mutedRef = useRef(muted);
  const visualBeatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);
  useEffect(() => {
    sigRef.current = timeSignature;
  }, [timeSignature]);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
      accentBufferRef.current = createClickBuffer(audioCtxRef.current, 1200);
      normalBufferRef.current = createClickBuffer(audioCtxRef.current, 800);
    }
    return audioCtxRef.current;
  }, []);

  const playClick = useCallback(
    (accent: boolean) => {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      if (mutedRef.current) return;
      const source = ctx.createBufferSource();
      source.buffer = accent ? accentBufferRef.current : normalBufferRef.current;
      source.connect(ctx.destination);
      source.start(ctx.currentTime);
    },
    [getAudioContext]
  );

  const flashVisual = useCallback(() => {
    setVisualBeat(true);
    if (visualBeatTimerRef.current) clearTimeout(visualBeatTimerRef.current);
    visualBeatTimerRef.current = setTimeout(() => setVisualBeat(false), 100);
  }, []);

  const scheduler = useCallback(() => {
    const ctx = getAudioContext();
    const lookahead = 0.1; // 100ms lookahead
    const scheduleAhead = 0.02; // schedule interval in seconds

    while (nextBeatTimeRef.current < ctx.currentTime + lookahead) {
      const { beats } = parseSignature(sigRef.current);
      const beatInBar = beatIndexRef.current % beats;
      const isAccent = beatInBar === 0;

      // Schedule the click
      if (!mutedRef.current) {
        const source = ctx.createBufferSource();
        source.buffer = isAccent ? accentBufferRef.current : normalBufferRef.current;
        source.connect(ctx.destination);
        source.start(nextBeatTimeRef.current);
      }

      // Schedule visual flash using a small offset
      const timeUntil = nextBeatTimeRef.current - ctx.currentTime;
      const beat = beatIndexRef.current;

      setTimeout(() => {
        setCurrentBeat(beat % beats);
        setVisualBeat(true);
        setTimeout(() => setVisualBeat(false), 100);
      }, Math.max(0, timeUntil * 1000));

      // Advance
      const interval = 60 / bpmRef.current;
      nextBeatTimeRef.current += interval;
      beatIndexRef.current++;
    }

    if (runningRef.current) {
      schedulerTimerRef.current = window.setTimeout(scheduler, scheduleAhead * 1000);
    }
  }, [getAudioContext]);

  const start = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    nextBeatTimeRef.current = ctx.currentTime + 0.05;
    beatIndexRef.current = 0;
    runningRef.current = true;
    setRunning(true);
    setCurrentBeat(0);
    scheduler();
  }, [getAudioContext, scheduler]);

  const stop = useCallback(() => {
    runningRef.current = false;
    setRunning(false);
    setCurrentBeat(0);
    setVisualBeat(false);
    if (schedulerTimerRef.current) {
      clearTimeout(schedulerTimerRef.current);
      schedulerTimerRef.current = null;
    }
  }, []);

  const toggleRunning = useCallback(() => {
    if (running) {
      stop();
    } else {
      start();
    }
  }, [running, start, stop]);

  const handleTap = useCallback(() => {
    const now = performance.now();
    setTapTimes((prev) => {
      // Keep last 5 taps
      const recent = [...prev.slice(-4), now];
      if (recent.length >= 2) {
        const intervals: number[] = [];
        for (let i = 1; i < recent.length; i++) {
          intervals.push(recent[i] - recent[i - 1]);
        }
        const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const newBpm = Math.round(60000 / avgMs);
        if (newBpm >= 20 && newBpm <= 300) {
          setBpm(newBpm);
        }
      }
      return recent;
    });
  }, []);

  // Clear old taps after 2 seconds of inactivity
  useEffect(() => {
    if (tapTimes.length === 0) return;
    const timer = setTimeout(() => setTapTimes([]), 2000);
    return () => clearTimeout(timer);
  }, [tapTimes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [stop]);

  const { beats } = parseSignature(timeSignature);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <h1 className="text-center text-3xl font-bold tracking-tight">
          Metronome
        </h1>

        {/* BPM Display */}
        <div className="text-center">
          <span className="text-7xl font-extrabold tabular-nums">{bpm}</span>
          <span className="ml-1 text-xl text-gray-400">BPM</span>
        </div>

        {/* Tempo Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min={20}
            max={300}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            aria-label="Tempo slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>20</span>
            <span>300</span>
          </div>
        </div>

        {/* BPM Numeric Input + Tap Tempo */}
        <div className="flex gap-4 items-center justify-center">
          <input
            type="number"
            min={20}
            max={300}
            value={bpm}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v >= 20 && v <= 300) setBpm(v);
            }}
            className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="BPM numeric input"
          />
          <button
            onClick={handleTap}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-md text-lg font-semibold transition-colors select-none"
            aria-label="Tap tempo"
          >
            TAP
          </button>
        </div>

        {/* Time Signature */}
        <div className="flex gap-2 justify-center">
          {TIME_SIGNATURES.map((ts) => (
            <button
              key={ts}
              onClick={() => {
                setTimeSignature(ts);
                setCurrentBeat(0);
              }}
              className={`px-4 py-2 rounded-md text-lg font-semibold transition-colors ${
                timeSignature === ts
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {ts}
            </button>
          ))}
        </div>

        {/* Beat Indicator */}
        <div className="flex justify-center gap-3">
          {Array.from({ length: beats }, (_, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full transition-all duration-75 ${
                currentBeat === i && running
                  ? "scale-125 ring-2 ring-indigo-400"
                  : "scale-100"
              } ${
                currentBeat === i && visualBeat && running
                  ? "bg-indigo-400"
                  : i === 0
                  ? "bg-indigo-700"
                  : "bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Main Controls */}
        <div className="flex gap-4 justify-center">
          {/* Play/Stop */}
          <button
            onClick={toggleRunning}
            className={`w-24 h-24 rounded-full text-lg font-bold transition-all active:scale-95 select-none ${
              running
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
            aria-label={running ? "Stop" : "Start"}
          >
            {running ? "STOP" : "START"}
          </button>

          {/* Mute */}
          <button
            onClick={() => setMuted((m) => !m)}
            className={`w-16 h-16 self-center rounded-full text-sm font-semibold transition-all active:scale-95 select-none ${
              muted
                ? "bg-gray-600 text-gray-300"
                : "bg-gray-800 text-gray-200 hover:bg-gray-700"
            }`}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-7 h-7 mx-auto"
              >
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-7 h-7 mx-auto"
              >
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}