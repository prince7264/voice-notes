"use client";

import { useState, useRef, useEffect } from "react";
import type { NoteMetadata } from "@/types";
import { getAudio } from "@/lib/db";

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTimeOfDay(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDurationLong(ms: number): string {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec} seconds`;
  return `${m}m ${sec}s`;
}

function generateSummary(transcript: string): string {
  if (!transcript || transcript.startsWith("[Transcription error")) return "";
  const sentences = transcript.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  if (sentences.length === 0) return transcript.slice(0, 120);
  return sentences.slice(0, 2).join(". ").trim() + ".";
}

function extractKeyTopics(transcript: string): string[] {
  if (!transcript) return [];
  const words = transcript.toLowerCase().split(/\s+/);
  const stopWords = new Set(["the", "a", "an", "is", "was", "are", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "shall", "can", "need", "dare", "ought", "used", "to", "of", "in", "for", "on", "with", "at", "by", "from", "as", "into", "through", "during", "before", "after", "above", "below", "between", "out", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "each", "every", "both", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "just", "because", "but", "and", "or", "if", "while", "that", "this", "it", "i", "me", "my", "we", "you", "your", "he", "she", "they", "them", "his", "her", "its"]);
  const freq: Record<string, number> = {};
  words.forEach((w) => {
    const clean = w.replace(/[^a-z]/g, "");
    if (clean.length > 3 && !stopWords.has(clean)) {
      freq[clean] = (freq[clean] || 0) + 1;
    }
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([word]) => word);
}

interface NoteDetailProps {
  note: NoteMetadata;
  userId: string;
  onBack: () => void;
  onDelete: (id: string) => void;
}

export function NoteDetail({ note, userId, onBack, onDelete }: NoteDetailProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const blob = await getAudio(userId, note.id);
      if (!blob || cancelled) return;
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onloadedmetadata = () => {
        if (!cancelled) { setDuration(audio.duration); setReady(true); }
      };
      audio.ontimeupdate = () => {
        if (!cancelled) setCurrentTime(audio.currentTime);
      };
      audio.onended = () => {
        if (!cancelled) { setIsPlaying(false); setCurrentTime(0); }
      };
    }
    load();
    return () => {
      cancelled = true;
      audioRef.current?.pause();
      audioRef.current = null;
      if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; }
    };
  }, [userId, note.id]);

  const totalDuration = duration || note.durationMs / 1000;
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  const togglePlay = async () => {
    if (!audioRef.current || !ready) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { await audioRef.current.play(); setIsPlaying(true); }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const t = pct * totalDuration;
    audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const skipBy = (secs: number) => {
    if (!audioRef.current) return;
    const t = Math.max(0, Math.min(totalDuration, audioRef.current.currentTime + secs));
    audioRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(note.transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(note.id);
      onBack();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const summary = generateSummary(note.transcript);
  const keyTopics = extractKeyTopics(note.transcript);

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface">arrow_back</span>
            </button>
            <span className="text-lg font-bold text-primary tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
              Bolkar
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">share</span>
            </button>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-48 no-scrollbar">
        <div className="max-w-5xl mx-auto px-6 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-8 space-y-8">
              {/* Header Section */}
              <section>
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-bold uppercase tracking-wider">
                    Voice Note
                  </span>
                  <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                    {formatDurationLong(note.durationMs)}
                  </span>
                </div>
                <h1
                  className="text-4xl md:text-5xl font-extrabold text-primary leading-tight mb-4"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  Voice Recording
                </h1>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-lg">calendar_today</span>
                  <span className="text-sm font-semibold">
                    {formatFullDate(note.createdAt)} at {formatTimeOfDay(note.createdAt)}
                  </span>
                </div>
              </section>

              {/* AI Summary Card */}
              {summary && (
                <section className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="material-symbols-outlined text-primary text-xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      auto_awesome
                    </span>
                    <h3 className="font-extrabold text-lg text-primary" style={{ fontFamily: "Manrope, sans-serif" }}>
                      AI Insights Summary
                    </h3>
                  </div>
                  <p className="text-on-surface leading-relaxed mb-6">{summary}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-3 p-4 rounded-2xl bg-white border border-outline-variant/30 shadow-sm">
                      <span className="material-symbols-outlined text-tertiary text-lg mt-0.5">check_circle</span>
                      <span className="text-sm text-on-surface">Auto-transcribed from voice recording</span>
                    </div>
                    <div className="flex gap-3 p-4 rounded-2xl bg-white border border-outline-variant/30 shadow-sm">
                      <span className="material-symbols-outlined text-tertiary text-lg mt-0.5">check_circle</span>
                      <span className="text-sm text-on-surface">Duration: {formatDurationLong(note.durationMs)}</span>
                    </div>
                  </div>
                </section>
              )}

              {/* Transcription Section */}
              <section>
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-6">
                  <h3 className="font-extrabold text-xl text-primary" style={{ fontFamily: "Manrope, sans-serif" }}>
                    Full Transcription
                  </h3>
                  <button
                    onClick={handleCopy}
                    className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">{copied ? "check_circle" : "content_copy"}</span>
                    {copied ? "Copied!" : "Export Text"}
                  </button>
                </div>

                {/* Speaker Block */}
                <div className="group flex gap-4 p-4 rounded-2xl hover:bg-surface-container-low transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-extrabold text-lg" style={{ fontFamily: "Manrope, sans-serif" }}>
                      S1
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-extrabold text-lg text-primary" style={{ fontFamily: "Manrope, sans-serif" }}>
                        Speaker
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-surface-container-high font-mono font-bold text-xs text-on-surface-variant">
                        00:00
                      </span>
                    </div>
                    <p className="text-lg leading-relaxed text-on-surface group-hover:text-primary transition-colors">
                      {note.transcript}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Key Topics Card */}
              {keyTopics.length > 0 && (
                <div className="bg-white border border-outline-variant/50 rounded-3xl p-6">
                  <h4 className="font-extrabold text-lg text-primary mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>
                    Key Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {keyTopics.map((topic) => (
                      <span
                        key={topic}
                        className="px-4 py-2 rounded-2xl bg-surface-container-low text-primary text-sm font-semibold border border-outline-variant/30 hover:bg-primary-container transition-colors cursor-pointer"
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recording Details Card */}
              <div className="bg-white border border-outline-variant/50 rounded-3xl p-6">
                <h4 className="font-extrabold text-lg text-primary mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>
                  Recording Details
                </h4>
                <div className="space-y-0">
                  {[
                    { label: "Duration", value: formatDurationLong(note.durationMs) },
                    { label: "Date", value: formatFullDate(note.createdAt) },
                    { label: "Time", value: formatTimeOfDay(note.createdAt) },
                    { label: "Format", value: "WebM Audio" },
                    { label: "Transcription", value: "Sarvam AI" },
                  ].map((item, i, arr) => (
                    <div
                      key={item.label}
                      className={`flex justify-between py-3 ${i < arr.length - 1 ? "border-b border-outline-variant/20" : ""}`}
                    >
                      <span className="text-on-surface-variant text-sm font-medium">{item.label}</span>
                      <span className="font-extrabold text-on-surface text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Card */}
              <div className="space-y-3">
                <button
                  onClick={handleCopy}
                  className="w-full p-4 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center gap-4 transition-colors"
                >
                  <span className="material-symbols-outlined text-primary">content_copy</span>
                  <span className="font-medium text-on-surface text-sm">{copied ? "Copied!" : "Copy Transcript"}</span>
                </button>
                <button
                  onClick={handleDelete}
                  className={`w-full p-4 rounded-xl flex items-center gap-4 transition-colors ${
                    confirmDelete
                      ? "bg-error-container/40 text-error"
                      : "bg-surface-container-low hover:bg-error-container/30"
                  }`}
                >
                  <span className={`material-symbols-outlined ${confirmDelete ? "text-error" : "text-error"}`}>
                    {confirmDelete ? "warning" : "delete"}
                  </span>
                  <span className={`font-medium text-sm ${confirmDelete ? "text-error" : "text-error"}`}>
                    {confirmDelete ? "Tap again to confirm" : "Delete Recording"}
                  </span>
                </button>
              </div>

              {/* Pro Feature Card */}
              <div className="bg-gradient-to-br from-primary to-primary-container rounded-3xl p-6 relative overflow-hidden">
                <span className="material-symbols-outlined text-white/20 text-8xl absolute -bottom-4 -right-4">auto_awesome</span>
                <h4 className="font-extrabold text-lg text-white mb-2 relative z-10" style={{ fontFamily: "Manrope, sans-serif" }}>
                  Bolkar Pro
                </h4>
                <p className="text-white/80 text-sm leading-relaxed mb-4 relative z-10">
                  Unlock AI summaries, speaker detection, and unlimited recordings.
                </p>
                <button className="w-full py-3 bg-white text-primary font-extrabold rounded-2xl active:scale-95 transition-all relative z-10 shadow-lg">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Audio Player */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[92%] md:w-[600px] z-50">
        <div className="bg-white/95 backdrop-blur-2xl border border-outline-variant shadow-2xl rounded-[2rem] px-6 py-4">
          {/* Timeline */}
          <div className="mb-3">
            <div className="relative h-1.5 bg-surface-container-highest rounded-full overflow-hidden cursor-pointer" onClick={seek}>
              <div className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs font-mono font-bold text-on-surface-variant">{formatTime(currentTime)}</span>
              <span className="text-xs font-mono font-bold text-on-surface-variant">{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => skipBy(-10)}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-xl">replay_10</span>
            </button>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">skip_previous</span>
            </button>
            <button
              onClick={togglePlay}
              disabled={!ready}
              className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white shadow-xl active:scale-90 transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </button>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">skip_next</span>
            </button>
            <button
              onClick={() => skipBy(10)}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-xl">forward_10</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
