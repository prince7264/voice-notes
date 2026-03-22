"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotes } from "@/hooks/useNotes";
import type { NoteMetadata } from "@/types";
import { TabBar, type TabName } from "@/components/TabBar";
import { HomeTab } from "@/components/HomeTab";
import { RecordTab } from "@/components/RecordTab";
import { SearchTab } from "@/components/SearchTab";
import { ProfileTab } from "@/components/ProfileTab";

export default function Home() {
  const { user } = useAuth();
  const userId = user?.uid ?? "";
  const { notes, loading, createNote, deleteNote, generateAIInsights } = useNotes(userId);
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
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex-1 overflow-hidden">
        <div className={activeTab === "home" ? "block h-full" : "hidden"}>
          <HomeTab
            notes={notes}
            loading={loading}
            userId={userId}
            onDelete={deleteNote}
            onGoToRecord={() => setActiveTab("record")}
            onGenerateInsights={generateAIInsights}
          />
        </div>
        <div
          className={activeTab === "record" ? "block" : "hidden"}
          style={{ minHeight: "100dvh" }}
        >
          <RecordTab
            onNoteCreated={handleNoteCreated}
            onClose={() => setActiveTab("home")}
          />
        </div>
        <div className={activeTab === "search" ? "block h-full" : "hidden"}>
          <SearchTab notes={notes} userId={userId} onDelete={deleteNote} onGenerateInsights={generateAIInsights} />
        </div>
        <div className={activeTab === "settings" ? "block h-full" : "hidden"}>
          <ProfileTab />
        </div>
      </div>
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
