"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TimeSignature } from "@/lib/types";
import { MetronomeScheduler } from "@/lib/audio-engine";
import TempoControl from "./TempoControl";
import TimeSignatureSelector from "./TimeSignatureSelector";
import VisualBeatIndicator from "./VisualBeatIndicator";
import TransportControls from "./TransportControls";

export default function Metronome() {
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>("4/4");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);

  const schedulerRef = useRef<MetronomeScheduler | null>(null);

  // Keep scheduler in sync with mutable state without re-creating it
  const bpmRef = useRef(bpm);
  const timeSignatureRef = useRef(timeSignature);
  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    bpmRef.current = bpm;
    schedulerRef.current?.updateBpm(bpm);
  }, [bpm]);

  useEffect(() => {
    timeSignatureRef.current = timeSignature;
    schedulerRef.current?.updateTimeSignature(timeSignature);
  }, [timeSignature]);

  useEffect(() => {
    isMutedRef.current = isMuted;
    schedulerRef.current?.updateMuted(isMuted);
  }, [isMuted]);

  const onBeat = useCallback((beat: number, _accented: boolean) => {
    setCurrentBeat(beat);
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      schedulerRef.current?.stop();
      schedulerRef.current = null;
      setIsPlaying(false);
      setCurrentBeat(0);
    } else {
      const sched = new MetronomeScheduler(
        bpmRef.current,
        timeSignatureRef.current,
        isMutedRef.current,
        onBeat
      );
      schedulerRef.current = sched;
      sched.start();
      setIsPlaying(true);
    }
  }, [isPlaying, onBeat]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      schedulerRef.current?.stop();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 p-6 sm:p-10 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        Metronome
      </h1>

      <TempoControl bpm={bpm} onBpmChange={setBpm} disabled={isPlaying} />

      <TimeSignatureSelector
        value={timeSignature}
        onChange={setTimeSignature}
        disabled={isPlaying}
      />

      <VisualBeatIndicator
        currentBeat={currentBeat}
        isPlaying={isPlaying}
        timeSignature={timeSignature}
      />

      <TransportControls
        isPlaying={isPlaying}
        isMuted={isMuted}
        onTogglePlay={handleTogglePlay}
        onToggleMute={handleToggleMute}
      />
    </div>
  );
}