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
  return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
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

/* ── Shimmer skeleton block ── */
function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-surface-container-high/60 ${className ?? ""}`} />
  );
}

/* ── Sentiment config ── */
const SENTIMENT_CONFIG = {
  positive: { icon: "sentiment_satisfied", color: "text-tertiary", bg: "bg-tertiary-container/30", label: "Positive" },
  neutral: { icon: "sentiment_neutral", color: "text-on-surface-variant", bg: "bg-surface-container-high/40", label: "Neutral" },
  negative: { icon: "sentiment_dissatisfied", color: "text-error", bg: "bg-error-container/30", label: "Negative" },
  mixed: { icon: "mood", color: "text-secondary", bg: "bg-secondary-container/30", label: "Mixed" },
};

interface NoteDetailProps {
  note: NoteMetadata;
  userId: string;
  allNotes: NoteMetadata[];
  onBack: () => void;
  onDelete: (id: string) => void;
  onSelectNote: (note: NoteMetadata) => void;
  onGenerateInsights?: (noteId: string, transcript: string) => void;
}

export function NoteDetail({ note, userId, allNotes, onBack, onDelete, onSelectNote, onGenerateInsights }: NoteDetailProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "insights" | "transcript">("summary");

  const currentIndex = allNotes.findIndex((n) => n.id === note.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allNotes.length - 1;

  useEffect(() => {
    let cancelled = false;
    setReady(false); setIsPlaying(false); setCurrentTime(0); setDuration(0);
    async function load() {
      const blob = await getAudio(userId, note.id);
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
      audioRef.current?.pause(); audioRef.current = null;
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
    audioRef.current.currentTime = pct * totalDuration;
    setCurrentTime(pct * totalDuration);
  };

  const skipBy = (secs: number) => {
    if (!audioRef.current) return;
    const t = Math.max(0, Math.min(totalDuration, audioRef.current.currentTime + secs));
    audioRef.current.currentTime = t; setCurrentTime(t);
  };

  const goToPrev = () => { if (hasPrev) { audioRef.current?.pause(); onSelectNote(allNotes[currentIndex - 1]); } };
  const goToNext = () => { if (hasNext) { audioRef.current?.pause(); onSelectNote(allNotes[currentIndex + 1]); } };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(note.transcript);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = { title: "Voice Note", text: note.transcript.slice(0, 200) };
    if (navigator.share) { try { await navigator.share(shareData); } catch {} }
    else { await navigator.clipboard.writeText(note.transcript); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const handleDelete = () => {
    if (confirmDelete) { onDelete(note.id); onBack(); }
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); }
  };

  const isPending = note.aiStatus === "pending";
  const isFailed = note.aiStatus === "failed";
  const hasAI = note.aiStatus === "completed" && note.summary;
  const sentimentKey = note.insights?.sentiment || "neutral";
  const sentimentCfg = SENTIMENT_CONFIG[sentimentKey];

  // Word stats
  const wordCount = note.transcript.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const talkPace = note.durationMs > 0 ? Math.round(wordCount / (note.durationMs / 60000)) : 0;

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface">arrow_back</span>
            </button>
            <span className="text-lg font-bold text-primary tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>Bolkar</span>
          </div>
          <button onClick={handleShare} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">share</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-48 no-scrollbar">
        <div className="max-w-5xl mx-auto px-6 pt-8">
          {/* Title & Meta */}
          <section className="mb-6">
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-xs font-bold uppercase tracking-wider">Voice Note</span>
              <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-bold uppercase tracking-wider">{formatDurationLong(note.durationMs)}</span>
              {note.category && <span className="px-3 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container text-xs font-bold uppercase tracking-wider">{note.category}</span>}
              {hasAI && <span className="px-3 py-1 rounded-full bg-tertiary-container/40 text-tertiary text-xs font-bold uppercase tracking-wider flex items-center gap-1"><span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>AI</span>}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary leading-tight mb-3" style={{ fontFamily: "Manrope, sans-serif" }}>Voice Recording</h1>
            <div className="flex items-center gap-4 text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">calendar_today</span>
                <span className="text-sm font-medium">{formatFullDate(note.createdAt)} at {formatTimeOfDay(note.createdAt)}</span>
              </div>
              <span className="text-xs text-outline">|</span>
              <span className="text-sm font-medium">{wordCount} words</span>
              <span className="text-xs text-outline">|</span>
              <span className="text-sm font-medium">{readingTime} min read</span>
            </div>
          </section>

          {/* Tab Switcher */}
          <div className="flex gap-1 p-1 bg-surface-container-low rounded-2xl mb-8">
            {(["summary", "insights", "transcript"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab
                    ? "bg-white text-primary shadow-md"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg" style={activeTab === tab ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {tab === "summary" ? "auto_awesome" : tab === "insights" ? "insights" : "description"}
                  </span>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </span>
              </button>
            ))}
          </div>

          {/* ═══════════ SUMMARY TAB ═══════════ */}
          {activeTab === "summary" && (
            <div className="space-y-6 card-enter">
              {/* AI Summary Card */}
              {isPending && (
                <div className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 to-tertiary/5 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary animate-spin">progress_activity</span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-primary" style={{ fontFamily: "Manrope, sans-serif" }}>Generating AI Summary...</h3>
                      <p className="text-xs text-on-surface-variant">Claude is analyzing your note</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Shimmer className="h-4 w-full" />
                    <Shimmer className="h-4 w-5/6" />
                    <Shimmer className="h-4 w-4/6" />
                  </div>
                </div>
              )}

              {isFailed && (
                <div className="rounded-3xl border border-error/20 bg-error-container/10 p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-error/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-error">error</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-error">AI Summary Failed</h3>
                        <p className="text-xs text-on-surface-variant">Could not generate insights for this note</p>
                      </div>
                    </div>
                    {onGenerateInsights && (
                      <button
                        onClick={() => onGenerateInsights(note.id, note.transcript)}
                        className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:bg-primary/90 transition-colors"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              )}

              {hasAI && (
                <div className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/5 via-white to-tertiary/5 p-8 shadow-ambient">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xl text-primary" style={{ fontFamily: "Manrope, sans-serif" }}>AI Summary</h3>
                      <p className="text-xs text-on-surface-variant">Powered by Claude</p>
                    </div>
                  </div>
                  <p className="text-on-surface text-lg leading-relaxed mb-6">{note.summary}</p>

                  {/* Quick Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 border border-outline-variant/20">
                      <span className="material-symbols-outlined text-tertiary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                      <div>
                        <p className="text-[11px] text-on-surface-variant font-medium">Duration</p>
                        <p className="text-sm font-extrabold text-on-surface">{formatDurationLong(note.durationMs)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 border border-outline-variant/20">
                      <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>text_fields</span>
                      <div>
                        <p className="text-[11px] text-on-surface-variant font-medium">Words</p>
                        <p className="text-sm font-extrabold text-on-surface">{wordCount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 border border-outline-variant/20">
                      <span className={`material-symbols-outlined text-lg ${sentimentCfg.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{sentimentCfg.icon}</span>
                      <div>
                        <p className="text-[11px] text-on-surface-variant font-medium">Sentiment</p>
                        <p className="text-sm font-extrabold text-on-surface">{sentimentCfg.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/80 border border-outline-variant/20">
                      <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
                      <div>
                        <p className="text-[11px] text-on-surface-variant font-medium">Talk Pace</p>
                        <p className="text-sm font-extrabold text-on-surface">{talkPace} wpm</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* No AI data yet — generate CTA */}
              {!note.aiStatus && onGenerateInsights && (
                <div className="rounded-3xl border-2 border-dashed border-primary/20 bg-primary/3 p-10 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center mx-auto mb-5 shadow-lg">
                    <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  </div>
                  <h3 className="font-extrabold text-xl text-primary mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>Generate AI Summary & Insights</h3>
                  <p className="text-on-surface-variant text-sm mb-6 max-w-md mx-auto">Get an instant AI-powered summary, action items, key topics, and sentiment analysis for this note</p>
                  <button
                    onClick={() => onGenerateInsights(note.id, note.transcript)}
                    className="px-8 py-3.5 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                      Analyze with AI
                    </span>
                  </button>
                </div>
              )}

              {/* Tags */}
              {hasAI && note.insights?.tags && note.insights.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {note.insights.tags.map((tag) => (
                    <span key={tag} className="px-4 py-2 rounded-2xl bg-secondary-container/40 text-on-secondary-container text-sm font-semibold">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════ INSIGHTS TAB ═══════════ */}
          {activeTab === "insights" && (
            <div className="space-y-6 card-enter">
              {isPending && (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-3xl border border-outline-variant/20 p-6">
                      <Shimmer className="h-5 w-32 mb-4" />
                      <div className="space-y-2">
                        <Shimmer className="h-4 w-full" />
                        <Shimmer className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isFailed && (
                <div className="rounded-3xl border border-error/20 bg-error-container/10 p-8 text-center">
                  <span className="material-symbols-outlined text-error text-4xl mb-3">error</span>
                  <h3 className="font-bold text-error mb-2">Insights generation failed</h3>
                  {onGenerateInsights && (
                    <button
                      onClick={() => onGenerateInsights(note.id, note.transcript)}
                      className="mt-3 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}

              {!note.aiStatus && onGenerateInsights && (
                <div className="rounded-3xl border-2 border-dashed border-primary/20 bg-primary/3 p-10 text-center">
                  <span className="material-symbols-outlined text-primary/40 text-5xl mb-4">insights</span>
                  <h3 className="font-extrabold text-lg text-primary mb-2" style={{ fontFamily: "Manrope, sans-serif" }}>No Insights Yet</h3>
                  <p className="text-on-surface-variant text-sm mb-5">Generate AI insights to see action items, key topics, and sentiment</p>
                  <button
                    onClick={() => onGenerateInsights(note.id, note.transcript)}
                    className="px-6 py-3 rounded-2xl bg-primary text-on-primary font-bold text-sm shadow-lg"
                  >
                    Generate Insights
                  </button>
                </div>
              )}

              {hasAI && note.insights && (
                <>
                  {/* Action Items */}
                  <div className="rounded-3xl border border-outline-variant/20 bg-white p-6 shadow-ambient">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-2xl bg-tertiary-container/40 flex items-center justify-center">
                        <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>Action Items</h3>
                        <p className="text-xs text-on-surface-variant">{note.insights.actionItems.length} item{note.insights.actionItems.length !== 1 ? "s" : ""} detected</p>
                      </div>
                    </div>
                    {note.insights.actionItems.length > 0 ? (
                      <div className="space-y-3">
                        {note.insights.actionItems.map((item, i) => (
                          <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-low/50 hover:bg-surface-container-low transition-colors">
                            <div className="w-6 h-6 rounded-lg border-2 border-tertiary/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-tertiary">{i + 1}</span>
                            </div>
                            <p className="text-sm text-on-surface leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-surface-container-low/30 text-center">
                        <p className="text-sm text-on-surface-variant">No action items detected in this note</p>
                      </div>
                    )}
                  </div>

                  {/* Key Topics */}
                  <div className="rounded-3xl border border-outline-variant/20 bg-white p-6 shadow-ambient">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-2xl bg-primary-container/40 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>topic</span>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>Key Topics</h3>
                        <p className="text-xs text-on-surface-variant">Main themes discussed</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {note.insights.keyTopics.map((topic) => (
                        <span key={topic} className="px-4 py-2.5 rounded-2xl bg-primary-container/20 text-primary text-sm font-semibold border border-primary/10 hover:bg-primary-container/40 transition-colors">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sentiment Analysis */}
                  <div className="rounded-3xl border border-outline-variant/20 bg-white p-6 shadow-ambient">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-2xl bg-surface-container-high/40 flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>Sentiment Analysis</h3>
                        <p className="text-xs text-on-surface-variant">Overall tone of the note</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-4 p-5 rounded-2xl ${sentimentCfg.bg}`}>
                      <span className={`material-symbols-outlined text-4xl ${sentimentCfg.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{sentimentCfg.icon}</span>
                      <div>
                        <p className={`text-2xl font-extrabold ${sentimentCfg.color}`} style={{ fontFamily: "Manrope, sans-serif" }}>{sentimentCfg.label}</p>
                        <p className="text-sm text-on-surface-variant">
                          {sentimentKey === "positive" && "This note has an optimistic and constructive tone"}
                          {sentimentKey === "neutral" && "This note has a balanced and informational tone"}
                          {sentimentKey === "negative" && "This note contains concerns or challenges"}
                          {sentimentKey === "mixed" && "This note contains both positive and negative elements"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Note Analytics */}
                  <div className="rounded-3xl border border-outline-variant/20 bg-white p-6 shadow-ambient">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-2xl bg-secondary-container/40 flex items-center justify-center">
                        <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                      </div>
                      <h3 className="font-extrabold text-lg text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>Note Analytics</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: "text_fields", label: "Word Count", value: `${wordCount}`, color: "text-primary" },
                        { icon: "schedule", label: "Reading Time", value: `${readingTime} min`, color: "text-secondary" },
                        { icon: "speed", label: "Talk Pace", value: `${talkPace} wpm`, color: "text-tertiary" },
                        { icon: "mic", label: "Duration", value: formatDurationLong(note.durationMs), color: "text-on-surface-variant" },
                      ].map((stat) => (
                        <div key={stat.label} className="p-4 rounded-2xl bg-surface-container-low/50 text-center">
                          <span className={`material-symbols-outlined text-2xl ${stat.color} mb-1`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
                          <p className="text-xl font-extrabold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>{stat.value}</p>
                          <p className="text-xs text-on-surface-variant font-medium">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ═══════════ TRANSCRIPT TAB ═══════════ */}
          {activeTab === "transcript" && (
            <div className="space-y-6 card-enter">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-xl text-primary" style={{ fontFamily: "Manrope, sans-serif" }}>Full Transcription</h3>
                <button onClick={handleCopy} className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5 transition-colors">
                  <span className="material-symbols-outlined text-base">{copied ? "check_circle" : "content_copy"}</span>
                  {copied ? "Copied!" : "Copy Text"}
                </button>
              </div>

              <div className="rounded-3xl border border-outline-variant/20 bg-white p-6 shadow-ambient">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-extrabold text-lg" style={{ fontFamily: "Manrope, sans-serif" }}>S1</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-extrabold text-lg text-primary" style={{ fontFamily: "Manrope, sans-serif" }}>Speaker</span>
                      <span className="px-2 py-0.5 rounded-md bg-surface-container-high font-mono font-bold text-xs text-on-surface-variant">00:00</span>
                    </div>
                    <p className="text-lg leading-relaxed text-on-surface">{note.transcript}</p>
                  </div>
                </div>
              </div>

              {/* Recording Details */}
              <div className="rounded-3xl border border-outline-variant/20 bg-white p-6 shadow-ambient">
                <h4 className="font-extrabold text-lg text-primary mb-4" style={{ fontFamily: "Manrope, sans-serif" }}>Recording Details</h4>
                <div className="space-y-0">
                  {[
                    { label: "Duration", value: formatDurationLong(note.durationMs) },
                    { label: "Date", value: formatFullDate(note.createdAt) },
                    { label: "Time", value: formatTimeOfDay(note.createdAt) },
                    { label: "Format", value: "WebM Audio" },
                    { label: "Transcription", value: "Sarvam AI" },
                  ].map((item, i, arr) => (
                    <div key={item.label} className={`flex justify-between py-3 ${i < arr.length - 1 ? "border-b border-outline-variant/20" : ""}`}>
                      <span className="text-on-surface-variant text-sm font-medium">{item.label}</span>
                      <span className="font-extrabold text-on-surface text-sm">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button onClick={handleCopy} className="w-full p-4 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center gap-4 transition-colors">
                  <span className="material-symbols-outlined text-primary">content_copy</span>
                  <span className="font-medium text-on-surface text-sm">{copied ? "Copied!" : "Copy Transcript"}</span>
                </button>
                <button onClick={handleShare} className="w-full p-4 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center gap-4 transition-colors">
                  <span className="material-symbols-outlined text-primary">share</span>
                  <span className="font-medium text-on-surface text-sm">Share Note</span>
                </button>
                <button onClick={handleDelete} className={`w-full p-4 rounded-xl flex items-center gap-4 transition-colors ${confirmDelete ? "bg-error-container/40" : "bg-surface-container-low hover:bg-error-container/30"}`}>
                  <span className="material-symbols-outlined text-error">{confirmDelete ? "warning" : "delete"}</span>
                  <span className="font-medium text-sm text-error">{confirmDelete ? "Tap again to confirm" : "Delete Recording"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating Audio Player */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[92%] md:w-[600px] z-50">
        <div className="bg-white/95 backdrop-blur-2xl border border-outline-variant shadow-2xl rounded-[2rem] px-6 py-4">
          <div className="mb-3">
            <div className="relative h-1.5 bg-surface-container-highest rounded-full overflow-hidden cursor-pointer" onClick={seek}>
              <div className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs font-mono font-bold text-on-surface-variant">{formatTime(currentTime)}</span>
              <span className="text-xs font-mono font-bold text-on-surface-variant">{formatTime(totalDuration)}</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => skipBy(-10)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">replay_10</span>
            </button>
            <button onClick={goToPrev} disabled={!hasPrev} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container transition-colors disabled:opacity-30">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">skip_previous</span>
            </button>
            <button onClick={togglePlay} disabled={!ready} className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white shadow-xl active:scale-90 transition-all disabled:opacity-50">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{isPlaying ? "pause" : "play_arrow"}</span>
            </button>
            <button onClick={goToNext} disabled={!hasNext} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container transition-colors disabled:opacity-30">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">skip_next</span>
            </button>
            <button onClick={() => skipBy(10)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">forward_10</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
