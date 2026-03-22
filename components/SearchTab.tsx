"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { NoteMetadata } from "@/types";
import { SideDrawer } from "./SideDrawer";
import { NoteDetail } from "./NoteDetail";

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

function highlightText(text: string, query: string): React.ReactNode[] {
  if (!query.trim()) return [text];
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-primary-container text-on-primary-container px-1 rounded-sm font-semibold">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

interface SearchTabProps {
  notes: NoteMetadata[];
  userId: string;
  onDelete: (id: string) => void;
  onSelectNote?: (note: NoteMetadata) => void;
  onGenerateInsights?: (noteId: string, transcript: string) => void;
}

export function SearchTab({ notes, userId, onDelete, onSelectNote, onGenerateInsights }: SearchTabProps) {
  const { user, profile } = useAuth();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState(0);
  const [visibleCount, setVisibleCount] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<NoteMetadata | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = profile?.name
    ? profile.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  // Close menu on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    }
    if (menuOpenId) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpenId]);

  // Filter: All Results = all matches, Transcripts = notes with transcripts > 20 chars, Voice Memos = short/empty transcripts
  const allResults = useMemo(() => {
    if (!query.trim()) return [];
    return notes.filter((n) =>
      n.transcript.toLowerCase().includes(query.toLowerCase())
    );
  }, [notes, query]);

  const results = useMemo(() => {
    if (activeFilter === 0) return allResults; // All Results
    if (activeFilter === 1) {
      // Transcripts — notes with meaningful transcripts (> 20 chars, no error)
      return allResults.filter((n) => n.transcript.length > 20 && !n.transcript.startsWith("[Transcription error"));
    }
    // Voice Memos — short or empty transcripts
    return allResults.filter((n) => n.transcript.length <= 20 || n.transcript.startsWith("[Transcription error"));
  }, [allResults, activeFilter]);

  const displayedResults = results.slice(0, visibleCount);
  const hasMore = results.length > visibleCount;

  const filters = [
    { label: "All Results", count: allResults.length },
    { label: "Transcripts", count: allResults.filter((n) => n.transcript.length > 20 && !n.transcript.startsWith("[Transcription error")).length },
    { label: "Voice Memos", count: allResults.filter((n) => n.transcript.length <= 20 || n.transcript.startsWith("[Transcription error")).length },
  ];

  const handleShare = async (note: NoteMetadata) => {
    const shareText = `Voice Note (${formatDuration(note.durationMs)}): ${note.transcript.slice(0, 200)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Bolkar Voice Note", text: shareText });
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareText);
    }
    setMenuOpenId(null);
  };

  const handleSelectNote = (note: NoteMetadata) => {
    setSelectedNote(note);
    onSelectNote?.(note);
  };

  if (selectedNote) {
    return (
      <NoteDetail
        note={selectedNote}
        userId={userId}
        allNotes={notes}
        onBack={() => setSelectedNote(null)}
        onDelete={(id) => { onDelete(id); setSelectedNote(null); }}
        onSelectNote={setSelectedNote}
        onGenerateInsights={onGenerateInsights}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface">
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-[0_12px_40px_rgba(25,28,29,0.04)]">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => setDrawerOpen(true)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-container/50 transition-colors">
              <span className="material-symbols-outlined text-on-surface">menu</span>
            </button>
            <span className="text-lg font-bold text-primary tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
              Bolkar
            </span>
          </div>
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
      </header>

      {/* Search Section */}
      <div className="px-6 pt-6 max-w-4xl mx-auto w-full">
        {/* Search input */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-on-surface-variant text-2xl">search</span>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setVisibleCount(10); setActiveFilter(0); }}
            autoFocus
            placeholder="Search your notes…"
            className="w-full h-16 pl-14 pr-12 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl text-on-surface font-semibold text-xl focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all placeholder:text-on-surface-variant/50 outline-none"
            style={{ fontFamily: "Manrope, sans-serif" }}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setVisibleCount(10); }}
              className="absolute inset-y-0 right-4 flex items-center"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-xl hover:text-on-surface transition-colors">close</span>
            </button>
          )}
        </div>

        {/* Quick Filters — FUNCTIONAL */}
        {query.trim() && allResults.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {filters.map((f, i) => (
              <button
                key={f.label}
                onClick={() => { setActiveFilter(i); setVisibleCount(10); }}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all active:scale-95 ${
                  activeFilter === i
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/30"
                }`}
              >
                {f.label} {f.count > 0 ? `(${f.count})` : ""}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
        <div className="max-w-4xl mx-auto w-full">
          {!query.trim() ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-20 h-20 rounded-3xl bg-surface-container-low flex items-center justify-center">
                <span className="material-symbols-outlined text-outline-variant text-4xl">manage_search</span>
              </div>
              <div>
                <p className="font-bold text-lg text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>Search your notes</p>
                <p className="text-sm text-on-surface-variant mt-1">Type to find transcripts and recordings</p>
              </div>
              {/* Recent notes suggestion */}
              {notes.length > 0 && (
                <div className="mt-6 w-full max-w-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-3">Recent Notes</p>
                  <div className="space-y-2">
                    {notes.slice(0, 3).map((note) => (
                      <button
                        key={note.id}
                        onClick={() => handleSelectNote(note)}
                        className="w-full text-left p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
                      >
                        <p className="text-sm text-on-surface line-clamp-1">{note.transcript || "Voice memo"}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{formatRelativeDate(note.createdAt)} · {formatDuration(note.durationMs)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-20 h-20 rounded-3xl bg-surface-container-low flex items-center justify-center">
                <span className="material-symbols-outlined text-outline-variant text-4xl">search_off</span>
              </div>
              <div>
                <p className="font-bold text-lg text-on-surface" style={{ fontFamily: "Manrope, sans-serif" }}>
                  {activeFilter === 0 ? "No results found" : `No ${filters[activeFilter].label.toLowerCase()} found`}
                </p>
                <p className="text-sm text-on-surface-variant mt-1">
                  {activeFilter === 0 ? "Try a different search term" : "Try switching to \"All Results\""}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-on-surface-variant mb-5 px-1">
                {results.length} {results.length === 1 ? "result" : "results"} found
              </p>
              <div className="space-y-4">
                {displayedResults.map((note) => (
                  <article
                    key={note.id}
                    onClick={() => handleSelectNote(note)}
                    className="bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/20 rounded-3xl p-6 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer group relative"
                  >
                    {/* Active indicator dot */}
                    <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-tertiary shadow-[0_0_10px_rgba(0,106,96,0.3)] m-4" />

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-tertiary-container flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-on-tertiary-fixed-variant text-lg">mic</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-on-surface group-hover:text-primary transition-colors" style={{ fontFamily: "Manrope, sans-serif" }}>
                            Voice Note
                          </h4>
                          <p className="text-xs text-on-surface-variant">
                            {formatRelativeDate(note.createdAt)} · {formatDuration(note.durationMs)}
                          </p>
                        </div>
                      </div>
                      {/* More options — FUNCTIONAL dropdown */}
                      <div className="relative" ref={menuOpenId === note.id ? menuRef : undefined}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === note.id ? null : note.id); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container transition-colors"
                        >
                          <span className="material-symbols-outlined text-on-surface-variant text-lg">more_vert</span>
                        </button>
                        {menuOpenId === note.id && (
                          <div className="absolute right-0 top-10 w-44 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/20 py-2 z-50 scale-in" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleShare(note)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors text-left"
                            >
                              <span className="material-symbols-outlined text-base">share</span>
                              Share
                            </button>
                            <button
                              onClick={async () => {
                                await navigator.clipboard.writeText(note.transcript);
                                setMenuOpenId(null);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container transition-colors text-left"
                            >
                              <span className="material-symbols-outlined text-base">content_copy</span>
                              Copy Transcript
                            </button>
                            <div className="h-px bg-outline-variant/20 mx-3 my-1" />
                            <button
                              onClick={() => { onDelete(note.id); setMenuOpenId(null); }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-container/20 transition-colors text-left"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Transcript with highlighted search terms */}
                    <p className="text-on-surface-variant leading-relaxed line-clamp-2 mb-3">
                      {highlightText(note.transcript, query)}
                    </p>

                    {/* Audio waveform indicator */}
                    <div className="flex items-end gap-1 h-8 mb-3">
                      {[2, 4, 6, 8, 5, 7, 3, 6, 4, 2].map((h, j) => (
                        <div
                          key={j}
                          className="w-1 rounded-full"
                          style={{
                            height: `${h * 3}px`,
                            backgroundColor: `rgba(0, 106, 98, ${0.2 + j * 0.06})`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2">
                      <span className="px-3 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container text-[10px] font-bold uppercase tracking-wider">
                        Voice Memo
                      </span>
                      <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                        {formatDuration(note.durationMs)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination / Load More */}
              {hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setVisibleCount((v) => v + 10)}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 text-primary font-bold hover:bg-surface-container active:scale-95 transition-all"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    Show More
                    <span className="material-symbols-outlined text-lg">expand_more</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
