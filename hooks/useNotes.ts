"use client";

import { useState, useEffect, useCallback } from "react";
import type { NoteMetadata } from "@/types";
import { saveNote, getNotes, deleteNote as deleteNoteFromDb, updateNoteFields } from "@/lib/firestore";
import { saveAudio, deleteAudio } from "@/lib/db";

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
      await saveAudio(userId, id, params.blob);
      const note: NoteMetadata = {
        id,
        transcript: params.transcript,
        createdAt: new Date().toISOString(),
        durationMs: params.durationMs,
        aiStatus: "pending",
      };
      await saveNote(userId, note);
      setNotes((prev) => [note, ...prev]);

      // Fire-and-forget AI insights generation
      generateAIInsights(id, params.transcript);

      return note;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId]
  );

  const generateAIInsights = useCallback(
    async (noteId: string, transcript: string) => {
      // Set pending status locally
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, aiStatus: "pending" as const } : n))
      );

      try {
        const res = await fetch("/api/ai-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript }),
        });

        if (!res.ok) throw new Error("API failed");

        const data = await res.json();

        if (data.error) throw new Error(data.error);

        const fields: Partial<NoteMetadata> = {
          summary: data.summary,
          insights: data.insights,
          aiStatus: "completed",
        };

        // Update Firestore
        await updateNoteFields(userId, noteId, fields);

        // Update local state
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? { ...n, ...fields } : n))
        );
      } catch (error) {
        console.error("AI insights generation failed:", error);

        const fields: Partial<NoteMetadata> = { aiStatus: "failed" };
        try {
          await updateNoteFields(userId, noteId, fields);
        } catch {}

        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? { ...n, aiStatus: "failed" as const } : n))
        );
      }
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

  return { notes, loading, createNote, deleteNote, generateAIInsights };
}
