"use client";

import { useState, useEffect, useCallback } from "react";
import type { Note, NoteMetadata } from "@/types";
import { saveAudio, deleteAudio } from "@/lib/db";
import { getAllMetadata, saveMetadata, deleteMetadata } from "@/lib/storage";

export function useNotes(userId: string) {
  const [notes, setNotes] = useState<NoteMetadata[]>([]);

  useEffect(() => {
    if (userId) {
      setNotes(getAllMetadata(userId));
    }
  }, [userId]);

  const createNote = useCallback(
    async (params: { blob: Blob; transcript: string; durationMs: number }): Promise<NoteMetadata> => {
      const id = crypto.randomUUID();
      const note: NoteMetadata = {
        id,
        transcript: params.transcript,
        createdAt: new Date().toISOString(),
        durationMs: params.durationMs,
      };

      await saveAudio(userId, id, params.blob);

      const updated = [note, ...notes];
      saveMetadata(updated, userId);
      setNotes(updated);

      return note;
    },
    [notes, userId]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      await deleteAudio(userId, id);
      deleteMetadata(id, userId);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    },
    [userId]
  );

  return { notes, createNote, deleteNote };
}

export type { Note };
