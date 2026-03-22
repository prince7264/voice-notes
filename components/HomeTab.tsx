"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { NoteMetadata } from "@/types";
import { NoteCard } from "./NoteCard";
import { NoteDetail } from "./NoteDetail";
import { EmptyState } from "./EmptyState";
import { AudioPlayer } from "./AudioPlayer";
import { SideDrawer } from "./SideDrawer";

const CATEGORIES = ["All", "Work", "Personal", "Ideas", "Meetings"];

function categorizeNote(transcript: string): string {
  const t = transcript.toLowerCase();
  const workWords = ["meeting", "project", "deadline", "client", "team", "office", "report", "task", "agenda", "sprint", "standup", "review", "manager", "boss", "colleague", "email", "presentation", "schedule", "deliverable", "stakeholder"];
  const ideaWords = ["idea", "think", "maybe", "concept", "brainstorm", "what if", "imagine", "innovation", "creative", "inspiration", "explore", "possibility"];
  const meetingWords = ["meeting", "call", "discussion", "agenda", "minutes", "attendees", "conference", "sync", "standup", "retrospective"];
  const personalWords = ["grocery", "buy", "shopping", "family", "home", "dinner", "birthday", "vacation", "weekend", "exercise", "gym", "doctor", "appointment", "personal", "remember"];
  const meetingScore = meetingWords.filter((w) => t.includes(w)).length;
  const workScore = workWords.filter((w) => t.includes(w)).length;
  const ideaScore = ideaWords.filter((w) => t.includes(w)).length;
  const personalScore = personalWords.filter((w) => t.includes(w)).length;
  if (meetingScore >= 2) return "Meetings";
  if (workScore > ideaScore && workScore > personalScore && workScore >= 1) return "Work";
  if (ideaScore > personalScore && ideaScore >= 1) return "Ideas";
  if (personalScore >= 1) return "Personal";
  if (workScore >= 1) return "Work";
  return "Personal";
}

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
  onGenerateInsights?: (noteId: string, transcript: string) => void;
}

