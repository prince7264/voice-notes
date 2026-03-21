"use client";

import { useState, useRef, useEffect } from "react";
import { getAudio } from "@/lib/db";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

interface AudioPlayerProps {
  userId: string;
  noteId: string;
  durationMs: number;
}

export function AudioPlayer({ userId, noteId, durationMs }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const blob = await getAudio(userId, noteId);
      if (!blob || cancelled) return;
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onloadedmetadata = () => { if (!cancelled) { setDuration(audio.duration); setReady(true); } };
      audio.ontimeupdate = () => { if (!cancelled) setCurrentTime(audio.currentTime); };
      audio.onended = () => { if (!cancelled) { setIsPlaying(false); setCurrentTime(0); } };
    }
    load();
    return () => {
      cancelled = true;
      audioRef.current?.pause();
      audioRef.current = null;
      if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; }
    };
  }, [userId, noteId]);

  const totalDuration = duration || durationMs / 1000;
  const progress = totalDuration > 0 ? currentTime / totalDuration : 0;

  const togglePlay = async () => {
    if (!audioRef.current || !ready) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { await audioRef.current.play(); setIsPlaying(true); }
  };

  const seek = (value: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        disabled={!ready}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          ready
            ? isPlaying
              ? "bg-primary text-on-primary shadow-md"
              : "bg-surface-container-high text-primary hover:bg-primary/10"
            : "bg-surface-container text-outline opacity-50 cursor-not-allowed"
        }`}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isPlaying ? "'FILL' 1" : "'FILL' 1" }}>
          {isPlaying ? "pause" : "play_arrow"}
        </span>
      </button>

      {/* Progress bar */}
      <div className="flex-1 flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={totalDuration || 100}
          step={0.01}
          value={currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          className="flex-1 cursor-pointer"
          style={{
            background: `linear-gradient(to right, #182442 ${progress * 100}%, #e6e8e9 ${progress * 100}%)`,
          }}
        />
        <span className="text-xs font-mono font-bold text-on-surface-variant w-9 text-right flex-shrink-0">
          {isPlaying || currentTime > 0 ? formatTime(currentTime) : formatTime(totalDuration)}
        </span>
      </div>
    </div>
  );
}
