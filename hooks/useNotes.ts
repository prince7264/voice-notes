"use client";

import { useState, useEffect, useCallback } from "react";
import type { NoteMetadata } from "@/types";
import { saveNote, getNotes, deleteNote as deleteNoteFromDb } from "@/lib/firestore";
import { uploadAudio, deleteAudio } from "@/lib/firebaseStorage";

export function useNotes(userId: string) {
  const [notes, setNotes] = useState<NoteMetadata[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getNotes(userId)
      .then((data) => setNotes(data))
      .finally(() => setLoading(false));
  }, [userId]);

  const createNote = useCallback(
    async (params: {
      blob: Blob;
      transcript: string;
      durationMs: number;
    }): Promise<NoteMetadata> => {
      const id = crypto.randomUUID();
      const audioUrl = await uploadAudio(userId, id, params.blob);
      const note: NoteMetadata = {
        id,
        transcript: params.transcript,
        createdAt: new Date().toISOString(),
        durationMs: params.durationMs,
        audioUrl,
      };
      await saveNote(userId, note);
      setNotes((prev) => [note, ...prev]);
      return note;
    },
    [userId]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      await deleteAudio(userId, id);
      await deleteNoteFromDb(userId, id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    },
    [userId]
  );

  return { notes, loading, createNote, deleteNote };
}