export function HomeTab({ notes, loading, userId, onDelete, onGoToRecord, onGenerateInsights }: HomeTabProps) {
  const { user, profile } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedNote, setSelectedNote] = useState<NoteMetadata | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  // Auto-categorize and filter notes
  const categorizedNotes = useMemo(() => {
    return notes.map((n) => ({
      ...n,
      category: n.category || categorizeNote(n.transcript),
    }));
  }, [notes]);

  const displayed = useMemo(() => {
    if (activeCategory === "All") return categorizedNotes;
    return categorizedNotes.filter((n) => n.category === activeCategory);
  }, [categorizedNotes, activeCategory]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Bolkar Notes", text: "Check out Bolkar Notes — voice notes, instantly transcribed!", url: window.location.href });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  if (selectedNote) {
    return (
      <NoteDetail
        note={selectedNote}
        userId={userId}
        allNotes={categorizedNotes}
        onBack={() => setSelectedNote(null)}
        onDelete={onDelete}
        onSelectNote={setSelectedNote}
        onGenerateInsights={onGenerateInsights}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* TopAppBar */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(25,28,29,0.06)]">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => setDrawerOpen(true)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container/50 transition-colors">
              <span className="material-symbols-outlined text-on-surface">menu</span>
            </button>
            <h1 className="text-xl font-extrabold text-primary tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
              Bolkar
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container/50 transition-colors">
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

      <main className="flex-1 overflow-y-auto pb-32 no-scrollbar">
        <div className="px-6 max-w-5xl mx-auto">
          <section className="mt-8 mb-8">
            <h2 className="text-[3.5rem] font-extrabold leading-tight text-primary tracking-tighter mb-1.5" style={{ fontFamily: "Manrope, sans-serif" }}>
              My Feed
            </h2>
            <p className="text-on-surface-variant font-medium tracking-wide text-sm">
              {greeting}{firstName ? `, ${firstName}` : ""}. Your captured thoughts.
            </p>
          </section>

          {/* Category Filter Tags — NOW FUNCTIONAL */}
          <section className="flex gap-2.5 mb-8 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const count = cat === "All" ? notes.length : categorizedNotes.filter((n) => n.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold tracking-wide whitespace-nowrap transition-all active:scale-95 ${
                    activeCategory === cat
                      ? "bg-primary text-on-primary shadow-md"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {cat}{count > 0 ? ` (${count})` : ""}
                </button>
              );
            })}
          </section>

          {/* Notes feed — Bento Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-on-surface-variant">Loading your notes…</p>
            </div>
          ) : displayed.length === 0 ? (
            activeCategory !== "All" ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <span className="material-symbols-outlined text-outline-variant text-5xl">filter_list_off</span>
                <p className="font-semibold text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>No {activeCategory.toLowerCase()} notes</p>
                <p className="text-sm text-on-surface-variant">Try a different category or record a new note</p>
              </div>
            ) : (
              <EmptyState />
            )
          ) : (
            <div className="grid grid-cols-6 gap-4 md:gap-6">
              {displayed.map((note, i) => {
                const isFeatured = i === 0;
                const isSmall = i === 1;
                const isFullWidth = i > 1 && (i - 2) % 5 === 4;
                const colSpan = isFeatured
                  ? "col-span-6 md:col-span-4"
                  : isSmall
                  ? "col-span-6 md:col-span-2"
                  : isFullWidth
                  ? "col-span-6"
                  : "col-span-6 md:col-span-3";

                if (isFeatured) {
                  return (
                    <article key={note.id} onClick={() => setSelectedNote(note)}
                      className={`${colSpan} bg-surface-container-lowest rounded-xl p-8 shadow-ambient hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group card-enter`}>
                      <div className="flex gap-2 mb-4">
                        <span className="inline-block px-4 py-1 rounded-full bg-tertiary-container text-on-tertiary-fixed text-xs font-bold uppercase tracking-wider">Latest</span>
                        {note.category && <span className="inline-block px-3 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container text-xs font-bold uppercase tracking-wider">{note.category}</span>}
                      </div>
                      <h3 className="text-2xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors" style={{ fontFamily: "Manrope, sans-serif" }}>
                        {note.transcript.slice(0, 80)}{note.transcript.length > 80 ? "…" : ""}
                      </h3>
                      {note.summary ? (
                        <div className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/10">
                          <span className="material-symbols-outlined text-primary text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                          <p className="text-sm text-primary/80 leading-relaxed line-clamp-2 italic">{note.summary}</p>
                        </div>
                      ) : (
                        <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-3 mb-4">{note.transcript}</p>
                      )}
                      <div className="bg-surface-container-low rounded-xl px-3 py-2.5">
                        <AudioPlayer userId={userId} noteId={note.id} durationMs={note.durationMs} />
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-on-surface-variant font-medium">{formatRelativeDate(note.createdAt)}</span>
                      </div>
                    </article>
                  );
                }

                if (isSmall) {
                  return (
                    <article key={note.id} onClick={() => setSelectedNote(note)}
                      className={`${colSpan} bg-surface-container-low rounded-xl p-6 hover:bg-surface-container hover:-translate-y-1 transition-all duration-300 cursor-pointer group`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-secondary-container text-sm">mic</span>
                        </div>
                        <span className="text-xs font-bold text-on-surface-variant">{formatDuration(note.durationMs)}</span>
                        {note.category && <span className="text-[10px] font-bold uppercase text-on-surface-variant/60">{note.category}</span>}
                      </div>
                      <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-4">{note.transcript}</p>
                      <span className="block text-xs text-on-surface-variant/70 mt-3">{formatRelativeDate(note.createdAt)}</span>
                    </article>
                  );
                }

                return (
                  <article key={note.id} onClick={() => setSelectedNote(note)}
                    className={`${colSpan} bg-surface-container-lowest rounded-xl p-6 shadow-ambient hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-tertiary-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-tertiary-container text-lg">mic</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors" style={{ fontFamily: "Manrope, sans-serif" }}>
                            {formatRelativeDate(note.createdAt)}
                          </p>
                          <p className="text-xs text-on-surface-variant">{formatDuration(note.durationMs)} · {note.category || "Note"}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-primary bg-surface-container-low px-2.5 py-1 rounded-lg">
                        {formatDuration(note.durationMs)}
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-3 mb-3">{note.transcript}</p>
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

      {onGoToRecord && (
        <button onClick={onGoToRecord}
          className="fixed bottom-28 right-6 w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center active:scale-90 transition-all duration-300 z-40 hover:shadow-2xl">
          <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
        </button>
      )}
    </div>
  );
}
