"use client";

import { useState, useRef, useEffect } from "react";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

interface AudioPlayerProps {
  audioUrl?: string;
  durationMs: number;
}

export function AudioPlayer({ audioUrl, durationMs }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
      setReady(true);
    };
    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [audioUrl]);

  const totalDuration = duration || durationMs / 1000;
  const progress = totalDuration > 0 ? currentTime / totalDuration : 0;

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const seek = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  return (
    <div className="flex items-center gap-3 mt-1">
      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        disabled={!audioUrl || (!ready && !isPlaying)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#252538] hover:bg-[#2E2E46] transition-colors flex-shrink-0 disabled:opacity-40"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <svg className="w-4 h-4 text-[#6366F1]" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-[#8181A0]" fill="currentColor" viewBox="0 0 24 24">
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
            background: `linear-gradient(to right, #6366F1 ${progress * 100}%, #252538 ${progress * 100}%)`,
          }}
        />
        <span className="text-xs text-[#4A4A65] w-10 text-right flex-shrink-0">
          {isPlaying || currentTime > 0
            ? formatTime(currentTime)
            : formatTime(totalDuration)}
        </span>
      </div>
    </div>
  );
}
