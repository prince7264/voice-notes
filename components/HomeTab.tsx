"use client";

import { useState } from "react";
import type { NoteMetadata } from "@/types";
import { NoteCard } from "./NoteCard";
import { EmptyState } from "./EmptyState";

interface HomeTabProps {
  notes: NoteMetadata[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export function HomeTab({ notes, loading, onDelete }: HomeTabProps) {
  const [search, setSearch] = useState("");

  const displayed = search.trim()
    ? notes.filter((n) =>
        n.transcript.toLowerCase().includes(search.toLowerCase())
      )
    : notes;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#09090F]/90 backdrop-blur-md border-b border-[#252538] px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-[#F1F1FA] tracking-tight">Voice Notes</h1>
            <p className="text-xs text-[#4A4A65] mt-0.5">
              {loading
                ? "Loading…"
                : notes.length > 0
                ? `${notes.length} note${notes.length !== 1 ? "s" : ""}`
                : "Capture thoughts instantly"}
            </p>
          </div>

          {/* Search */}
          {notes.length > 0 && (
            <div className="relative">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4A4A65]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#13141F] border border-[#252538] rounded-xl pl-8 pr-3 py-2 text-xs text-[#F1F1FA] placeholder-[#4A4A65] focus:outline-none focus:border-[#6366F1] w-32 transition-colors"
              />
            </div>
          )}
        </div>
      </header>

      {/* Notes List */}
      <main className="flex-1 overflow-y-auto px-4 py-5 pb-28">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-7 h-7 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayed.length === 0 && search ? (
            <p className="text-center text-[#4A4A65] text-sm py-16">
              No notes match &ldquo;{search}&rdquo;
            </p>
          ) : displayed.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayed.map((note, i) => (
                <div key={note.id} className={i === 0 && !search ? "card-enter" : ""}>
                  <NoteCard note={note} onDelete={onDelete} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
