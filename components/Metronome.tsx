"use client";

import { useState, useCallback, useRef } from "react";
import {
  init,
  start,
  stop,
  updateBpm,
  updateTimeSignature,
  setMuted,
} from "../utils/AudioEngine";
import { recordTap, resetTaps } from "../utils/TapTempo";

type TimeSignature = "4/4" | "3/4" | "2/4" | "6/8";

const SIG_MAP: Record<TimeSignature, number> = {
  "4/4": 4,
  "3/4": 3,
  "2/4": 2,
  "6/8": 6,
};

const styles = {
  card: {
    width: "100%",
    maxWidth: 420,
    margin: "0 auto",
    padding: "clamp(16px, 5vw, 32px)",
    background: "#1f2937",
    borderRadius: 16,
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: 24,
    userSelect: "none" as const,
  },
  indicatorOuter: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 96,
    height: 96,
  },
  indicator: (flash: "accent" | "tick" | null) => ({
    width: 80,
    height: 80,
    borderRadius: "50%",
    border: "4px solid #6b7280",
    transition: "all 60ms ease",
    background:
      flash === "accent"
        ? "#facc15"
        : flash === "tick"
          ? "#4ade80"
          : "#4b5563",
    borderColor:
      flash === "accent"
        ? "#fef08a"
        : flash === "tick"
          ? "#bbf7d0"
          : "#6b7280",
    transform: flash
      ? flash === "accent"
        ? "scale(1.1)"
        : "scale(1.05)"
      : "scale(1)",
    boxShadow: flash
      ? flash === "accent"
        ? "0 0 30px rgba(250,204,21,0.7)"
        : "0 0 20px rgba(74,222,128,0.6)"
      : "none",
  }),
  bpmInput: {
    width: 112,
    textAlign: "center" as const,
    fontSize: "3.75rem",
    fontWeight: 700,
    background: "transparent",
    color: "#f9fafb",
    border: "none",
    borderBottom: "2px solid #6b7280",
    outline: "none",
    transition: "border-color 0.2s",
    MozAppearance: "textfield",
  },
  bpmLabel: {
    color: "#9ca3af",
    fontSize: "0.875rem",
    marginTop: 4,
  },
  slider: {
    width: "100%",
    height: 8,
    borderRadius: 8,
    appearance: "none" as const,
    cursor: "pointer",
    background: "#4b5563",
    outline: "none",
  },
  sigGroup: {
    display: "flex",
    gap: 8,
  },
  sigBtn: (active: boolean) => ({
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: "1.125rem",
    fontWeight: 600,
    minWidth: 56,
    border: "none",
    cursor: "pointer",
    transition: "background 0.2s",
    background: active ? "#facc15" : "#374151",
    color: active ? "#111827" : "#d1d5db",
  }),
  controls: {
    display: "flex",
    gap: 12,
    width: "100%",
  },
  startStopBtn: (running: boolean) => ({
    flex: 1,
    padding: "16px 0",
    borderRadius: 12,
    fontSize: "1.25rem",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    minHeight: 56,
    transition: "background 0.2s",
    background: running ? "#ef4444" : "#22c55e",
    color: "#fff",
  }),
  tapBtn: {
    flex: 1,
    padding: "16px 0",
    borderRadius: 12,
    fontSize: "1.25rem",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    minHeight: 56,
    transition: "background 0.2s",
    background: "#eab308",
    color: "#111827",
  },
  muteBtn: (muted: boolean) => ({
    padding: "16px",
    borderRadius: 12,
    fontSize: "1.25rem",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    minHeight: 56,
    minWidth: 56,
    transition: "background 0.2s",
    background: muted ? "#6b7280" : "#374151",
    color: muted ? "#fff" : "#d1d5db",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
  svgIcon: {
    width: 24,
    height: 24,
  },
};

export default function Metronome() {
  const [bpm, setBpm] = useState(120);
  const [sig, setSig] = useState<TimeSignature>("4/4");
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [flash, setFlash] = useState<"accent" | "tick" | null>(null);

  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;

  const [initialised, setInitialised] = useState(false);

  const handleInit = useCallback(() => {
    if (!initialised) {
      init();
      setInitialised(true);
    }
  }, [initialised]);

  const onBeat = useCallback((beatIndex: number) => {
    if (beatIndex === 0) {
      setFlash("accent");
    } else {
      setFlash("tick");
    }
    setTimeout(() => setFlash(null), 80);
  }, []);

  const onStop = useCallback(() => {
    setFlash(null);
  }, []);

  const handleStartStop = useCallback(() => {
    handleInit();
    if (isRunning) {
      stop();
      setIsRunning(false);
    } else {
      resetTaps();
      start(bpm, SIG_MAP[sig], onBeat, onStop);
      setIsRunning(true);
    }
  }, [isRunning, bpm, sig, onBeat, onStop, handleInit]);

  const handleBpmChange = useCallback((newBpm: number) => {
    const clamped = Math.max(20, Math.min(300, newBpm));
    setBpm(clamped);
    if (isRunningRef.current) {
      updateBpm(clamped);
    }
  }, []);

  const handleSigChange = useCallback((newSig: TimeSignature) => {
    setSig(newSig);
    updateTimeSignature(SIG_MAP[newSig]);
  }, []);

  const handleTap = useCallback(() => {
    handleInit();
    const result = recordTap();
    if (result !== null) {
      setBpm(result);
      if (isRunningRef.current) {
        updateBpm(result);
      }
    }
  }, [handleInit]);

  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      setMuted(next);
      return next;
    });
  }, []);

  return (
    <div style={styles.card} onClick={handleInit}>
      {/* Visual Beat Indicator */}
      <div style={styles.indicatorOuter}>
        <div style={styles.indicator(flash)} />
      </div>

      {/* Tempo Display */}
      <div style={{ textAlign: "center" }}>
        <input
          type="number"
          min={20}
          max={300}
          value={bpm}
          onChange={(e) => handleBpmChange(Number(e.target.value))}
          style={styles.bpmInput}
          aria-label="Tempo in BPM"
          onFocus={(e) => e.target.select()}
        />
        <p style={styles.bpmLabel}>BPM</p>
      </div>

      {/* Tempo Slider */}
      <input
        type="range"
        min={20}
        max={300}
        value={bpm}
        onChange={(e) => handleBpmChange(Number(e.target.value))}
        style={styles.slider}
        aria-label="Tempo slider"
      />

      {/* Time Signature */}
      <div style={styles.sigGroup}>
        {(["4/4", "3/4", "2/4", "6/8"] as TimeSignature[]).map((s) => (
          <button
            key={s}
            onClick={() => handleSigChange(s)}
            style={styles.sigBtn(sig === s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Main Controls */}
      <div style={styles.controls}>
        <button
          onClick={handleStartStop}
          style={styles.startStopBtn(isRunning)}
        >
          {isRunning ? "Stop" : "Start"}
        </button>
        <button onClick={handleTap} style={styles.tapBtn}>
          Tap
        </button>
        <button
          onClick={handleMuteToggle}
          style={styles.muteBtn(isMuted)}
          aria-label={isMuted ? "Unmute" : "Mute"}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style={styles.svgIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              style={styles.svgIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}