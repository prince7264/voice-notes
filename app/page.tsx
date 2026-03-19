"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { NoteMetadata, RecordState } from "@/types";
import { useNotes } from "@/hooks/useNotes";
import { saveAudio } from "@/lib/db";
import { saveMetadata } from "@/lib/storage";
import { RecordButton } from "@/components/RecordButton";
import { NoteCard } from "@/components/NoteCard";
import { EmptyState } from "@/components/EmptyState";

export default function Home() {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [search, setSearch] = useState("");
  const { notes, deleteNote } = useNotes(userId);
  const [localNotes, setLocalNotes] = useState<NoteMetadata[]>([]);
  const [initialized, setInitialized] = useState(false);

  if (!initialized && notes.length > 0) {
    setLocalNotes(notes);
    setInitialized(true);
  }

  const handleNoteCreated = useCallback(
    async (metadata: NoteMetadata, blob: Blob) => {
      await saveAudio(userId, metadata.id, blob);
      const updated = [metadata, ...localNotes];
      saveMetadata(updated, userId);
      setLocalNotes(updated);
    },
    [localNotes, userId]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteNote(id);
      setLocalNotes((prev) => prev.filter((n) => n.id !== id));
    },
    [deleteNote]
  );

  const displayed = search.trim()
    ? localNotes.filter((n) =>
        n.transcript.toLowerCase().includes(search.toLowerCase())
      )
    : localNotes;

  // Avatar: Google image or initials fallback
  const avatarUrl = session?.user?.image;
  const initials = session?.user?.name
    ? session.user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0A0A0B]/80 backdrop-blur-md border-b border-[#2A2A2E] px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-[#F5F5F7]">Voice Notes</h1>
            <p className="text-xs text-[#48484A]">
              {localNotes.length > 0
                ? `${localNotes.length} note${localNotes.length !== 1 ? "s" : ""}`
                : "Capture thoughts instantly"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            {localNotes.length > 0 && (
              <div className="relative">
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#48484A]"
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
                  className="bg-[#141416] border border-[#2A2A2E] rounded-xl pl-8 pr-3 py-2 text-sm text-[#F5F5F7] placeholder-[#48484A] focus:outline-none focus:border-[#6366F1] w-36 transition-colors"
                />
              </div>
            )}

            {/* Profile Avatar */}
            <Link href="/profile" className="flex-shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={session?.user?.name ?? "Profile"}
                  className="w-8 h-8 rounded-full border border-[#2A2A2E] hover:border-[#6366F1] transition-colors"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-xs font-bold hover:opacity-80 transition-opacity">
                  {initials}
                </div>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Notes list */}
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-44">
        <div className="max-w-2xl mx-auto">
          {displayed.length === 0 && search ? (
            <p className="text-center text-[#48484A] text-sm py-16">
              No notes match &ldquo;{search}&rdquo;
            </p>
          ) : displayed.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayed.map((note, i) => (
                <div key={note.id} className={i === 0 && !search ? "card-enter" : ""}>
                  <NoteCard note={note} userId={userId} onDelete={handleDelete} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Record Button — fixed bottom */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <RecordButton
          recordState={recordState}
          setRecordState={setRecordState}
          onNoteCreated={handleNoteCreated}
        />
      </div>
    </div>
  );
}
