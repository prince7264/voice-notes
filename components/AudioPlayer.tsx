"use client";

import { useState } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getAudio } from "@/lib/db";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

interface AudioPlayerProps {
  noteId: string;
  userId: string;
  durationMs: number;
}

export function AudioPlayer({ noteId, userId, durationMs }: AudioPlayerProps) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const { isPlaying, currentTime, duration, togglePlay, seek } = useAudioPlayer(blob);

  const totalDuration = duration || durationMs / 1000;
  const progress = totalDuration > 0 ? currentTime / totalDuration : 0;

  const handlePlayClick = async () => {
    if (!blob && !loading) {
      setLoading(true);
      const audioBlob = await getAudio(userId, noteId);
      setBlob(audioBlob);
      setLoading(false);
    }
    togglePlay();
  };

  return (
    <div className="flex items-center gap-3 mt-2">
      {/* Play/Pause */}
      <button
        onClick={handlePlayClick}
        disabled={loading}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2A2A2E] hover:bg-[#3A3A3E] transition-colors flex-shrink-0 disabled:opacity-50"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {loading ? (
          <svg className="w-4 h-4 animate-spin text-[#8E8E93]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : isPlaying ? (
          <svg className="w-4 h-4 text-[#6366F1]" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-[#8E8E93]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Scrubber */}
      <div className="flex-1 flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={totalDuration || 100}
          step={0.01}
          value={currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          className="flex-1 h-1 appearance-none rounded-full cursor-pointer"
          style={{
            background: `linear-gradient(to right, #6366F1 ${progress * 100}%, #2A2A2E ${progress * 100}%)`,
          }}
        />
        <span className="text-xs text-[#48484A] w-10 text-right flex-shrink-0">
          {isPlaying || currentTime > 0 ? formatTime(currentTime) : formatTime(totalDuration)}
        </span>
      </div>
    </div>
  );
}
