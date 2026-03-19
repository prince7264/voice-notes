"use client";

import { useState, useEffect, useCallback } from "react";
import type { Note, NoteMetadata } from "@/types";
import { saveAudio, deleteAudio } from "@/lib/db";
import { getAllMetadata, saveMetadata, deleteMetadata } from "@/lib/storage";

export function useNotes() {
  const [notes, setNotes] = useState<NoteMetadata[]>([]);

  useEffect(() => {
    setNotes(getAllMetadata());
  }, []);

  const createNote = useCallback(
    async (params: { blob: Blob; transcript: string; durationMs: number }): Promise<NoteMetadata> => {
      const id = crypto.randomUUID();
      const note: NoteMetadata = {
        id,
        transcript: params.transcript,
        createdAt: new Date().toISOString(),
        durationMs: params.durationMs,
      };

      await saveAudio(id, params.blob);

      const updated = [note, ...notes];
      saveMetadata(updated);
      setNotes(updated);

      return note;
    },
    [notes]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      await deleteAudio(id);
      deleteMetadata(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    },
    []
  );

  return { notes, createNote, deleteNote };
}

export type { Note };
