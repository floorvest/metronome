"use client";

interface TransportControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
}

export default function TransportControls({
  isPlaying,
  isMuted,
  onTogglePlay,
  onToggleMute,
}: TransportControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={onTogglePlay}
        className="min-w-[64px] min-h-[64px] px-6 py-3 text-xl font-bold rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white transition-colors shadow-lg"
        aria-label={isPlaying ? "Stop" : "Start"}
      >
        {isPlaying ? "⏹" : "▶"}
      </button>

      <button
        onClick={onToggleMute}
        className={`min-w-[44px] min-h-[44px] px-4 py-2 text-lg font-semibold rounded-full transition-colors ${
          isMuted
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
        }`}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? "🔇" : "🔊"}
      </button>
    </div>
  );
}