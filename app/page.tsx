"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotes } from "@/hooks/useNotes";
import type { NoteMetadata } from "@/types";
import { TabBar, type TabName } from "@/components/TabBar";
import { HomeTab } from "@/components/HomeTab";
import { RecordTab } from "@/components/RecordTab";
import { ProfileTab } from "@/components/ProfileTab";

export default function Home() {
  const { user } = useAuth();
  const userId = user?.uid ?? "";
  const { notes, loading, createNote, deleteNote } = useNotes(userId);
  const [activeTab, setActiveTab] = useState<TabName>("home");

  const handleNoteCreated = useCallback(
    async (metadata: NoteMetadata, blob: Blob) => {
      await createNote({
        blob,
        transcript: metadata.transcript,
        durationMs: metadata.durationMs,
      });
      setActiveTab("home");
    },
    [createNote]
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#09090F] flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className={activeTab === "home" ? "block h-full" : "hidden"}>
          <HomeTab notes={notes} loading={loading} onDelete={deleteNote} />
        </div>
        <div
          className={activeTab === "record" ? "flex items-center justify-center" : "hidden"}
          style={{ height: "100dvh" }}
        >
          <RecordTab onNoteCreated={handleNoteCreated} />
        </div>
        <div className={activeTab === "profile" ? "block h-full" : "hidden"}>
          <ProfileTab />
        </div>
      </div>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
