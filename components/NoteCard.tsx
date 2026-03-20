"use client";

import { useState } from "react";
import type { NoteMetadata } from "@/types";
import { AudioPlayer } from "./AudioPlayer";

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDurationBadge(ms: number): string {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `0:${sec.toString().padStart(2, "0")}`;
}

interface NoteCardProps {
  note: NoteMetadata;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(note.transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLong = note.transcript.length > 200;

  return (
    <div className="bg-[#13141F] border border-[#252538] rounded-2xl p-4 flex flex-col gap-3 hover:border-[#353550] transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-[#8181A0]">
          <span>{formatDate(note.createdAt)}</span>
          <span className="text-[#252538]">·</span>
          <span>{formatTime(note.createdAt)}</span>
        </div>
        <span className="text-xs bg-[#18181F] text-[#4A4A65] border border-[#252538] rounded-full px-2 py-0.5 font-mono">
          {formatDurationBadge(note.durationMs)}
        </span>
      </div>

      {/* Transcript */}
      <div className="text-sm text-[#F1F1FA] leading-relaxed">
        <p className={!expanded && isLong ? "line-clamp-4" : ""}>
          {note.transcript}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-[#6366F1] mt-1 hover:underline"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {/* Audio Player */}
      <AudioPlayer audioUrl={note.audioUrl} durationMs={note.durationMs} />

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 pt-1 border-t border-[#18181F]">
        <button
          onClick={handleCopy}
          title="Copy transcript"
          className="p-1.5 rounded-lg hover:bg-[#18181F] text-[#4A4A65] hover:text-[#8181A0] transition-colors"
        >
          {copied ? (
            <svg className="w-4 h-4 text-[#6366F1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
        <button
          onClick={() => onDelete(note.id)}
          title="Delete note"
          className="p-1.5 rounded-lg hover:bg-[#EF4444]/10 text-[#4A4A65] hover:text-[#EF4444] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <polyline points="3 6 5 6 21 6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 6l-1 14H6L5 6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
