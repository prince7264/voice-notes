"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { NoteMetadata } from "@/types";
import { NoteCard } from "./NoteCard";
import { NoteDetail } from "./NoteDetail";
import { EmptyState } from "./EmptyState";
import { AudioPlayer } from "./AudioPlayer";

const CATEGORIES = ["All", "Work", "Personal", "Ideas", "Meetings"];

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec}s`;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

interface HomeTabProps {
  notes: NoteMetadata[];
  loading: boolean;
  userId: string;
  onDelete: (id: string) => void;
  onGoToRecord?: () => void;
}

export function HomeTab({ notes, loading, userId, onDelete, onGoToRecord }: HomeTabProps) {
  const { user, profile } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedNote, setSelectedNote] = useState<NoteMetadata | null>(null);

  const firstName = profile?.name?.split(" ")[0] ?? "";
  const initials = profile?.name
    ? profile.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const displayed = notes;

  // If a note is selected, show the detail view
  if (selectedNote) {
    return (
      <NoteDetail
        note={selectedNote}
        userId={userId}
        onBack={() => setSelectedNote(null)}
        onDelete={onDelete}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* TopAppBar — frosted glass */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(25,28,29,0.06)]">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container/50 transition-colors">
              <span className="material-symbols-outlined text-on-surface">menu</span>
            </button>
            <h1 className="text-xl font-extrabold text-primary tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
              Bolkar
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container/50 transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">share</span>
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high border border-outline-variant">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary text-on-primary font-bold text-xs">
                  {initials}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        <div className="px-6 max-w-5xl mx-auto">
          {/* Editorial Header */}
          <section className="mt-8 mb-8">
            <h2
              className="text-[3.5rem] font-extrabold leading-tight text-primary tracking-tighter mb-1.5"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              My Feed
            </h2>
            <p className="text-on-surface-variant font-medium tracking-wide text-sm">
              {greeting}{firstName ? `, ${firstName}` : ""}. Your captured thoughts.
            </p>
          </section>

          {/* Category Filter Tags */}
          <section className="flex gap-2.5 mb-8 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-semibold tracking-wide whitespace-nowrap transition-all active:scale-95 ${
                  activeCategory === cat
                    ? "bg-primary text-on-primary shadow-md"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {cat}
              </button>
            ))}
          </section>

          {/* Notes feed — Bento Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-on-surface-variant">Loading your notes…</p>
            </div>
          ) : displayed.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-6 gap-4 md:gap-6">
              {displayed.map((note, i) => {
                // First note = featured (4 cols), second = small (2 cols),
                // then alternate 3-col medium cards, with occasional full-width
                const isFeatured = i === 0;
                const isSmall = i === 1;
                const isFullWidth = i > 1 && (i - 2) % 5 === 4;
                const isMedium = !isFeatured && !isSmall && !isFullWidth;
                const colSpan = isFeatured
                  ? "col-span-6 md:col-span-4"
                  : isSmall
                  ? "col-span-6 md:col-span-2"
                  : isFullWidth
                  ? "col-span-6"
                  : "col-span-6 md:col-span-3";

                if (isFeatured) {
                  return (
                    <article
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className={`${colSpan} bg-surface-container-lowest rounded-xl p-8 shadow-ambient hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group card-enter`}
                    >
                      <span className="inline-block px-4 py-1 rounded-full bg-tertiary-container text-on-tertiary-fixed text-xs font-bold uppercase tracking-wider mb-4">
                        Latest
                      </span>
                      <h3 className="text-2xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors" style={{ fontFamily: "Manrope, sans-serif" }}>
                        {note.transcript.slice(0, 80)}{note.transcript.length > 80 ? "…" : ""}
                      </h3>
                      <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-3 mb-4">
                        {note.transcript}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                        </div>
                        <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden">
                          <div className="h-full bg-primary/30 rounded-full" style={{ width: "0%" }} />
                        </div>
                        <span className="text-xs font-mono font-bold text-on-surface-variant">{formatDuration(note.durationMs)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-on-surface-variant font-medium">{formatRelativeDate(note.createdAt)}</span>
                      </div>
                    </article>
                  );
                }

                if (isSmall) {
                  return (
                    <article
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className={`${colSpan} bg-surface-container-low rounded-xl p-6 hover:bg-surface-container hover:-translate-y-1 transition-all duration-300 cursor-pointer group`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-secondary-container text-sm">mic</span>
                        </div>
                        <span className="text-xs font-bold text-on-surface-variant">{formatDuration(note.durationMs)}</span>
                      </div>
                      <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-4">
                        {note.transcript}
                      </p>
                      <span className="block text-xs text-on-surface-variant/70 mt-3">{formatRelativeDate(note.createdAt)}</span>
                    </article>
                  );
                }

                // Medium or full-width cards
                return (
                  <article
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className={`${colSpan} bg-surface-container-lowest rounded-xl p-6 shadow-ambient hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-tertiary-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-tertiary-container text-lg">mic</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors" style={{ fontFamily: "Manrope, sans-serif" }}>
                            {formatRelativeDate(note.createdAt)}
                          </p>
                          <p className="text-xs text-on-surface-variant">{formatDuration(note.durationMs)} recording</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-primary bg-surface-container-low px-2.5 py-1 rounded-lg">
                        {formatDuration(note.durationMs)}
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-3 mb-3">
                      {note.transcript}
                    </p>
                    {/* Mini inline audio player */}
                    <div className="bg-surface-container-low rounded-xl px-3 py-2.5">
                      <AudioPlayer userId={userId} noteId={note.id} durationMs={note.durationMs} />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      {onGoToRecord && (
        <button
          onClick={onGoToRecord}
          className="fixed bottom-28 right-6 w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center active:scale-90 transition-all duration-300 z-40 hover:shadow-2xl"
        >
          <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            add
          </span>
        </button>
      )}
    </div>
  );
}
