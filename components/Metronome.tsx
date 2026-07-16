"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  init,
  start,
  stop,
  updateBpm,
  updateTimeSignature,
  setMuted,
} from "@/utils/AudioEngine";
import { recordTap, resetTaps } from "@/utils/TapTempo";

type TimeSignature = "4/4" | "3/4" | "2/4" | "6/8";

const SIG_MAP: Record<TimeSignature, number> = {
  "4/4": 4,
  "3/4": 3,
  "2/4": 2,
  "6/8": 6,
};

export default function Metronome() {
  const [bpm, setBpm] = useState(120);
  const [sig, setSig] = useState<TimeSignature>("4/4");
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [flash, setFlash] = useState<"accent" | "tick" | null>(null);

  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

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
    <div
      className="
        w-full max-w-md mx-auto p-6 sm:p-8
        bg-gray-800 rounded-2xl shadow-2xl
        flex flex-col items-center gap-6
        select-none
      "
      onClick={handleInit}
    >
      {/* ---- Visual Beat Indicator ---- */}
      <div className="relative flex items-center justify-center w-24 h-24">
        <div
          className={`
            w-20 h-20 rounded-full border-4 transition-all duration-[60ms]
            ${flash === "accent"
              ? "bg-yellow-400 border-yellow-200 scale-110 shadow-[0_0_30px_rgba(250,204,21,0.7)]"
              : flash === "tick"
                ? "bg-green-400 border-green-200 scale-105 shadow-[0_0_20px_rgba(74,222,128,0.6)]"
                : "bg-gray-600 border-gray-500 scale-100 shadow-none"
            }
          `}
        />
      </div>

      {/* ---- Tempo Display ---- */}
      <div className="text-center">
        <input
          type="number"
          min={20}
          max={300}
          value={bpm}
          onChange={(e) => handleBpmChange(Number(e.target.value))}
          className="
            w-28 text-center text-6xl font-bold
            bg-transparent text-white
            border-b-2 border-gray-500
            focus:outline-none focus:border-yellow-400
            transition-colors
            [-moz-appearance:textfield]
            [&::-webkit-inner-spin-button]:appearance-none
            [&::-webkit-outer-spin-button]:appearance-none
          "
          aria-label="Tempo in BPM"
        />
        <p className="text-gray-400 text-sm mt-1">BPM</p>
      </div>

      {/* ---- Tempo Slider ---- */}
      <input
        type="range"
        min={20}
        max={300}
        value={bpm}
        onChange={(e) => handleBpmChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer
          accent-yellow-400
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-6
          [&::-webkit-slider-thumb]:h-6
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-yellow-400
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-md"
        aria-label="Tempo slider"
      />

      {/* ---- Time Signature ---- */}
      <div className="flex gap-2">
        {(["4/4", "3/4", "2/4", "6/8"] as TimeSignature[]).map((s) => (
          <button
            key={s}
            onClick={() => handleSigChange(s)}
            className={`
              px-4 py-2 rounded-lg text-lg font-semibold min-w-[56px]
              transition-colors
              ${sig === s
                ? "bg-yellow-400 text-gray-900"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }
            `}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ---- Main Controls ---- */}
      <div className="flex gap-3 w-full">
        {/* Start / Stop */}
        <button
          onClick={handleStartStop}
          className={`
            flex-1 py-4 rounded-xl text-xl font-bold
            transition-colors min-h-[56px]
            ${isRunning
              ? "bg-red-500 hover:bg-red-400 text-white"
              : "bg-green-500 hover:bg-green-400 text-white"
            }
          `}
        >
          {isRunning ? "Stop" : "Start"}
        </button>

        {/* Tap Tempo */}
        <button
          onClick={handleTap}
          className="
            flex-1 py-4 rounded-xl text-xl font-bold
            bg-yellow-500 hover:bg-yellow-400 text-gray-900
            transition-colors min-h-[56px]
          "
        >
          Tap
        </button>

        {/* Mute */}
        <button
          onClick={handleMuteToggle}
          className={`
            py-4 px-4 rounded-xl text-xl font-bold
            transition-colors min-h-[56px] min-w-[56px]
            ${isMuted
              ? "bg-gray-500 hover:bg-gray-400 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            }
          `}
          aria-label={isMuted ? "Unmute" : "Mute"}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mx-auto"
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
              className="h-6 w-6 mx-auto"
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