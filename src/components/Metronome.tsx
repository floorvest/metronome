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

  const scheduler = useCallback(() => {
    const ctx = getAudioContext();
    const lookahead = 0.1;
    const scheduleAhead = 0.02;

    while (nextBeatTimeRef.current < ctx.currentTime + lookahead) {
      const { beats } = parseSignature(sigRef.current);
      const beatInBar = beatIndexRef.current % beats;
      const isAccent = beatInBar === 0;

      if (!mutedRef.current) {
        const source = ctx.createBufferSource();
        source.buffer = isAccent
          ? accentBufferRef.current
          : normalBufferRef.current;
        source.connect(ctx.destination);
        source.start(nextBeatTimeRef.current);
      }

      const timeUntil = nextBeatTimeRef.current - ctx.currentTime;
      const beat = beatIndexRef.current;

      setTimeout(() => {
        setCurrentBeat(beat % beats);
        setVisualBeat(true);
        setTimeout(() => setVisualBeat(false), 100);
      }, Math.max(0, timeUntil * 1000));

      const interval = 60 / bpmRef.current;
      nextBeatTimeRef.current += interval;
      beatIndexRef.current++;
    }

    if (runningRef.current) {
      schedulerTimerRef.current = window.setTimeout(
        scheduler,
        scheduleAhead * 1000
      );
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
      const recent = [...prev.slice(-4), now];
      if (recent.length >= 2) {
        const intervals: number[] = [];
        for (let i = 1; i < recent.length; i++) {
          intervals.push(recent[i] - recent[i - 1]);
        }
        const avgMs =
          intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const newBpm = Math.round(60000 / avgMs);
        if (newBpm >= 20 && newBpm <= 300) {
          setBpm(newBpm);
        }
      }
      return recent;
    });
  }, []);

  useEffect(() => {
    if (tapTimes.length === 0) return;
    const timer = setTimeout(() => setTapTimes([]), 2000);
    return () => clearTimeout(timer);
  }, [tapTimes]);

  useEffect(() => {
    return () => {
      stop();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { beats } = parseSignature(timeSignature);

  return (
    <main className="metronome">
      <div className="metronome-container">
        <h1 className="metronome-title">Metronome</h1>

        {/* BPM Display */}
        <div className="bpm-display">
          <span className="bpm-value">{bpm}</span>
          <span className="bpm-label">BPM</span>
        </div>

        {/* Tempo Slider */}
        <div className="slider-wrapper">
          <input
            type="range"
            min={20}
            max={300}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="tempo-slider"
            aria-label="Tempo slider"
          />
          <div className="slider-labels">
            <span>20</span>
            <span>300</span>
          </div>
        </div>

        {/* BPM Numeric Input + Tap Tempo */}
        <div className="bpm-controls">
          <input
            type="number"
            min={20}
            max={300}
            value={bpm}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v >= 20 && v <= 300) setBpm(v);
            }}
            className="bpm-input"
            aria-label="BPM numeric input"
          />
          <button onClick={handleTap} className="tap-btn" aria-label="Tap tempo">
            TAP
          </button>
        </div>

        {/* Time Signature */}
        <div className="sig-buttons">
          {TIME_SIGNATURES.map((ts) => (
            <button
              key={ts}
              onClick={() => {
                setTimeSignature(ts);
                setCurrentBeat(0);
              }}
              className={`sig-btn${timeSignature === ts ? " active" : ""}`}
            >
              {ts}
            </button>
          ))}
        </div>

        {/* Beat Indicator */}
        <div className="beat-indicator">
          {Array.from({ length: beats }, (_, i) => {
            let cls = "beat-dot";
            if (i === 0) cls += " accent";
            if (currentBeat === i && running) cls += " current";
            if (currentBeat === i && visualBeat && running) cls += " flash";
            return <div key={i} className={cls} />;
          })}
        </div>

        {/* Main Controls */}
        <div className="main-controls">
          <button
            onClick={toggleRunning}
            className={`start-stop-btn ${running ? "stop" : "start"}`}
            aria-label={running ? "Stop" : "Start"}
          >
            {running ? "STOP" : "START"}
          </button>

          <button
            onClick={() => setMuted((m) => !m)}
            className={`mute-btn ${muted ? "muted" : "unmuted"}`}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mute-icon"
              >
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mute-icon"
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